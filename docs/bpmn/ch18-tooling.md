---
id: ch18-tooling
title: 工具
description: 本文档详细介绍如何通过JMX技术监控和管理Flowable BPMN引擎，包括启用配置、连接方法及可用MBean操作，提升流程管理效率。
keywords: Flowable,BPMN,JMX监控,流程管理,MBean操作,流程引擎,Java管理扩展
---

## JMX

### 简介

可以使用标准的 Java 管理扩展(JMX)技术连接到 Flowable 引擎,以获取信息或更改其行为。任何标准的 JMX 客户端都可以用于此目的。启用和禁用作业执行器、部署新的流程定义文件和删除它们只是使用 JMX 无需编写任何代码就能完成的一些示例。

### 快速开始

默认情况下,JMX 是未启用的。要以默认配置启用 JMX,只需使用 Maven 或其他方式将 flowable-jmx jar 文件添加到类路径中即可。如果你使用 Maven,可以通过在 pom.xml 中添加以下依赖来实现:

    <dependency>
      <groupId>org.flowable</groupId>
      <artifactId>flowable-jmx</artifactId>
      <version>latest.version</version>
    </dependency>

添加依赖并构建流程引擎后,JMX 连接就可以使用了。只需运行标准 JDK 发行版中提供的 jconsole。在本地进程列表中,你将看到包含 Flowable 的 JVM。如果由于某种原因在"本地进程"部分中未列出正确的 JVM,请尝试在"远程进程"部分使用此 URL 进行连接:

    service:jmx:rmi:///jndi/rmi://localhost:1099/jmxrmi/flowable

你可以在日志文件中找到确切的本地 URL。连接后,你可以看到标准的 JVM 统计信息和 MBean。你可以通过选择 MBean 选项卡并在右侧面板中选择"org.flowable.jmx.Mbeans"来查看 Flowable 特定的 MBean。通过选择任何 MBean,你可以查询信息或更改配置。这个快照展示了 jconsole 的外观:

不限于 jconsole 的任何 JMX 客户端都可以用来访问 MBean。大多数数据中心监控工具都有一些连接器,使它们能够连接到 JMX MBean。

### 属性和操作

以下是当前可用的属性和操作列表。根据需求,此列表可能在未来版本中扩展。

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>MBean</th>
<th>类型</th>
<th>名称</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>ProcessDefinitionsMBean</p></td>
<td><p>属性</p></td>
<td><p>processDefinitions</p></td>
<td><p>已部署流程定义的 Id、名称、版本、是否暂停等属性,以字符串列表的列表形式呈现</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>属性</p></td>
<td><p>deployments</p></td>
<td><p>当前部署的 Id、名称、租户 ID 属性</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>方法</p></td>
<td><p>getProcessDefinitionById(String id)</p></td>
<td><p>获取指定 id 的流程定义的 Id、名称、版本和是否暂停属性</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>方法</p></td>
<td><p>deleteDeployment(String id)</p></td>
<td><p>删除指定 Id 的部署</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>方法</p></td>
<td><p>suspendProcessDefinitionById(String id)</p></td>
<td><p>暂停指定 Id 的流程定义</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>方法</p></td>
<td><p>activatedProcessDefinitionById(String id)</p></td>
<td><p>激活指定 Id 的流程定义</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>方法</p></td>
<td><p>suspendProcessDefinitionByKey(String id)</p></td>
<td><p>暂停指定 key 的流程定义</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>方法</p></td>
<td><p>activatedProcessDefinitionByKey(String id)</p></td>
<td><p>激活指定 key 的流程定义</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>方法</p></td>
<td><p>deployProcessDefinition(String resourceName, String processDefinitionFile)</p></td>
<td><p>部署流程定义文件</p></td>
</tr>
<tr class="even">
<td><p>JobExecutorMBean</p></td>
<td><p>属性</p></td>
<td><p>isJobExecutorActivated</p></td>
<td><p>如果异步作业执行器已激活则返回 true,否则返回 false</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>方法</p></td>
<td><p>setJobExecutorActivate(Boolean active)</p></td>
<td><p>根据给定的布尔值激活和停用异步作业执行器</p></td>
</tr>
</tbody>
</table>

### 配置

JMX 使用默认配置以便于使用最常用的配置进行部署。但是更改默认配置很容易。你可以通过编程方式或通过配置文件来实现。以下代码片段展示了如何在配置文件中完成此操作:

    <bean id="processEngineConfiguration" class="...SomeProcessEngineConfigurationClass">
      ...
      <property name="configurators">
        <list>
          <bean class="org.flowable.management.jmx.JMXConfigurator">

            <property name="connectorPort" value="1912" />
            <property name="serviceUrlPath" value="/jmxrmi/flowable" />

            ...
          </bean>
        </list>
      </property>
    </bean>

下表显示了可以配置的参数及其默认值:

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>名称</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>disabled</p></td>
<td><p>false</p></td>
<td><p>如果设置,即使存在依赖项,JMX 也不会启动</p></td>
</tr>
<tr class="even">
<td><p>domain</p></td>
<td><p>org.flowable.jmx.Mbeans</p></td>
<td><p>MBean 的域</p></td>
</tr>
<tr class="odd">
<td><p>createConnector</p></td>
<td><p>true</p></td>
<td><p>如果为 true,则为已启动的 MbeanServer 创建连接器</p></td>
</tr>
<tr class="even">
<td><p>MBeanDomain</p></td>
<td><p>DefaultDomain</p></td>
<td><p>MBean 服务器的域</p></td>
</tr>
<tr class="odd">
<td><p>registryPort</p></td>
<td><p>1099</p></td>
<td><p>在服务 URL 中显示为注册端口</p></td>
</tr>
<tr class="even">
<td><p>serviceUrlPath</p></td>
<td><p>/jmxrmi/flowable</p></td>
<td><p>在服务 URL 中显示</p></td>
</tr>
<tr class="odd">
<td><p>connectorPort</p></td>
<td><p>-1</p></td>
<td><p>如果大于零,将在服务 URL 中显示为连接器端口</p></td>
</tr>
</tbody>
</table>

### JMX 服务 URL

JMX 服务 URL 的格式如下:

    service:jmx:rmi://<hostName>:<connectorPort>/jndi/rmi://<hostName>:<registryPort>/<serviceUrlPath>

hostName 将自动设置为机器的网络名称。
connectorPort、registryPort 和 serviceUrlPath 可以配置。

如果 connectionPort 小于零,服务 URL 的相应部分将被删除,并简化为:

    service:jmx:rmi:///jndi/rmi://:<hostname>:<registryPort>/<serviceUrlPath>

## Maven 原型

### 创建测试用例

在开发过程中,在实际应用中实现某个想法或功能之前,创建一个小型测试用例来测试它有时会很有帮助。
这有助于隔离测试主题。JUnit 测试用例也是传达错误报告和功能请求的首选工具。
将测试用例附加到错误报告或功能请求的 jira 问题上,可以大大减少其修复时间。

为了便于创建测试用例,提供了一个 maven 原型。通过使用这个原型,可以快速创建一个标准的测试用例。
该原型应该已经在标准仓库中可用。如果没有,你可以通过在 **tooling/archtypes** 文件夹中输入
**mvn install** 轻松地将其安装到本地 maven 仓库文件夹中。

以下命令创建单元测试项目:

    mvn archetype:generate \
    -DarchetypeGroupId=org.flowable \
    -DarchetypeArtifactId=flowable-archetype-unittest \
    -DarchetypeVersion=<current version> \
    -DgroupId=org.myGroup \
    -DartifactId=myArtifact

下表解释了每个参数的作用:

<table>
<caption>单元测试生成原型参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<tbody>
<tr class="odd">
<td><p>行号</p></td>
<td><p>参数</p></td>
<td><p>说明</p></td>
</tr>
<tr class="even">
<td><p>1</p></td>
<td><p>archetypeGroupId</p></td>
<td><p>原型的组 ID。应为 <strong>org.flowable</strong></p></td>
</tr>
<tr class="odd">
<td><p>2</p></td>
<td><p>archetypeArtifactId</p></td>
<td><p>原型的构件 ID。应为 <strong>flowable-archetype-unittest</strong></p></td>
</tr>
<tr class="even">
<td><p>3</p></td>
<td><p>archetypeVersion</p></td>
<td><p>生成的测试项目中使用的 Flowable 版本</p></td>
</tr>
<tr class="odd">
<td><p>4</p></td>
<td><p>groupId</p></td>
<td><p>生成的测试项目的组 ID</p></td>
</tr>
<tr class="even">
<td><p>5</p></td>
<td><p>artifactId</p></td>
<td><p>生成的测试项目的构件 ID</p></td>
</tr>
</tbody>
</table>

生成的项目的目录结构如下:

    .
    ├── pom.xml
    └── src
        └── test
            ├── java
            │   └── org
            │       └── myGroup
            │           └── MyUnitTest.java
            └── resources
                ├── flowable.cfg.xml
                ├── log4j.properties
                └── org
                    └── myGroup
                        └── my-process.bpmn20.xml

你可以修改 Java 单元测试用例及其对应的流程模型,或添加新的测试用例和流程模型。
如果你使用该项目来阐述一个 bug 或功能,测试用例最初应该失败。然后在修复了所需的 bug 或实现了所需的功能后,测试用例应该通过。
在发送项目之前,请确保通过输入 **mvn clean** 清理项目。
