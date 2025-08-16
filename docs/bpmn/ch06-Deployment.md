---
id: ch06-Deployment
title: 部署
description: 本文详细介绍了如何在Flowable中部署业务流程，包括业务文档包(BAR)的创建、以编程方式部署流程、外部资源管理以及流程定义的版本控制机制，帮助开发者高效实现流程部署与管理。
keywords: Flowable部署,BPMN流程部署,业务文档包,BAR文件,流程版本控制,Java类配置,Spring集成,流程引擎
---

## 业务文档包

要部署流程,需要将它们打包到业务文档包(BAR)中。业务文档包是部署到 Flowable 引擎的单位。业务文档包相当于一个 ZIP 文件。它可以包含 BPMN 2.0 流程、表单定义、DMN 规则和任何其他类型的文件。通常,业务文档包包含一组命名资源。

当部署业务文档包时,会扫描带有 .bpmn20.xml 或 .bpmn 扩展名的 BPMN 文件。每个文件都会被处理,可能包含多个流程定义。
当 DMN 引擎激活时,也会解析 .dmn 文件,当表单引擎激活时,会处理 .form 文件。

> **注意**
>
> 业务文档包中的 Java 类**不会被添加到类路径中**。业务文档包中流程定义使用的所有自定义类(例如,Java service tasks 或事件监听器实现)必须在 Flowable 引擎的类路径上可用,以便运行这些流程。

### 以编程方式部署

从 ZIP 文件部署业务文档包可以这样做:

    String barFileName = "path/to/process-one.bar";
    ZipInputStream inputStream = new ZipInputStream(new FileInputStream(barFileName));

    repositoryService.createDeployment()
        .name("process-one.bar")
        .addZipInputStream(inputStream)
        .deploy();

也可以从单个资源构建部署。更多详细信息请参见 javadocs。

## 外部资源

流程定义存储在 Flowable 数据库中。这些流程定义在使用 Service Tasks 或执行监听器或 Flowable 配置文件中的 Spring beans 时可以引用委托类。这些类和 Spring 配置文件必须对可能执行流程定义的所有流程引擎可用。

### Java 类

在启动流程实例时,流程中使用的所有自定义类(例如,在 Service Tasks 中使用的 JavaDelegates 或事件监听器、TaskListeners 等)都应该在引擎的类路径上。

但是,在部署业务文档包时,这些类不必存在于类路径中。这意味着在使用 Ant 部署新的业务文档包时,您的委托类不必在类路径上。

当您使用演示设置并想要添加自定义类时,您应该将包含类的 JAR 添加到 flowable-task 或 flowable-rest webapp lib 中。不要忘记也包含自定义类的依赖项(如果有的话)。或者,您可以将依赖项包含在 Tomcat 安装的库目录中,${tomcat.home}/lib。

### 在流程中使用 Spring beans

当表达式或脚本使用 Spring beans 时,在执行流程定义时,这些 beans 必须对引擎可用。如果您正在构建自己的 webapp 并按照[spring 集成部分](bpmn/ch05-Spring.md#spring-integration)中所述在上下文中配置流程引擎,这很简单。但请记住,如果使用它,您还应该使用该上下文更新 Flowable task 和 rest webapps。

### 创建单个应用程序

与其确保所有流程引擎在其类路径上都有所有委托类并使用正确的 Spring 配置,不如考虑将 Flowable REST webapp 包含在您自己的 webapp 中,这样就只有一个 ProcessEngine。

## 流程定义的版本控制

BPMN 没有版本控制的概念。这实际上是好事,因为可执行的 BPMN 流程文件可能作为开发项目的一部分存在于版本控制系统存储库(如 Subversion、Git 或 Mercurial)中。但是,流程定义的版本是在部署过程中在引擎中创建的。在部署期间,Flowable 会在将 ProcessDefinition 存储到 Flowable DB 之前为其分配一个版本。

对于业务文档包中的每个流程定义,执行以下步骤来初始化属性 key、version、name 和 id:

- XML 文件中的流程定义 id 属性用作流程定义 key 属性。

- XML 文件中的流程定义 name 属性用作流程定义 name 属性。如果未指定 name 属性,则使用 id 属性作为名称。

- 首次部署具有特定 key 的流程时,会分配版本 1。对于具有相同 key 的流程定义的所有后续部署,版本将设置为比当前部署的最高版本高 1。key 属性用于区分流程定义。

- id 属性设置为 {processDefinitionKey}:{processDefinitionVersion}:{generated-id},其中 generated-id 是添加的唯一数字,以确保在集群环境中流程定义缓存的流程 ID 的唯一性。

例如,以下流程

    <definitions id="myDefinitions" >
      <process id="myProcess" name="My important process" >
        ...

当部署此流程定义时,数据库中的流程定义将如下所示:

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
<td><p>myProcess:1:676</p></td>
<td><p>myProcess</p></td>
<td><p>My important process</p></td>
<td><p>1</p></td>
</tr>
</tbody>
</table>

假设我们现在部署同一流程的更新版本(例如,更改一些用户任务),但流程定义的 id 保持不变。流程定义表现在将包含以下条目:

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
<td><p>myProcess:1:676</p></td>
<td><p>myProcess</p></td>
<td><p>My important process</p></td>
<td><p>1</p></td>
</tr>
<tr class="even">
<td><p>myProcess:2:870</p></td>
<td><p>myProcess</p></td>
<td><p>My important process</p></td>
<td><p>2</p></td>
</tr>
</tbody>
</table>

当调用 runtimeService.startProcessInstanceByKey("myProcess") 时,它将使用版本 2 的流程定义,因为这是流程定义的最新版本。

如果我们创建第二个流程,如下所示并将其部署到 Flowable,表中将添加第三行。

    <definitions id="myNewDefinitions" >
      <process id="myNewProcess" name="My important process" >
        ...

表格将如下所示:

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
<td><p>myProcess:1:676</p></td>
<td><p>myProcess</p></td>
<td><p>My important process</p></td>
<td><p>1</p></td>
</tr>
<tr class="even">
<td><p>myProcess:2:870</p></td>
<td><p>myProcess</p></td>
<td><p>My important process</p></td>
<td><p>2</p></td>
</tr>
<tr class="odd">
<td><p>myNewProcess:1:1033</p></td>
<td><p>myNewProcess</p></td>
<td><p>My important process</p></td>
<td><p>1</p></td>
</tr>
</tbody>
</table>

注意新流程的 key 与我们的第一个流程不同。尽管名称相同(我们可能也应该更改它),但 Flowable 在区分流程时只考虑 id 属性。因此,新流程部署时版本为 1。

## 提供流程图

可以将流程图图像添加到部署中。该图像将存储在 Flowable 存储库中,并可通过 API 访问。该图像也用于在 Flowable 应用程序中可视化流程。

假设我们在类路径上有一个流程 org/flowable/expenseProcess.bpmn20.xml,其流程 key 为'expense'。流程图图像适用以下命名约定(按此特定顺序):

- 如果部署中存在图像资源,其名称为 BPMN 2.0 XML 文件名与流程 key 和图像后缀连接,则使用该图像。在我们的示例中,这将是 org/flowable/expenseProcess.expense.png(或 .jpg/gif)。如果在一个 BPMN 2.0 XML 文件中定义了多个图像,这种方法最有意义。然后每个图表图像的文件名中都会包含流程 key。

- 如果不存在这样的图像,则搜索部署中与 BPMN 2.0 XML 文件名匹配的图像资源。在我们的示例中,这将是 org/flowable/expenseProcess.png。请注意,这意味着在同一个 BPMN 2.0 文件中定义的**每个流程定义**都具有相同的流程图图像。如果每个 BPMN 2.0 XML 文件中只有一个流程定义,这显然不是问题。

以编程方式部署的示例:

    repositoryService.createDeployment()
      .name("expense-process.bar")
      .addClasspathResource("org/flowable/expenseProcess.bpmn20.xml")
      .addClasspathResource("org/flowable/expenseProcess.png")
      .deploy();

之后可以通过 API 检索图像资源:

    ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery()
      .processDefinitionKey("expense")
      .singleResult();

    String diagramResourceName = processDefinition.getDiagramResourceName();
    InputStream imageStream = repositoryService.getResourceAsStream(
        processDefinition.getDeploymentId(), diagramResourceName);

## 生成流程图

如果在部署中没有提供图像,如[上一节](bpmn/ch06-Deployment.md#providing-a-process-diagram)所述,如果流程定义包含必要的'diagram interchange'信息,Flowable 引擎将生成流程图图像。

可以以与[在部署中提供图像](bpmn/ch06-Deployment.md#providing-a-process-diagram)完全相同的方式检索资源。

![deployment.image.generation](assets/bpmn/deployment.image.generation.png)

如果由于某种原因不需要或不希望在部署期间生成图表,可以在流程引擎配置上设置 isCreateDiagramOnDeploy 属性:

    <property name="createDiagramOnDeploy" value="false" />

现在将不会生成图表。

## 类别

部署和流程定义都有用户定义的类别。流程定义类别使用 BPMN XML 中的 targetNamespace 属性的值进行初始化: &lt;definitions ... targetNamespace="yourCategory" ...

部署类别也可以在 API 中这样指定:

    repositoryService
        .createDeployment()
        .category("yourCategory")
        ...
        .deploy();