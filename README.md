# Flowable 中文文档

[Flowable](https://www.flowable.com/) 官方文档的中文翻译与文档站点，在线访问：**[flowable.me](https://flowable.me)**。

> **声明**：本项目为社区维护的非官方翻译项目，与 Flowable AG 无关联。Flowable 及相关商标归其各自所有者所有。

## 许可

本仓库包含两部分内容，许可结构如下：

| 内容 | 许可 | 版权归属 |
| --- | --- | --- |
| `docs/` 中文文档 | Apache License 2.0 | 原文档版权归 Flowable AG 所有，译文以相同协议提供 |
| `website/` 站点代码与 CI 配置 | Apache License 2.0 | 见 [LICENSE](LICENSE) |

原文档：[flowable-engine @ GitHub](https://github.com/flowable/flowable-engine)（Apache License 2.0）。

## 本地开发

依赖：Node.js 20+、Yarn。

```bash
cd website
yarn install
yarn start   # 本地预览，默认 http://localhost:3000
yarn build   # 构建产物输出到 website/build/flowable-userguide
```

## 参与贡献

发现翻译错误、过期内容或页面问题，欢迎 [提 Issue](https://github.com/Selenium39/flowable/issues) 或直接提交 PR：

1. Fork 后从 `dev` 分支切出改动分支（`dev` 为开发分支，`master` 保持稳定）
2. 修改 `docs/` 下对应的 Markdown 文件
3. 提交 PR 到 `dev` 分支

翻译以 Flowable 官方英文文档为准，术语尽量与社区惯用译法保持一致。
