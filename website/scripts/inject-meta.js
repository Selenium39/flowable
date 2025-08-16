#!/usr/bin/env node

/**
 * Inject per-page SEO meta tags (keywords, description, canonical) into built HTML files.
 *
 * How it works (no Docusaurus upgrade needed):
 * - Walk the built HTML output directory (build/<projectName>/)
 * - For each HTML file, try to find a matching source markdown in ../docs by route path
 * - Parse very simple front matter (--- ... ---) for keys: description, keywords, canonical
 * - Fallback: derive description from the first paragraph in HTML; use default keywords
 * - Inject or replace <meta name="description">, <meta name="keywords"> and <link rel="canonical">
 */

const fs = require('fs');
const path = require('path');

// Load siteConfig to get url/baseUrl/projectName
const siteConfig = require(path.join(__dirname, '../siteConfig.js'));

const BUILD_ROOT = path.join(__dirname, '../build', siteConfig.projectName);
const DOCS_SRC_ROOT = path.join(__dirname, '../..', 'docs');
const BLOG_SRC_ROOT = path.join(__dirname, '../blog');

const DEFAULT_KEYWORDS = 'Flowable,BPMN,CMMN,DMN,流程引擎,工作流引擎,工作流,BPM';

// Route-level meta overrides (for pages without source markdown, e.g. blog index)
const ROUTE_META_OVERRIDES = {
  '/blog': {
    description: 'Flowable 中文社区博客：精选教程、最佳实践、版本更新与案例解析，帮助你高效掌握流程引擎与工作流实践',
    keywords: 'Flowable,博客,教程,最佳实践,版本更新,案例,流程引擎,工作流'
  }
};

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function walkHtmlFiles(dir) {
  const results = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        // Skip heavy/static vendor directories
        if (/(^|\/)static(\/|$)/.test(full) || /(^|\/)assets(\/|$)/.test(full) || /(^|\/)javadocs-5(\/|$)/.test(full)) {
          continue;
        }
        stack.push(full);
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.html')) {
          results.push(full);
        }
      }
    }
  }
  return results;
}

function ensureLeadingSlash(p) {
  if (!p.startsWith('/')) return `/${p}`;
  return p;
}

function toRoutePathFromHtml(htmlFile) {
  // Compute path relative to BUILD_ROOT, then normalize:
  // - /path/index.html => /path
  // - /path.html => /path (without .html)
  let rel = path.relative(BUILD_ROOT, htmlFile).split(path.sep).join('/');
  // Handle root index.html => '/'
  if (rel === 'index.html') {
    return '/';
  }
  if (rel.endsWith('/index.html')) {
    rel = rel.slice(0, -('/index.html'.length));
  } else if (rel.endsWith('.html')) {
    rel = rel.slice(0, -('.html'.length));
  }
  if (rel === '') return '/';
  return ensureLeadingSlash(rel);
}

function mapRouteToDocSource(routePath) {
  // Docs are served from root because docsUrl is empty in siteConfig.
  // Map "/bpmn/ch02-GettingStarted" -> "../docs/bpmn/ch02-GettingStarted.md"
  if (routePath === '/' || routePath.startsWith('/blog')) return null;
  const mdPath = path.join(DOCS_SRC_ROOT, routePath.replace(/^\//, '') + '.md');
  if (fileExists(mdPath)) return mdPath;
  return null;
}

function mapRouteToBlogSource(routePath) {
  // Map "/blog/2025/03/12/slug" -> "../blog/2025-03-12-slug.md"
  if (!routePath.startsWith('/blog/')) return null;
  const parts = routePath.replace(/^\//, '').split('/');
  if (parts.length < 5) return null;
  const year = parts[1];
  const month = parts[2];
  const day = parts[3];
  const slug = parts.slice(4).join('-');
  const filename = `${year}-${month}-${day}-${slug}.md`;
  const mdPath = path.join(BLOG_SRC_ROOT, filename);
  if (fileExists(mdPath)) return mdPath;
  return null;
}

function parseFrontMatterSimple(markdownText) {
  // Very simple YAML front matter parser for flat key: value pairs.
  // Supports:
  // ---\nkey: value\nkeywords: a, b, c\n---
  const fmMatch = markdownText.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return {};
  const yaml = fmMatch[1];
  const lines = yaml.split(/\r?\n/);
  const data = {};
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let value = m[2].trim();
    // Strip surrounding quotes if any
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  // Normalize keywords as comma-separated string
  if (typeof data.keywords !== 'undefined' && Array.isArray(data.keywords)) {
    data.keywords = data.keywords.join(', ');
  }
  return data;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFirstParagraphText(html) {
  // Try main content paragraphs first
  const pMatch =
    html.match(/<main[\s\S]*?<p[\s\S]*?>([\s\S]*?)<\/p>/i) ||
    html.match(/<div[^>]+class=\"[^\"]*(?:post|docMainContainer)[^\"]*\"[\s\S]*?<p[\s\S]*?>([\s\S]*?)<\/p>/i) ||
    html.match(/<p[\s\S]*?>([\s\S]*?)<\/p>/i);
  if (!pMatch) return '';
  const inner = pMatch[1] || '';
  return stripHtml(inner);
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function joinUrl(base, postfix) {
  if (!base) return postfix;
  const b = base.endsWith('/') ? base.slice(0, -1) : base;
  return b + postfix;
}

function buildCanonicalUrl(routePath) {
  // baseUrl might be '/', normalize to empty when joining
  const baseUrl = siteConfig.baseUrl || '/';
  const normalizedBase = baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
  // For home route '/', prefer canonical without trailing slash (e.g. https://example.com)
  if (routePath === '/') {
    return joinUrl(siteConfig.url, normalizedBase);
  }
  const fullPath = normalizedBase + routePath;
  return joinUrl(siteConfig.url, fullPath);
}

function removeExistingTag(html, regex) {
  return html.replace(regex, '');
}

function injectIntoHead(html, injection) {
  const closeHeadIdx = html.search(/<\/head>/i);
  if (closeHeadIdx === -1) return html + injection; // fallback
  return html.slice(0, closeHeadIdx) + injection + html.slice(closeHeadIdx);
}

function upsertMeta(html, { canonical, description, keywords }) {
  let output = html;

  // Remove existing tags if present
  output = removeExistingTag(output, /\n?\s*<meta\s+name=["']description["'][^>]*>\s*/i);
  output = removeExistingTag(output, /\n?\s*<meta\s+name=["']keywords["'][^>]*>\s*/i);
  output = removeExistingTag(output, /\n?\s*<link\s+rel=["']canonical["'][^>]*>\s*/i);

  const parts = [];
  if (canonical) {
    parts.push(`\n  <link rel="canonical" href="${escapeHtmlAttr(canonical)}">`);
  }
  if (description) {
    parts.push(`\n  <meta name="description" content="${escapeHtmlAttr(description)}">`);
  }
  if (keywords) {
    parts.push(`\n  <meta name="keywords" content="${escapeHtmlAttr(keywords)}">`);
  }

  if (parts.length === 0) return output;
  const injection = parts.join('') + '\n';
  return injectIntoHead(output, injection);
}

function deriveMetaForFile(htmlFile, routePath) {
  let canonical = buildCanonicalUrl(routePath);
  let description = '';
  let keywords = '';

  // Apply route-level overrides first (stronger than HTML-derived fallback)
  const override = ROUTE_META_OVERRIDES[routePath];
  if (override) {
    if (override.description) description = override.description;
    if (override.keywords) keywords = override.keywords;
  }

  const srcMd = mapRouteToDocSource(routePath) || mapRouteToBlogSource(routePath);
  if (srcMd && fileExists(srcMd)) {
    const mdText = readText(srcMd);
    const fm = parseFrontMatterSimple(mdText);
    if (fm.canonical) canonical = fm.canonical;
    if (fm.description) description = fm.description;
    if (fm.keywords) keywords = fm.keywords;
  }

  const html = readText(htmlFile);
  if (!description) {
    const p = extractFirstParagraphText(html);
    description = p ? p.slice(0, 180) : '';
  }
  if (!keywords) {
    keywords = DEFAULT_KEYWORDS;
  }

  return { canonical, description, keywords };
}

function main() {
  if (!fileExists(BUILD_ROOT)) {
    log(`❌ Build output not found at: ${BUILD_ROOT}`);
    log('💡 Run the site build first.');
    process.exit(1);
  }

  const files = walkHtmlFiles(BUILD_ROOT);
  let updated = 0;
  for (const file of files) {
    try {
      const routePath = toRoutePathFromHtml(file);
      const meta = deriveMetaForFile(file, routePath);
      const html = readText(file);
      const next = upsertMeta(html, meta);
      if (next !== html) {
        writeText(file, next);
        updated += 1;
      }
    } catch (e) {
      log(`⚠️  Failed processing ${file}: ${e.message}`);
    }
  }

  log(`✅ Injected meta into ${updated} HTML files under ${BUILD_ROOT}`);
}

main();


