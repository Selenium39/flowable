---
id: ch03-API
title: Flowable DMN API
description: 本文档详细介绍Flowable DMN引擎API及核心服务，包括DmnEngine创建方式、线程安全服务对象(DmnRuleService、DmnRepositoryService等)的使用方法，以及决策部署与执行的关键操作指南。
keywords: Flowable,DMN引擎,决策管理,DmnEngine配置,DmnRuleService,DmnRepositoryService,API文档,BPMN2.0
---

## DMN 引擎 API 和服务

DMN 引擎 API 是与 Flowable DMN 交互最常用的方式。核心起点是 DmnEngine，它可以通过[配置章节](dmn/ch02-Configuration.md#creating-a-dmn-engine)中描述的几种方式创建。通过 DmnEngine，你可以获取各种其他服务。
DmnEngine 和服务对象都是线程安全的。因此你可以在整个服务器中保持对其中一个的引用。

    DmnEngine dmnEngine = DmnEngines.getDefaultDmnEngine();
    DmnRuleService dmnRuleService = dmnEngine.getDmnRuleService();
    DmnRepositoryService dmnRepositoryService = dmnEngine.getDmnRepositoryService();
    DmnManagementService dmnManagementService = dmnEngine.getDmnManagementService();

DmnEngines.getDefaultDmnEngine() 在第一次调用时会初始化并构建一个 DMN 引擎，之后总是返回相同的 DMN 引擎。可以通过 DMNEngines.init() 和 DMNEngines.destroy() 来正确创建和关闭所有 DMN 引擎。

DmnEngines 类会扫描所有的 flowable.dmn.cfg.xml 和 flowable-dmn-context.xml 文件。对于所有的 flowable.dmn.cfg.xml 文件，DMN 引擎将以典型的 Flowable 方式构建：DmnEngineConfiguration.createDmnEngineConfigurationFromInputStream(inputStream).buildDmnEngine()。对于所有的 flowable-dmn-context.xml 文件，DMN 引擎将以 Spring 方式构建：首先创建 Spring 应用上下文，然后从该应用上下文中获取 DMN 引擎。

所有服务都是无状态的。这意味着你可以轻松地在集群中的多个节点上运行 Flowable DMN，每个节点都连接到相同的数据库，而不用担心哪台机器实际执行了之前的调用。无论在哪里执行，对任何服务的调用都是幂等的。

**DmnRepositoryService** 可能是使用 Flowable DMN 引擎时最先需要的服务。该服务提供了管理和操作部署和 DMN 定义的操作。DMN 定义是 DMN 模型的根本概念（DMN 的主要概念在 &lt;dmn-introduction, DMN 介绍章节&gt; 中有解释）。它包含了决策（及其决策表）的定义。
部署是 Flowable DMN 引擎中的打包单元。一个部署可以包含多个 DMN XML 文件。部署意味着将其上传到引擎，所有的 DMN 定义在存储到数据库之前都会被检查和解析。从那时起，系统就知道了该部署，部署中包含的任何决策都可以执行了。

此外，该服务允许你：

- 查询引擎已知的部署、DMN 定义和决策表。

- 获取 DMN 定义或决策表的 POJO 版本，可以使用 Java 而不是 XML 来进行内省。

**DmnRuleService** 提供了执行决策的方法。通过提供参数和输入数据，可以启动决策的评估。

**DmnManagementService** 在使用 Flowable DMN 编写自定义应用程序时通常不需要。它允许你获取有关引擎版本、数据库表和表元数据的信息。

有关服务操作和 DMN 引擎 API 的更详细信息，请参见 [javadocs](http://www.flowable.org/docs/javadocs/index.html)。

## 异常策略

Flowable 中的基础异常是 org.flowable.engine.FlowableException，这是一个非受检异常。API 可以随时抛出此异常，但在特定方法中发生的"预期"异常会在 [javadocs](http://www.flowable.org/docs/javadocs/index.html) 中有所记录。例如，以下是来自 DmnRuleService 的一个示例：

    /**
      * 通过决策键执行决策。
      *
      * @param  decisionKey      决策键，不能为空
      * @param  inputVariables   输入变量的映射
      * @return                  此次执行的 {@link RuleEngineExecutionResult}
      * @throws FlowableObjectNotFoundException
      *            当给定键的决策不存在时抛出。
      * @throws FlowableException
      *           当执行决策时发生错误时抛出。
      */
    RuleEngineExecutionResult executeDecisionByKey(String decisionKey, Map<String, Object> inputVariables);

在上面的示例中，当传入一个不存在决策的键时，将抛出异常。此外，由于 javadoc **明确指出 decisionKey 不能为空，当传入 null 时将抛出 FlowableIllegalArgumentException**。

尽管我们想避免庞大的异常层次结构，但在特定情况下会抛出以下子类异常。在流程执行或 API 调用期间发生的、不符合以下可能异常的所有其他错误都将作为常规 FlowableExceptions 抛出。

-   FlowableOptimisticLockingException：当由于并发访问相同数据条目导致数据存储中发生乐观锁定时抛出。

-   FlowableClassLoadingException：当请求加载的类未找到或加载时发生错误时抛出。

-   FlowableObjectNotFoundException：当请求或操作的对象不存在时抛出。

-   FlowableIllegalArgumentException：表示在 Flowable DMN API 调用中提供了非法参数，在引擎配置中配置了非法值，或提供了非法值时抛出的异常。

## 查询 API

从引擎查询数据有两种方式：查询 API 和原生查询。查询 API 允许使用流畅的 API 编写完全类型安全的查询。你可以为查询添加各种条件（所有条件都作为逻辑 AND 一起应用）和精确的排序。以下代码展示了一个示例：

    List<DmnDeployment> dmnDeployments = dmnRepositoryService.createDeploymentQuery()
        .deploymentNameLike("deployment%")
        .orderByDeployTime()
        .list();

有时你需要更强大的查询，例如，使用 OR 运算符的查询或无法使用查询 API 表达的限制。对于这些情况，我们引入了原生查询，它允许你编写自己的 SQL 查询。返回类型由你使用的查询对象定义，数据会被映射到正确的对象中，如 Deployment、ProcessInstance、Execution 等。由于查询将在数据库中执行，你必须使用数据库中定义的表名和列名；这需要对内部数据结构有一定了解，建议谨慎使用原生查询。可以通过 API 获取表名，以尽可能减少依赖。

    long count = dmnRepositoryService.createNativeDeploymentQuery()
        .sql("SELECT count(*) FROM " + dmnManagementService.getTableName(DmnDeploymentEntity.class) + " D1, "
            + dmnManagementService.getTableName(DecisionTableEntity.class) + " D2 "
            + "WHERE D1.ID_ = D2.DEPLOYMENT_ID_ "
            + "AND D1.ID_ = #{deploymentId}")
        .parameter("deploymentId", deployment.getId())
        .count();

## 单元测试

由于 Flowable DMN 是一个可嵌入的 Java 引擎，为 DMN 定义编写单元测试就像编写常规单元测试一样简单。

Flowable 支持 JUnit 4 和 5 风格的单元测试。

在 JUnit 5 风格中，需要使用 org.flowable.dmn.engine.test.FlowableDmnTest 注解，
或手动注册 org.flowable.dmn.engine.test.FlowableDmnExtension。
FlowableDmnTest 注解只是一个元注解，它会注册 FlowableDmnExtension
（即执行 @ExtendWith(FlowableDmnExtension.class)）。
这将使 DmnEngine 和服务作为参数在测试和生命周期方法中可用
（@BeforeAll、@BeforeEach、@AfterEach、@AfterAll）。
在每次测试之前，dmnEngine 将默认使用类路径上的 flowable.dmn.cfg.xml 资源进行初始化。
要指定不同的配置文件，需要使用 org.flowable.dmn.engine.test.DmnConfigurationResource
注解（参见第二个示例）。
当配置资源相同时，DMN 引擎在多个单元测试中会被静态缓存。

通过使用 FlowableDmnExtension，你可以使用 org.flowable.dmn.engine.test.DmnDeployment
或 org.flowable.dmn.engine.test.DmnDeploymentAnnotation 注解测试方法。
如果同时使用了 @DmnDeployment 和 @DmnDeploymentAnnotation，则 @DmnDeployment
优先，@DmnDeploymentAnnotation 将被忽略。
当测试方法使用 @DmnDeployment 注解时，
在每次测试之前，DmnDeployment#resources 中定义的 dmn 文件将被部署。
如果没有定义资源，将部署与测试类在同一包中、形如 testClassName.testMethod.dmn
的资源文件。
在测试结束时，部署将被删除，包括所有相关的 dmn 定义、执行等。
更多信息请参见 DmnDeployment 类。

考虑到以上所有内容，JUnit 5 测试如下所示：

**使用默认资源的 JUnit 5 测试**

    @FlowableDmnTest
    class MyDecisionTableTest {

      @Test
      @DmnDeploymentAnnotation
      void simpleDmnTest(DmnEngine dmnEngine) {
        DmnRuleService dmnRuleService = dmnEngine.getDmnRuleService();

        Map<String, Object> executionResult = ruleService.createExecuteDecisionBuilder()
                .decisionKey("extensionUsage")
                .variable("inputVariable1", 2)
                .variable("inputVariable2", "test2")
                .executeWithSingleResult();

        Assertions.assertThat(executionResult).containsEntry("output1", "test1");
      }
    }

    在 JUnit 5 中，你还可以将部署 ID（使用 +org.flowable.dmn.engine.test.DmnDeploymentId+_）注入到测试和生命周期方法中。

**使用自定义资源的 JUnit 5 测试**

    @FlowableDmnTest
    @DmnConfigurationResource("flowable.custom.dmn.cfg.xml")
    class MyDecisionTableTest {

      @Test
      @DmnDeploymentAnnotation
      void simpleDmnTest(DmnEngine dmnEngine) {
        DmnRuleService dmnRuleService = dmnEngine.getDmnRuleService();

        Map<String, Object> executionResult = ruleService.createExecuteDecisionBuilder()
                .decisionKey("extensionUsage")
                .variable("inputVariable1", 2)
                .variable("inputVariable2", "test2")
                .executeWithSingleResult();

        Assertions.assertThat(executionResult).containsEntry("output1", "test1");
      }
    }

在编写 JUnit 4 单元测试时，可以使用 org.flowable.dmn.engine.test.FlowableDmnRule Rule。通过这个规则，可以通过 getter 方法获取 DMN 引擎和服务。包含这个 Rule 将启用 org.flowable.dmn.engine.test.DmnDeploymentAnnotation 注解（有关其使用和配置的说明见上文），并将在类路径上查找默认配置文件。当使用相同的配置资源时，DMN 引擎在多个单元测试中会被静态缓存。
还可以为规则提供自定义引擎配置。

以下代码片段展示了使用 JUnit 4 风格测试和 FlowableDmnRule 的示例（并传入可选的自定义配置）：

**JUnit 4 测试**

    public class MyDecisionTableTest {

      @Rule
      public FlowableDmnRule flowableDmnRule = new FlowableDmnRule("custom1.flowable.dmn.cfg.xml");

      @Test
      @DmnDeploymentAnnotation
      public void ruleUsageExample() {
        DmnEngine dmnEngine = flowableDmnRule.getDmnEngine();
        DmnRuleService dmnRuleService = dmnEngine.getDmnRuleService();

        Map<String, Object> executionResult = ruleService.createExecuteDecisionBuilder()
                .decisionKey("extensionUsage")
                .variable("inputVariable1", 2)
                .variable("inputVariable2", "test2")
                .executeWithSingleResult();

        Assertions.assertThat(executionResult).containsEntry("output1", "test1");
      }
    }

## Web 应用中的 DMN 引擎

DmnEngine 是一个线程安全的类，可以轻松地在多个线程之间共享。在 Web 应用中，这意味着可以在容器启动时创建一次 DMN 引擎，并在容器关闭时关闭引擎。

以下代码片段展示了如何编写一个简单的 ServletContextListener 来在普通 Servlet 环境中初始化和销毁流程引擎：

    public class DmnEnginesServletContextListener implements ServletContextListener {

      public void contextInitialized(ServletContextEvent servletContextEvent) {
        DmnEngines.init();
      }

      public void contextDestroyed(ServletContextEvent servletContextEvent) {
        DmnEngines.destroy();
      }

    }

contextInitialized 方法将委托给 DmnEngines.init()。这将在类路径上查找 flowable.dmn.cfg.xml 资源文件，并为给定的配置创建 DmnEngine（例如，带有配置文件的多个 JAR）。如果在类路径上有多个这样的资源文件，请确保它们都有不同的名称。当需要 DMN 引擎时，可以使用以下方式获取：

    DmnEngines.getDefaultDmnEngine()

或：

    DmnEngines.getDmnEngine("myName");

当然，也可以使用创建 DMN 引擎的任何变体，
如[配置章节](dmn/ch02-Configuration.md#creating-a-dmn-engine)中所述。

上下文监听器的 contextDestroyed 方法委托给 DmnEngines.destroy()。这将正确关闭所有已初始化的 DMN 引擎。