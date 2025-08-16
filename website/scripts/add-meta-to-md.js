#!/usr/bin/env node

/**
 * 使用大模型API为Flowable文档自动生成并添加keywords和description
 * 
 * 用法:
 *   node add-meta-to-md.js [folder|file]
 * 
 * 示例:
 *   node add-meta-to-md.js bpmn    # 处理BPMN文档
 *   node add-meta-to-md.js cmmn    # 处理CMMN文档
 *   node add-meta-to-md.js dmn     # 处理DMN文档
 *   node add-meta-to-md.js eventregistry  # 处理事件注册表文档
 *   node add-meta-to-md.js blog    # 处理博客文章
 *   node add-meta-to-md.js zh/docs/disclaimer.md  # 处理单个文档（相对路径）
 *   node add-meta-to-md.js /abs/path/to/file.md   # 处理单个文档（绝对路径）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://api.selenium39.me/v1/chat/completions';
const API_KEY = 'sk-1iPwWZB4JRlEA7imJQvtC0yIHDr3vSplEkWaScrI3onhpWU9';

// 解析参数：支持传入文档类型或单个MD文件路径
const inputArg = process.argv[2];

function resolveInputPath(arg) {
  if (!arg) return '';
  if (path.isAbsolute(arg)) return arg;
  const zhRoot = path.join(__dirname, '../..');
  const repoRoot = path.join(__dirname, '../../..');
  const candidates = [
    path.join(zhRoot, arg),
    path.join(repoRoot, arg),
    path.resolve(process.cwd(), arg)
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch (_) {}
  }
  return path.join(zhRoot, arg);
}

// 不进行类型自动识别；单文件模式统一按通用文档处理

let singleFile = false;
let singleFilePath = '';
let docType = 'bpmn';

if (inputArg) {
  const candidatePath = resolveInputPath(inputArg);
  try {
    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile() && candidatePath.endsWith('.md')) {
      singleFile = true;
      singleFilePath = candidatePath;
      // 不进行类型识别，单文件模式下忽略类型
    } else {
      // 目录批量模式下，参数视为文档类别
      docType = inputArg;
    }
  } catch (_) {
    docType = inputArg;
  }
}

// 根据类型选择根目录（docs 或 blog）（仅批量模式使用）
const isBlog = !singleFile && docType === 'blog';
const ROOT_DIR = !singleFile
  ? path.join(__dirname, '../..', isBlog ? 'website/blog' : path.join('docs', docType))
  : null;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function extractTitle(content) {
  const titleMatch = content.match(/^title:\s*(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : '';
}

function extractContent(content) {
  // 移除front matter，只保留正文内容用于分析
  const frontMatterEnd = content.indexOf('---', 4);
  if (frontMatterEnd === -1) return content;
  return content.slice(frontMatterEnd + 3).trim();
}

function hasMetaFields(content) {
  return content.includes('description:') && content.includes('keywords:');
}

function callLLMAPI(messages) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: "DeepSeek-V3-0324",
      messages: messages,
      temperature: 0.7
    });

    const options = {
      hostname: 'api.selenium39.me',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.choices && response.choices[0] && response.choices[0].message) {
            resolve(response.choices[0].message.content);
          } else {
            reject(new Error('Invalid API response format'));
          }
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`API request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

async function generateMeta(title, content) {
  // 统一使用通用提示词，不再区分类型
  const currentType = '文档';
  const prompt = `请为以下Flowable ${currentType}生成SEO优化的description和keywords。\n\n文档标题: ${title}\n\n文档内容摘要: ${content.slice(0, 2000)}...\n\n请按照以下格式返回：\ndescription: [一句话描述，不超过150字，突出文档的核心内容和用途]\nkeywords: [5-8个关键词，用逗号分隔，包含Flowable等核心词汇]\n\n要求：\n1. description要简洁明了，突出实用价值\n2. keywords要包含技术关键词和功能关键词\n3. 都要用中文\n4. 只返回上述格式，不要其他内容`;

  try {
    const response = await callLLMAPI([
      { role: "user", content: prompt }
    ]);
    
    // 解析返回的内容
    const descMatch = response.match(/description:\s*(.+)/);
    const keywordsMatch = response.match(/keywords:\s*(.+)/);
    
    if (!descMatch || !keywordsMatch) {
      throw new Error('Failed to parse LLM response format');
    }
    
    return {
      description: descMatch[1].trim(),
      keywords: keywordsMatch[1].trim()
    };
  } catch (error) {
    log(`❌ LLM API call failed: ${error.message}`);
    throw error;
  }
}

function updateFrontMatter(content, meta) {
  const lines = content.split('\n');
  const frontMatterStart = lines.findIndex(line => line.trim() === '---');
  const frontMatterEnd = lines.findIndex((line, index) => index > frontMatterStart && line.trim() === '---');
  
  if (frontMatterStart === -1 || frontMatterEnd === -1) {
    throw new Error('Invalid front matter format');
  }
  
  // 在title后面插入description和keywords
  const frontMatterLines = lines.slice(frontMatterStart + 1, frontMatterEnd);
  const titleIndex = frontMatterLines.findIndex(line => line.startsWith('title:'));
  
  if (titleIndex === -1) {
    throw new Error('Title not found in front matter');
  }
  
  // 插入新字段
  frontMatterLines.splice(titleIndex + 1, 0, 
    `description: ${meta.description}`,
    `keywords: ${meta.keywords}`
  );
  
  // 重新组装内容
  const newLines = [
    ...lines.slice(0, frontMatterStart + 1),
    ...frontMatterLines,
    ...lines.slice(frontMatterEnd)
  ];
  
  return newLines.join('\n');
}

async function processFile(filePath) {
  const fileName = path.basename(filePath);
  log(`📝 Processing ${fileName}...`);
  
  try {
    const content = readFile(filePath);
    
    // 检查是否已经有meta字段
    if (hasMetaFields(content)) {
      log(`⏭️  ${fileName} already has meta fields, skipping`);
      return;
    }
    
    const title = extractTitle(content);
    const mainContent = extractContent(content);
    
    if (!title || !mainContent) {
      log(`⚠️  ${fileName} missing title or content, skipping`);
      return;
    }
    
    log(`🤖 Generating meta for ${fileName}...`);
    const meta = await generateMeta(title, mainContent);
    
    log(`✅ Generated meta for ${fileName}:`);
    log(`   Description: ${meta.description}`);
    log(`   Keywords: ${meta.keywords}`);
    
    const updatedContent = updateFrontMatter(content, meta);
    writeFile(filePath, updatedContent);
    
    log(`💾 Updated ${fileName}`);
    
    // 添加延迟避免API限流
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    log(`❌ Failed to process ${fileName}: ${error.message}`);
  }
}

async function main() {
  try {
    if (singleFile) {
      log(`🚀 Single-file mode. Target: ${singleFilePath}`);
      await processFile(singleFilePath);
      log('🎉 Single file processed successfully!');
      return;
    }

    log(`🚀 Starting to add meta fields to ${docType.toUpperCase()} ${isBlog ? 'BLOG ' : ''}documents...`);

    if (!fs.existsSync(ROOT_DIR)) {
      throw new Error(`Directory not found: ${ROOT_DIR}`);
    }

    const files = fs.readdirSync(ROOT_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(ROOT_DIR, file))
      .sort();

    log(`📁 Found ${files.length} markdown files in ${isBlog ? 'blog' : docType + '/'} directory`);

    if (files.length === 0) {
      log('⚠️  No markdown files found, exiting...');
      return;
    }

    for (const file of files) {
      await processFile(file);
    }

    log(`🎉 All ${isBlog ? 'BLOG' : docType.toUpperCase()} files processed successfully!`);
  } catch (error) {
    log(`❌ Script failed: ${error.message}`);
    process.exit(1);
  }
}

// 运行脚本
main();
