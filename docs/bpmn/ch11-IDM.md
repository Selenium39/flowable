---
id: ch11-IDM
title: 身份管理
description: 本文详细介绍了Flowable V6中身份管理(IDM)组件的架构变更、核心功能及配置方法，包括用户/组管理、权限控制和密码加密设置，帮助开发者灵活集成或禁用身份验证功能。
keywords: Flowable,BPMN,身份管理,IDM,用户权限,密码加密,LDAP集成
---

从 Flowable V6 开始，身份管理（IDM）组件已从 flowable-engine 模块中提取出来，并将逻辑移至几个独立的模块：flowable-idm-api、flowable-idm-engine、flowable-idm-spring 和 flowable-idm-engine-configurator。分离 IDM 逻辑的主要原因是它不是 Flowable 引擎的核心，而且在很多情况下，当 Flowable 引擎嵌入到应用程序中时，身份逻辑并不会被使用或需要。

默认情况下，IDM 引擎会在 Flowable 引擎启动时初始化和启动。这导致与 Flowable v5 中相同的身份逻辑被执行和可用。idm-engine 管理自己的数据库架构和以下实体：

-   User 和 UserEntity，用户信息。

-   Group 和 GroupEntity，组信息。

-   MembershipEntity，用户在组中的成员身份。

-   Privilege 和 PrivilegeEntity，权限定义（例如用于控制对 UI 应用程序的访问，如 Flowable Modeler 和 Flowable Task 应用）。

-   PrivilegeMappingEntity，将用户和/或组链接到权限。

-   Token 和 TokenEntity，UI 应用程序使用的认证令牌。

由于数据库包含过去和正在进行的实例的历史实体，你可能需要考虑查询这些表以最小化对运行时流程实例数据的访问，从而保持运行时执行的性能。

## IDM 引擎配置

默认情况下，Flowable 引擎使用 org.flowable.idm.engine.configurator.IdmEngineConfigurator 启动。此配置器使用与 Flowable 流程引擎配置相同的数据源配置。使用身份组件不需要额外的配置，因为它已在 Flowable v5 中配置好了。

当 Flowable 引擎不需要身份逻辑时，可以在流程引擎配置中禁用 IDM 引擎。

    <bean id="processEngineConfiguration" class="org.flowable.engine.impl.cfg.StandaloneInMemProcessEngineConfiguration">
      <property name="disableIdmEngine" value="true" />
      ...
    </bean>

这意味着不能使用用户和组查询，也不能为用户检索任务查询中的候选组。

默认情况下，用户密码将以明文形式保存在 IDM 数据库表中。为了确保密码被编码，你可以在流程引擎配置中定义密码编码器。

    <bean id="bCryptEncoder"
          class="org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder"/>

    <bean id="passwordEncoder" class="org.flowable.idm.spring.authentication.SpringEncoder">
        <constructor-arg ref="bCryptEncoder"/>
    </bean>

    <bean id="processEngineConfiguration" class="org.flowable.engine.impl.cfg.StandaloneInMemProcessEngineConfiguration">
      <property name="passwordEncoder" ref="passwordEncoder" />
      ...
    </bean>

在这个例子中使用了 ShaPasswordEncoder，但你也可以使用 org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder。当不使用 Spring 时，你也可以使用 org.flowable.idm.engine.impl.authentication.ApacheDigester 来编码密码。

默认的 IDM 引擎配置器也可以被覆盖，以自定义方式初始化 IDM 引擎。一个很好的例子是 LDAPConfigurator 实现，它覆盖了默认的 IDM 引擎，使用 LDAP 服务器而不是默认的 IDM 数据库表。流程引擎配置的 idmProcessEngineConfigurator 属性可用于设置自定义配置器，如 LDAPConfigurator

    <bean id="processEngineConfiguration" class="...SomeProcessEngineConfigurationClass">
        ...
        <property name="idmProcessEngineConfigurator">
          <bean class="org.flowable.ldap.LDAPConfigurator">

            <!-- 服务器连接参数 -->
            <property name="server" value="ldap://localhost" />
            <property name="port" value="33389" />
            <property name="user" value="uid=admin, ou=users, o=flowable" />
            <property name="password" value="pass" />

            <!-- 查询参数 -->
            <property name="baseDn" value="o=flowable" />
            <property name="queryUserByUserId" value="(&(objectClass=inetOrgPerson)(uid={0}))" />
            <property name="queryUserByFullNameLike" value="(&(objectClass=inetOrgPerson)(|({0}=*{1}*)({2}=*{3}*)))" />
            <property name="queryGroupsForUser" value="(&(objectClass=groupOfUniqueNames)(uniqueMember={0}))" />

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
