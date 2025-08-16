---
id: ch13-Applications
title: Flowable应用程序
description: 本文档详细介绍如何安装部署基于Spring Boot 3.1的Flowable REST应用程序，包括Tomcat服务器配置、数据库设置（H2/MySQL/PostgreSQL）及Swagger文档访问指南。
keywords: Flowable,BPMN,REST API,Spring Boot,Tomcat部署,MySQL配置,PostgreSQL,流程引擎
---

Flowable提供了包含Flowable REST API的`flowable-rest.war`。更多相关内容可以在[REST API](bpmn/ch14-REST.md)章节中阅读。

该应用程序是基于Spring Boot 3.1的应用程序，这意味着WAR文件实际上是可执行的，可以作为普通的独立应用程序运行。
详见Spring Boot参考文档中的[可执行Jar格式](https://docs.spring.io/spring-boot/docs/current/reference/html/build-tool-plugins-maven-plugin.html#build-tool-plugins-maven-packaging)部分。


## Flowable REST应用程序安装

如前所述，该应用程序可以部署在Tomcat服务器上。当需要使用额外的配置设置时，这可能是最简单的入门方法。在本安装指南中，我们将描述如何在Tomcat服务器中安装该应用程序。

1. 下载最新稳定版本的[Apache Tomcat](http://tomcat.apache.org)。它必须兼容Jakarta Servlet 6（Tomcat 10或更高版本）

2. 下载最新稳定版本的[Flowable 7](http://www.flowable.org/downloads.html)。

3. 将Flowable发行版*wars*文件夹中的flowable-rest.war文件复制到Tomcat的webapps文件夹中。

4. 通过运行bin/startup.sh（Mac OS和Linux）或bin/startup.bat（Windows）脚本启动Tomcat服务器。

5. 打开网络浏览器并访问[<http://localhost:8080/flowable-rest/docs>](http://localhost:8080/flowable-rest/docs)。

此时Flowable REST应用程序应该已经运行在H2内存数据库上，并且Swagger文档应该显示在你的网络浏览器中：

Flowable REST应用程序现在应该已经运行在H2内存数据库上

通常，你会想要将默认的H2内存数据库配置更改为MySQL或Postgres（或其他持久化数据库）配置。
你可以通过更改应用程序*WEB-INF/classes/*目录中的application.properties文件来实现这一点。
不过，使用Spring Boot的[外部化配置](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)会更容易。
示例配置可以在[Github](https://github.com/flowable/flowable-engine/blob/main/modules/flowable-app-rest/src/main/resources/flowable-default.properties)上找到。
要将默认配置更改为MySQL，需要对properties文件进行以下更改：

    spring.datasource.url=jdbc:mysql://127.0.0.1:3306/flowable?characterEncoding=UTF-8
    spring.datasource.username=flowable
    spring.datasource.password=flowable

此配置需要MySQL服务器中存在flowable数据库，REST应用程序将自动生成必要的数据库表。对于Postgres，需要进行以下更改：

    spring.datasource.url=jdbc:postgresql://localhost:5432/flowable
    spring.datasource.username=flowable
    spring.datasource.password=flowable

除了更改配置外，还需要确保数据库驱动程序在类路径上可用。同样，你可以通过将驱动程序JAR文件添加到WEB-INF/lib文件夹来为Web应用程序实现这一点，也可以将JAR文件复制到Tomcat的lib文件夹中。MySQL和Postgres的数据库驱动程序可以从以下位置下载：

- MySQL: [<https://dev.mysql.com/downloads/connector/j>](https://dev.mysql.com/downloads/connector/j)

- Postgres: [<https://jdbc.postgresql.org/>](https://jdbc.postgresql.org/)

当将REST作为独立应用程序运行时，可以使用`loader.path`属性添加数据库驱动程序。

    java -Dloader.path=/location/to/your/driverfolder -jar flowable-rest.war

更多信息请参见Spring Boot参考文档中的[`PropertiesLauncher`特性](https://docs.spring.io/spring-boot/docs/current/reference/html/executable-jar.html#executable-jar-property-launcher-features)。

## Flowable REST应用程序配置

由于Flowable REST应用程序是一个Spring Boot应用程序，你可以使用Spring Boot提供的所有属性。
要为应用程序提供自定义配置，请参阅Spring Boot文档中的[外部化配置](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html)部分。

    你也可以使用基于YAML的属性配置。

<table>
<caption>REST应用程序属性</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>属性名称</th>
<th>旧属性</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="even">
<td><p>flowable.rest.app.authentication-mode</p></td>
<td><p>rest.authentication.mode</p></td>
<td><p>verify-privilege</p></td>
<td><p>配置在进行REST API调用时验证用户凭据的方式：
'any-user'：用户需要存在且密码需要匹配。任何用户都被允许进行调用（这是6.3.0之前的行为）
'verify-privilege'：用户需要存在，密码需要匹配，并且用户需要具有'rest-api'权限
如果未设置，默认为'verify-privilege'</p></td>
</tr>
</tbody>
</table>

一些旧属性已经被移动到由Flowable Spring Boot启动器（或Spring Boot本身）管理

<table>
<caption>由Flowable Spring Boot Starter管理的旧属性</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>属性名称</th>
<th>旧属性</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>flowable.async-executor-activate</p></td>
<td><p>engine.process.asyncexecutor.activate</p></td>
<td><p>true</p></td>
<td><p>是否激活异步执行器。</p></td>
</tr>
<tr class="even">
<td><p>flowable.database-schema-update</p></td>
<td><p>engine.process.schema.update</p></td>
<td><p>true</p></td>
<td><p>数据库schema应该使用的策略。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.history-level</p></td>
<td><p>engine.process.history.level</p></td>
<td><p>-</p></td>
<td><p>需要使用的历史级别。</p></td>
</tr>
<tr class="even">
<td><p>flowable.process.servlet.name</p></td>
<td><p>flowable.rest-api-servlet-name</p></td>
<td><p>Flowable BPMN Rest API</p></td>
<td><p>流程servlet的名称。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.process.servlet.path</p></td>
<td><p>flowable.rest-api-mapping</p></td>
<td><p>/process-api</p></td>
<td><p>流程REST servlet的上下文路径。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.enabled</p></td>
<td><p>flowable.db-identity-used</p></td>
<td><p>true</p></td>
<td><p>是否需要启动IDM引擎。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.password-encoder</p></td>
<td><p>security.passwordencoder</p></td>
<td><p>-</p></td>
<td><p>需要使用的密码编码器类型。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.base-dn</p></td>
<td><p>ldap.basedn</p></td>
<td><p>-</p></td>
<td><p>用户和组搜索的起始"专有名称"(DN)基准。当需要区分用户和组的基准DN时，使用'user-base-dn'或'group-base-dn'。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.enabled</p></td>
<td><p>ldap.enabled</p></td>
<td><p>false</p></td>
<td><p>是否启用LDAP IDM服务。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.password</p></td>
<td><p>ldap.password</p></td>
<td><p>-</p></td>
<td><p>用于连接LDAP系统的密码。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.port</p></td>
<td><p>ldap.port</p></td>
<td><p>-1</p></td>
<td><p>LDAP系统运行的端口。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.server</p></td>
<td><p>ldap.server</p></td>
<td><p>-</p></td>
<td><p>可以访问LDAP系统的服务器主机。例如'ldap://localhost'。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.user</p></td>
<td><p>ldap.user</p></td>
<td><p>-</p></td>
<td><p>用于连接LDAP系统的用户ID。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.attribute.email</p></td>
<td><p>ldap.attribute.email</p></td>
<td><p>-</p></td>
<td><p>匹配用户邮箱的属性名称。
当查找'org.flowable.idm.api.User'对象以及在LDAP对象和Flowable 'org.flowable.idm.api.User'对象之间进行映射时使用此属性。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.attribute.first-name</p></td>
<td><p>ldap.attribute.firstname</p></td>
<td><p>-</p></td>
<td><p>匹配用户名字的属性名称。
当查找'org.flowable.idm.api.User'对象以及在LDAP对象和Flowable 'org.flowable.idm.api.User'对象之间进行映射时使用此属性。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.attribute.group-id</p></td>
<td><p>ldap.attribute.groupid</p></td>
<td><p>-</p></td>
<td><p>匹配组ID的属性名称。
当查找'org.flowable.idm.api.Group'对象以及在LDAP对象和Flowable 'org.flowable.idm.api.Group'对象之间进行映射时使用此属性。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.attribute.group-name</p></td>
<td><p>ldap.attribute.groupname</p></td>
<td><p>-</p></td>
<td><p>匹配组名称的属性名称。
当查找'org.flowable.idm.api.Group'对象以及在LDAP对象和Flowable 'org.flowable.idm.api.Group'对象之间进行映射时使用此属性。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.attribute.last-name</p></td>
<td><p>ldap.attribute.lastname</p></td>
<td><p>-</p></td>
<td><p>匹配用户姓氏的属性名称。
当查找'org.flowable.idm.api.User'对象以及在LDAP对象和Flowable 'org.flowable.idm.api.User'对象之间进行映射时使用此属性。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.attribute.user-id</p></td>
<td><p>ldap.attribute.userid</p></td>
<td><p>-</p></td>
<td><p>匹配用户ID的属性名称。
当查找'org.flowable.idm.api.User'对象以及在LDAP对象和Flowable 'org.flowable.idm.api.User'对象之间进行映射时使用此属性。此属性是可选的，仅在使用Flowable API搜索'org.flowable.idm.api.User'对象时才需要。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.cache.group-size</p></td>
<td><p>ldap.cache.groupsize</p></td>
<td><p>-1</p></td>
<td><p>设置'org.flowable.ldap.LDAPGroupCache'的大小。
这是一个LRU缓存，用于缓存用户的组信息，从而避免每次需要知道用户的组时都要访问LDAP系统。
如果值小于零，则不会实例化缓存。默认设置为-1，因此不进行缓存。
请注意，组缓存是在'org.flowable.ldap.LDAPIdentityServiceImpl'上实例化的。
因此，如果你有'org.flowable.ldap.LDAPIdentityServiceImpl'的自定义实现，不要忘记添加组缓存功能。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.query.all-groups</p></td>
<td><p>ldap.query.groupall</p></td>
<td><p>-</p></td>
<td><p>搜索所有组时执行的查询。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.query.all-users</p></td>
<td><p>ldap.query.userall</p></td>
<td><p>-</p></td>
<td><p>搜索所有用户时执行的查询。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.query.groups-for-user</p></td>
<td><p>ldap.query.groupsforuser</p></td>
<td><p>-</p></td>
<td><p>搜索特定用户的组时执行的查询。
例如：<code>(&amp;(objectClass=groupOfUniqueNames)(uniqueMember={0}))</code>
这里，将返回LDAP中具有'groupOfUniqueNames'类且提供的DN是'uniqueMember'的所有对象。
如示例所示，用户ID是通过典型的{@link java.text.MessageFormat}注入的，即使用<em>{0}</em>
如果仅设置查询对于你的特定LDAP设置来说不够，你可以选择插入不同的
<code>org.flowable.ldap.LDAPQueryBuilder</code>，它允许进行比仅查询更多的自定义。</p></td>
</tr>
<tr class="even">
<td><p>flowable.idm.ldap.query.user-by-full-name-like</p></td>
<td><p>ldap.query.userbyname</p></td>
<td><p>-</p></td>
<td><p>按全名搜索用户时执行的查询。
例如：<code>(&amp;(objectClass=inetOrgPerson)(|({0}={1})({2}={3})))</code>
这里，将返回LDAP中具有'inetOrgPerson'类且具有匹配名字或姓氏的所有对象。
表达式中将注入以下内容：{0}：名字属性 {1}：搜索文本 {2}：姓氏属性 {3}：搜索文本
如果仅设置查询对于你的特定LDAP设置来说不够，你可以选择插入不同的
'org.flowable.ldap.LDAPQueryBuilder'，它允许进行比仅查询更多的自定义。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.idm.ldap.query.user-by-id</p></td>
<td><p>ldap.query.userbyid</p></td>
<td><p>-</p></td>
<td><p>按userId搜索用户时执行的查询。
例如：<code>(&amp;(objectClass=inetOrgPerson)(uid={0}))</code>
这里，将返回LDAP中具有'inetOrgPerson'类且具有匹配'uid'属性值的所有对象。
如示例所示，用户ID是通过典型的{@link java.text.MessageFormat}注入的，即使用<em>{0}</em>
如果仅设置查询对于你的特定LDAP设置来说不够，你可以选择插入不同的
'org.flowable.ldap.LDAPQueryBuilder'，它允许进行比仅查询更多的自定义。</p></td>
</tr>
<tr class="even">
<td><p>flowable.mail.server.host</p></td>
<td><p>email.host</p></td>
<td><p>localhost</p></td>
<td><p>邮件服务器的主机。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.mail.server.password</p></td>
<td><p>email.password</p></td>
<td><p>-</p></td>
<td><p>邮件服务器认证的密码。</p></td>
</tr>
<tr class="even">
<td><p>flowable.mail.server.port</p></td>
<td><p>email.port</p></td>
<td><p>1025</p></td>
<td><p>邮件服务器的端口。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.mail.server.ssl-port</p></td>
<td><p>email.ssl-port</p></td>
<td><p>1465</p></td>
<td><p>邮件服务器的SSL端口。</p></td>
</tr>
<tr class="even">
<td><p>flowable.mail.server.use-ssl</p></td>
<td><p>email.use-ssl</p></td>
<td><p>false</p></td>
<td><p>设置是否在连接时为SMTP传输启用SSL/TLS加密（SMTPS/POPS）。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.mail.server.use-tls</p></td>
<td><p>email.use-tls</p></td>
<td><p>false</p></td>
<td><p>设置或禁用STARTTLS加密。</p></td>
</tr>
<tr class="even">
<td><p>flowable.mail.server.username</p></td>
<td><p>email.username</p></td>
<td><p>-</p></td>
<td><p>用于邮件服务器认证的用户名。
如果为空则不使用认证。</p></td>
</tr>
<tr class="odd">
<td><p>flowable.process.definition-cache-limit</p></td>
<td><p>flowable.process-definitions.cache.max</p></td>
<td><p>-1</p></td>
<td><p>流程定义缓存中可用的最大流程定义数量。
默认为-1（所有流程定义）。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>由Spring Boot管理的旧属性</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>属性名称</th>
<th>旧属性</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>spring.datasource.driver-class-name</p></td>
<td><p>datasource.driver</p></td>
<td><p>-</p></td>
<td><p>JDBC驱动程序的完全限定名称。默认根据URL自动检测。</p></td>
</tr>
<tr class="even">
<td><p>spring.datasource.jndi-name</p></td>
<td><p>datasource.jndi.name</p></td>
<td><p>-</p></td>
<td><p>数据源的JNDI位置。设置后将忽略Class、url、username和password。</p></td>
</tr>
<tr class="odd">
<td><p>spring.datasource.password</p></td>
<td><p>datasource.password</p></td>
<td><p>-</p></td>
<td><p>数据库登录密码。</p></td>
</tr>
<tr class="even">
<td><p>spring.datasource.url</p></td>
<td><p>datasource.url</p></td>
<td><p>-</p></td>
<td><p>数据库的JDBC URL。</p></td>
</tr>
<tr class="odd">
<td><p>spring.datasource.username</p></td>
<td><p>datasource.username</p></td>
<td><p>-</p></td>
<td><p>数据库登录用户名。</p></td>
</tr>
<tr class="even">
<td><p>spring.datasource.hikari.connection-test-query</p></td>
<td><p>datasource.preferred-test-query</p></td>
<td><p>-</p></td>
<td><p>用于测试连接有效性的SQL查询。</p></td>
</tr>
<tr class="odd">
<td><p>spring.datasource.hikari.connection-timeout</p></td>
<td><p>datasource.connection.timeout</p></td>
<td><p>-</p></td>
<td><p>客户端等待从连接池获取连接的最大毫秒数。如果超过这个时间仍未获得可用连接，在获取连接时将抛出SQLException。</p></td>
</tr>
<tr class="even">
<td><p>spring.datasource.hikari.idle-timeout</p></td>
<td><p>datasource.connection.idletimeout</p></td>
<td><p>-</p></td>
<td><p>连接在池中允许空闲的最长时间（以毫秒为单位）。
连接是否因空闲而被回收受限于最大+30秒的变化，平均+15秒的变化。
连接在达到此超时之前永远不会因空闲而被回收。
值为0表示空闲连接永远不会从池中移除。</p></td>
</tr>
<tr class="odd">
<td><p>spring.datasource.hikari.max-lifetime</p></td>
<td><p>datasource.connection.maxlifetime</p></td>
<td><p>-</p></td>
<td><p>此属性控制池中连接的最大生命周期。当连接达到此超时时间时，即使最近使用过，也会从池中移除。正在使用的连接永远不会被移除，只有在空闲时才会被移除。</p></td>
</tr>
<tr class="even">
<td><p>spring.datasource.hikari.maximum-pool-size</p></td>
<td><p>datasource.connection.maxpoolsize</p></td>
<td><p>-</p></td>
<td><p>此属性控制池允许达到的最大大小，包括空闲和使用中的连接。基本上，这个值将决定到数据库后端的最大实际连接数。
当池达到这个大小，且没有空闲连接可用时，对getConnection()的调用将阻塞最多connectionTimeout毫秒后超时。</p></td>
</tr>
<tr class="odd">
<td><p>spring.datasource.hikari.minimum-idle</p></td>
<td><p>datasource.connection.minidle</p></td>
<td><p>-</p></td>
<td><p>此属性控制HikariCP尝试在池中维护的最小空闲连接数，包括空闲和使用中的连接。如果空闲连接数低于此值，HikariCP将尽最大努力快速有效地恢复它们。</p></td>
</tr>
<tr class="even">
<td><p>spring.servlet.multipart.max-file-size</p></td>
<td><p>file.upload.max.size</p></td>
<td><p>10MB</p></td>
<td><p>最大文件大小。值可以使用"MB"或"KB"后缀分别表示兆字节或千字节。</p></td>
</tr>
</tbody>
</table>

## Flowable LDAP配置

除了默认的身份表之外，IDM组件还可以配置使用LDAP服务器。
要连接到LDAP服务器，需要在application.properties文件中（或通过其他方式配置应用程序）添加以下属性：

    #
    # LDAP
    #
    flowable.idm.ldap.enabled=true
    flowable.idm.ldap.server=ldap://localhost
    flowable.idm.ldap.port=10389
    flowable.idm.ldap.user=uid=admin, ou=system
    flowable.idm.ldap.password=secret
    flowable.idm.ldap.base-dn=o=flowable
    flowable.idm.ldap.query.user-by-id=(&(objectClass=inetOrgPerson)(uid={0}))
    flowable.idm.ldap.query.user-by-full-name-like=(&(objectClass=inetOrgPerson)(|({0}=*{1}*)({2}=*{3}*)))
    flowable.idm.ldap.query.all-users=(objectClass=inetOrgPerson)
    flowable.idm.ldap.query.groups-for-user=(&(objectClass=groupOfUniqueNames)(uniqueMember={0}))
    flowable.idm.ldap.query.all-groups=(objectClass=groupOfUniqueNames)
    flowable.idm.ldap.query.group-by-id=(&(objectClass=groupOfUniqueNames)(uniqueId={0}))
    flowable.idm.ldap.attribute.user-id=uid
    flowable.idm.ldap.attribute.first-name=cn
    flowable.idm.ldap.attribute.last-name=sn
    flowable.idm.ldap.attribute.group-id=cn
    flowable.idm.ldap.attribute.group-name=cn
    flowable.idm.ldap.cache.group-size=10000
    flowable.idm.ldap.cache.group-expiration=180000

当`flowable.idm.ldap.enabled`属性设置为true时，REST应用程序将期望其他LDAP属性已被填写。
在这个示例配置中提供了Apache Directory Server的服务器配置和LDAP查询。
对于其他LDAP服务器（如Active Directory），需要使用其他配置值。

配置LDAP后，用户的身份验证和组检索将通过LDAP服务器完成。只有权限仍将从Flowable身份表中检索。因此，请确保每个LDAP用户在IDM应用程序中都定义了正确的权限。

如果应用程序使用LDAP配置启动，引导逻辑将检查Flowable身份表中是否已存在权限。
如果没有权限（仅在首次启动时），将创建4个默认权限，并且`flowable.rest.app.admin.user-id`属性值（来自application.properties或在环境中配置）将用作获取所有权限的用户ID。
因此，请确保将`flowable.rest.app.admin.user-id`属性值设置为有效的LDAP用户，否则没有人能够使用Flowable REST应用程序。

## 生产就绪端点

Spring Boot的[生产就绪端点](https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-endpoints.html)在应用程序中可用。
要了解所有可用端点的概览，请查看[Actuator Web API文档](https://docs.spring.io/spring-boot/docs/current/actuator-api/html/)。

以下属性是默认设置的：

    # 向Web公开所有执行器端点
    # 它们是公开的，但只有经过身份验证的用户可以看到/info和/health，具有access-admin权限的用户可以看到其他端点
    management.endpoints.web.exposure.include=*
    # 只有在用户获得授权时才应显示完整的健康详情
    management.endpoint.health.show-details=when_authorized
    # 只有具有access-admin角色的用户才能访问完整的健康详情
    management.endpoint.health.roles=access-admin

安全配置的方式是，`info`和`health`端点向所有经过身份验证的用户公开。
`health`端点的完整详情只能由具有`access-admin`权限的用户查看。
如果你想更改这一点，需要配置`management.endpoint.health.show-details`。
所有其他端点只能由具有`access-admin`权限的用户访问。

## 自定义Bean部署

有多种方式可以为Flowable应用程序提供自定义Bean。

### 使用Spring Boot自动配置

Flowable应用程序是一个Spring Boot 2应用程序。
这意味着可以使用普通的Spring Boot自动配置来为Flowable创建Bean。
可以按以下方式实现：

    package com.your.own.package.configuration;

    @Configuration
    @AutoConfigureOrder(Ordered.LOWEST_PRECEDENCE) // 确保此配置将由Spring Boot最后处理
    @ConditionalOnBean(type = "org.flowable.engine.ProcessEngine") // 仅当存在ProcessEngine bean时才使用此配置
    public class YourOwnConfiguration {

        @Configuration
        @ComponentScan ("com.your.own.package.beans")
        public static class ComponentScanConfiguration {
            // 需要此类以有条件地执行组件扫描（即当ProcessEngine bean存在时）
            // 这是一个可选类，如果不需要组件扫描，则不需要这样做
        }

        @Bean
        public CustomBean customBean() {
            // 创建你的bean
        }

        @Bean
        public EngineConfigurationConfigurer<SpringProcessEngineConfiguration> customProcessEngineConfigurationConfigurer() {
            return engineConfiguration -> {
                // 你可以使用此方法为流程引擎添加额外配置
            }
        }
    }

注意，使用Spring Boot时，配置类可以在你自己的包下，而不必在某个Flowable包下。

要使此类成为自动配置类，应在jar的`META-INF/spring`文件夹中创建一个名为`org.springframework.boot.autoconfigure.AutoConfiguration.imports`的文件。
在此文件中，你应该添加：

    com.your.own.package.configuration.YourOwnCustomConfiguration

要使用此方法，你需要将你的jar包含在展开的war的`WEB-INF/lib`文件夹中。
由于Spring代理`@Configuration`类的方式，将此jar放在servlet容器（如Tomcat）的lib文件夹中将无法工作。

### 组件扫描

为Flowable引擎提供自定义Spring Bean的另一种方式是将它们放在特定包下，并让Flowable应用程序扫描该包。
根据使用的应用程序，这个包是不同的：

-   对于`flowable-rest.war`，使用`org.flowable.rest.app`

自定义Bean可以位于单个JAR中，并且在应用程序启动时此jar应该在类路径上。
根据JAR放置的位置（servlet容器的lib文件夹或展开的war的`WEB-INF/lib`文件夹），有不同的可能性。

当使用servlet容器的lib文件夹时，创建的类应该是自包含的，即它们应该只使用jar内的类。
你可以使用任何Spring `@Component`注解（除了`@Configuration`）。
无法使用`@Configuration`类的原因是每个配置类都由Spring在`ConfigurationClassPostProcessor`的帮助下进行代理。
然而，加载`@Configuration`类的类加载器无法访问Spring所需的类。

当将jar包含在展开的war的`WEB-INF/lib`文件夹中时，可以使用`@Configuration`类和对其他jar的依赖。

### 创建你自己的Spring Boot应用程序

这是所有方法中最灵活和最强大的方法。
要遵循此方法，请查看本文档的[Spring Boot入门](bpmn/ch05a-Spring-Boot.md#getting-started)部分。