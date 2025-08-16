---
id: ch03-Configuration
title: 配置
description: 本文档详细讲解如何在Flowable中配置ProcessEngine流程引擎，包括通过flowable.cfg.xml文件配置和使用编程方式创建，适用于非Spring环境的流程引擎初始化设置。
keywords: Flowable配置,ProcessEngine创建,BPMN引擎设置,流程引擎初始化,flowable.cfg.xml,非Spring配置,JDBC连接,流程引擎属性
---

## 创建 ProcessEngine

Flowable 流程引擎通过一个名为 flowable.cfg.xml 的 XML 文件进行配置。注意,如果你使用 [Spring 风格构建流程引擎](bpmn/ch05-Spring.md#spring-integration),这种方式则**不适用**。

获取 ProcessEngine 最简单的方式是使用 org.flowable.engine.ProcessEngines 类:

    ProcessEngine processEngine = ProcessEngines.getDefaultProcessEngine()

这将在 classpath 中查找 flowable.cfg.xml 文件,并基于该文件中的配置构建引擎。以下代码片段展示了一个配置示例。接下来的章节将详细介绍配置属性。

    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

      <bean id="processEngineConfiguration" class="org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration">

        <property name="jdbcUrl" value="jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000" />
        <property name="jdbcDriver" value="org.h2.Driver" />
        <property name="jdbcUsername" value="sa" />
        <property name="jdbcPassword" value="" />

        <property name="databaseSchemaUpdate" value="true" />

        <property name="asyncExecutorActivate" value="false" />

        <property name="mailServerHost" value="mail.my-corp.com" />
        <property name="mailServerPort" value="5025" />
      </bean>

    </beans>

需要注意的是,配置 XML 实际上是一个 Spring 配置文件。**这并不意味着 Flowable 只能在 Spring 环境中使用!** 我们只是在内部利用了 Spring 的解析和依赖注入功能来构建引擎。

ProcessEngineConfiguration 对象也可以通过编程方式使用配置文件创建。同时也可以使用不同的 bean id(例如,参见第 3 行)。

    ProcessEngineConfiguration.
      createProcessEngineConfigurationFromResourceDefault();
      createProcessEngineConfigurationFromResource(String resource);
      createProcessEngineConfigurationFromResource(String resource, String beanName);
      createProcessEngineConfigurationFromInputStream(InputStream inputStream);
      createProcessEngineConfigurationFromInputStream(InputStream inputStream, String beanName);

也可以不使用配置文件,而是基于默认值创建配置(更多信息请参见[支持的不同类](#configurationClasses))。

    ProcessEngineConfiguration.createStandaloneProcessEngineConfiguration();
    ProcessEngineConfiguration.createStandaloneInMemProcessEngineConfiguration();

所有这些 ProcessEngineConfiguration.createXXX() 方法都会返回一个可以进一步调整的 ProcessEngineConfiguration。调用 buildProcessEngine() 操作后,将创建一个 ProcessEngine:

    ProcessEngine processEngine = ProcessEngineConfiguration.createStandaloneInMemProcessEngineConfiguration()
      .setDatabaseSchemaUpdate(ProcessEngineConfiguration.DB_SCHEMA_UPDATE_FALSE)
      .setJdbcUrl("jdbc:h2:mem:my-own-db;DB_CLOSE_DELAY=1000")
      .setAsyncExecutorActivate(false)
      .buildProcessEngine();
      
## ProcessEngineConfiguration bean

flowable.cfg.xml 必须包含一个 id 为 'processEngineConfiguration' 的 bean。

     <bean id="processEngineConfiguration" class="org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration">

<a name="configurationClasses"/>
该 bean 用于构建 ProcessEngine。有多个可用的类可以用来定义 processEngineConfiguration。这些类代表不同的环境,并相应地设置默认值。最佳实践是选择最适合你环境的类,以最小化配置引擎所需的属性数量。目前可用的类如下:

-   **org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration**: 流程引擎以独立方式使用。Flowable 将处理所有事务。默认情况下,只有在引擎启动时才会检查数据库(如果没有 Flowable schema 或 schema 版本不正确,则会抛出异常)。

-   **org.flowable.engine.impl.cfg.StandaloneInMemProcessEngineConfiguration**: 这是一个用于单元测试的便捷类。Flowable 将处理所有事务。默认使用 H2 内存数据库。数据库将在引擎启动时创建,在引擎关闭时删除。使用此类时,可能不需要额外配置(除非使用作业执行器或邮件功能等)。

-   **org.flowable.spring.SpringProcessEngineConfiguration**: 当在 Spring 环境中使用流程引擎时使用。更多信息请参见 [Spring 集成部分](bpmn/ch05-Spring.md#spring-integration)。

-   **org.flowable.engine.impl.cfg.JtaProcessEngineConfiguration**: 当引擎在独立模式下运行,使用 JTA 事务时使用。

## 数据库配置

配置 Flowable 引擎将使用的数据库有两种方式。第一种选择是定义数据库的 JDBC 属性:

-   **jdbcUrl**: 数据库的 JDBC URL。

-   **jdbcDriver**: 特定数据库类型的驱动程序实现。

-   **jdbcUsername**: 连接数据库的用户名。

-   **jdbcPassword**: 连接数据库的密码。

基于提供的 JDBC 属性构建的数据源将使用默认的 [MyBatis](http://www.mybatis.org/) 连接池设置。可以选择设置以下属性来调整连接池(来自 MyBatis 文档):

-   **jdbcMaxActiveConnections**: 连接池在任何时候最多可以包含的活动连接数。默认值为 10。

-   **jdbcMaxIdleConnections**: 连接池在任何时候最多可以包含的空闲连接数。

-   **jdbcMaxCheckoutTime**: 连接可以从连接池中"借出"的最长时间(毫秒),超过该时间将被强制返回。默认值为 20000(20 秒)。

-   **jdbcMaxWaitTime**: 这是一个低级设置,当获取连接花费异常长时间时,它使连接池有机会打印日志状态并重新尝试获取连接(如果连接池配置错误,可以避免永远静默失败)。默认值为 20000(20 秒)。

数据库配置示例:

    <property name="jdbcUrl" value="jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000" />
    <property name="jdbcDriver" value="org.h2.Driver" />
    <property name="jdbcUsername" value="sa" />
    <property name="jdbcPassword" value="" />

我们的基准测试表明,在处理大量并发请求时,MyBatis 连接池并不是最高效或最可靠的。因此,建议使用 javax.sql.DataSource 实现并将其注入到流程引擎配置中(例如 HikariCP、Tomcat JDBC Connection Pool 等):

    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" >
      <property name="driverClassName" value="com.mysql.jdbc.Driver" />
      <property name="url" value="jdbc:mysql://localhost:3306/flowable" />
      <property name="username" value="flowable" />
      <property name="password" value="flowable" />
      <property name="defaultAutoCommit" value="false" />
    </bean>

    <bean id="processEngineConfiguration" class="org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration">

      <property name="dataSource" ref="dataSource" />
      ...

注意,Flowable 不提供允许你定义此类数据源的库。因此你需要确保这些库在你的 classpath 中。

无论你使用 JDBC 还是数据源方式,都可以设置以下属性:

-   **databaseType**: 通常不需要指定此属性,因为它会从数据库连接元数据中自动检测。只有在自动检测失败时才需要指定。可能的值: {h2, mysql, oracle, postgres, mssql, db2}。此设置将决定使用哪些创建/删除脚本和查询。有关支持的类型的概述,请参见[支持的数据库部分](bpmn/ch03-Configuration.md#supported-databases)。

-   **databaseSchemaUpdate**: 设置在流程引擎启动和关闭时处理数据库 schema 的策略。

    -   false (默认值): 当创建流程引擎时,检查数据库 schema 版本是否与库版本匹配,如果版本不匹配则抛出异常。

    -   true: 在构建流程引擎时,执行检查,如果需要则更新 schema。如果 schema 不存在,则创建它。

    -   create-drop: 在创建流程引擎时创建 schema,在关闭流程引擎时删除 schema。

## JNDI 数据源配置

默认情况下,Flowable 的数据库配置包含在每个 web 应用程序的 WEB-INF/classes 目录下的 db.properties 文件中。这并不总是理想的选择,因为它要求用户要么修改 Flowable 源代码中的 db.properties 并重新编译 WAR 文件,要么在每次部署时解压 WAR 文件并修改 db.properties。

通过使用 JNDI (Java 命名和目录接口)获取数据库连接,连接完全由 Servlet 容器管理,配置可以在 WAR 部署之外管理。这也比 db.properties 文件提供了更多的连接参数控制。

### 配置

JNDI 数据源的配置会根据你使用的 servlet 容器应用程序而有所不同。以下说明适用于 Tomcat,对于其他容器应用程序,请参考你的容器应用程序文档。

如果使用 Tomcat,JNDI 资源在 $CATALINA\_BASE/conf/\[enginename\]/\[hostname\]/\[warname\].xml 中配置(对于 Flowable UI,通常是 $CATALINA\_BASE/conf/Catalina/localhost/flowable-app.xml)。首次部署应用程序时,默认上下文从 Flowable WAR 文件中复制,因此如果它已经存在,你需要替换它。例如,要更改 JNDI 资源使应用程序连接到 MySQL 而不是 H2,请将文件更改为以下内容:

    <?xml version="1.0" encoding="UTF-8"?>
        <Context antiJARLocking="true" path="/flowable-app">
            <Resource auth="Container"
                name="jdbc/flowableDB"
                type="javax.sql.DataSource"
                description="JDBC DataSource"
                url="jdbc:mysql://localhost:3306/flowable"
                driverClassName="com.mysql.jdbc.Driver"
                username="sa"
                password=""
                defaultAutoCommit="false"
                initialSize="5"
                maxWait="5000"
                maxActive="120"
                maxIdle="5"/>
            </Context>

### JNDI 属性

要配置 JNDI 数据源,请在 Flowable UI 的属性文件中使用以下属性:

-   spring.datasource.jndi-name=: 数据源的 JNDI 名称。

-   datasource.jndi.resourceRef: 设置查找是否在 J2EE 容器中进行,例如,如果 JNDI 名称尚未包含前缀 "java:comp/env/",则需要添加该前缀。默认值为 "true"。

### 自定义属性

系统属性也可以在 flowable.cfg.xml 中使用,使用格式为 `${propertyName:defaultValue}`。

    <property name="jdbcUrl" value="${jdbc.url:jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000}" />
    <property name="jdbcDriver" value="${jdbc.driver:org.h2.Driver}" />
    <property name="jdbcUsername" value="${jdbc.username:sa}" />
    <property name="jdbcPassword" value="${jdbc.password:}" />

使用此配置时,如果 `jdbc.url` 属性可用,则会用于 `ProcessEngineConfiguration` 的 `jdbcUrl`。
否则将使用第一个 `:` 后面的值。

还可以通过使用 org.springframework.beans.factory.config.PropertyPlaceholderConfigurer 类型的 bean 来定义从系统中获取属性的位置。

自定义属性位置的配置示例:

    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

      <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="location" value="file:/opt/conf/flowable.properties" />
      </bean>

      <bean id="processEngineConfiguration" class="org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration">

        <property name="jdbcUrl" value="${jdbc.url:jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000}" />
        <property name="jdbcDriver" value="${jdbc.driver:org.h2.Driver}" />
        <property name="jdbcUsername" value="${jdbc.username:sa}" />
        <property name="jdbcPassword" value="${jdbc.password:}" />

        <property name="databaseSchemaUpdate" value="true" />

        <property name="asyncExecutorActivate" value="false" />

        <property name="mailServerHost" value="mail.my-corp.com" />
        <property name="mailServerPort" value="5025" />
      </bean>

    </beans>

使用此配置时,系统会首先在 /opt/conf/flowable.properties 文件中查找属性。

## 支持的数据库

以下列出了 Flowable 用于引用数据库的类型(区分大小写!)。

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>Flowable 数据库类型</th>
<th>JDBC URL 示例</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>h2</p></td>
<td><p>jdbc:h2:tcp://localhost/flowable</p></td>
<td><p>默认配置的数据库</p></td>
</tr>
<tr class="even">
<td><p>mysql</p></td>
<td><p>jdbc:mysql://localhost:3306/flowable?autoReconnect=true</p></td>
<td><p>使用 mysql-connector-java 数据库驱动程序测试</p></td>
</tr>
<tr class="odd">
<td><p>oracle</p></td>
<td><p>jdbc:oracle:thin:@localhost:1521:xe</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>postgres</p></td>
<td><p>jdbc:postgresql://localhost:5432/flowable</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>db2</p></td>
<td><p>jdbc:db2://localhost:50000/flowable</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>mssql</p></td>
<td><p>jdbc:sqlserver://localhost:1433;databaseName=flowable (jdbc.driver=com.microsoft.sqlserver.jdbc.SQLServerDriver) <em>或</em> jdbc:jtds:sqlserver://localhost:1433/flowable (jdbc.driver=net.sourceforge.jtds.jdbc.Driver)</p></td>
<td><p>使用 Microsoft JDBC Driver 4.0 (sqljdbc4.jar) 和 JTDS 驱动程序测试</p></td>
</tr>
</tbody>
</table>

## 创建数据库表

创建数据库表最简单的方法是:

-   将 flowable-engine JAR 包添加到你的 classpath 中

-   添加合适的数据库驱动

-   将 Flowable 配置文件(*flowable.cfg.xml*)添加到你的 classpath 中,并指向你的数据库(参见[数据库配置部分](bpmn/ch03-Configuration.md#database-configuration))

-   执行 *DbSchemaCreate* 类的 main 方法

然而,通常只有数据库管理员才能在数据库上执行 DDL 语句。在生产系统中,这也是最明智的选择。SQL DDL 语句可以在 Flowable 下载页面或 Flowable 发行版文件夹的 database 子目录中找到。这些脚本也在引擎 JAR(*flowable-engine-x.jar*)中的 *org/flowable/db/create* 包中(*drop* 文件夹包含删除语句)。SQL 文件的格式为:

    flowable.{db}.{create|drop}.{type}.sql

其中 *db* 是任何[支持的数据库](bpmn/ch03-Configuration.md#supported-databases)之一,*type* 是:

-   **engine:** 引擎执行所需的表。必需。

-   **history:** 包含历史和审计信息的表。可选:当历史级别设置为 *none* 时不需要。注意,这也会禁用一些功能(比如对任务的评论),这些功能将数据存储在历史数据库中。

**MySQL 用户注意:** MySQL 5.6.4 以下版本不支持毫秒精度的时间戳或日期。更糟糕的是,某些版本在尝试创建这样的列时会抛出异常,而其他版本则不会。在进行自动创建/升级时,引擎会在执行时更改 DDL。当使用 DDL 文件方法时,有一个常规版本和一个带有 *mysql55* 的特殊文件可用(这适用于 5.6.4 以下的任何版本)。后者的列类型没有毫秒精度。

具体来说,MySQL 版本适用以下情况:

-   **<5.6:** 不支持毫秒精度。DDL 文件可用(查找包含 *mysql55* 的文件)。自动创建/更新将开箱即用。

-   **5.6.0 - 5.6.3:** 不支持毫秒精度。自动创建/更新将**不**工作。建议无论如何都升级到更新的数据库版本。如果确实需要,可以使用 *mysql 5.5* 的 DDL 文件。

-   **5.6.4+:** 支持毫秒精度。DDL 文件可用(默认文件包含 *mysql*)。自动创建/更新开箱即用。

请注意,如果之后升级 MySQL 数据库,并且 Flowable 表已经创建/升级,列类型的更改必须手动完成！

## 数据库表名说明

Flowable 的所有数据库表名都以 **ACT\_** 开头。第二部分是表用例的两个字符标识。这个用例大致对应于服务 API。

-   **ACT\_RE\_**\*: 'RE' 代表 repository(仓库)。带有此前缀的表包含"静态"信息,如流程定义和流程资源(图片、规则等)。

-   **ACT\_RU\_**\*: 'RU' 代表 runtime(运行时)。这些是运行时表,包含流程实例、用户任务、变量、作业等的运行时数据。Flowable 只在流程实例执行期间存储运行时数据,并在流程实例结束时删除记录。这保持了运行时表的小型化和快速性。

-   **ACT\_HI\_**\*: 'HI' 代表 history(历史)。这些是包含历史数据的表,如过去的流程实例、变量、任务等。

-   **ACT\_GE\_**\*: general data(通用数据),用于各种用例。

## 数据库升级

在运行升级之前,请确保备份你的数据库(使用数据库的备份功能)。

默认情况下,每次创建流程引擎时都会执行版本检查。这通常在应用程序或 Flowable web 应用启动时发生一次。如果 Flowable 库发现库版本与 Flowable 数据库表版本之间存在差异,则会抛出异常。

要升级,你必须首先在 flowable.cfg.xml 配置文件中添加以下配置属性:

    <beans >

      <bean id="processEngineConfiguration"
          class="org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration">
        <!-- ... -->
        <property name="databaseSchemaUpdate" value="true" />
        <!-- ... -->
      </bean>

    </beans>

**同时,还要在 classpath 中包含适合你数据库的数据库驱动程序。** 升级应用程序中的 Flowable 库。或者启动新版本的 Flowable 并将其指向包含旧版本数据的数据库。当 databaseSchemaUpdate 设置为 true 时,Flowable 在首次发现库和数据库 schema 不同步时会自动将数据库 schema 升级到最新版本。

**作为替代方案,你也可以运行升级 DDL 语句。** 也可以运行 Flowable 下载页面上提供的数据库升级脚本。

## 作业执行器 (从 6.0.0 版本开始)

Flowable v5 的异步执行器是 Flowable V6 中唯一可用的作业执行器,因为它是一种更高性能且更友好数据库的方式来执行 Flowable 引擎中的异步作业。
Flowable 5 的旧作业执行器在 V6 中不再可用。更多信息可以在用户指南的高级部分找到。

另外,如果在 Java EE 7 下运行,可以使用符合 JSR-236 标准的 ManagedAsyncJobExecutor 来让容器管理线程。要启用它们,需要在配置中传入线程工厂,如下所示:

    <bean id="threadFactory" class="org.springframework.jndi.JndiObjectFactoryBean">
       <property name="jndiName" value="java:jboss/ee/concurrency/factory/default" />
    </bean>

    <bean id="customJobExecutor" class="org.flowable.engine.impl.jobexecutor.ManagedAsyncJobExecutor">
       <!-- ... -->
       <property name="threadFactory" ref="threadFactory" />
       <!-- ... -->
    </bean>

如果未指定线程工厂,托管实现将回退到其默认对应项。

## 作业执行器激活

AsyncExecutor 是一个管理线程池以触发定时器和其他异步任务的组件。

默认情况下,AsyncExecutor 未被激活且未启动。通过以下配置,异步执行器可以在 Flowable 引擎启动时一起启动。

    <property name="asyncExecutorActivate" value="true" />

属性 asyncExecutorActivate 指示 Flowable 引擎在启动时启动异步执行器。

## 邮件服务器配置

配置邮件服务器是可选的。Flowable 支持在业务流程中发送电子邮件。要实际发送电子邮件,需要有效的 SMTP 邮件服务器配置。有关配置选项,请参见[电子邮件任务](bpmn/ch07b-BPMN-Constructs.md#mail-server-configuration)。

## 历史配置

自定义历史存储的配置是可选的。这允许你调整影响引擎[历史功能](bpmn/ch10-History.md#history)的设置。更多详细信息请参见[历史配置](bpmn/ch10-History.md#history-configuration)。

    <property name="history" value="audit" />

## 在表达式和脚本中暴露配置 bean

默认情况下,你在 flowable.cfg.xml 配置或自己的 Spring 配置文件中指定的所有 bean 都可用于表达式和脚本。如果你想限制配置文件中 bean 的可见性,可以在流程引擎配置中配置一个名为 beans 的属性。ProcessEngineConfiguration 中的 beans 属性是一个映射。当你指定该属性时,只有在该映射中指定的 bean 才会对表达式和脚本可见。暴露的 bean 将以你在映射中指定的名称暴露。

## 部署缓存配置

所有流程定义在解析后都会被缓存,以避免每次需要流程定义时都访问数据库,同时也因为流程定义数据不会改变。默认情况下,这个缓存没有限制。要限制流程定义缓存,请添加以下属性:

    <property name="processDefinitionCacheLimit" value="10" />

设置此属性将使用具有指定硬限制的 LRU 缓存替换默认的 hashmap 缓存。当然,此属性的"最佳"值取决于存储的流程定义总量以及所有运行时流程实例在运行时实际使用的流程定义数量。

你也可以注入自己的缓存实现。这必须是一个实现了 org.flowable.engine.impl.persistence.deploy.DeploymentCache 接口的 bean:

    <property name="processDefinitionCache">
      <bean class="org.flowable.MyCache" />
    </property>

还有一个类似的属性叫做 knowledgeBaseCacheLimit 和 knowledgeBaseCache,用于配置规则缓存。这只在你的流程中使用规则任务时才需要。

## 日志记录

所有日志(flowable、spring、mybatis 等)都通过 SLF4J 路由,并允许选择你想要的日志实现。

**默认情况下,flowable-engine 依赖中不存在 SLF4J-binding JAR,为了使用你选择的日志框架,需要在你的项目中添加它。** 如果没有添加实现 JAR,SLF4J 将使用 NOP-logger,除了一个警告说明没有任何内容会被记录外,不会记录任何内容。有关这些绑定的更多信息,请参见 [<http://www.slf4j.org/codes.html#StaticLoggerBinder>](http://www.slf4j.org/codes.html#StaticLoggerBinder)。

使用 Maven 时,例如添加这样的依赖(这里使用 log4j),注意你仍需要添加版本:

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-log4j12</artifactId>
    </dependency>

flowable-rest webapp 配置为使用 Log4j-binding。在运行所有 flowable-* 模块的测试时也使用 Log4j。

**在 classpath 中使用带有 commons-logging 的容器时的重要说明:** 为了通过 SLF4J 路由 spring-logging,使用了一个桥接器(参见 [<http://www.slf4j.org/legacy.html#jclOverSLF4J>](http://www.slf4j.org/legacy.html#jclOverSLF4J))。如果你的容器提供了 commons-logging 实现,请按照此页面的说明操作: [<http://www.slf4j.org/codes.html#release>](http://www.slf4j.org/codes.html#release) 以确保稳定性。

使用 Maven 的示例(省略版本):

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>jcl-over-slf4j</artifactId>
    </dependency>


## 映射诊断上下文

Flowable 支持 SLF4j 的映射诊断上下文功能。以下基本信息会与要记录的内容一起传递给底层日志记录器:

-   processDefinition Id 作为 mdcProcessDefinitionID

-   processInstance Id 作为 mdcProcessInstanceID

-   execution Id 作为 mdcExecutionId

默认情况下不会记录这些信息。可以配置日志记录器以你想要的格式显示它们,作为常规日志消息的补充。例如在 Log4j 中,以下示例布局定义会使日志记录器显示上述信息:

    log4j.appender.consoleAppender.layout.ConversionPattern=ProcessDefinitionId=%X{mdcProcessDefinitionID}
    executionId=%X{mdcExecutionId} mdcProcessInstanceID=%X{mdcProcessInstanceID} mdcBusinessKey=%X{mdcBusinessKey} %m%n

当日志包含需要通过日志分析器实时检查的信息时,这很有用。

## 事件处理器

Flowable 引擎中的事件机制允许你在引擎内发生各种事件时得到通知。查看[所有支持的事件类型](bpmn/ch03-Configuration.md#supported-event-types)以了解可用事件的概述。

与在分发任何类型的事件时都得到通知不同,你可以为特定类型的事件注册监听器。你可以通过以下方式添加引擎范围的事件监听器:[通过配置](bpmn/ch03-Configuration.md#configuration-and-setup)、[在运行时使用 API](bpmn/ch03-Configuration.md#adding-listeners-at-runtime)或者[在 BPMN XML 中为特定流程定义](bpmn/ch03-Configuration.md#adding-listeners-to-process-definitions)添加事件监听器。

所有分发的事件都是 org.flowable.engine.common.api.delegate.event.FlowableEvent 的子类型。事件会暴露(如果可用)类型、executionId、processInstanceId 和 processDefinitionId。某些事件包含与发生的事件相关的额外上下文,关于额外负载的更多信息可以在[所有支持的事件类型](bpmn/ch03-Configuration.md#supported-event-types)列表中找到。

### 事件监听器实现

事件监听器唯一的要求是实现 org.flowable.engine.delegate.event.FlowableEventListener 接口。下面是一个监听器实现的示例，它将接收到的所有事件输出到标准输出，但与作业执行相关的事件除外：

    public class MyEventListener implements FlowableEventListener {

      @Override
      public void onEvent(FlowableEvent event) {

        if(event.getType() == FlowableEngineEventType.JOB_EXECUTION_SUCCESS) {
          System.out.println("A job well done!");
        } else if (event.getType() == FlowableEngineEventType.JOB_EXECUTION_FAILURE) {
          System.out.println("A job has failed...");
        } else {
          System.out.println("Event received: " + event.getType());
        }
      }

      @Override
      public boolean isFailOnException() {
        // 此监听器中 onEvent 方法的逻辑并不重要，如果日志记录失败，
        // 可以忽略异常...
        return false;
      }

      @Override
      public boolean isFireOnTransactionLifecycleEvent() {
        return false;
      }

      @Override
      public String getOnTransaction() {
        return null;
      }
    }

isFailOnException() 方法决定了当事件分发时 onEvent(..) 方法抛出异常时的行为。当返回 false 时，异常会被忽略。当返回 true 时，异常不会被忽略并会向上冒泡，从而导致当前正在进行的命令失败。如果该事件是 API 调用的一部分（或任何其他事务操作，例如作业执行），事务将被回滚。如果事件监听器中的行为不是业务关键性的，建议返回 false。

isFireOnTransactionLifecycleEvent() 方法决定此事件监听器是在事件发生时立即触发，还是在由 getOnTransaction() 方法确定的事务生命周期事件上触发。
事务生命周期事件支持的值包括：COMMITTED、ROLLED_BACK、COMMITTING、ROLLINGBACK。

Flowable 提供了一些基础实现来满足事件监听器的常见用例。这些可以用作基类或作为监听器实现的示例：

- **org.flowable.engine.delegate.event.BaseEntityEventListener**：一个事件监听器基类，可用于监听特定类型实体或所有实体的实体相关事件。它隐藏了类型检查，并提供了 4 个应该被重写的方法：当实体被创建、更新或删除时的 onCreate(..)、onUpdate(..) 和 onDelete(..)。对于所有其他实体相关事件，会调用 onEntityEvent(..)。

### 配置和设置

如果在流程引擎配置中配置了事件监听器，它将在流程引擎启动时激活，并在引擎后续重启后保持激活状态。

eventListeners 属性需要一个 org.flowable.engine.delegate.event.FlowableEventListener 实例列表。和往常一样，你可以声明一个内联 bean 定义，或者使用对现有 bean 的引用。下面的代码片段添加了一个事件监听器到配置中，该监听器会在任何类型的事件被分发时得到通知：

    <bean id="processEngineConfiguration"
        class="org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration">
        ...
        <property name="eventListeners">
          <list>
             <bean class="org.flowable.engine.example.MyEventListener" />
          </list>
        </property>
    </bean>

要在特定类型的事件被分发时得到通知，请使用 typedEventListeners 属性，该属性需要一个映射。映射条目的键是以逗号分隔的事件名称列表（或单个事件名称）。映射条目的值是 org.flowable.engine.delegate.event.FlowableEventListener 实例的列表。下面的代码片段添加了一个事件监听器到配置中，该监听器会在作业执行成功或失败时得到通知：

    <bean id="processEngineConfiguration"
        class="org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration">
        ...
        <property name="typedEventListeners">
          <map>
            <entry key="JOB_EXECUTION_SUCCESS,JOB_EXECUTION_FAILURE" >
              <list>
                <bean class="org.flowable.engine.example.MyJobEventListener" />
              </list>
            </entry>
          </map>
        </property>
    </bean>

事件分发的顺序由添加监听器的顺序决定。首先，按照列表中定义的顺序调用所有普通事件监听器（eventListeners 属性）。之后，如果分发了正确类型的事件，则调用所有类型化事件监听器（typedEventListeners 属性）。

### 在运行时添加监听器

可以使用 API（RuntimeService）向引擎添加和移除额外的事件监听器：

    /**
     * 添加一个事件监听器，它将被分发器通知所有事件。
     * @param listenerToAdd 要添加的监听器
     */
    void addEventListener(FlowableEventListener listenerToAdd);

    /**
     * 添加一个事件监听器，它只会在发生给定类型的事件时得到通知。
     * @param listenerToAdd 要添加的监听器
     * @param types 监听器应该得到通知的事件类型
     */
    void addEventListener(FlowableEventListener listenerToAdd, FlowableEventType... types);

    /**
     * 从分发器中移除给定的监听器。无论该监听器最初是为哪些类型注册的，
     * 它都不会再收到通知。
     * @param listenerToRemove 要移除的监听器
     */
     void removeEventListener(FlowableEventListener listenerToRemove);

请注意，在运行时添加的监听器**在引擎重启时不会保留**。

### 向流程定义添加监听器

可以向特定的流程定义添加监听器。这些监听器只会在与该流程定义相关的事件，以及使用该特定流程定义启动的流程实例的所有相关事件时被调用。监听器实现可以使用完全限定的类名定义，使用解析为实现监听器接口的 bean 的表达式定义，或者配置为抛出消息/信号/错误 BPMN 事件。

#### 执行用户自定义逻辑的监听器

下面的代码片段向流程定义添加了 2 个监听器。第一个监听器将接收任何类型的事件，其监听器实现基于完全限定的类名。第二个监听器仅在作业成功执行或失败时得到通知，使用的是在流程引擎配置的 beans 属性中定义的监听器。

    <process id="testEventListeners">
      <extensionElements>
        <flowable:eventListener class="org.flowable.engine.test.MyEventListener" />
        <flowable:eventListener delegateExpression="${testEventListener}" events="JOB_EXECUTION_SUCCESS,JOB_EXECUTION_FAILURE" />
      </extensionElements>

      ...

    </process>

对于与实体相关的事件，也可以向流程定义添加监听器，这些监听器只在特定实体类型发生实体事件时得到通知。下面的代码片段展示了如何实现这一点。它可以用于所有实体事件（第一个示例）或仅用于特定事件类型（第二个示例）。

    <process id="testEventListeners">
      <extensionElements>
        <flowable:eventListener class="org.flowable.engine.test.MyEventListener" entityType="task" />
        <flowable:eventListener delegateExpression="${testEventListener}" events="ENTITY_CREATED" entityType="task" />
      </extensionElements>

      ...

    </process>

entityType 支持的值包括：attachment、comment、execution、identity-link、job、process-instance、process-definition、task。

#### 抛出 BPMN 事件的监听器

处理被分发事件的另一种方式是抛出 BPMN 事件。请注意，只有在某些类型的 Flowable 事件类型中抛出 BPMN 事件才有意义。例如，当流程实例被删除时抛出 BPMN 事件将导致错误。下面的代码片段展示了如何在流程实例内抛出信号、向外部流程（全局）抛出信号、在流程实例内抛出消息事件以及在流程实例内抛出错误事件。不使用 class 或 delegateExpression，而是使用 throwEvent 属性，以及与被抛出事件类型相关的附加属性。

    <process id="testEventListeners">
      <extensionElements>
        <flowable:eventListener throwEvent="signal" signalName="My signal" events="TASK_ASSIGNED" />
      </extensionElements>
    </process>

    <process id="testEventListeners">
      <extensionElements>
        <flowable:eventListener throwEvent="globalSignal" signalName="My signal" events="TASK_ASSIGNED" />
      </extensionElements>
    </process>

    <process id="testEventListeners">
      <extensionElements>
        <flowable:eventListener throwEvent="message" messageName="My message" events="TASK_ASSIGNED" />
      </extensionElements>
    </process>

    <process id="testEventListeners">
      <extensionElements>
        <flowable:eventListener throwEvent="error" errorCode="123" events="TASK_ASSIGNED" />
      </extensionElements>
    </process>

如果需要额外的逻辑来决定是否抛出 BPMN 事件，可以扩展 Flowable 提供的监听器类。通过在子类中重写 isValidEvent(FlowableEvent event)，可以阻止 BPMN 事件的抛出。涉及的类包括 org.flowable.engine.test.api.event.SignalThrowingEventListenerTest、org.flowable.engine.impl.bpmn.helper.MessageThrowingEventListener 和 org.flowable.engine.impl.bpmn.helper.ErrorThrowingEventListener。

#### 流程定义中的监听器注意事项

-   事件监听器只能在流程元素上声明，作为 extensionElements 的子元素。监听器不能在流程中的单个活动上定义。

-   在 delegateExpression 中使用的表达式无法访问执行上下文，这与其他表达式（例如在网关中）不同。它们只能引用在流程引擎配置的 beans 属性中定义的 bean，或者在使用 Spring 时（且 beans 属性不存在时）引用实现了监听器接口的任何 spring-bean。

-   当使用监听器的 class 属性时，该类只会创建一个实例。请确保监听器实现不依赖成员字段，或者确保在多线程/上下文中安全使用。

-   当在 events 属性中使用了非法的事件类型或使用了非法的 throwEvent 值时，在部署流程定义时会抛出异常（导致部署失败）。当提供了非法的 class 或 delegateExecution 值（可能是不存在的类、不存在的 bean 引用或未实现监听器接口的委托）时，在启动流程时（或当该流程定义的第一个有效事件被分发给监听器时）会抛出异常。请确保引用的类在 classpath 中，并且表达式能解析为有效的实例。

### 通过 API 分发事件

我们通过 API 开放了事件分发机制，允许你向引擎中注册的任何监听器分发自定义事件。建议（虽然不强制）只分发类型为 CUSTOM 的 FlowableEvents。可以使用 RuntimeService 进行事件分发：

    /**
     * 将给定的事件分发给所有已注册的监听器。
     * @param event 要分发的事件。
     *
     * @throws FlowableException 当分发事件时发生异常或
     * 当 {@link FlowableEventDispatcher} 被禁用时。
     * @throws FlowableIllegalArgumentException 当给定的事件不适合分发时。
     */
     void dispatchEvent(FlowableEvent event);

### 支持的事件类型

以下列出了引擎中可能发生的所有事件类型。每种类型对应于 org.flowable.engine.common.api.delegate.event.FlowableEventType 中的一个枚举值。

<table>
<caption>支持的事件</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>事件名称</th>
<th>描述</th>
<th>事件类</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>ENGINE_CREATED</p></td>
<td><p>此监听器所附加的流程引擎已创建完成，可以进行 API 调用。</p></td>
<td><p>org.flowable...FlowableEvent</p></td>
</tr>
<tr class="even">
<td><p>ENGINE_CLOSED</p></td>
<td><p>此监听器所附加的流程引擎已关闭。无法再对引擎进行 API 调用。</p></td>
<td><p>org.flowable...FlowableEvent</p></td>
</tr>
<tr class="odd">
<td><p>ENTITY_CREATED</p></td>
<td><p>创建了新实体。新实体包含在事件中。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>ENTITY_INITIALIZED</p></td>
<td><p>新实体已创建并完全初始化。如果在创建实体过程中创建了任何子实体，此事件将在子实体创建/初始化之后触发，这与 ENTITY_CREATE 事件不同。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>ENTITY_UPDATED</p></td>
<td><p>更新了现有实体。更新后的实体包含在事件中。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>ENTITY_DELETED</p></td>
<td><p>删除了现有实体。被删除的实体包含在事件中。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>ENTITY_SUSPENDED</p></td>
<td><p>暂停了现有实体。被暂停的实体包含在事件中。将为流程定义、流程实例和任务分发此事件。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>ENTITY_ACTIVATED</p></td>
<td><p>激活了现有实体。被激活的实体包含在事件中。将为流程定义、流程实例和任务分发此事件。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>JOB_EXECUTION_SUCCESS</p></td>
<td><p>作业已成功执行。事件包含已执行的作业。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>JOB_EXECUTION_FAILURE</p></td>
<td><p>作业执行失败。事件包含已执行的作业和异常。</p></td>
<td><p>org.flowable...FlowableEntityEvent 和 org.flowable...FlowableExceptionEvent</p></td>
</tr>
<tr class="odd">
<td><p>JOB_RETRIES_DECREMENTED</p></td>
<td><p>由于作业失败，作业重试次数已减少。事件包含已更新的作业。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>TIMER_SCHEDULED</p></td>
<td><p>已创建定时器作业并计划在将来某个时间点执行。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>TIMER_FIRED</p></td>
<td><p>定时器已触发。事件包含已执行的作业。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>JOB_CANCELED</p></td>
<td><p>作业已取消。事件包含已取消的作业。作业可以通过 API 调用取消，任务完成并且相关的边界定时器被取消，或在新的流程定义部署时取消。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>ACTIVITY_STARTED</p></td>
<td><p>活动开始执行</p></td>
<td><p>org.flowable...FlowableActivityEvent</p></td>
</tr>
<tr class="even">
<td><p>ACTIVITY_COMPLETED</p></td>
<td><p>活动已成功完成</p></td>
<td><p>org.flowable...FlowableActivityEvent</p></td>
</tr>
<tr class="odd">
<td><p>ACTIVITY_CANCELLED</p></td>
<td><p>一个活动即将被取消。活动取消可能有三种原因(MessageEventSubscriptionEntity、SignalEventSubscriptionEntity、TimerEntity)。</p></td>
<td><p>org.flowable...FlowableActivityCancelledEvent</p></td>
</tr>
<tr class="even">
<td><p>ACTIVITY_SIGNALED</p></td>
<td><p>一个活动接收到了信号</p></td>
<td><p>org.flowable...FlowableSignalEvent</p></td>
</tr>
<tr class="odd">
<td><p>ACTIVITY_MESSAGE_RECEIVED</p></td>
<td><p>一个活动接收到了消息。在活动接收消息之前分发。接收后，将根据类型(边界事件或事件子流程启动事件)为该活动分发 ACTIVITY_SIGNAL 或 ACTIVITY_STARTED 事件</p></td>
<td><p>org.flowable...FlowableMessageEvent</p></td>
</tr>
<tr class="even">
<td><p>ACTIVITY_MESSAGE_WAITING</p></td>
<td><p>一个活动已创建消息事件订阅并正在等待接收。</p></td>
<td><p>org.flowable...FlowableMessageEvent</p></td>
</tr>
<tr class="odd">
<td><p>ACTIVITY_MESSAGE_CANCELLED</p></td>
<td><p>一个已创建消息事件订阅的活动被取消，因此接收消息将不再触发这个特定的消息。</p></td>
<td><p>org.flowable...FlowableMessageEvent</p></td>
</tr>
<tr class="even">
<td><p>ACTIVITY_ERROR_RECEIVED</p></td>
<td><p>一个活动接收到了错误事件。在活动实际处理错误之前分发。事件的 activityId 包含对错误处理活动的引用。如果错误成功传递，此事件将被 ACTIVITY_SIGNALLED 事件或相关活动的 ACTIVITY_COMPLETE 事件跟随。</p></td>
<td><p>org.flowable...FlowableErrorEvent</p></td>
</tr>
<tr class="odd">
<td><p>UNCAUGHT_BPMN_ERROR</p></td>
<td><p>抛出了一个未捕获的 BPMN 错误。流程没有任何处理程序来处理该特定错误。事件的 activityId 将为空。</p></td>
<td><p>org.flowable...FlowableErrorEvent</p></td>
</tr>
<tr class="even">
<td><p>ACTIVITY_COMPENSATE</p></td>
<td><p>一个活动即将被补偿。事件包含将要执行补偿的活动的 id。</p></td>
<td><p>org.flowable...FlowableActivityEvent</p></td>
</tr>
<tr class="odd">
<td><p>MULTI_INSTANCE_ACTIVITY_STARTED</p></td>
<td><p>一个多实例活动开始执行</p></td>
<td><p>org.flowable...FlowableMultiInstanceActivityEvent</p></td>
</tr>
<tr class="even">
<td><p>MULTI_INSTANCE_ACTIVITY_COMPLETED</p></td>
<td><p>一个多实例活动成功完成</p></td>
<td><p>org.flowable...FlowableMultiInstanceActivityEvent</p></td>
</tr>
<tr class="odd">
<td><p>MULTI_INSTANCE_ACTIVITY_CANCELLED</p></td>
<td><p>一个多实例活动即将被取消。活动取消可能有三种原因(MessageEventSubscriptionEntity、SignalEventSubscriptionEntity、TimerEntity)。</p></td>
<td><p>org.flowable...FlowableMultiInstanceActivityCancelledEvent</p></td>
</tr>
<tr class="even">
<td><p>VARIABLE_CREATED</p></td>
<td><p>一个变量已被创建。事件包含变量名称、值以及相关的执行和任务(如果有)。</p></td>
<td><p>org.flowable...FlowableVariableEvent</p></td>
</tr>
<tr class="odd">
<td><p>VARIABLE_UPDATED</p></td>
<td><p>一个已存在的变量已被更新。事件包含变量名称、更新后的值以及相关的执行和任务(如果有)。</p></td>
<td><p>org.flowable...FlowableVariableEvent</p></td>
</tr>
<tr class="even">
<td><p>VARIABLE_DELETED</p></td>
<td><p>一个已存在的变量已被删除。事件包含变量名称、最后已知的值以及相关的执行和任务(如果有)。</p></td>
<td><p>org.flowable...FlowableVariableEvent</p></td>
</tr>
<tr class="odd">
<td><p>TASK_ASSIGNED</p></td>
<td><p>一个任务已被分配给用户。事件包含该任务。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>TASK_CREATED</p></td>
<td><p>一个任务已被创建。这在 ENTITY_CREATE 事件之后分发。如果任务是流程的一部分，此事件将在任务监听器执行之前触发。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>TASK_COMPLETED</p></td>
<td><p>一个任务已完成。这在 ENTITY_DELETE 事件之前分发。如果任务是流程的一部分，此事件将在流程继续之前触发，并且之后会跟随一个 ACTIVITY_COMPLETE 事件，目标是代表已完成任务的活动。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>TASK_OWNER_CHANGED</p></td>
<td><p>一个任务的所有者已更改。这在 ENTITY_UPDATE 事件之前分发。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>TASK_PRIORITY_CHANGED</p></td>
<td><p>一个任务的优先级已更改。这在 ENTITY_UPDATE 事件之前分发。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>TASK_DUEDATE_CHANGED</p></td>
<td><p>一个任务的到期日期已更改。这在 ENTITY_UPDATE 事件之前分发。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>TASK_NAME_CHANGED</p></td>
<td><p>一个任务的名称已更改。这在 ENTITY_UPDATE 事件之前分发。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>PROCESS_CREATED</p></td>
<td><p>一个流程实例已被创建。所有基本属性都已设置，但变量尚未设置。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>PROCESS_STARTED</p></td>
<td><p>一个流程实例已启动。在启动先前创建的流程实例时分发。PROCESS_STARTED 事件在关联的 ENTITY_INITIALIZED 事件之后以及变量设置之后分发。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="even">
<td><p>PROCESS_COMPLETED</p></td>
<td><p>一个流程已完成，这意味着流程实例的所有执行都已停止。在最后一个活动的 ACTIVITY_COMPLETED 事件之后分发。当流程实例达到没有任何可进行的转换的状态时，流程就完成了。</p></td>
<td><p>org.flowable...FlowableEntityEvent</p></td>
</tr>
<tr class="odd">
<td><p>PROCESS_COMPLETED_WITH_TERMINATE_END_EVENT</p></td>
<td><p>一个流程通过到达终止结束事件而完成。</p></td>
<td><p>org.flowable...FlowableProcessTerminatedEvent</p></td>
</tr>
<tr class="even">
<td><p>PROCESS_CANCELLED</p></td>
<td><p>一个流程已被取消。在流程实例从运行时删除之前分发。例如，流程实例可以通过 API 调用 RuntimeService.deleteProcessInstance 取消，也可以通过调用活动上的中断边界事件取消，等等。</p></td>
<td><p>org.flowable...FlowableCancelledEvent</p></td>
</tr>
<tr class="odd">
<td><p>MEMBERSHIP_CREATED</p></td>
<td><p>一个用户已被添加到组中。事件包含涉及的用户和组的 ID。</p></td>
<td><p>org.flowable...FlowableMembershipEvent</p></td>
</tr>
<tr class="even">
<td><p>MEMBERSHIP_DELETED</p></td>
<td><p>一个用户已从组中移除。事件包含涉及的用户和组的 ID。</p></td>
<td><p>org.flowable...FlowableMembershipEvent</p></td>
</tr>
<tr class="odd">
<td><p>MEMBERSHIPS_DELETED</p></td>
<td><p>所有成员将从组中移除。事件在成员被移除之前抛出，因此它们仍然可以访问。出于性能考虑，如果一次删除所有成员，则不会抛出单独的 MEMBERSHIP_DELETED 事件。</p></td>
<td><p>org.flowable...FlowableMembershipEvent</p></td>
</tr>
</tbody>
</table>
所有 ENTITY\_\* 事件都与引擎内部的实体相关。以下列表展示了各种实体事件分发给哪些实体的概述：

-   **ENTITY\_CREATED, ENTITY\_INITIALIZED, ENTITY\_DELETED**：附件（Attachment）、评论（Comment）、部署（Deployment）、执行（Execution）、组（Group）、身份链接（IdentityLink）、作业（Job）、模型（Model）、流程定义（ProcessDefinition）、流程实例（ProcessInstance）、任务（Task）、用户（User）。

-   **ENTITY\_UPDATED**：附件（Attachment）、部署（Deployment）、执行（Execution）、组（Group）、身份链接（IdentityLink）、作业（Job）、模型（Model）、流程定义（ProcessDefinition）、流程实例（ProcessInstance）、任务（Task）、用户（User）。

-   **ENTITY\_SUSPENDED, ENTITY\_ACTIVATED**：流程定义（ProcessDefinition）、流程实例/执行（ProcessInstance/Execution）、任务（Task）。

### 补充说明

**监听器只会收到来自其注册的引擎所分发的事件。** 因此，如果你有多个引擎（即使它们运行在同一个数据库上），监听器只会收到来自其注册引擎的事件。其他引擎中发生的事件不会分发给这些监听器，无论它们是否运行在同一个 JVM 中。

某些事件类型（与实体相关的）会暴露目标实体。根据事件的类型，这些实体可能无法再被更新（例如，当实体被删除时）。如果可能的话，请使用事件暴露的 EngineServices 来安全地与引擎交互。即便如此，对于涉及分发事件的实体的更新/操作时也需要谨慎。

没有与历史相关的实体事件被分发，因为它们都有运行时对应项来分发它们的事件。