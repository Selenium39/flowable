---
id: ch07a-BPMN-Introduction
title: BPMN 2.0 简介
description: 本文档详细介绍BPMN 2.0标准及其在Flowable中的应用，包含流程定义基础、XML文件创建指南和10分钟快速入门教程，适合流程引擎开发者学习使用。
keywords: BPMN 2.0,Flowable,流程建模,业务流程管理,XML流程定义,工作流引擎,流程部署,Eclipse集成
---

## 什么是 BPMN?

BPMN 是一个被广泛接受和支持的流程表示标准符号 [OMG BPMN Standard](http://www.bpmn.org/)。

## 定义流程

> **注意**
>
> 本介绍假设你使用 [Eclipse IDE](http://eclipse.org/) 来创建和编辑文件。但其实很少有内容是 Eclipse 特有的,你可以使用任何其他工具来创建包含 BPMN 2.0 的 XML 文件。

创建一个新的 XML 文件(*右键点击任意项目并选择 New→Other→XML-XML File*)并为其命名。确保文件**以 .bpmn20.xml 或 .bpmn 结尾**,否则引擎将无法部署它。

![new.bpmn.procdef](assets/bpmn/new.bpmn.procdef.png)

BPMN 2.0 schema 的根元素是 definitions 元素。在这个元素中,可以定义多个流程定义(尽管我们建议每个文件只包含一个流程定义,因为这样可以简化后期的开发维护)。一个空的流程定义如下所示。注意最小的 definitions 元素只需要 xmlns 和 targetNamespace 声明。targetNamespace 可以是任意值,用于对流程定义进行分类。

    <definitions
      xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:flowable="http://flowable.org/bpmn"
      targetNamespace="Examples">

      <process id="myProcess" name="My First Process">
        ..
      </process>

    </definitions>

可选地,你也可以添加 BPMN 2.0 XML schema 的在线 schema 位置,作为 Eclipse 中 XML catalog 配置的替代方案。

    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL
                        http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd

process 元素有两个属性:

- **id**: 这个属性是**必需的**,它映射到 Flowable ProcessDefinition 对象的 **key** 属性。这个 id 可以用于通过 RuntimeService 的 startProcessInstanceByKey 方法启动流程定义的新实例。这个方法将始终使用流程定义的**最新部署版本**。

<!-- -->

    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("myProcess");

- 需要注意的是,这与调用 startProcessInstanceById 方法不同,后者需要 Flowable 引擎在部署时生成的字符串 ID(可以通过调用 processDefinition.getId() 方法获取)。生成的 ID 格式为 **'key:version'**,长度**限制为 64 个字符**。如果你收到 FlowableException 提示生成的 ID 太长,请限制流程的 *key* 字段中的文本长度。

- **name**: 这个属性是**可选的**,它映射到 ProcessDefinition 的 *name* 属性。引擎本身不使用这个属性,因此它可以用于在用户界面中显示更友好的名称。

## 入门: 10 分钟教程

在本节中,我们将介绍一个非常简单的业务流程,用它来介绍一些基本的 Flowable 概念和 Flowable API。

### 前提条件

本教程假设你已经运行了 Flowable demo 设置,并且你正在使用独立的 H2 服务器。编辑 db.properties 并设置 jdbc.url=jdbc:h2:tcp://localhost/flowable,然后根据 [H2 的文档](http://www.h2database.com/html/tutorial.html#using_server) 运行独立服务器。

### 目标

本教程的目标是学习 Flowable 和一些基本的 BPMN 2.0 概念。最终结果将是一个简单的 Java SE 程序,它部署一个流程定义,然后通过 Flowable 引擎 API 与这个流程交互。我们还会涉及一些 Flowable 相关的工具。当然,你在本教程中学到的内容也可以用于构建围绕业务流程的 Web 应用程序。

### 用例

用例很简单:我们有一家公司,让我们称之为 BPMCorp。在 BPMCorp 中,需要每月为公司股东编写一份财务报告。这是会计部门的责任。当报告完成后,高层管理人员中的一位需要在报告发送给所有股东之前批准该文档。

### 流程图

上述业务流程可以使用 [Flowable Designer](bpmn/ch13-Designer.md#eclipse-designer) 以图形方式定义。但是,对于本教程,我们将自己编写 XML,因为在这个阶段这样做可以学到最多东西。我们的流程的图形化 BPMN 2.0 表示如下所示:

![financial.report.example.diagram](assets/bpmn/financial.report.example.diagram.png)

我们看到的是一个 [none Start Event](bpmn/ch07b-BPMN-Constructs.md#None-start-event) (左侧的圆圈),后面是两个 [User Tasks](bpmn/ch07b-BPMN-Constructs.md#user-task): *'Write monthly financial report'* 和 *'Verify monthly financial report'*,最后以一个 [none end event](bpmn/ch07b-BPMN-Constructs.md#None-end-event) (右侧带粗边框的圆圈)结束。

### XML 表示

这个业务流程的 XML 版本(*FinancialReportProcess.bpmn20.xml*)如下所示。很容易识别出我们流程的主要元素(点击链接可以跳转到该 BPMN 2.0 构造的详细部分):

- [(none) start event](bpmn/ch07b-BPMN-Constructs.md#None-start-event) 告诉我们流程的*入口点*在哪里。

- [User Tasks](bpmn/ch07b-BPMN-Constructs.md#user-task) 声明是我们流程中人工任务的表示。注意第一个任务分配给了 *accountancy* 组,而第二个任务分配给了 *management* 组。有关如何将用户和组分配给用户任务的更多信息,请参见[用户任务分配部分](bpmn/ch07b-BPMN-Constructs.md#user-assignment)。

- 当到达 [none end event](bpmn/ch07b-BPMN-Constructs.md#None-end-event) 时,流程结束。

- 元素之间通过 [sequence flows](bpmn/ch07b-BPMN-Constructs.md#sequence-flow) 连接。这些序列流有源和目标,定义了序列流的*方向*。

<!-- -->

    <definitions id="definitions"
      targetNamespace="http://flowable.org/bpmn20"
      xmlns:flowable="http://flowable.org/bpmn"
      xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">

        <process id="financialReport" name="Monthly financial report reminder process">

          <startEvent id="theStart" />

          <sequenceFlow id="flow1" sourceRef="theStart" targetRef="writeReportTask" />

          <userTask id="writeReportTask" name="Write monthly financial report" >
            <documentation>
              Write monthly financial report for publication to shareholders.
            </documentation>
            <potentialOwner>
              <resourceAssignmentExpression>
                <formalExpression>accountancy</formalExpression>
              </resourceAssignmentExpression>
            </potentialOwner>
          </userTask>

          <sequenceFlow id="flow2" sourceRef="writeReportTask" targetRef="verifyReportTask" />

          <userTask id="verifyReportTask" name="Verify monthly financial report" >
            <documentation>
              Verify monthly financial report composed by the accountancy department.
              This financial report is going to be sent to all the company shareholders.
            </documentation>
            <potentialOwner>
              <resourceAssignmentExpression>
                <formalExpression>management</formalExpression>
              </resourceAssignmentExpression>
            </potentialOwner>
          </userTask>

          <sequenceFlow id="flow3" sourceRef="verifyReportTask" targetRef="theEnd" />

          <endEvent id="theEnd" />

        </process>

    </definitions>

### 启动流程实例

我们现在已经为我们的业务流程创建了**流程定义**。从这样的流程定义中,我们可以创建**流程实例**。在这个场景中,一个流程实例对应于某个特定月份的单个财务报告的创建和验证。任何月份的所有流程实例都共享相同的流程定义。

要能够从给定的流程定义创建流程实例,我们必须首先**部署**流程定义。部署流程定义意味着两件事:

- 流程定义将被存储在为你的 Flowable 引擎配置的持久性数据存储中。通过部署我们的业务流程,我们确保引擎在重启后能找到流程定义。

- BPMN 2.0 流程 XML 将被解析为内存中的对象模型,可以通过 Flowable API 进行操作。

关于部署的更多信息可以在[部署专门章节](bpmn/ch06-Deployment.md#deployment)中找到。

如该章节所述,部署可以通过多种方式进行。其中一种方式是通过 API,如下所示。注意所有与 Flowable 引擎的交互都是通过其*服务*进行的。

    Deployment deployment = repositoryService.createDeployment()
      .addClasspathResource("FinancialReportProcess.bpmn20.xml")
      .deploy();

现在我们可以使用在流程定义中定义的 id 启动新的流程实例(参见 XML 中的 process 元素)。注意在 Flowable 术语中这个 id 被称为**key**。

    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("financialReport");

这将创建一个首先经过开始事件的流程实例。在开始事件之后,它遵循所有出去的序列流(在这种情况下只有一个)并到达第一个任务('write monthly financial report')。Flowable 引擎现在将在持久性数据库中存储一个任务。此时,附加到任务的用户或组分配也被解析并存储在数据库中。重要的是要注意 Flowable 引擎将继续执行流程步骤,直到达到*等待状态*,比如用户任务。在这样的等待状态下,流程实例的当前状态被存储在数据库中。它保持在该状态,直到用户决定完成他们的任务。此时,引擎将继续执行,直到达到新的等待状态或流程结束。如果引擎在此期间重启或崩溃,流程的状态在数据库中是安全和可靠的。

在创建任务之后,startProcessInstanceByKey 方法将返回,因为用户任务活动是一个*等待状态*。在我们的场景中,任务被分配给一个组,这意味着该组的每个成员都是执行该任务的**候选人**。

我们现在可以把这些都组合在一起,创建一个简单的 Java 程序。创建一个新的 Eclipse 项目并将 Flowable JAR 包和依赖项添加到其类路径中(这些可以在 Flowable 发行版的 *libs* 文件夹中找到)。在我们可以调用 Flowable 服务之前,我们必须首先构建一个 ProcessEngine,它给我们提供对服务的访问。这里我们使用 *'standalone'* 配置,它构建一个使用 demo 设置中使用的相同数据库的 ProcessEngine。

你可以在[这里](assets/bpmn/FinancialReportProcess.bpmn20.xml)下载流程定义 XML。这个文件包含上面显示的 XML,但也包含必要的 BPMN [图表交换信息](bpmn/ch06-Deployment.md#generating-a-process-diagram),以在 Flowable 工具中可视化流程。

    public static void main(String[] args) {

      // 创建 Flowable 流程引擎
      ProcessEngine processEngine = ProcessEngineConfiguration
        .createStandaloneProcessEngineConfiguration()
        .buildProcessEngine();

      // 获取 Flowable 服务
      RepositoryService repositoryService = processEngine.getRepositoryService();
      RuntimeService runtimeService = processEngine.getRuntimeService();

      // 部署流程定义
      repositoryService.createDeployment()
        .addClasspathResource("FinancialReportProcess.bpmn20.xml")
        .deploy();

      // 启动一个流程实例
      runtimeService.startProcessInstanceByKey("financialReport");
    }

### 任务列表

我们现在可以通过添加以下逻辑,使用 TaskService 检索这个任务:

    List<Task> tasks = taskService.createTaskQuery().taskCandidateUser("kermit").list();

注意我们传递给这个操作的用户需要是 *accountancy* 组的成员,因为这在流程定义中已经声明:

    <potentialOwner>
      <resourceAssignmentExpression>
        <formalExpression>accountancy</formalExpression>
      </resourceAssignmentExpression>
    </potentialOwner>

我们也可以使用任务查询 API,通过组名获得相同的结果。我们现在可以在代码中添加以下逻辑:

    TaskService taskService = processEngine.getTaskService();
    List<Task> tasks = taskService.createTaskQuery().taskCandidateGroup("accountancy").list();

由于我们已经配置了 ProcessEngine 使用与 demo 设置相同的数据库,我们现在可以登录 [Flowable IDM](http://localhost:8080/flowable-idm/)。以 admin/test 身份登录并创建 2 个新用户 *kermit* 和 *fozzie*,并给他们两个都授予*访问工作流应用程序*的权限。然后创建 2 个名为 *accountancy* 和 *management* 的新组织组,将 fozzie 添加到新的 accountancy 组,将 kermit 添加到 management 组。
现在使用 fozzie 登录 [Flowable task](http://localhost:8080/flowable-task/) 应用程序,我们会发现可以通过选择 Task App,然后选择其 *Processes* 页面并选择 *'Monthly financial report'* 流程来启动我们的业务流程。

![bpmn.financial.report.example.start.process](assets/bpmn/bpmn.financial.report.example.start.process.png)

如前所述,流程将执行直到到达第一个用户任务。由于我们以 fozzie 身份登录,我们可以看到在启动流程实例后,有一个新的候选任务可供他使用。选择 *Tasks* 页面查看这个新任务。注意,即使流程是由其他人启动的,该任务仍然会作为候选任务对 accountancy 组中的所有人可见。

![bpmn.financial.report.example.task.assigned](assets/bpmn/bpmn.financial.report.example.task.assigned.png)

### 认领任务

会计现在需要**认领任务**。通过认领任务,该特定用户将成为任务的**受理人**,并且该任务将从 accountancy 组其他成员的任务列表中消失。以编程方式认领任务如下:

    taskService.claim(task.getId(), "fozzie");

该任务现在在**认领任务的用户的个人任务列表**中。

    List<Task> tasks = taskService.createTaskQuery().taskAssignee("fozzie").list();

在 Flowable Task 应用程序中,点击 *claim* 按钮将调用相同的操作。任务现在将移动到登录用户的个人任务列表中。你还会看到任务的受理人已更改为当前登录的用户。

![bpmn.financial.report.example.claim.task](assets/bpmn/bpmn.financial.report.example.claim.task.png)

### 完成任务

会计现在可以开始处理财务报告。一旦报告完成,他可以**完成任务**,这意味着该任务的所有工作都已完成。

    taskService.complete(task.getId());

对于 Flowable 引擎来说,这是一个外部信号,表明流程实例执行现在可以继续。任务本身从运行时数据中删除。遵循任务的单个出站转换,将执行移动到第二个任务(*'验证报告'*)。现在将使用与第一个任务相同的机制来分配第二个任务,只是任务将分配给 *management* 组这一小区别。

在 demo 设置中,通过点击任务列表中的 *complete* 按钮来完成任务。由于 Fozzie 不是会计,我们需要退出 Flowable Task 应用程序并以 *kermit*(他是一个管理者)的身份登录。第二个任务现在在未分配的任务列表中可见。

### 结束流程

验证任务可以用与之前完全相同的方式检索和认领。完成这第二个任务将使流程执行移动到结束事件,从而结束流程实例。流程实例和所有相关的运行时执行数据都从数据存储中删除。

以编程方式,你也可以使用 historyService 验证流程是否已结束

    HistoryService historyService = processEngine.getHistoryService();
    HistoricProcessInstance historicProcessInstance =
    historyService.createHistoricProcessInstanceQuery().processInstanceId(procId).singleResult();
    System.out.println("Process instance end time: " + historicProcessInstance.getEndTime());

### 代码概览

将前面章节的所有代码片段组合在一起,你应该得到如下所示的代码。这段代码考虑到你可能已经通过 Flowable 应用程序 UI 启动了几个流程实例。它检索任务列表而不是单个任务,所以它总是有效:

    public class TenMinuteTutorial {

      public static void main(String[] args) {

        // 创建 Flowable 流程引擎
        ProcessEngine processEngine = ProcessEngineConfiguration
          .createStandaloneProcessEngineConfiguration()
          .buildProcessEngine();

        // 获取 Flowable 服务
        RepositoryService repositoryService = processEngine.getRepositoryService();
        RuntimeService runtimeService = processEngine.getRuntimeService();

        // 部署流程定义
        repositoryService.createDeployment()
          .addClasspathResource("FinancialReportProcess.bpmn20.xml")
          .deploy();

        // 启动一个流程实例
        String procId = runtimeService.startProcessInstanceByKey("financialReport").getId();

        // 获取第一个任务
        TaskService taskService = processEngine.getTaskService();
        List<Task> tasks = taskService.createTaskQuery().taskCandidateGroup("accountancy").list();
        for (Task task : tasks) {
          System.out.println("Following task is available for accountancy group: " + task.getName());

          // 认领任务
          taskService.claim(task.getId(), "fozzie");
        }

        // 验证 Fozzie 现在可以检索任务
        tasks = taskService.createTaskQuery().taskAssignee("fozzie").list();
        for (Task task : tasks) {
          System.out.println("Task for fozzie: " + task.getName());

          // 完成任务
          taskService.complete(task.getId());
        }

        System.out.println("Number of tasks for fozzie: "
                + taskService.createTaskQuery().taskAssignee("fozzie").count());

        // 检索并认领第二个任务
        tasks = taskService.createTaskQuery().taskCandidateGroup("management").list();
        for (Task task : tasks) {
          System.out.println("Following task is available for management group: " + task.getName());
          taskService.claim(task.getId(), "kermit");
        }

        // 完成第二个任务结束流程
        for (Task task : tasks) {
          taskService.complete(task.getId());
        }

        // 验证流程确实已经结束
        HistoryService historyService = processEngine.getHistoryService();
        HistoricProcessInstance historicProcessInstance =
          historyService.createHistoricProcessInstanceQuery().processInstanceId(procId).singleResult();
        System.out.println("Process instance end time: " + historicProcessInstance.getEndTime());
      }

    }

### 未来的改进

很容易看出这个业务流程过于简单,在实际中难以使用。但是,当你学习了 Flowable 中可用的 BPMN 2.0 构造后,你将能够通过以下方式增强业务流程:

- 定义**网关(gateways)**,这样经理可以决定拒绝财务报告并为会计重新创建任务,采用与接受报告不同的路径。

- 声明和使用**变量(variables)**来存储或引用报告,以便可以在表单中可视化显示。

- 在流程结束时定义一个**服务任务(service task)**,将报告发送给每个股东。

- 等等。