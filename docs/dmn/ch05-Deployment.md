---
id: ch05-Deployment
title: 部署
description: 本文档详细介绍如何在Flowable DMN引擎中部署DMN定义，包括部署方法、版本控制、Java类路径要求以及决策表管理，帮助开发者高效实现业务决策自动化。
keywords: Flowable,DMN部署,决策表,业务存档,版本控制,Java类路径,DMN引擎,决策自动化
---

## DMN 定义

带有 .dmn 扩展名的 DMN 定义可以被部署到 DMN 引擎中。

当 DMN 引擎被集成到流程引擎中时，DMN 定义可以与其他流程相关资源一起打包到业务存档(BAR)中。流程引擎的部署服务将负责将 DMN 资源部署到 DMN 引擎。

> **注意**
>
> 业务存档中用于自定义表达式函数的 Java 类**不会被添加到类路径中**。为了运行决策，在业务存档中的决策表达式中使用的所有自定义类都应该存在于 Flowable (DMN) 引擎的类路径中。

### DMN 定义、决策和决策表

DMN 定义由多个部分组成，其中包括决策。一个决策有一个表达式。DMN 规范描述了几种类型的表达式。目前在 Flowable DMN 中，我们支持决策表类型的表达式。
当部署 DMN 定义时，每个决策（可以包含一个**决策表**）都会被单独插入到 ACT_DMN_DECISION 表中。

### 以编程方式部署

部署 DMN 定义可以这样做：

    String dmnDefinition = "path/to/definition-one.dmn"; //不要忘记 .dmn 扩展名！

    repositoryService.createDeployment()
        .name("DMN definition-one 的部署")
        .addClasspathResource(dmnDefinition)
        .deploy();

你可以使用其他方法来添加 DMN 定义到部署中，比如 `addInputStream`。这是一个从外部文件部署 DMN 定义的示例：

    File dmnFile = new File("/path/to/definition-two.dmn"); //不要忘记 .dmn 扩展名！

    repositoryService.createDeployment()
        .name("DMN definition-two 的部署")
        .addInputStream(dmnFile.getName(), new FileInputStream(dmnFile))
        .deploy();

部署的名称可以是任何文本，但资源名称必须始终包含有效的 DMN 资源名称后缀（".dmn"）。

### Java 类

在执行决策时，包含决策中使用的自定义表达式函数的所有类都应该存在于引擎的类路径中。

然而，在部署 DMN 定义时，这些类不必存在于类路径中。

当你使用演示设置并想要添加自定义类时，你应该将包含你的类的 JAR 添加到 flowable-app-rest webapp lib 中。不要忘记也包含你的自定义类的依赖项（如果有的话）。或者，你可以将你的依赖项包含在 Tomcat 安装目录的 libraries 目录中，${tomcat.home}/lib。

### 创建单个应用

与其确保所有 DMN 引擎都在其类路径中包含所有委托类并使用正确的 Spring 配置，你可以考虑在你自己的 webapp 中包含 flowable-rest webapp，这样就只有一个 DmnEngine。

## DMN 决策的版本控制

DMN 本身没有版本控制的概念。这实际上是好事，因为可执行的 DMN 定义文件可能会作为开发项目的一部分存在于版本控制系统仓库（如 Subversion、Git 或 Mercurial）中。DMN 决策的版本是在部署期间创建的。在部署期间，Flowable 会在将决策存储到 Flowable 数据库之前为其分配一个版本。

对于 DMN 定义中的每个 DMN 决策，都会执行以下步骤来初始化属性 key、version、name 和 id：

- 定义 XML 文件中的决策 id 属性用作决策表 key 属性。

- XML 文件中的决策 name 属性用作决策表 name 属性。

- 首次部署具有特定 key 的决策时，会分配版本 1。对于具有相同 key 的决策的所有后续部署，版本将被设置为当前已部署的最大版本加 1。key 属性用于区分决策。

- id 属性是一个唯一数字，用于保证在集群环境中决策表缓存的决策表标识符的唯一性。

以下面的流程为例：

    <definitions id="myDefinitions" >
      <decision id="myDecision" name="My important decision" >
        <decisionTable id="decisionTable1" hitPolicy="FIRST" >
        ...

当部署这个决策时，数据库中的决策表将如下所示：

<table>
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
<td><p>e29d4126-ed4d-11e6-9e00-7282cbd6ce64</p></td>
<td><p>myDecision</p></td>
<td><p>My important decision</p></td>
<td><p>1</p></td>
</tr>
</tbody>
</table>

假设我们现在部署同一流程的更新版本（例如，更改一些用户任务），但流程定义的 id 保持不变。流程定义表现在将包含以下条目：

<table>
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
<td><p>e29d4126-ed4d-11e6-9e00-7282cbd6ce64</p></td>
<td><p>myDecision</p></td>
<td><p>My important decision</p></td>
<td><p>1</p></td>
</tr>
<tr class="even">
<td><p>e9c2a6c0-c085-11e6-9096-6ab56fad108a</p></td>
<td><p>myDecision</p></td>
<td><p>My important decision</p></td>
<td><p>2</p></td>
</tr>
</tbody>
</table>

当调用 dmnRuleService.executeDecisionByKey("myDecision") 时，它将使用版本 2 的决策定义，因为这是该决策定义的最新版本。

如果我们创建第二个决策，如下所示并部署到 Flowable DMN，将向表中添加第三行。

    <definitions id="myNewDefinitions" >
      <decision id="myNewDecision" name="My important decision" >
        <decisionTable id="decisionTable1" hitPolicy="FIRST" >
          ...

表将如下所示：

<table>
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
<td><p>e29d4126-ed4d-11e6-9e00-7282cbd6ce64</p></td>
<td><p>myDecision</p></td>
<td><p>My important decision</p></td>
<td><p>1</p></td>
</tr>
<tr class="even">
<td><p>e9c2a6c0-c085-11e6-9096-6ab56fad108a</p></td>
<td><p>myDecision</p></td>
<td><p>My important decision</p></td>
<td><p>2</p></td>
</tr>
<tr class="odd">
<td><p>d317d3f7-e948-11e6-9ce6-b28c070b517d</p></td>
<td><p>myNewDecision</p></td>
<td><p>My important decision</p></td>
<td><p>1</p></td>
</tr>
</tbody>
</table>

注意新决策的 key 与我们的第一个决策不同。尽管名称相同（我们可能也应该改变它），但 Flowable DMN 在区分决策时只考虑 id 属性。因此，新决策部署时的版本为 1。

## 类别

DMN 部署和决策表都可以有用户定义的类别。
部署类别可以在 API 中这样指定：

    dmnRepository
        .createDeployment()
        .category("yourCategory")
        ...
        .deploy();

决策表类别可以在 API 中这样指定：

    dmnRepository.setDecisionTableCategory("e9c2a6c0-c085-11e6-9096-6ab56fad108a", "yourCategory");