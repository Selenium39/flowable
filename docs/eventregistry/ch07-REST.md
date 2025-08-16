---
id: ch07-REST
title: REST API
description: Flowable REST API文档详细介绍了如何安装、配置和认证REST服务，包括基本认证设置、Tomcat部署注意事项和HTTP方法规范，帮助开发者快速集成流程管理功能。
keywords: Flowable,REST API,流程管理,认证配置,Tomcat部署,Spring MVC,JSON格式,HTTP方法
---

## Flowable REST 基本原则

### 安装和认证

Flowable 包含一个 REST API,可以通过将 flowable-rest.war 文件部署到 Apache Tomcat 等 servlet 容器来安装。此外,也可以通过在应用程序中包含 servlet(及其映射)并将所有 flowable-rest 依赖项添加到类路径中来在其他 Web 应用程序中使用。

默认情况下,Flowable 引擎将连接到内存中的 H2 数据库。你可以在 *WEB-INF/META-INF/flowable-app* 文件夹中的 flowable-app.properties 文件中更改数据库设置。REST API 使用 JSON 格式(<http://www.json.org>),并基于 Spring MVC 构建(<http://docs.spring.io/spring/docs/current/spring-framework-reference/html/mvc.html>)。

默认情况下,所有 REST 资源都需要具有 *rest-access-api* 权限的有效用户进行身份验证。如果允许任何有效用户调用 REST API,可以将 *flowable.rest.app.authentication-mode* 设置为 *any-user*(这是 Flowable 早期版本的默认设置)。

可以通过设置以下属性来配置可以访问 REST API 的默认用户:

    flowable.rest.app.admin.user-id=rest-admin
    flowable.rest.app.admin.password=test
    flowable.rest.app.admin.first-name=Rest
    flowable.rest.app.admin.last-name=Admin

当 REST 应用程序启动时,如果用户不存在则创建用户,否则获取现有用户。该用户将被授予默认访问 REST API 所需的 *access-rest-api* 权限。**不要忘记之后更改此用户的密码**。如果未设置 *flowable.rest.app.admin.user-id*,则不会创建任何用户或权限。因此,在初始设置后,删除此属性不会删除之前配置的用户或权限。

使用基本的 HTTP 访问认证,因此在执行请求时应始终包含 *Authorization: Basic …​==* HTTP 头,或在请求 URL 中包含用户名和密码(例如, *<http://username:password@localhost:8080/xyz>*)。

**我们建议将基本身份验证与 HTTPS 结合使用。**

### 配置

Flowable REST Web 应用程序使用 Spring Java 配置来启动 Flowable Form 引擎、使用 Spring Security 定义基本身份验证安全性,以及定义特定变量处理的变量转换器。
可以通过更改 WEB-INF/META-INF/flowable-app/flowable-app.properties 文件夹中的 flowable-app.properties 文件来定义少量属性。
如果需要更高级的配置选项,可以在 WEB-INF/classes 文件夹中的 flowable-custom-context.xml 文件中覆盖默认的 Spring bean。
该文件中已经在注释中提供了示例配置。这也是通过定义名为 restResponsefactory 的新 Spring bean 并使用自定义实现类来覆盖默认 RestResponseFactory 的地方。

### 在 Tomcat 中使用

由于 [Tomcat 的默认安全属性](http://tomcat.apache.org/tomcat-8.0-doc/security-howto.html),**默认情况下不允许使用转义的正斜杠(%2F 和 %5C)(将返回 400 结果)**。这可能会影响部署资源及其数据 URL,因为 URL 可能包含转义的正斜杠。

当遇到意外的 400 结果时,请设置以下系统属性:

*-Dorg.apache.tomcat.util.buf.UDecoder.ALLOW\_ENCODED\_SLASH=true*

最佳实践是在下面描述的 HTTP 请求中始终将 **Accept** 和 **Content-Type**(在发布/放置 JSON 的情况下)头设置为 **application/json**。

### HTTP 方法和返回码

<table>
<caption>HTTP 方法及其对应的操作</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>方法</th>
<th>操作</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>GET</p></td>
<td><p>获取单个资源或获取资源集合。</p></td>
</tr>
<tr class="even">
<td><p>POST</p></td>
<td><p>创建新资源。也用于执行请求结构过于复杂而无法适合 GET 请求查询 URL 的资源查询。</p></td>
</tr>
<tr class="odd">
<td><p>PUT</p></td>
<td><p>更新现有资源的属性。也用于在现有资源上调用操作。</p></td>
</tr>
<tr class="even">
<td><p>DELETE</p></td>
<td><p>删除现有资源。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>HTTP 方法响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200 - Ok</p></td>
<td><p>操作成功并已返回响应(GET 和 PUT 请求)。</p></td>
</tr>
<tr class="even">
<td><p>201 - Created</p></td>
<td><p>操作成功,实体已创建并在响应体中返回(POST 请求)。</p></td>
</tr>
<tr class="odd">
<td><p>204 - No content</p></td>
<td><p>操作成功,实体已被删除,因此没有返回响应体(DELETE 请求)。</p></td>
</tr>
<tr class="even">
<td><p>401 - Unauthorized</p></td>
<td><p>操作失败。该操作需要设置身份验证头。如果请求中存在身份验证头,则提供的凭据无效或用户未被授权执行此操作。</p></td>
</tr>
<tr class="odd">
<td><p>403 - Forbidden</p></td>
<td><p>操作被禁止且不应重试。这表明存在授权问题而不是身份验证问题,这是一个不被允许的操作。例如:删除正在运行的流程中的任务是不允许的,并且永远不会被允许,无论用户或流程/任务状态如何。</p></td>
</tr>
<tr class="even">
<td><p>404 - Not found</p></td>
<td><p>操作失败。请求的资源未找到。</p></td>
</tr>
<tr class="odd">
<td><p>405 - Method not allowed</p></td>
<td><p>操作失败。该方法不允许用于此资源。例如,尝试更新(PUT)部署资源将导致 405 状态。</p></td>
</tr>
<tr class="even">
<td><p>409 - Conflict</p></td>
<td><p>操作失败。该操作导致更新一个已被另一个操作更新的资源,这使得更新不再有效。也可以表示在一个已存在具有该标识符的资源的集合中创建资源。</p></td>
</tr>
<tr class="odd">
<td><p>415 - Unsupported Media Type</p></td>
<td><p>操作失败。请求体包含不支持的媒体类型。当请求体 JSON 包含未知属性或值的格式/类型不正确而无法接受时也会出现此情况。</p></td>
</tr>
<tr class="even">
<td><p>500 - Internal server error</p></td>
<td><p>操作失败。执行操作时发生意外异常。响应体包含有关错误的详细信息。</p></td>
</tr>
</tbody>
</table>

HTTP 响应的媒体类型始终为 application/json,除非请求二进制内容(例如,部署资源数据),此时使用内容的媒体类型。

### 错误响应体

当发生错误时(包括客户端和服务器端的 4XX 和 5XX 状态码),响应体包含一个描述所发生错误的对象。以下是一个任务未找到时返回 404 状态的示例:

    {
      "statusCode" : 404,
      "errorMessage" : "Could not find a task with id '444'."
    }

### 请求参数

#### URL 片段

作为 URL 一部分的参数(例如,在 http://host/flowable-rest/event-registry-api/event-registry-repository/deployments/{deploymentId} 中的 deploymentId 参数)
如果片段包含特殊字符,需要正确转义(参见 [URL 编码或百分号编码](https://en.wikipedia.org/wiki/Percent-encoding))。大多数框架都内置了此功能,但应该考虑到这一点。特别是对于可能包含正斜杠的片段(例如,部署资源),这是必需的。

#### REST URL 查询参数

作为查询字符串添加到 URL 中的参数(例如,在 http://host/flowable-rest/event-registry-api/event-registry-repository/deployments?name=Deployment 中使用的 name 参数)可以具有以下类型,并在相应的 REST-API 文档中提到:

<table>
<caption>URL 查询参数类型</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>类型</th>
<th>格式</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>String</p></td>
<td><p>纯文本参数。可以包含 URL 中允许的任何有效字符。对于 XXXLike 参数,字符串应包含通配符字符 %(需要正确 URL 编码)。这允许你指定模糊搜索的意图。例如,'Tas%' 匹配所有以 'Tas' 开头的值。</p></td>
</tr>
<tr class="even">
<td><p>Integer</p></td>
<td><p>表示整数值的参数。只能包含数字非小数值,范围在 -2.147.483.648 到 2.147.483.647 之间。</p></td>
</tr>
<tr class="odd">
<td><p>Long</p></td>
<td><p>表示长整型值的参数。只能包含数字非小数值,范围在 -9.223.372.036.854.775.808 到 9.223.372.036.854.775.807 之间。</p></td>
</tr>
<tr class="even">
<td><p>Boolean</p></td>
<td><p>表示布尔值的参数。只能是 true 或 false。除此之外的任何其他值都将导致 '405 - Bad request' 响应。</p></td>
</tr>
<tr class="odd">
<td><p>Date</p></td>
<td><p>表示日期值的参数。使用 ISO-8601 日期格式(参见 <a href="http://en.wikipedia.org/wiki/ISO_8601">维基百科上的 ISO-8601</a>),同时使用时间和日期组件(例如 2013-04-03T23:45Z)。</p></td>
</tr>
</tbody>
</table>

#### JSON 请求体参数

<table>
<caption>JSON 参数类型</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>类型</th>
<th>格式</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>String</p></td>
<td><p>纯文本参数。对于 XXXLike 参数,字符串应包含通配符字符 %。这允许你指定模糊搜索的意图。例如,'Tas%' 匹配所有以 'Tas' 开头的值。</p></td>
</tr>
<tr class="even">
<td><p>Integer</p></td>
<td><p>表示整数值的参数,使用 JSON 数字。只能包含数字非小数值,范围在 -2.147.483.648 到 2.147.483.647 之间。</p></td>
</tr>
<tr class="odd">
<td><p>Long</p></td>
<td><p>表示长整型值的参数,使用 JSON 数字。只能包含数字非小数值,范围在 -9.223.372.036.854.775.808 到 9.223.372.036.854.775.807 之间。</p></td>
</tr>
<tr class="even">
<td><p>Date</p></td>
<td><p>表示日期值的参数,使用 JSON 文本。使用 ISO-8601 日期格式(参见 <a href="http://en.wikipedia.org/wiki/ISO_8601">维基百科上的 ISO-8601</a>),同时使用时间和日期组件(例如 2013-04-03T23:45Z)。</p></td>
</tr>
</tbody>
</table>

#### 分页和排序

分页和排序参数可以作为查询字符串添加到 URL 中(例如,在 http://host/flowable-rest/event-registry-api/event-registry-repository/deployments?sort=name 中使用的 name 参数)。

<table>
<caption>变量查询 JSON 参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>默认值</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>sort</p></td>
<td><p>因查询实现而异</p></td>
<td><p>排序键的名称,其默认值和允许值因查询实现而异。</p></td>
</tr>
<tr class="even">
<td><p>order</p></td>
<td><p>asc</p></td>
<td><p>排序顺序,可以是 'asc' 或 'desc'。</p></td>
</tr>
<tr class="odd">
<td><p>start</p></td>
<td><p>0</p></td>
<td><p>用于结果分页的参数。默认结果将从 0 开始。</p></td>
</tr>
<tr class="even">
<td><p>size</p></td>
<td><p>10</p></td>
<td><p>用于结果分页的参数。默认大小为 10。</p></td>
</tr>
</tbody>
</table>

> **注意**
>
> 请记住,start 参数用作查询的偏移量。例如,要获取每页三个项目的三页任务(共 9 个项目),我们将使用:
>
>     GET /runtime/tasks?start=0&size=3
>     GET /runtime/tasks?start=3&size=3
>     GET /runtime/tasks?start=6&size=3

## 部署

**当使用 Tomcat 时,请阅读[在 Tomcat 中使用](#usage-in-tomcat)。**

### 事件注册表部署列表

    GET event-registry-repository/deployments

<table>
<caption>URL 查询参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>name</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定名称的部署。</p></td>
</tr>
<tr class="even">
<td><p>nameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回名称类似于给定名称的部署。</p></td>
</tr>
<tr class="odd">
<td><p>category</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定类别的部署。</p></td>
</tr>
<tr class="even">
<td><p>categoryNotEquals</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回不具有给定类别的部署。</p></td>
</tr>
<tr class="odd">
<td><p>parentDeploymentId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定父部署 ID 的部署。</p></td>
</tr>
<tr class="even">
<td><p>parentDeploymentIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回父部署 ID 类似于给定值的部署。</p></td>
</tr>
<tr class="odd">
<td><p>tenantId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定租户 ID 的部署。</p></td>
</tr>
<tr class="even">
<td><p>tenantIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 类似于给定值的部署。</p></td>
</tr>
<tr class="odd">
<td><p>withoutTenantId</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,则仅返回未设置租户 ID 的部署。如果为 false,则忽略 withoutTenantId 参数。</p></td>
</tr>
<tr class="even">
<td><p>sort</p></td>
<td><p>否</p></td>
<td><p>'id'(默认),'name','deploytime' 或 'tenantId'</p></td>
<td><p>要排序的属性,与 'order' 一起使用。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>REST 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示请求成功。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id": "03ab310d-c1de-11e6-a4f4-62ce84ef239e",
          "name": null,
          "deploymentTime": "2016-12-14T10:16:37.000+01:00",
          "category": null,
          "url": "http://localhost:8080/flowable-rest/event-registry-api/event-registry-repository/deployments/03ab310d-c1de-11e6-a4f4-62ce84ef239e",
          "parentDeploymentId": "17510",
          "tenantId": ""
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "id",
      "order": "asc",
      "size": 1
    }

### 获取事件注册表部署

    GET event-registry-repository/deployments/{deploymentId}

<table>
<caption>获取部署 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>deploymentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的部署的标识符。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取部署 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示找到并返回了部署。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的部署。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id": "03ab310d-c1de-11e6-a4f4-62ce84ef239e",
      "name": null,
      "deploymentTime": "2016-12-14T10:16:37.000+01:00",
      "category": null,
      "url": "http://localhost:8080/flowable-rest/event-registry-api/event-registry-repository/deployments/03ab310d-c1de-11e6-a4f4-62ce84ef239e",
      "parentDeploymentId": "17510",
      "tenantId": ""
    }

### 创建新的事件注册表部署

    POST event-registry-repository/deployments

**请求体：**

请求体应包含 *multipart/form-data* 类型的数据。请求中应该只包含一个文件：任何额外的文件都将被忽略。部署名称是传入的文件字段的名称。

可以在请求体中传入一个名为 tenantId 的附加参数(表单字段)。该字段的值将用作执行此部署的租户的标识符。

<table>
<caption>创建新事件部署 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>201</p></td>
<td><p>表示部署已创建。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体中没有内容或内容的 mime 类型不支持部署。状态描述包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体：**

    {
      "id": "03ab310d-c1de-11e6-a4f4-62ce84ef239e",
      "name": "newDeployment1",
      "deploymentTime": "2016-12-14T10:16:37.000+01:00",
      "category": null,
      "url": "http://localhost:8080/flowable-rest/event-registry-api/event-registry-repository/deployments/03ab310d-c1de-11e6-a4f4-62ce84ef239e",
      "parentDeploymentId": "17510",
      "tenantId" : "myTenant"
    }

### 删除事件注册表部署

    DELETE event-registry-repository/deployments/{deploymentId}

<table>
<caption>删除事件注册表部署 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>deploymentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的部署的标识符。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除事件注册表部署 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>204</p></td>
<td><p>表示找到并已删除部署。响应体有意为空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的部署。</p></td>
</tr>
</tbody>
</table>

### 获取事件注册表部署资源内容

    GET event-registry-repository/deployments/{deploymentId}/resourcedata/{resourceId}

<table>
<caption>获取部署资源内容 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>deploymentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>请求的资源所属部署的标识符。</p></td>
</tr>
<tr class="even">
<td><p>resourceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取数据的资源的标识符。<strong>如果 resourceId 包含正斜杠,请确保进行 URL 编码。例如,使用 'events%2Fmy-event.event' 而不是 'events/my-event.event'。</strong></p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取部署资源内容 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示已找到部署和资源,并已返回资源数据。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的部署,或部署中不存在具有给定标识符的资源。状态描述包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体：**

响应体将包含所请求资源的二进制资源内容。响应的内容类型将与资源的 'mimeType' 属性中返回的类型相同。此外,还设置了一个 content-disposition 头,允许浏览器下载文件而不是显示它。

## 事件定义

### 事件定义列表

    GET event-registry-repository/event-definitions

<table>
<caption>事件定义列表 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>version</p></td>
<td><p>否</p></td>
<td><p>integer</p></td>
<td><p>仅返回具有给定版本的事件定义。</p></td>
</tr>
<tr class="even">
<td><p>name</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定名称的事件定义。</p></td>
</tr>
<tr class="odd">
<td><p>nameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回名称类似于给定名称的事件定义。</p></td>
</tr>
<tr class="even">
<td><p>key</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定键的事件定义。</p></td>
</tr>
<tr class="odd">
<td><p>keyLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回键类似于给定键的事件定义。</p></td>
</tr>
<tr class="even">
<td><p>resourceName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定资源名称的事件定义。</p></td>
</tr>
<tr class="odd">
<td><p>resourceNameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回资源名称类似于给定资源名称的事件定义。</p></td>
</tr>
<tr class="even">
<td><p>category</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定类别的事件定义。</p></td>
</tr>
<tr class="odd">
<td><p>categoryLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回类别类似于给定名称的事件定义。</p></td>
</tr>
<tr class="even">
<td><p>categoryNotEquals</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回不具有给定类别的事件定义。</p></td>
</tr>
<tr class="odd">
<td><p>deploymentId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有给定标识符的部署的事件定义。</p></td>
</tr>
<tr class="even">
<td><p>latest</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>仅返回最新的事件定义版本。只能与 'key' 和 'keyLike' 参数一起使用,使用任何其他参数都将导致 400 响应。</p></td>
</tr>
<tr class="odd">
<td><p>sort</p></td>
<td><p>否</p></td>
<td><p>'name'(默认),'id','key','category','deploymentId' 和 'tenantId'</p></td>
<td><p>要排序的属性,与 'order' 一起使用。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>事件定义列表 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示请求成功且已返回事件定义。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误,或者 'latest' 与 'key' 和 'keyLike' 以外的其他参数一起使用。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体：**

    {
      "data": [
            {
          "id": "46b0379c-c0a1-11e6-bc93-6ab56fad108a",
          "url": "http://localhost:8080/flowable-rest/event-registry-api/event-registry-repository/event-definitions/46b0379c-c0a1-11e6-bc93-6ab56fad108a",
          "category": null,
          "name": "Event Definition One",
          "key": "EventDefinitionOne",
          "description": null,
          "version": 3,
          "resourceName": "EventDefinitionOne.event",
          "deploymentId": "46aa6b3a-c0a1-11e6-bc93-6ab56fad108a",
          "parentDeploymentId": "5001",
          "tenantId": ""
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 获取事件定义

    GET event-registry-repository/event-definitions/{eventDefinitionId}

<table>
<caption>获取事件定义 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>eventDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的事件定义的标识符。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取事件定义 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示找到并返回了事件定义。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的事件定义。</p></td>
</tr>
</tbody>
</table>

**成功响应体：**

    {
      "id": "46b0379c-c0a1-11e6-bc93-6ab56fad108a",
      "url": "http://localhost:8080/flowable-rest/event-registry-api/event-registry-repository/event-definitions/46b0379c-c0a1-11e6-bc93-6ab56fad108a",
      "category": null,
      "name": "Event Definition One",
      "key": "EventDefinitionOne",
      "description": null,
      "version": 3,
      "resourceName": "EventDefinitionOne.event",
      "deploymentId": "46aa6b3a-c0a1-11e6-bc93-6ab56fad108a",
      "parentDeploymentId": "5001",
      "tenantId": ""
    }

### 获取事件定义资源内容

    GET event-registry-repository/event-definitions/{eventDefinitionId}/resourcedata

<table>
<caption>获取事件定义资源内容 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>eventDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取资源数据的事件定义的标识符。</p></td>
</tr>
</tbody>
</table>

**响应：**

与 GET event-registry-repository/deployments/{deploymentId}/resourcedata/{resourceId} 完全相同的响应码。

### 获取事件定义模型

    GET event-registry-repository/event-definitions/{eventDefinitionId}/model

<table>
<caption>获取事件定义模型 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>eventDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取模型的事件定义的标识符。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取事件定义模型 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示找到事件定义并返回了模型。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的事件定义。</p></td>
</tr>
</tbody>
</table>

**响应体：**
响应体是 org.flowable.eventregistry.model.EventModel 的 JSON 表示。

    {
       "key": "myEvent",
       "name": "My event",
       "correlationParameters": [
          {
            "name": "customerId",
            "type": "string"
          }
       ],
       "payload": [
          {
            "name": "payload1",
            "type": "string"
          },
          {
            "name": "payload2",
            "type": "integer"
          }
       ]
    }
    
## 通道定义

### 通道定义列表

    GET event-registry-repository/channel-definitions

<table>
<caption>通道定义列表 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>version</p></td>
<td><p>否</p></td>
<td><p>integer</p></td>
<td><p>仅返回具有给定版本的通道定义。</p></td>
</tr>
<tr class="even">
<td><p>name</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定名称的通道定义。</p></td>
</tr>
<tr class="odd">
<td><p>nameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回名称类似于给定名称的通道定义。</p></td>
</tr>
<tr class="even">
<td><p>key</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定键的通道定义。</p></td>
</tr>
<tr class="odd">
<td><p>keyLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回键类似于给定键的通道定义。</p></td>
</tr>
<tr class="even">
<td><p>resourceName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定资源名称的通道定义。</p></td>
</tr>
<tr class="odd">
<td><p>resourceNameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回资源名称类似于给定资源名称的通道定义。</p></td>
</tr>
<tr class="even">
<td><p>category</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定类别的通道定义。</p></td>
</tr>
<tr class="odd">
<td><p>categoryLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回类别类似于给定名称的通道定义。</p></td>
</tr>
<tr class="even">
<td><p>categoryNotEquals</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回不具有给定类别的通道定义。</p></td>
</tr>
<tr class="odd">
<td><p>deploymentId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有给定标识符的部署的通道定义。</p></td>
</tr>
<tr class="even">
<td><p>latest</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>仅返回最新的通道定义版本。只能与 'key' 和 'keyLike' 参数一起使用,使用任何其他参数都将导致 400 响应。</p></td>
</tr>
<tr class="odd">
<td><p>sort</p></td>
<td><p>否</p></td>
<td><p>'name'(默认),'id','key','category','deploymentId' 和 'tenantId'</p></td>
<td><p>要排序的属性,与 'order' 一起使用。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>通道定义列表 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示请求成功且已返回通道定义。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误,或者 'latest' 与 'key' 和 'keyLike' 以外的其他参数一起使用。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体：**

    {
      "data": [
            {
          "id": "46b0379c-c0a1-11e6-bc93-6ab56fad108a",
          "url": "http://localhost:8080/flowable-rest/event-registry-api/event-registry-repository/channel-definitions/46b0379c-c0a1-11e6-bc93-6ab56fad108a",
          "category": null,
          "name": "Channel Definition One",
          "key": "ChannelDefinitionOne",
          "description": null,
          "version": 3,
          "resourceName": "ChannelDefinitionOne.channel",
          "deploymentId": "46aa6b3a-c0a1-11e6-bc93-6ab56fad108a",
          "parentDeploymentId": "5001",
          "tenantId": ""
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 获取通道定义

    GET event-registry-repository/channel-definitions/{channelDefinitionId}

<table>
<caption>获取通道定义 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>channelDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的通道定义的标识符。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取通道定义 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示找到并返回了通道定义。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的通道定义。</p></td>
</tr>
</tbody>
</table>

**成功响应体：**

    {
      "id": "46b0379c-c0a1-11e6-bc93-6ab56fad108a",
      "url": "http://localhost:8080/flowable-rest/event-registry-api/event-registry-repository/channel-definitions/46b0379c-c0a1-11e6-bc93-6ab56fad108a",
      "category": null,
      "name": "Channel Definition One",
      "key": "ChannelDefinitionOne",
      "description": null,
      "version": 3,
      "resourceName": "ChannelDefinitionOne.channel",
      "deploymentId": "46aa6b3a-c0a1-11e6-bc93-6ab56fad108a",
      "parentDeploymentId": "5001",
      "tenantId": ""
    }

### 获取通道定义资源内容

    GET event-registry-repository/channel-definitions/{channelDefinitionId}/resourcedata

<table>
<caption>获取通道定义资源内容 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>channelDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取资源数据的通道定义的标识符。</p></td>
</tr>
</tbody>
</table>

**响应：**

与 GET event-registry-repository/deployments/{deploymentId}/resourcedata/{resourceId} 完全相同的响应码。

### 获取通道定义模型

    GET event-registry-repository/channel-definitions/{channelDefinitionId}/model

<table>
<caption>获取通道定义模型 - URL 参数</caption>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 25%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>值类型</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>channelDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取模型的通道定义的标识符。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取通道定义模型 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示找到通道定义并返回了模型。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的通道定义。</p></td>
</tr>
</tbody>
</table>

**响应体：**
响应体是 org.flowable.eventregistry.model.ChannelModel 的 JSON 表示。

    {
       "key": "myChannel",
       "category": "channel",
       "name": "My channel",
       "description": "My channel description",
       "channelType": "inbound",
       "type": "jms",
       "destination": "testQueue",
       "deserializerType": "json",
       "channelEventKeyDetection": {
          "fixedValue": "myEvent"
       }
    }

## 事件注册表服务

### 发送事件

    POST event-registry-runtime/event-instances

**请求体：**

   {
      "eventDefinitionKey": "myEvent",
      "eventPayload": {
          "customerName": "John Doe",
          "productName": "Laptop"
      },
      "tenantId": "tenant1"
   }
   
除了事件定义键之外，也可以使用事件定义 ID。

发送事件时没有响应体。

<table>
<caption>发送事件 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>201</p></td>
<td><p>表示事件已发送。</p></td>
</tr>
</tbody>
</table>

## 引擎

### 获取事件注册表引擎信息

    GET event-registry-management/engine

返回此 REST 服务中使用的事件注册表引擎的只读视图。

**成功响应体：**

    {
       "name":"default",
       "version":"6.6.0"
    }

<table>
<caption>获取引擎信息 - 响应码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应码</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200</p></td>
<td><p>表示已返回引擎信息。</p></td>
</tr>
</tbody>
</table>