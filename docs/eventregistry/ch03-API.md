---
id: ch03-API
title: Flowable 事件注册表 API
description: Flowable 事件注册表 API文档详解核心服务与使用方法，包括EventRegistryEngine创建、事件/通道定义管理及事件收发操作，适用于开发者在集群环境中高效集成事件驱动架构。
keywords: Flowable,事件注册表,API文档,EventRegistryEngine,事件管理,通道定义,服务调用,Java集成
---

## 事件注册表引擎 API 和服务

事件注册表引擎 API 是与 Flowable 事件注册表交互最常用的方式。核心起点是 EventRegistryEngine，它可以通过[配置章节](eventregistry/ch02-Configuration.md#creating-an-event-registry-engine)中描述的几种方式创建。通过 EventRegistryEngine，你可以获取各种其他服务。
EventRegistryEngine 和服务对象都是线程安全的。因此你可以在整个服务器中保持对其中一个的引用。

    EventRegistryEngine eventRegistryEngine = EventRegistryEngines.getDefaultEventRegistryEngine();
    EventRegistry eventRegistry = eventRegistryEngine.getEventRegistry();
    EventRepositoryService eventRepositoryService = eventRegistryEngine.getEventRepositoryService();
    EventManagementService eventManagementService = eventRegistryEngine.getEventManagementService();

EventRegistryEngines.getDefaultEventRegistryEngine() 在第一次调用时会初始化并构建一个事件注册表引擎，之后总是返回相同的事件注册表引擎。可以通过 EventRegistryEngines.init() 和 EventRegistryEngines.destroy() 来正确创建和关闭所有事件注册表引擎。

EventRegistryEngines 类会扫描所有的 flowable.eventregistry.cfg.xml 和 flowable-eventregistry-context.xml 文件。对于所有的 flowable.eventregistry.cfg.xml 文件，事件注册表引擎将以典型的 Flowable 方式构建：EventRegistryEngineConfiguration.createEventRegistryEngineConfigurationFromInputStream(inputStream).buildEventRegistryEngine()。对于所有的 flowable-eventregistry-context.xml 文件，事件注册表引擎将以 Spring 方式构建：首先创建 Spring 应用上下文，然后从该应用上下文中获取事件注册表引擎。

所有服务都是无状态的。这意味着你可以轻松地在集群中的多个节点上运行 Flowable 事件注册表，每个节点都连接到相同的数据库，而不必担心哪台机器实际执行了之前的调用。对任何服务的任何调用都是幂等的，无论在哪里执行。

**EventRepositoryService** 可能是使用 Flowable 事件注册表引擎时最先需要的服务。该服务提供了管理和操作部署以及事件和通道定义的操作。
事件定义用于配置事件负载和关联参数，并定义与特定通道定义键的关系。
通道定义配置传入或传出事件的源或目标目的地。例如，通道定义可以定义一个 JMS 监听器到名为 **orderQueue** 的 JMS 队列。
部署是 Flowable 事件注册表引擎中的打包单位。一个部署可以包含多个事件和通道定义 JSON 文件。部署一个部署包意味着将其上传到引擎，在那里所有事件和通道定义都会被检查和解析，然后存储在数据库中。从那时起，系统就知道了该部署，部署中包含的任何事件和通道定义现在都可以使用了。

此外，该服务允许你：

- 查询引擎已知的部署、事件和通道定义。

- 获取事件和通道定义的 POJO 版本，可以使用 Java 而不是 JSON 来进行内省。

**EventRegistry** 提供了接收和发送事件实例的方法。它还提供了添加和删除事件消费者的方法。

在使用 Flowable 事件注册表编写自定义应用程序时，通常不需要 **EventManagementService**。它允许你检索有关引擎版本、数据库表和表元数据的信息。

有关服务操作和事件注册表引擎 API 的更详细信息，请参见[javadocs](http://www.flowable.org/docs/javadocs/index.html)。

## 异常策略

Flowable 中的基本异常是 org.flowable.engine.FlowableException，这是一个未检查异常。API 可以随时抛出此异常，但特定方法中发生的"预期"异常在[javadocs](http://www.flowable.org/docs/javadocs/index.html)中有文档说明。

    /**
      * 获取事件定义的 Java 表示。
      *
      * @param  eventDefinitionKey      事件定义键，不能为 null
      * @return 事件模型的 Java 表示。
      */
    EventModel getEventModelByKey(String eventDefinitionKey);

在上面的示例中，当传入一个不存在事件定义的键时，将抛出异常。此外，由于 javadoc **明确指出 eventDefinitionKey 不能为 null，当传入 null 时将抛出 FlowableIllegalArgumentException**。

尽管我们想避免庞大的异常层次结构，但在特定情况下会抛出以下子类。在执行或 API 调用期间发生的所有其他错误，如果不符合以下可能的异常，都将作为常规 FlowableExceptions 抛出。

- FlowableOptimisticLockingException：当由于同一数据条目的并发访问导致数据存储中发生乐观锁定时抛出。

- FlowableClassLoadingException：当请求加载的类未找到或加载时发生错误时抛出。

- FlowableObjectNotFoundException：当请求或操作的对象不存在时抛出。

- FlowableIllegalArgumentException：表示在 Flowable 事件注册表 API 调用中提供了非法参数，在引擎配置中配置了非法值或提供了非法值时抛出的异常。

## 查询 API

查询 API 允许使用流畅的 API 编程完全类型安全的查询。你可以向查询添加各种条件（所有条件都作为逻辑 AND 一起应用）并精确指定一个排序。以下代码显示了一个示例：

    List<EventDeployment> eventDeployments = eventRepositoryService.createDeploymentQuery()
        .deploymentNameLike("deployment%")
        .orderByDeployTime()
        .list();

## 单元测试

由于 Flowable 事件注册表是一个可嵌入的 Java 引擎，为事件和通道定义编写单元测试就像编写常规单元测试一样简单。

Flowable 支持 JUnit 5 风格的单元测试。

在 JUnit 5 风格中，需要注册 org.flowable.eventregistry.test.FlowableEventExtension。
注册 FlowableEventExtension 可以通过 @ExtendWith(FlowableEventExtension.class) 完成。
这将使 EventRegistryEngine 和服务作为参数在测试和生命周期方法中可用
(@BeforeAll, @BeforeEach, @AfterEach, @AfterAll)。
在每次测试之前，eventRegistryEngine 将默认使用类路径上的 flowable.eventregistry.cfg.xml 资源进行初始化。
要指定不同的配置文件，需要使用 org.flowable.eventregistry.test.EventConfigurationResource
注解（参见第二个示例）。
当配置资源相同时，事件注册表引擎在多个单元测试中静态缓存。

通过使用 EventRegistryEngine，你可以使用 org.flowable.eventregistry.test.EventDeploymentAnnotation 注解测试方法。
当测试方法使用 @EventDeploymentAnnotation 注解时，在每次测试之前，EventDeploymentAnnotation#resources 中定义的事件定义文件将被部署。
如果没有定义资源，将部署与测试类在同一包中的形式为 testClassName.testMethod.event 的资源文件。
在测试结束时，部署将被删除，包括所有相关的事件和通道定义。
有关更多信息，请参见 EventDeploymentAnnotation 类。

此外，通过使用 EventRegistryEngine，你可以使用 org.flowable.eventregistry.test.ChannelDeploymentAnnotation 注解测试方法。
当测试方法使用 @ChannelDeploymentAnnotation 注解时，在每次测试之前，ChannelDeploymentAnnotation#resources 中定义的通道定义文件将被部署。
如果没有定义资源，将部署与测试类在同一包中的形式为 testClassName.testMethod.channel 的资源文件。
在测试结束时，部署将被删除，包括所有相关的事件和通道定义。
有关更多信息，请参见 EventDeploymentAnnotation 类。

考虑到所有这些，JUnit 5 测试如下所示：

**使用默认资源的 JUnit 5 测试。**

    @ExtendWith(FlowableEventExtension.class)
    class MyEventDefinitionTest {

      @Test
      @EventDeploymentAnnotation
      void simpleEventDefinitionTest(EventRegistryEngine eventRegistryEngine) {
          EventRepositoryService repositoryService = eventRegistryEngine.getEventRepositoryService();
          EventDefinition eventDefinition = repositoryService.createEventDefinitionQuery()
                .eventDefinitionKey("myEvent")
                .latestVersion()
                .singleResult();
          assertNotNull(eventDefinition);
          assertEquals("myEvent", eventDefinition.getKey());
          assertEquals(1, eventDefinition.getVersion());
      }
    }

**使用自定义资源的 JUnit 5 测试。**

    @ExtendWith(FlowableEventExtension.class)
    @EventConfigurationResource("flowable.custom.eventregistry.cfg.xml")
    class MyEventDefinitionTest {

      @Test
      @EventDeploymentAnnotation
      void simpleEventDefinitionTest(EventRegistryEngine eventRegistryEngine) {
          EventRepositoryService repositoryService = eventRegistryEngine.getEventRepositoryService();
          EventDefinition eventDefinition = repositoryService.createEventDefinitionQuery()
                .eventDefinitionKey("myEvent")
                .latestVersion()
                .singleResult();
          assertNotNull(eventDefinition);
          assertEquals("myEvent", eventDefinition.getKey());
          assertEquals(1, eventDefinition.getVersion());
      }
    }

## Web 应用程序中的事件注册表引擎

EventRegistryEngine 是一个线程安全的类，可以轻松地在多个线程之间共享。在 Web 应用程序中，这意味着可以在容器启动时创建事件注册表引擎一次，并在容器关闭时关闭引擎。

以下代码片段显示了如何编写一个简单的 ServletContextListener 来在普通 Servlet 环境中初始化和销毁进程引擎：

    public class EventRegistryEnginesServletContextListener implements ServletContextListener {

      public void contextInitialized(ServletContextEvent servletContextEvent) {
        EventRegistryEngines.init();
      }

      public void contextDestroyed(ServletContextEvent servletContextEvent) {
        EventRegistryEngines.destroy();
      }

    }

contextInitialized 方法将委托给 EventRegistryEngines.init()。这将在类路径上查找 flowable.eventregistry.cfg.xml 资源文件，并为给定的配置创建一个 EventRegistryEngine（例如，具有配置文件的多个 JAR）。如果在类路径上有多个这样的资源文件，请确保它们都有不同的名称。当需要事件注册表引擎时，可以使用以下方式获取：

    EventRegistryEngines.getDefaultEventRegistryEngine()

或：

    EventRegistryEngines.getEventRegistryEngine("myName");

当然，也可以使用创建事件注册表引擎的任何变体，
如[配置章节](eventregistry/ch02-Configuration.md#creating-an-event-registry-engine)中所述。

上下文监听器的 contextDestroyed 方法委托给 EventRegistryEngines.destroy()。这将正确关闭所有已初始化的事件注册表引擎。