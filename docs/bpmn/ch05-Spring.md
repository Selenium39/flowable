---
id: ch05-Spring
title: Spring 集成
description: 本文介绍Flowable与Spring框架的深度集成方法，包括ProcessEngineFactoryBean配置、事务管理以及DataSource整合，帮助开发者实现高效的业务流程管理。
keywords: Flowable,Spring集成,BPMN,流程引擎,事务管理,DataSource配置,ProcessEngineFactoryBean
---

虽然你完全可以不使用 Spring 来使用 Flowable,但我们提供了一些非常好的集成特性,这些特性将在本章中进行说明。

## ProcessEngineFactoryBean

ProcessEngine 可以配置为一个普通的 Spring bean。集成的起点是 org.flowable.spring.ProcessEngineFactoryBean 类。该 bean 接收一个流程引擎配置并创建流程引擎。这意味着 Spring 的属性创建和配置与[配置章节](bpmn/ch03-Configuration.md#creating-a-processengine)中记录的相同。对于 Spring 集成,配置和引擎 bean 将如下所示:

    <bean id="processEngineConfiguration" class="org.flowable.spring.SpringProcessEngineConfiguration">
        ...
    </bean>

    <bean id="processEngine" class="org.flowable.spring.ProcessEngineFactoryBean">
      <property name="processEngineConfiguration" ref="processEngineConfiguration" />
    </bean>

注意,processEngineConfiguration bean 现在使用 org.flowable.spring.SpringProcessEngineConfiguration 类。

## 事务

我们将逐步解释在发行版 Spring 示例中找到的 SpringTransactionIntegrationTest。下面是我们在此示例中使用的 Spring 配置文件(你可以在 SpringTransactionIntegrationTest-context.xml 中找到它)。下面显示的部分包含 dataSource、transactionManager、processEngine 和 Flowable 引擎服务。

当将 DataSource 传递给 SpringProcessEngineConfiguration (使用属性 "dataSource") 时,Flowable 在内部使用 org.springframework.jdbc.datasource.TransactionAwareDataSourceProxy 来包装传递的 DataSource。这样做是为了确保从 DataSource 检索的 SQL 连接和 Spring 事务能够很好地协同工作。这意味着不再需要在 Spring 配置中自己代理 dataSource,尽管仍然可以将 TransactionAwareDataSourceProxy 传递到 SpringProcessEngineConfiguration 中。在这种情况下,不会发生额外的包装。

**当在 Spring 配置中自己声明 TransactionAwareDataSourceProxy 时,请确保不要将其用于已经感知 Spring 事务的资源(例如,DataSourceTransactionManager 和 JPATransactionManager 需要未代理的 dataSource)。**

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

      <bean id="processEngineConfiguration" class="org.flowable.spring.SpringProcessEngineConfiguration">
        <property name="dataSource" ref="dataSource" />
        <property name="transactionManager" ref="transactionManager" />
        <property name="databaseSchemaUpdate" value="true" />
        <property name="asyncExecutorActivate" value="false" />
      </bean>

      <bean id="processEngine" class="org.flowable.spring.ProcessEngineFactoryBean">
        <property name="processEngineConfiguration" ref="processEngineConfiguration" />
      </bean>

      <bean id="repositoryService" factory-bean="processEngine" factory-method="getRepositoryService" />
      <bean id="runtimeService" factory-bean="processEngine" factory-method="getRuntimeService" />
      <bean id="taskService" factory-bean="processEngine" factory-method="getTaskService" />
      <bean id="historyService" factory-bean="processEngine" factory-method="getHistoryService" />
      <bean id="managementService" factory-bean="processEngine" factory-method="getManagementService" />

    ...

Spring 配置文件的其余部分包含我们将在此特定示例中使用的 bean 和配置:

    <beans>
      ...
      <tx:annotation-driven transaction-manager="transactionManager"/>

      <bean id="userBean" class="org.flowable.spring.test.UserBean">
        <property name="runtimeService" ref="runtimeService" />
      </bean>

      <bean id="printer" class="org.flowable.spring.test.Printer" />

    </beans>

首先,使用 Spring 支持的任何方式创建应用程序上下文。在此示例中,你可以使用类路径 XML 资源来配置 Spring 应用程序上下文:

    ClassPathXmlApplicationContext applicationContext = new ClassPathXmlApplicationContext(
        "org/flowable/examples/spring/SpringTransactionIntegrationTest-context.xml");

或者,因为这是一个测试:

    @ContextConfiguration(
      "classpath:org/flowable/spring/test/transaction/SpringTransactionIntegrationTest-context.xml")

然后我们可以获取服务 bean 并在其上调用方法。ProcessEngineFactoryBean 将向服务添加一个额外的拦截器,该拦截器在 Flowable 服务方法上应用 Propagation.REQUIRED 事务语义。因此,例如,我们可以使用 repositoryService 来部署流程,如下所示:

    RepositoryService repositoryService =
      (RepositoryService) applicationContext.getBean("repositoryService");
    String deploymentId = repositoryService
      .createDeployment()
      .addClasspathResource("org/flowable/spring/test/hello.bpmn20.xml")
      .deploy()
      .getId();

反过来也可以。在这种情况下,Spring 事务将围绕 userBean.hello() 方法,而 Flowable 服务方法调用将加入同一事务。

    UserBean userBean = (UserBean) applicationContext.getBean("userBean");
    userBean.hello();

UserBean 如下所示。请记住,从上面的 Spring bean 配置中,我们将 repositoryService 注入到 userBean 中。

    public class UserBean {

      /** injected by Spring */
      private RuntimeService runtimeService;

      @Transactional
      public void hello() {
        // here you can do transactional stuff in your domain model
        // and it will be combined in the same transaction as
        // the startProcessInstanceByKey to the Flowable RuntimeService
        runtimeService.startProcessInstanceByKey("helloProcess");
      }

      public void setRuntimeService(RuntimeService runtimeService) {
        this.runtimeService = runtimeService;
      }
    }

## 表达式

当使用 ProcessEngineFactoryBean 时,BPMN 流程中的所有[表达式](bpmn/ch04-API.md#expressions)默认也会"看到"所有 Spring bean。可以使用可配置的映射来限制要在表达式中公开的 bean(甚至没有)。下面的示例公开了一个单独的 bean(printer),可以在键"printer"下使用。**要完全不公开任何 bean,只需将空列表作为 SpringProcessEngineConfiguration 上的"beans"属性传递。当未设置"beans"属性时,上下文中的所有 Spring bean 都将可用。**

    <bean id="processEngineConfiguration" class="org.flowable.spring.SpringProcessEngineConfiguration">
      ...
      <property name="beans">
        <map>
          <entry key="printer" value-ref="printer" />
        </map>
      </property>
    </bean>

    <bean id="printer" class="org.flowable.examples.spring.Printer" />

现在可以在表达式中使用公开的 bean:例如,SpringTransactionIntegrationTest hello.bpmn20.xml 显示了如何使用 UEL 方法表达式调用 Spring bean 上的方法:

    <definitions id="definitions">

      <process id="helloProcess">

        <startEvent id="start" />
        <sequenceFlow id="flow1" sourceRef="start" targetRef="print" />

        <serviceTask id="print" flowable:expression="#{printer.printMessage()}" />
        <sequenceFlow id="flow2" sourceRef="print" targetRef="end" />

        <endEvent id="end" />

      </process>

    </definitions>

其中 Printer 如下所示:

    public class Printer {

      public void printMessage() {
        System.out.println("hello world");
      }
    }

Spring bean 配置(如上所示)如下所示:

    <beans>
      ...

      <bean id="printer" class="org.flowable.examples.spring.Printer" />

    </beans>

## 自动资源部署

Spring 集成还具有用于部署资源的特殊功能。在流程引擎配置中,你可以指定一组资源。创建流程引擎时,将扫描并部署所有这些资源。有过滤机制可防止重复部署。只有当资源实际发生更改时,才会将新部署部署到 Flowable DB。这在许多用例中都有意义,其中 Spring 容器经常重新启动(例如,测试)。

这是一个例子:

    <bean id="processEngineConfiguration" class="org.flowable.spring.SpringProcessEngineConfiguration">
      ...
      <property name="deploymentResources"
        value="classpath*:/org/flowable/spring/test/autodeployment/autodeploy.*.bpmn20.xml" />
    </bean>

    <bean id="processEngine" class="org.flowable.spring.ProcessEngineFactoryBean">
      <property name="processEngineConfiguration" ref="processEngineConfiguration" />
    </bean>

默认情况下,上述配置会将所有与过滤器匹配的资源分组到 Flowable 引擎的单个部署中。重复过滤以防止重新部署未更改的资源适用于整个部署。在某些情况下,这可能不是你想要的。例如,如果你以这种方式部署一组流程资源,并且这些资源中只有一个流程定义发生了更改,则整个部署将被视为新部署,并且该部署中的所有流程定义都将被重新部署,从而导致每个流程定义的新版本,即使只有一个实际更改。

为了能够自定义确定部署的方式,你可以在 SpringProcessEngineConfiguration 中指定一个附加属性 deploymentMode。此属性定义将如何从与过滤器匹配的资源集确定部署。此属性默认支持 3 个值:

- default: 将所有资源分组到单个部署中,并对该部署应用重复过滤。这是默认值,如果不指定值,将使用它。

- single-resource: 为每个单独的资源创建一个单独的部署,并对该部署应用重复过滤。如果你希望每个流程定义单独部署,并且仅在发生更改时创建新的流程定义版本,则可以使用此值。

- resource-parent-folder: 为共享相同父文件夹的资源创建单独的部署,并对该部署应用重复过滤。此值可用于为大多数资源创建单独的部署,但仍然可以通过将它们放在共享文件夹中来对某些资源进行分组。以下是如何为 deploymentMode 指定 single-resource 配置的示例:

<!-- -->

    <bean id="processEngineConfiguration"
        class="org.flowable.spring.SpringProcessEngineConfiguration">
      ...
      <property name="deploymentResources" value="classpath*:/flowable/*.bpmn" />
      <property name="deploymentMode" value="single-resource" />
    </bean>

除了使用上面列出的 deploymentMode 值之外,你可能还需要自定义确定部署的行为。如果是这样,你可以创建 SpringProcessEngineConfiguration 的子类并覆盖 getAutoDeploymentStrategy(String deploymentMode) 方法。此方法确定对 deploymentMode 配置的某个值使用哪种部署策略。

## 单元测试

在与 Spring 集成时,可以使用标准的 [Flowable 测试工具](bpmn/ch04-API.md#unit-testing)非常轻松地测试业务流程。
以下示例显示了如何在典型的基于 Spring 的 JUnit 4 和 5 测试中测试业务流程:

**JUnit 5 测试。**

    @ExtendWith(FlowableSpringExtension.class)
    @ExtendWith(SpringExtension.class)
    @ContextConfiguration(classes = SpringJunitJupiterTest.TestConfiguration.class)
    public class MyBusinessProcessTest {

      @Autowired
      private RuntimeService runtimeService;

      @Autowired
      private TaskService taskService;

      @Test
      @Deployment
      void simpleProcessTest() {
        runtimeService.startProcessInstanceByKey("simpleProcess");
        Task task = taskService.createTaskQuery().singleResult();
        assertEquals("My Task", task.getName());

        taskService.complete(task.getId());
        assertEquals(0, runtimeService.createProcessInstanceQuery().count());

      }
    }

使用 FlowableSpringExtension 允许使用 Deployment 注解。

**JUnit 4 测试。**

    @RunWith(SpringJUnit4ClassRunner.class)
    @ContextConfiguration("classpath:org/flowable/spring/test/junit4/springTypicalUsageTest-context.xml")
    public class MyBusinessProcessTest {

      @Autowired
      private RuntimeService runtimeService;

      @Autowired
      private TaskService taskService;

      @Autowired
      @Rule
      public FlowableRule flowableSpringRule;

      @Test
      @Deployment
      public void simpleProcessTest() {
        runtimeService.startProcessInstanceByKey("simpleProcess");
        Task task = taskService.createTaskQuery().singleResult();
        assertEquals("My Task", task.getName());

        taskService.complete(task.getId());
        assertEquals(0, runtimeService.createProcessInstanceQuery().count());

      }
    }

注意,要使其正常工作,你需要在 Spring 配置中定义一个 *org.flowable.engine.test.Flowable* bean(在上面的示例中通过自动装配注入)。

    <bean id="flowableRule" class="org.flowable.engine.test.Flowable">
      <property name="processEngine" ref="processEngine" />
    </bean>

## 使用 Hibernate 4.2.x 的 JPA

当在 Flowable 引擎中的服务任务或监听器逻辑中使用 Hibernate 4.2.x JPA 时,需要添加对 Spring ORM 的额外依赖。对于 Hibernate 4.1.x 或更早版本,则不需要这个依赖。应添加以下依赖:

    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-orm</artifactId>
      <version>${org.springframework.version}</version>
    </dependency>