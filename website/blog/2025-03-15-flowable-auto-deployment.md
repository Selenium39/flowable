---
title: Flowable 自动部署模型
description: 本文详细介绍Flowable自动部署模型功能，包括应用、流程、案例、决策和表单模型的自动部署方法，以及Flowable Work默认模型，帮助开发者简化部署流程，提高开发效率。
keywords: Flowable,自动部署,模型部署,流程引擎,Flowable Work,开发效率,部署配置
authors: Flowable中文文档
authorURL: http://flowable.me
---

Flowable 提供了从类路径上可用的模型和配置文件进行自动部署的选项。这种功能极大地简化了开发和部署流程，使开发者能够专注于业务逻辑而非部署细节。
![Flowable 自动部署概述](/img/blog/auto-deployment-overview.svg)

## 应用自动部署

使用自动部署功能最简单的方式是从类路径将应用部署到 Flowable 平台。通过这种方式，应用中包含的所有模型都将被部署并与同一父部署相连接。以下文件夹默认支持：

- `apps/`
- `com/flowable/app/default/**/`
- `com/flowable/app/custom/**/`
- `com/flowable/app/example/**/`

在这些文件夹中，只有后缀为 `.bar` 和 `.zip` 的应用文件会被考虑。可以通过在应用属性中设置 `flowable.app.resource-location` 值来更改应用文件夹。

## 主要模型自动部署

### 流程模型
- 默认文件夹：`processes/`
- 支持文件：`.bpmn` 和 `.bpmn20.xml`
- 配置属性：`flowable.process-definition-location-prefix`

### 案例模型
- 默认文件夹：`cases/`
- 支持文件：`.cmmn` 和 `.cmmn.xml`
- 配置属性：`flowable.cmmn.resource-location`

### 决策模型
- 默认文件夹：`dmn/`
- 支持文件：`.dmn` 和 `.dmn.xml`
- 配置属性：`flowable.dmn.resource-location`

### 表单模型
- 默认文件夹：`forms/`
- 支持文件：`.form` 和 `.page`
- 配置属性：`flowable.form.resource-location`

## Flowable Work 默认模型

Flowable Work 应用包含多个默认模型，这些模型在应用启动时自动部署。主要包括：

### 默认动作模型
提供了一系列标准动作，如：
- 取消流程实例
- 完成用户任务
- 开始进行任务
- 取消案例实例
- 用户管理相关动作

### 默认安全策略
包含两个重要的安全策略模型：
- 常规安全策略（`basic-security-policy`）：用于所有权限检查
- 严格安全策略：提供更严格的权限控制

### 默认内容模型
提供三种基本内容类型：
- 合同
- 通用
- 策略

## 总结

Flowable 的自动部署功能为开发者提供了一种简单而强大的方式，从类路径直接部署各种模型和配置文件到 Flowable 平台。通过合理利用这些功能，可以显著提高开发效率和部署可靠性。

无论是使用默认的部署路径，还是通过配置属性自定义部署选项，Flowable 都提供了灵活的方式来满足各种部署需求。