---
id: ch09-JPA
title: JPA
description: 本文档详细介绍如何在Flowable BPMN中使用JPA实体作为流程变量，包括配置要求、实体条件及示例代码，帮助开发者高效集成JPA与业务流程管理。
keywords: Flowable,BPMN,JPA实体,流程变量,业务流程管理,EntityManagerFactory,持久化单元,JPA配置
---

你可以使用 JPA 实体作为流程变量，这允许你：

-   基于可以在用户任务表单中填写或在服务任务中生成的流程变量来更新现有的 JPA 实体。

-   重用现有的领域模型，无需编写显式的服务来获取实体和更新值。

-   基于现有实体的属性做出决策（网关）。

-   ...

## 要求

仅支持符合以下条件的实体：

-   实体应使用 JPA 注解进行配置，我们同时支持字段访问和属性访问。也可以使用映射的父类。

-   实体必须有一个使用 @Id 注解的主键，不支持复合主键（@EmbeddedId 和 @IdClass）。Id 字段/属性可以是 JPA 规范支持的任何类型：原始类型及其包装器（不包括 boolean）、String、BigInteger、BigDecimal、java.util.Date 和 java.sql.Date。

## 配置

要使用 JPA 实体，引擎必须有一个 EntityManagerFactory 的引用。这可以通过配置引用或提供持久化单元名称来实现。作为变量使用的 JPA 实体将被自动检测并相应处理。

以下示例配置使用了 jpaPersistenceUnitName：

    <bean id="processEngineConfiguration"
      class="org.flowable.engine.impl.cfg.StandaloneInMemProcessEngineConfiguration">

    <!-- Database configurations -->
    <property name="databaseSchemaUpdate" value="true" />
    <property name="jdbcUrl" value="jdbc:h2:mem:JpaVariableTest;DB_CLOSE_DELAY=1000" />

    <property name="jpaPersistenceUnitName" value="flowable-jpa-pu" />
    <property name="jpaHandleTransaction" value="true" />
    <property name="jpaCloseEntityManager" value="true" />

    <!-- job executor configurations -->
    <property name="asyncExecutorActivate" value="false" />

    <!-- mail server configurations -->
    <property name="mailServerPort" value="5025" />
    </bean>

下面的示例配置提供了一个我们自己定义的 EntityManagerFactory（在本例中是一个 open-jpa 实体管理器）。请注意，代码片段仅包含与示例相关的 bean，其他内容已省略。完整的使用 open-jpa 实体管理器的工作示例可以在 flowable-spring-examples 中找到（/flowable-spring/src/test/java/org/flowable/spring/test/jpa/JPASpringTest.java）。

    <bean id="entityManagerFactory" class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean">
      <property name="persistenceUnitManager" ref="pum"/>
      <property name="jpaVendorAdapter">
        <bean class="org.springframework.orm.jpa.vendor.OpenJpaVendorAdapter">
          <property name="databasePlatform" value="org.apache.openjpa.jdbc.sql.H2Dictionary" />
        </bean>
      </property>
    </bean>

    <bean id="processEngineConfiguration" class="org.flowable.spring.SpringProcessEngineConfiguration">
      <property name="dataSource" ref="dataSource" />
      <property name="transactionManager" ref="transactionManager" />
      <property name="databaseSchemaUpdate" value="true" />
      <property name="jpaEntityManagerFactory" ref="entityManagerFactory" />
      <property name="jpaHandleTransaction" value="true" />
      <property name="jpaCloseEntityManager" value="true" />
      <property name="asyncExecutorActivate" value="false" />
    </bean>

在以编程方式构建引擎时也可以进行相同的配置，例如：

    ProcessEngine processEngine = ProcessEngineConfiguration
        .createProcessEngineConfigurationFromResourceDefault()
        .setJpaPersistenceUnitName("flowable-pu")
        .buildProcessEngine();

配置属性：

-   jpaPersistenceUnitName：要使用的持久化单元的名称。（确保持久化单元在类路径上可用。根据规范，默认位置是 /META-INF/persistence.xml）。使用 jpaEntityManagerFactory 或 jpaPersistenceUnitName 其中之一。

-   jpaEntityManagerFactory：对实现 jakarta.persistence.EntityManagerFactory 的 bean 的引用，该 bean 将用于加载实体和刷新更新。使用 *jpaEntityManagerFactory* 或 *jpaPersistenceUnitName* 其中之一。

-   jpaHandleTransaction：指示引擎是否应该在使用的 *EntityManager* 实例上开始和提交/回滚事务的标志。当使用 *Java Transaction API (JTA)* 时设置为 false。

-   jpaCloseEntityManager：指示引擎是否应该关闭从 EntityManagerFactory 获取的 EntityManager 实例的标志。当 *EntityManager* 是容器管理的时候设置为 false（例如，当使用不限于单个事务的扩展持久化上下文时）。

## 使用

### 简单示例

在 Flowable 源代码中的 JPAVariableTest 中可以找到使用 JPA 变量的示例。我们将逐步解释 JPAVariableTest.testUpdateJPAEntityValues。

首先，我们为持久化单元创建一个 *EntityManagerFactory*，它基于 META-INF/persistence.xml。这包含了应该包含在持久化单元中的类和一些特定于供应商的配置。

我们在测试中使用了一个简单的实体，它有一个 id 和 String 类型的 value 属性，这些也会被持久化。在运行测试之前，我们创建一个实体并保存它。

    @Entity(name = "JPA_ENTITY_FIELD")
    public class FieldAccessJPAEntity {

      @Id
      @Column(name = "ID_")
      private Long id;

      private String value;

      public FieldAccessJPAEntity() {
        // JPA 需要空构造函数
      }

      public Long getId() {
        return id;
      }

      public void setId(Long id) {
        this.id = id;
      }

      public String getValue() {
        return value;
      }

      public void setValue(String value) {
        this.value = value;
      }
    }

我们启动一个新的流程实例，将实体作为变量添加进去。与其他变量一样，它们存储在引擎的持久化存储中。当下次请求变量时，它将根据存储的类和 Id 从 EntityManager 中加载。

    Map<String, Object> variables = new HashMap<String, Object>();
    variables.put("entityToUpdate", entityToUpdate);

    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
        "UpdateJPAValuesProcess", variables);

在我们的流程定义中的第一个节点包含一个服务任务，它将调用 entityToUpdate 上的 setValue 方法，该方法解析为我们在启动流程实例时设置的 JPA 变量，并将从与当前引擎上下文关联的 EntityManager 中加载。

    <serviceTask id='theTask' name='updateJPAEntityTask'
      flowable:expression="${entityToUpdate.setValue('updatedValue')}" />

当服务任务完成后，流程实例会在流程定义中定义的用户任务中等待，这允许我们检查流程实例。此时，EntityManager 已经被刷新，对实体的更改已经被推送到数据库。当我们获取变量 entityToUpdate 的值时，它会被重新加载，我们得到的实体的 value 属性被设置为 updatedValue。

    // 流程 'UpdateJPAValuesProcess' 中的服务任务应该已经在 entityToUpdate 上设置了值
    Object updatedEntity = runtimeService.getVariable(processInstance.getId(), "entityToUpdate");
    assertTrue(updatedEntity instanceof FieldAccessJPAEntity);
    assertEquals("updatedValue", ((FieldAccessJPAEntity)updatedEntity).getValue());

### 查询 JPA 流程变量

你可以查询具有特定 JPA 实体作为变量值的流程实例和执行实例。**注意，对于 ProcessInstanceQuery 和 ExecutionQuery 中的 JPA 实体，仅支持 variableValueEquals(name, entity)**。当传入 JPA 实体作为值时，不支持 variableValueNotEquals、variableValueGreaterThan、variableValueGreaterThanOrEqual、variableValueLessThan 和 variableValueLessThanOrEqual 方法，这些方法会抛出 FlowableException。

     ProcessInstance result = runtimeService.createProcessInstanceQuery()
        .variableValueEquals("entityToQuery", entityToQuery).singleResult();

### 使用 Spring beans 和 JPA 的高级示例

一个更高级的示例 JPASpringTest 可以在 flowable-spring-examples 中找到。它描述了以下简单的用例：

-   已经存在一个使用 JPA 实体的 Spring bean，它允许存储贷款请求。

-   使用 Flowable，我们可以使用通过现有 bean 获得的实体，并在流程中将它们用作变量。流程定义了以下步骤：

    -   使用现有的 LoanRequestBean 创建新的 LoanRequest 的服务任务，该任务使用启动流程时接收的变量（例如可能来自启动表单）。创建的实体使用 flowable:resultVariable 存储为变量，它将表达式的结果存储为变量。

    -   允许管理员审查请求并批准/拒绝的用户任务，结果存储为布尔变量 approvedByManager。

    -   更新贷款请求实体以使实体与流程同步的服务任务。

    -   根据实体属性 approved 的值，使用排他网关来决定下一步采取的路径：当请求被批准时，流程结束；否则，将出现一个额外的任务（发送拒绝信），以便可以手动通知客户拒绝信。

请注意，由于该流程仅用于单元测试，因此不包含任何表单。

![jpa.spring.example.process](assets/bpmn/jpa.spring.example.process.png)

    <?xml version="1.0" encoding="UTF-8"?>
    <definitions id="taskAssigneeExample"
      xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:flowable="http://flowable.org/bpmn"
      targetNamespace="org.flowable.examples">

      <process id="LoanRequestProcess" name="Process creating and handling loan request">
        <startEvent id='theStart' />
        <sequenceFlow id='flow1' sourceRef='theStart' targetRef='createLoanRequest' />

        <serviceTask id='createLoanRequest' name='Create loan request'
          flowable:expression="${loanRequestBean.newLoanRequest(customerName, amount)}"
          flowable:resultVariable="loanRequest"/>
        <sequenceFlow id='flow2' sourceRef='createLoanRequest' targetRef='approveTask' />

        <userTask id="approveTask" name="Approve request" />
        <sequenceFlow id='flow3' sourceRef='approveTask' targetRef='approveOrDissaprove' />

        <serviceTask id='approveOrDissaprove' name='Store decision'
          flowable:expression="${loanRequest.setApproved(approvedByManager)}" />
        <sequenceFlow id='flow4' sourceRef='approveOrDissaprove' targetRef='exclusiveGw' />

        <exclusiveGateway id="exclusiveGw" name="Exclusive Gateway approval" />
        <sequenceFlow id="endFlow1" sourceRef="exclusiveGw" targetRef="theEnd">
          <conditionExpression xsi:type="tFormalExpression">${loanRequest.approved}</conditionExpression>
        </sequenceFlow>
        <sequenceFlow id="endFlow2" sourceRef="exclusiveGw" targetRef="sendRejectionLetter">
          <conditionExpression xsi:type="tFormalExpression">${!loanRequest.approved}</conditionExpression>
        </sequenceFlow>

        <userTask id="sendRejectionLetter" name="Send rejection letter" />
        <sequenceFlow id='flow5' sourceRef='sendRejectionLetter' targetRef='theOtherEnd' />

        <endEvent id='theEnd' />
        <endEvent id='theOtherEnd' />
      </process>

    </definitions>

虽然上面的示例相当简单，但它展示了将 JPA 与 Spring 和参数化方法表达式结合使用的强大功能。该流程完全不需要自定义 Java 代码（当然除了 Spring bean），并且大大加快了开发速度。
