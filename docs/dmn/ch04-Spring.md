---
id: ch04-Spring
title: Spring 集成
description: 本文档详细介绍Flowable DMN与Spring框架的集成方法，包括DmnEngineFactoryBean配置、自动资源部署及部署模式设置，帮助开发者高效实现决策管理。
keywords: Flowable,DMN,Spring集成,DmnEngineFactoryBean,自动部署,决策管理,Spring配置
---

虽然你完全可以不使用 Spring 来使用 Flowable DMN，但我们提供了一些非常好的集成特性，本章将对此进行说明。

## DmnEngineFactoryBean

DmnEngine 可以配置为常规的 Spring bean。集成的起点是 org.flowable.dmn.spring.DmnEngineFactoryBean 类。这个 bean 接收 DMN 引擎配置并创建 DMN 引擎。这意味着 Spring 的属性创建和配置与[配置章节](dmn/ch02-Configuration.md#creating-a-dmn-engine)中记录的相同。对于 Spring 集成，配置和引擎 bean 将如下所示：

    <bean id="dmnEngineConfiguration" class="org.flowable.dmn.spring.SpringDmnEngineConfiguration">
        ...
    </bean>

    <bean id="dmnEngine" class="org.flowable.dmn.spring.DmnEngineFactoryBean">
      <property name="dmnEngineConfiguration" ref="dmnEngineConfiguration" />
    </bean>

注意，dmnEngineConfiguration bean 现在使用 org.flowable.dmn.spring.SpringDmnEngineConfiguration 类。

## 自动资源部署

Spring 集成还有一个用于部署资源的特殊功能。在 DMN 引擎配置中，你可以指定一组资源。当 DMN 引擎创建时，所有这些资源都将被扫描并部署。系统中有过滤机制可以防止重复部署。只有当资源实际发生变化时，新的部署才会被部署到 Flowable DMN 数据库中。这在许多用例中很有意义，比如 Spring 容器经常重启的情况（例如测试）。

这里有一个例子：

    <bean id="dmnEngineConfiguration" class="org.flowable.spring.SpringDmnEngineConfiguration">
      ...
      <property name="deploymentResources"
        value="classpath*:/org/flowable/spring/test/autodeployment/autodeploy/decision*.dmn" />
    </bean>

    <bean id="dmnEngine" class="org.flowable.dmn.spring.DmnEngineFactoryBean">
      <property name="dmnEngineConfiguration" ref="dmnEngineConfiguration" />
    </bean>

默认情况下，上述配置会将所有匹配过滤条件的资源组合成一个部署到 Flowable DMN 引擎中。防止重新部署未更改资源的重复过滤适用于整个部署。在某些情况下，这可能不是你想要的。例如，如果你以这种方式部署一组 DMN 资源，而这些资源中只有一个 DMN 定义发生了变化，整个部署将被视为新的，该部署中的所有流程定义都将被重新部署，导致每个 DMN 定义都产生新版本，尽管实际上只有一个发生了变化。

为了能够自定义确定部署的方式，你可以在 SpringDmnEngineConfiguration 中指定一个额外的属性 deploymentMode。此属性定义了如何从匹配过滤器的资源集合中确定部署。该属性默认支持三个值：

- default：将所有资源组合到一个部署中，并对该部署应用重复过滤。这是默认值，如果你不指定值，将使用此值。

- single-resource：为每个单独的资源创建一个单独的部署，并对该部署应用重复过滤。如果你希望每个 DMN 定义单独部署，并且只在发生更改时才创建新的 DMN 定义版本，就使用这个值。

- resource-parent-folder：为共享相同父文件夹的资源创建单独的部署，并对该部署应用重复过滤。此值可用于为大多数资源创建单独的部署，但仍然可以通过将它们放在共享文件夹中来对某些资源进行分组。以下是如何为 deploymentMode 指定 single-resource 配置的示例：

<!-- -->

    <bean id="dmnEngineConfiguration"
        class="org.flowable.dmn.spring.SpringDmnEngineConfiguration">
      ...
      <property name="deploymentResources" value="classpath*:/flowable/*.dmn" />
      <property name="deploymentMode" value="single-resource" />
    </bean>

除了使用上述 deploymentMode 的值外，你可能还想要自定义确定部署的行为。如果是这样，你可以创建 SpringDmnEngineConfiguration 的子类并重写 getAutoDeploymentStrategy(String deploymentMode) 方法。此方法确定对 deploymentMode 配置的某个值使用哪种部署策略。

## 单元测试

在与 Spring 集成时，可以使用标准的 [Flowable 测试工具](dmn/ch03-API.md#unit-testing) 非常容易地测试决策。
以下示例展示了如何在典型的基于 Spring 的 JUnit 4 和 5 测试中测试决策：

**JUnit 5 测试**

    @ExtendWith(FlowableDmnSpringExtension.class)
    @ExtendWith(SpringExtension.class)
    @ContextConfiguration(classes = DmnSpringJunitJupiterTest.TestConfiguration.class)
    public class SpringJunit4Test {

        @Autowired
        private DmnEngine dmnEngine;

        @Autowired
        private DmnRuleService ruleService;

        @Test
        @DmnDeploymentAnnotation
        public void simpleDecisionTest() {
            Map<String, Object> executionResult = ruleService.createExecuteDecisionBuilder()
                .decisionKey("extensionUsage")
                .variable("inputVariable1", 2)
                .variable("inputVariable2", "test2")
                .executeWithSingleResult();

            Assertions.assertThat(executionResult).containsEntry("output1", "test1");
        }
    }

**JUnit 4 测试**

    @RunWith(SpringJUnit4ClassRunner.class)
    @ContextConfiguration("classpath:org/flowable/spring/test/junit4/springTypicalUsageTest-context.xml")
    public class SpringJunit4Test {

        @Autowired
        private DmnEngine dmnEngine;

        @Autowired
        private DmnRuleService ruleService;

        @Autowired
        @Rule
        public FlowableDmnRule flowableSpringRule;

        @Test
        @DmnDeploymentAnnotation
        public void simpleDecisionTest() {
            Map<String, Object> executionResult = ruleService.createExecuteDecisionBuilder()
                    .decisionKey("extensionUsage")
                    .variable("inputVariable1", 2)
                    .variable("inputVariable2", "test2")
                    .executeWithSingleResult();

            Assertions.assertThat(executionResult).containsEntry("output1", "test1");
        }
    }

注意，要使其正常工作，你需要在 Spring 配置中定义一个 *org.flowable.dmn.engine.test.FlowableDmnRule* bean（在上面的示例中通过自动装配注入）。

    <bean id="flowableDmnRule" class="org.flowable.dmn.engine.test.FlowableDmnRule">
        <property name="dmnEngine" ref="dmnEngine"/>
    </bean>