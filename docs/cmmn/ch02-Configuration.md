---
id: ch02-Configuration
title: 配置
description: 本文档详细介绍如何通过flowable.cmmn.cfg.xml配置文件或编程方式创建和配置Flowable CMMN引擎，包含Spring集成注意事项及多种初始化方法示例。
keywords: Flowable,CMMN,流程引擎配置,XML配置,Spring集成,编程配置,数据库连接,Standalone模式
---

## 创建 CmmnEngine

Flowable CMMN 引擎通过一个名为 flowable.cmmn.cfg.xml 的 XML 文件进行配置。注意,如果你使用[Spring 风格构建流程引擎](cmmn/ch04-Spring.md#spring-integration),这种方式**不适用**。

获取 CmmnEngine 最简单的方法是使用 org.flowable.cmmn.engine.CmmnEngineConfiguration 类:

    CmmnEngine cmmnEngine = CmmnEngineConfiguration.createStandaloneCmmnEngineConfiguration();

这将在类路径中查找 flowable.cmmn.cfg.xml 文件,并基于该文件中的配置构建引擎。以下代码片段展示了一个配置示例。后续章节将详细介绍配置属性。

    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

      <bean id="cmmnEngineConfiguration" class="org.flowable.cmmn.engine.CmmnEngineConfiguration">

        <property name="jdbcUrl" value="jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000" />
        <property name="jdbcDriver" value="org.h2.Driver" />
        <property name="jdbcUsername" value="sa" />
        <property name="jdbcPassword" value="" />

        <property name="databaseSchemaUpdate" value="true" />
      </bean>

    </beans>

注意,配置 XML 实际上是一个 Spring 配置。**这并不意味着 Flowable 只能在 Spring 环境中使用!** 我们只是在内部利用 Spring 的解析和依赖注入功能来构建引擎。

CmmnEngineConfiguration 对象也可以通过编程方式使用配置文件创建。也可以使用不同的 bean id(例如,参见第 3 行)。

    CmmnEngineConfiguration.
      createCmmnEngineConfigurationFromResourceDefault();
      createCmmnEngineConfigurationFromResource(String resource);
      createCmmnEngineConfigurationFromResource(String resource, String beanName);
      createCmmnEngineConfigurationFromInputStream(InputStream inputStream);
      createCmmnEngineConfigurationFromInputStream(InputStream inputStream, String beanName);

也可以不使用配置文件,而是基于默认值创建配置(有关更多信息,请参见[不同支持的类](#configurationClasses))。

    CmmnEngineConfiguration.createStandaloneCmmnEngineConfiguration();
    CmmnEngineConfiguration.createStandaloneInMemCmmnEngineConfiguration();

所有这些 CmmnEngineConfiguration.createXXX() 方法都会返回一个可以根据需要进一步调整的 CmmnEngineConfiguration。调用 buildCmmnEngine() 操作后,将创建一个 CmmnEngine:

    CmmnEngine cmmnEngine = CmmnEngineConfiguration.createStandaloneInMemCmmnEngineConfiguration()
      .setDatabaseSchemaUpdate(CmmnEngineConfiguration.DB_SCHEMA_UPDATE_TRUE)
      .setJdbcUrl("jdbc:h2:mem:my-own-db;DB_CLOSE_DELAY=1000")
      .buildCmmnEngine();

## CmmnEngineConfiguration bean

flowable.cmmn.cfg.xml 必须包含一个 id 为 'cmmnEngineConfiguration' 的 bean。

     <bean id="cmmnEngineConfiguration" class="org.flowable.cmmn.engine.CmmnEngineConfiguration">

该 bean 用于构建 CmmnEngine。有多个可用的类可以用来定义 cmmnEngineConfiguration。这些类代表不同的环境,并相应地设置默认值。最佳实践是选择最适合你的环境的类,以最小化配置引擎所需的属性数量。目前可用的类如下:
<a name="configurationClasses"></a>

-   **org.flowable.cmmn.engine.impl.cfg.StandaloneInMemCmmnEngineConfiguration**: 这是一个用于单元测试的便利类。Flowable 将处理所有事务。默认使用 H2 内存数据库。数据库将在引擎启动时创建,在关闭时删除。使用此类时,可能不需要额外配置。

-   **org.flowable.cmmn.spring.SpringCmmnEngineConfiguration**: 在 Spring 环境中使用 CMMN 引擎时使用。更多信息请参见[Spring 集成部分](cmmn/ch04-Spring.md#spring-integration)。

## 数据库配置

有两种方式可以配置 Flowable CMMN 引擎将使用的数据库。第一个选项是定义数据库的 JDBC 属性:

-   **jdbcUrl**: 数据库的 JDBC URL。

-   **jdbcDriver**: 特定数据库类型的驱动程序实现。

-   **jdbcUsername**: 连接数据库的用户名。

-   **jdbcPassword**: 连接数据库的密码。

基于提供的 JDBC 属性构建的数据源将使用默认的 [MyBatis](http://www.mybatis.org/) 连接池设置。可以选择设置以下属性来调整该连接池(来自 MyBatis 文档):

-   **jdbcMaxActiveConnections**: 任何给定时间存在的活动(即正在使用的)连接数。默认值为 10。

-   **jdbcMaxIdleConnections**: 任何给定时间存在的空闲连接数。

-   **jdbcMaxCheckoutTime**: 连接可以从连接池中"签出"的时间(以毫秒为单位),超过该时间将被强制返回。默认值为 20000(20 秒)。

-   **jdbcMaxWaitTime**: 这是一个低级设置,当获取连接花费异常长时间时,它使连接池有机会打印日志状态并重新尝试获取连接(以避免在连接池配置错误时永远静默失败)。默认值为 20000(20 秒)。

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

    <bean id="cmmnEngineConfiguration" class="org.flowable.cmmn.engine.CmmnEngineConfiguration">

      <property name="dataSource" ref="dataSource" />
      ...

注意,Flowable 不提供允许你定义此类数据源的库。因此,你需要确保这些库在你的类路径中。

无论你使用 JDBC 还是数据源方法,都可以设置以下属性:

-   **databaseType**: 通常不需要指定此属性,因为它是从数据库连接元数据自动检测的。只有在自动检测失败时才需要指定。可能的值:{h2, mysql, oracle, postgres, mssql, db2}。此设置将决定使用哪些创建/删除脚本和查询。有关支持的类型的概述,请参见[支持的数据库部分](cmmn/ch02-Configuration.md#supported-databases)。

-   **databaseSchemaUpdate**: 设置在流程引擎启动和关闭时处理数据库架构的策略。

    -   false(默认值): 在创建流程引擎时检查数据库架构版本与库的版本,如果版本不匹配则抛出异常。

    -   true: 在构建流程引擎时,执行检查,如果需要则更新架构。如果架构不存在,则创建它。

    -   create-drop: 在创建流程引擎时创建架构,在关闭流程引擎时删除架构。

## JNDI 数据源配置

默认情况下,Flowable 的数据库配置包含在每个 Web 应用程序的 WEB-INF/classes 中的 db.properties 文件中。这并不总是理想的,因为它要求用户要么修改 Flowable 源代码中的 db.properties 并重新编译 WAR 文件,要么解压 WAR 文件并在每次部署时修改 db.properties。

通过使用 JNDI(Java 命名和目录接口)获取数据库连接,连接完全由 Servlet 容器管理,配置可以在 WAR 部署之外管理。这也比 db.properties 文件提供的连接参数具有更多的控制权。

### 配置

JNDI 数据源的配置会根据你使用的 servlet 容器应用程序而有所不同。以下说明适用于 Tomcat,但对于其他容器应用程序,请参阅容器应用程序的文档。

如果使用 Tomcat,JNDI 资源在 $CATALINA_BASE/conf/[enginename]/[hostname]/[warname].xml 中配置(对于 Flowable UI,通常是 $CATALINA_BASE/conf/Catalina/localhost/flowable-app.xml)。首次部署应用程序时,默认上下文从 Flowable WAR 文件中复制,因此如果它已经存在,你需要替换它。例如,要更改 JNDI 资源使应用程序连接到 MySQL 而不是 H2,请将文件更改为以下内容:

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

系统属性也可以在 flowable.cmmn.cfg.xml 中使用,格式为 `${propertyName:defaultValue}`。

    <property name="jdbcUrl" value="${jdbc.url:jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000}" />
    <property name="jdbcDriver" value="${jdbc.driver:org.h2.Driver}" />
    <property name="jdbcUsername" value="${jdbc.username:sa}" />
    <property name="jdbcPassword" value="${jdbc.password:}" />

使用此配置时,如果属性 `jdbc.url` 可用,则会用于 `CmmnEngineConfiguration` 的 `jdbcUrl`。
否则将使用第一个 `:` 后面的值。

也可以通过使用 org.springframework.beans.factory.config.PropertyPlaceholderConfigurer 类型的 bean 来定义从系统中获取属性的位置。

自定义属性位置的配置示例

    <beans xmlns="http://www.springframework.org/schema/beans"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

      <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
        <property name="location" value="file:/opt/conf/flowable.properties" />
      </bean>

      <bean id="cmmnEngineConfiguration" class="org.flowable.cmmn.engine.CmmnEngineConfiguration">

        <property name="jdbcUrl" value="${jdbc.url:jdbc:h2:mem:flowable;DB_CLOSE_DELAY=1000}" />
        <property name="jdbcDriver" value="${jdbc.driver:org.h2.Driver}" />
        <property name="jdbcUsername" value="${jdbc.username:sa}" />
        <property name="jdbcPassword" value="${jdbc.password:}" />

        <property name="databaseSchemaUpdate" value="true" />
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
<td><p>使用 Microsoft JDBC Driver 4.0 (sqljdbc4.jar) 和 JTDS Driver 测试</p></td>
</tr>
</tbody>
</table>

## 创建数据库表

为数据库创建数据库表最简单的方法是:

-   将 flowable-cmmn-engine JAR 添加到类路径中

-   添加合适的数据库驱动程序

-   将 Flowable 配置文件(*flowable.cmmn.cfg.xml*)添加到类路径中,指向你的数据库(参见[数据库配置部分](cmmn/ch02-Configuration.md#database-configuration))

-   执行 *DbSchemaCreate* 类的 main 方法

但是,通常只有数据库管理员才能在数据库上执行 DDL 语句。在生产系统中,这也是最明智的选择。SQL DDL 语句可以在 Flowable 下载页面或 Flowable 发行版文件夹的 database 子目录中找到。这些脚本也在引擎 JAR(*flowable-cmmn-engine-x.jar*)中的 *org/flowable/cmmn/db/create* 包中。SQL 文件的格式为:

    flowable.{db}.cmmn.create.sql

其中 *db* 是任何[支持的数据库](cmmn/ch02-Configuration.md#supported-databases)。

## 数据库表名说明

Flowable CMMN 引擎的数据库名称都以 **ACT_CMMN_** 开头。第二部分是表用例的两个字符标识。这个用例也大致匹配服务 API。

-   **ACT_CMMN_***：没有额外前缀的表包含"静态"信息,如案例定义和案例资源(图片、规则等)。

-   **ACT_CMMN_RU_***："RU"代表运行时(runtime)。这些是运行时表,包含案例实例、计划项等的运行时数据。Flowable 只在案例实例执行期间存储运行时数据,并在案例实例结束时删除记录。这保持了运行时表的小型和快速。

-   **ACT_CMMN_HI_***："HI"代表历史(history)。这些是包含历史数据的表,如过去的案例实例、计划项等。

## 数据库升级

在运行升级之前,请确保备份数据库(使用数据库的备份功能)。

默认情况下,每次创建流程引擎时都会执行版本检查。这通常发生在应用程序或 Flowable Web 应用程序启动时。如果 Flowable 库发现库版本与 Flowable 数据库表版本之间存在差异,则会抛出异常。

要升级,你必须首先在 flowable.cmmn.cfg.xml 配置文件中添加以下配置属性:

    <beans >

      <bean id="cmmnEngineConfiguration"
          class="org.flowable.cmmn.engine.CmmnEngineConfiguration">
        <!-- ... -->
        <property name="databaseSchemaUpdate" value="true" />
        <!-- ... -->
      </bean>

    </beans>

**另外,还要在类路径中包含适合你的数据库的数据库驱动程序。**升级应用程序中的 Flowable 库。或者启动新版本的 Flowable 并将其指向包含旧版本数据的数据库。将 databaseSchemaUpdate 设置为 true 后,当 Flowable 首次发现库和数据库架构不同步时,将自动将数据库架构升级到最新版本。

**作为替代方案,你也可以运行升级 DDL 语句。**也可以运行 Flowable 下载页面上提供的升级数据库脚本。

## 历史配置

自定义历史存储的配置是可选的。这允许你调整影响引擎[历史功能](#history)的设置。有关更多详细信息,请参见[历史配置](#historyConfig)。

    <property name="history" value="audit" />

## 在表达式和脚本中暴露配置 bean

默认情况下,你在 flowable.cmmn.cfg.xml 配置或自己的 Spring 配置文件中指定的所有 bean 都可用于表达式和脚本。如果你想限制配置文件中 bean 的可见性,可以在流程引擎配置中配置一个名为 beans 的属性。CmmnEngineConfiguration 中的 beans 属性是一个映射。当你指定该属性时,只有该映射中指定的 bean 才对表达式和脚本可见。暴露的 bean 将以你在映射中指定的名称暴露。

## 部署缓存配置

所有案例定义都会被缓存(在解析后),以避免每次需要案例定义时都访问数据库,并且因为案例定义数据不会改变。默认情况下,此缓存没有限制。要限制案例定义缓存,请添加以下属性:

    <property name="caseDefinitionCacheLimit" value="10" />

设置此属性将使用具有指定硬限制的 LRU 缓存替换默认的 hashmap 缓存。当然,此属性的"最佳"值取决于存储的案例定义总量以及所有运行时案例实例实际使用的案例定义数量。

你也可以注入自己的缓存实现。这必须是一个实现了 org.flowable.engine.common.impl.persistence.deploy.DeploymentCache 接口的 bean:

    <property name="caseDefinitionCache">
      <bean class="org.flowable.MyCache" />
    </property>

## 日志记录

所有日志(flowable、spring、mybatis 等)都通过 SLF4J 路由,并允许选择你想要的日志实现。

**默认情况下,flowable-cmmn-engine 依赖中不存在 SLF4J-binding JAR,为了使用你选择的日志框架,应该在你的项目中添加它。** 如果没有添加实现 JAR,SLF4J 将使用 NOP-logger,除了一个警告说明没有任何内容被记录外,不会记录任何内容。有关这些绑定的更多信息,请参见 [<http://www.slf4j.org/codes.html#StaticLoggerBinder>](http://www.slf4j.org/codes.html#StaticLoggerBinder)。

使用 Maven 时,例如添加这样的依赖(这里使用 log4j),注意你仍然需要添加版本:

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-log4j12</artifactId>
    </dependency>

flowable-rest webapp 配置为使用 Log4j-binding。在运行所有 flowable-* 模块的测试时也使用 Log4j。

**在类路径中使用带有 commons-logging 的容器时的重要说明:** 为了通过 SLF4J 路由 spring-logging,使用了一个桥接器(参见 [<http://www.slf4j.org/legacy.html#jclOverSLF4J>](http://www.slf4j.org/legacy.html#jclOverSLF4J))。如果你的容器提供了 commons-logging 实现,请按照此页面上的说明操作: [<http://www.slf4j.org/codes.html#release>](http://www.slf4j.org/codes.html#release) 以确保稳定性。

使用 Maven 时的示例(省略版本):

    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>jcl-over-slf4j</artifactId>
    </dependency>
