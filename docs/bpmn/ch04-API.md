---
id: ch04-API
title: Flowable API
description: 本文详细介绍Flowable流程引擎API及核心服务(如RuntimeService、RepositoryService等)，涵盖线程安全设计、服务初始化方式及RepositoryService的部署管理功能，是使用Flowable进行BPMN流程开发的关键指南。
keywords: Flowable,流程引擎API,BPMN,RepositoryService,线程安全,流程部署,服务初始化
---

## Process Engine API 和服务

Engine API 是与 Flowable 交互最常用的方式。主要的起点是 ProcessEngine,它可以通过[配置章节](bpmn/ch03-Configuration.md#creating-a-processengine)中描述的几种方式创建。通过 ProcessEngine,你可以获取包含工作流/BPM 方法的各种服务。ProcessEngine 和服务对象都是线程安全的,因此你可以在整个服务器中保持对它们的引用。

![api.services](assets/bpmn/api.services.png)

    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine();

    RuntimeService runtimeService = processEngine.getRuntimeService();
    RepositoryService repositoryService = processEngine.getRepositoryService();
    TaskService taskService = processEngine.getTaskService();
    ManagementService managementService = processEngine.getManagementService();
    IdentityService identityService = processEngine.getIdentityService();
    HistoryService historyService = processEngine.getHistoryService();
    FormService formService = processEngine.getFormService();
    DynamicBpmnService dynamicBpmnService = processEngine.getDynamicBpmnService();

ProcessEngines.getDefaultProcessEngine() 在第一次调用时会初始化并构建一个流程引擎,之后总是返回相同的流程引擎。可以通过 ProcessEngines.init() 和 ProcessEngines.destroy() 来正确创建和关闭所有流程引擎。

ProcessEngines 类会扫描所有的 flowable.cfg.xml 和 flowable-context.xml 文件。对于所有的 flowable.cfg.xml 文件,流程引擎将以典型的 Flowable 方式构建:ProcessEngineConfiguration.createProcessEngineConfigurationFromInputStream(inputStream).buildProcessEngine()。对于所有的 flowable-context.xml 文件,流程引擎将以 Spring 方式构建:首先创建 Spring 应用上下文,然后从该应用上下文中获取流程引擎。

所有服务都是无状态的。这意味着你可以轻松地在集群中的多个节点上运行 Flowable,每个节点都连接到相同的数据库,而不用担心实际执行之前调用的是哪台机器。对任何服务的任何调用都是幂等的,无论在哪里执行。

**RepositoryService** 可能是使用 Flowable 引擎时最先需要的服务。该服务提供了管理和操作部署和流程定义的操作。简单来说,流程定义是 BPMN 2.0 流程的 Java 对应物。它表示流程中每个步骤的结构和行为。部署是 Flowable 引擎中的打包单位。一个部署可以包含多个 BPMN 2.0 XML 文件和任何其他资源。一个部署包含什么内容由开发人员决定。它可以是单个流程 BPMN 2.0 XML 文件,也可以是一整套流程和相关资源的包(例如,'hr-processes' 部署可以包含与 HR 流程相关的所有内容)。RepositoryService 可以部署这样的包。部署一个部署包意味着将其上传到引擎,在存储到数据库之前,所有流程都会被检查和解析。从那时起,系统就知道了该部署,部署中包含的任何流程现在都可以启动了。

此外,该服务允许你:

- 查询引擎已知的部署和流程定义。

- 暂停和激活整个部署或特定的流程定义。暂停意味着不能对其执行进一步的操作,而激活则相反,可以启用操作。

- 检索各种资源,如部署中包含的文件或引擎自动生成的流程图。

- 检索流程定义的 POJO 版本,可用于使用 Java 而不是 XML 来检查流程。

虽然 RepositoryService 主要处理静态信息(不变或很少变化的数据),但 **RuntimeService** 则完全相反。它处理启动流程定义的新流程实例。如上所述,流程定义定义了流程中不同步骤的结构和行为。流程实例是这样一个流程定义的一次执行。对于每个流程定义,通常同时运行着许多实例。RuntimeService 也是用于检索和存储流程变量的服务。这些数据特定于给定的流程实例,可以被流程中的各种结构使用(例如,排他网关经常使用流程变量来确定继续流程的路径)。Runtimeservice 还允许你查询流程实例和执行。执行是 BPMN 2.0 中 'token' 概念的表示。基本上,执行是指向流程实例当前位置的指针。最后,当流程实例等待外部触发器并且需要继续流程时,使用 RuntimeService。流程实例可以有各种等待状态,该服务包含各种操作来向实例"发信号"表明已收到外部触发器,流程实例可以继续。

系统用户需要执行的任务是像 Flowable 这样的 BPM 引擎的核心。所有与任务相关的内容都分组在 **TaskService** 中,例如:

- 查询分配给用户或组的任务

- 创建新的*独立*任务。这些是与流程实例无关的任务。

- 操作任务分配给哪个用户或哪些用户以某种方式参与任务。

- 认领和完成任务。认领意味着某人决定成为任务的受理人,这意味着该用户将完成任务。完成意味着"完成任务的工作"。通常这是填写某种形式的表单。

**IdentityService** 非常简单。它支持组和用户的管理(创建、更新、删除、查询等)。重要的是要理解 Flowable 实际上在运行时不会对用户进行任何检查。例如,任务可以分配给任何用户,但引擎不会验证该用户是否为系统所知。这是因为 Flowable 引擎也可以与 LDAP、Active Directory 等服务一起使用。

**FormService** 是一个可选服务。这意味着可以愉快地使用 Flowable 而不需要它,不会牺牲任何功能。该服务引入了*启动表单*和*任务表单*的概念。*启动表单*是在流程实例启动之前向用户显示的表单,而*任务表单*是用户想要完成表单时显示的表单。Flowable 允许在 BPMN 2.0 流程定义中指定这些表单。该服务以易于使用的方式公开这些数据。但这是可选的,因为表单不需要嵌入到流程定义中。

**HistoryService** 公开了 Flowable 引擎收集的所有历史数据。在执行流程时,引擎可以保存大量数据(这是可配置的),例如流程实例启动时间、谁执行了哪些任务、完成任务需要多长时间、在每个流程实例中遵循了哪条路径等。该服务主要公开查询功能以访问这些数据。

在使用 Flowable 编写自定义应用程序时,通常不需要 **ManagementService**。它允许检索有关数据库表和表元数据的信息。此外,它还公开了作业的查询功能和管理操作。作业在 Flowable 中用于各种事情,如定时器、异步延续、延迟暂停/激活等。稍后将详细讨论这些主题。

**DynamicBpmnService** 可用于在不需要重新部署的情况下更改流程定义的部分内容。例如,你可以更改流程定义中用户任务的受理人定义,或更改服务任务的类名。

有关服务操作和引擎 API 的更详细信息,请参阅[javadocs](http://www.flowable.org/docs/javadocs/index.html)。

## 异常策略

Flowable 中的基础异常是 org.flowable.engine.FlowableException,这是一个未检查异常。API 可以随时抛出此异常,但在特定方法中发生的"预期"异常会在[javadocs](http://www.flowable.org/docs/javadocs/index.html)中记录。例如,以下是 TaskService 的一个示例:

    /**
     * Called when the task is successfully executed.
     * @param taskId the id of the task to complete, cannot be null.
     * @throws FlowableObjectNotFoundException when no task exists with the given id.
     */
     void complete(String taskId);

在上面的示例中,当传入一个不存在任务的 id 时,将抛出异常。此外,由于 javadoc **明确指出 taskId 不能为 null,当传入 null 时将抛出 FlowableIllegalArgumentException**。

尽管我们想避免庞大的异常层次结构,但在特定情况下会抛出以下子类。在流程执行或 API 调用期间发生的所有其他错误,如果不符合以下可能的异常,都将作为常规 FlowableExceptions 抛出。

- FlowableWrongDbException: 当 Flowable 引擎发现数据库架构版本与引擎版本不匹配时抛出。

- FlowableOptimisticLockingException: 当由于并发访问相同数据条目而在数据存储中发生乐观锁定时抛出。

- FlowableClassLoadingException: 当请求加载的类未找到或加载时发生错误时抛出(例如 JavaDelegates、TaskListeners 等)。

- FlowableObjectNotFoundException: 当请求或操作的对象不存在时抛出。

- FlowableIllegalArgumentException: 表示在 Flowable API 调用中提供了非法参数、在引擎配置中配置了非法值、提供了非法值或在流程定义中使用了非法值的异常。

- FlowableTaskAlreadyClaimedException: 当调用 taskService.claim(...) 时,如果任务已被认领,则抛出此异常。

## 查询 API

从引擎查询数据有两种方式:查询 API 和原生查询。查询 API 允许你使用流畅的 API 编写完全类型安全的查询。你可以向查询添加各种条件(所有条件都作为逻辑 AND 一起应用)和精确的一个排序。以下代码显示了一个示例:

    List<Task> tasks = taskService.createTaskQuery()
        .taskAssignee("kermit")
        .processVariableValueEquals("orderId", "0815")
        .orderByDueDate().asc()
        .list();

有时你需要更强大的查询,例如,使用 OR 运算符的查询或无法使用查询 API 表达的限制。对于这些情况,我们有原生查询,它允许你编写自己的 SQL 查询。返回类型由你使用的查询对象定义,数据会映射到正确的对象(Task、ProcessInstance、Execution 等)。由于查询将在数据库执行,你必须使用数据库中定义的表名和列名;这需要一些关于内部数据结构的知识,建议谨慎使用原生查询。可以通过 API 检索表名以尽可能减少依赖。

    List<Task> tasks = taskService.createNativeTaskQuery()
      .sql("SELECT * FROM " + managementService.getTableName(Task.class) +
          " T WHERE T.NAME_ = #{taskName}")
      .parameter("taskName", "gonzoTask")
      .list();

    long count = taskService.createNativeTaskQuery()
      .sql("SELECT count(*) FROM " + managementService.getTableName(Task.class) + " T1, " +
          managementService.getTableName(VariableInstanceEntity.class) + " V1 WHERE V1.TASK_ID_ = T1.ID_")
      .count();

## 变量

每个流程实例都需要并使用数据来执行其组成的步骤。在 Flowable 中,这些数据称为*变量*,它们存储在数据库中。变量可以在表达式中使用(例如,在排他网关中选择正确的输出序列流),在调用外部服务的 Java 服务任务中使用(例如提供输入或存储服务调用的结果),等等。

流程实例可以拥有变量(称为*流程变量*),同时*执行*(指向流程活动位置的特定指针)和用户任务也可以拥有变量。一个流程实例可以拥有任意数量的变量。每个变量都存储在 *ACT_RU_VARIABLE* 数据库表的一行中。

所有的 *startProcessInstanceXXX* 方法都有可选参数,用于在创建和启动流程实例时提供变量。例如,来自 *RuntimeService*:

    ProcessInstance startProcessInstanceByKey(String processDefinitionKey, Map<String, Object> variables);

变量可以在流程执行期间添加。例如,(*RuntimeService*):

    void setVariable(String executionId, String variableName, Object value);
    void setVariableLocal(String executionId, String variableName, Object value);
    void setVariables(String executionId, Map<String, ? extends Object> variables);
    void setVariablesLocal(String executionId, Map<String, ? extends Object> variables);

注意,变量可以为给定的执行设置为*本地*(记住,流程实例由执行树组成)。该变量只在该执行中可见,在执行树的更高层中不可见。如果数据不应该传播到流程实例级别,或者变量在流程实例的某个路径中有新值(例如,在使用并行路径时),这可能很有用。

变量也可以被检索,如下所示。注意 *TaskService* 上也存在类似的方法。这意味着任务和执行一样,可以拥有仅在任务持续期间"存活"的本地变量。

    Map<String, Object> getVariables(String executionId);
    Map<String, Object> getVariablesLocal(String executionId);
    Map<String, Object> getVariables(String executionId, Collection<String> variableNames);
    Map<String, Object> getVariablesLocal(String executionId, Collection<String> variableNames);
    Object getVariable(String executionId, String variableName);
    <T> T getVariable(String executionId, String variableName, Class<T> variableClass);

变量经常在[Java 委托](bpmn/ch07b-BPMN-Constructs.md#java-service-task)、[表达式](bpmn/ch04-API.md#expressions)、执行或任务监听器、脚本等中使用。在这些构造中,当前的*执行*或*任务*对象是可用的,可以用于变量的设置和/或检索。最简单的方法是:

    execution.getVariables();
    execution.getVariables(Collection<String> variableNames);
    execution.getVariable(String variableName);

    execution.setVariables(Map<String, object> variables);
    execution.setVariable(String variableName, Object value);

注意,上述所有方法都有带 *local* 的变体可用。

由于历史原因(和向后兼容性),在执行上述任何调用时,后台会从数据库中获取**所有**变量。这意味着如果你有 10 个变量,但只通过 *getVariable("myVariable")* 获取一个,后台会获取并缓存其他 9 个。这不一定是坏事,因为后续调用将不会再次访问数据库。例如,当你的流程定义有三个顺序服务任务(因此是一个数据库事务)时,在第一个服务任务中使用一次调用获取所有变量可能比在每个服务任务中分别获取所需的变量更好。注意,这**同时**适用于获取和设置变量。

当然,当使用大量变量或者只是想要严格控制数据库查询和流量时,这种方式并不合适。为了对此进行更严格的控制,引入了额外的方法,通过添加具有可选参数的新方法,该参数告诉引擎是否获取和缓存所有变量:

    Map<String, Object> getVariables(Collection<String> variableNames, boolean fetchAllVariables);
    Object getVariable(String variableName, boolean fetchAllVariables);
    void setVariable(String variableName, Object value, boolean fetchAllVariables);

当参数 *fetchAllVariables* 使用 *true* 时,行为将完全如上所述:在获取或设置变量时,所有其他变量都将被获取和缓存。

然而,当使用 *false* 作为值时,将使用特定的查询,不会获取或缓存其他变量。只有这里涉及的变量的值会被缓存以供后续使用。

## 瞬时变量

瞬时变量的行为类似于常规变量,但不会被持久化。通常,瞬时变量用于高级用例。如有疑问,请使用常规流程变量。

瞬时变量适用以下规则:

- 瞬时变量完全不存储历史记录。

- 与*常规*变量一样,瞬时变量在设置时会放在*最高父级*上。这意味着当在执行上设置变量时,瞬时变量实际上存储在流程实例执行上。与常规变量一样,如果变量设置在特定执行或任务上,也存在 *local* 变体方法。

- 瞬时变量只能在流程定义中的下一个"等待状态"之前访问。之后,它们就消失了。这里,等待状态指的是流程实例被持久化到数据存储的点。注意,在这个定义中,*async* 活动也是一个"等待状态"!

- 瞬时变量只能通过 *setTransientVariable(name, value)* 设置,但在调用 *getVariable(name)* 时也会返回瞬时变量(也存在 *getTransientVariable(name)*,它只检查瞬时变量)。这样做的原因是为了使表达式的编写更容易,并且使用变量的现有逻辑对两种类型都有效。

- 瞬时变量会*遮蔽*同名的持久变量。这意味着当在流程实例上同时设置了持久变量和瞬时变量时,如果调用 *getVariable("someVariable")*,将返回瞬时变量值。

你可以在大多数公开常规变量的地方设置和获取瞬时变量:

- 在 *JavaDelegate* 实现中的 *DelegateExecution* 上

- 在 *ExecutionListener* 实现中的 *DelegateExecution* 上和在 *TaskListener* 实现中的 *DelegateTask* 上

- 在脚本任务中通过 *execution* 对象

- 通过运行时服务启动流程实例时

- 完成任务时

- 调用 *runtimeService.trigger* 方法时

这些方法遵循常规流程变量的命名约定:

    void setTransientVariable(String variableName, Object variableValue);
    void setTransientVariableLocal(String variableName, Object variableValue);
    void setTransientVariables(Map<String, Object> transientVariables);
    void setTransientVariablesLocal(Map<String, Object> transientVariables);

    Object getTransientVariable(String variableName);
    Object getTransientVariableLocal(String variableName);

    Map<String, Object> getTransientVariables();
    Map<String, Object> getTransientVariablesLocal();

    void removeTransientVariable(String variableName);
    void removeTransientVariableLocal(String variableName);

以下 BPMN 图显示了一个典型示例:

![api.transient.variable.example](assets/bpmn/api.transient.variable.example.png)

假设"获取数据"服务任务调用某个远程服务(例如,使用 REST)。我们还假设需要一些配置参数,并且需要在启动流程实例时提供这些参数。此外,这些配置参数对历史审计目的并不重要,所以我们将它们作为瞬时变量传递:

    ProcessInstance processInstance = runtimeService.createProcessInstanceBuilder()
           .processDefinitionKey("someKey")
           .transientVariable("configParam01", "A")
           .transientVariable("configParam02", "B")
           .transientVariable("configParam03", "C")
           .start();

注意,瞬时变量将一直可用,直到到达用户任务并持久化到数据库。例如,在"附加工作"用户任务中,它们不再可用。还要注意,如果"获取数据"是异步的,那么在该步骤之后它们也不可用。

"获取数据"(简化版)可能如下所示:

    public static class FetchDataServiceTask implements JavaDelegate {
      public void execute(DelegateExecution execution) {
        String configParam01 = (String) execution.getVariable(configParam01);
        // ...

        RestResponse restResponse = executeRestCall();
        execution.setTransientVariable("response", restResponse.getBody());
        execution.setTransientVariable("status", restResponse.getStatus());
      }
    }

"处理数据"将获取响应瞬时变量,解析它并将相关数据存储在实际的流程变量中,因为我们稍后需要它们。

离开排他网关的序列流上的条件对是使用持久变量还是瞬时变量无感(在本例中是 *status* 瞬时变量):

    <conditionExpression xsi:type="tFormalExpression">${status == 200}</conditionExpression>

## 表达式

Flowable 使用 UEL 进行表达式解析。UEL 是 *统一表达式语言(Unified Expression Language)* 的缩写,是 EE6 规范的一部分(详细信息请参见[EE6 规范](http://docs.oracle.com/javaee/6/tutorial/doc/gjddd.html))。

表达式可以在[Java 服务任务](bpmn/ch07b-BPMN-Constructs.md#xml-representation)、[执行监听器](bpmn/ch07b-BPMN-Constructs.md#execution-listener)、[任务监听器](bpmn/ch07b-BPMN-Constructs.md#task-listener)和[条件序列流](bpmn/ch07b-BPMN-Constructs.md#xml-representation)等地方使用。虽然有两种类型的表达式,值表达式和方法表达式,但 Flowable 对此进行了抽象,因此在需要表达式的地方可以同时使用这两种类型。

- **值表达式**: 解析为一个值。默认情况下,所有流程变量都可以使用。此外,所有 spring-beans(如果使用 Spring)也可以在表达式中使用。一些例子:

<!-- -->

    ${myVar}
    ${myBean.myProperty}

- **方法表达式**: 调用带参数或不带参数的方法。**当调用不带参数的方法时,请确保在方法名后添加空括号(这样可以将表达式与值表达式区分开)。** 传递的参数可以是字面值或自身被解析的表达式。例子:

<!-- -->

    ${printer.print()}
    ${myBean.addNewOrder('orderName')}
    ${myBean.doSomething(myVar, execution)}

注意,这些表达式支持解析基本类型(包括比较它们)、bean、列表、数组和映射。

除了所有流程变量之外,还有一些默认对象可以在表达式中使用:

- execution: DelegateExecution 包含有关正在进行的执行的附加信息。

- task: DelegateTask 包含有关当前任务的附加信息。**注意:仅在从任务监听器评估的表达式中有效。**

- authenticatedUserId: 当前已认证用户的 id。如果没有用户认证,则该变量不可用。

- variableContainer: 正在为其解析表达式的 VariableContainer。

有关更具体的用法和示例,请查看[Spring 中的表达式](bpmn/ch05-Spring.md#expressions)、[Java 服务任务](bpmn/ch07b-BPMN-Constructs.md#xml-representation)、[执行监听器](bpmn/ch07b-BPMN-Constructs.md#execution-listener)、[任务监听器](bpmn/ch07b-BPMN-Constructs.md#task-listener)或[条件序列流](bpmn/ch07b-BPMN-Constructs.md#xml-representation)。

## 表达式函数

[实验性功能] 表达式函数在 6.4.0 版本中添加。

为了使处理流程变量更容易,在 *variables* 命名空间下提供了一组开箱即用的函数。

- **variables:get(varName)**: 检索变量的值。与在表达式中直接写入变量名的主要区别是,当变量不存在时使用此函数不会抛出异常。例如,如果 *myVariable* 不存在,*${myVariable == "hello"}* 会抛出异常,但 *${var:get(myVariable) == 'hello'}* 会正常工作。

- **variables:getOrDefault(varName, defaultValue)**: 类似于 *get*,但可以提供默认值选项,当变量未设置或值为 *null* 时返回该默认值。

- **variables:exists(varName)**: 如果变量有非空值,则返回 *true*。

- **variables:isEmpty(varName)** (别名 *:empty*): 检查变量值是否为空。根据变量类型,行为如下:
    - 对于 String 变量,如果是空字符串则认为变量为空。
    - 对于 java.util.Collection 变量,如果集合没有元素则返回 *true*。
    - 对于 ArrayNode 变量,如果没有元素则返回 *true*。
    - 如果变量为 *null*,始终返回 *true*。

- **variables:isNotEmpty(varName)** (别名 *:notEmpty*): *isEmpty* 的反向操作。

- **variables:equals(varName, value)** (别名 *:eq*): 检查变量是否等于给定值。这是一个简写函数,否则表达式将写为 *${execution.getVariable("varName") != null && execution.getVariable("varName") == value}*。
    - 如果变量值为 null,则返回 false(除非与 null 比较)。

- **variables:notEquals(varName, value)** (别名 *:ne*): *equals* 的反向比较。

- **variables:contains(varName, value1, value2, ...)**: 检查变量中是否包含**所有**提供的值。根据变量类型,行为如下:
    - 对于 String 变量,传递的值用作需要成为变量一部分的子字符串。
    - 对于 java.util.Collection 变量,所有传递的值都需要是集合的元素(常规 *contains* 语义)。
    - 对于 ArrayNode 变量:支持检查 arraynode 是否包含作为变量类型支持的类型的 JsonNode。
    - 当变量值为 null 时,在所有情况下都返回 false。当变量值不为 null,且实例类型不是上述类型之一时,将返回 false。

- **variables:containsAny(varName, value1, value2, ...)**: 类似于 *contains* 函数,但如果传递的值中有**任何一个**(而不是全部)包含在变量中,则返回 *true*。

- **variables:base64(varName)**: 将二进制或字符串变量转换为 Base64 字符串。

- 比较器函数:
    - **variables:lowerThan(varName, value)** (别名 *:lessThan* 或 *:lt*): *${execution.getVariable("varName") != null && execution.getVariable("varName") < value}* 的简写
    - **variables:lowerThanOrEquals(varName, value)** (别名 *:lessThanOrEquals* 或 *:lte*): 类似,但现在是 *<=*
    - **variables:greaterThan(varName, value)** (别名 *:gt*): 类似,但现在是 *>*
    - **variables:greaterThanOrEquals(varName, value)** (别名 *:gte*): 类似,但现在是 *>=*

*variables* 命名空间别名为 *vars* 或 *var*。所以 *variables:get(varName)* 等同于写 *vars:get(varName)* 或 *var:get(varName)*。注意,不需要在变量名周围加引号:*var:get(varName)* 等同于 *var:get('varName')* 或 *var:get("varName")*。

还要注意,在上述任何函数中都不需要将 *execution* 传入函数(在不使用函数时需要这样做)。引擎在调用函数时会注入适当的变量作用域。这也意味着在编写 CMMN 案例定义中的表达式时,可以完全相同的方式使用这些函数。

此外,可以注册可在表达式中使用的自定义函数。有关更多信息,请参见 org.flowable.common.engine.api.delegate.FlowableFunctionDelegate 接口。

## 单元测试

业务流程是软件项目的重要组成部分,应该像测试普通应用程序逻辑一样对其进行测试:使用单元测试。由于 Flowable 是一个可嵌入的 Java 引擎,为业务流程编写单元测试就像编写常规单元测试一样简单。

Flowable 支持 JUnit 3、4 和 5 风格的单元测试。

在 JUnit 5 风格中,需要使用 org.flowable.engine.test.FlowableTest 注解或手动注册 org.flowable.engine.test.FlowableExtension。
FlowableTest 注解只是一个元注解,它会注册 FlowableExtension(即它执行 @ExtendWith(FlowableExtension.class))。
这将使 ProcessEngine 和服务作为参数在测试和生命周期方法(@BeforeAll、@BeforeEach、@AfterEach、@AfterAll)中可用。
在每次测试之前,流程引擎将默认使用类路径上的 flowable.cfg.xml 资源进行初始化。
要指定不同的配置文件,需要使用 org.flowable.engine.test.ConfigurationResource 注解(参见第二个示例)。
当配置资源相同时,流程引擎在多个单元测试中静态缓存。

通过使用 FlowableExtension,你可以使用 org.flowable.engine.test.Deployment 注解标注测试方法。
当测试方法使用 @Deployment 注解时,在每次测试之前,将部署 Deployment#resources 中定义的 bpmn 文件。
如果没有定义资源,将部署与测试类在同一包中的 testClassName.testMethod.bpmn20.xml 形式的资源文件。
在测试结束时,部署将被删除,包括所有相关的流程实例、任务等。
有关更多信息,请参见 Deployment 类。

考虑到所有这些,JUnit 5 测试如下所示:

**使用默认资源的 JUnit 5 测试**

    @FlowableTest
    class MyBusinessProcessTest {

      private ProcessEngine processEngine;
      private RuntimeService runtimeService;
      private TaskService taskService;

      @BeforeEach
      void setUp(ProcessEngine processEngine) {
        this.processEngine = processEngine;
        this.runtimeService = processEngine.getRuntimeService();
        this.taskService = processEngine.getTaskService();
      }

      @Test
      @Deployment
      void testSimpleProcess() {
        runtimeService.startProcessInstanceByKey("simpleProcess");

        Task task = taskService.createTaskQuery().singleResult();
        assertEquals("My Task", task.getName());

        taskService.complete(task.getId());
        assertEquals(0, runtimeService.createProcessInstanceQuery().count());
      }
    }

使用 JUnit 5,你还可以将部署的 id(使用 +org.flowable.engine.test.DeploymentId+_)注入到测试和生命周期方法中。

**使用自定义资源文件的 JUnit 5 测试**

    @FlowableTest
    @ConfigurationResource("flowable.custom.cfg.xml")
    class MyBusinessProcessTest {

      private ProcessEngine processEngine;
      private RuntimeService runtimeService;
      private TaskService taskService;

      @BeforeEach
      void setUp(ProcessEngine processEngine) {
        this.processEngine = processEngine;
        this.runtimeService = processEngine.getRuntimeService();
        this.taskService = processEngine.getTaskService();
      }

      @Test
      @Deployment
      void testSimpleProcess() {
        runtimeService.startProcessInstanceByKey("simpleProcess");

        Task task = taskService.createTaskQuery().singleResult();
        assertEquals("My Task", task.getName());

        taskService.complete(task.getId());
        assertEquals(0, runtimeService.createProcessInstanceQuery().count());
      }
    }

在 JUnit 3 风格中,必须扩展 org.flowable.engine.test.FlowableTestCase。这将使 ProcessEngine 和服务通过受保护的成员字段可用。在测试的 setup() 中,流程引擎将默认使用类路径上的 flowable.cfg.xml 资源进行初始化。要指定不同的配置文件,请重写 *getConfigurationResource()* 方法。当配置资源相同时,流程引擎在多个单元测试中静态缓存。

与 FlowableExtension 一样(见上文),扩展 FlowableTestCase 将启用 org.flowable.engine.test.Deployment 注解的使用(有关其使用和配置的说明见上文)。在运行测试之前,将部署与测试类在同一包中的 testClassName.testMethod.bpmn20.xml 形式的资源文件。在测试结束时,部署将被删除,包括所有相关的流程实例、任务等。Deployment 注解还支持显式设置资源位置。有关更多信息,请参见该类本身。

考虑到所有这些,JUnit 3 风格的测试如下所示。

**使用默认资源文件的 JUnit 3 测试**

    public class MyBusinessProcessTest extends FlowableTestCase {

      @Deployment
      public void testSimpleProcess() {
        runtimeService.startProcessInstanceByKey("simpleProcess");

        Task task = taskService.createTaskQuery().singleResult();
        assertEquals("My Task", task.getName());

        taskService.complete(task.getId());
        assertEquals(0, runtimeService.createProcessInstanceQuery().count());
      }
    }

要在使用 JUnit 4 风格编写单元测试时获得相同的功能,必须使用 org.flowable.engine.test.FlowableRule Rule。通过这个规则,可以通过 getter 获取流程引擎和服务。
与 FlowableExtension 一样(见上文),包含此 Rule 将启用 org.flowable.engine.test.Deployment 注解的使用(有关其使用和配置的说明见上文),并且它将在类路径上查找默认配置文件。使用相同的配置资源时,流程引擎在多个单元测试中静态缓存。

以下代码片段显示了使用 JUnit 4 风格测试和使用 FlowableRule 的示例。

**使用默认资源文件的 JUnit 4 测试**

    public class MyBusinessProcessTest {

      @Rule
      public FlowableRule flowableRule = new FlowableRule();

      @Test
      @Deployment
      public void ruleUsageExample() {
        RuntimeService runtimeService = flowableRule.getRuntimeService();
        runtimeService.startProcessInstanceByKey("ruleUsage");

        TaskService taskService = flowableRule.getTaskService();
        Task task = taskService.createTaskQuery().singleResult();
        assertEquals("My Task", task.getName());

        taskService.complete(task.getId());
        assertEquals(0, runtimeService.createProcessInstanceQuery().count());
      }
    }

## 调试单元测试

当在单元测试中使用内存 H2 数据库时,以下说明允许你在调试会话期间轻松检查 Flowable 数据库中的数据。这里的截图是在 Eclipse 中拍摄的,但对于其他 IDE,机制应该类似。

假设我们在单元测试中某处设置了一个*断点*(在 Eclipse 中,这是通过双击代码旁边的左边框完成的):

![api.test.debug.breakpoint](assets/bpmn/api.test.debug.breakpoint.png)

如果我们现在在*调试*模式下运行单元测试(右键单击测试类,选择"Run as"然后选择"JUnit test"),测试执行将在我们的断点处暂停,在那里我们可以检查右上方面板中显示的测试变量。

![api.test.debug.view](assets/bpmn/api.test.debug.view.png)

要检查 Flowable 数据,打开 *'Display'* 窗口(如果没有这个窗口,打开 Window→Show View→Other 并选择 *Display*。)并输入(可以使用代码补全) org.h2.tools.Server.createWebServer("-web").start()

![api.test.debug.start.h2.server](assets/bpmn/api.test.debug.start.h2.server.png)

选择你刚刚输入的行并右键单击它。现在选择"Display"(或执行快捷键而不是右键单击)

![api.test.debug.start.h2.server.2](assets/bpmn/api.test.debug.start.h2.server.2.png)

现在打开浏览器并访问 [<http://localhost:8082>](http://localhost:8082),填写内存数据库的 JDBC URL(默认是 jdbc:h2:mem:flowable),然后点击连接按钮。

![api.test.debug.h2.login](assets/bpmn/api.test.debug.h2.login.png)

你现在可以看到 Flowable 数据,并使用它来理解你的单元测试如何以及为什么以某种方式执行你的流程。

![api.test.debug.h2.tables](assets/bpmn/api.test.debug.h2.tables.png)

## Web 应用中的流程引擎

ProcessEngine 是一个线程安全的类,可以轻松地在多个线程之间共享。在 Web 应用中,这意味着可以在容器启动时创建流程引擎,并在容器关闭时关闭引擎。

以下代码片段显示了如何编写一个简单的 ServletContextListener 来在普通 Servlet 环境中初始化和销毁流程引擎:

    public class ProcessEnginesServletContextListener implements ServletContextListener {

      public void contextInitialized(ServletContextEvent servletContextEvent) {
        ProcessEngines.init();
      }

      public void contextDestroyed(ServletContextEvent servletContextEvent) {
        ProcessEngines.destroy();
      }

    }

contextInitialized 方法将委托给 ProcessEngines.init()。它将在类路径上查找 flowable.cfg.xml 资源文件,并为给定的配置创建一个 ProcessEngine(例如,具有配置文件的多个 JAR)。如果在类路径上有多个这样的资源文件,请确保它们都有不同的名称。当需要流程引擎时,可以使用以下方式获取:

    ProcessEngines.getDefaultProcessEngine()

或

    ProcessEngines.getProcessEngine("myName");

当然,也可以使用创建流程引擎的任何变体,如[配置章节](bpmn/ch03-Configuration.md#creating-a-processengine)中所述。

context-listener 的 contextDestroyed 方法委托给 ProcessEngines.destroy()。这将正确关闭所有已初始化的流程引擎。