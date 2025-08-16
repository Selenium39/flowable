---
id: oss-introduction
title: Flowable开源介绍
description: Flowable开源介绍文档详细说明了Flowable工作流引擎的许可证、下载方式、源代码获取、系统要求（JDK 17+）、建模工具使用方法、问题反馈渠道以及版本策略，为开发者提供全面的入门指南。
keywords: Flowable,开源工作流引擎,BPMN,Apache许可证,Java工作流,流程建模,JDK 17
sidebar_label: 开源详情
---

## 许可证

Flowable 基于 [Apache V2 许可证](http://www.apache.org/licenses/LICENSE-2.0.html) 进行分发。

## 下载

[<http://www.flowable.org/downloads.html>](http://www.flowable.org/downloads.html)

## 源代码

发行版包含大部分源代码的 JAR 文件。Flowable 的源代码可以在以下地址找到：
[<https://github.com/flowable/flowable-engine>](https://github.com/flowable/flowable-engine)

## 所需软件

### JDK 17+

Flowable 运行需要 JDK 17 或更高版本。前往 [Oracle Java SE 下载页面](http://www.oracle.com/technetwork/java/javase/downloads/index.html) 并点击"Download JDK"按钮。该页面上也有安装说明。要验证安装是否成功，请在命令行中运行 java -version。这将显示已安装的 JDK 版本。

### 建模工具

Flowable 提供免费使用的 Flowable Cloud Design 应用程序，您可以使用它来建模 CMMN、BPMN、DMN 和其他类型的模型。
您可以通过 Flowable 账户注册页面开始使用 [Flowable 账户注册页面](https://www.flowable.com/account/open-source)。

## 问题报告

我们希望开发者在报告或询问任何问题之前，已经阅读过[提问的智慧](http://www.catb.org/~esr/faqs/smart-questions.html)。

在此之后，您可以在[用户论坛](https://forum.flowable.org)上发布问题、评论或功能改进建议，并在[我们的 Github 问题追踪器](https://github.com/flowable/flowable-engine/issues)中创建 bug 报告。

## 实验性功能

标记为 **[EXPERIMENTAL]** 的部分不应被视为稳定功能。

所有包名中包含 .impl. 的类都是内部实现类，不能保证其稳定性或提供任何保证。但是，如果用户指南中提到某些类作为配置值，则这些类是受支持的，可以被视为稳定的。

## 内部实现类

在 JAR 文件中，所有包名中包含 .impl.（例如 org.flowable.engine.impl.db）的类都是实现类，应该仅供内部使用。对于实现类中的类或接口，不提供任何稳定性保证。

## 版本策略

版本号使用标准的三位整数表示：**MAJOR.MINOR.MICRO**。其中 **MAJOR** 版本用于核心引擎的演进，**MINOR** 版本用于新特性和新的 API，**MICRO** 版本用于错误修复和改进。

通常，Flowable 在 **MINOR** 和 **MICRO** 版本中会为所有非内部实现类保持"源代码兼容性"。我们将"源代码兼容"定义为应用程序将继续无错误构建，且语义保持不变。Flowable 还尝试在 **MINOR** 和 **MICRO** 版本中保持"二进制兼容性"。我们将"二进制兼容"定义为这个新版本的 Flowable 可以作为 jar 替换放入已编译的应用程序中，并继续正常运行。

如果在 **MINOR** 版本中引入了 API 更改，策略是在其中保留一个向后兼容的版本，并使用 *@Deprecated* 注解标记。这些废弃的 API 将在两个 **MINOR** 版本之后被移除。
