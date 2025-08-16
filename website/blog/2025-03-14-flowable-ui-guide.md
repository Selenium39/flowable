---
title: Flowable-UI 入门指南：从零开始的 BPM 之旅
description: Flowable-UI入门指南详细介绍了这款开源BPM工具的核心模块和使用方法，包括流程建模器、任务管理、管理控制台和身份管理，帮助用户快速掌握无代码业务流程设计与部署技巧。
keywords: Flowable,BPMN,流程建模,开源工作流,任务管理,流程自动化,业务流程管理,Docker部署
authors: Flowable中文文档
authorURL: http://flowable.me
---


## 什么是Flowable-UI?

Flowable-UI 是 Flowable BPM 平台的用户界面组件，作为一个轻量级的开源工具，它提供了直观的图形化界面，让用户能够便捷地进行业务流程管理。无需编写代码，用户就能快速验证和实现业务流程逻辑，这使其成为流程原型开发的理想选择。

## 核心模块

Flowable-UI 整合了四个核心模块，每个模块都专注于特定的功能领域：
![Flowable-UI 模块架构](/img/blog/flowable-ui-modules.png)

1. **Flowable Modeler（流程建模器）**
   - 基于 BPMN 2.0 标准的流程设计工具
   - 支持拖拽式的流程图设计
   - 可视化的流程定义和编辑功能

![Flowable Modeler 界面](/img/blog/flowable-ui-modeler.png)

2. **Flowable Task（任务管理）**
   - 流程实例的启动和管理
   - 用户任务的处理和分配
   - 实时流程状态跟踪

![Task 模块界面](/img/blog/flowable-ui-task-module.png)

3. **Flowable Admin（管理控制台）**
   - 流程引擎的监控和管理
   - 提供数据查询功能
   - 流程调试工具

![Admin 控制台](/img/blog/flowable-ui-admin.png)

4. **Flowable IDM（身份管理）**
   - 用户和角色管理
   - 权限控制
   - 支持单点登录
   - 多应用协同管理

![IDM 管理界面](/img/blog/flowable-ui-modeler-idm.png)

## 主要功能

通过 Flowable-UI，用户可以实现以下核心功能：

- 直观地创建和编辑业务流程
- 支持多种建模标准：
  - BPMN（业务流程建模与符号）
  ![BPMN 建模示例](/img/blog/flowable-ui-modeler-bpmn.png)
  - CMMN（案例管理模型与符号）
  ![CMMN 建模示例](/img/blog/flowable-ui-modeler-cmmn.png)
  - DMN（决策模型与符号）
  ![DMN 建模示例](/img/blog/flowable-ui-modeler-dmn.png)
- 覆盖从流程设计到执行的完整生命周期管理

## 快速部署

Flowable-UI 提供了 Docker 镜像，可以通过以下简单步骤快速部署。

### 1. 使用默认 H2 数据库部署

最简单的部署方式是使用默认的 H2 内存数据库：

```bash
docker run -p 8080:8080 flowable/flowable-ui
```

### 2. 使用 MySQL 数据库部署

在生产环境中，建议使用 MySQL 等关系型数据库来持久化数据。以下是使用 MySQL 的部署步骤，完整的部署配置代码可以在 [GitHub 仓库](https://github.com/Selenium39/flowable-ui) 中找到。

1. 创建配置文件 `flowable-default.properties`，并修改下面的配置：

```properties
# 数据库配置
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://mysql:3306/flowable?characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=123456
```

2. 下载 MySQL 驱动：
   - 从 Maven 中央仓库下载 MySQL 驱动：[mysql-connector-java-8.0.27.jar](https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.27/mysql-connector-java-8.0.27.jar)

3. 创建 `docker-compose.yml` 文件：

```yaml
version: '3'

services:
  flowable-ui:
    image: flowable/flowable-ui
    container_name: flowable-ui
    restart: always
    ports:
      - 8080:8080
    volumes:
      - ./flowable-default.properties:/app/WEB-INF/classes/flowable-default.properties
      - ./mysql-connector-java-8.0.27.jar:/app/WEB-INF/lib/mysql-connector-java-8.0.27.jar
  mysql:
    image: mysql:5.7
    environment:
      TZ: Asia/Shanghai
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: flowable
    restart: always
    volumes:
      - ./data/mysql/data:/var/lib/mysql
```

4. 启动服务：

```bash
docker-compose up -d
```

5. 访问应用
![Flowable-UI 界面概览](/img/blog/flowable-ui.png)
部署完成后，访问以下地址：
- 打开浏览器访问 http://localhost:8080/flowable-ui
- 默认登录凭据：
  - 用户名：admin
  - 密码：test

## 适用场景

Flowable-UI 特别适合以下场景：
- 需要快速验证业务流程逻辑的项目
- 希望通过可视化方式设计流程的团队
- 追求低代码/无代码流程开发的组织
- 需要统一的流程管理平台的企业

通过 Flowable-UI，企业可以显著提升业务流程的设计和管理效率，实现流程自动化的快速落地。

## 重要提示
自 Flowable 7.0.0 版本起，Flowable-UI 应用程序（包括 Flowable Modeler、Task、Admin 和 IDM）已从开源项目中移除。本文内容适用于 Flowable 6.x 及更早版本的历史参考。

