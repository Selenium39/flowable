---
id: ch16-Ldap
title: LDAP 集成
description: Flowable BPMN提供的LDAP集成方案，简化企业用户系统对接流程，支持身份验证与用户组管理，包含简化配置与旧版兼容方式。
keywords: Flowable,BPMN,LDAP集成,身份验证,用户组管理,流程引擎配置,企业系统对接
---

公司通常已经以 LDAP 系统的形式拥有用户和组存储。Flowable 提供了一个开箱即用的解决方案,可以轻松配置 Flowable 应该如何连接 LDAP 系统。

在早期版本中,已经可以集成 LDAP,但从那时起,配置已经大大简化。然而,配置 LDAP 的"旧"方式仍然有效。更具体地说,简化的配置只是在"旧"基础设施之上的一个包装器。

## 使用方法

要将 LDAP 集成代码添加到你的项目中,只需在 pom.xml 中添加以下依赖项:

    <dependency>
      <groupId>org.flowable</groupId>
      <artifactId>flowable-ldap-configurator</artifactId>
      <version>latest.version</version>
    </dependency>

## 使用场景

LDAP 集成目前有两个主要使用场景:

-   通过 IdentityService 进行身份验证。当通过 IdentityService 执行所有操作时,这可能很有用。

-   获取用户的组。这在查询任务以查看某个用户可以看到哪些任务时很重要(即具有候选组的任务)。

## 配置

通过在流程引擎配置的 idmProcessEngineConfigurator 部分中注入 org.flowable.ldap.LDAPConfigurator 的实例来完成 LDAP 系统与 Flowable 的集成。这个类具有高度的可扩展性:方法可以轻松重写,如果默认实现不适合用例,许多依赖的 bean 都是可插拔的。

这是一个示例配置(注意:当然,以编程方式创建引擎时这是完全相似的)。现在不用担心所有属性,我们将在下一节中详细查看它们。

    <bean id="processEngineConfiguration" class="...SomeProcessEngineConfigurationClass">
        ...
        <property name="idmProcessEngineConfigurator">
          <bean class="org.flowable.ldap.LDAPConfigurator">

            <property name="ldapConfiguration">
              <bean class="org.flowable.ldap.LDAPConfiguration">

                <!-- 服务器连接参数 -->
                <property name="server" value="ldap://localhost" />
                <property name="port" value="33389" />
                <property name="user" value="uid=admin, ou=users, o=flowable" />
                <property name="password" value="pass" />

                <!-- 查询参数 -->
                <property name="baseDn" value="o=flowable" />
                <property name="queryUserByUserId" value="(&(objectClass=inetOrgPerson)(uid={0}))" />
                <property name="queryUserByFullNameLike" value="(&(objectClass=inetOrgPerson)(|({0}=*{1}*)({2}=*{3}*)))" />
                <property name="queryAllUsers" value="(objectClass=inetOrgPerson)" />
                <property name="queryGroupsForUser" value="(&(objectClass=groupOfUniqueNames)(uniqueMember={0}))" />
                <property name="queryAllGroups" value="(objectClass=groupOfUniqueNames)" />

                <!-- 属性配置 -->
                <property name="userIdAttribute" value="uid" />
                <property name="userFirstNameAttribute" value="cn" />
                <property name="userLastNameAttribute" value="sn" />
                <property name="userEmailAttribute" value="mail" />

                <property name="groupIdAttribute" value="cn" />
                <property name="groupNameAttribute" value="cn" />

              </bean>
            </property>
          </bean>
        </property>
    </bean>

## 属性

可以在 org.flowable.ldap.LDAPConfiguration 上设置以下属性:

    .LDAP 配置属性

<table>
<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>属性名</th>
<th>描述</th>
<th>类型</th>
<th>默认值</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>server</p></td>
<td><p>可以访问 LDAP 系统的服务器。例如 'ldap://localhost:33389'</p></td>
<td><p>String</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>port</p></td>
<td><p>LDAP 系统运行的端口</p></td>
<td><p>int</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>user</p></td>
<td><p>用于连接 LDAP 系统的用户 ID</p></td>
<td><p>String</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>password</p></td>
<td><p>用于连接 LDAP 系统的密码</p></td>
<td><p>String</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>initialContextFactory</p></td>
<td><p>用于连接 LDAP 系统的 InitialContextFactory 名称</p></td>
<td><p>String</p></td>
<td><p>com.sun.jndi.ldap.LdapCtxFactory</p></td>
</tr>
<tr class="even">
<td><p>securityAuthentication</p></td>
<td><p>用于连接 LDAP 系统的 'java.naming.security.authentication' 属性的值</p></td>
<td><p>String</p></td>
<td><p>simple</p></td>
</tr>
<tr class="odd">
<td><p>customConnectionParameters</p></td>
<td><p>允许设置所有没有专用 setter 的 LDAP 连接参数。
参见 <a href="http://docs.oracle.com/javase/tutorial/jndi/ldap/jndi.html">http://docs.oracle.com/javase/tutorial/jndi/ldap/jndi.html</a> 了解自定义
属性。这些属性例如用于配置连接池、特定的
安全设置等。所有提供的参数都将在创建
LDAP 系统连接时使用。</p></td>
<td><p>Map&lt;String, String&gt;</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>baseDn</p></td>
<td><p>开始搜索用户和组的基础"专有名称"(DN)</p></td>
<td><p>String</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>userBaseDn</p></td>
<td><p>开始搜索用户的基础"专有名称"(DN)。如果未提供，将使用 baseDn(见上文)</p></td>
<td><p>String</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>groupBaseDn</p></td>
<td><p>开始搜索组的基础"专有名称"(DN)。如果未提供,将使用 baseDn(见上文)</p></td>
<td><p>String</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>searchTimeLimit</p></td>
<td><p>在 LDAP 中执行搜索时使用的超时时间(毫秒)</p></td>
<td><p>long</p></td>
<td><p>一小时</p></td>
</tr>
<tr class="even">
<td><p>queryUserByUserId</p></td>
<td><p>按用户 ID 搜索用户时执行的查询。
例如:(&amp;(objectClass=inetOrgPerson)(uid={0}))
这里,将返回 LDAP 中所有类为 'inetOrgPerson' 且
具有匹配的 'uid' 属性值的对象。
如示例所示,用户 ID 通过使用 {0} 注入。
如果仅设置查询对你的特定 LDAP 设置不够,
你可以选择插入不同的 LDAPQueryBuilder,
它允许比仅查询更多的自定义。</p></td>
<td><p>string</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>queryUserByFullNameLike</p></td>
<td><p>按全名搜索用户时执行的查询。
例如:(&amp;(objectClass=inetOrgPerson)(</p></td>
<td><p>({0}=<strong>{1}</strong>)({2}=<strong>{3}</strong>)) )
这里,将返回 LDAP 中所有类为 'inetOrgPerson' 且
具有匹配的名字和姓氏值的对象。
注意 {0} 注入 firstNameAttribute(如上所定义),{1} 和 {3} 是搜索文本,
{2} 是 lastNameAttribute。如果仅设置查询对你的特定 LDAP 设置不够,
你可以选择插入不同的 LDAPQueryBuilder,它允许比仅查询更多的自定义。</p></td>
<td><p>string</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>queryAllUsers</p></td>
<td><p>在没有过滤器的情况下搜索用户时执行的查询。
例如:(objectClass=inetOrgPerson)
这里,将返回 LDAP 中所有类为 'inetOrgPerson' 的对象。</p></td>
<td><p>string</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>queryGroupsForUser</p></td>
<td><p>搜索特定用户的组时执行的查询。
例如:(&amp;(objectClass=groupOfUniqueNames)(uniqueMember={0}))
这里,将返回 LDAP 中所有类为 'groupOfUniqueNames' 且
提供的 DN(匹配用户的 DN)是 'uniqueMember' 的对象。
如示例所示,用户 ID 通过使用 {0} 注入。
如果仅设置查询对你的特定 LDAP 设置不够,
你可以选择插入不同的 LDAPQueryBuilder,它允许比仅查询更多的自定义。</p></td>
<td><p>string</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>queryAllGroups</p></td>
<td><p>在没有过滤器的情况下搜索组时执行的查询。
例如:(objectClass=groupOfUniqueNames)
这里,将返回 LDAP 中所有类为 'groupOfUniqueNames' 的对象。</p></td>
<td><p>string</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>userIdAttribute</p></td>
<td><p>匹配用户 ID 的属性名称。
当查找 User 对象并在 LDAP 对象和 Flowable User 对象之间
进行映射时使用此属性。</p></td>
<td><p>string</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>userFirstNameAttribute</p></td>
<td><p>匹配用户名字的属性名称。
当查找 User 对象并在 LDAP 对象和 Flowable User 对象之间
进行映射时使用此属性。</p></td>
<td><p>string</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>userLastNameAttribute</p></td>
<td><p>匹配用户姓氏的属性名称。
当查找 User 对象并在 LDAP 对象和 Flowable User 对象之间
进行映射时使用此属性。</p></td>
<td><p>string</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>groupIdAttribute</p></td>
<td><p>匹配组 ID 的属性名称。
当查找 Group 对象并在 LDAP 对象和 Flowable Group 对象之间
进行映射时使用此属性。</p></td>
<td><p>string</p></td>
</tr>
<tr class="odd">
<td></td>
<td><p>groupNameAttribute</p></td>
<td><p>匹配组名称的属性名称。
当查找 Group 对象并在 LDAP 对象和 Flowable Group 对象之间
进行映射时使用此属性。</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td></td>
<td><p>groupTypeAttribute</p></td>
<td><p>匹配组类型的属性名称。
当查找 Group 对象并在 LDAP 对象和 Flowable Group 对象之间
进行映射时使用此属性。</p></td>
<td><p>String</p></td>
</tr>
</tbody>
</table>

以下属性用于自定义默认行为或引入组缓存:

<table>
<caption>高级属性</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>属性名</th>
<th>描述</th>
<th>类型</th>
<th>默认值</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>ldapUserManagerFactory</p></td>
<td><p>如果默认实现不适用,设置 LDAPUserManagerFactory 的自定义实现。</p></td>
<td><p>LDAPUserManagerFactory 实例</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>ldapGroupManagerFactory</p></td>
<td><p>如果默认实现不适用,设置 LDAPGroupManagerFactory 的自定义实现。</p></td>
<td><p>LDAPGroupManagerFactory 实例</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>ldapMemberShipManagerFactory</p></td>
<td><p>如果默认实现不适用,设置 LDAPMembershipManagerFactory 的自定义实现。
注意这种情况很少见,因为成员关系通常在 LDAP 系统本身中管理。</p></td>
<td><p>LDAPMembershipManagerFactory 实例</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>ldapQueryBuilder</p></td>
<td><p>如果默认实现不适用,设置自定义查询构建器。
当 LDAPUserManager 或 LDAPGroupManager 对 LDAP 系统执行实际查询时,
会使用 LDAPQueryBuilder 实例。
默认实现使用在此实例上设置的属性,
如 queryGroupsForUser 和 queryUserById</p></td>
<td><p>org.flowable.ldap.LDAPQueryBuilder 实例</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>groupCacheSize</p></td>
<td><p>允许设置组缓存的大小。
这是一个 LRU 缓存,用于缓存用户的组,从而
避免每次需要知道用户的组时都访问 LDAP 系统。</p>
<p>如果值小于零,则不会实例化缓存。
默认设置为 -1,因此不进行缓存。</p></td>
<td><p>int</p></td>
<td><p>-1</p></td>
</tr>
<tr class="even">
<td><p>groupCacheExpirationTime</p></td>
<td><p>设置组缓存的过期时间(毫秒)。
当获取特定用户的组时,如果组缓存存在,
这些组将在此属性设置的时间内存储在此缓存中。
例如,当在 00:00 获取组且过期时间为 30 分钟时,
在 00:30 之后获取该用户的组将不会从缓存中获取,
而是再次从 LDAP 系统获取。同样,在 00:00 - 00:30 之间
对该用户进行的所有组获取都将从缓存中获取。</p></td>
<td><p>long</p></td>
<td><p>一小时</p></td>
</tr>
</tbody>
</table>

注意使用 Active Directory 时:有人报告说对于 Active Directory,需要将 'InitialDirContext' 设置为 Context.REFERRAL。这可以通过上述的 customConnectionParameters 映射传递。