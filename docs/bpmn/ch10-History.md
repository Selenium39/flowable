---
id: ch10-History
title: 历史
description: Flowable BPMN历史组件详解，介绍6种历史实体的功能及查询方法，帮助开发者有效管理流程执行数据，优化运行时性能。
keywords: Flowable,BPMN,历史数据,流程实例,历史查询,HistoryService,变量实例,活动实例
---

历史是一个捕获流程执行过程中发生的事件并永久存储的组件。与运行时数据不同，即使在流程实例完成后，历史数据仍然会保留在数据库中。

有 6 种历史实体：

-   HistoricProcessInstances（历史流程实例）包含当前和过去流程实例的信息。

-   HistoricVariableInstances（历史变量实例）包含流程变量或任务变量的最新值。

-   HistoricActivityInstances（历史活动实例）包含单个活动执行（流程中的节点）的信息。

-   HistoricTaskInstances（历史任务实例）包含当前和过去（已完成和已删除）任务实例的信息。

-   HistoricIdentityLinks（历史身份链接）包含任务和流程实例上当前和过去身份链接的信息。

-   HistoricDetails（历史详情）包含与历史流程实例、活动实例或任务实例相关的各种信息。

由于数据库包含过去和正在进行的实例的历史实体，你可能需要考虑查询这些表以最小化对运行时流程实例数据的访问，从而保持运行时执行的性能。

## 查询历史

在 API 中，可以查询全部 6 种历史实体。HistoryService 提供了以下方法：createHistoricProcessInstanceQuery()、createHistoricVariableInstanceQuery()、createHistoricActivityInstanceQuery()、getHistoricIdentityLinksForTask()、getHistoricIdentityLinksForProcessInstance()、createHistoricDetailQuery() 和 createHistoricTaskInstanceQuery()。

下面是一些展示历史查询 API 功能的示例。完整的功能描述可以在 [javadocs](http://www.flowable.org/docs/javadocs/index.html) 的 org.flowable.engine.history 包中找到。

### 历史流程实例查询

获取已完成的所有流程定义为 'XXX' 的流程中，耗时最长（持续时间最长）的 10 个历史流程实例。

    historyService.createHistoricProcessInstanceQuery()
      .finished()
      .processDefinitionId("XXX")
      .orderByProcessInstanceDuration().desc()
      .listPage(0, 10);

### 历史变量实例查询

获取 id 为 'xxx' 的已完成流程实例的所有历史变量实例，按变量名排序。

    historyService.createHistoricVariableInstanceQuery()
      .processInstanceId("XXX")
      .orderByVariableName.desc()
      .list();

### 历史活动实例查询

获取在使用流程定义 id 为 XXX 的任何流程中已完成的最后一个类型为 'serviceTask' 的历史活动实例。

    historyService.createHistoricActivityInstanceQuery()
      .activityType("serviceTask")
      .processDefinitionId("XXX")
      .finished()
      .orderByHistoricActivityInstanceEndTime().desc()
      .listPage(0, 1);

### 历史详情查询

下面的示例获取在 id 为 123 的流程中进行的所有变量更新。此查询将只返回历史变量更新。请注意，某个变量名可能有多个历史变量更新条目，对应流程中每次变量更新的时间。你可以使用 orderByTime（变量更新的时间）或 orderByVariableRevision（更新时运行时变量的修订版本）来确定它们发生的顺序。

    historyService.createHistoricDetailQuery()
      .variableUpdates()
      .processInstanceId("123")
      .orderByVariableName().asc()
      .list()

这个示例获取在任何任务中或在启动 id 为 "123" 的流程时提交的所有[表单属性](bpmn/ch08-Forms.md#form-properties)。此查询将只返回历史表单属性。

    historyService.createHistoricDetailQuery()
      .formProperties()
      .processInstanceId("123")
      .orderByVariableName().asc()
      .list()

最后一个示例获取在 id 为 "123" 的任务上执行的所有变量更新。这将返回在任务上设置的变量（任务本地变量）的所有历史变量更新，而不是在流程实例上的变量更新。

    historyService.createHistoricDetailQuery()
      .variableUpdates()
      .taskId("123")
      .orderByVariableName().asc()
      .list()

任务本地变量可以使用 TaskService 或在 TaskListener 中的 DelegateTask 上设置：

    taskService.setVariableLocal("123", "myVariable", "Variable value");

    public void notify(DelegateTask delegateTask) {
      delegateTask.setVariableLocal("myVariable", "Variable value");
    }

### 历史任务实例查询

获取所有任务中已完成且耗时最长（持续时间最长）的 10 个历史任务实例。

    historyService.createHistoricTaskInstanceQuery()
      .finished()
      .orderByHistoricTaskInstanceDuration().desc()
      .listPage(0, 10);

获取删除原因包含 "invalid" 且最后分配给用户 'kermit' 的历史任务实例。

    historyService.createHistoricTaskInstanceQuery()
      .finished()
      .taskDeleteReasonLike("%invalid%")
      .taskAssignee("kermit")
      .listPage(0, 10);

## 历史配置

历史级别可以通过编程方式配置，使用 org.flowable.engine.impl.history.HistoryLevel 枚举（或在 5.11 版本之前的 ProcessEngineConfiguration 上定义的 *HISTORY* 常量）：

    ProcessEngine processEngine = ProcessEngineConfiguration
      .createProcessEngineConfigurationFromResourceDefault()
      .setHistory(HistoryLevel.AUDIT.getKey())
      .buildProcessEngine();

也可以在 flowable.cfg.xml 或 spring-context 中配置级别：

    <bean id="processEngineConfiguration" class="org.flowable.engine.impl.cfg.StandaloneInMemProcessEngineConfiguration">
      <property name="history" value="audit" />
      ...
    </bean>

可以配置以下历史级别：

-   none：跳过所有历史存档。这对运行时流程执行性能最好，但不会有任何历史信息可用。

-   activity：存档所有流程实例和活动实例。在流程实例结束时，顶层流程实例变量的最新值将被复制到历史变量实例中。不会存档详细信息。

-   audit：这是默认设置。它会存档所有流程实例、活动实例，持续同步变量值，以及所有提交的表单属性，这样所有通过表单进行的用户交互都可以被追踪和审计。

-   full：这是最高级别的历史存档，因此也是最慢的。这个级别存储了与 audit 级别相同的所有信息，以及所有其他可能的细节，主要是流程变量更新。

**在旧版本中，历史级别存储在数据库中（表 ACT\_GE\_PROPERTY，属性名为 historyLevel）。从 5.11 版本开始，这个值不再使用，并且会从数据库中被忽略/删除。现在可以在引擎两次启动之间更改历史级别，即使级别与上次引擎启动时不同也不会抛出异常。**

## 用于审计目的的历史记录

当[配置](bpmn/ch10-History.md#history-configuration)至少为 audit 级别时，通过方法 FormService.submitStartFormData(String processDefinitionId, Map<String, String> properties) 和 FormService.submitTaskFormData(String taskId, Map<String, String> properties) 提交的所有属性都会被记录。

可以使用查询 API 获取表单属性，如下所示：

    historyService
          .createHistoricDetailQuery()
          .formProperties()
          ...
          .list();

在这种情况下，只会返回 HistoricFormProperty 类型的历史详情。

如果你在调用提交方法之前使用 IdentityService.setAuthenticatedUserId(String) 设置了认证用户，那么提交表单的认证用户也可以在历史记录中访问，对于开始表单使用 HistoricProcessInstance.getStartUserId()，对于任务表单使用 HistoricActivityInstance.getAssignee()。

## 历史清理

默认情况下，历史数据会永久存储，这可能导致历史表变得非常大，并影响 HistoryService 的性能。历史清理功能在 6.5.0 版本中引入，允许删除历史流程实例及其相关数据。一旦不再需要保留流程数据，就可以删除它以减小历史数据库的大小。
历史流程的删除是使用 Flowable 批处理机制完成的，通过调度作业来批量删除流程，并将已完成操作的信息存储在批处理表中。

### 自动历史清理配置

默认情况下，历史流程实例的自动清理是禁用的，但可以通过编程方式启用和配置。启用后，默认会在凌晨 1 点运行清理作业，删除所有在 365 天前或更早结束的历史流程实例及其相关数据。

    ProcessEngine processEngine = ProcessEngineConfiguration
        .createProcessEngineConfigurationFromResourceDefault()
        .setEnableHistoryCleaning(true)
        .setHistoryCleaningTimeCycleConfig("0 0 1 * * ?")
        .setCleanInstancesEndedAfter(Duration.ofDays(365))
        .buildProcessEngine();

在 application.properties 或外部化配置中也可以设置 Spring 属性：

         flowable.enable-history-cleaning=true
         flowable.history-cleaning-after=365d
         flowable.history-cleaning-cycle=0 0 1 * * ?

此外，历史清理也可以在 flowable.cfg.xml 或 spring-context 中配置：

     <bean id="processEngineConfiguration" class="org.flowable.engine.impl.cfg.StandaloneInMemProcessEngineConfiguration">
       <property name="enableHistoryCleaning" value="true"/>
       <property name="historyCleaningTimeCycleConfig" value="0 0 1 * * ?"/>
       <property name="cleanInstancesEndedAfterNumberOfDays" value="365"/>
       ...
     </bean>

### 手动删除历史

可以通过在 HistoryService 查询构建器上执行方法来手动清理历史。

删除所有超过一年的历史流程实例及其相关数据。

     int numberOfProcessesInBatch = 10;
     Calendar cal = new GregorianCalendar();
     cal.set(Calendar.YEAR, cal.get(Calendar.YEAR) - 1);
     historyService.createHistoricProcessInstanceQuery()
       .finishedBefore(cal.getTime())
       .deleteSequentiallyUsingBatch(numberOfProcessesInBatch, "Custom Delete Batch");