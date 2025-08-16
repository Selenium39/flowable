---
id: ch05-Deployment
title: 部署
description: 本文档详细介绍了Flowable CMMN中案例定义的部署流程，包括外部资源引用、Java类路径管理、Spring beans使用以及案例定义的版本控制机制，帮助开发者正确配置和更新案例定义。
keywords: Flowable,CMMN,案例部署,Java类路径,Spring集成,版本控制,服务任务,案例定义
---

## 外部资源

案例定义存储在 Flowable 数据库中。这些案例定义在使用服务任务或来自 Flowable 配置文件的 Spring bean 时可以引用委托类。这些类和 Spring 配置文件必须对所有可能执行案例定义的 CMMN 引擎可用。

### Java 类

在案例定义中使用的所有自定义类(例如,在服务任务中使用的 PlanItemJavaDelegates)在启动案例实例时都必须存在于引擎的类路径中。

但是,在部署案例定义时,这些类不必存在于类路径中。这意味着,例如,在部署新的案例定义时,您的委托类不必在类路径中。

当您使用演示设置并想要添加自定义类时,您应该将包含这些类的 JAR 添加到 flowable-task 或 flowable-rest webapp 的 lib 目录中。别忘了也要包含您的自定义类的依赖项(如果有的话)。或者,您可以将依赖项包含在 Tomcat 安装目录的 libraries 目录中,${tomcat.home}/lib(或其他 Web 容器的类似位置)。

### 在案例实例中使用 Spring beans

当表达式或脚本使用 Spring beans 时,这些 beans 在执行案例定义时必须对引擎可用。如果您正在构建自己的 webapp 并按照[Spring 集成章节](cmmn/ch04-Spring.md#spring-integration)中所述在上下文中配置 CMMN 引擎,这很简单。但请记住,如果您使用它,您还应该使用该上下文更新 Flowable task 和 rest webapps。

## 案例定义的版本控制

CMMN 没有版本控制的概念。这实际上是好事,因为可执行的 CMMN 文件可能会作为开发项目的一部分存在于版本控制系统仓库(如 Subversion、Git 或 Mercurial)中。但是,案例定义的版本是在部署过程中由引擎创建的。在部署期间,Flowable 会在将 CaseDefinition 存储到 Flowable 数据库之前为其分配一个版本。

对于部署中的每个案例定义,都会执行以下步骤来初始化属性 key、version、name 和 id:

-   XML 文件中的案例定义 id 属性用作案例定义的 key 属性。

-   XML 文件中的案例定义 name 属性用作案例定义的 name 属性。如果未指定 name 属性,则使用 id 属性作为名称。

-   首次部署具有特定 key 的案例时,会分配版本 1。对于具有相同 key 的案例定义的所有后续部署,版本将被设置为比当前部署的最高版本高 1。key 属性用于区分案例定义。

例如,以下案例:

    <definitions id="myDefinitions" >
      <case id="myCase" name="My important case" >
        ...

当部署此案例定义时,数据库中的案例定义将如下所示:

<table>
<caption>案例定义表</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>id</th>
<th>key</th>
<th>name</th>
<th>version</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>676</p></td>
<td><p>myCase</p></td>
<td><p>My important case</p></td>
<td><p>1</p></td>
</tr>
</tbody>
</table>

假设我们现在部署同一案例的更新版本(例如,更改一些人工任务),但案例定义的 id 保持不变。案例定义表现在将包含以下条目:

<table>
<caption>更新后的案例定义表</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>id</th>
<th>key</th>
<th>name</th>
<th>version</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>676</p></td>
<td><p>myCase</p></td>
<td><p>My important case</p></td>
<td><p>1</p></td>
</tr>
<tr class="even">
<td><p>870</p></td>
<td><p>myCase</p></td>
<td><p>My important case</p></td>
<td><p>2</p></td>
</tr>
</tbody>
</table>

当调用 runtimeService.createCaseInstanceBuilder().caseDefinitionKey("myCase").start() 时,它将使用版本 2 的案例定义,因为这是该案例定义的最新版本。

如果我们创建第二个案例,如下所示并部署到 Flowable,将向表中添加第三行。

    <definitions id="myNewDefinitions" >
      <case id="myNewCase" name="My important case" >
        ...

表将如下所示:

<table>
<caption>添加新案例后的案例定义表</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>id</th>
<th>key</th>
<th>name</th>
<th>version</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>676</p></td>
<td><p>myCase</p></td>
<td><p>My important case</p></td>
<td><p>1</p></td>
</tr>
<tr class="even">
<td><p>870</p></td>
<td><p>myCase</p></td>
<td><p>My important case</p></td>
<td><p>2</p></td>
</tr>
<tr class="odd">
<td><p>1033</p></td>
<td><p>myNewCase</p></td>
<td><p>My important case</p></td>
<td><p>1</p></td>
</tr>
</tbody>
</table>

注意新案例的 key 与我们的第一个案例不同。尽管名称相同(我们可能也应该更改它),但 Flowable 在区分案例时只考虑 id 属性。因此,新案例部署时的版本为 1。

## 类别

部署和案例定义都有用户定义的类别。案例定义类别使用 CMMN XML 中的 targetNamespace 属性的值进行初始化: &lt;definitions ... targetNamespace="yourCategory" ...

部署类别也可以在 API 中这样指定:

    repositoryService
        .createDeployment()
        .category("yourCategory")
        ...
        .deploy();