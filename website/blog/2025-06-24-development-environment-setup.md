---
title: Flowable 开发环境搭建指南
description: 本文详细指导如何搭建Flowable开发环境，包括Java JDK配置、Maven依赖管理和仓库认证设置，帮助开发者快速开始Flowable自定义开发。
keywords: Flowable,开发环境搭建,Java开发,Maven配置,Flowable制品仓库,IDE设置,博客指南
authors: Flowable中文文档
authorURL: http://flowable.me
---

在开始自定义和扩展 Flowable 之前，我们需要搭建一个完整的开发环境。本文将详细介绍如何配置 Java 开发环境和 Maven 依赖管理，让你能够顺利开始 Flowable 的开发工作。

## 设置开发环境

要自定义 Flowable，你需要一个能够开发 Java 项目的环境。因此，你需要安装 Java JDK 和你选择的集成开发环境（IDE）。

如果你还对前端自定义感兴趣，可以查看前端开发环境设置相关文档。

## 配置 Maven 下载 Flowable 依赖

要下载 Flowable Work/Engage 的依赖包，你需要访问 Flowable 的制品仓库。你可以通过以下 `~/.m2/settings.xml` 配置你的 Maven 仓库。需要将 `USER` 和 `PASSWORD` 替换为你的凭据。

密码可以加密存储，你可以按照以下指南之一操作：

1. **使用 Maven 主密码进行密码加密**
2. **使用 JFrog 身份令牌**：前往 [Flowable Artifacts](https://repo.flowable.com)，点击右上角的用户图标，然后选择"编辑个人资料"。生成一个新的身份令牌。此令牌可以在你的 `settings.xml` 中用作密码。
3. **使用 JFrog 加密密码**：前往 [Flowable Artifacts](https://repo.flowable.com)，点击右上角的用户图标，然后选择"编辑个人资料"。用你的密码解锁设置并复制加密密码。此密钥可以在你的 `settings.xml` 中用作密码。

> **重要提示**
> 
> Flowable 制品仓库是受限的，凭据仅提供给活跃客户。如果在访问 Flowable 制品仓库时遇到问题，请联系 Flowable 支持团队或你的客户成功经理。

### Maven Settings.xml 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <servers>
        <server>
            <id>flowable-repo</id>
            <username>USER</username> <!-- 替换为你的用户名 -->
            <password>PASSWORD</password> <!-- 替换为你的密码 -->
        </server>
    </servers>

    <profiles>
        <profile>
            <id>flowable-artifacts</id>
            <repositories>
                <repository>
                    <snapshots>
                        <enabled>false</enabled>
                    </snapshots>
                    <id>flowable-repo</id>
                    <name>flowable-maven-all</name>
                    <url>https://repo.flowable.com/artifactory/flowable-maven-all</url>
                </repository>
            </repositories>
        </profile>
    </profiles>

    <activeProfiles>
        <activeProfile>flowable-artifacts</activeProfile>
    </activeProfiles>
</settings>
```

## API 密钥的废弃

为了分发制品，Flowable 使用 JFrog。JFrog 已废弃 API 密钥，因此需要将其替换为身份令牌或密码本身。

> **提示**
> 
> 你可以使用密码登录或使用身份令牌。身份令牌或密码哪个更合适取决于你在哪里使用密码。身份令牌会在一年后自动过期，你可以撤销令牌。
> 
> 对于代理制品仓库的中心位置，使用密码可能更好，因为它不会过期。

## 开发环境准备清单

在开始 Flowable 开发之前，请确保你已完成以下步骤：

### 1. Java 开发环境
- ✅ 安装 Java JDK 8 或更高版本
- ✅ 配置 JAVA_HOME 环境变量
- ✅ 选择并安装 IDE（推荐 IntelliJ IDEA 或 Eclipse）

### 2. Maven 配置
- ✅ 安装 Maven 3.6+ 
- ✅ 配置 `~/.m2/settings.xml` 文件
- ✅ 获取 Flowable 制品仓库访问凭据
- ✅ 测试 Maven 依赖下载

### 3. 验证配置
创建一个简单的测试项目来验证你的配置：

```xml
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-engine</artifactId>
    <version>7.0.1</version>
</dependency>
```

如果依赖能够成功下载，说明你的开发环境配置正确！

## 下一步

环境搭建完成后，你可以：

1. 创建你的第一个 Flowable 项目
2. 学习 Flowable 的核心概念
3. 开始构建你的工作流应用

祝你在 Flowable 开发之旅中一切顺利！