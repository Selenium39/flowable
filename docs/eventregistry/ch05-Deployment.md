---
id: ch05-Deployment
title: 部署
description: 本文档详细介绍了如何在Flowable中部署事件注册表定义，包括事件定义和通道定义的创建与编程部署方法，以及Java类路径配置要点，帮助开发者高效管理事件驱动架构。
keywords: Flowable, 事件注册表, 事件定义, 通道定义, 业务存档部署, Java类路径, 编程部署
---

## 事件注册表定义

事件注册表支持两种类型的定义：事件定义和通道定义。
事件定义使用 .event 扩展名，通道定义使用 .channel 扩展名。

当事件注册表引擎与流程引擎一起使用时，事件和通道定义可以与其他流程相关资源一起打包到业务存档(BAR)中。流程引擎部署服务将负责将事件和通道资源部署到事件注册表引擎。

> **注意**
>
> 业务存档中用于自定义表达式函数的 Java 类**不会被添加到类路径中**。业务存档中事件和通道定义中使用的所有自定义类都应该存在于 Flowable (Event Registry) 引擎的类路径中。

### 事件定义

事件定义配置事件负载结构以及关联和租户检测。
部署事件定义时，新的定义将被插入到 FLW_EVENT_DEFINITION 表中。

### 以编程方式部署事件定义

部署事件定义可以这样做：

    String eventDefinition = "path/to/definition-one.event"; //不要忘记 .event 扩展名！

    repositoryService.createDeployment()
        .name("部署事件定义一")
        .addClasspathResource(eventDefinition)
        .deploy();

你可以使用其他方法将事件定义添加到部署中，比如 `addInputStream`。这是从外部文件部署事件定义的示例：

    File eventFile = new File("/path/to/definition-two.event"); //不要忘记 .event 扩展名！

    repositoryService.createDeployment()
        .name("部署事件定义二")
        .addInputStream(eventFile.getName(), new FileInputStream(eventFile))
        .deploy();

部署的名称可以是任何文本，但资源名称必须始终包含有效的事件定义资源名称后缀(".event")。

### 通道定义

通道定义配置传入或传出事件的源或目标目的地。
默认情况下，Flowable 事件注册表支持 JMS、Kafka 和 RabbitMQ 源和目标目的地，但也可以扩展其他适配器类型。
部署通道定义时，新的定义将被插入到 FLW_CHANNEL_DEFINITION 表中。

### 以编程方式部署通道定义

部署通道定义可以这样做：

    String channelDefinition = "path/to/definition-one.channel"; //不要忘记 .channel 扩展名！

    repositoryService.createDeployment()
        .name("部署通道定义一")
        .addClasspathResource(channelDefinition)
        .deploy();

你可以使用其他方法将事件定义添加到部署中，比如 `addInputStream`。这是从外部文件部署事件定义的示例：

    File channelFile = new File("/path/to/definition-two.channel"); //不要忘记 .channel 扩展名！

    repositoryService.createDeployment()
        .name("部署通道定义二")
        .addInputStream(channelFile.getName(), new FileInputStream(channelFile))
        .deploy();

部署的名称可以是任何文本，但资源名称必须始终包含有效的通道定义资源名称后缀(".channel")。

### Java 类

包含在事件和通道中使用的自定义表达式函数的所有类都必须在执行决策时存在于引擎的类路径中。

但是，在部署事件或通道定义时，这些类不必存在于类路径中。

当你使用演示设置并想要添加自定义类时，你应该将包含你的类的 JAR 添加到 flowable-app-rest webapp lib 中。不要忘记也包含你的自定义类的依赖项（如果有的话）。或者，你可以将依赖项包含在 Tomcat 安装的库目录中，${tomcat.home}/lib。

### 创建单个应用程序

与其确保所有事件注册表引擎都在其类路径中包含所有委托类并使用正确的 Spring 配置，
你可以考虑将 flowable-rest webapp 包含在你自己的 webapp 中，这样就只有一个 EventRegistryEngine。

## 事件和通道定义的版本控制

在部署期间，Flowable 将为事件和通道定义分配版本，然后将其存储在 Flowable 数据库中。

对于每个事件和通道定义，执行以下步骤来初始化属性 key、version、name 和 id：

- 定义 JSON 文件中的事件或通道 key 属性用作定义 key 属性。

- JSON 文件中的 name 属性用作定义 name 属性。

- 首次部署具有特定 key 的事件或通道定义时，分配版本 1。对于具有相同 key 的事件或通道定义的所有后续部署，版本将设置为当前部署的最大版本加 1。key 属性用于区分事件和通道定义。

- id 属性是一个唯一数字，用于保证集群环境中事件和通道定义标识符的唯一性。

以下面的流程为例：

    {
        "key": "myEvent",
        "name": "My event",
        ...

部署此事件定义时，它将如下所示：

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
<td><p>myEvent</p></td>
<td><p>My event</p></td>
<td><p>1</p></td>
</tr>
</tbody>
</table>

假设我们现在部署同一事件定义的更新版本，但事件定义的 key 保持不变。事件定义表现在将包含以下条目：

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
<td><p>myEvent</p></td>
<td><p>My event</p></td>
<td><p>1</p></td>
</tr>
<tr class="even">
<td><p>e9c2a6c0-c085-11e6-9096-6ab56fad108a</p></td>
<td><p>myEvent</p></td>
<td><p>My event</p></td>
<td><p>2</p></td>
</tr>
</tbody>
</table>

当调用 eventRegistry.getEventModelByKey("myEvent") 时，它将使用版本 2 的事件定义，因为这是事件定义的最新版本。

如果我们创建第二个决策，如下所示并将其部署到 Flowable DMN，将向表中添加第三行。

    {
        "key": "myNewEvent",
        "name": "My new event",
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
<td><p>myEvent</p></td>
<td><p>My event</p></td>
<td><p>1</p></td>
</tr>
<tr class="even">
<td><p>e9c2a6c0-c085-11e6-9096-6ab56fad108a</p></td>
<td><p>myEvent</p></td>
<td><p>My event</p></td>
<td><p>2</p></td>
</tr>
<tr class="odd">
<td><p>d317d3f7-e948-11e6-9ce6-b28c070b517d</p></td>
<td><p>myNewEvent</p></td>
<td><p>My new event</p></td>
<td><p>1</p></td>
</tr>
</tbody>
</table>

注意新事件定义的 key 与我们的第一个事件定义不同。即使名称相同，Flowable 事件注册表在区分事件和通道时只考虑 key 属性。因此，新的事件定义部署时版本为 1。