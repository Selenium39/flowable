---
id: ch02-Configuration
title: 配置
description: 本文档详细介绍如何配置Flowable事件注册引擎，包括XML配置方法和编程创建方式，帮助开发者快速搭建和管理事件注册表系统。
keywords: Flowable,事件注册表,引擎配置,XML配置,Spring集成,编程创建,数据库设置
---

## 创建事件注册引擎

*Flowable 事件注册引擎的结构与 Flowable 流程引擎非常相似。因此，文档的某些部分与其流程引擎对应部分非常相似。*

Flowable 事件注册引擎通过名为 flowable.eventregistry.cfg.xml 的 XML 文件进行配置。注意，如果你使用[Spring 风格构建事件注册引擎](eventregistry/ch04-Spring.md#spring-integration)，这**不**适用。

获取 EventRegistryEngine 最简单的方法是使用 org.flowable.eventregistry.engine.EventRegistryEngines 类：

    EventRegistryEngine eventRegistryEngine = EventRegistryEngines.getDefaultEventRegistryEngine()

这将在类路径中查找 flowable.eventregistry.cfg.xml 文件，并根据该文件中的配置构建引擎。以下代码片段显示了一个配置示例。接下来的章节将详细介绍配置属性。

    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

      <bean id="eventRegistryEngineConfiguration" class="org.flowable.eventregistry.impl.cfg.StandaloneEventRegistryEngineConfiguration">

        <property name="jdbcUrl" value="jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000" />
        <property name="jdbcDriver" value="org.h2.Driver" />
        <property name="jdbcUsername" value="sa" />
        <property name="jdbcPassword" value="" />

        <property name="databaseSchemaUpdate" value="true" />

        <property name="strictMode" value="false"/>

      </bean>

    </beans>

请注意，配置 XML 实际上是一个 Spring 配置。**这并不意味着 Flowable 事件注册引擎只能在 Spring 环境中使用！**我们只是在内部利用 Spring 的解析和依赖注入功能来构建引擎。

EventRegistryEngineConfiguration 对象也可以使用配置文件以编程方式创建。也可以使用不同的 bean ID（例如，参见第 3 行）。

    EventRegistryEngineConfiguration.
      createEventRegistryEngineConfigurationFromResourceDefault();
      createEventRegistryEngineConfigurationFromResource(String resource);
      createEventRegistryEngineConfigurationFromResource(String resource, String beanName);
      createEventRegistryEngineConfigurationFromInputStream(InputStream inputStream);
      createEventRegistryEngineConfigurationFromInputStream(InputStream inputStream, String beanName);

也可以不使用配置文件，而是基于默认值创建配置（有关更多信息，请参见[支持的不同类](eventregistry/ch02-Configuration.md#plug-into-process-engine)）。

    EventRegistryEngineConfiguration.createStandaloneEventRegistryEngineConfiguration();
    EventRegistryEngineConfiguration.createStandaloneInMemEventRegistryEngineConfiguration();

所有这些 EventRegistryEngineConfiguration.createXXX() 方法都会返回一个可以根据需要进一步调整的 EventRegistryEngineConfiguration。调用 buildEventRegistryEngine() 操作后，将创建一个 EventRegistryEngine：

    EventRegistryEngine eventRegistryEngine = EventRegistryEngineConfiguration.createStandaloneInMemEventRegistryEngineConfiguration()
        .setDatabaseSchemaUpdate(EventRegistryEngineConfiguration.DB_SCHEMA_UPDATE_FALSE)
        .setJdbcUrl("jdbc:h2:mem:my-own-db;DB_CLOSE_DELAY=1000")
        .buildEventRegistryEngine();

## EventRegistryEngineConfiguration bean

flowable.eventregistry.cfg.xml 必须包含一个 ID 为 'eventRegistryEngineConfiguration' 的 bean。

     <bean id="eventRegistryEngineConfiguration" class="org.flowable.eventregistry.impl.cfg.StandaloneEventRegistryEngineConfiguration">

该 bean 用于构建 EventRegistryEngine。有多个可用的类可以用来定义 eventRegistryEngineConfiguration。这些类代表不同的环境，并相应地设置默认值。最佳实践是选择最接近你的环境的类，以最小化配置引擎所需的属性数量。目前可用的类如下：

-   **org.flowable.eventregistry.impl.cfg.StandaloneEventRegistryEngineConfiguration**：事件注册引擎以独立方式使用。Flowable 将负责事务处理。默认情况下，只有在引擎启动时才会检查数据库（如果没有 Flowable 事件注册表架构或架构版本不正确，则会抛出异常）。

-   **org.flowable.eventregistry.impl.cfg.StandaloneInMemEventRegistryEngineConfiguration**：这是一个用于单元测试的便利类。Flowable 事件注册表将负责事务处理。默认使用 H2 内存数据库。数据库将在引擎启动时创建，在关闭时删除。使用此类时，可能不需要额外配置。

-   **org.flowable.eventregistry.spring.SpringEventRegistryEngineConfiguration**：当在 Spring 环境中使用事件注册引擎时使用。更多信息请参见[Spring 集成部分](eventregistry/ch04-Spring.md#spring-integration)。

## 集成到流程引擎

启动流程引擎时会自动启动事件注册表。因此，如果已经在使用流程引擎，则不需要额外配置来启动事件注册表。
流程引擎使用默认的 EventRegistryEngineConfigurator 来启动事件注册表。可以通过在流程引擎配置中设置 eventRegistryConfigurator 来覆盖此默认配置器。

也可以使用 disableEventRegistry 属性在流程引擎配置中禁用事件注册表。

## 数据库配置

有两种方式可以配置 Flowable 事件注册引擎将使用的数据库。第一个选项是定义数据库的 JDBC 属性：

-   **jdbcUrl**：数据库的 JDBC URL。

-   **jdbcDriver**：特定数据库类型的驱动程序实现。

-   **jdbcUsername**：连接数据库的用户名。

-   **jdbcPassword**：连接数据库的密码。

基于提供的 JDBC 属性构建的数据源将具有默认的 [MyBatis](http://www.mybatis.org/) 连接池设置。可以选择设置以下属性来调整该连接池（来自 MyBatis 文档）：

-   **jdbcMaxActiveConnections**：连接池在任何时候可以包含的最大活动连接数。默认值为 10。

-   **jdbcMaxIdleConnections**：连接池在任何时候可以包含的最大空闲连接数。

-   **jdbcMaxCheckoutTime**：连接在被强制返回之前可以从连接池中"检出"的时间（以毫秒为单位）。默认值为 20000（20 秒）。

-   **jdbcMaxWaitTime**：这是一个低级设置，当获取连接异常耗时时，它使池有机会打印日志状态并重新尝试获取连接（如果池配置错误，可以避免永远静默失败）。默认值为 20000（20 秒）。

数据库配置示例：

    <property name="jdbcUrl" value="jdbc:h2:mem:flowable_event;DB_CLOSE_DELAY=1000" />
    <property name="jdbcDriver" value="org.h2.Driver" />
    <property name="jdbcUsername" value="sa" />
    <property name="jdbcPassword" value="" />

我们的基准测试表明，在处理大量并发请求时，MyBatis 连接池并不是最高效或最稳定的。因此，建议使用 javax.sql.DataSource 实现（如 HikariCP、Tomcat JDBC Connection Pool 等）并将其注入到事件注册引擎配置中：

    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource" >
      <property name="driverClassName" value="com.mysql.jdbc.Driver" />
      <property name="url" value="jdbc:mysql://localhost:3306/flowable_event" />
      <property name="username" value="flowable" />
      <property name="password" value="flowable" />
      <property name="defaultAutoCommit" value="false" />
    </bean>

    <bean id="eventRegistryEngineConfiguration" class="org.flowable.eventregistry.impl.cfg.StandaloneEventRegistryEngineConfiguration">

        <property name="dataSource" ref="dataSource" />
        ...

请注意，Flowable 事件注册表不附带允许你定义此类数据源的库。因此，你必须确保这些库在你的类路径中。

无论你使用的是 JDBC 还是数据源方法，都可以设置以下属性：

-   **databaseType**：通常不需要指定此属性，因为它会从数据库连接元数据中自动检测。只有在自动检测失败的情况下才需要指定。可能的值：{h2, mysql, oracle, postgres, mssql, db2}。此设置将决定使用哪些创建/删除脚本和查询。有关支持的类型概述，请参见[支持的数据库部分](eventregistry/ch02-Configuration.md#supported-databases)。

-   **databaseSchemaUpdate**：允许你设置在流程引擎启动和关闭时处理数据库架构的策略。

    -   false（默认值）：在创建事件注册引擎时检查数据库架构版本是否与库匹配，如果版本不匹配则抛出异常。

    -   true：在构建事件注册引擎时，执行检查，如果需要则更新架构。如果架构不存在，则创建它。

    -   create-drop：在创建事件注册引擎时创建架构，在关闭事件注册引擎时删除架构。

## JNDI 数据源配置

默认情况下，Flowable 事件注册表的数据库配置包含在每个 Web 应用程序的 WEB-INF/classes 中的 db.properties 文件中。这并不总是理想的，因为它要求用户要么修改 Flowable 源代码中的 db.properties 并重新编译 WAR 文件，要么在每次部署时解压 WAR 并修改 db.properties。

通过使用 JNDI（Java 命名和目录接口）获取数据库连接，连接完全由 Servlet 容器管理，配置可以在 war 部署之外管理。这也比 db.properties 文件提供了更多的连接参数控制。

### 配置

JNDI 数据源的配置会根据你使用的 servlet 容器应用程序而有所不同。以下说明适用于 Tomcat，但对于其他容器应用程序，请参考你的容器应用程序文档。

如果使用 Tomcat，JNDI 资源在 $CATALINA\_BASE/conf/\[enginename\]/\[hostname\]/\[warname\].xml 中配置（对于 Flowable UI，通常是 $CATALINA\_BASE/conf/Catalina/localhost/flowable-app.xml）。首次部署应用程序时，默认上下文会从 Flowable WAR 文件中复制，因此如果它已经存在，你需要替换它。例如，要更改 JNDI 资源以使应用程序连接到 MySQL 而不是 H2，请将文件更改为以下内容：
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

要配置 JNDI 数据源，请在 Flowable UI 的属性文件中使用以下属性：

-   spring.datasource.jndi-name=：数据源的 JNDI 名称。

-   datasource.jndi.resourceRef：设置查找是否在 J2EE 容器中进行，换句话说，如果 JNDI 名称尚未包含前缀 "java:comp/env/"，则需要添加该前缀。默认值为 "true"。

### 自定义属性

系统属性也可以在 flowable.eventregistry.cfg.xml 中使用，格式为 `${propertyName:defaultValue}`。

    <property name="jdbcUrl" value="${jdbc.url:jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000}" />
    <property name="jdbcDriver" value="${jdbc.driver:org.h2.Driver}" />
    <property name="jdbcUsername" value="${jdbc.username:sa}" />
    <property name="jdbcPassword" value="${jdbc.password:}" />

使用此配置时，如果 `jdbc.url` 属性可用，则它将用作 `EventRegistryEngineConfiguration` 的 `jdbcUrl`。
否则，将使用第一个 `:` 后面的值。

还可以使用 org.springframework.beans.factory.config.PropertyPlaceholderConfigurer 类型的 bean 来定义从系统中获取属性的位置。

自定义属性位置的配置示例：

    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

      <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="location" value="file:/opt/conf/flowable.properties" />
      </bean>

      <bean id="eventRegistryEngineConfiguration" class="org.flowable.eventregistry.impl.cfg.StandaloneEventRegistryEngineConfiguration">

        <property name="jdbcUrl" value="${jdbc.url:jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000}" />
        <property name="jdbcDriver" value="${jdbc.driver:org.h2.Driver}" />
        <property name="jdbcUsername" value="${jdbc.username:sa}" />
        <property name="jdbcPassword" value="${jdbc.password:}" />

        <property name="databaseSchemaUpdate" value="true" />

      </bean>

    </beans>

使用此配置时，系统会首先在 /opt/conf/flowable.properties 文件中查找属性。

## 支持的数据库

以下列出了 Flowable 用于引用数据库的类型（区分大小写！）。

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>Flowable 事件注册表数据库类型</th>
<th>JDBC URL 示例</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>h2</p></td>
<td><p>jdbc:h2:tcp://localhost/flowable_event</p></td>
<td><p>默认配置的数据库</p></td>
</tr>
<tr class="even">
<td><p>mysql</p></td>
<td><p>jdbc:mysql://localhost:3306/flowable_event?autoReconnect=true</p></td>
<td><p>使用 mysql-connector-java 数据库驱动程序测试</p></td>
</tr>
<tr class="odd">
<td><p>oracle</p></td>
<td><p>jdbc:oracle:thin:@localhost:1521:xe</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>postgres</p></td>
<td><p>jdbc:postgresql://localhost:5432/flowable_event</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>db2</p></td>
<td><p>jdbc:db2://localhost:50000/flowable_event</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>mssql</p></td>
<td><p>jdbc:sqlserver://localhost:1433;databaseName=flowable_event (jdbc.driver=com.microsoft.sqlserver.jdbc.SQLServerDriver) <em>或</em> jdbc:jtds:sqlserver://localhost:1433/flowable_event (jdbc.driver=net.sourceforge.jtds.jdbc.Driver)</p></td>
<td><p>使用 Microsoft JDBC Driver 4.0 (sqljdbc4.jar) 和 JTDS Driver 测试</p></td>
</tr>
</tbody>
</table>

## 创建数据库表

Flowable 事件注册表使用 [Liquibase](http://www.liquibase.org) 来跟踪、管理和应用数据库架构更改。

为你的数据库创建数据库表最简单的方法是：

-   将 flowable-event-registry JAR 添加到你的类路径中

-   添加合适的数据库驱动程序

-   将 Flowable 配置文件（*flowable.eventregistry.cfg.xml*）添加到你的类路径中，指向你的数据库（参见[数据库配置部分](eventregistry/ch02-Configuration.md#database-configuration)）

-   执行 *DbSchemaCreate* 类的 main 方法

## 数据库表名说明

Flowable 事件注册表的数据库名称都以 **FLW\_EVENT\_** 或 **FLW\_CHANNEL\_** 开头。

-   FLW\_EVENT\_DATABASECHANGELOG：此表由 Liquibase 用于跟踪已运行的变更集。

-   FLW\_EVENT\_DATABASECHANGELOGLOCK：此表由 Liquibase 用于确保同一时间只运行一个 Liquibase 实例。

-   FLW\_EVENT\_DEFINITION：此表包含已部署事件定义的元数据。

-   FLW\_CHANNEL\_DEFINITION：此表包含已部署通道定义的元数据。

-   FLW\_EVENT\_DEPLOYMENT：此表包含部署元数据。

-   FLW\_EVENT\_RESOURCE：此表包含事件注册表定义资源和元数据。

## 数据库升级

在运行升级之前，请确保备份你的数据库（使用数据库的备份功能）。

默认情况下，每次创建事件注册引擎时都会执行版本检查。这通常在应用程序或 Flowable Web 应用程序启动时发生一次。如果 Flowable 库发现库版本与 Flowable 数据库表版本之间存在差异，则会抛出异常。

要升级，你需要首先在 flowable.dmn.cfg.xml 配置文件中添加以下配置属性：

    <beans >

      <bean id="eventRegistryEngineConfiguration" class="org.flowable.eventregistry.impl.cfg.StandaloneEventRegistryEngineConfiguration">
        <!-- ... -->
        <property name="databaseSchemaUpdate" value="true" />
        <!-- ... -->
      </bean>

    </beans>

**另外，请在类路径中包含适合你数据库的数据库驱动程序。**升级应用程序中的 Flowable 事件注册表库。或者启动新版本的 Flowable 事件注册表，并将其指向包含旧版本的数据库。将 databaseSchemaUpdate 设置为 true 后，当 Flowable 事件注册表首次发现库和数据库架构不同步时，它将自动将数据库架构升级到较新的版本。

## 部署缓存配置

所有事件和通道定义在解析后都会被缓存，这是为了避免每次需要这些定义时都访问数据库，而且这些定义不会改变。默认情况下，此缓存没有限制。要限制事件定义缓存，请添加以下属性：

    <property name="eventDefinitionCacheLimit" value="10" />

设置此属性将使用具有指定硬限制的 LRU 缓存替换默认的 hashmap 缓存。当然，此属性的最佳值取决于存储的事件定义总量和运行时实际使用的事件定义数量。

你还可以注入自己的缓存实现。这必须是实现 org.flowable.common.engine.impl.persistence.deploy.DeploymentCache 接口的 bean：

    <property name="eventDefinitionCache">
      <bean class="org.flowable.MyCache" />
    </property>

通道定义缓存不能配置限制，因为所有活动的通道定义都需要在缓存中可用。

## 日志记录

所有日志（flowable、spring、mybatis 等）都通过 SLF4J 路由，并允许你选择自己喜欢的日志实现。

**默认情况下，flowable-engine 依赖项中不包含 SLF4J-binding JAR；为了使用你选择的日志框架，需要在你的项目中添加它。**如果没有添加实现 JAR，SLF4J 将使用 NOP-logger，除了一个警告说明没有任何内容会被记录外，不会记录任何内容。有关这些绑定的更多信息，请参见 [<http://www.slf4j.org/codes.html#StaticLoggerBinder>](http://www.slf4j.org/codes.html#StaticLoggerBinder)。

例如，使用 Maven 时，添加这样的依赖（这里使用 log4j），注意你仍然需要添加版本：

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-log4j12</artifactId>
    </dependency>

flowable-rest webapp 配置为使用 Log4j-binding。在运行所有 flowable-* 模块的测试时也使用 Log4j。

**在类路径中使用带有 commons-logging 的容器时的重要说明：**为了通过 SLF4J 路由 spring-logging，使用了一个桥接器（参见 [<http://www.slf4j.org/legacy.html#jclOverSLF4J>](http://www.slf4j.org/legacy.html#jclOverSLF4J)）。如果你的容器提供了 commons-logging 实现，请按照此页面上的说明操作：[<http://www.slf4j.org/codes.html#release>](http://www.slf4j.org/codes.html#release) 以确保稳定性。

使用 Maven 时的示例（省略版本）：

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>jcl-over-slf4j</artifactId>
    </dependency>