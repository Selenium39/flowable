---
id: ch15-Cdi
title: CDI 集成
description: Flowable CDI集成模块结合了Flowable流程引擎的可配置性和CDI的扩展性，支持@BusinessProcessScoped作用域、CDI beans解析、声明式流程控制，兼容Java EE/SE和Spring环境，简化BPMN应用开发。
keywords: Flowable,CDI集成,BPMN流程管理,业务流程作用域,Java EE,Spring集成,流程引擎配置
---

flowable-cdi 模块同时利用了 Flowable 的可配置性和 CDI 的可扩展性。flowable-cdi 最突出的特性包括：

-   支持 @BusinessProcessScoped beans（生命周期与流程实例绑定的 CDI beans）

-   用于从流程中解析 CDI beans（包括 EJBs）的自定义 El 解析器

-   使用注解对流程实例进行声明式控制

-   Flowable 已连接到 CDI 事件总线

-   同时支持 Java EE 和 Java SE，可与 Spring 协同工作

-   支持单元测试

<!-- -->

    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-cdi</artifactId>
        <version>7.x</version>
    </dependency>

## 设置 flowable-cdi

Flowable-cdi 可以在不同的环境中设置。在本节中，我们将简要介绍配置选项。

### 查找流程引擎

CDI 扩展需要访问 ProcessEngine。为此，在运行时会查找 org.flowable.cdi.spi.ProcessEngineLookup 接口的实现。CDI 模块附带了一个名为 org.flowable.cdi.impl.LocalProcessEngineLookup 的默认实现，它使用 ProcessEngines-Utility 类来查找 ProcessEngine。在默认配置中，使用 ProcessEngines#NAME_DEFAULT 来查找 ProcessEngine。可以通过子类化此类来设置自定义名称。注意：你需要在类路径中提供 flowable.cfg.xml 配置。

Flowable-cdi 使用 java.util.ServiceLoader SPI 来解析 org.flowable.cdi.spi.ProcessEngineLookup 的实例。为了提供接口的自定义实现，我们需要在部署中添加一个名为 META-INF/services/org.flowable.cdi.spi.ProcessEngineLookup 的纯文本文件，在其中指定实现类的完全限定名。

> **注意**
>
> 如果你没有提供自定义的 org.flowable.cdi.spi.ProcessEngineLookup 实现，Flowable 将使用默认的 LocalProcessEngineLookup 实现。在这种情况下，你只需要在类路径中提供 flowable.cfg.xml 文件（参见下一节）。

### 配置流程引擎

配置取决于所选的 ProcessEngineLookup 策略（参见上一节）。这里，我们重点关注与 LocalProcessEngineLookup 结合使用的配置选项，它要求我们在类路径中提供 Spring flowable.cfg.xml 文件。

Flowable 提供了不同的 ProcessEngineConfiguration 实现，主要取决于底层的事务管理策略。flowable-cdi 模块不关心事务，这意味着可以使用任何事务管理策略（甚至是 Spring 事务抽象）。为了方便起见，CDI 模块提供了两个自定义的 ProcessEngineConfiguration 实现：

-   org.flowable.cdi.CdiJtaProcessEngineConfiguration：如果要为 Flowable 使用 JTA 管理的事务，可以使用 Flowable JtaProcessEngineConfiguration 的这个子类

-   org.flowable.cdi.CdiStandaloneProcessEngineConfiguration：如果要为 Flowable 使用普通的 JDBC 事务，可以使用 Flowable StandaloneProcessEngineConfiguration 的这个子类。以下是 JBoss 7 的 flowable.cfg.xml 文件示例：

<!-- -->

    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

        <!-- 查找 JTA 事务管理器 -->
        <bean id="transactionManager" class="org.springframework.jndi.JndiObjectFactoryBean">
            <property name="jndiName" value="java:jboss/TransactionManager"></property>
            <property name="resourceRef" value="true" />
        </bean>

        <!-- 流程引擎配置 -->
        <bean id="processEngineConfiguration"
            class="org.flowable.cdi.CdiJtaProcessEngineConfiguration">
            <!-- 查找默认的 JBoss 数据源 -->
            <property name="dataSourceJndiName" value="java:jboss/datasources/ExampleDS" />
            <property name="databaseType" value="h2" />
            <property name="transactionManager" ref="transactionManager" />
            <!-- 使用外部管理的事务 -->
            <property name="transactionsExternallyManaged" value="true" />
            <property name="databaseSchemaUpdate" value="true" />
        </bean>
    </beans>

以下是 Glassfish 3.1.1 的配置示例（假设已正确配置名为 jdbc/flowable 的数据源）：

    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

        <!-- 查找 JTA 事务管理器 -->
        <bean id="transactionManager" class="org.springframework.jndi.JndiObjectFactoryBean">
            <property name="jndiName" value="java:appserver/TransactionManager"></property>
            <property name="resourceRef" value="true" />
        </bean>

        <!-- 流程引擎配置 -->
        <bean id="processEngineConfiguration"
            class="org.flowable.cdi.CdiJtaProcessEngineConfiguration">
            <property name="dataSourceJndiName" value="jdbc/flowable" />
            <property name="transactionManager" ref="transactionManager" />
            <!-- 使用外部管理的事务 -->
            <property name="transactionsExternallyManaged" value="true" />
            <property name="databaseSchemaUpdate" value="true" />
        </bean>
    </beans>

注意，上述配置需要 "spring-context" 模块：

    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>4.2.5.RELEASE</version>
    </dependency>

Java SE 环境中的配置与[创建流程引擎](bpmn/ch03-Configuration.md#creating-a-processengine)一节中提供的示例完全相同，只需将 StandaloneProcessEngineConfiguration 替换为 CdiStandaloneProcessEngineConfiguration。

### 部署流程

可以使用标准的 Flowable API（RepositoryService）部署流程。此外，flowable-cdi 还提供了自动部署功能，可以部署在类路径顶层的 processes.xml 文件中列出的流程。以下是一个 processes.xml 文件示例：

    <?xml version="1.0" encoding="utf-8" ?>
    <!-- 列出要部署的流程 -->
    <processes>
        <process resource="diagrams/myProcess.bpmn20.xml" />
        <process resource="diagrams/myOtherProcess.bpmn20.xml" />
    </processes>

## 使用 CDI 的上下文流程执行

在本节中，我们简要介绍 Flowable CDI 扩展使用的上下文流程执行模型。BPMN 业务流程通常是一个长期运行的交互过程，包含用户任务和系统任务。在运行时，流程被分解为一组由用户和/或应用程序逻辑执行的独立工作单元。在 flowable-cdi 中，流程实例可以与 CDI 作用域关联，这种关联代表一个工作单元。当工作单元比较复杂时，这种方式特别有用，例如，当用户任务的实现是一系列不同表单的复杂序列，并且在这个交互过程中需要保持"非流程作用域"状态时。

在默认配置中，流程实例与"最广泛"的活动作用域关联，从对话开始，如果对话上下文不活动则回退到请求。

### 将对话与流程实例关联

在解析 @BusinessProcessScoped beans 或注入流程变量时，我们依赖于活动 CDI 作用域和流程实例之间的现有关联。flowable-cdi 提供了 org.flowable.cdi.BusinessProcess bean 来控制这种关联，主要包括：

-   *startProcessBy(…​)* 方法，映射了 Flowable RuntimeService 公开的相应方法，允许启动并随后关联业务流程。

-   resumeProcessById(String processInstanceId)，允许将流程实例与提供的 ID 关联。

-   resumeTaskById(String taskId)，允许将任务与提供的 ID（以及相应的流程实例）关联。

一旦工作单元（例如用户任务）完成，可以调用 completeTask() 方法来解除对话/请求与流程实例的关联。这向引擎发出信号，表明当前任务已完成，并使流程实例继续进行。

注意，BusinessProcess bean 是一个 @Named bean，这意味着可以使用表达式语言调用公开的方法，例如从 JSF 页面调用。以下 JSF2 代码片段开始一个新的对话，并将其与用户任务实例关联，该实例的 ID 作为请求参数传递（例如 pageName.jsf?taskId=XX）：

    <f:metadata>
        <f:viewParam name="taskId" />
        <f:event type="preRenderView" listener="#{businessProcess.startTask(taskId, true)}" />
    </f:metadata>

### 声明式控制流程

Flowable-cdi 允许使用注解声明式地启动流程实例和完成任务。@org.flowable.cdi.annotation.StartProcess 注解允许通过"key"或"name"启动流程实例。注意，流程实例是在注解方法返回*之后*启动的。示例：

    @StartProcess("authorizeBusinessTripRequest")
    public String submitRequest(BusinessTripRequest request) {
        // 执行一些工作
        return "success";
    }

根据 Flowable 的配置，注解方法的代码和流程实例的启动将在同一事务中组合。@org.flowable.cdi.annotation.CompleteTask 注解的工作方式相同：

    @CompleteTask(endConversation=false)
    public String authorizeBusinessTrip() {
        // 执行一些工作
        return "success";
    }

@CompleteTask 注解提供了结束当前对话的可能性。默认行为是在调用 Flowable 返回后结束对话。如上例所示，可以禁用结束对话。

### 从流程中引用 Beans

Flowable-cdi 使用自定义解析器将 CDI beans 暴露给 Flowable El，这使得可以从流程中引用 beans：

    <userTask id="authorizeBusinessTrip" name="Authorize Business Trip"
                flowable:assignee="#{authorizingManager.account.username}" />

其中 authorizingManager 可以是由生产者方法提供的 bean：

    @Inject    @ProcessVariable Object businessTripRequesterUsername;

    @Produces
    @Named
    public Employee authorizingManager() {
        TypedQuery<Employee> query = entityManager.createQuery("SELECT e FROM Employee e WHERE e.account.username='"
            + businessTripRequesterUsername + "'", Employee.class);
        Employee employee = query.getSingleResult();
        return employee.getManager();
    }

我们可以使用相同的特性在服务任务中调用 EJB 的业务方法，使用 flowable:expression="myEjb.method()" 扩展。注意，这需要在 MyEjb 类上添加 @Named 注解。

### 使用 @BusinessProcessScoped beans

使用 flowable-cdi，bean 的生命周期可以绑定到流程实例。为此，提供了一个自定义上下文实现，即 BusinessProcessContext。BusinessProcessScoped beans 的实例作为流程变量存储在当前流程实例中。BusinessProcessScoped beans 需要是 PassivationCapable（例如 Serializable）。以下是一个流程作用域 bean 的示例：

    @Named
    @BusinessProcessScoped
    public class BusinessTripRequest implements Serializable {
        private static final long serialVersionUID = 1L;
        private String startDate;
        private String endDate;
        // ...
    }

有时，我们想在没有与流程实例关联的情况下使用流程作用域 beans，例如在启动流程之前。如果当前没有活动的流程实例，BusinessProcessScoped beans 的实例会临时存储在本地作用域中，即对话或请求中，具体取决于上下文。如果此作用域稍后与业务流程实例关联，bean 实例将被刷新到流程实例中。

### 注入流程变量

流程变量可用于注入。flowable-cdi 支持：

-   使用 @Inject \[附加限定符\] Type fieldName 对 @BusinessProcessScoped beans 进行类型安全注入

-   使用 @ProcessVariable(name?) 限定符对其他流程变量进行非类型安全注入：

<!-- -->

    @Inject @ProcessVariable Object accountNumber;
    @Inject @ProcessVariable("accountNumber") Object account

要使用 EL 引用流程变量，有类似的选项：

-   可以直接引用 @Named @BusinessProcessScoped beans

-   其他流程变量可以使用 ProcessVariables-bean 引用：

<!-- -->

    #{processVariables['accountNumber']}

### 接收流程事件

Flowable 可以连接到 CDI 事件总线。这允许我们使用标准 CDI 事件机制接收流程事件通知。要为 Flowable 启用 CDI 事件支持，需要在配置中启用相应的解析监听器：

    <property name="postBpmnParseHandlers">
        <list>
            <bean class="org.flowable.cdi.impl.event.CdiEventSupportBpmnParseHandler" />
        </list>
    </property>

现在 Flowable 已配置为使用 CDI 事件总线发布事件。以下概述了如何在 CDI beans 中接收流程事件。在 CDI 中，我们可以使用 @Observes 注解声明式地指定事件观察者。事件通知是类型安全的。流程事件的类型是 org.flowable.cdi.BusinessProcessEvent。
以下是一个简单的事件观察者方法示例：

    public void onProcessEvent(@Observes BusinessProcessEvent businessProcessEvent) {
        // 处理事件
    }

此观察者会收到所有事件的通知。如果我们想限制观察者接收的事件集合，可以添加限定符注解：

-   @BusinessProcess：将事件集合限制为特定的流程定义。示例：@Observes @BusinessProcess("billingProcess") BusinessProcessEvent evt

-   @StartActivity：通过特定活动限制事件集合。例如：@Observes @StartActivity("shipGoods") BusinessProcessEvent evt 在每次进入 ID 为 "shipGoods" 的活动时调用。

-   @EndActivity：通过特定活动限制事件集合。例如：@Observes @EndActivity("shipGoods") BusinessProcessEvent evt 在每次离开 ID 为 "shipGoods" 的活动时调用。

-   @TakeTransition：通过特定转换限制事件集合。

-   @CreateTask：通过特定任务的创建限制事件集合。

-   @DeleteTask：通过特定任务的删除限制事件集合。

-   @AssignTask：通过特定任务的分配限制事件集合。

-   @CompleteTask：通过特定任务的完成限制事件集合。

上述限定符可以自由组合。例如，要接收在 "shipmentProcess" 中离开 "shipGoods" 活动时生成的所有事件，我们可以编写以下观察者方法：

    public void beforeShippingGoods(@Observes @BusinessProcess("shippingProcess") @EndActivity("shipGoods") BusinessProcessEvent evt) {
        // 处理事件
    }

在默认配置中，事件监听器是同步调用的，并在同一事务的上下文中执行。CDI 事务观察者（仅在与 JavaEE/EJB 结合使用时可用）允许控制何时将事件传递给观察者方法。使用事务观察者，我们可以例如确保仅在触发事件的事务成功时才通知观察者：

    public void onShipmentSucceeded(@Observes(during=TransactionPhase.AFTER_SUCCESS) @BusinessProcess("shippingProcess") @EndActivity("shipGoods") BusinessProcessEvent evt) {
        // 发送邮件给客户
    }

### 其他特性

-   ProcessEngine 以及相关服务可用于注入：@Inject ProcessEngine、RepositoryService、TaskService 等

-   当前流程实例和任务可以注入：@Inject ProcessInstance、Task

-   当前业务键可以注入：@Inject @BusinessKey String businessKey

-   当前流程实例 ID 可以注入：@Inject @ProcessInstanceId String pid

## 已知限制

尽管 flowable-cdi 是针对 SPI 实现的，并且设计为"可移植扩展"，但它仅使用 Weld 进行过测试。