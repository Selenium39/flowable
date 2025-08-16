---
id: ch03-API
title: Flowable CMMN API
description: Flowable CMMN API文档详解如何通过CmmnEngine及五大核心服务(CmmnRuntimeService/CmmnRepositoryService等)管理案例生命周期，支持线程安全调用与集群部署，提供XML/Java双模式配置指南。
keywords: Flowable,CMMN API,案例管理,流程引擎,服务接口,CmmnEngine,线程安全,Spring集成
---

## CMMN 流程引擎 API 和服务

引擎 API 是与 Flowable 交互最常用的方式。主要的起点是 CmmnEngine,它可以通过[配置章节](cmmn/ch02-Configuration.md#creating-a-cmmnengine)中描述的几种方式创建。通过 CmmnEngine,你可以获取包含案例/CMMN 方法的各种服务。CmmnEngine 和服务对象都是线程安全的,因此你可以在整个服务器中保持对其中一个的引用。

    CmmnEngine cmmnEngine = CmmnEngineConfiguration.createStandaloneCmmnEngineConfiguration();

    CmmnRuntimeService runtimeService = cmmnEngine.getCmmnRuntimeService();
    CmmnRepositoryService repositoryService = cmmnEngine.getCmmnRepositoryService();
    CmmnTaskService taskService = cmmnEngine.getCmmnTaskService();
    CmmnManagementService managementService = cmmnEngine.getCmmnManagementService();
    CmmnHistoryService historyService = cmmnEngine.getCmmnHistoryService();

CmmnEngineConfiguration.createStandaloneCmmnEngineConfiguration() 将初始化并构建一个 CMMN 引擎,之后始终返回该 CMMN 引擎。

CmmnEngineConfiguration 类将扫描所有的 flowable.cmmn.cfg.xml 和 flowable-cmmn-context.xml 文件。对于所有的 flowable.cmmn.cfg.xml 文件,CMMN 引擎将以典型的 Flowable 方式构建:CmmnEngineConfiguration.createCmmnEngineConfigurationFromInputStream(inputStream).buildCmmnEngine()。对于所有的 flowable-cmmn-context.xml 文件,CMMN 引擎将以 Spring 方式构建:首先创建 Spring 应用程序上下文,然后从该应用程序上下文获取 CMMN 引擎。

所有服务都是无状态的。这意味着你可以轻松地在集群中的多个节点上运行 Flowable,每个节点都连接到同一个数据库,而不必担心实际执行之前调用的是哪台机器。无论在哪里执行,对任何服务的任何调用都是幂等的。

**CmmnRepositoryService** 可能是使用 Flowable CMMN 引擎时首先需要的服务。该服务提供了管理和操作部署和案例定义的操作。这里不详细介绍,案例定义是 CMMN 1.1 案例的 Java 对应物。它表示案例中每个步骤的结构和行为。部署是 Flowable CMMN 引擎中的打包单位。一个部署可以包含多个 CMMN 1.1 XML 文件和任何其他资源。一个部署包含什么由开发人员决定。它可以是单个 CMMN 1.1 XML 文件,也可以是一整套案例和相关资源(例如,部署 'hr-cases' 可以包含与人力资源案例相关的所有内容)。CmmnRepositoryService 可以部署这样的包。部署意味着将其上传到引擎,在存储到数据库之前,所有案例都会被检查和解析。从那时起,系统就知道了该部署,部署中包含的任何流程现在都可以启动了。

此外,该服务允许你:

-   查询引擎已知的部署和案例定义。

-   检索各种资源,如部署中包含的文件或引擎自动生成的案例图。

-   检索案例定义的 POJO 版本,可用于使用 Java 而不是 XML 来检查案例。

虽然 CmmnRepositoryService 主要处理静态信息(不变或至少变化不大的数据),但 **CmmnRuntimeService** 则完全相反。它处理启动案例定义的新案例实例。如上所述,案例定义定义了案例中不同步骤的结构和行为。案例实例是案例定义的一次执行。对于每个案例定义,通常同时运行着许多实例。CmmnRuntimeService 也是用于检索和存储案例变量的服务。这些数据特定于给定的案例实例,可以被案例中的各种构造使用(例如,计划转换条件经常使用流程变量来确定选择哪条路径来继续案例)。CmmnRuntimeservice 还允许你查询案例实例和计划项。计划项是 CMMN 1.1 已启用计划项的表示。最后,当案例实例等待外部触发并需要继续时,使用 CmmnRuntimeService。案例实例可以有各种等待状态,该服务包含各种操作来"通知"实例已收到外部触发并且案例实例可以继续。

系统用户需要执行的任务是像 Flowable 这样的 CMMN 引擎的核心。所有与任务相关的内容都分组在 **CmmnTaskService** 中,例如:

-   查询分配给用户或组的任务

-   创建新的*独立*任务。这些是与流程实例无关的任务。

-   操作任务分配给哪个用户或哪些用户以某种方式参与任务。

-   认领和完成任务。认领意味着某人决定成为任务的受理人,这意味着该用户将完成任务。完成意味着"完成任务的工作"。通常这是填写某种形式的表单。

**CmmnHistoryService** 公开了 Flowable CMMN 引擎收集的所有历史数据。在执行案例时,引擎可以保留大量数据(这是可配置的),例如案例实例启动时间、谁执行了哪些任务、完成任务花了多长时间、在每个案例实例中遵循了哪条路径等。该服务主要提供查询功能来访问这些数据。

**CmmnManagementService** 提供对数据库表的低级信息的访问,允许查询不同类型的作业并执行它们。

有关服务操作和引擎 API 的更详细信息,请参阅[javadocs](http://www.flowable.org/docs/javadocs/index.html)。

## 异常策略

Flowable 中的基础异常是 org.flowable.engine.common.api.FlowableException,这是一个非受检异常。API 可以随时抛出此异常,但在特定方法中发生的"预期"异常会在 [javadocs](http://www.flowable.org/docs/javadocs/index.html) 中记录。例如,以下是 CmmnTaskService 的一个示例:

    /**
     * 当任务成功执行时调用。
     * @param taskId 要完成的任务的 ID,不能为 null。
     * @throws FlowableObjectNotFoundException 当不存在具有给定 ID 的任务时。
     */
     void complete(String taskId);

在上面的示例中,当传入一个不存在任务的 ID 时,将抛出异常。此外,由于 javadoc **明确指出 taskId 不能为 null,当传入 null 时将抛出 FlowableIllegalArgumentException**。

尽管我们想避免庞大的异常层次结构,但在特定情况下会抛出以下子类。在流程执行或 API 调用期间发生的所有其他错误,如果不符合以下可能的异常,则作为常规 FlowableExceptions 抛出。

-   FlowableWrongDbException: 当 Flowable 引擎发现数据库架构版本与引擎版本不匹配时抛出。

-   FlowableOptimisticLockingException: 当由于并发访问相同数据条目而在数据存储中发生乐观锁定时抛出。

-   FlowableClassLoadingException: 当请求加载的类未找到或加载时发生错误时抛出(例如,JavaDelegates、TaskListeners 等)。

-   FlowableObjectNotFoundException: 当请求或操作的对象不存在时抛出。

-   FlowableIllegalArgumentException: 表示在 Flowable API 调用中提供了非法参数,在引擎配置中配置了非法值,或在流程定义中提供或使用了非法值。

-   FlowableTaskAlreadyClaimedException: 当调用 taskService.claim(...) 时,任务已被认领时抛出。

## 查询 API

从引擎查询数据有两种方式:查询 API 和原生查询。查询 API 允许你使用流畅的 API 编写完全类型安全的查询。你可以向查询添加各种条件(所有条件都作为逻辑 AND 一起应用)和精确的一个排序。以下代码显示了一个示例:

    List<Task> tasks = taskService.createTaskQuery()
        .taskAssignee("kermit")
        .orderByDueDate().asc()
        .list();

## 变量

每个案例实例都需要并使用数据来执行其组成的步骤。在 Flowable 中,这些数据称为*变量*,存储在数据库中。变量可以在表达式中使用(例如,在哨兵的条件中),在调用外部服务的 Java 服务任务中使用(例如提供输入或存储服务调用的结果),等等。

案例实例可以有变量(称为*案例变量*),*计划项实例*和人工任务也可以有变量。一个案例实例可以有任意数量的变量。每个变量都存储在 *ACT_RU_VARIABLE* 数据库表的一行中。

*createCaseInstanceBuilder* 方法有可选方法,可以在通过 *CmmnRuntimeService* 创建和启动案例实例时提供变量:

    CaseInstance caseInstance = runtimeService.createCaseInstanceBuilder().variable("var1", "test").start();

可以在案例执行期间添加变量。例如,(*CmmnRuntimeService*):

    void setVariables(String caseInstanceId, Map<String, ? extends Object> variables);

也可以检索变量,如下所示。注意 *CmmnTaskService* 上也存在类似的方法。

    Map<String, Object> getVariables(String caseInstanceId);
    Object getVariable(String caseInstanceId, String variableName);

变量经常在 Java 服务任务、表达式、脚本等中使用。

## 瞬时变量

瞬时变量的行为类似于常规变量,但不会被持久化。通常,瞬时变量用于高级用例。如有疑问,请使用常规案例变量。

瞬时变量适用以下规则:

-   瞬时变量完全不存储历史记录。

-   与*常规*变量一样,设置瞬时变量时会放在*最高父级*上。这意味着在计划项上设置变量时,瞬时变量实际上存储在案例实例执行中。与常规变量一样,如果变量设置在特定计划项或任务上,则存在*本地*变体方法。

-   瞬时变量只能在案例定义中下一个"等待状态"之前访问。之后,它们就消失了。这里,等待状态指的是案例实例被持久化到数据存储的时点。

-   瞬时变量只能通过 *setTransientVariable(name, value)* 设置,但调用 *getVariable(name)* 时也会返回瞬时变量(还存在一个 *getTransientVariable(name)*,它只检查瞬时变量)。这样做的原因是为了使表达式的编写更容易,使用变量的现有逻辑可以适用于两种类型。

-   瞬时变量会*遮蔽*同名的持久变量。这意味着当在案例实例上同时设置了持久变量和瞬时变量时,调用 *getVariable("someVariable")* 将返回瞬时变量值。

你可以在大多数公开常规变量的地方设置和获取瞬时变量:

-   在 *PlanItemJavaDelegate* 实现中的 *DelegatePlanItemInstance* 上

-   通过运行时服务启动案例实例时

-   完成任务时

这些方法遵循常规案例变量的命名约定:

    CaseInstance caseInstance = runtimeService.createCaseInstanceBuilder().transientVariable("var1", "test").start();

## 表达式

Flowable 使用 UEL 进行表达式解析。UEL 是 *统一表达式语言(Unified Expression Language)* 的缩写,是 EE6 规范的一部分(详细信息请参阅 [EE6 规范](http://docs.oracle.com/javaee/6/tutorial/doc/gjddd.html))。

表达式可以在 Java 服务任务、哨兵条件和计划项监听器等地方使用。虽然有值表达式和方法表达式两种类型的表达式,但 Flowable 对此进行了抽象,因此在需要表达式的地方可以同时使用这两种类型。

-   **值表达式**: 解析为一个值。默认情况下,所有案例变量都可以使用。此外,所有 spring-beans(如果使用 Spring)也可以在表达式中使用。在非 Spring 环境中,可以通过 CmmnEngineConfiguration 的 setBeans 方法设置表达式可用的 beans。一些示例:

<!-- -->

    ${myVariable}
    ${myBean.myProperty}

-   **方法表达式**: 调用带参数或不带参数的方法。**当调用不带参数的方法时,请确保在方法名后添加空括号(这样可以将表达式与值表达式区分开)。** 传递的参数可以是字面值或自行解析的表达式。示例:

<!-- -->

    ${printer.print()}
    ${myBean.addNewOrder('orderName')}
    ${myBean.doSomething(myVar, planItemInstance)}

这些表达式支持解析基本类型(包括比较它们)、beans、列表、数组和映射。

除了所有案例实例变量之外,还有一些可在表达式中使用的默认对象:

-   caseInstance: 保存有关正在进行的案例实例的附加信息。caseInstance 关键字在所有表达式中都可用。

-   planItemInstance: DelegatePlanItemInstance 保存有关当前计划项实例的附加信息。planItemInstance 关键字在所有与计划项相关的表达式中都可用(例如,哨兵条件、计划项生命周期监听器、服务任务表达式等)。

-   planItemInstances: 公开有关所有当前计划项实例的信息。请参阅下面的示例了解如何使用它。

-   variableContainer: 正在为其解析表达式的变量容器。变量容器是案例实例、计划项实例、流程实例和执行的抽象。+variableContainer 关键字允许编写不绑定到特定实现的表达式。

-   authenticatedUserId: 当前已认证用户的 ID。如果没有用户认证,则该变量不可用。

例如:

    ${caseInstance.id}
    ${caseInstance.getVariable('myVariable') == 'test'}
    ${caseInstance.setVariable('myVariable', 'test')}

    ${planItemInstance.getPlanItem().getPlanItemDefinition().getName()}
    ${planItemInstance.getVariable('myVariable') == 123}
    ${planItemInstance.setVariable('myVariable', 123)}

    ${variableContainer.getVariable('myVariable')}
    ${variableContainer.setVariable('myVariable', 'true')}

关键字 **planItemInstances** 需要更多解释。使用此关键字可以检索所有当前计划项实例,但它也像一个 API,用于检索有关当前计划项实例的更多信息。

例如,以下表达式

    ${planItemInstances.active().count()}

将返回当前处于"活动"状态的所有计划项实例的计数。如果我们只对某个特定计划项感兴趣,可以进行过滤:

    ${planItemInstances.definitionId('a').active().count()}

如示例所示,planItemInstances 关键字允许将各种过滤方法链接在一起。这种链接将使用 AND 语义。支持以下方法。

基于计划项实例状态的过滤方法:

-   active(): 活动状态

-   available(): 可用状态

-   enabled(): 已启用状态

-   disabled(): 已禁用状态

-   completed(): 已完成状态

-   terminated(): 已终止状态

以下状态过滤器也受支持,但请注意这些反映了不符合规范的内部状态:

-   unavailable(): 不可用状态

-   waitingForRepetition(): 等待重复状态

-   asyncActive(): 异步活动状态

要获取处于终止状态(即已终止或已完成)或非终止状态的所有计划项实例:

-   onlyTerminal(): 仅终止状态

-   onlyNonTerminal(): 仅非终止状态

基于 CMMN 模型中设置的标识符进行过滤:

-   definitionId('id1'): 单个定义 ID

-   definitionIds('id1', 'id2'): 多个定义 ID

基于名称进行过滤:

-   name('name1'): 单个名称

-   names('name1', 'name2', 'name3'): 多个名称

对于某些用例,需要过滤的计划项实例应该只是当前阶段的一部分。"当前阶段"是计划项的父级阶段,如果没有父级阶段则是案例实例。

-   currentStage(): 当前阶段

最后,有一组不能链式调用的方法,因为它们会返回结果。

-   count(): 在应用所有过滤器后返回计划项实例的数量。

-   getDefinitionIds(): 返回一个字符串列表,包含匹配的计划项实例在 CMMN 模型中定义的所有 ID。

-   getDefinitionNames(): 返回一个名称列表,包含匹配的计划项实例在 CMMN 模型中定义的所有名称。

-   getList(): 返回 *org.flowable.cmmn.api.runtime.PlanItemInstance* 实例的"原始"列表。

让我们看一些使用上述方法的表达式示例:

要统计案例实例中所有活动的计划项实例:

    ${planItemInstances.active().count()}

要统计 ID 为 'a' 或 'b' 的所有活动计划项实例:

    ${planItemInstances.active().definitionIds('a', 'b').count()}

要获取当前阶段中处于终止状态的所有计划项实例的 ID:

    ${planItemInstances.currentStage().onlyTerminal().getDefinitionIds()()}

要将上述表达式的结果存储在瞬时变量中:

    ${caseInstance.setTransientVariable('myVar', planItemInstances.currentStage().onlyTerminal().getDefinitionIds()}}

## 表达式函数

[实验性功能] 表达式函数已在 6.4.0 版本中添加。

为了使处理案例变量更容易,在 *variables* 命名空间下提供了一组开箱即用的函数。

-   **variables:get(varName)**: 获取变量的值。与在表达式中直接写入变量名的主要区别是,当变量不存在时使用此函数不会抛出异常。例如,如果 *myVariable* 不存在,*${myVariable == "hello"}* 会抛出异常,但 *${var:get(myVariable) == 'hello'}* 会正常工作。

-   **variables:getOrDefault(varName, defaultValue)**: 类似于 *get*,但可以提供一个默认值,当变量未设置或值为 *null* 时返回该默认值。

-   **variables:exists(varName)**: 如果变量有非空值,则返回 *true*。

-   **variables:isEmpty(varName)** (别名 *:empty*): 检查变量值是否为空。根据变量类型,行为如下:

    -   对于字符串变量,如果是空字符串则认为变量为空。

    -   对于 java.util.Collection 变量,如果集合没有元素则返回 *true*。

    -   对于 ArrayNode 变量,如果没有元素则返回 *true*。

    -   如果变量为 *null*,始终返回 *true*。

-   **variables:isNotEmpty(varName)** (别名 *:notEmpty*): *isEmpty* 的反向操作。

-   **variables:equals(varName, value)** (别名 *:eq*): 检查变量是否等于给定值。这是一个简写函数,否则需要写成 *${execution.getVariable("varName") != null && execution.getVariable("varName") == value}*。

    -   如果变量值为 null,则返回 false(除非与 null 比较)。

-   **variables:notEquals(varName, value)** (别名 *:ne*): *equals* 的反向比较。

-   **variables:contains(varName, value1, value2, ...)**: 检查提供的**所有**值是否包含在变量中。根据变量类型,行为如下:

    -   对于字符串变量,传入的值用作需要是变量一部分的子字符串。

    -   对于 java.util.Collection 变量,所有传入的值都需要是集合的元素(常规 *contains* 语义)。

    -   对于 ArrayNode 变量:支持检查 arraynode 是否包含支持作为变量类型的类型的 JsonNode。

    -   当变量值为 null 时,在所有情况下都返回 false。当变量值不为 null,且实例类型不是上述类型之一时,将返回 false。

-   **variables:containsAny(varName, value1, value2, ...)**: 类似于 *contains* 函数,但如果传入的值中有**任何一个**(而不是全部)包含在变量中,则返回 *true*。

-   **variables:base64(varName)**: 将二进制或字符串变量转换为 Base64 字符串

-   比较函数:

    -   **variables:lowerThan(varName, value)** (别名 *:lessThan* 或 *:lt*): *${execution.getVariable("varName") != null && execution.getVariable("varName") < value}* 的简写。

    -   **variables:lowerThanOrEquals(varName, value)** (别名 *:lessThanOrEquals* 或 *:lte*): 类似,但用于 *<=*。

    -   **variables:greaterThan(varName, value)** (别名 *:gt*): 类似,但用于 *>*。

    -   **variables:greaterThanOrEquals(varName, value)** (别名 *:gte*): 类似,但用于 *>=*。

*variables* 命名空间有别名 *vars* 或 *var*。因此 *variables:get(varName)* 等同于 *vars:get(varName)* 或 *var:get(varName)*。注意不需要在变量名周围加引号:*var:get(varName)* 等同于 *var:get('varName')* 或 *var:get("varName")*。

还要注意,在上述所有函数中都不需要将 *planItemInstance* 或 *caseInstance* 传入函数(如果不使用函数则需要)。引擎在调用函数时会注入适当的变量作用域。这也意味着在编写 BPMN 流程定义中的表达式时,可以完全相同的方式使用这些函数。

这些变量函数在 CMMN 中特别有用,例如在编写哨兵的 if-part 条件时。看看下面的 CMMN 案例定义:

![cmmn.expression functions](assets/cmmn/cmmn.expression-functions.png)

假设哨兵除了完成事件外还有一个 if-part。在案例实例启动后,将立即评估此 if-part 条件(因为阶段变为可用)。如果条件的形式是 *${someVariable == someValue}*,这意味着在启动案例实例时需要有该变量。在许多情况下,这是不可能的,或者变量会在之后出现(例如,来自表单),这会导致低级的 *PropertyNotFoundException*。考虑到变量可能为空,正确的表达式应该是:

    ${planItemInstance.getVariable('someVariable') != null && planItemInstance.getVariable('someVariable') == someValue}

这相当冗长。但是使用上述函数,可以简化为:

    ${var:eq(someVariable, someValue)}

或

    ${var:get(someVariable) == someValue}

函数实现会考虑变量的可空性(在变量为空时不会抛出异常)并正确处理相等性。

此外,还可以注册可在表达式中使用的自定义函数。有关更多信息,请参阅 org.flowable.common.engine.api.delegate.FlowableFunctionDelegate 接口。

## 历史清理

默认情况下,历史数据会永久存储,这可能导致历史表变得非常大并影响 HistoryService 的性能。历史清理功能在 6.5.0 版本中引入,允许删除历史流程实例及其相关数据。当不再需要保留流程数据时,可以将其删除以减小历史数据库的大小。

### 自动历史清理配置

默认情况下,历史案例实例的自动清理是禁用的,但可以通过编程方式启用和配置。启用后,默认在凌晨 1 点运行清理作业,删除所有在 365 天前或更早结束的历史案例实例及相关数据。
历史流程的删除使用 Flowable 批处理机制完成,通过调度作业按批次删除流程,并在批处理表中存储有关所做操作的信息。

    CmmnEngine cmmnEngine = CmmnEngineConfiguration.
        .createProcessEngineConfigurationFromResourceDefault()
        .setEnableHistoryCleaning(true)
        .setHistoryCleaningTimeCycleConfig("0 0 1 * * ?")
        .setCleanInstancesEndedAfter(Duration.ofDays(365))
        .buildCmmnEngine();

在 application.properties 或外部化配置中设置的 Spring 属性也可用:

     flowable.enable-history-cleaning=true
     flowable.history-cleaning-after=365d
     flowable.history-cleaning-cycle=0 0 1 * * ?
 
### 手动删除历史记录

[//]: # (TODO 更改示例)

可以通过在 CmmnHistoryService 查询构建器上执行方法来手动清理历史记录。

删除所有超过一年的历史案例实例及其相关数据。

     int numberOfCasesInBatch = 10;
     Calendar cal = new GregorianCalendar();
     cal.set(Calendar.YEAR, cal.get(Calendar.YEAR) - 1);
     cmmnHistoryService.createHistoricCaseInstanceQuery()
       .finishedBefore(cal.getTime())
       .deleteSequentiallyUsingBatch(numberOfCasesInBatch, "Custom Delete Batch");

## 单元测试

案例是软件项目的重要组成部分,应该像测试普通应用程序逻辑一样进行测试:使用单元测试。
由于 Flowable 是一个可嵌入的 Java 引擎,为业务案例编写单元测试就像编写常规单元测试一样简单。

Flowable 支持 JUnit 4 和 5 两种风格的单元测试。

在 JUnit 5 风格中,需要使用 org.flowable.cmmn.engine.test.FlowableCmmnTest 注解或手动注册 org.flowable.cmmn.engine.test.FlowableCmmnExtension。
FlowableCmmnTest 注解只是一个元注解,它会注册 FlowableCmmnExtension(即执行 @ExtendWith(FlowableCmmnExtension.class))。
这将使 CmmnEngine 和服务作为参数在测试和生命周期方法中可用(@BeforeAll、@BeforeEach、@AfterEach、@AfterAll)。
在每个测试之前,cmmnEngine 将默认使用类路径上的 flowable.cmmn.cfg.xml 资源进行初始化。
要指定不同的配置文件,需要使用 org.flowable.cmmn.engine.test.CmmnConfigurationResource 注解(参见第二个示例)。
当配置资源相同时,Cmmn 引擎在多个单元测试中静态缓存。

通过使用 FlowableCmmnExtension,你可以使用 org.flowable.cmmn.engine.test.CmmnDeployment 注解测试方法。
当测试方法使用 @CmmnDeployment 注解时,在每个测试之前,将部署 CmmnDeployment#resources 中定义的 cmmn 文件。
如果没有定义资源,将部署与测试类在同一包中的 testClassName.testMethod.cmmn 形式的资源文件。
在测试结束时,将删除部署,包括所有相关的案例实例、任务等。
有关更多信息,请参阅 CmmnDeployment 类。

考虑到所有这些,JUnit 5 测试如下所示:

**使用默认资源的 JUnit 5 测试。**

    @FlowableCmmnTest
    class MyTest {

      private CmmnEngine cmmnEngine;
      private CmmnRuntimeService cmmnRuntimeService;
      private CmmnTaskService cmmnTaskService;

      @BeforeEach
      void setUp(CmmnEngine cmmnEngine) {
        this.cmmnEngine = cmmnEngine;
        this.cmmnRuntimeService = cmmnEngine.getCmmnRuntimeService();
        this.cmmnTaskService = cmmnEngine.getTaskRuntimeService();
      }

      @Test
      @CmmnDeployment
      void testSingleHumanTask() {
        CaseInstance caseInstance = cmmnRuntimeService.createCaseInstanceBuilder()
                        .caseDefinitionKey("myCase")
                        .start();
        assertNotNull(caseInstance);

        Task task = cmmnTaskService.createTaskQuery().caseInstanceId(caseInstance.getId()).singleResult();
        assertEquals("Task 1", task.getName());
        assertEquals("JohnDoe", task.getAssignee());

        cmmnTaskService.complete(task.getId());
        assertEquals(0, cmmnRuntimeService.createCaseInstanceQuery().count());
      }
    }

    使用 JUnit 5,你还可以将部署的 ID(使用 +org.flowable.cmmn.engine.test.CmmnDeploymentId+_)注入到测试和生命周期方法中。

**使用自定义资源的 JUnit 5 测试。**

    @FlowableCmmnTest
    @CmmnConfigurationResource("flowable.custom.cmmn.cfg.xml")
    class MyTest {

      private CmmnEngine cmmnEngine;
      private CmmnRuntimeService cmmnRuntimeService;
      private CmmnTaskService cmmnTaskService;

      @BeforeEach
      void setUp(CmmnEngine cmmnEngine) {
        this.cmmnEngine = cmmnEngine;
        this.cmmnRuntimeService = cmmnEngine.getCmmnRuntimeService();
        this.cmmnTaskService = cmmnEngine.getTaskRuntimeService();
      }
      @Test
      @CmmnDeployment
      void testSingleHumanTask() {
        CaseInstance caseInstance = cmmnRuntimeService.createCaseInstanceBuilder()
                        .caseDefinitionKey("myCase")
                        .start();
        assertNotNull(caseInstance);

        Task task = cmmnTaskService.createTaskQuery().caseInstanceId(caseInstance.getId()).singleResult();
        assertEquals("Task 1", task.getName());
        assertEquals("JohnDoe", task.getAssignee());

        cmmnTaskService.complete(task.getId());
        assertEquals(0, cmmnRuntimeService.createCaseInstanceQuery().count());
      }
    }

在 JUnit 4 风格中,*org.flowable.cmmn.engine.test.FlowableCmmnTestCase* 可用作父类。它默认使用 *flowable.cmmn.cfg.xml* 配置文件,如果该文件不存在,则使用带有 H2 内存数据库的标准 CmmnEngine。
在后台,使用 CmmnTestRunner 来初始化 CMMN 引擎。注意下面示例中如何使用 *@CmmnDeployment* 注解来自动部署案例定义(它将在测试类所在的文件夹中查找 .cmmn 文件,并期望文件名为 &lt;测试类名称&gt;.&lt;测试方法名称&gt;.cmmn。

    public class MyTest extends FlowableCmmnTestCase {

      @Test
      @CmmnDeployment
      public void testSingleHumanTask() {
        CaseInstance caseInstance = cmmnRuntimeService.createCaseInstanceBuilder()
                        .caseDefinitionKey("myCase")
                        .start();
        assertNotNull(caseInstance);

        Task task = cmmnTaskService.createTaskQuery().caseInstanceId(caseInstance.getId()).singleResult();
        assertEquals("Task 1", task.getName());
        assertEquals("JohnDoe", task.getAssignee());

        cmmnTaskService.complete(task.getId());
        assertEquals(0, cmmnRuntimeService.createCaseInstanceQuery().count());
      }
    }

另外,*FlowableCmmnRule* 也可用,它允许设置自定义配置:

**使用 Rule 的 JUnit 4 测试**

    @Rule
    public FlowableCmmnRule cmmnRule = new FlowableCmmnRule("org/flowable/custom.cfg.xml")

    @Test
    @CmmnDeployment
    public void testSomething() {
        // ...
        assertThat((String) cmmnRule.getCmmnRuntimeService().getVariable(caseInstance.getId(), "test"), containsString("John"));
        // ...
    }
