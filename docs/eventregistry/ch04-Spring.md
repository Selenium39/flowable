---
id: ch04-Spring
title: Spring 集成
description: 本文介绍Flowable事件注册表与Spring框架的集成方法，包括EventRegistryFactoryBean配置和自动资源部署功能，帮助开发者高效管理事件注册表引擎。
keywords: Flowable,事件注册表,Spring集成,EventRegistryFactoryBean,自动部署,引擎配置,资源管理
---

虽然你完全可以在不使用 Spring 的情况下使用 Flowable Event Registry，但我们提供了一些非常好的集成特性，本章将对此进行说明。

## EventRegistryFactoryBean

EventRegistryEngine 可以配置为常规的 Spring bean。集成的起点是 org.flowable.eventregistry.spring.EventRegistryFactoryBean 类。这个 bean 接收一个 Event Registry 引擎配置并创建 Event Registry 引擎。这意味着 Spring 的属性创建和配置与[配置章节](eventregistry/ch02-Configuration.md#creating-an-event-registry-engine)中记录的相同。对于 Spring 集成，配置和引擎 bean 将如下所示：

    <bean id="eventEngineConfiguration" class="org.flowable.eventregistry.spring.SpringEventRegistryEngineConfiguration">
        ...
    </bean>

    <bean id="eventRegistryEngine" class="org.flowable.eventregistry.spring.EventRegistryFactoryBean">
      <property name="eventEngineConfiguration" ref="eventEngineConfiguration" />
    </bean>

注意，eventEngineConfiguration bean 现在使用 org.flowable.eventregistry.spring.SpringEventRegistryEngineConfiguration 类。

## 自动资源部署

Spring 集成还具有部署资源的特殊功能。在 Event Registry 引擎配置中，你可以指定一组资源。当创建 Event Registry 引擎时，所有这些资源都将被扫描并部署。系统中有过滤机制可以防止重复部署。只有当资源实际发生变化时，新的部署才会被部署到 Flowable Event Registry 数据库中。这在很多用例中都很有意义，比如 Spring 容器经常重启的情况（例如，测试）。

这里有一个例子：

    <bean id="eventEngineConfiguration" class="org.flowable.eventregistry.spring.SpringEventRegistryEngineConfiguration">
      ...
      <property name="deploymentResources"
          value="classpath*:/org/flowable/test/autodeployment/autodeploy/event*.event" />
    </bean>

    <bean id="eventRegistryEngine" class="org.flowable.eventregistry.spring.EventRegistryFactoryBean">
      <property name="eventEngineConfiguration" ref="eventEngineConfiguration" />
    </bean>

默认情况下，上述配置会将所有匹配过滤条件的资源分组到单个部署中，并部署到 Flowable Event Registry 引擎。防止重新部署未更改资源的重复过滤适用于整个部署。在某些情况下，这可能不是你想要的。例如，如果你以这种方式部署一组 Event Registry 资源，而这些资源中只有一个事件或通道定义发生了变化，整个部署将被视为新的，部署中的所有流程定义都将被重新部署，导致每个事件和通道定义都产生新版本，尽管只有一个实际发生了变化。

为了能够自定义确定部署的方式，你可以在 SpringEventRegistryEngineConfiguration 中指定一个额外的属性 deploymentMode。此属性定义了如何从匹配过滤器的资源集合中确定部署。默认情况下，此属性支持三个值：

- default：将所有资源分组到单个部署中，并对该部署应用重复过滤。这是默认值，如果你不指定值，将使用此值。

- single-resource：为每个单独的资源创建单独的部署，并对该部署应用重复过滤。如果你希望每个事件和通道定义单独部署，并且只在发生更改时才创建新的事件和通道定义版本，就使用这个值。

- resource-parent-folder：为共享相同父文件夹的资源创建单独的部署，并对该部署应用重复过滤。此值可用于为大多数资源创建单独的部署，但仍然可以通过将某些资源放在共享文件夹中来进行分组。以下是如何为 deploymentMode 指定 single-resource 配置的示例：

<!-- -->

    <bean id="eventEngineConfiguration"
        class="org.flowable.eventregistry.spring.SpringEventRegistryEngineConfiguration">
      ...
      <property name="deploymentResources" value="classpath*:/flowable/*.event" />
      <property name="deploymentMode" value="single-resource" />
    </bean>

除了使用上述 deploymentMode 的值之外，你可能还想要自定义确定部署的行为。如果是这样，你可以创建 SpringEventRegistryEngineConfiguration 的子类，并重写 getAutoDeploymentStrategy(String deploymentMode) 方法。此方法确定对于 deploymentMode 配置的特定值使用哪种部署策略。

## 单元测试

在与 Spring 集成时，可以使用标准的 [Flowable 测试工具](eventregistry/ch03-API.md#unit-testing) 非常容易地测试决策。
以下示例展示了如何在典型的基于 Spring 的 JUnit 5 测试中测试决策：

**JUnit 5 测试**

    @ExtendWith(FlowableEventSpringExtension.class)
    @SpringJUnitConfig(classes = EventRegistryJmsConfiguration.class)
    public class SpringEventRegistryChangeDetectorTest {

      @Autowired
      private EventRegistryEngine eventRegistryEngine;

      @Test
      public void testChangeDetectionRunnableCreatedWhenNotExplicitelyInjected() {
        assertThat(eventRegistryEngine.getEventRegistryEngineConfiguration().getEventRegistryChangeDetectionManager())
            .isInstanceOf(DefaultEventRegistryChangeDetectionManager.class);

        EventRegistryChangeDetectionExecutor eventRegistryChangeDetectionExecutor = eventRegistryEngine
            .getEventRegistryEngineConfiguration().getEventRegistryChangeDetectionExecutor();
        assertThat(eventRegistryChangeDetectionExecutor).isInstanceOf(DefaultSpringEventRegistryChangeDetectionExecutor.class);

        DefaultSpringEventRegistryChangeDetectionExecutor executor = (DefaultSpringEventRegistryChangeDetectionExecutor) 
            eventRegistryChangeDetectionExecutor;
        assertThat(executor.getTaskScheduler()).isInstanceOf(ThreadPoolTaskScheduler.class);
      }
    }