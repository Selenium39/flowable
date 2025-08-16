---
id: ch02-GettingStarted
title: 入门指南
description: Flowable 入门指南：几分钟上手引擎与 REST API，涵盖安装、部署、流程启动与任务操作等基础。
keywords: Flowable, BPMN, 工作流, 流程引擎, 入门, 教程, REST API
---

## 什么是 Flowable?

Flowable 是一个用 Java 编写的轻量级业务流程引擎。Flowable 流程引擎允许你部署 BPMN 2.0 流程定义(一个用于定义流程的行业 XML 标准)、创建这些流程定义的流程实例、运行查询、访问活动或历史流程实例及相关数据,还有更多功能。本节将通过你可以在自己的开发机器上操作的示例,逐步介绍各种概念和 API。

当涉及到添加到你的应用程序/服务/架构中时,Flowable 极其灵活。你可以通过包含 Flowable 库(以 JAR 形式提供)来将引擎*嵌入*到你的应用程序或服务中。由于它是一个 JAR,你可以轻松地将其添加到任何 Java 环境中:Java SE、servlet 容器(如 Tomcat 或 Jetty)、Spring、Java EE 服务器(如 JBoss 或 WebSphere)等。
或者,你可以使用 Flowable REST API 通过 HTTP 进行通信。此外还有几个 Flowable 应用程序(Flowable Modeler、Flowable Admin、Flowable IDM 和 Flowable Task),它们提供开箱即用的示例 UI 来处理流程和任务。

所有设置 Flowable 的方式都有一个共同点,那就是核心引擎,它可以被视为一个服务集合,这些服务暴露 API 来管理和执行业务流程。
以下的各个教程首先介绍如何设置和使用这个核心引擎。后面的章节建立在前面章节获得的知识之上。

- [第一部分](#building-a-command-line-application)展示了如何以最简单的方式运行 Flowable:仅使用 Java SE 的常规 Java main。这里将解释许多核心概念和 API。

- [关于 Flowable REST API 的部分](#getting-started-with-the-flowable-rest-api)展示了如何通过 REST 运行和使用相同的 API。

- [关于 Flowable REST App 的部分](ch13-Applications.md)将指导你了解使用开箱即用的示例 Flowable REST 应用程序的基础知识。

## Flowable 和 Activiti

Flowable 是 Activiti(Alfresco 的注册商标)的一个分支。在接下来的所有章节中,你会注意到包名、配置文件等都使用 *flowable*。

## 构建命令行应用程序

### 创建流程引擎

在这第一个教程中,我们将构建一个简单的示例,展示如何创建 Flowable 流程引擎,介绍一些核心概念并展示如何使用 API。
截图显示的是 Eclipse,但任何 IDE 都可以。我们将使用 Maven 获取 Flowable 依赖项并管理构建,但同样,任何替代方案也可以(Gradle、Ivy 等)。

我们要构建的示例是一个简单的*休假申请*流程:

- *员工*申请一定天数的假期

- *经理*批准或拒绝请求 

- 我们将模拟在某个外部系统中注册请求,并向员工发送包含结果的电子邮件

首先,通过 *File → New → Other → Maven Project* 创建一个新的 Maven 项目

![getting.started.new.maven](assets/bpmn/getting.started.new.maven.png)

在下一个屏幕中,勾选 '*create a simple project (skip archetype selection)*'

![getting.started.new.maven2](assets/bpmn/getting.started.new.maven2.png)

并填写一些 *'Group Id'* 和 *'Artifact id'*:

![getting.started.new.maven3](assets/bpmn/getting.started.new.maven3.png)

现在我们有了一个空的 Maven 项目,我们将添加两个依赖项:

- Flowable 流程引擎,它将允许我们创建 ProcessEngine 对象并访问 Flowable API。

- 内存数据库 H2,因为 Flowable 引擎需要一个数据库来存储执行和历史数据。
请注意,H2 依赖项包含数据库*和*驱动程序。如果你使用其他数据库(例如 PostgresQL、MySQL 等),则需要添加特定的数据库驱动程序依赖项。

将以下内容添加到你的 *pom.xml* 文件中:

```xml
<dependencies>
  <dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-engine</artifactId>
    <version>7.0.0</version>
  </dependency>
  <dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>2.1.214</version>
  </dependency>
</dependencies>
```

如果依赖的 JAR 没有自动检索(虽然通常不需要),你可以右键单击项目并选择 '*Maven → Update Project*' 来强制手动刷新。
在项目的 '*Maven Dependencies*' 下,你现在应该看到 *flowable-engine* 和各种其他(传递)依赖项。

创建一个新的 Java 类并添加一个常规的 Java main 方法:

```java
package org.flowable;

public class HolidayRequest {

  public static void main(String[] args) {

  }

}
```

我们需要做的第一件事是实例化一个 **ProcessEngine** 实例。这是一个线程安全的对象,你通常只需要在应用程序中实例化一次。
*ProcessEngine* 是从 **ProcessEngineConfiguration** 实例创建的,它允许你配置和调整流程引擎的设置。通常,*ProcessEngineConfiguration* 是使用配置 XML 文件创建的,但(就像我们在这里做的那样)你也可以以编程方式创建它。*ProcessEngineConfiguration* 需要的最小配置是到数据库的 JDBC 连接:

```java
package org.flowable;

import org.flowable.engine.ProcessEngine;
import org.flowable.engine.ProcessEngineConfiguration;
import org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration;

public class HolidayRequest {

  public static void main(String[] args) {
    ProcessEngineConfiguration cfg = new StandaloneProcessEngineConfiguration()
      .setJdbcUrl("jdbc:h2:mem:flowable;DB_CLOSE_DELAY=-1")
      .setJdbcUsername("sa")
      .setJdbcPassword("")
      .setJdbcDriver("org.h2.Driver")
      .setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_TRUE);

    ProcessEngine processEngine = cfg.buildProcessEngine();
  }

}
```

在上面的代码中,第 10 行创建了一个*独立*配置对象。这里的*"独立"*指的是引擎是完全独立地创建和使用的(而不是,例如,在 Spring 环境中,在这种情况下你会使用 *SpringProcessEngineConfiguration* 类)。在第 11-14 行,传入了到内存中 H2 数据库实例的 JDBC 连接参数。
重要提示:请注意,这样的数据库在 JVM 重启后不会保存。如果你希望数据持久化,则需要切换到持久性数据库并相应地更改连接参数。
在第 15 行,我们将一个标志设置为 *true*,以确保如果由 JDBC 参数指向的数据库中不存在数据库架构,则创建该架构。
或者,Flowable 附带了一组 SQL 文件,可用于手动创建带有所有表的数据库架构。

然后使用此配置创建 **ProcessEngine** 对象(第 17 行)。

你现在可以运行它了。在 Eclipse 中最简单的方法是右键单击类文件并选择 *Run As → Java Application*:

![getting.started.run.main](assets/bpmn/getting.started.run.main.png)

应用程序运行没有问题,但是除了一条消息表明日志记录配置不正确外,控制台中没有显示任何有用的信息:

![getting.started.console.logging](assets/bpmn/getting.started.console.logging.png)

Flowable 在内部使用 [SLF4J](http://www.slf4j.org/) 作为其日志记录框架。对于此示例,我们将在 SLF4j 上使用 log4j 记录器,因此将以下依赖项添加到 pom.xml 文件中:

```xml
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-api</artifactId>
  <version>2.0.7</version>
</dependency>
<dependency>
  <groupId>org.slf4j</groupId>
  <artifactId>slf4j-log4j12</artifactId>
  <version>2.0.7</version>
</dependency>
```

Log4j 需要一个属性文件进行配置。在 *src/main/resources* 文件夹中添加一个带有以下内容的 *log4j.properties* 文件:

```properties
log4j.rootLogger=DEBUG, CA

log4j.appender.CA=org.apache.log4j.ConsoleAppender
log4j.appender.CA.layout=org.apache.log4j.PatternLayout
log4j.appender.CA.layout.ConversionPattern= %d{hh:mm:ss,SSS} [%t] %-5p %c %x - %m%n
```

重新运行应用程序。你现在应该看到有关引擎启动和在数据库中创建数据库架构的信息性日志记录:

![getting.started.console.logging2](assets/bpmn/getting.started.console.logging2.png)

我们现在已经启动了一个流程引擎并准备就绪。是时候给它一个流程了!

### 部署流程定义

我们要构建的流程是一个非常简单的休假申请流程。Flowable 引擎要求流程以 BPMN 2.0 格式定义,这是一个在行业中被广泛接受的 XML 标准。
在 Flowable 术语中,我们称之为**流程定义**。从*流程定义*中,可以启动许多**流程实例**。将*流程定义*视为许多流程执行的蓝图。在这个特定的例子中,*流程定义*定义了请假所涉及的不同步骤,而一个*流程实例*匹配一个特定员工的休假请求。

BPMN 2.0 以 XML 格式存储,但它也有可视化部分:它以标准方式定义了如何表示每种不同的步骤类型(人工任务、自动服务调用等)以及如何将这些不同的步骤相互连接。通过这种方式,BPMN 2.0 标准允许技术人员和业务人员以双方都能理解的方式交流业务流程。

我们要使用的流程定义如下:

![getting.started.bpmn.process](assets/bpmn/getting.started.bpmn.process.png)

这个流程应该很容易理解,但为了清楚起见,让我们描述一下不同的部分:

- 我们假设流程是通过提供一些信息来启动的,比如员工姓名、请假天数和描述。当然,这可以建模为流程中的第一个独立步骤。
但是,通过将其作为流程的"输入数据",只有在发出实际请求时才会创建流程实例。在替代情况下,用户可能会在提交前改变主意并取消,但现在流程实例将存在。
在某些场景中,这可能是有价值的信息(例如,有多少次请求被启动但未完成),这取决于业务目标。

- 左边的圆圈称为**开始事件**。它是流程实例的起点。

- 第一个矩形是**用户任务**。这是流程中需要人类用户执行的步骤。在这种情况下,经理需要批准或拒绝请求。

- 根据经理的决定,**排他网关**(带有十字的菱形)将根据流程实例路由到批准或拒绝路径。

- 如果批准,我们必须在某个外部系统中注册请求,然后是另一个用户任务,通知原始员工决定。
当然,这可以替换为电子邮件。

- 如果被拒绝,会向员工发送一封电子邮件通知他们这一点。

通常,这样的*流程定义*是使用可视化建模工具建模的,例如 Flowable Designer(Eclipse)或 Flowable Modeler(Web 应用程序)。

然而,在这里,我们将直接编写 XML 以熟悉 BPMN 2.0 及其概念。

下面是与上图对应的 BPMN 2.0 XML。请注意,这只是"流程部分"。如果你使用图形建模工具,底层 XML 文件还包含"可视化"部分,该部分描述了图形信息,例如流程定义的各个元素的坐标(所有图形信息都包含在 XML 中的 *BPMNDiagram* 标签中,它是 *definitions* 标签的子元素)。

将以下 XML 保存在 *src/main/resources* 文件夹中名为 *holiday-request.bpmn20.xml* 的文件中。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:flowable="http://flowable.org/bpmn"
  typeLanguage="http://www.w3.org/2001/XMLSchema"
  expressionLanguage="http://www.w3.org/1999/XPath"
  targetNamespace="http://www.flowable.org/processdef">

  <process id="holidayRequest" name="Holiday Request" isExecutable="true">

    <startEvent id="startEvent"/>
    <sequenceFlow sourceRef="startEvent" targetRef="approveTask"/>

    <userTask id="approveTask" name="Approve or reject request"/>
    <sequenceFlow sourceRef="approveTask" targetRef="decision"/>

    <exclusiveGateway id="decision"/>
    <sequenceFlow sourceRef="decision" targetRef="externalSystemCall">
      <conditionExpression xsi:type="tFormalExpression">
        <![CDATA[
          ${approved}
        ]]>
      </conditionExpression>
    </sequenceFlow>
    <sequenceFlow  sourceRef="decision" targetRef="sendRejectionMail">
      <conditionExpression xsi:type="tFormalExpression">
        <![CDATA[
          ${!approved}
        ]]>
      </conditionExpression>
    </sequenceFlow>

    <serviceTask id="externalSystemCall" name="Enter holidays in external system"
        flowable:class="org.flowable.CallExternalSystemDelegate"/>
    <sequenceFlow sourceRef="externalSystemCall" targetRef="holidayApprovedTask"/>

    <userTask id="holidayApprovedTask" name="Holiday approved"/>
    <sequenceFlow sourceRef="holidayApprovedTask" targetRef="approveEnd"/>

    <serviceTask id="sendRejectionMail" name="Send out rejection email"
        flowable:class="org.flowable.SendRejectionMail"/>
    <sequenceFlow sourceRef="sendRejectionMail" targetRef="rejectEnd"/>

    <endEvent id="approveEnd"/>

    <endEvent id="rejectEnd"/>

  </process>

</definitions>
```

第 2-11 行看起来有点吓人,但它与你在几乎每个流程定义中看到的内容相同。这是一种*样板*内容,需要它来完全兼容 BPMN 2.0 标准规范。

每个步骤(在 BPMN 2.0 术语中称为**"活动"**)都有一个 *id* 属性,为其在 XML 文件中提供唯一标识符。所有*活动*也可以有一个可选的名称,这当然会增加可视化图表的可读性。

*活动*通过**序列流**连接,在可视化图表中是一个有向箭头。在执行流程实例时,执行将从*开始事件*流向下一个*活动*,遵循*序列流*。

离开*排他网关*(带有 X 的菱形)的*序列流*明显很特殊:它们都有一个以*表达式*形式定义的*条件*(见第 25 和 32 行)。当流程实例执行到达这个*网关*时,将评估这些*条件*,并采用第一个解析为*true*的条件。这就是这里*排他*的含义:只选择一个。如果需要不同的路由行为,当然可以使用其他类型的网关。

这里写为*表达式*的条件形式为 *${approved}*,这是 *${approved == true}* 的简写。变量 'approved' 被称为**流程变量**。*流程变量*是与流程实例一起存储的持久数据,可以在流程实例的生命周期内使用。在这种情况下,这确实意味着我们将必须在流程实例中的某个时刻(当经理用户任务被提交时,或者用 Flowable 术语说,*完成*时)设置这个*流程变量*,因为这不是流程实例启动时可用的数据。

现在我们有了流程 BPMN 2.0 XML 文件,接下来需要将其**'部署'**到引擎。*部署*流程定义意味着:

- 流程引擎将 XML 文件存储在数据库中,以便在需要时可以检索它

- 流程定义被解析为内部的、可执行的对象模型,以便可以从中启动*流程实例*。

要将流程定义*部署*到 Flowable 引擎,使用 *RepositoryService*,它可以从 *ProcessEngine* 对象获取。使用 *RepositoryService*,通过传递 XML 文件的位置并调用 *deploy()* 方法来实际执行它,从而创建新的 *Deployment*:

```java
RepositoryService repositoryService = processEngine.getRepositoryService();
Deployment deployment = repositoryService.createDeployment()
  .addClasspathResource("holiday-request.bpmn20.xml")
  .deploy();
```

我们现在可以通过 API 查询来验证流程定义是否被引擎知晓(并了解一些关于 API 的知识)。这是通过 *RepositoryService* 创建新的 *ProcessDefinitionQuery* 对象来完成的。

```java
ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery()
  .deploymentId(deployment.getId())
  .singleResult();
System.out.println("Found process definition : " + processDefinition.getName());
```

### 启动流程实例

我们现在已经将流程定义*部署*到流程引擎,因此可以使用这个*流程定义*作为"蓝图"来启动*流程实例*。

要启动流程实例,我们需要提供一些初始的*流程变量*。通常,你会通过呈现给用户的表单或通过 REST API(当流程由某些自动化触发时)获取这些数据。在这个例子中,我们将保持简单,使用 java.util.Scanner 类在命令行上简单输入一些数据:

```java
Scanner scanner= new Scanner(System.in);

System.out.println("Who are you?");
String employee = scanner.nextLine();

System.out.println("How many holidays do you want to request?");
Integer nrOfHolidays = Integer.valueOf(scanner.nextLine());

System.out.println("Why do you need them?");
String description = scanner.nextLine();
```

接下来,我们可以通过 *RuntimeService* 启动一个*流程实例*。收集的数据作为 *java.util.Map* 实例传递,其中键是稍后用于检索变量的标识符。使用*键*启动流程实例。这个*键*匹配在 BPMN 2.0 XML 文件中设置的 *id* 属性,在本例中是 *holidayRequest*。

(注意:你稍后会了解到启动流程实例有很多方法,不仅仅是使用键)

```xml
<process id="holidayRequest" name="Holiday Request" isExecutable="true">
```

```java
RuntimeService runtimeService = processEngine.getRuntimeService();

Map<String, Object> variables = new HashMap<String, Object>();
variables.put("employee", employee);
variables.put("nrOfHolidays", nrOfHolidays);
variables.put("description", description);
ProcessInstance processInstance =
  runtimeService.startProcessInstanceByKey("holidayRequest", variables);
```

当流程实例启动时,将创建一个**执行**并放入开始事件中。从那里,这个*执行*沿着序列流到达经理审批的用户任务,并执行用户任务行为。这个行为将在数据库中创建一个任务,稍后可以通过查询找到。用户任务是一个*等待状态*,引擎将停止执行任何进一步的操作,返回 API 调用。

### 题外话: 事务性

在 Flowable 中,数据库事务在保证数据一致性和解决并发问题方面起着关键作用。当你进行 Flowable API 调用时,默认情况下,所有操作都是同步的,并且属于同一个事务。这意味着,当方法调用返回时,事务将被启动并提交。

当启动流程实例时,从流程实例的开始到下一个*等待状态*将有**一个数据库事务**。在这个例子中,这是第一个用户任务。当引擎到达这个用户任务时,状态被持久化到数据库中,事务被提交,API 调用返回。

在 Flowable 中,当继续一个流程实例时,将始终有一个数据库事务从前一个*等待状态*到下一个*等待状态*。一旦持久化,数据可以在数据库中保存很长时间,如果需要的话甚至可以保存数年,直到执行 API 调用使流程实例继续前进。请注意,当流程实例处于这样的等待状态时,等待下一个 API 调用,不会消耗任何计算或内存资源。

在这个例子中,当第一个用户任务完成时,将使用一个数据库事务从用户任务通过排他网关(自动逻辑)到达第二个用户任务。或者通过另一条路径直接到达结束。

### 查询和完成任务

在更现实的应用程序中,会有一个用户界面,员工和经理可以登录并查看他们的任务列表。通过这些列表,他们可以检查存储为*流程变量*的流程实例数据,并决定他们想对任务做什么。在这个例子中,我们将通过执行 API 调用来模拟任务列表,这些 API 调用通常会位于驱动 UI 的服务调用背后。

我们还没有为用户任务配置分配。我们希望第一个任务分配给"managers"组,第二个用户任务分配给原始的假期申请人。要做到这一点,在第一个任务中添加 *candidateGroups* 属性:

```xml
<userTask id="approveTask" name="Approve or reject request" flowable:candidateGroups="managers"/>
```

并在第二个任务中添加 *assignee* 属性,如下所示。请注意,我们这里没有使用像上面"managers"那样的静态值,而是使用基于流程变量的动态分配,这个流程变量是我们在启动流程实例时传递的:

```xml
<userTask id="holidayApprovedTask" name="Holiday approved" flowable:assignee="${employee}"/>
```

要获取实际的任务列表,我们通过 *TaskService* 创建一个 *TaskQuery*,并配置查询仅返回"managers"组的任务:

```java
TaskService taskService = processEngine.getTaskService();
List<Task> tasks = taskService.createTaskQuery().taskCandidateGroup("managers").list();
System.out.println("You have " + tasks.size() + " tasks:");
for (int i=0; i<tasks.size(); i++) {
  System.out.println((i+1) + ") " + tasks.get(i).getName());
}
```

使用任务标识符,我们现在可以获取特定的流程实例变量并在屏幕上显示实际请求:

```java
System.out.println("Which task would you like to complete?");
int taskIndex = Integer.valueOf(scanner.nextLine());
Task task = tasks.get(taskIndex - 1);
Map<String, Object> processVariables = taskService.getVariables(task.getId());
System.out.println(processVariables.get("employee") + " wants " +
    processVariables.get("nrOfHolidays") + " of holidays. Do you approve this?");
```

如果你运行这个,它应该看起来像这样:

![getting.started.console.logging3](assets/bpmn/getting.started.console.logging3.png)

经理现在可以**完成任务**了。在现实中,这通常意味着用户提交了一个表单。然后表单中的数据作为*流程变量*传递。在这里,我们将通过在完成任务时传递一个带有"approved"变量的 map 来模拟这一点(名称很重要,因为它稍后会在序列流的条件中使用!):

```java
boolean approved = scanner.nextLine().toLowerCase().equals("y");
variables = new HashMap<String, Object>();
variables.put("approved", approved);
taskService.complete(task.getId(), variables);
```

任务现在已完成,基于"approved"流程变量选择了离开排他网关的两条路径之一。

### 编写 JavaDelegate

拼图中还缺少最后一块:我们还没有实现当请求被批准时将执行的自动逻辑。在 BPMN 2.0 XML 中,这是一个**服务任务**,它看起来像上面这样:

```xml
<serviceTask id="externalSystemCall" name="Enter holidays in external system"
    flowable:class="org.flowable.CallExternalSystemDelegate"/>
```

在现实中,这个逻辑可以是任何东西,从使用 HTTP REST 调用服务,到执行对组织使用了几十年的系统的遗留代码调用。我们这里不会实现实际的逻辑,而只是简单地记录*处理*。

创建一个新类(*File → New → Class* in Eclipse),填写 *org.flowable* 作为包名和 *CallExternalSystemDelegate* 作为类名。让该类实现 *org.flowable.engine.delegate.JavaDelegate* 接口并实现 *execute* 方法:

```java
package org.flowable;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;

public class CallExternalSystemDelegate implements JavaDelegate {

    public void execute(DelegateExecution execution) {
        System.out.println("Calling the external system for employee "
            + execution.getVariable("employee"));
    }

}
```

当*执行*到达*服务任务*时,BPMN 2.0 XML 中引用的类将被实例化并调用。

现在运行示例,日志消息显示出来,证明确实执行了自定义逻辑:

![getting.started.console.logging4](assets/bpmn/getting.started.console.logging4.png)

### 使用历史数据

选择使用 Flowable 这样的流程引擎的众多原因之一是,它会自动为所有流程实例存储**审计数据**或**历史数据**。这些数据允许创建丰富的报告,这些报告可以洞察组织的工作方式,瓶颈在哪里等。

例如,假设我们想要显示我们到目前为止一直在执行的流程实例的持续时间。为此,我们从 *ProcessEngine* 获取 *HistoryService* 并创建一个*历史活动*查询。在下面的代码片段中,你可以看到我们添加了一些额外的过滤:

- 仅查询特定流程实例的活动

- 仅查询已完成的活动

结果也按结束时间排序,这意味着我们将按执行顺序获取它们。

```java
HistoryService historyService = processEngine.getHistoryService();
List<HistoricActivityInstance> activities =
  historyService.createHistoricActivityInstanceQuery()
   .processInstanceId(processInstance.getId())
   .finished()
   .orderByHistoricActivityInstanceEndTime().asc()
   .list();

for (HistoricActivityInstance activity : activities) {
  System.out.println(activity.getActivityId() + " took "
    + activity.getDurationInMillis() + " milliseconds");
}
```

再次运行示例,我们现在在控制台中看到类似这样的内容:

```
startEvent took 1 milliseconds
approveTask took 2638 milliseconds
decision took 3 milliseconds
externalSystemCall took 1 milliseconds
```

### 总结

本教程介绍了各种 Flowable 和 BPMN 2.0 的概念和术语,同时也演示了如何以编程方式使用 Flowable API。

当然,这只是旅程的开始。接下来的章节将深入探讨 Flowable 引擎支持的许多选项和功能。其他章节将介绍设置和使用 Flowable 引擎的各种方式,并详细描述所有可能的 BPMN 2.0 构造。

## 开始使用 Flowable REST API

本节展示与[前一节](#building-a-command-line-application)相同的示例:部署流程定义、启动流程实例、获取任务列表和完成任务。如果你还没有阅读该部分,建议浏览一下以了解其中的内容。

这次使用的是 Flowable REST API 而不是 Java API。你很快就会注意到 REST API 与 Java API 非常匹配,了解其中一个就自动意味着你可以在另一个中找到方向。

要获取 Flowable REST API 的完整详细概述,请查看 [REST API 章节](bpmn/ch14-REST.md#rest-api)。

### 设置 REST 应用程序

当你从 flowable.org 网站下载 .zip 文件时,可以在 *wars* 文件夹中找到 REST 应用程序。你需要一个 servlet 容器,如 [Tomcat](http://tomcat.apache.org//)、[Jetty](http://www.eclipse.org/jetty//) 等,来运行 WAR 文件。

>注意: flowable-rest.war 基于 Spring Boot,这意味着它支持 Spring Boot 支持的 Tomcat / Jetty servlet 容器。

使用 Tomcat 时,步骤如下:

- 下载并解压最新的 Tomcat zip 文件(从 Tomcat 网站选择"Core"发行版)。

- 将 flowable-rest.war 文件从解压的 Flowable 发行版的 *wars* 文件夹复制到解压的 Tomcat 文件夹的 *webapps* 文件夹中。

- 在命令行中,进入 Tomcat 文件夹的 *bin* 文件夹。

- 执行 '*./catalina run*' 启动 Tomcat 服务器。

在服务器启动期间,你会注意到一些 Flowable 日志消息。最后,类似 '*INFO \[main\] org.apache.catalina.startup.Catalina.start Server startup in xyz ms*' 的消息表示服务器已准备好接收请求。请注意,默认情况下使用内存中的 H2 数据库实例,这意味着数据在服务器重启后不会保留。

在接下来的部分中,我们将使用 cURL 来演示各种 REST 调用。所有 REST 调用默认都受*基本认证*保护。在所有调用中都使用"rest-admin"用户,密码为"test"。

启动后,通过执行以下命令验证应用程序是否正在运行

```bash
curl --user rest-admin:test http://localhost:8080/flowable-rest/service/management/engine
```

如果你收到正确的 json 响应,说明 REST API 已启动并运行。

### 部署流程定义

第一步是部署流程定义。使用 REST API,这是通过上传 .bpmn20.xml 文件(或 .zip 文件用于多个流程定义)作为"multipart/formdata"来完成的:

```bash
curl --user rest-admin:test  -X POST -F "file=@holiday-request.bpmn20.xml" http://localhost:8080/flowable-rest/service/repository/deployments
```

要验证流程定义是否正确部署,可以请求流程定义列表:

```bash
curl --user rest-admin:test http://localhost:8080/flowable-rest/service/repository/process-definitions
```

这将返回当前部署到引擎的所有流程定义的列表。

### 启动流程实例

通过 REST API 启动流程实例与通过 Java API 进行相同操作类似:提供一个*键*来标识要使用的流程定义,以及一个初始流程变量的 map:

```bash
curl --user rest-admin:test -H "Content-Type: application/json" -X POST -d '{ "processDefinitionKey":"holidayRequest", "variables": [ { "name":"employee", "value": "John Doe" }, { "name":"nrOfHolidays", "value": 7 }]}' http://localhost:8080/flowable-rest/service/runtime/process-instances
```

这将返回类似的内容

```json
{"id":"43","url":"http://localhost:8080/flowable-rest/service/runtime/process-instances/43","businessKey":null,"suspended":false,"ended":false,"processDefinitionId":"holidayRequest:1:42","processDefinitionUrl":"http://localhost:8080/flowable-rest/service/repository/process-definitions/holidayRequest:1:42","activityId":null,"variables":[],"tenantId":"","completed":false}
```

### 任务列表和完成任务

当流程实例启动时,第一个任务被分配给"managers"组。要获取该组的所有任务,可以通过 REST API 进行任务查询:

```bash
curl --user rest-admin:test -H "Content-Type: application/json" -X POST -d '{ "candidateGroup" : "managers" }' http://localhost:8080/flowable-rest/service/query/tasks
```

这将返回"managers"组的所有任务列表

现在可以使用以下命令完成这样的任务:

```bash
curl --user rest-admin:test -H "Content-Type: application/json" -X POST -d '{ "action" : "complete", "variables" : [ { "name" : "approved", "value" : true} ]  }' http://localhost:8080/flowable-rest/service/runtime/tasks/25
```

但是,你很可能会收到一个错误,如:

```json
{"message":"Internal server error","exception":"couldn't instantiate class org.flowable.CallExternalSystemDelegate"}
```

这意味着引擎找不到在服务任务中引用的 *CallExternalSystemDelegate* 类。要解决这个问题,需要将该类放在应用程序的类路径中(这将需要重启)。按照[本节](bpmn/ch02-GettingStarted.md#writing-a-javadelegate)中的描述创建该类,将其打包为 JAR,并放在 Tomcat 的 *webapps* 文件夹下的 flowable-rest 文件夹中的 *WEB-INF/lib* 文件夹中。