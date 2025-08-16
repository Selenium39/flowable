---
id: ch04-Spring
title: Spring 集成
description: 本文介绍Flowable CMMN与Spring框架的集成方法，包括CmmnEngineFactoryBean配置、SpringCmmnEngineConfiguration使用以及Spring事务管理的最佳实践。
keywords: Flowable,CMMN,Spring集成,SpringCmmnEngineConfiguration,CmmnEngineFactoryBean,事务管理,DataSource配置
---

虽然你完全可以不使用 Spring 来使用 Flowable,但我们提供了一些非常好的集成功能,本章将对此进行说明。

## CmmnEngineFactoryBean

CmmnEngine 可以配置为普通的 Spring bean。集成的起点是 org.flowable.cmmn.spring.CmmnEngineFactoryBean 类。该 bean 接收 CMMN 引擎配置并创建 CMMN 引擎。这意味着 Spring 的属性创建和配置与[配置部分](cmmn/ch02-Configuration.md#creating-a-cmmnengine)中记录的相同。对于 Spring 集成,配置和引擎 bean 如下所示:

    <bean id="cmmnEngineConfiguration" class="org.flowable.cmmn.spring.SpringCmmnEngineConfiguration">
        ...
    </bean>

    <bean id="cmmnEngine" class="org.flowable.cmmn.spring.CmmnEngineFactoryBean">
      <property name="cmmnEngineConfiguration" ref="cmmnEngineConfiguration" />
    </bean>

注意,cmmnEngineConfiguration bean 现在使用 org.flowable.cmmn.spring.SpringCmmnEngineConfiguration 类。

## 默认 Spring 配置

下面显示的部分包含 dataSource、transactionManager、cmmnEngine 和 Flowable 引擎服务。

当将 DataSource 传递给 SpringCmmnEngineConfiguration(使用属性"dataSource")时,Flowable 在内部使用 org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy,它包装传递的 DataSource。这样做是为了确保从 DataSource 检索的 SQL 连接和 Spring 事务能够很好地配合。这意味着在 Spring 配置中不再需要自己代理 dataSource,尽管仍然可以将 TransactionAwareDataSourceProxy 传递给 SpringCmmnEngineConfiguration。在这种情况下,不会发生额外的包装。

**确保在 Spring 配置中声明 TransactionAwareDataSourceProxy 时,不要将其用于已经感知 Spring 事务的资源(例如,DataSourceTransactionManager 需要未代理的 dataSource)。**

    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:context="http://www.springframework.org/schema/context"
           xmlns:tx="http://www.springframework.org/schema/tx"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans
                                 http://www.springframework.org/schema/beans/spring-beans.xsd
                               http://www.springframework.org/schema/context
                                 http://www.springframework.org/schema/context/spring-context-2.5.xsd
                               http://www.springframework.org/schema/tx
                                 http://www.springframework.org/schema/tx/spring-tx-3.0.xsd">

      <bean id="dataSource" class="org.springframework.jdbc.datasource.SimpleDriverDataSource">
        <property name="driverClass" value="org.h2.Driver" />
        <property name="url" value="jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000" />
        <property name="username" value="sa" />
        <property name="password" value="" />
      </bean>

      <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource" />
      </bean>

      <bean id="cmmnEngineConfiguration" class="org.flowable.cmmn.spring.SpringCmmnEngineConfiguration">
        <property name="dataSource" ref="dataSource" />
        <property name="transactionManager" ref="transactionManager" />
        <property name="databaseSchemaUpdate" value="true" />
      </bean>

      <bean id="cmmnEngine" class="org.flowable.cmmn.spring.CmmnEngineFactoryBean">
        <property name="cmmnEngineConfiguration" ref="cmmnEngineConfiguration" />
      </bean>

      <bean id="cmmnRepositoryService" factory-bean="cmmnEngine" factory-method="getCmmnRepositoryService" />
      <bean id="cmmnRuntimeService" factory-bean="cmmnEngine" factory-method="getCmmnRuntimeService" />
      <bean id="cmmnTaskService" factory-bean="cmmnEngine" factory-method="getCmmnTaskService" />
      <bean id="cmmnHistoryService" factory-bean="cmmnEngine" factory-method="getCmmnHistoryService" />
      <bean id="cmmnManagementService" factory-bean="cmmnEngine" factory-method="getCmmnManagementService" />

    ...

首先,使用 Spring 支持的任何方式创建应用程序上下文。在此示例中,你可以使用类路径 XML 资源来配置 Spring 应用程序上下文:

    ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext(
        "org/flowable/cmmn/examples/spring/SpringIntegrationTest-context.xml");

或者,作为测试:

    @ContextConfiguration(
      "classpath:org/flowable/cmmn/spring/test/SpringIntegrationTest-context.xml")

## 表达式

在使用 CmmnEngineFactoryBean 时,默认情况下,CMMN 流程中的所有表达式也会"看到"所有 Spring bean。可以使用可配置的映射来限制要在表达式中公开的 bean(甚至没有)。下面的示例公开了一个单独的 bean(printer),可以在键"printer"下使用。**要完全不公开任何 bean,只需将空列表作为 SpringCmmnEngineConfiguration 的'beans'属性传递即可。当未设置'beans'属性时,上下文中的所有 Spring bean 都将可用。**

    <bean id="cmmnEngineConfiguration" class="org.flowable.cmmn.spring.SpringCmmnEngineConfiguration">
      ...
      <property name="beans">
        <map>
          <entry key="printer" value-ref="printer" />
        </map>
      </property>
    </bean>

    <bean id="printer" class="org.flowable.cmmn.examples.spring.Printer" />

现在可以在表达式中使用公开的 bean:

    ...
        <case id="myCase">
            <casePlanModel id="myPlanModel" name="My CasePlanModel">

                <planItem id="planItem1" name="Task One" definitionRef="serviceTask" />
                <planItem id="planItem2" name="The Case" definitionRef="task">
                    <entryCriterion sentryRef="sentry1" />
                </planItem>

                <sentry id="sentry1">
                    <planItemOnPart sourceRef="planItem1">
                        <standardEvent>complete</standardEvent>
                    </planItemOnPart>
                </sentry>

                <task id="serviceTask" flowable:type="java" flowable:expression="${printer.printMessage(var1)}" flowable:resultVariableName="customResponse" />
                <task id="task" name="The Task" isBlocking="true" />

            </casePlanModel>
        </case>

其中 Printer 如下所示:

    public class Printer {

      public void printMessage(String var) {
        System.out.println("hello " + var);
      }
    }

Spring bean 配置(如上所示)如下所示:

    <beans>
      ...

      <bean id="printer" class="org.flowable.cmmn.examples.spring.Printer" />

    </beans>

## 自动资源部署

Spring 集成还有一个用于部署资源的特殊功能。在 CMMN 引擎配置中,你可以指定一组资源。当创建 CMMN 引擎时,将扫描并部署所有这些资源。有过滤机制可防止重复部署。只有当资源实际发生更改时,才会将新部署部署到 Flowable 数据库。这在许多用例中都很有意义,例如在 Spring 容器频繁重启的情况下(例如测试)。

这里有一个示例:

    <bean id="cmmnEngineConfiguration" class="org.flowable.cmmn.spring.SpringCmmnEngineConfiguration">
      ...
      <property name="deploymentResources"
        value="classpath*:/org/flowable/cmmn/spring/test/autodeployment/autodeploy.*.cmmn" />
    </bean>

    <bean id="cmmnEngine" class="org.flowable.cmmn.spring.CmmnEngineFactoryBean">
      <property name="cmmnEngineConfiguration" ref="cmmnEngineConfiguration" />
    </bean>

默认情况下,上述配置会将所有匹配过滤器的资源分组到 Flowable 引擎的单个部署中。防止重新部署未更改资源的重复过滤适用于整个部署。在某些情况下,这可能不是你想要的。例如,如果你以这种方式部署一组流程资源,而这些资源中只有一个案例定义发生了更改,则整个部署将被视为新部署,该部署中的所有案例定义都将被重新部署,从而导致每个案例定义都有新版本,即使实际上只有一个发生了更改。

为了能够自定义确定部署的方式,你可以在 SpringCmmnEngineConfiguration 中指定一个额外的属性 deploymentMode。此属性定义了如何从匹配过滤器的资源集确定部署。此属性默认支持 3 个值:

- default: 将所有资源分组到单个部署中,并对该部署应用重复过滤。这是默认值,如果你不指定值,将使用此值。

- single-resource: 为每个单独的资源创建单独的部署,并对该部署应用重复过滤。如果你希望每个流程定义单独部署,并且仅在发生更改时才创建新的案例定义版本,则使用此值。

- resource-parent-folder: 为共享相同父文件夹的资源创建单独的部署,并对该部署应用重复过滤。此值可用于为大多数资源创建单独的部署,但仍然可以通过将它们放在共享文件夹中来对某些资源进行分组。以下是如何为 deploymentMode 指定 single-resource 配置的示例:

<!-- -->

    <bean id="cmmnEngineConfiguration"
        class="org.flowable.cmmn.spring.SpringCmmnEngineConfiguration">
      ...
      <property name="deploymentResources" value="classpath*:/flowable/*.cmmn" />
      <property name="deploymentMode" value="single-resource" />
    </bean>

除了使用上面列出的 deploymentMode 值外,你可能还需要自定义确定部署的行为。如果是这样,你可以创建 SpringCmmnEngineConfiguration 的子类并重写 getAutoDeploymentStrategy(String deploymentMode) 方法。此方法确定对于 deploymentMode 配置的特定值使用哪种部署策略。

## 单元测试

在与 Spring 集成时,可以使用标准的 [Flowable 测试工具](cmmn/ch03-API.md#unit-testing)非常轻松地测试业务案例。
以下示例展示了如何在典型的基于 Spring 的 JUnit 4 和 5 测试中测试案例定义:

**JUnit 5 测试**

    @ExtendWith(FlowableCmmnSpringExtension.class)
    @ExtendWith(SpringExtension.class)
    @ContextConfiguration(classes = CmmnSpringJunitJupiterTest.TestConfiguration.class)
    class MyBusinessCaseTest {

      @Autowired
      private CmmnRepositoryService cmmnRepositoryService;

      @Autowired
      private CmmnRuntimeService cmmnRuntimeService;

      @Test
      @CmmnDeployment
      public void simpleCaseTest() {
        CaseInstance caseInstance = cmmnRuntimeService.createCaseInstanceBuilder()
                .caseDefinitionKey("simpleCase")
                .variable("var1", "John Doe")
                .start();

        Assertions.assertNotNull(caseInstance);
      }
    }

**JUnit 4 测试**

    public class MyBusinessCaseTest {

      @Rule
      public FlowableCmmnRule cmmnRule = new FlowableCmmnRule("org/flowable/spring/test/el/SpringBeanTest-context.xml");

      @Test
      public void simpleCaseTest() {
        cmmnRule.getCmmnRepositoryService().createDeployment().addClasspathResource("org/flowable/spring/test/el/springExpression.cmmn").deploy();
        CmmnRuntimeService cmmnRuntimeService = cmmnRule.getCmmnRuntimeService();
        CaseInstance caseInstance = cmmnRuntimeService.createCaseInstanceBuilder()
                .caseDefinitionKey("myCase")
                .variable("var1", "John Doe")
                .start();

        Assert.assertNotNull(caseInstance);
      }
    }