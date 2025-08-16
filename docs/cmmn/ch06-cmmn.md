---
id: ch06-cmmn
title: CMMN 1.1
description: Flowable CMMN 1.1文档介绍案例管理模型和标记法的基本概念、计划模型与实例运行机制，提供建模器、Java引擎和演示UI等工具支持。
keywords: Flowable,CMMN 1.1,案例管理模型,计划模型,人工任务,Java引擎,案例实例,哨兵条件
---

## 什么是 CMMN?

案例管理模型和标记法(CMMN)是由[对象管理组织](http://www.omg.org/spec/CMMN/)制定的用于表示案例模型的标准标记法和正式规范。

Flowable 包含:

-   一个 CMMN 1.1 建模器,用于创建 CMMN 1.1 案例模型

-   一个 Java 引擎,可以导入和执行 CMMN 1.1 案例模型

-   一个演示用户界面,用于执行案例模型,允许用户查看和完成人工任务(及其表单)

## 基本概念和术语

下图显示了一个简单的 CMMN 1.1 图:

![cmmn basic concepts](assets/cmmn/cmmn-basic-concepts.png)

**案例模型**总是被可视化为某种包含所有案例元素的*文件夹*。每个案例模型都包含一个**计划模型**,在其上将规划项目。

计划模型的元素称为**计划项**。每个*计划项*都有一个**计划项定义**,它给出了其类型和运行时可能的配置选项。例如,在上图中,有三个**人工任务**计划项和一个**里程碑**。计划项的其他示例包括*流程任务、案例任务和阶段*。

将案例模型部署到 Flowable CMMN 引擎后,就可以基于此案例模型启动**案例实例**。案例模型中定义的计划项同样具有**计划项实例**运行时表示,这些表示可以通过 Flowable API 暴露和查询。计划项实例具有在 CMMN 1.1 规范中定义的状态生命周期,这是引擎工作方式的核心。有关所有详细信息,请查看 CMMN 1.1 规范的 8.4.2 节。

计划项可以有*哨兵*:当哨兵"守卫"其激活时,计划项被称为具有*进入条件*。这些条件指定了必须满足才能*触发哨兵*的条件。例如,在上图中,"里程碑一"计划项在案例实例启动后是*可用的*,但只有当人工任务 A 和 B 都完成时才会*激活*(在 CMMN 1.1 规范术语中:它从*可用*状态移动到*活动*状态)。请注意,哨兵可以在其*if 部分*中有复杂的表达式,这些表达式没有可视化,允许更复杂的功能。还要注意,可以有多个哨兵,但只需要满足一个就可以触发状态转换。

计划项和计划模型也可以有带有*退出条件*的哨兵,这些条件指定了触发从特定计划项*退出*的条件。在上图中,当人工任务 C 完成时,整个计划模型都会退出(当时处于活动状态的所有子元素也会退出)。

CMMN 1.1 在规范的 XSD 中定义了标准 XML 格式。作为参考,上图中的示例在 XML 中的表示如下所示。

一些观察:

-   上述四个计划项在 XML 中,它们通过 *definitionRef* 引用其定义。实际定义位于 *casePlanModel* 元素的底部

-   计划项具有引用 *哨兵* 的条件(进入或退出)(而不是相反)

-   XML 还包含有关如何可视化图表的信息(x 和 y 坐标、宽度和高度等),这些在下面被省略。这些元素在与其他 CMMN 1.1 建模工具交换案例模型时很重要,可以保持正确的视觉表示

<!-- -->

    <?xml version="1.0" encoding="UTF-8"?>
    <definitions xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:flowable="http://flowable.org/cmmn"
                 xmlns:cmmndi="http://www.omg.org/spec/CMMN/20151109/CMMNDI"
                 xmlns:dc="http://www.omg.org/spec/CMMN/20151109/DC"
                 xmlns:di="http://www.omg.org/spec/CMMN/20151109/DI"
                 targetNamespace="http://www.flowable.org/casedef">
      <case id="simpleExample" name="Simple Example">
        <casePlanModel id="casePlanModel" name="My Case">
          <planItem id="planItem1" name="Human task A"
                definitionRef="sid-88199E7C-7655-439C-810B-8849FC52D3EB"></planItem>
          <planItem id="planItem2" name="Milestone One"
                definitionRef="sid-8BF8A774-A8A7-4F1A-95CF-1E0D61EE5A47">
            <entryCriterion id="sid-62CC4A6D-B29B-4129-93EA-460253C45CDF"
                sentryRef="sentry1"></entryCriterion>
          </planItem>
          <planItem id="planItem3" name="Human task B"
                definitionRef="sid-A1FB8733-0DBC-4B38-9830-CBC4D0C4B802"></planItem>
          <planItem id="planItem4" name="Human task C"
                definitionRef="sid-D3970AFC-7391-4BA7-95BA-51C64D2F41E9"></planItem>
          <sentry id="sentry1">
            <planItemOnPart id="sentryOnPart1" sourceRef="planItem1">
              <standardEvent>complete</standardEvent>
            </planItemOnPart>
            <planItemOnPart id="sentryOnPart2" sourceRef="planItem3">
              <standardEvent>complete</standardEvent>
            </planItemOnPart>
          </sentry>
          <sentry id="sentry2">
            <planItemOnPart id="sentryOnPart3" sourceRef="planItem4">
              <standardEvent>complete</standardEvent>
            </planItemOnPart>
          </sentry>
          <humanTask id="sid-88199E7C-7655-439C-810B-8849FC52D3EB"
            name="Human task A"></humanTask>
          <milestone id="sid-8BF8A774-A8A7-4F1A-95CF-1E0D61EE5A47"
            name="Milestone One"></milestone>
          <humanTask id="sid-A1FB8733-0DBC-4B38-9830-CBC4D0C4B802"
            name="Human task B"></humanTask>
          <humanTask id="sid-D3970AFC-7391-4BA7-95BA-51C64D2F41E9"
            name="Human task C"></humanTask>
          <exitCriterion id="sid-422626DB-9B40-49D8-955E-641AB96A5BFA"
            sentryRef="sentry2"></exitCriterion>
        </casePlanModel>
      </case>
      <cmmndi:CMMNDI>
        <cmmndi:CMMNDiagram id="CMMNDiagram_simpleExample">
            ...
        </cmmndi:CMMNDiagram>
      </cmmndi:CMMNDI>
    </definitions>

## 编程示例

在本节中,我们将构建一个简单的案例模型,并通过 Flowable CMMN 引擎的 Java API 在一个简单的命令行示例中以编程方式执行它。

我们要构建的案例模型是一个简化的*员工入职*案例,包含两个阶段:潜在员工入职前和入职后的阶段。在第一阶段,人力资源部门的人员将完成这些任务,而在第二阶段则由员工自己完成这些任务。此外,潜在员工可以随时拒绝工作并停止整个案例实例。

注意,这里只使用了阶段和人工任务。在实际的案例模型中,很可能还会有其他类型的计划项,如里程碑、嵌套阶段、自动化任务等。

![cmmn.programmatic.example](assets/cmmn/cmmn.programmatic.example.png)

此案例模型的 XML 如下所示:

    <?xml version="1.0" encoding="UTF-8"?>
    <definitions xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:flowable="http://flowable.org/cmmn"
                 xmlns:cmmndi="http://www.omg.org/spec/CMMN/20151109/CMMNDI"
                 xmlns:dc="http://www.omg.org/spec/CMMN/20151109/DC"
                 xmlns:di="http://www.omg.org/spec/CMMN/20151109/DI"
                 targetNamespace="http://www.flowable.org/casedef">
      <case id="employeeOnboarding" name="Simple Example">
        <casePlanModel id="casePlanModel" name="My Case">
          <planItem id="planItem5" name="Prior to starting"
                definitionRef="sid-025D29E8-BA9B-403D-A684-8C5B52185642"></planItem>
          <planItem id="planItem8" name="After starting"
                definitionRef="sid-8459EF32-4F4C-4E9B-A6E9-87FDC2299044">
            <entryCriterion id="sid-50B5F12D-FE75-4D05-9148-86574EE6C073"
                sentryRef="sentry2"></entryCriterion>
          </planItem>
          <planItem id="planItem9" name="Reject job"
                definitionRef="sid-134E885A-3D58-417E-81E2-66A3E12334F9"></planItem>
          <sentry id="sentry2">
            <planItemOnPart id="sentryOnPart4" sourceRef="planItem5">
              <standardEvent>complete</standardEvent>
            </planItemOnPart>
          </sentry>
          <sentry id="sentry3">
            <planItemOnPart id="sentryOnPart5" sourceRef="planItem9">
              <standardEvent>complete</standardEvent>
            </planItemOnPart>
          </sentry>
          <stage id="sid-025D29E8-BA9B-403D-A684-8C5B52185642" name="Prior to starting">
            <planItem id="planItem1" name="Create email address"
                    definitionRef="sid-EA434DDD-E1BE-4AC1-8520-B19ACE8782D2"></planItem>
            <planItem id="planItem2" name="Allocate office"
                    definitionRef="sid-505BA223-131A-4EF0-ABAD-485AEB0F2C96"></planItem>
            <planItem id="planItem3" name="Send joining letter to candidate"
                    definitionRef="sid-D28DBAD5-0F5F-45F4-8553-3381199AC45F">
              <entryCriterion id="sid-4D88C79D-8E31-4246-9541-A4F6A5720AC8"
                sentryRef="sentry1"></entryCriterion>
            </planItem>
            <planItem id="planItem4" name="Agree start date"
                    definitionRef="sid-97A72C46-C0AD-477F-86DD-85EF643BB97D"></planItem>
            <sentry id="sentry1">
              <planItemOnPart id="sentryOnPart1" sourceRef="planItem1">
                <standardEvent>complete</standardEvent>
              </planItemOnPart>
              <planItemOnPart id="sentryOnPart2" sourceRef="planItem2">
                <standardEvent>complete</standardEvent>
              </planItemOnPart>
              <planItemOnPart id="sentryOnPart3" sourceRef="planItem4">
                <standardEvent>complete</standardEvent>
              </planItemOnPart>
            </sentry>
            <humanTask id="sid-EA434DDD-E1BE-4AC1-8520-B19ACE8782D2"
                name="Create email address"
                flowable:candidateGroups="hr"></humanTask>
            <humanTask id="sid-505BA223-131A-4EF0-ABAD-485AEB0F2C96"
                name="Allocate office"
                flowable:candidateGroups="hr"></humanTask>
            <humanTask id="sid-D28DBAD5-0F5F-45F4-8553-3381199AC45F"
                name="Send joining letter to candidate"
                flowable:candidateGroups="hr"></humanTask>
            <humanTask id="sid-97A72C46-C0AD-477F-86DD-85EF643BB97D"
                name="Agree start date"
                flowable:candidateGroups="hr"></humanTask>
          </stage>
          <stage id="sid-8459EF32-4F4C-4E9B-A6E9-87FDC2299044"
            name="After starting">
            <planItem id="planItem6" name="New starter training"
                    definitionRef="sid-DF7B9582-11A6-40B4-B7E5-EC7AC6029387"></planItem>
            <planItem id="planItem7" name="Fill in paperwork"
                    definitionRef="sid-7BF2B421-7FA0-479D-A8BD-C22EBD09F599"></planItem>
            <humanTask id="sid-DF7B9582-11A6-40B4-B7E5-EC7AC6029387"
                name="New starter training"
                flowable:assignee="${potentialEmployee}"></humanTask>
            <humanTask id="sid-7BF2B421-7FA0-479D-A8BD-C22EBD09F599"
                name="Fill in paperwork"
                flowable:assignee="${potentialEmployee}"></humanTask>
          </stage>
          <humanTask id="sid-134E885A-3D58-417E-81E2-66A3E12334F9" name="Reject job"
            flowable:assignee="${potentialEmployee}"></humanTask>
          <exitCriterion id="sid-18277F30-E146-4B3E-B3C9-3F1E187EC7A8"
            sentryRef="sentry3"></exitCriterion>
        </casePlanModel>
      </case>
    </definitions>

首先,创建一个新项目并添加 *flowable-cmmn-engine* 依赖(这里展示的是 Maven 方式)。同时也添加 H2 依赖,因为稍后将使用 H2 作为嵌入式数据库。

    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-cmmn-engine</artifactId>
        <version>${flowable.version}</version>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <version>${h2.version}</version>
    </dependency>

Flowable CMMN API 的设计与其他 Flowable API 和概念保持一致。因此,熟悉 BPMN 或 DMN API 的人不会在使用时遇到困难。与其他引擎一样,第一行代码是创建 CmmnEngine。这里使用默认的内存配置,它使用 H2 作为数据库:

    public class Main {
      public static void main(String[] args) {
        CmmnEngine cmmnEngine
            = new StandaloneInMemCmmnEngineConfiguration().buildCmmnEngine();
      }
    }

请注意,*CmmnEngineConfiguration* 提供了许多配置选项用于调整 CMMN 引擎的各种设置。

将上面的 XML 放入一个文件中,例如 *my-case.cmmn* (或 .cmmn.xml)。对于 Maven 项目,应该将其放在 *src/main/resources* 文件夹中。

要让引擎识别案例模型,首先需要将其*部署*。这是通过 *CmmnRepositoryService* 完成的:

    CmmnRepositoryService cmmnRepositoryService = cmmnEngine.getCmmnRepositoryService();
    CmmnDeployment cmmnDeployment = cmmnRepositoryService.createDeployment()
        .addClasspathResource("my-case.cmmn")
        .deploy();

部署 XML 将返回一个 **CmmnDeployment**。一个部署可以包含多个案例模型和工件。上面的特定案例模型定义被存储为 **CaseDefinition**。这可以通过执行 *CaseDefinitionQuery* 来验证:

    List<CaseDefinition> caseDefinitions = cmmnRepositoryService.createCaseDefinitionQuery().list();
    System.out.println("Found " + caseDefinitions.size() + " case definitions");

在引擎中有了 **CaseDefinition** 后,就可以为这个案例模型定义启动一个 **CaseInstance**。可以使用查询的结果并将其传入以下代码片段,或者直接使用案例定义的 *key* (如下所示)。

注意,我们在启动 **CaseInstance** 时还传递了数据,即 *potentialEmployee* 的标识符作为变量。这个变量稍后将用于人工任务中,以将任务分配给正确的人(参见人工任务上的 *assignee="${potentialEmployee}"* 属性)。

    CmmnRuntimeService cmmnRuntimeService = cmmnEngine.getCmmnRuntimeService();
    CaseInstance caseInstance = cmmnRuntimeService.createCaseInstanceBuilder()
        .caseDefinitionKey("employeeOnboarding")
        .variable("potentialEmployee", "johnDoe")
        .start();

在 **CaseInstance** 启动后,引擎将确定模型中的哪些计划项应该被激活:

-   第一个阶段没有进入条件,所以它被激活

-   第一个阶段的子人工任务没有进入条件,所以预计有三个会被激活

计划项在运行时由 **PlanItemInstances** 表示,可以通过 *CmmnRuntimeService* 查询:

    List<PlanItemInstance> planItemInstances = cmmnRuntimeService.createPlanItemInstanceQuery()
        .caseInstanceId(caseInstance.getId())
        .orderByName().asc()
        .list();

    for (PlanItemInstance planItemInstance : planItemInstances) {
        System.out.println(planItemInstance.getName());
    }

输出结果为:

    After starting
    Agree start date
    Allocate office
    Create email address
    Prior to starting
    Reject job
    Send joining letter to candidate

这里可能有一些意外之处:

-   阶段*也*是计划项,因此也有 **PlanItemInstance** 表示。注意,当调用 *.getStageInstanceId()* 时,子计划项实例将以该阶段作为父级。

-   *发送入职信给候选人*在结果中返回。原因是,根据 CMMN 1.1 规范,这个计划项实例处于*可用*状态,但尚未处于*活动*状态。

实际上,当上面的代码改为:

    for (PlanItemInstance planItemInstance : planItemInstances) {
        System.out.println(planItemInstance.getName()
            + ", state=" + planItemInstance.getState()
            + ", parent stage=" + planItemInstance.getStageInstanceId());
    }

输出结果变为:

    After starting, state=available, parent stage=null
    Agree start date, state=active, parent stage=fe37ac97-b016-11e7-b3ad-acde48001122
    Allocate office, state=active, parent stage=fe37ac97-b016-11e7-b3ad-acde48001122
    Create email address, state=active, parent stage=fe37ac97-b016-11e7-b3ad-acde48001122
    Prior to starting, state=active, parent stage=null
    Reject job, state=active, parent stage=fe37ac97-b016-11e7-b3ad-acde48001122
    Send joining letter to candidate, state=available, parent stage=fe37ac97-b016-11e7-b3ad-acde48001122

要只显示活动状态的计划项实例,可以通过添加 *planItemInstanceStateActive()* 来调整查询:

     List<PlanItemInstance> planItemInstances = cmmnRuntimeService.createPlanItemInstanceQuery()
        .caseInstanceId(caseInstance.getId())
        .planItemInstanceStateActive()
        .orderByName().asc()
        .list();

现在的输出为:

    Agree start date
    Allocate office
    Create email address
    Prior to starting
    Reject job

当然,**PlanItemInstance** 是底层表示,但每个计划项还有一个定义其类型的*计划项定义*。在本例中,我们只有*人工任务*。可以通过其*计划项实例*与 *CaseInstance* 进行交互,例如以编程方式触发它们(例如,*CmmnRuntimeService.triggerPlanItemInstance(String planItemInstanceId)*)。但是,最可能的情况是通过实际计划项定义的结果进行交互:这里是人工任务。

查询任务的方式与 BPMN 引擎完全相同(实际上,任务服务是一个共享组件,在 BPMN 或 CMMN 中创建的任务都可以通过两个引擎进行查询):

    CmmnTaskService cmmnTaskService = cmmnEngine.getCmmnTaskService();
    List<Task> hrTasks = cmmnTaskService.createTaskQuery()
        .taskCandidateGroup("hr")
        .caseInstanceId(caseInstance.getId())
        .orderByTaskName().asc()
        .list();
    for (Task task : hrTasks) {
        System.out.println("Task for HR : " + task.getName());
    }

    List<Task> employeeTasks = cmmnTaskService.createTaskQuery()
        .taskAssignee("johndoe")
        .orderByTaskName().asc()
        .list();
    for (Task task : employeeTasks) {
        System.out.println("Task for employee: " + task);
    }

输出结果为:

    Task for HR : Agree start date
    Task for HR : Allocate office
    Task for HR : Create email address

    Task for employee: Reject job

当 HR 的三个任务完成后,"发送入职信给候选人"任务应该变为可用:

    for (Task task : hrTasks) {
        cmmnTaskService.complete(task.getId());
    }

    hrTasks = cmmnTaskService.createTaskQuery()
        .taskCandidateGroup("hr")
        .caseInstanceId(caseInstance.getId())
        .orderByTaskName().asc()
        .list();

    for (Task task : hrTasks) {
        System.out.println("Task for HR : " + task.getName());
    }

果然,预期的任务现在已创建:

    Task for HR : Send joining letter to candidate

完成此任务将使案例实例进入第二阶段,因为第一阶段的哨兵条件已满足。系统会自动完成"拒绝工作"任务,并为员工创建两个新任务:

    Task for employee: Fill in paperwork
    Task for employee: New starter training
    Task for employee: Reject job

完成所有任务将结束案例实例:

    List<Task> tasks = cmmnTaskService.createTaskQuery().caseInstanceId(caseInstance.getId()).listPage(0, 1);
    while (!tasks.isEmpty()) {
        cmmnTaskService.complete(tasks.get(0).getId());
        tasks = cmmnTaskService.createTaskQuery()
            .caseInstanceId(caseInstance.getId())
            .listPage(0, 1);
    }

在执行案例实例时,引擎还会存储历史信息,这些信息可以通过查询 API 获取:

    CmmnHistoryService cmmnHistoryService = cmmnEngine.getCmmnHistoryService();
    HistoricCaseInstance historicCaseInstance = cmmnHistoryService.createHistoricCaseInstanceQuery()
        .caseInstanceId(caseInstance.getId())
        .singleResult();

    System.out.println("Case instance execution took "
        + (historicCaseInstance.getEndTime().getTime() - historicCaseInstance.getStartTime().getTime()) + " ms");

    List<HistoricTaskInstance> historicTaskInstances = cmmnHistoryService.createHistoricTaskInstanceQuery()
        .caseInstanceId(caseInstance.getId())
        .orderByTaskCreateTime().asc()
        .list();

    for (HistoricTaskInstance historicTaskInstance : historicTaskInstances) {
        System.out.println("Task completed: " + historicTaskInstance.getName());
    }

输出结果为:

    Case instance execution took 149 ms
    Task completed: Reject job
    Task completed: Agree start date
    Task completed: Allocate office
    Task completed: Create email address
    Task completed: Send joining letter to candidate
    Task completed: New starter training
    Task completed: Fill in paperwork

与案例执行相关的历史数据会被收集用于特殊构造,例如任务(如上所示)、里程碑、案例、变量和一般的计划项。
这些数据与运行时数据同时被持久化,但在案例实例结束时不会被删除。
可以通过 *CmmnHistoryService* 提供的查询 API 访问历史数据。

当然,这只是 Flowable CMMN 引擎中可用的 API 和构造的一小部分。请查看其他章节以获取更详细的信息。

## CMMN 1.1 构造

本章介绍 Flowable 支持的 CMMN 1.1 构造,以及对 CMMN 1.1 标准的扩展。

除了哨兵和项目控制之外,以下构造都被视为计划项。
它们的实例执行的历史数据可以通过 *CmmnHistoryService* 使用 *org.flowable.cmmn.api.history.HistoricPlanItemInstanceQuery* 进行查询。

### 阶段

阶段用于将计划项分组。它通常用于定义案例实例中的"阶段"。

阶段本身就是一个计划项,因此可以有进入和退出条件。阶段内包含的计划项只有在父阶段移动到*活动*状态时才可用。阶段可以嵌套在其他阶段中。

阶段被可视化为一个带有角度边角的矩形:

![cmmn.stage](assets/cmmn/cmmn.stage.png)

### 任务

"手动"任务,意味着该任务将在引擎外部执行。

属性:

-   **name**: 在运行时解析为手动任务名称的表达式

-   **blocking**: 确定任务是否阻塞的布尔值

-   **blockingExpression**: 计算结果为布尔值的表达式,用于指示任务是否阻塞

如果任务是非阻塞的,引擎在执行时会自动完成它。如果任务是阻塞的,此任务的 *PlanItemInstance* 将保持在*活动*状态,直到通过 *CmmnRuntimeService.triggerPlanItemInstance(String planItemInstanceId)* 方法以编程方式触发。

任务被可视化为一个圆角矩形:

![cmmn.task](assets/cmmn/cmmn.task.png)

### 人工任务

人工任务用于对需要由人类完成的工作进行建模,通常是通过表单完成。当引擎到达人工任务时,会在分配给该任务的任何用户或组的任务列表中创建一个新条目。

人工任务是一个计划项,这意味着除了人工任务条目外,还会创建一个 *PlanItemInstance*,可以通过 *PlanItemInstanceQuery* 查询它。

可以通过 *org.flowable.task.api.TaskQuery* API 查询人工任务。历史任务数据可以通过 *org.flowable.task.api.history.HistoricTaskInstanceQuery* 查询。

属性:

-   **name**: 在运行时解析为人工任务名称的表达式

-   **blocking**: 确定任务是否阻塞的布尔值

-   **blockingExpression**: 计算结果为布尔值的表达式,用于指示任务是否阻塞

-   **assignee**: 用于确定将人工任务分配给谁的表达式(可以是静态文本值)

-   **owner**: 用于确定人工任务所有者的表达式(可以是静态文本值)

-   **candidateUsers**: 解析为逗号分隔的字符串列表的表达式(可以是静态文本值),用于确定哪些用户是此人工任务的候选人

-   **candidateGroups**: 解析为逗号分隔的字符串列表的表达式(可以是静态文本值),用于确定将任务分配给哪些组

-   **form key**: 使用表单时确定键的表达式。之后可以通过 API 检索

-   **Due date**: 解析为 java.util.Date 或 ISO-8601 日期字符串的表达式

-   **Priority**: 解析为整数的表达式。可以在 TaskQuery API 中用于过滤任务

人工任务被可视化为一个带有左上角用户图标的圆角矩形:

![cmmn.humantask](assets/cmmn/cmmn.humantask.png)

### Java 服务任务

服务任务用于执行自定义逻辑。

自定义逻辑放在实现 *org.flowable.cmmn.api.delegate.PlanItemJavaDelegate* 接口的类中。

    public class MyJavaDelegate implements PlanItemJavaDelegate {

        public void execute(DelegatePlanItemInstance planItemInstance) {
            String value = (String) planItemInstance.getVariable("someVariable");
            ...
        }

    }

对于无法使用 *PlanItemJavaDelegate* 方法覆盖的低级实现,可以使用 *CmmnActivityBehavior*(类似于 BPMN 引擎中的 *JavaDelegate* vs *ActivityBehavior*)。

属性:

-   **name**: 服务任务的名称

-   **class**: 实现自定义逻辑的 Java 类

-   **class fields**: 调用自定义逻辑时要传递的参数

-   **Delegate expression**: 解析为实现 *PlanItemJavaDelegate* 接口的类的表达式

服务任务被可视化为一个带有左上角齿轮图标的圆角矩形:

![cmmn.servicetask](assets/cmmn/cmmn.servicetask.png)

### 外部工作者任务

#### 描述

外部工作者任务允许你创建应该由外部工作者获取和执行的作业。
外部工作者可以通过 Java API 或 REST API 获取作业。
这类似于异步服务任务。
不同之处在于,不是由 Flowable 执行逻辑,
而是由可以用任何语言实现的外部工作者查询 Flowable 获取作业,执行它们并将结果发送回 Flowable。
注意,外部工作者任务**不是** CMMN 规范的"官方"任务(因此也没有专门的图标)。

#### 定义外部工作者任务

外部工作者任务是作为专用的[任务](cmmn/ch06-cmmn.md#task)实现的,通过将任务的 *type* 设置为 *'external-worker'* 来定义。

```xml
<task id="externalWorkerOrder" flowable:type="external-worker">
```

外部工作者任务通过设置 `topic`(可以是 EL 表达式)进行配置,外部工作者使用该主题来查询要执行的作业。

#### 使用示例

以下 XML 片段展示了使用外部工作者任务的示例。
外部工作者是一个等待状态。
当执行到达该任务时,它将创建一个外部工作者作业,该作业可以被外部工作者获取。
一旦外部工作者完成作业并通知 Flowable 完成,案例的执行将继续。


```xml
<task id="externalWorkerOrder" flowable:type="external-worker" flowable:topic="orderService" />
```

#### 获取外部工作者作业

外部工作者作业通过使用 `ExternalWorkerJobAcquireBuilder` 通过 `CmmnManagementService#createExternalWorkerJobAcquireBuilder` 获取

```java
List<AcquiredExternalWorkerJob> acquiredJobs = cmmnManagementService.createExternalWorkerJobAcquireBuilder()
                .topic("orderService", Duration.ofMinutes(30))
                .acquireAndLock(5, "orderWorker-1");
```

通过使用上面的 Java 代码片段可以获取外部工作者作业。
通过这段代码我们完成了以下操作：

* 查询主题为 *orderService* 的外部工作者作业
* 获取并锁定作业 30 分钟,等待外部工作者的完成信号
* 最多获取 5 个作业
* 作业的所有者是 ID 为 *orderWorker-1* 的工作者

`AcquiredExternalWorkerJob` 也可以访问案例变量。
当外部工作者任务是独占的时,获取作业将锁定案例实例。

#### 完成外部工作者作业

外部工作者作业通过使用 `CmmnExternalWorkerTransitionBuilder` 通过 `CmmnManagementService#createCmmnExternalWorkerTransitionBuilder(String, String)` 完成

```java
cmmnManagementService.createCmmnExternalWorkerTransitionBuilder(acquiredJob.getId(), "orderWorker-1")
                .variable("orderStatus", "COMPLETED")
                .complete();
```

作业只能由获取它的工作者完成。否则将抛出 `FlowableIllegalArgumentException` 异常。

使用上面的代码片段,任务将被完成且案例执行将继续。
执行的继续在新事务中异步完成。
这意味着完成外部工作者任务只会创建一个异步(新的)作业来执行完成操作(并且当前线程在此之后返回)。
模型中在外部工作者任务之后的任何步骤都将在该事务中执行,类似于常规的异步服务任务。

也可以使用 `CmmnExternalWorkerTransitionBuilder#terminate()` 来转换外部工作者作业。

#### 外部工作者作业的错误处理

`ExternalWorkerJobFailureBuilder` 用于使作业失败(安排它在将来重新执行)

要使作业失败,可以使用以下方式：


```java
cmmnManagementService.createExternalWorkerJobFailureBuilder(acquiredJob.getId(), "orderWorker-1")
                .errorMessage("Failed to run job. Database not accessible")
                .errorDetails("Some complex and long error details")
                .retries(4)
                .retryTimeout(Duration.ofHours(1))
                .fail();
```

使用这段代码将执行以下操作：

* 在作业上设置错误消息和错误详情
* 将作业的重试次数设置为 4
* 作业将在 1 小时后可被获取

作业只能由获取它的工作者标记为失败。
如果没有设置重试次数，flowable 将自动将作业的重试次数减 1。
当重试次数为 0 时，作业将被移动到死信表(DeadLetter table)中，并且不再可被获取。

#### 查询外部工作者作业

外部工作者作业通过使用 `ExternalWorkerJobQuery` 通过 `CmmnManagementService#createExternalWorkerJobQuery` 创建来查询。

### 决策任务

*决策任务*调用 DMN 决策表并将结果变量存储在案例实例中。

属性：

- **决策表引用**：需要调用的被引用的 DMN 决策表。

通过设置"*未命中规则时抛出错误*"属性，可以在评估 DMN 决策表期间没有规则被命中时抛出错误。

决策任务被可视化为一个带有左上角表格图标的*任务*：

![cmmn.decisiontask](assets/cmmn/cmmn.decisiontask.png)

### Http 任务

Http 任务是*服务任务*的一个开箱即用的实现。当需要通过 HTTP 调用 REST 服务时使用。

Http 任务有多个选项来自定义请求和响应。有关所有配置选项的详细信息，请参见 BPMN http 任务文档。

http 任务被可视化为一个带有左上角火箭图标的*任务*：

![cmmn.httptask](assets/cmmn/cmmn.httptask.png)

### 脚本任务

"脚本"类型的任务，类似于 BPMN 中的等效任务，脚本任务在计划项实例变为活动状态时执行脚本。

属性：

- **name**：指示任务名称的任务属性

- **type**：值必须为"script"以指示任务类型的任务属性

- **scriptFormat**：指示脚本语言的扩展属性（例如，javascript、groovy）

- **script**：要执行的脚本，在名为"script"的字段元素中定义为字符串

- **autoStoreVariables**：可选的任务属性标志（默认值：false），用于指示脚本中定义的变量是否将存储在计划项实例上下文中（参见下面的注释）

- **resultVariableName**：可选的任务属性，当存在时，将使用脚本评估结果在计划项实例上下文中存储具有指定名称的变量（参见下面的注释）

脚本任务被可视化为一个带有左上角脚本图标的*任务*：

![cmmn.scripttask](assets/cmmn/cmmn.scripttask.png)

    <planItem id="scriptPlanItem" name="Script Plan Item" definitionRef="myScriptTask" />
    <task name="My Script Task Item" flowable:type="script" flowable:scriptFormat="JavaScript">
        <documentation>Optional documentation</documentation>
        <extensionElements>
            <flowable:field name="script">
                <string>
                    sum = 0;
                    for ( i in inputArray ) {
                        sum += i;
                    }
                </string>
            </flowable:field>
        </extensionElements>
    </task>

**注意**：**scriptFormat** 属性的值必须是与 [JSR-223](http://jcp.org/en/jsr/detail?id=223)（Java 平台的脚本）兼容的名称。默认情况下，JavaScript 包含在每个 JDK 中，因此不需要额外的 JAR 文件。如果你想使用另一个（JSR-223 兼容的）脚本引擎，只需将相应的 JAR 添加到类路径并使用适当的名称即可。例如，Flowable 单元测试经常使用 Groovy，因为其语法与 Java 类似。

请注意，Groovy 脚本引擎与 groovy-jsr223 JAR 捆绑在一起。因此，必须添加以下依赖项：

    <dependency>
        <groupId>org.apache.groovy</groupId>
        <artifactId>groovy-jsr223</artifactId>
        <version>4.x.x<version>
    </dependency>

到达脚本任务的计划项实例可以访问的所有案例变量都可以在脚本中使用。在下面的示例中，脚本变量 *'inputArray'* 实际上是一个案例变量（整数数组）。

    <flowable:field name="script">
        <string>
        sum = 0
        for ( i in inputArray ) {
          sum += i
        }
        </string>
    </flowable:field>

**注意**：也可以通过调用 *planItemInstance.setVariable("variableName", variableValue)* 在脚本中设置计划项实例变量。默认情况下，不会自动存储任何变量。可以通过将脚本任务的 autoStoreVariables 属性设置为 true 来自动存储脚本中定义的任何变量（例如，上例中的 *sum*）。但是，**最佳实践是不要这样做，而是使用显式的 planItemInstance.setVariable() 调用**，因为在某些较新版本的 JDK 中，自动存储变量对某些脚本语言不起作用。详情请参见[此链接](http://www.jorambarrez.be/blog/2013/03/25/bug-on-jdk-1-7-0_17-when-using-scripttask-in-activiti/)。

    <task name="Script Task" flowable:type="script" flowable:scriptFormat="groovy" flowable:autoStoreVariables="false">

此参数的默认值为 false，这意味着如果在脚本任务定义中省略该参数，所有声明的变量将仅在脚本执行期间存在。

以下是在脚本中设置变量的示例：

    <flowable:field name="script">
        <string>
        def scriptVar = "test123"
        planItemInstance.setVariable("myVar", scriptVar)
        </string>
    </flowable:field>

以下名称是保留的，**不能用作变量名**：**out、out:print、lang:import、context、elcontext**。

**注意** 通过将脚本任务定义的 *'flowable:resultVariable'* 属性指定为字面值，脚本任务的返回值可以分配给已存在或新的计划项实例变量。特定计划项实例变量的任何现有值都将被脚本执行的结果值覆盖。当未指定结果变量名时，脚本结果值将被忽略。

    <task name="Script Task" flowable:type="script" flowable:scriptFormat="groovy" flowable:resultVariable="myVar">
        <flowable:field name="script">
            <string>#{echo}</string>
        </flowable:field>
    </task>

在上面的示例中，脚本执行的结果（已解析表达式 *'#{echo}'* 的值）在脚本完成后被设置到名为 *'myVar'* 的流程变量中。

### 里程碑

里程碑用于标记到达案例实例中的某个特定点。在运行时,它们表示为**里程碑实例**,可以通过 *CmmnRuntimeService* 的 **MilestoneInstanceQuery** 进行查询。通过 *CmmnHistoryService* 也有一个历史对应项。

里程碑是一个计划项,这意味着除了里程碑条目外,还会创建一个 *PlanItemInstance*,可以通过 *PlanItemInstanceQuery* 查询它。

属性:

-   **name**: 确定里程碑名称的表达式或静态文本

里程碑被可视化为一个圆角矩形(比任务更圆):

![cmmn.milestone](assets/cmmn/cmmn.milestone.png)

### 案例任务

案例任务用于在另一个案例的上下文中启动子案例。*CaseInstanceQuery* 有 *parent* 选项来查找这些案例。

当案例任务是阻塞的时,*PlanItemInstance* 将保持*活动*状态,直到子案例完全结束。如果案例任务是非阻塞的,子案例启动后计划项实例自动完成。当子案例实例结束时,对父案例没有影响。

属性:

-   **name**: 确定名称的表达式或静态文本

-   **blocking**: 确定任务是否阻塞的布尔值

-   **blockingExpression**: 计算结果为布尔值的表达式,用于指示任务是否阻塞

-   **Case reference**: 用于启动子案例实例的案例定义的键。可以是表达式

案例任务被可视化为一个带有左上角案例图标的圆角矩形:

![cmmn.casetask](assets/cmmn/cmmn.casetask.png)

### 流程任务

流程任务用于在案例的上下文中启动流程实例。

当流程任务是阻塞的时,*PlanItemInstance* 将保持*活动*状态,直到流程实例完全结束。如果流程任务是非阻塞的,流程实例启动后计划项实例自动完成。当流程实例结束时,对父案例没有影响。

属性:

-   **name**: 确定名称的表达式或静态文本

-   **blocking**: 确定任务是否阻塞的布尔值

-   **blockingExpression**: 计算结果为布尔值的表达式,用于指示任务是否阻塞

-   **Process reference**: 用于启动流程实例的流程定义的键。可以是表达式

流程任务被可视化为一个带有左上角箭头图标的圆角矩形:

![cmmn.processtask](assets/cmmn/cmmn.processtask.png)

流程任务可以配置输入和输出参数,它们采用 *source/sourceExpression* 和 *target/targetExpression* 的形式。

输入参数在案例实例的上下文中解析。

-   *source* 值将是案例实例变量,其值将映射到流程变量

-   或者,*sourceExpression* 允许创建任意值,表达式针对案例实例解析

-   *target* 将是源值映射到的流程变量的名称

-   或者,*targetExpression* 将解析为一个**字符串**值,用作流程实例中的变量名。表达式在案例实例上下文中解析

输出参数在流程实例的上下文中解析。

-   *source* 值将是流程实例变量,其值将映射到案例变量

-   或者,*sourceExpression* 允许创建任意值,表达式针对流程实例解析

-   *target* 将是源值映射到的案例变量的名称

-   或者,*targetExpression* 将解析为一个**字符串**值,用作案例实例中的变量名。表达式在流程实例上下文中解析

### 条件判断

#### 进入条件(进入哨兵)

进入条件为给定的计划项实例形成一个哨兵。它们由两部分组成:

-   一个或多个依赖于其他计划项的部分:这些定义了对其他计划项状态转换的依赖关系。例如,一个人工任务可能需要依赖三个其他人工任务的"完成"状态转换才能自己变为活动状态

-   一个可选的 *if 部分*或*条件*:这是一个允许定义复杂条件的表达式

当所有条件都解析为*true*时,哨兵就满足了。当一个条件评估为 true 时,这个结果会被存储并用于将来的评估。请注意,每当案例实例中发生变化时,都会评估处于*可用*状态的所有计划项实例的进入条件。
一个计划项可以有多个哨兵。但是,当其中一个满足时,计划项就会从*可用*状态移动到*活动*状态。

更多信息请参见[哨兵评估章节](cmmn/ch06-cmmn.md#sentry-evaluation)。

进入条件被可视化为计划项边界上的一个菱形(内部为白色):

![cmmn.entrycriteria](assets/cmmn/cmmn.entrycriteria.png)

#### 退出条件(退出哨兵)

退出条件为给定的计划项实例形成一个哨兵。它们由两部分组成:

-   一个或多个依赖于其他计划项的部分:这些定义了对其他计划项状态转换的依赖关系。例如,一个人工任务可能需要依赖达到某个里程碑才能自动终止

-   一个可选的 *if 部分*或*条件*:这是一个允许定义复杂条件的表达式

当所有条件都解析为*true*时,哨兵就满足了。当一个条件评估为 true 时,这个结果会被存储并用于将来的评估。请注意,每当案例实例中发生变化时,都会评估处于*活动*状态的所有计划项实例的退出条件。
一个计划项可以有多个哨兵。但是,当其中一个满足时,计划项就会从*活动*状态移动到*退出*状态。

更多信息请参见[哨兵评估章节](cmmn/ch06-cmmn.md#sentry-evaluation)。

退出条件被可视化为计划项边界上的一个菱形(内部为白色):

![cmmn.exitcriteria](assets/cmmn/cmmn.exitcriteria.png)

除了规范之外,Flowable 还支持在退出哨兵上添加额外的属性,这为退出哨兵触发时如何终止计划项提供了更多的灵活性和选项。

##### 退出类型

此属性可用于计划项上的退出哨兵(但不能用于阶段或案例计划模型),并有助于定义如何退出计划项。
它特别适合与重复结合使用。一个可能的用例是,你想终止重复计划项的活动实例,但随着案例中的条件变化,它可能稍后再次变为可用。通过使用非默认的退出类型,这是可能的,因为计划项不会永久终止,而只是终止活动的或活动和已启用的实例。

可能的值有：

-   **default**：默认退出类型按照规范工作,它将终止(退出)计划项及其所有尚未完成的实例。

-   **activeInstances**：如果选择此退出类型,退出哨兵只终止活动实例,但保留已启用和可用的实例,因此它们稍后可以变为活动状态。

-   **activeAndEnabledInstances**：除了前一个之外,此退出类型还会终止已启用的实例(例如,准备手动激活的实例),但保留可用的实例。

人工任务上扩展退出哨兵的示例：


    <planItem id="planItem1" name="Task 1" definitionRef="humanTask1">
        <itemControl>
            <repetitionRule></repetitionRule>
        </itemControl>
        <exitCriterion id="exitCriterion1" sentryRef="sentry1" flowable:exitType="activeAndEnabledInstances"></exitCriterion>
    </planItem>

##### 退出事件类型

此属性可用于阶段或案例计划模型上的退出哨兵,因为它提供了一个替代终止的退出方式。想象一个阶段,你不想启用自动完成,而是希望在阶段可完成时让用户监听器变为可用,并让用户通过触发阶段上的退出哨兵来决定阶段何时实际完成。
根据规范使用这种组合将退出阶段并使其处于终止状态,并触发退出事件以进行进一步处理。
这可能不是你想要的。使用 *退出事件类型*,你可以指定阶段如何以不同于默认行为的方式退出。

可能的值有：

-   **exit**：这是符合规范的默认行为。它将终止阶段及其所有子项,并使其处于*终止*状态,使用*exit*作为触发的事件类型。

-   **complete**：此值可用于终止阶段,但使其处于*完成*状态(而不是*终止*)并触发*完成*事件,而不是*退出*事件。基本上,这种行为与阶段自动完成的行为完全相同。如果在触发具有此退出事件类型的退出哨兵时阶段不可完成,引擎将抛出异常。

-   **forceComplete**：此值类似于*complete*,但不会预先检查阶段是否可完成,而是强制其完成,即使在触发退出哨兵时仍有活动的子计划项。它们将首先被终止,然后阶段以*完成*事件完成并处于*完成*状态。

下面是如何将退出事件类型属性与用户监听器结合使用以手动完成阶段的完整示例。
它包含两个重要部分：退出条件上的 *flowable:exitEventType="complete"* 属性和用户事件监听器上的 *flowable:availableCondition="${cmmn:isStageCompletable()}"*,这使得监听器仅在阶段当前可完成时可用,否则不可用。
一旦用户监听器触发,退出哨兵将被执行并完成阶段,而不是终止它,并使其处于*完成*状态,触发*完成*事件,而不是*退出*事件。

![cmmn exit sentry on stage](assets/cmmn/cmmn-exit-sentry-on-stage.png)

以下是 CMMN 模型的 XML 格式：

    <?xml version="1.0" encoding="UTF-8"?>
    <definitions xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:flowable="http://flowable.org/cmmn"
                 xmlns:cmmndi="http://www.omg.org/spec/CMMN/20151109/CMMNDI"
                 xmlns:dc="http://www.omg.org/spec/CMMN/20151109/DC"
                 xmlns:di="http://www.omg.org/spec/CMMN/20151109/DI"
                 xmlns:design="http://flowable.org/design"
                 targetNamespace="http://flowable.org/cmmn">
      <case id="stageWithUserListenerForCompletion" name="Stage with user listener for completion">
        <casePlanModel id="casePlanModel1" name="Case plan model">
          <planItem id="planItem4" definitionRef="expandedStage1">
            <exitCriterion id="exitCriterion1" flowable:sentryRef="sentry1" flowable:exitEventType="complete"></exitCriterion>
          </planItem>
          <sentry id="sentry1">
            <planItemOnPart id="sentryOnPart1" sourceRef="planItem3">
              <standardEvent>occur</standardEvent>
            </planItemOnPart>
          </sentry>
          <stage id="expandedStage1" name="Stage A">
            <planItem id="planItem1" name="Task A" definitionRef="humanTask1"></planItem>
            <planItem id="planItem2" name="Task B" definitionRef="humanTask2">
              <itemControl>
                <repetitionRule></repetitionRule>
                <manualActivationRule></manualActivationRule>
              </itemControl>
            </planItem>
            <planItem id="planItem3" name="Complete stage" definitionRef="userEventListener1"></planItem>
            <humanTask id="humanTask1" name="Task A"></humanTask>
            <humanTask id="humanTask2" name="Task B"></humanTask>
            <userEventListener id="userEventListener1" name="Complete stage" flowable:availableCondition="${cmmn:isStageCompletable()}"></userEventListener>
          </stage>
        </casePlanModel>
      </case>
    </definitions>

### 事件监听器

#### 定时器事件监听器

当需要在案例模型中捕获时间的流逝时,使用定时器事件监听器。

定时器事件监听器不是任务,与*任务*相比具有更简单的计划项生命周期：当事件(在本例中是时间流逝)发生时,定时器将简单地从*可用*状态移动到*完成*状态。

属性：

-   **定时器表达式**：定义定时器何时触发的表达式。可以使用以下选项：

    -   解析为 java.util.Date 或 org.joda.time.DateTime 实例的表达式(例如,\_${someBean.calculateNextDate(someCaseInstanceVariable)})

    -   ISO8601 日期

    -   ISO8601 持续时间字符串(例如,*PT5H*,表示定时器应在实例化后 5 小时触发)

    -   ISO8601 重复字符串(例如,R5/PT2H,表示定时器应触发 5 次,每次等待 2 小时)

    -   包含 cron 表达式的字符串

-   **启动触发计划项/事件**：对案例模型中触发定时器事件监听器启动的计划项的引用

请注意,与哨兵上的进入/退出条件不同,为定时器事件监听器设置*启动触发器*在案例模型中没有视觉指示器。

定时器事件监听器被可视化为一个带有时钟图标的圆圈：

![cmmn.timereventlistener](assets/cmmn/cmmn.timereventlistener.png)

#### 用户事件监听器

当需要捕获直接影响案例状态的用户交互时,可以使用用户事件监听器,而不是通过间接影响案例中的变量或信息。
用户事件监听器的一个典型用例是 UI 中的按钮,用户可以点击这些按钮来驱动案例实例的状态。
当事件被触发时,会抛出一个*发生(Occur)*事件,哨兵可以监听这个事件。
与定时器事件监听器一样,它具有比*任务*更简单的生命周期。

![cmmn.usereventlistener](assets/cmmn/cmmn.usereventlistener.png)

用户事件监听器可以使用 *org.flowable.cmmn.api.runtime.UserEventListenerInstanceQuery* 进行查询。可以通过调用 *cmmnRuntimeService.createUserEventListenerInstanceQuery()* 方法创建这样的查询。请注意,用户事件监听器也是一个计划项实例,这意味着它也可以通过 *org.flowable.cmmn.api.runtime.PlanItemInstanceQuery* API 进行查询。

用户事件监听器可以通过调用 *cmmnRuntimeService.completeUserEventListenerInstance(id)* 方法来完成。

#### 通用事件监听器

通用事件监听器通常用于模型化程序交互(例如,调用外部系统来更改案例实例中的内容)。

![cmmn.generic event listener](assets/cmmn/cmmn.generic-event-listener.png)

用于检索和完成这些事件监听器的 API 位于 *CmmnRuntimeService* 上：

    GenericEventListenerInstanceQuery createGenericEventListenerInstanceQuery();
    void completeGenericEventListenerInstance(String genericEventListenerInstanceId);

与*用户事件监听器*类似,此 API 是 *PlanItemInstance* 查询和操作的包装器。这意味着数据也可以通过常规的 *PlanItemInstanceQuery* 获取。

请注意,通用事件监听器不是 CMMN 规范的一部分,而是 Flowable 特有的扩展。

#### 事件监听器的自动移除

引擎会自动检测事件监听器(用户或定时器)何时不再有用。
以下面的案例定义为例：

![cmmn.user event listener removal 1](assets/cmmn/cmmn.user-event-listener-removal-1.png)

这里,*第一阶段*包含两个人工任务(A 和 B),当触发*停止第一阶段*用户事件时,用户可以退出该阶段。
然而,当任务 A 和 B 都完成时,该阶段也会完成。如果此时触发用户事件监听器,将没有任何东西在监听这个事件。
引擎会检测到这一点并自动终止用户事件。

同样的机制也适用于被进入哨兵引用的事件监听器：

![cmmn.user event listener removal 2](assets/cmmn/cmmn.user-event-listener-removal-2.png)

在这种情况下,如果触发了 *EventListenerA*,*EventListenerB* 将被终止(因为没有任何东西在监听它的发生)。

或者,当定时器和用户事件监听器混合使用时,首先被触发的那个也会导致其他监听器被移除(当它们没有在其他地方被引用时)：

![cmmn.user event listener removal 3](assets/cmmn/cmmn.user-event-listener-removal-3.png)

这里,如果用户事件先被触发,定时器将被移除(反之亦然)。

检测还会考虑尚未创建的计划项。以下面的案例定义为例：

![cmmn.user event listener removal 4](assets/cmmn/cmmn.user-event-listener-removal-4.png)

这里,当为此案例定义启动案例实例时,人工任务 *C* 尚未创建。只要 *C* 有一个处于非终止状态的父阶段,用户事件监听器就不会被移除,因为这意味着将来仍可能监听该事件。

#### 可用条件

所有类型的事件监听器都可以配置一个**可用条件**：一个用于控制事件监听器可用状态的表达式。为了解释这个用例，请看以下案例定义：

![cmmn.create condition](assets/cmmn/cmmn.create-condition.png)

当案例实例启动时，阶段 1（因为没有进入条件）将立即从*可用*状态移动到*活动*状态。人工任务 A 也是类似的情况。人工任务 B 将从*可用*状态移动到*启用*状态，因为它需要手动激活。

通常情况下，事件监听器也会变为*可用*状态。事件监听器的生命周期比人工任务等计划项更简单：事件监听器在事件发生之前一直保持在*可用*状态。与其他计划项不同，没有*活动*状态。
这意味着用户可以在启动后触发它，阶段就会退出。

然而，在某些用例中，除非满足特定条件，否则事件监听器不应该对用户*可用*（或者在使用定时器事件监听器时不应该启动）。

在上面的例子中，我们希望只在阶段不再有任何活动的子项（或必需的子项）时才创建它。将**availableCondition**设置为**${cmmn:isStageCompletable()}**将允许创建事件监听器，使其立即移动到*可用*状态。具体到这个模型，当人工任务 A 完成时，阶段 1 变为*可完成*状态（因为人工任务 B 是手动激活且非必需的）。这使得事件监听器的*可用条件*变为*true*，事件监听器现在可供用户决定退出该阶段。

注意：这是 Flowable 对 CMMN 规范的特定扩展。如果没有这个扩展，事件监听器就必须嵌套在一个子阶段中，该子阶段受进入条件保护，监听任务 A 的完成。

注意：如果这是一个自动完成的阶段，当 A 完成时引擎会自动完成该阶段。

### 项目控制：重复规则

案例模型中的计划项可以有一个*重复规则*：一个用于指示某个计划项需要重复的表达式。
当没有设置表达式，但启用了重复（例如，在 Flowable 建模器中勾选了复选框）或表达式为空时，默认假定为*true*值。

可以设置一个可选的*重复计数器变量*，它保存实例的索引（基于 1）。如果未设置，默认变量名为 *repetitionCounter*。

如果计划项没有任何进入条件，重复规则表达式会在计划项完成或终止时进行评估。如果表达式解析为*true*，就会创建一个新实例。例如，具有重复规则表达式 *${repetitionCounter < 3}* 的人工任务将创建三个顺序的人工任务。

如果计划项有进入条件，行为会有所不同。重复规则不是在完成或终止时评估，而是在计划项的哨兵满足时评估。如果哨兵满足且重复规则评估为 true，就会创建一个新实例。

例如，以下是一个定时器事件监听器后跟一个人工任务的示例。哨兵对定时器事件监听器的*发生*事件有一个进入条件。请注意，在任务上启用和设置重复规则在矩形底部有一个视觉指示器。

![cmmn.repeatingtimereventlistener](assets/cmmn/cmmn.repeatingtimereventlistener.png)

如果定时器事件监听器是重复的（例如，*R/PT1H*），*发生*事件将每小时触发一次。当人工任务的重复规则表达式评估为 true 时，每小时都会创建一个新的人工任务实例。

请注意，Flowable 允许重复的用户和通用事件监听器。这与 CMMN 规范相反（规范不允许这样做），但我们认为这对于更灵活地使用事件监听器是必需的（例如，用于建模用户可能多次触发导致创建任务的操作的情况）。

#### 重复规则：最大实例数属性

Flowable CMMN 模型中有一个扩展属性，用于对重复规则进行更多控制，以控制同时活动的计划项实例的数量。
假设你有一个带有重复和带条件的进入哨兵的计划项。根据规范，只要条件为 true，就会创建无限数量的计划项实例，这可能不是期望的行为。
通过重复规则上的 *maxInstanceCount* 属性，你可以定义是否可以有无限数量的实例（根据规范默认如此）或者是否应该一次只有一个实例或任何特定的最大实例数。
如果你有重复并将 *maxInstanceCount* 设置为 *unlimited*，你需要以某种方式控制条件，使其只创建你想要的实例数量，或者将其与 on-part（触发器）结合使用，只在触发器触发时创建新实例。

以下是一个用户任务的示例，它结合了重复、进入哨兵和条件，并确保一次只创建一个实例：

    ...
    <planItem id="planItem1" name="Task 1" definitionRef="humanTask1">
      <itemControl>
        <repetitionRule flowable:maxInstanceCount="1"></repetitionRule>
      </itemControl>
      <entryCriterion id="entryCriterion1" flowable:sentryRef="sentry1"></entryCriterion>
    </planItem>
    <sentry id="sentry1">
      <ifPart>
        <condition><![CDATA[${vars:getOrDefault('enableTaskA', false)}]]></condition>
      </ifPart>
    </sentry>
    ...

以下是一个具有重复和重复条件的用户任务示例，用于控制创建的实例数量（在此示例中将创建 5 个任务）：

    <planItem id="planItem1" name="Task 1" definitionRef="humanTask1">
      <itemControl>
        <repetitionRule flowable:counterVariable="repetitionCounter" flowable:maxInstanceCount="unlimited">
          <condition><![CDATA[${vars:getOrDefault('repetitionCounter', 0) <= 5}]]></condition>
        </repetitionRule>
      </itemControl>
    </planItem>

#### 重复规则：重复集合变量

类似于 BPMN 中的多实例类型，你也可以在 CMMN 中将重复规则与集合中的项目结合使用。
重复规则有扩展属性，可以利用元素集合来创建计划项实例。

以下是可用的扩展属性列表，用于控制基于集合（列表）的重复规则：

-   **collectionVariable**，将此属性设置为集合变量的名称或解析为集合的表达式

-   **elementVariable**，如果设置了集合变量，你可以选择设置一个元素变量，在运行时用作计划项实例的局部变量来保存元素

-   **elementIndexVariable**，如果设置了集合变量，你可以选择设置一个元素索引变量，在运行时用作计划项实例的局部变量来保存索引（基于 0）

根据集合如何与重复一起使用，其评估时间可能会有所不同。

如果有一个 on-part（触发计划项的事件）与集合变量结合，它会在该 on-part 触发时进行评估，如果此时集合为空或为 null，则不会创建计划项实例。

如果 on-part 与 if-part 和基于集合的重复结合使用，行为是相同的，但是，if-part 可能有延迟的事件触发处理，这意味着在检查重复的集合之前，计划项会等待 if-part 被满足。
换句话说：集合需要在 if-part 满足且 on-part 触发（或之前已触发）时存在，然后评估集合并根据其元素启动新的计划项实例。

如果没有 on-part 和 if-part，集合变量会在每个评估周期中进行评估，一旦它不为 null，就会用于创建新的计划项实例，即使它是空的。
这只会执行一次，然后计划项就会终止。以这种方式使用集合重复时，请确保集合变量在你想要评估它进行重复的确切时刻可用，否则，将其与 if-part 结合使用。

如果有 if-part（但没有 on-part）与用于重复的集合变量结合，评估会等待直到 if-part 被满足，之后，集合变量会被评估是否为非 null。
当 if-part 被满足且集合不为 null（但可能为空）时，该集合用于重复，然后计划项终止。

以下是结合集合变量的重复规则示例：

    <planItem id="planItem1" name="Task (${vars:getOrDefault('item', 'na')} - ${vars:getOrDefault('itemIndex', 'na')})" definitionRef="humanTask1">
        <itemControl>
            <repetitionRule flowable:counterVariable="repetitionCounter" flowable:collectionVariable="myCollection" flowable:elementVariable="item" flowable:elementIndexVariable="itemIndex"></repetitionRule>
        </itemControl>
    </planItem>

该示例使用名为 *myCollection* 的集合变量，并指定了一个元素变量和元素索引变量。它们都用于计划项实例名称中的名称表达式。
由于没有进入哨兵，集合在每个评估周期中都会被评估，一旦 *myCollection* 不再为 null，它就会用于重复。

### 项目控制：手动激活规则

案例模型中的计划项可以有一个*手动激活规则*：一个用于指示某个计划项需要由*最终用户手动激活*的表达式。
当没有设置表达式，但启用了手动激活（例如，在 Flowable 建模器中勾选了复选框）或表达式为空时，默认假定为*true*值。

阶段和所有任务类型都可以标记为手动激活。在视觉上，任务或阶段会显示一个"播放"图标（指向右侧的小三角形），表示最终用户需要手动激活它：

![cmmn.manual activation](assets/cmmn/cmmn.manual-activation.png)

通常，当计划项的哨兵满足时（或计划项没有任何哨兵），计划项实例会自动移动到*活动*状态。但是，当设置了手动激活并且其评估为 true 时，计划项实例现在会变为*启用*状态而不是*活动*状态。顾名思义，这背后的想法是最终用户需要手动激活计划项实例。一个典型的用例是显示一个按钮列表，显示当前可以由最终用户启动的潜在计划项实例。

要启动一个已启用的计划项实例，可以使用 *CmmnRuntimeService* 的 *startPlanItemInstance* 方法：

    List<PlanItemInstance> enabledPlanItemInstances = cmmnRuntimeService.createPlanItemInstanceQuery()
        .caseInstanceId(caseInstance.getId())
        .planItemInstanceStateEnabled()
        .list();

    // ...

    cmmnRuntimeService.startPlanItemInstance(planItemInstance.getId());

请注意，只有当计划项实例移动到*活动*状态时，才会执行任务的行为。例如，对于人工任务，只有在调用 *startPlanItemInstance* 方法后才会创建用户任务。

已启用的计划项实例可以移动到*禁用*状态：

    cmmnRuntimeService.disablePlanItemInstance(planItemInstance.getId());

已禁用的计划项实例可以再次启用：

    cmmnRuntimeService.enablePlanItemInstance(planItemInstance.getId());

请注意，在确定阶段或案例实例终止时，*禁用*状态被视为"终止"状态。这意味着当只剩下禁用的计划项实例时，案例实例将终止。

### 项目控制：必需规则

案例模型中的计划项可以有一个*必需规则*：一个用于指示某个计划项是否被*其所在的阶段（或计划模型）所必需*的表达式。这可以用来指示案例模型中哪些计划项是必须执行的，哪些是可选的。

当没有设置表达式，但启用了必需规则（例如，在 Flowable 建模器中勾选了复选框）或表达式为空时，默认假定为*true*值。

*必需规则*与父阶段上的*自动完成*属性配合使用：

-   如果阶段的*自动完成*解析为*false*（这也是未设置时的默认值），引擎要完成该阶段的计划项实例，**所有**子计划项实例必须处于终止状态（完成、终止等）

-   如果阶段的*自动完成*解析为*true*，对于**必需规则评估为 true** 的所有子计划项实例需要处于终止状态。如果也没有其他活动的子计划项实例，阶段会自动完成

*阶段计划项实例*有一个**可完成**属性，可用于查看是否满足完成条件。
例如，看下面这个简单的阶段，假设*必需任务*的哨兵评估为 true，而另一个评估为 false。这意味着左侧的计划项实例将处于活动状态，而右侧的将处于*可用*状态。

![cmmn.completeable stage](assets/cmmn/cmmn.completeable-stage.png)

由于阶段有一个活动的子计划项实例，无法调用 *cmmnRuntimeService.completeStagePlanItemInstance(String stagePlanItemInstanceId)*（会抛出异常）。当左侧的用户任务完成后，由于当前没有活动的子计划项实例，现在可以调用 *completeStagePlanItemInstance*。但是，阶段本身不会自动完成，因为右侧的用户任务处于可用状态。

如果将前一个阶段更改为**可自动完成**（这通过阶段底部的黑色矩形来可视化）并将左侧的计划项更改为必需（这通过感叹号来可视化），行为将有所不同：

![cmmn.completeable stage02](assets/cmmn/cmmn.completeable-stage02.png)

-   如果左侧计划项实例处于活动状态（哨兵为 true）而右侧不是（哨兵为 false）。在这种情况下，当左侧用户任务完成时，阶段实例将自动完成，因为它没有活动的子计划项实例，且所有必需的计划项实例都处于终止状态

-   如果左右两个用户任务都处于活动状态（哨兵为 true）

    -   当左侧用户任务完成时，阶段不会自动完成，因为仍有一个子计划项实例处于活动状态

    -   当右侧用户任务完成时，阶段不会自动完成，因为必需的左侧子计划项实例不处于终止状态

-   如果左侧计划项实例不活动而右侧活动。在这种情况下，当右侧用户任务完成时，阶段不会自动完成，因为必需的左侧用户任务不处于终止状态。它需要变为活动状态并完成才能完成阶段。

请注意，手动激活规则独立于必需规则工作。例如，给定以下阶段：

![cmmn.completeable stage03](assets/cmmn/cmmn.completeable-stage03.png)

这里，用户任务 D 是必需的，用户任务 B 是手动激活的。

-   如果 D 完成，阶段将自动完成，因为 B 不是必需的且它不处于活动状态

-   如果 B 也是必需的，即使 D 在 B 手动启动之前就完成了，它也需要手动启动（使用 *cmmnRuntimeService.startPlanItemInstance(String planItemInstanceId)*）阶段才能自动完成

### 项目控制：完成中立规则

案例模型中的计划项可以有一个*完成中立规则*：一个用于指示某个计划项对其父阶段（或计划模型）的完成是*中立的*的表达式。这可以用来指示案例模型中哪些计划项是必须执行的，哪些是可选的，在某些用例中，这是使用*必需规则*和*自动完成*的一个更灵活的替代方案。

请注意，*完成中立规则*不是 CMMN 1.1 标准的一部分，而是 Flowable 特有的扩展。

根据规范，处于**可用**状态的计划项的阶段不会完成，除非其*自动完成*属性设置为*true*且该计划项不是必需的。例如，具有未满足哨兵的计划项会保持在**可用**状态，直到哨兵被满足。这意味着父阶段不会完成，除非计划项被标记为*非必需*且阶段设置为*自动完成*。缺点是一旦阶段被标记为自动完成，所有子计划项都需要配置*必需规则*，这在某些用例中很繁琐且工作量大。

与自动完成-必需机制相反，*完成中立规则*采用"自下而上"的方式工作：可以单独标记计划项为*对其父级完成中立*，而无需标记任何其他计划项。

当具有这两个规则的计划项都评估为*true*时，*必需规则*优先。

总结一下：

-   配置为*"完成中立"*的计划项如果处于**可用**状态（例如，等待进入条件哨兵），将允许阶段自动完成，这意味着该计划项对其父阶段完成评估是中立的。

-   在以下任何条件下，阶段将保持**活动**状态：

    1.  它至少有一个处于**活动**状态的计划项

    2.  它至少有一个具有*必需规则*且处于**可用**或**启用**状态的计划项

    3.  它未标记为*自动完成*且至少有一个处于**启用**状态的计划项（不考虑其*必需规则*）

    4.  它未标记为*自动完成*且至少有一个处于**可用**状态且**不是**完成中立的计划项

-   在以下情况下，阶段将**完成**：

    1.  它不包含任何计划项，或所有子计划项都处于*终止*或*半终止*状态（关闭、完成、禁用、失败）

    2.  它未标记为*自动完成*，且所有剩余的子计划项都处于**可用**状态，且都是*完成中立*的且不是必需的

    3.  它是*自动完成*的，且所有剩余的计划项在**启用**或**可用**状态下都是*非必需*的（不考虑其完成中立性，因为必需规则优先）

### 项目控制：父级完成规则

除了*完成中立规则*（即将废弃）之外，*父级完成规则*在评估阶段或案例计划模型是否可完成时提供了更大的灵活性。
虽然有*自动完成*的可能性在所有必需和活动的工作完成时自动完成阶段，但有时你想要一种更细粒度的方式来处理现有计划项实例在评估其父级是否可完成时的行为。
通过父级完成规则，你可以定义计划项在其父级完成评估时的行为。

以下是当前支持的父级完成规则类型列表：

-   **default**：如果需要按照 CMMN 规范的默认行为，请使用此值。

-   **ignore**：使用此值时，在评估父级完成状态时会完全忽略该计划项。这特别有用，如果你有一些计划项（例如案例页面）需要完全忽略，因为它们对案例执行或阶段完成评估没有影响。

-   **ignoreIfAvailable**：使用此值时，只有当计划项处于*可用*状态时才会被忽略，但如果它处于*活动*或*启用*状态，则会阻止阶段完成。

-   **ignoreIfAvailableOrEnabled**：此值包括忽略*启用*（等待手动激活）状态，只有*活动*实例才会阻止阶段完成。

-   **ignoreAfterFirstCompletion**：例如，如果你有一个具有重复性的用户任务，并且你想确保它至少完成一次，但之后即使它处于*活动*状态也不应阻止其父级完成，这个值就很有用。

-   **ignoreAfterFirstCompletionIfAvailableOrEnabled**：与前一个相比，如果你希望计划项在首次完成后被忽略，且它处于*可用*或*启用*状态但当前不是*活动*状态，请使用此值。

以下是如何为计划项使用**父级完成规则**的示例。此示例将其与重复、必需规则甚至手动激活结合使用。
因此，如果它尚未启动并至少完成一次，它将阻止其父级完成，但如果它已完成一次且之后不处于*活动*状态，则不再阻止。

    <planItem id="planItem1" name="Task A" definitionRef="humanTask1">
        <itemControl>
            <extensionElements>
                <flowable:parentCompletionRule type="ignoreAfterFirstCompletionIfAvailableOrEnabled" />
            </extensionElements>
            <repetitionRule></repetitionRule>
            <requiredRule></requiredRule>
            <manualActivationRule></manualActivationRule>
        </itemControl>
    </planItem>

## 哨兵评估

哨兵在任何案例定义中都扮演着重要角色，因为它们提供了一种强大的声明式方式来配置某些计划项实例何时激活或何时自动停止。
因此，Flowable CMMN 引擎核心逻辑最重要的部分之一就是评估哨兵，以查看案例实例中发生了哪些状态变化。

### 哨兵何时被评估？

当案例实例中发生状态变化或发生新事件时，会评估哨兵。具体来说，这意味着：

-   当案例实例启动时。

-   当等待状态的计划项（如人工任务）被触发继续时。

-   当与案例实例相关的变量发生变化时（添加、更新或删除）。

-   当计划项实例的状态发生变化时（例如，通过 RuntimeService 终止，手动计划项实例启动等）。

-   当通过 RuntimeService\#evaluateCriteria 方法手动触发时。

只要变化持续发生，引擎就会继续计划对所有当前活动的哨兵进行新的评估。
例如，假设一个人工任务的完成满足了另一个人工任务的退出哨兵。第二个人工任务的状态变化将再次安排对所有活动哨兵进行新的评估，并包含这个新信息。当最后一次评估期间没有发生变化时，引擎认为状态稳定并停止评估。

### 概念

哨兵由两部分组成：

-   一个或多个引用其他计划项生命周期事件的 *onParts*

-   零个或一个带有条件的 ifPart

以下面的案例定义为例：

![cmmn.sentry eval 01](assets/cmmn/cmmn.sentry-eval-01.png)

假设（图中未显示）

-   任务 C 上的进入哨兵监听来自任务 A 和 B 的*完成*事件。

-   退出哨兵监听用户事件监听器 *'Stop C'* 的*发生*事件。

-   进入哨兵的条件表达式设置为 *${var:eq(myVar, 'hello world')}*。

在这个简单的例子中，*进入哨兵*有两个 onParts 和一个 ifPart。*退出哨兵*只有 onPart。

当案例实例启动时，人工任务 A 和 B 被创建（因为它们没有进入哨兵）并立即移动到*活动*状态。C 不是*活动*的，而是*可用*的，因为哨兵尚未满足。用户事件监听器 *'Stop C'* 从一开始也是*可用*的，因此可以被触发。

当任务 A 和 B 都完成，且变量 *myVar* 设置为 *'hello world'* 时，进入哨兵被满足并触发。C 背后的计划项实例移动到*活动*状态，作为副作用，人工任务 C 被创建（现在可以通过 *TaskService* 查询它）。
当 *'Stop C'* 被触发时（通过 *CmmnRuntimeService\#completeUserEventListenerInstance* 方法），C 的退出哨兵被满足，C 被终止。

如果在 C 移动到*活动*状态之前触发 *'Stop C'*，其计划项实例将被终止，进入哨兵将不再监听任何内容。

### 默认行为

当案例实例启动时：

    CaseInstance caseInstance = cmmnRuntimeService.createCaseInstanceBuilder()
        .caseDefinitionKey("myCase")
        .start();

进入哨兵上的条件会立即被评估，因为在案例实例启动时会发生常规的评估周期。

请注意，如果使用像 *${myVar == 'hello world'}* 这样的条件表达式，这将不起作用。引擎会抛出 *PropertyNotFound* 异常，因为它不知道 *myVar* 变量。

要解决这个问题：

-   在案例实例启动时传递 *myVar* 的变量值

-   在表达式中进行空值检查，如 *${planItemInstance.getVariable('myVar') != null && planItemInstance.getVariable('myVar') == 'hello world'}*

-   或者（可能是最简单的），查看[表达式函数](cmmn/ch03-API.md#expression-functions)使用像 *${var:eq(myVar, 'hello world')}* 这样的函数，它会考虑到变量可能不存在的情况。

**默认评估逻辑具有"记忆"功能，这意味着当哨兵的某个部分被满足时，引擎会在后续评估中存储并"记住"这一点。**

这意味着，从哨兵的某个部分（onPart 或 ifPart）被满足的那一刻起，在后续的评估中不会再评估该特定部分，并认为它为真。

在上面的例子中，这是必需的，因为任务 A 通常会在与任务 B 不同的时间点完成。例如，如果任务 A 完成了，任务 C 上哨兵中说"我正在监听任务 A 的完成事件"的部分现在被满足了，这个事实会被记住以供将来使用。如果现在 B 完成了，这也会被存储。如果现在 *myVar* 变量获得了正确的值，ifPart 也会触发，整个哨兵触发，任务 C 被激活。当然，也可能是变量值先满足，然后是任务。重点是这无关紧要，因为引擎会记住过去满足的部分。

这种"带记忆"的行为是引擎的默认行为，通过将哨兵的 *triggerMode* 设置为 **default** 来实现。在 Flowable 建模器中添加新计划项时会自动设置这个值。当没有设置值时（例如从其他工具导入案例模型时），*triggerMode* 被假定为 *default*。

### 触发模式 "onEvent"

默认行为（见上一节）会记住之前哪些部分已被满足。这是最常用和最安全的方法（也是在考虑哨兵时通常期望的行为）。

有一种替代的哨兵触发模式，称为 **"onEvent"**。在这种模式下，引擎会记住哨兵的部分内容，但**不会记住**过去满足的任何部分。这在一些高级用例中有时是必需的。以下面的例子为例：

![cmmn.sentry eval 02](assets/cmmn/cmmn.sentry-eval-02.png)

这里，案例模型有一个包含三个子阶段的阶段。所有子阶段都是重复的。子阶段 B 和 C 都有一个监听阶段 B 完成的进入哨兵。此外（图中未显示），两个哨兵都有一个依赖于变量的条件。

在高级用例中，可能需要哨兵部分（特别是包含条件的 ifPart）仅在*依赖计划项的生命周期事件*发生时才进行评估。在本例中，这是 *阶段 A* 的*完成*事件。对于这些用例，可以将哨兵的 *triggerMode* 设置为 *onEvent*。顾名思义，这意味着哨兵评估仅在引用的事件发生时进行，不考虑过去的任何记忆。

具体来说，在这个例子中，进入哨兵的条件**仅**在阶段 A 完成时（且仅在此时）进行评估。这与一般的评估规则有很大不同。在这个特定的例子中，它确实使变量管理变得更容易，因为条件仅在一个精确的时刻进行评估，不需要担心由于变量在某个时间点有值而触发某个哨兵部分。特别是在这个例子中，所有子阶段都是重复的，这将是一项大量的工作。这是一个强大的机制，但它是为那些对案例模型和这种触发模式的语义有深入了解的高级建模者设计的。

请注意，在评估哨兵时，引擎认为所有事件都是同时发生的。看看下面的案例定义：

![cmmn.sentry eval 03](assets/cmmn/cmmn.sentry-eval-03.png)

假设所有哨兵都使用 *triggerMode onEvent* 设置。如果任务 A 完成，这会导致任务 B 退出。任务 C 现在也会退出。所以，即使有两个不同的生命周期事件（A 完成和 B 退出），并且人们可能认为 *onEvent* 字面意思是有两个不同的评估发生，其中任务 C 上退出哨兵的另一部分的记忆被遗忘，但引擎足够智能，能够看到它们是同一评估周期的一部分，任务 C 也会退出。

从技术角度讲：*onEvent* 哨兵确实有*一些*记忆，更具体地说，是对在同一个 API 调用（或者从底层来说，同一个事务）期间发生的评估的记忆。

**重要提示：onEvent 是一个强大的机制，只有在充分理解其语义时才应使用。如果用例没有仔细检查，可能会由于没有正确的哨兵配置而导致案例模型陷入停滞。**

（例如，假设一个哨兵有一个监听计划项完成的 onPart 和一个带条件的 ifPart。如果计划项完成 - 从而触发 onPart - 但由于某种原因条件中使用的变量丢失了……ifPart 将永远不会触发，案例实例可能会陷入不想要的状态）。
