---
id: dsh-bpmn-plugin
title: 给 DeepSeek Harness 装上 BPMN 建模器：dsh-bpmn 插件介绍
description: dsh-bpmn 是 DeepSeek Harness（DSH）的 BPMN 2.0 可视化建模插件：工作台（bpmn-js Modeler + 属性面板 + Ctrl+S 保存）与会话内点击预览双面板，host/client 双端架构经 loopback RPC 读写工作区 .bpmn 文件。本文介绍它的设计、安装方式与对 Flowable 用户的价值。
keywords: BPMN, BPMN 2.0, DeepSeek Harness, DSH, dsh-bpmn, bpmn-js, 流程建模, 工作流, Flowable, AI 编码助手, 插件开发
sidebar_label: dsh-bpmn 插件
---

## 为什么需要它

用 AI 编码助手做工作流相关开发时，有一个长期存在的割裂感：**会话在一处，模型在另一处**。

你想让 agent 画一张流程图，得到的往往是一段 Mermaid 文本——画不了泳道，表达不了边界事件、多实例、错误补偿这些真正的 BPMN 语义。而你真正需要的 `.bpmn` 文件（Flowable、Camunda、Activiti 这些引擎直接消费的部署单元），得打开 Camunda Modeler 或者 IDE 插件手工建模。agent 与建模器之间，靠"生成 XML → 复制粘贴 → 手动校验"往返，上下文断了一次又一次。

[dsh-bpmn](https://github.com/Selenium39/dsh-bpmn) 的出发点很简单：**把建模器放进会话里**。它是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH，深度求索开源的 agent 运行时，Web GUI 版对标 Claude Code 的使用形态）的插件，基于 [bpmn.io](https://bpmn.io) 家族的 bpmn-js 引擎，让你在 DSH 的 Web 界面里直接建模、查看、精修 BPMN 2.0 流程——和 agent 对话同一个窗口。

## 功能形态：双面板设计

插件分为两个面板，对应两种工作场景：

|      | 工作台（建模模式）             | 侧边预览（查看模式）              |
| ---- | ------------------------------ | --------------------------------- |
| 场景 | 专心画流程图                   | 边和 agent 聊天边看它生成的 BPMN  |
| 引擎 | bpmn-js `Modeler`              | bpmn-js `NavigatedViewer`（只读） |
| 载体 | 贴边面板 + 全屏                | 会话上浮层卡片（Esc / 遮罩关闭）  |

**工作台（v0.1）** 是完整的建模环境：左侧文件栏递归扫描工作区内所有 `.bpmn` 文件（自动跳过 node_modules、.git 等噪声目录），中间是画布，右侧是属性面板（可编辑名称、ID、文档以及 BPMN 扩展属性），底部状态栏显示当前工作区路径与保存状态。支持新建、打开、`Ctrl/Cmd+S` 保存——保存走"临时文件 + rename"的原子写，中途崩溃不会截断你的流程图。

**侧边预览（v0.2）** 解决另一半场景：agent 在会话里生成了 `.bpmn` 文件、或提到了某个流程文件的路径，你**直接点击**会话里的链接（Markdown 本地链接、产物卡片、文件提及、行内路径都能识别），插件在 capture 阶段截获点击，就地弹出只读预览浮层——可缩放平移。看完想改？浮层上一键"在建模器中打开"，文件带着已加载的内容无缝接力进工作台。

## 架构：一个包，两半生命

DSH 插件采用 host/client 双端模型，这对理解插件如何工作很关键：

```text
┌─ 浏览器端（src/client）─────────────────────────────┐
│                                                     │
│  [侧边栏入口按钮]──►[工作台面板]◄──►[共享 Store]     │
│                       Modeler + 属性面板    ▲        │
│                                          │          │
│  [会话内 .bpmn 链接]──►[预览浮层]─────────┘          │
│                         NavigatedViewer（只读）      │
└──────────────────────┬──────────────────────────────┘
                       │ loopback RPC（/bpmn-modeler 通道）
                       │ files/list · file/read · file/write · file/create
┌──────────────────────▼──────────────────────────────┐
│  Node 端（src/index.ts）                             │
│  工作区 .bpmn 扫描 / 读写（原子写 + 路径穿越防护）   │
└─────────────────────────────────────────────────────┘
```

- **host 半**（Node 进程内）注册一个仅限本机回环的 RPC 通道，做所有文件系统操作：递归扫描、读取（2MB 上限）、原子写入、从模板新建。所有写路径经过工作区穿越防护——`../` 逃逸、绝对路径、非 `.bpmn` 后缀一律拒绝，agent 或渲染层都无法借它读写工作区之外的文件。
- **client 半**（浏览器内）通过 DSH 的 slot 体系组合 UI：入口按钮挂 `sidebar.footer.action`，工作台与预览挂 `shell.overlay`。浏览器端没有任何文件系统访问，一切经 RPC。
- **工作区根路径**从当前会话的 `cwd` 派生（`useSessions` 标准 hook），切换会话即切换工作区，与 DSH 的多工作区模型天然对齐。

一个细节：预览拦截器所在组件在预览关闭时渲染为空，但**保持挂载**——capture 阶段的全局点击监听器因此全程存活，任何时刻点击 `.bpmn` 链接都能唤起预览。

## 安装

```sh
dsh plugin --profile web add dsh-bpmn
```

重启 `dsh web` 后侧边栏底部出现 BPMN 入口按钮。前提是你已经在用 DSH（当前处于 `0.1.x-rc` 预览阶段，插件在 dsh `0.1.0-rc.6` 上完成全链路实测）。

## 对 Flowable 用户的价值

如果你在读这个文档站，你多半和 Flowable 打过交道。这个插件对你有一个具体的意义：

**`.bpmn` 文件就是部署单元。** `repositoryService.createDeployment().addClasspathResource(...)` 吃的就是它。dsh-bpmn 产出的文件没有任何私有封装——标准 BPMN 2.0 XML、bpmn-js 序列化，直接放进 `src/main/resources/processes/` 就能被 Spring Boot 自动部署。

于是工作流变成这样：**在 DSH 会话里描述业务流程 → agent 生成 `.bpmn` 草稿 → 点击链接立即预览 → 在建模器里精修边界事件和监听器 → 存盘即是可部署产物**。引擎侧的 Java 委托、服务任务类名，也可以在属性面板里直接填写——它就是 Camunda Modeler 里那个属性面板，只是现在长在你的 agent 会话旁边。

反过来也成立：把存量流程图丢进工作区，让 agent 对照流程实现服务逻辑、生成单元测试、排查流转卡点——流程图从"文档"变成会话里可点开验证的活物。

## 工程上踩过的坑

插件本身约一千行 TypeScript，但 DSH 的浏览器加载协议和 bpmn-js 生态的打包各有陷阱，记录三个有代表性的：

1. **web shell 的模块工厂格式**。DSH 浏览器端以 `window.__ModuleLoader__.load({ id, factory })` 的形式加载插件 bundle，React 等 8 个基础包由 shell 的冻结模块表提供，其余依赖（bpmn-js 全家桶）必须内联进单文件——产物 1MB 起步，这是规则而非失误。有趣的是测试时要用一个伪造的 loader double 才能在 vitest 里执行真实的运行时包。
2. **bpmn-js-properties-panel 没有默认导出**。`import x from "bpmn-js-properties-panel"` 拿到的是整个 exports 对象，塞进 `additionalModules` 后依赖注入容器**静默忽略**——无报错、无面板。必须用命名导入 `BpmnPropertiesPanelModule` 与 `BpmnPropertiesProviderModule`。
3. **vendor 样式在传递依赖里**。properties-panel 的 CSS 不在包内，而在它的依赖 `@bpmn-io/properties-panel` 里——pnpm 的隔离布局下顶层不可达，构建脚本需要从包根锚定解析。这类"静默缺失"是打包第三方 UI 库最常见的暗坑。

## 路线图

- **v0.3+**：bpmnlint 流程校验、属性面板汉化、dmn-js 决策表支持
- **远期方向**：agent 按图执行联动——画完流程让 DSH 按图调度工具调用，流程图从建模产物变成 agent 的执行计划。BPMN 作为二十年的标准，其语义（网关、并行、补偿）恰好是当前 agent 编排语言缺位的部分

## 相关链接

- GitHub：[Selenium39/dsh-bpmn](https://github.com/Selenium39/dsh-bpmn)（插件机制速查与实现笔记在 [docs/HANDOFF.md](https://github.com/Selenium39/dsh-bpmn/blob/main/docs/HANDOFF.md)）
- npm：[dsh-bpmn](https://www.npmjs.com/package/dsh-bpmn)
- 引擎：[bpmn.io / bpmn-js](https://bpmn.io/toolkit/bpmn-js/)
- 宿主：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)
