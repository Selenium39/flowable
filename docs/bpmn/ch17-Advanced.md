---
id: ch17-Advanced
title: 高级特性
description: 本文档详细介绍Flowable BPMN引擎的高级特性，重点解析异步执行器的设计原理与配置方法，适合具备Flowable专业知识的开发者深入理解作业调度与执行机制。
keywords: Flowable,BPMN,异步执行器,作业调度,定时器,流程引擎,高级配置,性能优化
---

以下章节涵盖了 Flowable 的高级用例,这些用例超出了典型的 BPMN 2.0 流程执行范围。因此,建议需要具备一定的 Flowable 专业知识和经验才能理解这里描述的主题。

## 异步执行器

### 异步执行器设计

存在两种类型的作业:定时器(如属于用户任务上的边界事件的定时器)和异步延续(属于带有 *flowable:async="true"* 属性的服务任务)。

**定时器**是最容易解释的:它们以特定的到期日期被持久化在 ACT_RU_TIMER_JOB 表中。异步执行器中有一个线程会定期检查是否有应该触发的新定时器(换句话说,到期日期在当前时间之前)。当这种情况发生时,定时器被移除并创建一个异步作业。

**异步作业**在执行流程实例步骤期间被插入数据库(这意味着,在执行某些 API 调用期间)。如果当前 Flowable 引擎启用了异步执行器,则异步作业实际上已经被*锁定*。这意味着作业条目被插入到 ACT_RU_JOB 表中,并且会设置*锁定所有者*和*锁定过期时间*。在 API 调用成功提交时触发的事务监听器会触发同一引擎的异步执行器来执行该作业(因此数据保证在数据库中)。为此,异步执行器有一个可配置的线程池,其中的线程将执行作业并异步继续处理流程。如果 Flowable 引擎未启用异步执行器,则异步作业会被插入到 ACT_RU_JOB 表中而不被锁定。

类似于检查新定时器的线程,异步执行器有一个线程用于"获取"新的异步作业。这些是表中存在但未被锁定的作业。该线程将为当前 Flowable 引擎锁定这些作业并将其传递给异步执行器。

执行作业的线程池使用内存中的队列来获取作业。当该队列已满时(这是可配置的),作业将被解锁并重新插入其表中。这样,其他异步执行器就可以获取它。

如果在作业执行期间发生异常,异步作业将被转换为具有到期日期的定时器作业。稍后,它将像常规定时器作业一样被获取,并再次成为异步作业,以便很快重试。当作业已重试(可配置的)次数并继续失败时,该作业被认为是"死信"并移至 ACT_RU_DEADLETTER_JOB。"死信"概念在各种其他系统中被广泛使用。管理员现在需要检查失败作业的异常并决定最佳的处理方案。

流程定义和流程实例可以被挂起。与这些定义或实例相关的已挂起作业被放入 ACT_RU_SUSPENDED_JOB 表中,以确保获取作业的查询在其 where 子句中尽可能少的条件。

从上面可以清楚地看出:对于熟悉作业/异步执行器旧实现的人来说,主要目标是使"获取查询"尽可能简单。在过去(V6 之前),所有作业类型/状态使用一个表,这使得 where 条件变得很大,因为它要满足所有用例。现在这个问题已经解决,我们的基准测试已经证明这种新设计提供了更好的性能并且更具可扩展性。

### 异步执行器配置

异步执行器是一个高度可配置的组件。建议始终查看异步执行器的默认设置,并验证它们是否符合您的流程需求。

另外,可以扩展默认实现或用自己的实现替换 *org.flowable.engine.impl.asyncexecutor.AsyncExecutor* 接口。

以下属性可通过 setter 在流程引擎配置中使用:

<table>
<caption>异步执行器配置选项</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>名称</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>asyncExecutorThreadPoolQueueSize</p></td>
<td><p>100</p></td>
<td><p>作业在被获取后、实际由线程池中的线程执行之前放置的队列大小</p></td>
</tr>
<tr class="even">
<td><p>asyncExecutorCorePoolSize</p></td>
<td><p>8</p></td>
<td><p>线程池中用于作业执行的保持活动状态的最小线程数</p></td>
</tr>
<tr class="odd">
<td><p>asyncExecutorMaxPoolSize</p></td>
<td><p>8</p></td>
<td><p>线程池中用于作业执行创建的最大线程数</p></td>
</tr>
<tr class="even">
<td><p>asyncExecutorThreadKeepAliveTime</p></td>
<td><p>5000</p></td>
<td><p>用于作业执行的线程在被销毁之前必须保持活动状态的时间(以毫秒为单位)。设置 > 0 会占用资源,但在有大量作业执行的情况下,可以避免一直创建新线程。如果为 0,线程在用于作业执行后将被销毁。</p></td>
</tr>
<tr class="odd">
<td><p>asyncExecutorNumberOfRetries</p></td>
<td><p>3</p></td>
<td><p>作业在被移至"死信"表之前将重试的次数</p></td>
</tr>
<tr class="even">
<td><p>asyncExecutorMaxTimerJobsPerAcquisition</p></td>
<td><p>1</p></td>
<td><p>在一次查询中获取的定时器作业数量。默认值为 1,因为这降低了乐观锁异常的可能性。较大的值可以获得更好的性能,但不同引擎之间发生乐观锁异常的机会也会变大。</p></td>
</tr>
<tr class="odd">
<td><p>asyncExecutorMaxAsyncJobsDuePerAcquisition</p></td>
<td><p>1</p></td>
<td><p>在一次查询期间获取的异步作业数量。默认值为 1,因为这降低了乐观锁异常的可能性。较大的值可以获得更好的性能,但不同引擎之间发生乐观锁异常的机会也会变大。</p></td>
</tr>
<tr class="even">
<td><p>asyncExecutorDefaultTimerJobAcquireWaitTime</p></td>
<td><p>10000</p></td>
<td><p>定时器获取线程在执行下一次查询之前等待的时间(以毫秒为单位)。当没有找到新的定时器作业或获取的定时器作业少于 <em>asyncExecutorMaxTimerJobsPerAcquisition</em> 中设置的值时会发生这种情况。</p></td>
</tr>
<tr class="odd">
<td><p>asyncExecutorDefaultAsyncJobAcquireWaitTime</p></td>
<td><p>10000</p></td>
<td><p>异步作业获取线程在执行下一次查询之前等待的时间(以毫秒为单位)。当没有找到新的异步作业或获取的异步作业少于 <em>asyncExecutorMaxAsyncJobsDuePerAcquisition</em> 中设置的值时会发生这种情况。</p></td>
</tr>
<tr class="even">
<td><p>asyncExecutorDefaultQueueSizeFullWaitTime</p></td>
<td><p>0</p></td>
<td><p>当内部作业队列已满时,异步作业(包括定时器和异步延续)获取线程在执行下一次查询之前等待的时间(以毫秒为单位)。默认设置为 0(为了向后兼容)。将此属性设置为更高的值可以让异步执行器有希望清理其队列。</p></td>
</tr>
<tr class="odd">
<td><p>asyncExecutorTimerLockTimeInMillis</p></td>
<td><p>5 minutes</p></td>
<td><p>定时器作业被异步执行器获取时锁定的时间(以毫秒为单位)。在此期间,其他异步执行器不会尝试获取和锁定此作业。</p></td>
</tr>
<tr class="even">
<td><p>asyncExecutorAsyncJobLockTimeInMillis</p></td>
<td><p>5 minutes</p></td>
<td><p>异步作业被异步执行器获取时锁定的时间(以毫秒为单位)。在此期间,其他异步执行器不会尝试获取和锁定此作业。</p></td>
</tr>
<tr class="odd">
<td><p>asyncExecutorSecondsToWaitOnShutdown</p></td>
<td><p>60</p></td>
<td><p>当执行器(或流程引擎)请求关闭时,等待用于作业执行的线程池优雅关闭的时间(以秒为单位)。</p></td>
</tr>
<tr class="even">
<td><p>asyncExecutorResetExpiredJobsInterval</p></td>
<td><p>60 seconds</p></td>
<td><p>两次连续检查"过期作业"之间的时间间隔(以毫秒为单位)。过期作业是指已被锁定(某个执行器写入了锁定所有者和时间,但作业从未完成)的作业。在此类检查期间,过期的作业将再次可用,这意味着锁定所有者和锁定时间将被移除。其他执行器现在将能够获取它。如果锁定时间早于当前日期,则作业被视为过期。</p></td>
</tr>
<tr class="odd">
<td><p>asyncExecutorResetExpiredJobsPageSize</p></td>
<td><p>3</p></td>
<td><p>异步执行器的"重置过期"线程一次获取的作业数量。</p></td>
</tr>
</tbody>
</table>

## 介入流程解析

BPMN 2.0 XML 需要被解析为 Flowable 内部模型才能在 Flowable 引擎上执行。这种解析发生在流程部署期间,或当内存中找不到流程时从数据库获取 XML。

对于每个这样的流程,BpmnParser 类会创建一个新的 BpmnParse 实例。这个实例将用作解析期间所有操作的容器。解析本身非常简单:对于每个 BPMN 2.0 元素,引擎中都有一个匹配的 org.flowable.engine.parse.BpmnParseHandler 实例。因此,解析器有一个映射表,基本上将 BPMN 2.0 元素类映射到 BpmnParseHandler 实例。默认情况下,Flowable 有 BpmnParseHandler 实例来处理所有支持的元素,并且还用它来为流程的步骤附加执行监听器以创建历史记录。

可以向 Flowable 引擎添加自定义的 org.flowable.engine.parse.BpmnParseHandler 实例。例如,一个常见的用例是为某些步骤添加执行监听器,这些监听器向某些队列触发事件以进行事件处理。历史记录处理在 Flowable 内部就是以这种方式完成的。要添加这样的自定义处理器,需要调整 Flowable 配置:

    <property name="preBpmnParseHandlers">
      <list>
        <bean class="org.flowable.parsing.MyFirstBpmnParseHandler" />
      </list>
    </property>

    <property name="postBpmnParseHandlers">
      <list>
        <bean class="org.flowable.parsing.MySecondBpmnParseHandler" />
        <bean class="org.flowable.parsing.MyThirdBpmnParseHandler" />
      </list>
    </property>

在 preBpmnParseHandlers 属性中配置的 BpmnParseHandler 实例列表会在任何默认处理器之前添加。同样,postBpmnParseHandlers 会在这些之后添加。如果自定义解析处理器中包含的逻辑对顺序有要求,这一点可能很重要。

org.flowable.engine.parse.BpmnParseHandler 是一个简单的接口:

    public interface BpmnParseHandler {

      Collection<Class>? extends BaseElement>> getHandledTypes();

      void parse(BpmnParse bpmnParse, BaseElement element);

    }

getHandledTypes() 方法返回此解析器处理的所有类型的集合。可能的类型是 BaseElement 的子类,由集合的泛型类型指定。你也可以扩展 AbstractBpmnParseHandler 类并重写 getHandledType() 方法,该方法只返回一个 Class 而不是集合。这个类还包含许多默认解析处理器共享的一些辅助方法。当解析器遇到此方法返回的任何类型时,将调用 BpmnParseHandler 实例。在下面的示例中,每当遇到 BPMN 2.0 XML 中包含的流程时,它将执行 executeParse 方法中的逻辑(这是一个类型转换方法,替换了 BpmnParseHandler 接口上的常规 parse 方法)。

    public class TestBPMNParseHandler extends AbstractBpmnParseHandler<Process> {

      protected Class<? extends BaseElement> getHandledType() {
        return Process.class;
      }

      protected void executeParse(BpmnParse bpmnParse, Process element) {
         ..
      }

    }

**重要提示:** 在编写自定义解析处理器时,不要使用任何用于解析 BPMN 2.0 构造的内部类。这会导致难以发现的错误。实现自定义处理器的安全方法是实现 *BpmnParseHandler* 接口或扩展内部抽象类 *org.flowable.engine.impl.bpmn.parser.handler.AbstractBpmnParseHandler*。

可以(但不常见)替换负责将 BPMN 2.0 元素解析为内部 Flowable 模型的默认 BpmnParseHandler 实例。这可以通过以下代码片段完成:

    <property name="customDefaultBpmnParseHandlers">
      <list>
        ...
      </list>
    </property>

例如,一个简单的示例是强制所有服务任务都是异步的:

    public class CustomUserTaskBpmnParseHandler extends ServiceTaskParseHandler {

      protected void executeParse(BpmnParse bpmnParse, ServiceTask serviceTask) {

        // 执行常规操作
        super.executeParse(bpmnParse, serviceTask);

        // 始终设为异步
        serviceTask.setAsynchronous(true);
      }

    }

## 用于高并发的 UUID ID 生成器

在某些(非常)高并发负载的情况下,由于无法足够快地获取新的 ID 块,默认的 ID 生成器可能会导致异常。每个流程引擎都有一个 ID 生成器。默认的 ID 生成器在数据库中预留一块 ID,这样其他引擎就无法使用同一块中的 ID。在引擎操作期间,当默认 ID 生成器发现 ID 块已用完时,会启动一个新事务来获取新块。在(非常)有限的用例中,当存在真正的高负载时,这可能会导致问题。对于大多数用例,默认的 ID 生成器已经足够了。默认的 org.flowable.engine.impl.db.DbIdGenerator 还有一个 idBlockSize 属性,可以配置预留 ID 块的大小并调整 ID 获取的行为。

默认 ID 生成器的替代方案是 org.flowable.engine.impl.persistence.StrongUuidGenerator,它在本地生成唯一的 [UUID](http://en.wikipedia.org/wiki/Universally_unique_identifier) 并将其用作所有实体的标识符。由于生成 UUID 不需要访问数据库,因此它能更好地应对非常高的并发用例。请注意,根据机器的不同,性能可能与默认 ID 生成器有所不同(可能是正面的也可能是负面的)。

UUID 生成器可以在 Flowable 配置中按如下方式设置:

    <property name="idGenerator">
        <bean class="org.flowable.engine.impl.persistence.StrongUuidGenerator" />
    </property>

使用 UUID ID 生成器需要以下额外依赖:

     <dependency>
        <groupId>com.fasterxml.uuid</groupId>
        <artifactId>java-uuid-generator</artifactId>
        <version>3.1.3</version>
    </dependency>

## 多租户

多租户通常是指软件能够服务于多个不同组织的概念。关键是数据被分区,任何组织都不能看到其他组织的数据。在这种情况下,这样的组织(或部门、团队等)被称为*租户*。

注意,这与多实例设置有根本的不同,在多实例设置中,每个组织都单独运行一个 Flowable 流程引擎实例(并使用不同的数据库架构)。虽然 Flowable 很轻量级,运行一个流程引擎实例不需要太多资源,但它确实增加了复杂性和维护工作。不过,对于某些用例来说,这可能是正确的解决方案。

Flowable 中的多租户主要是通过数据分区来实现的。需要注意的是,*Flowable 不强制执行多租户规则*。这意味着在查询和使用数据时,它不会验证执行操作的用户是否属于正确的租户。这应该在调用 Flowable 引擎的层面上完成。Flowable 确实确保租户信息可以在检索流程数据时被存储和使用。

在部署流程定义到 Flowable 流程引擎时,可以传递一个*租户标识符*。这是一个字符串(例如 UUID、部门 ID 等),限制为 256 个字符,用于唯一标识租户:

    repositoryService.createDeployment()
                .addClassPathResource(...)
                .tenantId("myTenantId")
                .deploy();

在部署期间传递租户 ID 会产生以下影响:

-   部署中包含的所有流程定义都从该部署继承租户标识符。

-   从这些流程定义启动的所有流程实例都从流程定义继承此租户标识符。

-   在执行流程实例时创建的所有任务都从流程实例继承此租户标识符。独立任务也可以有租户标识符。

-   在流程实例执行期间创建的所有执行都从流程实例继承此租户标识符。

-   触发信号抛出事件(在流程本身或通过 API)时可以提供租户标识符。该信号将只在租户上下文中执行:即如果有多个同名的信号捕获事件,只有具有正确租户标识符的事件才会被实际调用。

-   所有作业(定时器和异步延续)都从流程定义(例如定时器启动事件)或流程实例(当在运行时创建作业时,例如异步延续)继承租户标识符。这可能用于在自定义作业执行器中为某些租户提供优先级。

-   所有历史实体(历史流程实例、任务和活动)都从其运行时对应项继承租户标识符。

-   作为附注,模型也可以有租户标识符(模型被 Flowable 建模器用来存储 BPMN 2.0 模型)。

要在流程数据上实际使用租户标识符,所有查询 API 都具有按租户过滤的功能。例如(可以替换为其他实体的相关查询实现):

    runtimeService.createProcessInstanceQuery()
        .processInstanceTenantId("myTenantId")
        .processDefinitionKey("myProcessDefinitionKey")
        .variableValueEquals("myVar", "someValue")
        .list()

查询 API 还允许使用 *like* 语义对租户标识符进行过滤,也可以过滤出没有租户 ID 的实体。

**重要实现细节:** 由于数据库的特性(更具体地说:在唯一约束中处理 null),表示*无租户*的*默认*租户标识符值是**空字符串**。(流程定义键、流程定义版本、租户标识符)的组合必须是唯一的(并且有数据库约束检查这一点)。还要注意,租户标识符不应设置为 null,因为这会影响查询,因为某些数据库(Oracle)将空字符串视为 null 值(这就是为什么查询 *.withoutTenantId* 会检查空字符串或 null)。这意味着同一个流程定义(具有相同的流程定义键)可以为多个租户部署,每个租户都有自己的版本控制。这不会影响不使用租户时的使用。

**请注意,以上所有内容都不会与在集群中运行多个 Flowable 实例相冲突。**

[实验性功能] 可以通过调用 *repositoryService* 上的 *changeDeploymentTenantId(String deploymentId, String newTenantId)* 方法来更改租户标识符。这将更改之前继承的所有位置的租户标识符。当从非多租户设置转换到多租户配置时,这可能很有用。有关更多详细信息,请参阅该方法的 Javadoc。

## 执行自定义 SQL

Flowable API 允许使用高级 API 与数据库交互。例如,对于检索数据,Query API 和 Native Query API 在使用上非常强大。但是,对于某些用例,它们可能不够灵活。以下部分描述了如何在配置的流程引擎内执行完全自定义的 SQL 语句(可以是 select、insert、update 和 delete),从而利用事务设置等功能。

要定义自定义 SQL 语句,Flowable 引擎利用其底层框架 MyBatis 的功能。更多信息可以在 [MyBatis 用户指南](http://mybatis.github.io/mybatis-3/java-api.html) 中阅读。

### 基于注解的映射语句

使用基于注解的映射语句时,首先要做的是创建一个 MyBatis mapper 类。例如,假设某些用例不需要完整的任务数据,而只需要其中的一小部分。可以这样实现一个 Mapper:

    public interface MyTestMapper {

        @Select("SELECT ID_ as id, NAME_ as name, CREATE_TIME_ as createTime FROM ACT_RU_TASK")
        List<Map<String, Object>> selectTasks();

    }

必须在流程引擎配置中提供此 mapper:

    ...
    <property name="customMybatisMappers">
      <set>
        <value>org.flowable.standalone.cfg.MyTestMapper</value>
      </set>
    </property>
    ...

注意这是一个接口。底层的 MyBatis 框架将创建一个可以在运行时使用的实例。还要注意方法的返回值不是类型化的,而是一个映射列表(对应于带有列值的行列表)。如果需要,可以使用 MyBatis mappers 进行类型化。

要执行上述查询,必须使用 *managementService.executeCustomSql* 方法。此方法接受一个 *CustomSqlExecution* 实例。这是一个包装器,隐藏了使其工作所需的引擎内部细节。

不幸的是,Java 泛型使其可读性不如预期。下面的两个泛型类型是 mapper 类和返回类型类。但是,实际逻辑只是调用 mapper 方法并返回其结果(如果适用)。

    CustomSqlExecution<MyTestMapper, List<Map<String, Object>>> customSqlExecution =
              new AbstractCustomSqlExecution<MyTestMapper, List<Map<String, Object>>>(MyTestMapper.class) {

      public List<Map<String, Object>> execute(MyTestMapper customMapper) {
        return customMapper.selectTasks();
      }

    };

    List<Map<String, Object>> results = managementService.executeCustomSql(customSqlExecution);

在这种情况下,列表中的 Map 条目将只包含 *id、name 和 create time*,而不是完整的任务对象。

使用上述方法可以执行任何 SQL。另一个更复杂的示例:

        @Select({
            "SELECT task.ID_ as taskId, variable.LONG_ as variableValue FROM ACT_RU_VARIABLE variable",
            "inner join ACT_RU_TASK task on variable.TASK_ID_ = task.ID_",
            "where variable.NAME_ = #{variableName}"
        })
        List<Map<String, Object>> selectTaskWithSpecificVariable(String variableName);

使用此方法,任务表将与变量表连接。只保留变量具有特定名称的记录,并返回任务 ID 和相应的数值。

有关使用基于注解的映射语句的工作示例,请查看单元测试 *org.flowable.standalone.cfg.CustomMybatisMapperTest* 以及 src/test/java/org/flowable/standalone/cfg/ 和 src/test/resources/org/flowable/standalone/cfg/ 文件夹中的其他类和资源。

### 基于 XML 的映射语句

当使用基于 XML 的映射语句时,语句在 XML 文件中定义。对于不需要完整任务数据而只需要其中一小部分的用例,XML 文件可以如下所示:

    <mapper namespace="org.flowable.standalone.cfg.TaskMapper">

      <resultMap id="customTaskResultMap" type="org.flowable.standalone.cfg.CustomTask">
        <id property="id" column="ID_" jdbcType="VARCHAR"/>
        <result property="name" column="NAME_" jdbcType="VARCHAR"/>
        <result property="createTime" column="CREATE_TIME_" jdbcType="TIMESTAMP" />
      </resultMap>

      <select id="selectCustomTaskList" resultMap="customTaskResultMap">
        select RES.ID_, RES.NAME_, RES.CREATE_TIME_ from ACT_RU_TASK RES
      </select>

    </mapper>

结果被映射到 *org.flowable.standalone.cfg.CustomTask* 类的实例,该类可以如下所示:

    public class CustomTask {

      protected String id;
      protected String name;
      protected Date createTime;

      public String getId() {
        return id;
      }
      public String getName() {
        return name;
      }
      public Date getCreateTime() {
        return createTime;
      }
    }

必须在流程引擎配置中提供 Mapper XML 文件,如下所示:

    ...
    <property name="customMybatisXMLMappers">
      <set>
        <value>org/flowable/standalone/cfg/custom-mappers/CustomTaskMapper.xml</value>
      </set>
    </property>
    ...

语句可以按如下方式执行:

    List<CustomTask> tasks = managementService.executeCommand(new Command<List<CustomTask>>() {

          @SuppressWarnings("unchecked")
          @Override
          public List<CustomTask> execute(CommandContext commandContext) {
            return (List<CustomTask>) CommandContextUtil.getDbSqlSession().selectList("selectCustomTaskList");
          }
        });

对于需要更复杂语句的用例,XML 映射语句会很有帮助。由于 Flowable 在内部使用 XML 映射语句,因此可以利用其底层功能。

假设某个用例需要基于 id、name、type、userId 等查询附件数据!为了实现这个用例,可以创建一个扩展 *org.flowable.engine.impl.AbstractQuery* 的查询类 *AttachmentQuery*,如下所示:

    public class AttachmentQuery extends AbstractQuery<AttachmentQuery, Attachment> {

      protected String attachmentId;
      protected String attachmentName;
      protected String attachmentType;
      protected String userId;

      public AttachmentQuery(ManagementService managementService) {
        super(managementService);
      }

      public AttachmentQuery attachmentId(String attachmentId){
        this.attachmentId = attachmentId;
        return this;
      }

      public AttachmentQuery attachmentName(String attachmentName){
        this.attachmentName = attachmentName;
        return this;
      }

      public AttachmentQuery attachmentType(String attachmentType){
        this.attachmentType = attachmentType;
        return this;
      }

      public AttachmentQuery userId(String userId){
        this.userId = userId;
        return this;
      }

      @Override
      public long executeCount(CommandContext commandContext) {
        return (Long) CommandContextUtil.getDbSqlSession()
                       .selectOne("selectAttachmentCountByQueryCriteria", this);
      }

      @Override
      public List<Attachment> executeList(CommandContext commandContext, Page page) {
        return CommandContextUtil.getDbSqlSession()
                .selectList("selectAttachmentByQueryCriteria", this);
      }

注意,当扩展 *AbstractQuery* 类时,扩展类应该向超类构造函数传递一个 *ManagementService* 实例,并且需要实现 *executeCount* 和 *executeList* 方法来调用映射语句。

包含映射语句的 XML 文件可以如下所示:

    <mapper namespace="org.flowable.standalone.cfg.AttachmentMapper">

      <select id="selectAttachmentCountByQueryCriteria" parameterType="org.flowable.standalone.cfg.AttachmentQuery" resultType="long">
        select count(distinct RES.ID_)
        <include refid="selectAttachmentByQueryCriteriaSql"/>
      </select>

      <select id="selectAttachmentByQueryCriteria" parameterType="org.flowable.standalone.cfg.AttachmentQuery" resultMap="org.flowable.engine.impl.persistence.entity.AttachmentEntity.attachmentResultMap">
        ${limitBefore}
        select distinct RES.* ${limitBetween}
        <include refid="selectAttachmentByQueryCriteriaSql"/>
        ${orderBy}
        ${limitAfter}
      </select>

      <sql id="selectAttachmentByQueryCriteriaSql">
      from ${prefix}ACT_HI_ATTACHMENT RES
      <where>
       <if test="attachmentId != null">
         RES.ID_ = #{attachmentId}
       </if>
       <if test="attachmentName != null">
         and RES.NAME_ = #{attachmentName}
       </if>
       <if test="attachmentType != null">
         and RES.TYPE_ = #{attachmentType}
       </if>
       <if test="userId != null">
         and RES.USER_ID_ = #{userId}
       </if>
      </where>
      </sql>
    </mapper>

分页、排序、表名前缀等功能都可以在语句中使用(因为 parameterType 是 *AbstractQuery* 的子类)。注意,要映射结果可以使用预定义的 *org.flowable.engine.impl.persistence.entity.AttachmentEntity.attachmentResultMap* 结果映射。

最后,*AttachmentQuery* 可以按如下方式使用:

    ....
    // 获取附件总数
    long count = new AttachmentQuery(managementService).count();

    // 获取 ID 为 10025 的附件
    Attachment attachment = new AttachmentQuery(managementService).attachmentId("10025").singleResult();

    // 获取前 10 个附件
    List<Attachment> attachments = new AttachmentQuery(managementService).listPage(0, 10);

    // 获取用户 kermit 上传的所有附件
    attachments = new AttachmentQuery(managementService).userId("kermit").list();
    ....

有关使用 XML 映射语句的工作示例,请查看单元测试 *org.flowable.standalone.cfg.CustomMybatisXMLMapperTest* 以及 src/test/java/org/flowable/standalone/cfg/ 和 src/test/resources/org/flowable/standalone/cfg/ 文件夹中的其他类和资源。

## 使用 ProcessEngineConfigurator 进行高级流程引擎配置

一种高级的介入流程引擎配置的方式是使用 *ProcessEngineConfigurator*。其思想是创建 *org.flowable.engine.cfg.ProcessEngineConfigurator* 接口的实现并将其注入到流程引擎配置中:

    <bean id="processEngineConfiguration" class="...SomeProcessEngineConfigurationClass">

        ...

        <property name="configurators">
            <list>
                <bean class="com.mycompany.MyConfigurator">
                    ...
                </bean>
            </list>
        </property>

        ...

    </bean>

实现此接口需要两个方法。第一个是 *configure* 方法,它接收一个 *ProcessEngineConfiguration* 实例作为参数。可以通过这种方式添加自定义配置,并且保证在**流程引擎创建之前,但在所有默认配置完成之后**调用此方法。另一个方法是 *getPriority* 方法,它允许在某些配置器相互依赖的情况下对配置器进行排序。

这种配置器的一个例子是 [LDAP 集成](bpmn/ch16-Ldap.md#ldap-integration),其中配置器用于将默认的用户和组管理器类替换为能够处理 LDAP 用户存储的类。因此,配置器基本上允许对流程引擎进行相当大的更改或调整,适用于非常高级的用例。另一个例子是用自定义版本替换流程定义缓存:

    public class ProcessDefinitionCacheConfigurator extends AbstractProcessEngineConfigurator {

        public void configure(ProcessEngineConfigurationImpl processEngineConfiguration) {
                MyCache myCache = new MyCache();
                processEngineConfiguration.setProcessDefinitionCache(enterpriseProcessDefinitionCache);
        }

    }

流程引擎配置器也可以使用 [ServiceLoader](http://docs.oracle.com/javase/7/docs/api/java/util/ServiceLoader.html) 方式从类路径中自动发现。这意味着配置器实现的 jar 必须放在类路径上,并在 jar 的 *META-INF/services* 文件夹中包含一个名为 **org.flowable.engine.cfg.ProcessEngineConfigurator** 的文件。该文件的内容需要是自定义实现的完全限定类名。当流程引擎启动时,日志会显示找到了这些配置器:

    INFO  org.flowable.engine.impl.cfg.ProcessEngineConfigurationImpl  - Found 1 auto-discoverable Process Engine Configurators
    INFO  org.flowable.engine.impl.cfg.ProcessEngineConfigurationImpl  - Found 1 Process Engine Configurators in total:
    INFO  org.flowable.engine.impl.cfg.ProcessEngineConfigurationImpl  - class org.flowable.MyCustomConfigurator

注意,这种 ServiceLoader 方式在某些环境中可能不起作用。可以使用 ProcessEngineConfiguration 的 *enableConfiguratorServiceLoader* 属性(默认为 true)显式禁用它。

## 高级查询 API: 在运行时和历史任务查询之间无缝切换

任何 BPM 用户界面的核心组件之一是任务列表。通常,最终用户处理打开的运行时任务,使用各种设置过滤他们的收件箱。通常还需要在这些列表中显示历史任务,并使用类似的过滤方式。为了使代码编写更容易,*TaskQuery* 和 *HistoricTaskInstanceQuery* 都有一个共享的父接口,其中包含所有通用操作(大多数操作都是通用的)。

这个通用接口是 *org.flowable.engine.task.TaskInfoQuery* 类。*org.flowable.engine.task.Task* 和 *org.flowable.engine.task.HistoricTaskInstance* 都有一个共同的父类 *org.flowable.engine.task.TaskInfo*(具有通用属性),它从例如 *list()* 方法返回。然而,Java 泛型有时弊大于利:如果你想直接使用 *TaskInfoQuery* 类型,它看起来会是这样:

    TaskInfoQuery<? extends TaskInfoQuery<?,?>, ? extends TaskInfo> taskInfoQuery

呃,对吧。为了"解决"这个问题,可以使用 *org.flowable.engine.task.TaskInfoQueryWrapper* 类来避免泛型(以下代码可能来自 REST 代码,该代码返回一个任务列表,用户可以在打开和已完成的任务之间切换):

    TaskInfoQueryWrapper taskInfoQueryWrapper = null;
    if (runtimeQuery) {
        taskInfoQueryWrapper = new TaskInfoQueryWrapper(taskService.createTaskQuery());
    } else {
        taskInfoQueryWrapper = new TaskInfoQueryWrapper(historyService.createHistoricTaskInstanceQuery());
    }

    List<? extends TaskInfo> taskInfos = taskInfoQueryWrapper.getTaskInfoQuery().or()
        .taskNameLike("%k1%")
        .taskDueAfter(new Date(now.getTime() + (3 * 24L * 60L * 60L * 1000L)))
    .endOr()
    .list();

## 通过覆盖标准 SessionFactory 实现自定义身份管理

如果你不想使用完整的 *ProcessEngineConfigurator* 实现(如 [LDAP 集成](bpmn/ch16-Ldap.md#ldap-integration)),但仍然想要插入自定义的身份管理框架,那么你也可以覆盖 *IdmIdentityServiceImpl* 类或直接实现 *IdmIdentityService* 接口,并在 *ProcessEngineConfiguration* 中使用该实现类作为 *idmIdentityService* 属性。在 Spring 中,可以通过在 *ProcessEngineConfiguration* bean 定义中添加以下内容来轻松实现:

    <bean id="processEngineConfiguration" class="...SomeProcessEngineConfigurationClass">

        ...

        <property name="idmIdentityService">
            <bean class="com.mycompany.IdmIdentityServiceBean"/>
        </property>

        ...

    </bean>

查看 *LDAPIdentityServiceImpl* 类的实现,可以了解如何实现 *IdmIdentityService* 接口的方法的很好示例。
你需要确定要在自定义身份服务类中实现哪些方法。例如,以下调用:

    long potentialOwners = identityService.createUserQuery().memberOfGroup("management").count();

会导致调用 *IdmIdentityService* 接口的以下成员:

    UserQuery createUserQuery();

[LDAP 集成](bpmn/ch16-Ldap.md#ldap-integration)的代码包含了如何实现此功能的完整示例。查看 Github 上的代码: [LDAPIdentityServiceImpl](https://github.com/flowable/flowable-engine/blob/master/modules/flowable-ldap/src/main/java/org/flowable/ldap/LDAPIdentityServiceImpl.java)。

## 启用安全的 BPMN 2.0 XML

在大多数情况下,部署到 Flowable 引擎的 BPMN 2.0 流程都在开发团队的严格控制之下。但是,在某些用例中,可能需要向引擎上传任意的 BPMN 2.0 XML。在这种情况下,需要考虑到恶意用户可能会按照[这里](http://www.jorambarrez.be/blog/2013/02/19/uploading-a-funny-xml-can-bring-down-your-server/)所述使服务器宕机。

为了避免上述链接中描述的攻击,可以在流程引擎配置中设置 *enableSafeBpmnXml* 属性:

    <property name="enableSafeBpmnXml" value="true"/>

**默认情况下此功能是禁用的!** 这是因为它依赖于 JDK 的 StaxSource 类的可用性。不幸的是,在某些平台上此类不可用(由于使用较旧的 XML 解析器实现),因此无法启用安全的 BPMN 2.0 XML 功能。

如果运行 Flowable 的平台支持此功能,请启用它。

## 事件日志记录

引入了事件日志记录机制。该日志记录机制建立在 Flowable 引擎的通用[事件机制](bpmn/ch03-Configuration.md#event-handlers)之上,默认情况下是禁用的。其思想是捕获来自引擎的事件,创建包含所有事件数据(及更多信息)的映射,并将其提供给 *org.flowable.engine.impl.event.logger.EventFlusher*,后者会将这些数据刷新到其他位置。默认情况下,使用简单的数据库支持的事件处理器/刷新器,它使用 Jackson 将上述映射序列化为 JSON,并将其作为 *EventLogEntryEntity* 实例存储在数据库中。默认情况下会创建此数据库日志记录所需的表(名为 *ACT_EVT_LOG*)。如果不使用事件日志记录,可以删除此表。

要启用数据库日志记录器:

    processEngineConfigurationImpl.setEnableDatabaseEventLogging(true);

或在运行时:

    databaseEventLogger = new EventLogger(processEngineConfiguration.getClock(),
                                          processEngineConfiguration.getObjectMapper());
    runtimeService.addEventListener(databaseEventLogger);

EventLogger 类可以被扩展。特别是,如果不需要默认的数据库日志记录,*createEventFlusher()* 方法需要返回 *org.flowable.engine.impl.event.logger.EventFlusher* 接口的实例。可以使用 *managementService.getEventLogEntries(startLogNr, size);* 通过 Flowable 检索 *EventLogEntryEntity* 实例。

很容易看出这些表数据现在如何可以用于将 JSON 输入到诸如 MongoDB、Elastic Search 等大数据 NoSQL 存储中。同样也很容易看出这里使用的类(org.flowable.engine.impl.event.logger.EventLogger/EventFlusher 和许多 EventHandler 类)是可插拔的,可以根据您自己的用例进行调整(例如不将 JSON 存储在数据库中,而是直接发送到队列或大数据存储)。

请注意,此事件日志记录机制是对 Flowable 的"传统"历史管理器的补充。虽然所有数据都在数据库表中,但它并不是为查询或易于检索而优化的。真正的用例是审计跟踪并将其输入到大数据存储中。

## 禁用批量插入

默认情况下,引擎会将同一数据库表的多个插入语句组合在一个*批量插入*中,从而提高性能。这已经在所有支持的数据库上进行了测试和实现。

但是,如果受支持和测试的数据库的特定版本不允许批量插入(例如,我们有一个关于 z/OS 上的 DB2 的报告,尽管 DB2 通常可以工作),可以在流程引擎配置中禁用批量插入:

    <property name="bulkInsertEnabled" value="false" />

## 安全脚本

默认情况下,在使用[脚本任务](bpmn/ch07b-BPMN-Constructs.md#script-Task)时,执行的脚本具有与 Java 委托类似的功能。它可以完全访问 JVM,可以无限运行(由于无限循环)或使用大量内存。然而,Java 委托需要编写并放在类路径的 jar 中,并且它们与流程定义的生命周期不同。最终用户通常不会编写 Java 委托,因为这通常是开发人员的工作。

另一方面,脚本是流程定义的一部分,其生命周期是相同的。脚本任务不需要额外的 jar 部署步骤,而是可以在流程定义部署后立即执行。有时,脚本任务的脚本不是由开发人员编写的。然而,这就带来了上述问题:脚本可以完全访问 JVM,并且在执行脚本时可能会阻塞许多系统资源。因此,允许任何人编写脚本都不是一个好主意。

为了解决这个问题,可以启用*安全脚本*功能。目前,此功能仅针对 *javascript* 脚本实现。要启用它,请将 *flowable-secure-javascript* 依赖项添加到你的项目中。使用 maven 时:

    <dependency>
        <groupId>org.flowable</groupId>
        <artifactId>flowable-secure-javascript</artifactId>
        <version>${flowable.version}</version>
    </dependency>

添加此依赖项将传递引入 Rhino 依赖项(参见 https://github.com/mozilla/rhino)。Rhino 是 JDK 的 javascript 引擎。它曾包含在 JDK 6 和 7 版本中,后来被 Nashorn 引擎取代。但是,Rhino 项目在被包含在 JDK 中之后继续开发。许多功能(包括 Flowable 用于实现安全脚本的功能)是在之后添加的。在撰写本文时,Nashorn 引擎**没有**实现安全脚本功能所需的功能。

这意味着脚本之间可能存在(通常很小的)差异(例如,*importPackage* 在 Rhino 上可用,但在 Nashorn 上必须使用 *load()*)。

安全脚本的配置是通过一个专用的 *Configurator* 对象完成的,该对象在流程引擎实例化之前传递给流程引擎配置:

    SecureJavascriptConfigurator configurator = new SecureJavascriptConfigurator()
      .setWhiteListedClasses(new HashSet<String>(Arrays.asList("java.util.ArrayList")))
      .setMaxStackDepth(10)
      .setMaxScriptExecutionTime(3000L)
      .setMaxMemoryUsed(3145728L)
      .setNrOfInstructionsBeforeStateCheckCallback(10);

    processEngineConfig.addConfigurator(configurator);

可以使用以下设置:

-   **enableClassWhiteListing**: 当为 true 时,所有类都将被列入黑名单,所有想要使用的类都需要单独列入白名单。这可以严格控制向脚本公开的内容。默认为 *false*。

-   **whiteListedClasses**: 一组字符串,对应于允许在脚本中使用的类的完全限定类名。例如,要在脚本中公开 *execution* 对象,需要将 *org.flowable.engine.impl.persistence.entity.ExecutionEntityImpl* 字符串添加到此集合中。默认为*空*。

-   **maxStackDepth**: 限制在脚本中调用函数时的堆栈深度。这可用于避免在递归调用脚本中定义的方法时发生堆栈溢出异常。默认为 *-1*(禁用)。

-   **maxScriptExecutionTime**: 允许脚本运行的最长时间。默认为 *-1*(禁用)。

-   **maxMemoryUsed**: 脚本允许使用的最大内存(以字节为单位)。注意,脚本引擎本身也会占用一定的内存,这里也会计算在内。默认为 *-1*(禁用)。

-   **nrOfInstructionsBeforeStateCheckCallback**: 最大脚本执行时间和内存使用量是通过回调实现的,该回调在脚本的每 x 条指令时调用。注意,这些不是脚本指令,而是 Java 字节码指令(这意味着一行脚本可能是数百条字节码指令)。默认为 100。

*注意:* *maxMemoryUsed* 设置只能由支持 com.sun.management.ThreadMXBean#getThreadAllocatedBytes() 方法的 JVM 使用。Oracle JDK 具有此功能。

ScriptExecutionListener 和 ScriptTaskListener 也有安全变体: *org.flowable.scripting.secure.listener.SecureJavascriptExecutionListener* 和 *org.flowable.scripting.secure.listener.SecureJavascriptTaskListener*。

使用方式如下:

    <flowable:executionListener event="start" class="org.flowable.scripting.secure.listener.SecureJavascriptExecutionListener">
      <flowable:field name="script">
        <flowable:string>
            <![CDATA[
                execution.setVariable('test');
            ]]>
        </flowable:string>
      </flowable:field>
      <flowable:field name="language" stringValue="javascript" />
    </flowable:executionListener>

有关演示不安全脚本以及如何通过*安全脚本*功能使其安全的示例,请查看 [Github 上的单元测试](https://github.com/Flowable/Flowable/tree/main/modules/flowable-secure-javascript/src/test/resources)

## 日志会话 [实验性功能]

在 6.5.0 版本中添加,日志会话允许你收集流程执行的信息,即使异常导致事务回滚也是如此。这是通过向引擎配置提供 LoggingListener 实现来启用的。loggingListener 包含一个名为 `loggingGenerated` 的方法,该方法接收一个 Jackson ObjectNodes 列表。

在这个简单的实现中,每个 ObjectNode 都会被发送到日志记录器:

```
class MyLoggingListener implements LoggingListener{
    static Logger logger = LoggerFactory.getLogger(MyLoggingListener.class);
    
    @Override
    public void loggingGenerated(List<ObjectNode> loggingNodes) {
        loggingNodes.forEach(jsonNodes -> logger.info(jsonNodes.toString()));
    }
}
```

在流程引擎配置期间,会传递一个 LoggingListener 的实例
```
ProcessEngine processEngine = ProcessEngineConfiguration.createStandaloneInMemProcessEngineConfiguration()
      .setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_FALSE)
      .setJdbcUrl("jdbc:h2:mem:my-own-db;DB_CLOSE_DELAY=1000")
      .setLoggingListener(new MyLoggingListener())
      .buildProcessEngine();

```

### 日志会话 ObjectNodes

传递给 loggingGenerated 方法的 ObjectNodes 列表是 JSON 对象,至少包含以下属性:
- `message` - 人类可读的消息
- `scopeId` - 用于对来自同一事务的所有消息进行分组的关联 ID
- `scopeType` - 作用域的类型

根据它们描述的事件类型,还会出现其他字段:
 
```
2020-01-21 10:46:54.852  INFO 4985 --- [  restartedMain] c.e.f.MyLoggingListener                : {"message":"Variable 'initiator' created","scopeId":"a193efb3-3c6d-11ea-a01d-bed6c476b3ed","scopeType":"bpmn","variableName":"initiator","variableType":"null","variableRawValue":null,"variableValue":null,"scopeDefinitionId":"loggingSessionProcess:1:a18d38ef-3c6d-11ea-a01d-bed6c476b3ed","scopeDefinitionKey":"loggingSessionProcess","scopeDefinitionName":"Logging Session Process","__id":"a1948bf5-3c6d-11ea-a01d-bed6c476b3ed","__timeStamp":"2020-01-21T16:46:54.819Z","type":"variableCreate","__transactionId":"a1948bf5-3c6d-11ea-a01d-bed6c476b3ed","__logNumber":1}
``` 