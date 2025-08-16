---
id: ch14-REST
title: REST API
description: Flowable REST API文档详解安装配置与认证方式，提供基于Spring MVC的JSON格式接口管理，支持Tomcat部署与HTTPS安全认证，包含权限设置和数据库连接指南。
keywords: Flowable,REST API,BPMN,Spring MVC,JSON,认证配置,Tomcat部署,HTTPS安全
---

## Flowable REST 基本原则

### 安装和认证

Flowable 包含一个 REST API,可以通过将 flowable-rest.war 文件部署到 Apache Tomcat 等 servlet 容器来安装。此外,也可以通过在应用程序中包含 servlet(及其映射)并将所有 flowable-rest 依赖项添加到类路径中来在其他 Web 应用程序中使用。

默认情况下,Flowable 引擎将连接到内存中的 H2 数据库。你可以在 *WEB-INF/META-INF/flowable-app* 文件夹中的 flowable-app.properties 文件中更改数据库设置。REST API 使用 JSON 格式(<http://www.json.org>),并基于 Spring MVC(<http://docs.spring.io/spring/docs/current/spring-framework-reference/html/mvc.html>)构建。

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

Flowable REST web 应用程序使用 Spring Java 配置来启动 Flowable Form 引擎、使用 Spring Security 定义基本认证安全性,以及为特定变量处理定义变量转换器。
可以通过修改 WEB-INF/META-INF/flowable-app/flowable-app.properties 文件夹中的 flowable-app.properties 文件来定义少量属性。
如果需要更高级的配置选项,可以在 WEB-INF/classes 文件夹中的 flowable-custom-context.xml 文件中覆盖默认的 Spring beans。
该文件中已经包含了示例配置的注释。这里也是通过定义一个名为 restResponsefactory 的新 Spring bean 并使用自定义实现类来覆盖默认 RestResponseFactory 的地方。

### 在 Tomcat 中使用

由于 [Tomcat 的默认安全属性](http://tomcat.apache.org/tomcat-8.0-doc/security-howto.html),**默认情况下不允许使用转义的正斜杠(%2F 和 %5C)(会返回 400 错误)**。这可能会影响部署资源及其数据 URL,因为 URL 可能包含转义的正斜杠。

当遇到意外的 400 错误时,请设置以下系统属性:

*-Dorg.apache.tomcat.util.buf.UDecoder.ALLOW\_ENCODED\_SLASH=true*

对于下面描述的 HTTP 请求,最佳实践是始终将 **Accept** 和 **Content-Type**(在发送/上传 JSON 时)头设置为 **application/json**。

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
<td><p>获取单个资源或资源集合。</p></td>
</tr>
<tr class="even">
<td><p>POST</p></td>
<td><p>创建新资源。也用于执行请求结构过于复杂而无法适合 GET 请求查询 URL 的资源查询。</p></td>
</tr>
<tr class="odd">
<td><p>PUT</p></td>
<td><p>更新现有资源的属性。也用于调用现有资源上的操作。</p></td>
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
<td><p>操作成功,并已返回响应(GET 和 PUT 请求)。</p></td>
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
<td><p>操作失败。该操作需要设置认证头。如果请求中包含认证头,则提供的凭据无效或用户未被授权执行此操作。</p></td>
</tr>
<tr class="odd">
<td><p>403 - Forbidden</p></td>
<td><p>操作被禁止,不应重试。这表明存在授权问题而不是认证问题,这是一个不被允许的操作。例如:删除正在运行的流程中的任务是不允许的,并且永远不会被允许,无论用户或流程/任务状态如何。</p></td>
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
<td><p>操作失败。该操作导致更新一个已被另一个操作更新的资源,这使得更新不再有效。也可能表示在一个已存在具有该标识符的资源的集合中创建资源。</p></td>
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

HTTP 响应的媒体类型始终为 application/json,除非请求的是二进制内容(例如,部署资源数据),这种情况下将使用内容本身的媒体类型。

### 错误响应体

当发生错误时(包括客户端和服务器的 4XX 和 5XX 状态码),响应体包含一个描述所发生错误的对象。以下是找不到任务时返回 404 状态的示例:

    {
      "statusCode" : 404,
      "errorMessage" : "Could not find a task with id '444'."
    }

### 请求参数

#### URL 片段

作为 URL 一部分的参数(例如,在 http://host/flowable-rest/process-api/repository/deployments/{deploymentId} 中的 deploymentId 参数)
如果片段包含特殊字符,需要正确转义(参见 [URL 编码或百分号编码](https://en.wikipedia.org/wiki/Percent-encoding))。大多数框架都内置了此功能,但仍需要注意这一点。特别是对于可能包含正斜杠的片段(例如,部署资源),这是必需的。

#### REST URL 查询参数

作为查询字符串添加到 URL 中的参数(例如,在 http://host/flowable-rest/process-api/repository/deployments?name=Deployment 中使用的 name 参数)可以具有以下类型,这些类型在相应的 REST-API 文档中都有说明:

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
<td><p>纯文本参数。可以包含 URL 中允许的任何有效字符。对于 XXXLike 参数,字符串应包含通配符 %(需要正确进行 URL 编码)。这允许你指定模糊搜索的意图。例如,'Tas%' 匹配所有以 'Tas' 开头的值。</p></td>
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
<td><p>表示布尔值的参数。只能是 true 或 false。除此之外的任何其他值都会导致 '405 - Bad request' 响应。</p></td>
</tr>
<tr class="odd">
<td><p>Date</p></td>
<td><p>表示日期值的参数。使用 ISO-8601 日期格式(参见 <a href="http://en.wikipedia.org/wiki/ISO_8601">维基百科上的 ISO-8601</a>),同时包含时间和日期组件(例如 2013-04-03T23:45Z)。</p></td>
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
<td><p>纯文本参数。对于 XXXLike 参数,字符串应包含通配符 %。这允许你指定模糊搜索的意图。例如,'Tas%' 匹配所有以 'Tas' 开头的值。</p></td>
</tr>
<tr class="even">
<td><p>Integer</p></td>
<td><p>使用 JSON 数字表示整数值的参数。只能包含数字非小数值,范围在 -2.147.483.648 到 2.147.483.647 之间。</p></td>
</tr>
<tr class="odd">
<td><p>Long</p></td>
<td><p>使用 JSON 数字表示长整型值的参数。只能包含数字非小数值,范围在 -9.223.372.036.854.775.808 到 9.223.372.036.854.775.807 之间。</p></td>
</tr>
<tr class="even">
<td><p>Date</p></td>
<td><p>使用 JSON 文本表示日期值的参数。使用 ISO-8601 日期格式(参见 <a href="http://en.wikipedia.org/wiki/ISO_8601">维基百科上的 ISO-8601</a>),同时包含时间和日期组件(例如 2013-04-03T23:45Z)。</p></td>
</tr>
</tbody>
</table>

#### 分页和排序

分页和排序参数可以作为查询字符串添加到 URL 中(例如,在 http://host/flowable-rest/process-api/repository/deployments?sort=name 中使用的 name 参数)。

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
<td><p>排序顺序,可以是 'asc'(升序)或 'desc'(降序)。</p></td>
</tr>
<tr class="odd">
<td><p>start</p></td>
<td><p>0</p></td>
<td><p>用于结果分页的参数。默认情况下,结果将从 0 开始。</p></td>
</tr>
<tr class="even">
<td><p>size</p></td>
<td><p>10</p></td>
<td><p>用于结果分页的参数。默认情况下,每页大小为 10。</p></td>
</tr>
</tbody>
</table>

> **注意**
>
> 请记住,start 参数用作查询的偏移量。例如,要获取每页包含三个项目的三页任务(共 9 个项目),我们可以使用:
>
>     GET /runtime/tasks?start=0&size=3
>     GET /runtime/tasks?start=3&size=3
>     GET /runtime/tasks?start=6&size=3

#### JSON 查询变量格式

    {
      "name" : "variableName",
      "value" : "variableValue", 
      "operation" : "equals",
      "type" : "string"
    }

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
<th>是否必需</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>name</p></td>
<td><p>否</p></td>
<td><p>要包含在查询中的变量名称。当在某些查询中使用 'equals' 来查询具有给定值的<strong>任何变量名</strong>的资源时,可以为空。</p></td>
</tr>
<tr class="even">
<td><p>value</p></td>
<td><p>是</p></td>
<td><p>查询中包含的变量值,应该包含给定类型的正确格式。</p></td>
</tr>
<tr class="odd">
<td><p>operator</p></td>
<td><p>是</p></td>
<td><p>查询中使用的运算符,可以具有以下值:equals(等于)、notEquals(不等于)、equalsIgnoreCase(忽略大小写等于)、notEqualsIgnoreCase(忽略大小写不等于)、lessThan(小于)、greaterThan(大于)、lessThanOrEquals(小于等于)、greaterThanOrEquals(大于等于)和 like(模糊匹配)。</p></td>
</tr>
<tr class="even">
<td><p>type</p></td>
<td><p>否</p></td>
<td><p>要使用的变量类型。如果省略,将从 value 参数推断类型。任何 JSON 文本值都将被视为 string 类型,JSON 布尔值为 boolean 类型,JSON 数字根据其大小被视为 long 或 integer 类型。当有疑问时,我们建议您包含显式类型。下面列出了开箱即用支持的类型。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>默认查询 JSON 类型</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>类型名称</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>string</p></td>
<td><p>值被视为并转换为 java.lang.String。</p></td>
</tr>
<tr class="even">
<td><p>short</p></td>
<td><p>值被视为并转换为 java.lang.Integer。</p></td>
</tr>
<tr class="odd">
<td><p>integer</p></td>
<td><p>值被视为并转换为 java.lang.Integer。</p></td>
</tr>
<tr class="even">
<td><p>long</p></td>
<td><p>值被视为并转换为 java.lang.Long。</p></td>
</tr>
<tr class="odd">
<td><p>double</p></td>
<td><p>值被视为并转换为 java.lang.Double。</p></td>
</tr>
<tr class="even">
<td><p>boolean</p></td>
<td><p>值被视为并转换为 java.lang.Boolean。</p></td>
</tr>
<tr class="odd">
<td><p>date</p></td>
<td><p>值被视为并转换为 java.util.Date。JSON 字符串将使用 ISO-8601 日期格式进行转换。</p></td>
</tr>
</tbody>
</table>

#### 变量表示

在处理变量(执行决策)时,REST API 在读写操作中使用一些通用原则和 JSON 格式。变量的 JSON 表示如下所示:

    {
      "name" : "variableName",
      "value" : "variableValue",
      "valueUrl" : "http://...",
      "type" : "string"
    }

<table>
<caption>变量 JSON 属性</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>是否必需</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>name</p></td>
<td><p>是</p></td>
<td><p>变量的名称。</p></td>
</tr>
<tr class="even">
<td><p>value</p></td>
<td><p>否</p></td>
<td><p>变量的值。在写入变量时如果省略该值,将使用 null 作为值。</p></td>
</tr>
<tr class="odd">
<td><p>valueUrl</p></td>
<td><p>否</p></td>
<td><p>当读取二进制或可序列化类型的变量时,此属性将指向可以获取原始二进制数据的 URL。</p></td>
</tr>
<tr class="even">
<td><p>type</p></td>
<td><p>否</p></td>
<td><p>变量的类型。有关类型的其他信息,请参见下表。在写入变量时如果省略此值,类型将从原始 JSON 属性请求类型推断,并限制为 string、double、integer 和 boolean。我们建议始终包含类型,以确保不会对类型做出错误的假设。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>变量类型</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>类型名称</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>string</p></td>
<td><p>值被视为 java.lang.String。写入变量时使用原始 JSON 文本值。</p></td>
</tr>
<tr class="even">
<td><p>integer</p></td>
<td><p>值被视为 java.lang.Integer。写入时,使用 JSON 数字值作为转换基础,如果失败则回退到 JSON 文本。</p></td>
</tr>
<tr class="odd">
<td><p>short</p></td>
<td><p>值被视为 java.lang.Short。写入时,使用 JSON 数字值作为转换基础,如果失败则回退到 JSON 文本。</p></td>
</tr>
<tr class="even">
<td><p>long</p></td>
<td><p>值被视为 java.lang.Long。写入时,使用 JSON 数字值作为转换基础,如果失败则回退到 JSON 文本。</p></td>
</tr>
<tr class="odd">
<td><p>double</p></td>
<td><p>值被视为 java.lang.Double。写入时,使用 JSON 数字值作为转换基础,如果失败则回退到 JSON 文本。</p></td>
</tr>
<tr class="even">
<td><p>boolean</p></td>
<td><p>值被视为 java.lang.Boolean。写入时,使用 JSON 布尔值进行转换。</p></td>
</tr>
<tr class="odd">
<td><p>date</p></td>
<td><p>值被视为 java.util.Date。写入时,JSON 文本将使用 ISO-8601 日期格式进行转换。</p></td>
</tr>
</tbody>
</table>

可以通过自定义 JSON 表示(简单值或复杂/嵌套 JSON 对象)来支持其他变量类型。通过扩展 org.flowable.dmn.rest.service.api.DmnRestResponseFactory 上的 initializeVariableConverters() 方法,您可以添加额外的 org.flowable.rest.variable.RestVariableConverter 类,以支持将您的 POJO 转换为适合通过 REST 传输的格式,并将 REST 值转换回您的 POJO。实际的 JSON 转换由 Jackson 完成。

## 部署

**当使用 Tomcat 时,请阅读[在 Tomcat 中使用](#usage-In-tomcat)。**

### 部署列表

    GET repository/deployments

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
<td><p>'id'(默认)、'name'、'deployTime' 或 'tenantId'</p></td>
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
          "id": "10",
          "name": "flowable-examples.bar",
          "deploymentTime": "2010-10-13T14:54:26.750+02:00", 
          "category": "examples",
          "url": "http://localhost:8081/flowable-rest/service/repository/deployments/10",
          "tenantId": null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "id",
      "order": "asc",
      "size": 1
    }

### 获取部署

    GET repository/deployments/{deploymentId}

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
<td><p>要获取的部署的 ID。</p></td>
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
      "id": "10",
      "name": "flowable-examples.bar",
      "deploymentTime": "2010-10-13T14:54:26.750+02:00",
      "category": "examples",
      "url": "http://localhost:8081/flowable-rest/service/repository/deployments/10",
      "tenantId" : null
    }

### 创建新部署

    POST repository/deployments

**请求体:**

请求体应包含 *multipart/form-data* 类型的数据。请求中应该只包含一个文件,任何额外的文件都将被忽略。部署名称是传入的文件字段的名称。如果需要在单个部署中部署多个资源,请将资源压缩成 zip 文件,并确保文件名以 .bar 或 .zip 结尾。

可以在请求体中传入一个名为 tenantId 的额外参数(表单字段)。该字段的值将用作执行此部署的租户的 ID。

<table>
<caption>创建新部署 - 响应码</caption>
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
<td><p>表示请求体中没有内容或内容的 mime-type 不支持部署。状态描述包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id": "10",
      "name": "flowable-examples.bar",
      "deploymentTime": "2010-10-13T14:54:26.750+02:00",
      "category": null,
      "url": "http://localhost:8081/flowable-rest/service/repository/deployments/10",
      "tenantId" : "myTenant"
    }

### 删除部署

    DELETE repository/deployments/{deploymentId}

<table>
<caption>删除部署 - URL 参数</caption>
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
<td><p>要删除的部署的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除部署 - 响应码</caption>
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

### 列出部署中的资源

    GET repository/deployments/{deploymentId}/resources

<table>
<caption>列出部署中的资源 - URL 参数</caption>
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
<td><p>要获取资源的部署 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>列出部署中的资源 - 响应码</caption>
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
<td><p>表示找到部署并已返回资源列表。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的部署。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
      {
        "id": "diagrams/my-process.bpmn20.xml",
        "url": "http://localhost:8081/flowable-rest/service/repository/deployments/10/resources/diagrams%2Fmy-process.bpmn20.xml",
        "dataUrl": "http://localhost:8081/flowable-rest/service/repository/deployments/10/resourcedata/diagrams%2Fmy-process.bpmn20.xml",
        "mediaType": "text/xml",
        "type": "processDefinition"
      },
      {
        "id": "image.png",
        "url": "http://localhost:8081/flowable-rest/service/repository/deployments/10/resources/image.png",
        "dataUrl": "http://localhost:8081/flowable-rest/service/repository/deployments/10/resourcedata/image.png",
        "mediaType": "image/png",
        "type": "resource"
      }
    ]

-   mediaType: 包含资源的媒体类型。这是通过(可插拔的)MediaTypeResolver 解析的,默认情况下包含有限数量的 mime-type 映射。

-   type: 资源类型,可能的值:

-   resource: 普通资源。

-   processDefinition: 包含一个或多个流程定义的资源。此资源由部署器获取。

-   processImage: 表示已部署流程定义的图形布局的资源。

*单个资源的结果 JSON 中的 dataUrl 属性包含用于检索二进制资源的实际 URL。*

### 获取部署资源

    GET repository/deployments/{deploymentId}/resources/{resourceId}

<table>
<caption>获取部署资源 - URL 参数</caption>
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
<td><p>请求的资源所属的部署的 ID。</p></td>
</tr>
<tr class="even">
<td><p>resourceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的资源的 ID。<strong>如果 resourceId 包含正斜杠,请确保进行 URL 编码。例如:使用 'diagrams%2Fmy-process.bpmn20.xml' 而不是 'diagrams/my-process.bpmn20.xml'。</strong></p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取部署资源 - 响应码</caption>
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
<td><p>表示已找到部署和资源,并已返回资源。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的部署,或部署中不存在具有给定 ID 的资源。状态描述包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id": "diagrams/my-process.bpmn20.xml",
      "url": "http://localhost:8081/flowable-rest/service/repository/deployments/10/resources/diagrams%2Fmy-process.bpmn20.xml",
      "dataUrl": "http://localhost:8081/flowable-rest/service/repository/deployments/10/resourcedata/diagrams%2Fmy-process.bpmn20.xml",
      "mediaType": "text/xml",
      "type": "processDefinition"
    }

-   mediaType: 包含资源的媒体类型。这是通过(可插拔的)MediaTypeResolver 解析的,默认情况下包含有限数量的 mime-type 映射。

-   type: 资源类型,可能的值:

-   resource: 普通资源。

-   processDefinition: 包含一个或多个流程定义的资源。此资源由部署器获取。

-   processImage: 表示已部署流程定义的图形布局的资源。

### 获取部署资源内容

    GET repository/deployments/{deploymentId}/resourcedata/{resourceId}

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
<td><p>请求的资源所属的部署的 ID。</p></td>
</tr>
<tr class="even">
<td><p>resourceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取数据的资源的 ID。<strong>如果 resourceId 包含正斜杠,请确保进行 URL 编码。例如:使用 'diagrams%2Fmy-process.bpmn20.xml' 而不是 'diagrams/my-process.bpmn20.xml'。</strong></p></td>
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
<td><p>表示未找到请求的部署,或部署中不存在具有给定 ID 的资源。状态描述包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体将包含请求资源的二进制资源内容。响应的 content-type 将与资源的 'mimeType' 属性中返回的类型相同。此外,还设置了 content-disposition 头,允许浏览器下载文件而不是显示它。

## 流程定义

### 流程定义列表

    GET repository/process-definitions

<table>
<caption>流程定义列表 - URL 参数</caption>
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
<td><p>仅返回具有给定版本的流程定义。</p></td>
</tr>
<tr class="even">
<td><p>name</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定名称的流程定义。</p></td>
</tr>
<tr class="odd">
<td><p>nameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回名称类似于给定名称的流程定义。</p></td>
</tr>
<tr class="even">
<td><p>key</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定键的流程定义。</p></td>
</tr>
<tr class="odd">
<td><p>keyLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回键类似于给定键的流程定义。</p></td>
</tr>
<tr class="even">
<td><p>resourceName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定资源名称的流程定义。</p></td>
</tr>
<tr class="odd">
<td><p>resourceNameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回资源名称类似于给定资源名称的流程定义。</p></td>
</tr>
<tr class="even">
<td><p>category</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定类别的流程定义。</p></td>
</tr>
<tr class="odd">
<td><p>categoryLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回类别类似于给定名称的流程定义。</p></td>
</tr>
<tr class="even">
<td><p>categoryNotEquals</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回不具有给定类别的流程定义。</p></td>
</tr>
<tr class="odd">
<td><p>deploymentId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有给定 ID 的部署的流程定义。</p></td>
</tr>
<tr class="even">
<td><p>startableByUser</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回可以由给定用户启动的流程定义。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>流程定义列表 - 响应码</caption>
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
<td><p>表示请求成功,并已返回流程定义。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误,或者 'latest' 参数与除 'key' 和 'keyLike' 之外的其他参数一起使用。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "oneTaskProcess:1:4",
          "url" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "version" : 1,
          "key" : "oneTaskProcess",
          "category" : "Examples",
          "suspended" : false,
          "name" : "The One Task Process",
          "description" : "This is a process for testing purposes",
          "deploymentId" : "2",
          "deploymentUrl" : "http://localhost:8081/repository/deployments/2",
          "graphicalNotationDefined" : true,
          "resource" : "http://localhost:8182/repository/deployments/2/resources/testProcess.xml",
          "diagramResource" : "http://localhost:8182/repository/deployments/2/resources/testProcess.png",
          "startFormDefined" : false
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

-   graphicalNotationDefined: 表示流程定义包含图形信息(BPMN DI)。

-   resource: 包含实际部署的 BPMN 2.0 xml。

-   diagramResource: 包含流程的图形表示,如果没有可用的图表则为 null。

### 获取流程定义

    GET repository/process-definitions/{processDefinitionId}

<table>
<caption>获取流程定义 - URL 参数</caption>
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
<td><p>processDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的流程定义的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程定义 - 响应码</caption>
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
<td><p>表示已找到并返回流程定义。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id" : "oneTaskProcess:1:4",
      "url" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
      "version" : 1,
      "key" : "oneTaskProcess",
      "category" : "Examples",
      "suspended" : false,
      "name" : "The One Task Process",
      "description" : "This is a process for testing purposes",
      "deploymentId" : "2",
      "deploymentUrl" : "http://localhost:8081/repository/deployments/2",
      "graphicalNotationDefined" : true,
      "resource" : "http://localhost:8182/repository/deployments/2/resources/testProcess.xml",
      "diagramResource" : "http://localhost:8182/repository/deployments/2/resources/testProcess.png",
      "startFormDefined" : false
    }

-   graphicalNotationDefined: 表示流程定义包含图形信息(BPMN DI)。

-   resource: 包含实际部署的 BPMN 2.0 xml。

-   diagramResource: 包含流程的图形表示,如果没有可用的图表则为 null。

### 更新流程定义的类别

    PUT repository/process-definitions/{processDefinitionId}

**请求体 JSON:**

    {
      "category" : "updatedcategory"
    }

<table>
<caption>更新流程定义的类别 - 响应码</caption>
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
<td><p>表示流程的类别已被修改。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体中未定义类别。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 repository/process-definitions/{processDefinitionId} 的响应。

### 获取流程定义资源内容

    GET repository/process-definitions/{processDefinitionId}/resourcedata

<table>
<caption>获取流程定义资源内容 - URL 参数</caption>
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
<td><p>processDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取资源数据的流程定义的 ID。</p></td>
</tr>
</tbody>
</table>

**响应:**

与 GET repository/deployment/{deploymentId}/resourcedata/{resourceId} 完全相同的响应码/响应体。

### 获取流程定义的 BPMN 模型

    GET repository/process-definitions/{processDefinitionId}/model

<table>
<caption>获取流程定义的 BPMN 模型 - URL 参数</caption>
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
<td><p>processDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取模型的流程定义的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程定义的 BPMN 模型 - 响应码</caption>
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
<td><p>表示已找到流程定义并已返回模型。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义。</p></td>
</tr>
</tbody>
</table>

**响应体:**
响应体是 org.flowable.bpmn.model.BpmnModel 的 JSON 表示,包含完整的流程定义模型。

    {
       "processes":[
          {
             "id":"oneTaskProcess",
             "xmlRowNumber":7,
             "xmlColumnNumber":60,
             "extensionElements":{

             },
             "name":"The One Task Process",
             "executable":true,
             "documentation":"One task process description",

        ]
    }

### 挂起流程定义

    PUT repository/process-definitions/{processDefinitionId}

**请求体 JSON:**

    {
      "action" : "suspend",
      "includeProcessInstances" : "false",
      "date" : "2013-04-15T00:42:12Z"
    }

<table>
<caption>挂起流程定义 - JSON 请求体参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>是否必需</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>action</p></td>
<td><p>要执行的操作。可以是 activate 或 suspend。</p></td>
<td><p>是</p></td>
</tr>
<tr class="even">
<td><p>includeProcessInstances</p></td>
<td><p>是否挂起/激活此流程定义的运行中的流程实例。如果省略,流程实例将保持其当前状态。</p></td>
<td><p>否</p></td>
</tr>
<tr class="odd">
<td><p>date</p></td>
<td><p>执行挂起/激活操作的日期(ISO-8601格式)。如果省略,挂起/激活将立即生效。</p></td>
<td><p>否</p></td>
</tr>
</tbody>
</table>

<table>
<caption>挂起流程定义 - 响应码</caption>
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
<td><p>表示流程已被挂起。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义。</p></td>
</tr>
<tr class="odd">
<td><p>409</p></td>
<td><p>表示请求的流程定义已经处于挂起状态。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 repository/process-definitions/{processDefinitionId} 的响应。

### 激活流程定义

    PUT repository/process-definitions/{processDefinitionId}

**请求体 JSON:**

    {
      "action" : "activate",
      "includeProcessInstances" : "true",
      "date" : "2013-04-15T00:42:12Z"
    }

参见挂起流程定义的 [JSON 请求体参数](#json-body-parameters)。

<table>
<caption>激活流程定义 - 响应码</caption>
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
<td><p>表示流程已被激活。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义。</p></td>
</tr>
<tr class="odd">
<td><p>409</p></td>
<td><p>表示请求的流程定义已经处于激活状态。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 repository/process-definitions/{processDefinitionId} 的响应。

### 获取流程定义的所有候选启动者

    GET repository/process-definitions/{processDefinitionId}/identitylinks

<table>
<caption>获取流程定义的所有候选启动者 - URL 参数</caption>
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
<td><p>processDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取身份链接的流程定义的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程定义的所有候选启动者 - 响应码</caption>
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
<td><p>表示已找到流程定义并已返回请求的身份链接。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
       {
          "url":"http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4/identitylinks/groups/admin",
          "user":null,
          "group":"admin",
          "type":"candidate"
       },
       {
          "url":"http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4/identitylinks/users/kermit",
          "user":"kermit",
          "group":null,
          "type":"candidate"
       }
    ]

### 为流程定义添加候选启动者

    POST repository/process-definitions/{processDefinitionId}/identitylinks

<table>
<caption>为流程定义添加候选启动者 - URL 参数</caption>
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
<td><p>processDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>流程定义的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体(用户):**

    {
      "user" : "kermit"
    }

**请求体(用户组):**

    {
      "groupId" : "sales"
    }

<table>
<caption>为流程定义添加候选启动者 - 响应码</caption>
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
<td><p>表示已找到流程定义并已创建身份链接。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "url":"http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4/identitylinks/users/kermit",
      "user":"kermit",
      "group":null,
      "type":"candidate"
    }

### 从流程定义中删除候选启动者

    DELETE repository/process-definitions/{processDefinitionId}/identitylinks/{family}/{identityId}

<table>
<caption>从流程定义中删除候选启动者 - URL 参数</caption>
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
<td><p>processDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>流程定义的 ID。</p></td>
</tr>
<tr class="even">
<td><p>family</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>根据身份链接的类型,可以是 users 或 groups。</p></td>
</tr>
<tr class="odd">
<td><p>identityId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要移除候选启动者身份的用户 ID 或用户组 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>从流程定义中删除候选启动者 - 响应码</caption>
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
<td><p>表示已找到流程定义并已移除身份链接。响应体有意为空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义,或流程定义没有与 URL 匹配的身份链接。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "url":"http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4/identitylinks/users/kermit",
      "user":"kermit",
      "group":null,
      "type":"candidate"
    }

### 获取流程定义的候选启动者

    GET repository/process-definitions/{processDefinitionId}/identitylinks/{family}/{identityId}

<table>
<caption>获取流程定义的候选启动者 - URL 参数</caption>
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
<td><p>processDefinitionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>流程定义的 ID。</p></td>
</tr>
<tr class="even">
<td><p>family</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>根据身份链接的类型,可以是 users 或 groups。</p></td>
</tr>
<tr class="odd">
<td><p>identityId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取作为候选启动者的用户 ID 或用户组 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程定义的候选启动者 - 响应码</caption>
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
<td><p>表示已找到流程定义并已返回身份链接。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程定义,或流程定义没有与 URL 匹配的身份链接。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "url":"http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4/identitylinks/users/kermit",
      "user":"kermit",
      "group":null,
      "type":"candidate"
    }

## 模型

### 获取模型列表

    GET repository/models

<table>
<caption>获取模型列表 - URL 查询参数</caption>
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
<td><p>id</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定 ID 的模型。</p></td>
</tr>
<tr class="even">
<td><p>category</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定类别的模型。</p></td>
</tr>
<tr class="odd">
<td><p>categoryLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回类别类似于给定值的模型。使用 % 字符作为通配符。</p></td>
</tr>
<tr class="even">
<td><p>categoryNotEquals</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回不具有给定类别的模型。</p></td>
</tr>
<tr class="odd">
<td><p>name</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定名称的模型。</p></td>
</tr>
<tr class="even">
<td><p>nameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回名称类似于给定值的模型。使用 % 字符作为通配符。</p></td>
</tr>
<tr class="odd">
<td><p>key</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定键的模型。</p></td>
</tr>
<tr class="even">
<td><p>deploymentId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回在给定部署中部署的模型。</p></td>
</tr>
<tr class="odd">
<td><p>version</p></td>
<td><p>否</p></td>
<td><p>Integer</p></td>
<td><p>仅返回具有给定版本的模型。</p></td>
</tr>
<tr class="even">
<td><p>latestVersion</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true，仅返回最新版本的模型。最好与 key 一起使用。如果传入值为 false，则忽略此参数并返回所有版本。</p></td>
</tr>
<tr class="odd">
<td><p>deployed</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true，仅返回已部署的模型。如果为 false，仅返回未部署的模型（deploymentId 为 null）。</p></td>
</tr>
<tr class="even">
<td><p>tenantId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定租户 ID 的模型。</p></td>
</tr>
<tr class="odd">
<td><p>tenantIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 类似于给定值的模型。</p></td>
</tr>
<tr class="even">
<td><p>withoutTenantId</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true，仅返回未设置租户 ID 的模型。如果为 false，则忽略 withoutTenantId 参数。</p></td>
</tr>
<tr class="odd">
<td><p>sort</p></td>
<td><p>否</p></td>
<td><p>'id'(默认)、'category'、'createTime'、'key'、'lastUpdateTime'、'name'、'version' 或 'tenantId'</p></td>
<td><p>要排序的属性，与 'order' 参数一起使用。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取模型列表 - 响应码</caption>
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
<td><p>表示请求成功,并已返回模型列表。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
          {
             "name":"模型名称",
             "key":"模型键",
             "category":"模型类别",
             "version":2,
             "metaInfo":"模型元信息",
             "deploymentId":"7",
             "id":"10",
             "url":"http://localhost:8182/repository/models/10",
             "createTime":"2013-06-12T14:31:08.612+0000",
             "lastUpdateTime":"2013-06-12T14:31:08.612+0000",
             "deploymentUrl":"http://localhost:8182/repository/deployments/7",
             "tenantId":null
          },

          ...

       ],
       "total":2,
       "start":0,
       "sort":"id",
       "order":"asc",
       "size":2
    }

### 获取模型

    GET repository/models/{modelId}

<table>
<caption>获取模型 - URL 参数</caption>
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
<td><p>modelId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的模型的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取模型 - 响应码</caption>
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
<td><p>表示已找到并返回模型。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的模型。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"5",
       "url":"http://localhost:8182/repository/models/5",
       "name":"模型名称",
       "key":"模型键",
       "category":"模型类别",
       "version":2,
       "metaInfo":"模型元信息",
       "deploymentId":"2",
       "deploymentUrl":"http://localhost:8182/repository/deployments/2",
       "createTime":"2013-06-12T12:31:19.861+0000",
       "lastUpdateTime":"2013-06-12T12:31:19.861+0000",
       "tenantId":null
    }

### 更新模型

    PUT repository/models/{modelId}

**请求体:**

    {
       "name":"模型名称",
       "key":"模型键",
       "category":"模型类别", 
       "version":2,
       "metaInfo":"模型元信息",
       "deploymentId":"2",
       "tenantId":"updatedTenant"
    }

所有请求值都是可选的。例如,你可以在请求体 JSON 对象中只包含 'name' 属性,这样只会更新模型的名称,而不会影响其他字段。当显式包含某个属性并将其设置为 null 时,模型中对应的值将被更新为 null。例如: {"metaInfo" : null} 将清除模型的元信息。

<table>
<caption>更新模型 - 响应码</caption>
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
<td><p>表示已找到并更新模型。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的模型。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"5",
       "url":"http://localhost:8182/repository/models/5",
       "name":"模型名称",
       "key":"模型键",
       "category":"模型类别",
       "version":2,
       "metaInfo":"模型元信息",
       "deploymentId":"2",
       "deploymentUrl":"http://localhost:8182/repository/deployments/2",
       "createTime":"2013-06-12T12:31:19.861+0000",
       "lastUpdateTime":"2013-06-12T12:31:19.861+0000",
       "tenantId":"updatedTenant"
    }

### 创建模型

    POST repository/models

**请求体:**

    {
       "name":"模型名称",
       "key":"模型键",
       "category":"模型类别",
       "version":1,
       "metaInfo":"模型元信息",
       "deploymentId":"2",
       "tenantId":"tenant"
    }

所有请求值都是可选的。例如,你可以在请求体 JSON 对象中只包含 'name' 属性,这样只会设置模型的名称,而其他字段将保持为 null。

<table>
<caption>创建模型 - 响应码</caption>
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
<td><p>表示模型已创建。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"5",
       "url":"http://localhost:8182/repository/models/5",
       "name":"模型名称",
       "key":"模型键",
       "category":"模型类别",
       "version":1,
       "metaInfo":"模型元信息",
       "deploymentId":"2",
       "deploymentUrl":"http://localhost:8182/repository/deployments/2",
       "createTime":"2013-06-12T12:31:19.861+0000",
       "lastUpdateTime":"2013-06-12T12:31:19.861+0000",
       "tenantId":"tenant"
    }

### 删除模型

    DELETE repository/models/{modelId}

<table>
<caption>删除模型 - URL 参数</caption>
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
<td><p>modelId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的模型的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除模型 - 响应码</caption>
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
<td><p>表示已找到并删除模型。响应体有意为空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的模型。</p></td>
</tr>
</tbody>
</table>

### 获取模型的编辑器源码

    GET repository/models/{modelId}/source

<table>
<caption>获取模型的编辑器源码 - URL 参数</caption>
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
<td><p>modelId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的模型的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取模型的编辑器源码 - 响应码</caption>
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
<td><p>表示已找到模型并已返回源码。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的模型。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含模型的原始编辑器源码。响应的 content-type 设置为 application/octet-stream，与源码的内容无关。

### 设置模型的编辑器源码

    PUT repository/models/{modelId}/source

<table>
<caption>设置模型的编辑器源码 - URL 参数</caption>
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
<td><p>modelId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要设置的模型的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

请求类型必须是 multipart/form-data。必须包含一个带有源码二进制值的单个文件部分。

<table>
<caption>设置模型的编辑器源码 - 响应码</caption>
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
<td><p>表示已找到模型并已更新源码。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的模型。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含模型的原始编辑器源码。响应的 content-type 设置为 application/octet-stream，与源码的内容无关。

### 获取模型的额外编辑器源码

    GET repository/models/{modelId}/source-extra

<table>
<caption>获取模型的额外编辑器源码 - URL 参数</caption>
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
<td><p>modelId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的模型的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取模型的额外编辑器源码 - 响应码</caption>
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
<td><p>表示已找到模型并已返回源码。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的模型。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含模型的原始额外编辑器源码。响应的 content-type 设置为 application/octet-stream，与额外源码的内容无关。

### 设置模型的额外编辑器源码

    PUT repository/models/{modelId}/source-extra

<table>
<caption>设置模型的额外编辑器源码 - URL 参数</caption>
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
<td><p>modelId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要设置的模型的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

请求类型必须是 multipart/form-data。必须包含一个带有额外源码二进制值的单个文件部分。

<table>
<caption>设置模型的额外编辑器源码 - 响应码</caption>
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
<td><p>表示已找到模型并已更新额外源码。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的模型。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含模型的原始编辑器源码。响应的 content-type 设置为 application/octet-stream，与源码的内容无关。

## 流程实例

### 获取流程实例

    GET runtime/process-instances/{processInstanceId}

<table>
<caption>获取流程实例 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程实例 - 响应码</caption>
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
<td><p>表示已找到并返回流程实例。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"7",
       "url":"http://localhost:8182/runtime/process-instances/7",
       "businessKey":"myBusinessKey",
       "suspended":false,
       "processDefinitionUrl":"http://localhost:8182/repository/process-definitions/processOne%3A1%3A4",
       "activityId":"processTask",
       "tenantId": null
    }

### 删除流程实例

    DELETE runtime/process-instances/{processInstanceId}?deleteReason={deleteReason}

<table>
<caption>删除流程实例 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的流程实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>deleteReason</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>删除流程实例的原因。</p></td>
</tr>
</tbody>
</table>

### 激活或挂起流程实例

    PUT runtime/process-instances/{processInstanceId}

<table>
<caption>激活或挂起流程实例 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要激活/挂起的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体(挂起):**

    {
       "action":"suspend"
    }

**请求体(激活):**

    {
       "action":"activate"
    }

<table>
<caption>激活或挂起流程实例 - 响应码</caption>
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
<td><p>表示已找到流程实例并已执行操作。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示提供了无效的操作。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示无法执行请求的流程实例操作,因为该流程实例已经处于激活/挂起状态。</p></td>
</tr>
</tbody>
</table>

### 启动流程实例

    POST runtime/process-instances

**请求体(通过流程定义 ID 启动):**

    {
       "processDefinitionId":"oneTaskProcess:1:158",
       "businessKey":"myBusinessKey",
       "returnVariables":true,
       "variables": [
          {
            "name":"myVar",
            "value":"This is a variable"
          }
       ]
    }

**请求体(通过流程定义键启动):**

    {
       "processDefinitionKey":"oneTaskProcess",
       "businessKey":"myBusinessKey",
       "returnVariables":false,
       "tenantId": "tenant1",
       "variables": [
          {
            "name":"myVar",
            "value":"This is a variable"
          }
       ]
    }

**请求体(通过消息启动):**

    {
       "message":"newOrderMessage",
       "businessKey":"myBusinessKey",
       "tenantId": "tenant1",
       "variables": [
          {
            "name":"myVar",
            "value":"This is a variable"
          }
       ]
    }

注意,JSON 中也接受 *transientVariables* 属性,其结构与 *variables* 属性相同。

*returnVariables* 属性可用于在响应中获取流程实例上下文中的现有变量。默认情况下不返回变量。

请求体中只能使用 processDefinitionId、processDefinitionKey 或 message 其中之一。参数 businessKey、variables 和 tenantId 是可选的。如果省略 tenantId,将使用默认租户。有关变量格式的更多信息,请参见[REST 变量部分](#variable-representation)。请注意,提供的变量作用域会被忽略,流程变量始终是本地的。

<table>
<caption>启动流程实例 - 响应码</caption>
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
<td><p>表示已创建流程实例。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示未找到流程定义(基于 ID 或键)、发送给定消息未启动任何流程,或传递了无效变量。状态描述包含有关错误的其他信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"7",
       "url":"http://localhost:8182/runtime/process-instances/7",
       "businessKey":"myBusinessKey",
       "suspended":false,
       "processDefinitionUrl":"http://localhost:8182/repository/process-definitions/processOne%3A1%3A4",
       "activityId":"processTask",
       "tenantId" : null
    }

### 获取流程实例列表

    GET runtime/process-instances

<table>
<caption>获取流程实例列表 - URL 查询参数</caption>
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
<td><p>id</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定 ID 的流程实例。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定流程定义键的流程实例。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定流程定义 ID 的流程实例。</p></td>
</tr>
<tr class="even">
<td><p>businessKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定业务键的流程实例。</p></td>
</tr>
<tr class="odd">
<td><p>involvedUser</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回给定用户参与的流程实例。</p></td>
</tr>
<tr class="even">
<td><p>suspended</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true，仅返回已挂起的流程实例。如果为 false，仅返回未挂起(活动)的流程实例。</p></td>
</tr>
<tr class="odd">
<td><p>superProcessInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定父流程实例 ID 的流程实例(适用于具有调用活动的流程)。</p></td>
</tr>
<tr class="even">
<td><p>subProcessInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定子流程实例 ID 的流程实例(适用于作为调用活动启动的流程)。</p></td>
</tr>
<tr class="odd">
<td><p>excludeSubprocesses</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>仅返回不是子流程的流程实例。</p></td>
</tr>
<tr class="even">
<td><p>includeProcessVariables</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>指示是否在结果中包含流程变量。</p></td>
</tr>
<tr class="odd">
<td><p>tenantId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定租户 ID 的流程实例。</p></td>
</tr>
<tr class="even">
<td><p>tenantIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 类似于给定值的流程实例。</p></td>
</tr>
<tr class="odd">
<td><p>withoutTenantId</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true，仅返回未设置租户 ID 的流程实例。如果为 false，则忽略 withoutTenantId 参数。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程实例列表 - 响应码</caption>
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
<td><p>表示请求成功,并已返回流程实例。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
          {
             "id":"7",
             "url":"http://localhost:8182/runtime/process-instances/7",
             "businessKey":"myBusinessKey",
             "suspended":false,
             "processDefinitionUrl":"http://localhost:8182/repository/process-definitions/processOne%3A1%3A4",
             "activityId":"processTask",
             "tenantId" : null
          }
       ],
       "total":2,
       "start":0,
       "sort":"id",
       "order":"asc",
       "size":2
    }

### 查询流程实例

    POST query/process-instances

**请求体:**

    {
      "processDefinitionKey":"oneTaskProcess",
      "variables":
      [
        {
            "name" : "myVariable",
            "value" : 1234,
            "operation" : "equals",
            "type" : "long"
        }
      ]
    }

请求体可以包含在[获取流程实例列表](bpmn/ch14-REST.md#list-of-process-instances) URL 查询中使用的所有可能过滤器。除此之外,还可以提供一个变量数组以包含在查询中,其格式[在此处描述](#json-query-variable-format)。

可以对此 URL 使用通用的[分页和排序查询参数](#paging-and-sorting)。

<table>
<caption>查询流程实例 - 响应码</caption>
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
<td><p>表示请求成功,并已返回流程实例。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
          {
             "id":"7",
             "url":"http://localhost:8182/runtime/process-instances/7",
             "businessKey":"myBusinessKey",
             "suspended":false,
             "processDefinitionUrl":"http://localhost:8182/repository/process-definitions/processOne%3A1%3A4",
             "activityId":"processTask",
             "tenantId" : null
          }
       ],
       "total":2,
       "start":0,
       "sort":"id",
       "order":"asc",
       "size":2
    }

### 获取流程实例的图表

    GET runtime/process-instances/{processInstanceId}/diagram

<table>
<caption>获取流程实例的图表 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取图表的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程实例的图表 - 响应码</caption>
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
<td><p>表示已找到流程实例并已返回图表。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示未找到请求的流程实例,但该流程不包含任何图形信息(BPMN:DI),因此无法创建图表。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    响应是一个包含二进制数据的 Blob 对象或 null。

### 获取流程实例的相关人员

    GET runtime/process-instances/{processInstanceId}/identitylinks

<table>
<caption>获取流程实例的相关人员 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取关联的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程实例的相关人员 - 响应码</caption>
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
<td><p>表示已找到流程实例并已返回关联。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
       {
          "url":"http://localhost:8182/runtime/process-instances/5/identitylinks/users/john/customType",
          "user":"john",
          "group":null,
          "type":"customType"
       },
       {
          "url":"http://localhost:8182/runtime/process-instances/5/identitylinks/users/paul/candidate",
          "user":"paul",
          "group":null,
          "type":"candidate"
       }
    ]

注意,groupId 始终为 null,因为只能将用户与流程实例关联。

### 为流程实例添加相关用户

    POST runtime/process-instances/{processInstanceId}/identitylinks

<table>
<caption>为流程实例添加相关用户 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要添加关联的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    {
      "userId":"kermit",
      "type":"participant"
    }

userId 和 type 都是必需的。

<table>
<caption>为流程实例添加相关用户 - 响应码</caption>
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
<td><p>表示已找到流程实例并已创建关联。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体中未包含 userId 或 type。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "url":"http://localhost:8182/runtime/process-instances/5/identitylinks/users/john/customType",
       "user":"john",
       "group":null,
       "type":"customType"
    }

注意,groupId 始终为 null,因为只能将用户与流程实例关联。

### 从流程实例中移除相关用户

    DELETE runtime/process-instances/{processInstanceId}/identitylinks/users/{userId}/{type}

<table>
<caption>从流程实例中移除相关用户 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>流程实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除关联的用户 ID。</p></td>
</tr>
<tr class="odd">
<td><p>type</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的关联类型。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>从流程实例中移除相关用户 - 响应码</caption>
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
<td><p>表示已找到流程实例并已删除关联。响应体有意为空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例或要删除的关联不存在。响应状态包含有关错误的其他信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "url":"http://localhost:8182/runtime/process-instances/5/identitylinks/users/john/customType",
       "user":"john",
       "group":null,
       "type":"customType"
    }

注意,groupId 始终为 null,因为只能将用户与流程实例关联。

### 获取流程实例的变量列表

    GET runtime/process-instances/{processInstanceId}/variables

<table>
<caption>获取流程实例的变量列表 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取变量的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程实例的变量列表 - 响应码</caption>
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
<td><p>表示已找到流程实例并已返回变量。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
       {
          "name":"intProcVar",
          "type":"integer",
          "value":123,
          "scope":"local"
       },
       {
          "name":"byteArrayProcVar",
          "type":"binary",
          "value":null,
          "valueUrl":"http://localhost:8182/runtime/process-instances/5/variables/byteArrayProcVar/data",
          "scope":"local"
       }
    ]

如果变量是二进制变量或可序列化的,valueUrl 指向一个用于获取原始值的 URL。如果是普通变量,则值直接包含在响应中。
注意,由于流程实例变量没有全局作用域,因此只返回本地作用域的变量。

### 获取流程实例的变量

    GET runtime/process-instances/{processInstanceId}/variables/{variableName}

<table>
<caption>获取流程实例的变量 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取变量的流程实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的变量名称。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取流程实例的变量 - 响应码</caption>
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
<td><p>表示已找到流程实例和变量,并已返回变量。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体不完整或包含非法值。状态描述包含有关错误的其他信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例,或流程实例不存在具有给定名称的变量。状态描述包含有关错误的其他信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

       {
          "name":"intProcVar",
          "type":"integer",
          "value":123,
          "scope":"local"
       }

如果变量是二进制变量或可序列化的,valueUrl 指向一个用于获取原始值的 URL。如果是普通变量,则值直接包含在响应中。注意,由于流程实例变量没有全局作用域,因此只返回本地作用域的变量。

### 在流程实例上创建(或更新)变量

    POST runtime/process-instances/{processInstanceId}/variables

    PUT runtime/process-instances/{processInstanceId}/variables

使用 POST 时,将创建所有传递的变量。如果流程实例上已存在其中一个变量,则请求会导致错误(409 - CONFLICT)。使用 PUT 时,会在流程实例上创建不存在的变量,并覆盖现有变量,不会产生任何错误。

<table>
<caption>在流程实例上创建(或更新)变量 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要设置变量的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    [
       {
          "name":"intProcVar",
          "type":"integer",
          "value":123
       },

       ...
    ]

可以在请求体数组中传递任意数量的变量。有关变量格式的更多信息,请参见[REST 变量部分](#variable-representation)。请注意,作用域会被忽略,只能在流程实例中设置本地变量。

<table>
<caption>在流程实例上创建(或更新)变量 - 响应码</caption>
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
<td><p>表示已找到流程实例并已创建变量。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体不完整或包含非法值。状态描述包含有关错误的其他信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示已找到流程实例,但已包含具有给定名称的变量(仅在使用 POST 方法时抛出)。请改用更新方法。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
       {
          "name":"intProcVar",
          "type":"integer",
          "value":123,
          "scope":"local"
       },

       ...

    ]

### 更新流程实例的单个变量

    PUT runtime/process-instances/{processInstanceId}/variables/{variableName}

<table>
<caption>更新流程实例的单个变量 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要设置变量的流程实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的变量名称。</p></td>
</tr>
</tbody>
</table>

**请求体:**

     {
        "name":"intProcVar"
        "type":"integer"
        "value":123
     }

有关变量格式的更多信息,请参见[REST 变量部分](#variable-representation)。请注意,作用域会被忽略,只能在流程实例中设置本地变量。

<table>
<caption>更新流程实例的单个变量 - 响应码</caption>
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
<td><p>表示已找到流程实例和变量,并已更新变量。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例,或流程实例不存在具有给定名称的变量。状态描述包含有关错误的其他信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "name":"intProcVar",
      "type":"integer",
      "value":123,
      "scope":"local"
    }

如果变量是二进制变量或可序列化的,valueUrl 指向一个用于获取原始值的 URL。如果是普通变量,则值直接包含在响应中。注意,由于流程实例变量没有全局作用域,因此只返回本地作用域的变量。

### 在流程实例上创建新的二进制变量

    POST runtime/process-instances/{processInstanceId}/variables

<table>
<caption>在流程实例上创建新的二进制变量 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建新变量的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

请求类型应为 multipart/form-data。应包含一个带有变量二进制值的单个文件部分。此外,还可以包含以下额外的表单字段:

-   name: 必需的变量名称。

-   type: 要创建的变量类型。如果省略,则假定为二进制类型,请求中的二进制数据将作为字节数组存储。

**成功响应体:**

    {
      "name" : "binaryVariable",
      "scope" : "local",
      "type" : "binary",
      "value" : null,
      "valueUrl" : "http://.../runtime/process-instances/123/variables/binaryVariable/data"
    }

<table>
<caption>在流程实例上创建新的二进制变量 - 响应码</caption>
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
<td><p>表示已创建变量并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示缺少要创建的变量名称。状态消息提供额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示流程实例已包含具有给定名称的变量。请改用 PUT 方法更新任务变量。</p></td>
</tr>
<tr class="odd">
<td><p>415</p></td>
<td><p>表示可序列化数据包含一个对象,但运行 Flowable 引擎的 JVM 中不存在该对象的类,因此无法反序列化。</p></td>
</tr>
</tbody>
</table>

### 更新流程实例上的现有二进制变量

    PUT runtime/process-instances/{processInstanceId}/variables

<table>
<caption>更新流程实例上的现有二进制变量 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建新变量的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**
请求类型应为 multipart/form-data。应包含一个带有变量二进制值的单个文件部分。此外,还可以包含以下额外的表单字段:

-   name: 必需的变量名称。

-   type: 要创建的变量类型。如果省略,则假定为二进制类型,请求中的二进制数据将作为字节数组存储。

**成功响应体:**

    {
      "name" : "binaryVariable",
      "scope" : "local",
      "type" : "binary",
      "value" : null,
      "valueUrl" : "http://.../runtime/process-instances/123/variables/binaryVariable/data"
    }

<table>
<caption>更新流程实例上的现有二进制变量 - 响应码</caption>
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
<td><p>表示已更新变量并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示缺少要更新的变量名称。状态消息提供额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例,或流程实例不存在具有给定名称的变量。</p></td>
</tr>
<tr class="even">
<td><p>415</p></td>
<td><p>表示可序列化数据包含一个对象,但运行 Flowable 引擎的 JVM 中不存在该对象的类,因此无法反序列化。</p></td>
</tr>
</tbody>
</table>

## 执行

### 获取执行

    GET runtime/executions/{executionId}

<table>
<caption>获取执行 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的执行的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取执行 - 响应码</caption>
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
<td><p>表示已找到执行并已返回。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到执行。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"5",
       "url":"http://localhost:8182/runtime/executions/5",
       "parentId":null,
       "parentUrl":null,
       "processInstanceId":"5",
       "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
       "suspended":false,
       "activityId":null,
       "tenantId": null
    }

### 在执行上执行操作

    PUT runtime/executions/{executionId}

<table>
<caption>在执行上执行操作 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要执行操作的执行的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体(发送信号到执行):**

    {
      "action":"signal"
    }

接受 *variables* 和 *transientVariables* 属性,结构如下:

    {
      "action":"signal",
      "variables" : [
        {
          "name": "myVar",
          "value": "someValue"
        }
      ]
    }

**请求体(执行接收到信号事件):**

    {
      "action":"signalEventReceived",
      "signalName":"mySignal"
      "variables": [  ]
    }

通知执行已接收到信号事件,需要 signalName 参数。可以传递可选的变量,这些变量会在执行操作之前设置到执行中。

**请求体(执行接收到消息事件):**

    {
      "action":"messageEventReceived",
      "messageName":"myMessage"
      "variables": [  ]
    }

通知执行已接收到消息事件,需要 messageName 参数。可以传递可选的变量,这些变量会在执行操作之前设置到执行中。

<table>
<caption>在执行上执行操作 - 响应码</caption>
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
<td><p>表示已找到执行并已执行操作。</p></td>
</tr>
<tr class="even">
<td><p>204</p></td>
<td><p>表示已找到执行,已执行操作,且该操作导致执行结束。</p></td>
</tr>
<tr class="odd">
<td><p>400</p></td>
<td><p>表示请求了非法操作,请求体中缺少必需参数或传入了非法变量。状态描述包含有关错误的其他信息。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到执行。</p></td>
</tr>
</tbody>
</table>

**成功响应体(如果操作未导致执行结束):**

    {
       "id":"5",
       "url":"http://localhost:8182/runtime/executions/5",
       "parentId":null,
       "parentUrl":null,
       "processInstanceId":"5",
       "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
       "suspended":false,
       "activityId":null,
       "tenantId" : null
    }

### 获取执行中的活动活动

    GET runtime/executions/{executionId}/activities

返回执行及其所有子执行(以及它们的子执行,递归)中的所有活动活动(如果有)。

<table>
<caption>获取执行中的活动活动 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取活动的执行的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取执行中的活动活动 - 响应码</caption>
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
<td><p>表示已找到执行并已返回活动。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到执行。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
      "userTaskForManager",
      "receiveTask"
    ]

### 执行列表

    GET runtime/executions

<table>
<caption>执行列表 - URL 查询参数</caption>
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
<td><p>id</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定 ID 的执行。</p></td>
</tr>
<tr class="even">
<td><p>activityId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定活动 ID 的执行。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定流程定义键的执行。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定流程定义 ID 的执行。</p></td>
</tr>
<tr class="odd">
<td><p>processInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有给定 ID 的流程实例的执行。</p></td>
</tr>
<tr class="even">
<td><p>messageEventSubscriptionName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回订阅了具有给定名称的消息的执行。</p></td>
</tr>
<tr class="odd">
<td><p>signalEventSubscriptionName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回订阅了具有给定名称的信号的执行。</p></td>
</tr>
<tr class="even">
<td><p>parentId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回作为给定执行的直接子执行的执行。</p></td>
</tr>
<tr class="odd">
<td><p>tenantId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定租户 ID 的执行。</p></td>
</tr>
<tr class="even">
<td><p>tenantIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 类似于给定值的执行。</p></td>
</tr>
<tr class="odd">
<td><p>withoutTenantId</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,则仅返回未设置租户 ID 的执行。如果为 false,则忽略 withoutTenantId 参数。</p></td>
</tr>
<tr class="even">
<td><p>sort</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>排序字段,应为 processInstanceId(默认)、processDefinitionId、processDefinitionKey 或 tenantId 之一。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>执行列表 - 响应码</caption>
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
<td><p>表示请求成功且已返回执行列表。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
          {
             "id":"5",
             "url":"http://localhost:8182/runtime/executions/5",
             "parentId":null,
             "parentUrl":null,
             "processInstanceId":"5",
             "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
             "suspended":false,
             "activityId":null,
             "tenantId":null
          },
          {
             "id":"7",
             "url":"http://localhost:8182/runtime/executions/7",
             "parentId":"5",
             "parentUrl":"http://localhost:8182/runtime/executions/5",
             "processInstanceId":"5",
             "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
             "suspended":false,
             "activityId":"processTask",
             "tenantId":null
          }
       ],
       "total":2,
       "start":0,
       "sort":"processInstanceId",
       "order":"asc",
       "size":2
    }

### 查询执行

    POST query/executions

**请求体:**

    {
      "processDefinitionKey":"oneTaskProcess",
      "variables":
      [
        {
            "name" : "myVariable",
            "value" : 1234,
            "operation" : "equals",
            "type" : "long"
        }
      ],
      "processInstanceVariables":
      [
        {
            "name" : "processVariable",
            "value" : "some string",
            "operation" : "equals",
            "type" : "string"
        }
      ]
    }

请求体可以包含在[执行列表](bpmn/ch14-REST.md#list-of-executions) URL 查询中使用的所有可能的过滤条件。除此之外,还可以提供变量和流程实例变量数组以包含在查询中,其格式[在此处描述](#json-query-variable-format)。

可以对此 URL 使用通用的[分页和排序查询参数](#paging-and-sorting)。

<table>
<caption>查询执行 - 响应码</caption>
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
<td><p>表示请求成功且已返回执行列表。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
          {
             "id":"5",
             "url":"http://localhost:8182/runtime/executions/5",
             "parentId":null,
             "parentUrl":null,
             "processInstanceId":"5",
             "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
             "suspended":false,
             "activityId":null,
             "tenantId":null
          },
          {
             "id":"7",
             "url":"http://localhost:8182/runtime/executions/7",
             "parentId":"5",
             "parentUrl":"http://localhost:8182/runtime/executions/5",
             "processInstanceId":"5",
             "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
             "suspended":false,
             "activityId":"processTask",
             "tenantId":null
          }
       ],
       "total":2,
       "start":0,
       "sort":"processInstanceId",
       "order":"asc",
       "size":2
    }

### 获取执行的变量列表

    GET runtime/executions/{executionId}/variables?scope={scope}

<table>
<caption>获取执行的变量列表 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取变量的执行的 ID。</p></td>
</tr>
<tr class="even">
<td><p>scope</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>可以是 local 或 global。如果省略,则返回本地和全局作用域的变量。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取执行的变量列表 - 响应码</caption>
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
<td><p>表示已找到执行并已返回变量。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的执行。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
       {
          "name":"intProcVar",
          "type":"integer",
          "value":123,
          "scope":"global"
       },
       {
          "name":"byteArrayProcVar",
          "type":"binary",
          "value":null,
          "valueUrl":"http://localhost:8182/runtime/process-instances/5/variables/byteArrayProcVar/data",
          "scope":"local"
       }
    ]

如果变量是二进制变量或可序列化的,valueUrl 指向一个用于获取原始值的 URL。如果是普通变量,则值直接包含在响应中。

### 获取执行的变量

    GET runtime/executions/{executionId}/variables/{variableName}?scope={scope}

<table>
<caption>获取执行的变量 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取变量的执行的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的变量名称。</p></td>
</tr>
<tr class="odd">
<td><p>scope</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>可以是 local 或 global。如果省略,则返回本地变量(如果存在)。如果不存在,则返回全局变量(如果存在)。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取执行的变量 - 响应码</caption>
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
<td><p>表示已找到执行和变量,并已返回变量。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体不完整或包含非法值。状态描述包含有关错误的其他信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的执行,或执行在请求的作用域中不存在具有给定名称的变量(如果省略了作用域查询参数,则变量在本地和全局作用域中都不存在)。状态描述包含有关错误的其他信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "name":"intProcVar",
       "type":"integer",
       "value":123,
       "scope":"local"
    }

如果变量是二进制变量或可序列化的,valueUrl 指向一个用于获取原始值的 URL。如果是普通变量,则值直接包含在响应中。

### 在执行上创建(或更新)变量

    POST runtime/executions/{executionId}/variables

    PUT runtime/executions/{executionId}/variables

使用 POST 时,会创建所有传入的变量。如果在请求的作用域中执行已存在其中一个变量,则请求会导致错误(409 - CONFLICT)。使用 PUT 时,会在执行上创建不存在的变量,并覆盖现有变量,不会产生任何错误。

<table>
<caption>在执行上创建(或更新)变量 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建变量的执行的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    [
       {
          "name":"intProcVar"
          "type":"integer"
          "value":123,
          "scope":"local"
       }
    ]

*注意,你只能提供具有相同作用域的变量。如果请求体数组包含来自混合作用域的变量,则请求会导致错误(400 - BAD REQUEST)。*可以在请求体数组中传入任意数量的变量。有关变量格式的更多信息,请参见[REST 变量部分](#variable-representation)。请注意,作用域会被忽略,只能在流程实例中设置本地变量。

<table>
<caption>在执行上创建(或更新)变量 - 响应码</caption>
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
<td><p>表示已找到执行并已创建变量。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体不完整或包含非法值。状态描述包含有关错误的其他信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的执行。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示已找到执行,但已包含具有给定名称的变量(仅在使用 POST 方法时抛出)。请改用更新方法。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
       {
          "name":"intProcVar",
          "type":"integer",
          "value":123,
          "scope":"local"
       }
    ]

### 更新执行的变量

    PUT runtime/executions/{executionId}/variables/{variableName}

<table>
<caption>更新执行的变量 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新变量的执行的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新的变量名称。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    {
       "name":"intProcVar"
       "type":"integer"
       "value":123,
       "scope":"global"
    }

有关变量格式的更多信息,请参见[REST 变量部分](#variable-representation)。

<table>
<caption>更新执行的变量 - 响应码</caption>
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
<td><p>表示已找到流程实例和变量,并已更新变量。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例,或流程实例不存在具有给定名称的变量。状态描述包含有关错误的其他信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "name":"intProcVar",
       "type":"integer",
       "value":123,
       "scope":"global"
    }

如果变量是二进制变量或可序列化的,valueUrl 指向一个用于获取原始值的 URL。如果是普通变量,则值直接包含在响应中。

### 在执行上创建新的二进制变量

    POST runtime/executions/{executionId}/variables

<table>
<caption>在执行上创建新的二进制变量 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建新变量的执行的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

请求类型应为 multipart/form-data。应包含一个带有变量二进制值的单个文件部分。此外,还可以包含以下额外的表单字段:

-   name: 必需的变量名称。

-   type: 要创建的变量类型。如果省略,则假定为二进制类型,请求中的二进制数据将作为字节数组存储。

-   scope: 要创建的变量的作用域。如果省略,则假定为本地作用域。

**成功响应体:**

    {
      "name" : "binaryVariable",
      "scope" : "local",
      "type" : "binary",
      "value" : null,
      "valueUrl" : "http://.../runtime/executions/123/variables/binaryVariable/data"
    }

<table>
<caption>在执行上创建新的二进制变量 - 响应码</caption>
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
<td><p>表示已创建变量并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示缺少要创建的变量名称。状态消息提供额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的执行。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示执行已包含具有给定名称的变量。请改用 PUT 方法更新任务变量。</p></td>
</tr>
<tr class="odd">
<td><p>415</p></td>
<td><p>表示可序列化数据包含一个对象,但运行 Flowable 引擎的 JVM 中不存在该对象的类,因此无法反序列化。</p></td>
</tr>
</tbody>
</table>

### 更新流程实例中的现有二进制变量

    PUT runtime/executions/{executionId}/variables/{variableName}

<table>
<caption>更新流程实例中的现有二进制变量 - URL 参数</caption>
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
<td><p>executionId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建新变量的执行的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新的变量名称。</p></td>
</tr>
</tbody>
</table>

**请求体:**
请求类型应为 multipart/form-data。应包含一个带有变量二进制值的单个文件部分。此外,还可以包含以下额外的表单字段:

-   name: 必需的变量名称。

-   type: 要创建的变量类型。如果省略,则假定为二进制类型,请求中的二进制数据将作为字节数组存储。

-   scope: 要创建的变量的作用域。如果省略,则假定为本地作用域。

**成功响应体:**

    {
      "name" : "binaryVariable",
      "scope" : "local",
      "type" : "binary",
      "value" : null,
      "valueUrl" : "http://.../runtime/executions/123/variables/binaryVariable/data"
    }

<table>
<caption>更新流程实例中的现有二进制变量 - 响应码</caption>
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
<td><p>表示已更新变量并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示缺少要更新的变量名称。状态消息提供额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的执行,或执行不存在具有给定名称的变量。</p></td>
</tr>
<tr class="even">
<td><p>415</p></td>
<td><p>表示可序列化数据包含一个对象,但运行 Flowable 引擎的 JVM 中不存在该对象的类,因此无法反序列化。</p></td>
</tr>
</tbody>
</table>

## 任务

### 获取任务

    GET runtime/tasks/{taskId}

<table>
<caption>获取任务 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的任务的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取任务 - 响应码</caption>
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
<td><p>表示已找到并返回任务。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "assignee" : "kermit",
      "createTime" : "2013-04-17T10:17:43.902+0000",
      "delegationState" : "pending",
      "description" : "Task description",
      "dueDate" : "2013-04-17T10:17:43.902+0000",
      "execution" : "http://localhost:8182/runtime/executions/5",
      "id" : "8",
      "name" : "My task",
      "owner" : "owner",
      "parentTask" : "http://localhost:8182/runtime/tasks/9",
      "priority" : 50,
      "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
      "processInstanceUrl" : "http://localhost:8182/runtime/process-instances/5",
      "suspended" : false,
      "taskDefinitionKey" : "theTask",
      "url" : "http://localhost:8182/runtime/tasks/8",
      "tenantId" : null
    }

- delegationState: 任务的委派状态,可以是 null、"pending"(待处理)或"resolved"(已解决)。

### 任务列表

    GET runtime/tasks

<table>
<caption>任务列表 - URL 查询参数</caption>
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
<td><p>仅返回具有给定名称的任务。</p></td>
</tr>
<tr class="even">
<td><p>nameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回名称类似于给定名称的任务。</p></td>
</tr>
<tr class="odd">
<td><p>description</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定描述的任务。</p></td>
</tr>
<tr class="even">
<td><p>priority</p></td>
<td><p>否</p></td>
<td><p>Integer</p></td>
<td><p>仅返回具有给定优先级的任务。</p></td>
</tr>
<tr class="odd">
<td><p>minimumPriority</p></td>
<td><p>否</p></td>
<td><p>Integer</p></td>
<td><p>仅返回优先级大于给定值的任务。</p></td>
</tr>
<tr class="even">
<td><p>maximumPriority</p></td>
<td><p>否</p></td>
<td><p>Integer</p></td>
<td><p>仅返回优先级小于给定值的任务。</p></td>
</tr>
<tr class="odd">
<td><p>assignee</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回分配给指定用户的任务。</p></td>
</tr>
<tr class="even">
<td><p>assigneeLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回受理人类似于给定值的任务。</p></td>
</tr>
<tr class="odd">
<td><p>owner</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回由指定用户拥有的任务。</p></td>
</tr>
<tr class="even">
<td><p>ownerLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回所有者类似于给定值的任务。</p></td>
</tr>
<tr class="odd">
<td><p>unassigned</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>仅返回未分配给任何人的任务。如果传入 false，则忽略该值。</p></td>
</tr>
<tr class="even">
<td><p>delegationState</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定委派状态的任务。可能的值为 pending(待处理)和 resolved(已解决)。</p></td>
</tr>
<tr class="odd">
<td><p>candidateUser</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回指定用户可以认领的任务。这包括用户作为显式候选人的任务,以及用户所属群组可以认领的任务。</p></td>
</tr>
<tr class="even">
<td><p>candidateGroup</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回指定群组中的用户可以认领的任务。</p></td>
</tr>
<tr class="odd">
<td><p>candidateGroups</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回指定群组中的用户可以认领的任务。值以逗号分隔。</p></td>
</tr>
<tr class="even">
<td><p>involvedUser</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回指定用户参与的任务。</p></td>
</tr>
<tr class="odd">
<td><p>taskDefinitionKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有指定任务定义 ID 的任务。</p></td>
</tr>
<tr class="even">
<td><p>taskDefinitionKeyLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回任务定义 ID 类似于给定值的任务。</p></td>
</tr>
<tr class="odd">
<td><p>processInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于指定 ID 的流程实例的任务。</p></td>
</tr>
<tr class="even">
<td><p>processInstanceBusinessKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有指定业务键的流程实例的任务。</p></td>
</tr>
<tr class="odd">
<td><p>processInstanceBusinessKeyLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于业务键类似于给定值的流程实例的任务。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有指定 ID 的流程定义的流程实例的任务。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有指定键的流程定义的流程实例的任务。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionKeyLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有类似于给定值的键的流程定义的流程实例的任务。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有指定名称的流程定义的流程实例的任务。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionNameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于具有类似于给定值的名称的流程定义的流程实例的任务。</p></td>
</tr>
<tr class="odd">
<td><p>executionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回属于指定 ID 的执行的任务。</p></td>
</tr>
<tr class="even">
<td><p>createdOn</p></td>
<td><p>否</p></td>
<td><p>ISO Date</p></td>
<td><p>仅返回在指定日期创建的任务。</p></td>
</tr>
<tr class="odd">
<td><p>createdBefore</p></td>
<td><p>否</p></td>
<td><p>ISO Date</p></td>
<td><p>仅返回在指定日期之前创建的任务。</p></td>
</tr>
<tr class="even">
<td><p>createdAfter</p></td>
<td><p>否</p></td>
<td><p>ISO Date</p></td>
<td><p>仅返回在指定日期之后创建的任务。</p></td>
</tr>
<tr class="odd">
<td><p>dueOn</p></td>
<td><p>否</p></td>
<td><p>ISO Date</p></td>
<td><p>仅返回在指定日期到期的任务。</p></td>
</tr>
<tr class="even">
<td><p>dueBefore</p></td>
<td><p>否</p></td>
<td><p>ISO Date</p></td>
<td><p>仅返回在指定日期之前到期的任务。</p></td>
</tr>
<tr class="odd">
<td><p>dueAfter</p></td>
<td><p>否</p></td>
<td><p>ISO Date</p></td>
<td><p>仅返回在指定日期之后到期的任务。</p></td>
</tr>
<tr class="even">
<td><p>withoutDueDate</p></td>
<td><p>否</p></td>
<td><p>boolean</p></td>
<td><p>仅返回没有到期日期的任务。如果值为 false，则忽略该属性。</p></td>
</tr>
<tr class="odd">
<td><p>excludeSubTasks</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>仅返回不是其他任务的子任务的任务。</p></td>
</tr>
<tr class="even">
<td><p>active</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true，仅返回未挂起的任务(属于未挂起的流程或完全不属于流程的任务)。如果为 false，仅返回属于已挂起流程实例的任务。</p></td>
</tr>
<tr class="odd">
<td><p>includeTaskLocalVariables</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>指示是否在结果中包含任务本地变量。</p></td>
</tr>
<tr class="even">
<td><p>includeProcessVariables</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>指示是否在结果中包含流程变量。</p></td>
</tr>
<tr class="odd">
<td><p>tenantId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有指定租户 ID 的任务。</p></td>
</tr>
<tr class="even">
<td><p>tenantIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 类似于给定值的任务。</p></td>
</tr>
<tr class="odd">
<td><p>withoutTenantId</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true，仅返回未设置租户 ID 的任务。如果为 false，则忽略此参数。</p></td>
</tr>
<tr class="even">
<td><p>candidateOrAssigned</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>选择已被用户认领或分配的任务，或等待用户（候选用户或群组）认领的任务。</p></td>
</tr>
<tr class="odd">
<td><p>category</p></td>
<td><p>否</p></td>
<td><p>string</p></td>
<td><p>选择具有指定类别的任务。注意，这是任务类别，而不是流程定义的类别（BPMN XML 中的命名空间）。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>任务列表 - 响应码</caption>
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
<td><p>表示请求成功且已返回任务。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误或 'delegationState' 具有无效值（'pending' 和 'resolved' 之外的值）。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "assignee" : "kermit",
          "createTime" : "2013-04-17T10:17:43.902+0000",
          "delegationState" : "pending",
          "description" : "Task description",
          "dueDate" : "2013-04-17T10:17:43.902+0000",
          "execution" : "http://localhost:8182/runtime/executions/5",
          "id" : "8",
          "name" : "My task",
          "owner" : "owner",
          "parentTask" : "http://localhost:8182/runtime/tasks/9",
          "priority" : 50,
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "processInstanceUrl" : "http://localhost:8182/runtime/process-instances/5",
          "suspended" : false,
          "taskDefinitionKey" : "theTask",
          "url" : "http://localhost:8182/runtime/tasks/8",
          "tenantId" : null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 查询任务

    POST query/tasks

**请求体:**

    {
      "name" : "My task",
      "description" : "The task description",

      ...

      "taskVariables" : [
        {
          "name" : "myVariable",
          "value" : 1234,
          "operation" : "equals",
          "type" : "long"
        }
      ],

        "processInstanceVariables" : [
          {
             ...
          }
        ]
      ]
    }

所有支持的 JSON 参数字段与[获取任务集合](bpmn/ch14-REST.md#list-of-tasks)中的参数完全相同(除了 candidateGroupIn 仅在此 POST 任务查询 REST 服务中可用),但作为 JSON 请求体参数传入而不是 URL 参数,以允许更高级的查询并防止请求 URI 过长的错误。此外,查询还允许基于任务和流程变量进行过滤。taskVariables 和 processInstanceVariables 都是包含[此处所述格式](#json-query-variable-format)对象的 JSON 数组。

<table>
<caption>查询任务 - 响应码</caption>
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
<td><p>表示请求成功且已返回任务。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误或 'delegationState' 具有无效值（'pending' 和 'resolved' 之外的值）。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "assignee" : "kermit",
          "createTime" : "2013-04-17T10:17:43.902+0000",
          "delegationState" : "pending",
          "description" : "Task description",
          "dueDate" : "2013-04-17T10:17:43.902+0000",
          "execution" : "http://localhost:8182/runtime/executions/5",
          "id" : "8",
          "name" : "My task",
          "owner" : "owner",
          "parentTask" : "http://localhost:8182/runtime/tasks/9",
          "priority" : 50,
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "processInstanceUrl" : "http://localhost:8182/runtime/process-instances/5",
          "suspended" : false,
          "taskDefinitionKey" : "theTask",
          "url" : "http://localhost:8182/runtime/tasks/8",
          "tenantId" : null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 更新任务

    PUT runtime/tasks/{taskId}

**请求体 JSON:**

    {
      "assignee" : "assignee",
      "delegationState" : "resolved",
      "description" : "New task description",
      "dueDate" : "2013-04-17T13:06:02.438+02:00", 
      "name" : "New task name",
      "owner" : "owner",
      "parentTaskId" : "3",
      "priority" : 20
    }

所有请求值都是可选的。例如,你可以在请求体 JSON 对象中只包含 'assignee' 属性,这样只会更新任务的受理人,而不会影响其他字段。当显式包含某个属性并将其设置为 null 时,任务中对应的值将被更新为 null。例如:{"dueDate" : null} 将清除任务的到期日期。

<table>
<caption>更新任务 - 响应码</caption>
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
<td><p>表示任务已更新。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
<tr class="odd">
<td><p>409</p></td>
<td><p>表示请求的任务被同时更新。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 runtime/tasks/{taskId} 的响应。

### 任务操作

    POST runtime/tasks/{taskId}

**完成任务 - 请求体 JSON:**

    {
      "action" : "complete",
      "variables" : []
    }

完成任务。可以使用 variables 属性传入可选的变量数组。有关变量格式的更多信息,请参见[REST 变量部分](#variable-representation)。请注意,提供的变量作用域会被忽略,变量会设置在父作用域中,除非本地作用域中存在变量,在这种情况下会被覆盖。这与 TaskService.completeTask(taskId, variables) 调用的行为相同。

注意,此 json 还接受 *transientVariables* 属性,其结构与 *variables* 属性相同。

**认领任务 - 请求体 JSON:**

    {
      "action" : "claim",
      "assignee" : "userWhoClaims"
    }

由指定的受理人认领任务。如果受理人为 null,则任务不分配给任何人,可以再次认领。

**委派任务 - 请求体 JSON:**

    {
      "action" : "delegate",
      "assignee" : "userToDelegateTo"
    }

将任务委派给指定的受理人。受理人是必需的。

**解决任务 - 请求体 JSON:**

    {
      "action" : "resolve"
    }

解决任务委派。任务会重新分配给任务所有者(如果有)。

<table>
<caption>任务操作 - 响应码</caption>
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
<td><p>表示操作已执行。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>当请求体包含无效值,或操作需要受理人但未提供时。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示由于冲突无法执行操作。可能是任务被同时更新,或在"认领"操作时任务已被其他用户认领。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 runtime/tasks/{taskId} 的响应。

### 删除任务

    DELETE runtime/tasks/{taskId}?cascadeHistory={cascadeHistory}&deleteReason={deleteReason}

<table>
<caption>删除任务 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>cascadeHistory</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>删除任务时是否同时删除历史任务实例(如果适用)。如果未提供,此值默认为 false。</p></td>
</tr>
<tr class="odd">
<td><p>deleteReason</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>删除任务的原因。当 cascadeHistory 为 true 时,此值将被忽略。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除任务 - 响应码</caption>
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
<td><p>表示已找到任务并已删除。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>403</p></td>
<td><p>表示无法删除请求的任务,因为它是工作流的一部分。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 获取任务的所有变量

    GET runtime/tasks/{taskId}/variables?scope={scope}

<table>
<caption>获取任务的所有变量 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取变量的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>scope</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>要返回的变量作用域。当为 'local' 时,仅返回任务本地变量。当为 'global' 时,仅返回任务的父执行层次结构中的变量。当省略此参数时,将返回本地和全局变量。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取任务的所有变量 - 响应码</caption>
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
<td><p>表示已找到任务并已返回请求的变量。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
      {
        "name" : "doubleTaskVar",
        "scope" : "local",
        "type" : "double",
        "value" : 99.99
      },
      {
        "name" : "stringProcVar",
        "scope" : "global",
        "type" : "string",
        "value" : "This is a ProcVariable"
      }
    ]

变量以 JSON 数组形式返回。完整的响应描述可以在[REST 变量部分](#variable-representation)中找到。

### 获取任务的变量

    GET runtime/tasks/{taskId}/variables/{variableName}?scope={scope}

<table>
<caption>获取任务的变量 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取变量的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的变量名称。</p></td>
</tr>
<tr class="odd">
<td><p>scope</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>要返回的变量作用域。当为 'local' 时,仅返回任务本地变量值。当为 'global' 时,仅返回任务的父执行层次结构中的变量值。当省略此参数时,如果存在本地变量则返回本地变量,否则返回全局变量。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取任务的变量 - 响应码</caption>
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
<td><p>表示已找到任务并已返回请求的变量。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务在给定作用域中没有具有给定名称的变量。状态消息提供额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "name" : "myTaskVariable",
      "scope" : "local",
      "type" : "string",
      "value" : "Hello my friend"
    }

完整的响应体描述可以在[REST 变量部分](#variable-representation)中找到。

### 获取变量的二进制数据

    GET runtime/tasks/{taskId}/variables/{variableName}/data?scope={scope}

<table>
<caption>获取变量的二进制数据 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取变量数据的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取数据的变量名称。只能使用二进制类型和可序列化类型的变量。如果使用其他类型的变量,将返回 404。</p></td>
</tr>
<tr class="odd">
<td><p>scope</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>要返回的变量作用域。当为 'local' 时,仅返回任务本地变量值。当为 'global' 时,仅返回任务的父执行层次结构中的变量值。当省略此参数时,如果存在本地变量则返回本地变量,否则返回全局变量。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取变量的二进制数据 - 响应码</caption>
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
<td><p>表示已找到任务并已返回请求的变量。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务在给定作用域中没有具有给定名称的变量,或变量没有可用的二进制流。状态消息提供额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含变量的二进制值。当变量类型为二进制时,响应的 content-type 设置为 application/octet-stream,无论变量的内容或请求的 accept-type 头如何。对于可序列化类型,使用 application/x-java-serialized-object 作为 content-type。

### 在任务上创建新变量

    POST runtime/tasks/{taskId}/variables

<table>
<caption>在任务上创建新变量 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建新变量的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**创建简单(非二进制)变量的请求体:**

    [
      {
        "name" : "myTaskVariable",
        "scope" : "local",
        "type" : "string",
        "value" : "Hello my friend"
      },
      {

      }
    ]

请求体应该是一个包含一个或多个 JSON 对象的数组,这些对象表示要创建的变量。

- name: 必需的变量名称
- scope: 创建的变量的作用域。如果省略,则假定为 local。
- type: 创建的变量的类型。如果省略,则恢复为原始 JSON 值类型(string、boolean、integer 或 double)。
- value: 变量值。

有关变量格式的更多信息,请参见[REST 变量部分](#variable-representation)。

**成功响应体:**

    [
      {
        "name" : "myTaskVariable",
        "scope" : "local",
        "type" : "string",
        "value" : "Hello my friend"
      },
      {

      }
    ]

<table>
<caption>在任务上创建新变量 - 响应码</caption>
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
<td><p>表示变量已创建并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示缺少要创建的变量的名称,或尝试在独立任务(没有关联的流程)上创建作用域为全局的变量,或请求中包含了空的变量数组,或请求未包含变量数组。状态消息提供额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示任务已具有给定名称的变量。请使用 PUT 方法更新任务变量。</p></td>
</tr>
</tbody>
</table>

### 在任务上创建新的二进制变量

    POST runtime/tasks/{taskId}/variables

<table>
<caption>在任务上创建新的二进制变量 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建新变量的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

请求类型应为 multipart/form-data。应包含一个带有变量二进制值的单个文件部分。此外,还可以包含以下额外的表单字段:

- name: 必需的变量名称。
- scope: 创建的变量的作用域。如果省略,则假定为 local。
- type: 创建的变量的类型。如果省略,则假定为 binary,请求中的二进制数据将作为字节数组存储。

**成功响应体:**

    {
      "name" : "binaryVariable",
      "scope" : "local",
      "type" : "binary",
      "value" : null,
      "valueUrl" : "http://.../runtime/tasks/123/variables/binaryVariable/data"
    }

<table>
<caption>在任务上创建新的二进制变量 - 响应码</caption>
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
<td><p>表示变量已创建并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示缺少要创建的变量的名称,或尝试在独立任务(没有关联的流程)上创建作用域为全局的变量。状态消息提供额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示任务已具有给定名称的变量。请使用 PUT 方法更新任务变量。</p></td>
</tr>
<tr class="odd">
<td><p>415</p></td>
<td><p>表示可序列化数据包含一个对象,该对象在运行 Flowable 引擎的 JVM 中没有对应的类,因此无法反序列化。</p></td>
</tr>
</tbody>
</table>

### 更新任务上的现有变量

    PUT runtime/tasks/{taskId}/variables/{variableName}

<table>
<caption>更新任务上的现有变量 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新变量的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新的变量名称。</p></td>
</tr>
</tbody>
</table>

**更新简单(非二进制)变量的请求体:**

    {
      "name" : "myTaskVariable",
      "scope" : "local",
      "type" : "string",
      "value" : "Hello my friend"
    }

- name: 必需的变量名称
- scope: 更新的变量的作用域。如果省略,则假定为 local。
- type: 更新的变量的类型。如果省略,则恢复为原始 JSON 值类型(string、boolean、integer 或 double)。
- value: 变量值。

有关变量格式的更多信息,请参见[REST 变量部分](#variable-representation)。

**成功响应体:**

    {
      "name" : "myTaskVariable",
      "scope" : "local",
      "type" : "string",
      "value" : "Hello my friend"
    }

<table>
<caption>更新任务上的现有变量 - 响应码</caption>
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
<td><p>表示变量已更新并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示缺少要更新的变量的名称,或尝试在独立任务(没有关联的流程)上更新作用域为全局的变量。状态消息提供额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务在给定作用域中没有具有给定名称的变量。状态消息包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

### 更新任务上的二进制变量

    PUT runtime/tasks/{taskId}/variables/{variableName}

<table>
<caption>更新任务上的二进制变量 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新变量的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新的变量名称。</p></td>
</tr>
</tbody>
</table>

**请求体:**

请求类型应为 multipart/form-data。应包含一个带有变量二进制值的单个文件部分。此外,还可以包含以下额外的表单字段:

- name: 必需的变量名称。
- scope: 更新的变量的作用域。如果省略,则假定为 local。
- type: 更新的变量的类型。如果省略,则假定为 binary,请求中的二进制数据将作为字节数组存储。

**成功响应体:**

    {
      "name" : "binaryVariable",
      "scope" : "local",
      "type" : "binary",
      "value" : null,
      "valueUrl" : "http://.../runtime/tasks/123/variables/binaryVariable/data"
    }

<table>
<caption>更新任务上的二进制变量 - 响应码</caption>
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
<td><p>表示变量已更新并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示缺少要更新的变量的名称,或尝试在独立任务(没有关联的流程)上更新作用域为全局的变量。状态消息提供额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或给定作用域中的给定任务不存在要更新的变量。</p></td>
</tr>
<tr class="even">
<td><p>415</p></td>
<td><p>表示可序列化数据包含一个对象,该对象在运行 Flowable 引擎的 JVM 中没有对应的类,因此无法反序列化。</p></td>
</tr>

### 删除任务上的变量

    DELETE runtime/tasks/{taskId}/variables/{variableName}?scope={scope}

<table>
<caption>删除任务上的变量 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除变量的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的变量名称。</p></td>
</tr>
<tr class="odd">
<td><p>scope</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>要删除的变量的作用域。可以是 local 或 global。如果省略,则假定为 local。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除任务上的变量 - 响应码</caption>
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
<td><p>表示已找到任务变量并已删除。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有具有给定名称的变量。状态消息包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

### 删除任务上的所有本地变量

    DELETE runtime/tasks/{taskId}/variables

<table>
<caption>删除任务上的所有本地变量 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除变量的任务的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除任务上的所有本地变量 - 响应码</caption>
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
<td><p>表示所有本地任务变量已被删除。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 获取任务的所有身份链接

    GET runtime/tasks/{taskId}/identitylinks

<table>
<caption>获取任务的所有身份链接 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取身份链接的任务的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取任务的所有身份链接 - 响应码</caption>
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
<td><p>表示已找到任务并已返回请求的身份链接。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
      {
        "userId" : "kermit",
        "groupId" : null,
        "type" : "candidate",
        "url" : "http://localhost:8081/flowable-rest/service/runtime/tasks/100/identitylinks/users/kermit/candidate"
      },
      {
        "userId" : null,
        "groupId" : "sales",
        "type" : "candidate",
        "url" : "http://localhost:8081/flowable-rest/service/runtime/tasks/100/identitylinks/groups/sales/candidate"
      },

      ...
    ]

### 获取任务的用户组或用户身份链接

    GET runtime/tasks/{taskId}/identitylinks/users
    GET runtime/tasks/{taskId}/identitylinks/groups

仅返回针对用户或组的身份链接。响应体和状态码与获取任务的完整身份链接列表时完全相同。

### 获取任务的单个身份链接

    GET runtime/tasks/{taskId}/identitylinks/{family}/{identityId}/{type}

<table>
<caption>获取任务的用户组或用户身份链接 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>family</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>根据目标身份类型,可以是 groups 或 users。</p></td>
</tr>
<tr class="odd">
<td><p>identityId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>身份的 ID。</p></td>
</tr>
<tr class="even">
<td><p>type</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>身份链接的类型。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取任务的用户组或用户身份链接 - 响应码</caption>
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
<td><p>表示已找到任务和身份链接并已返回。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有请求的身份链接。状态包含有关此错误的额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "userId" : null,
      "groupId" : "sales",
      "type" : "candidate",
      "url" : "http://localhost:8081/flowable-rest/service/runtime/tasks/100/identitylinks/groups/sales/candidate"
    }

### 在任务上创建身份链接

    POST runtime/tasks/{taskId}/identitylinks

<table>
<caption>在任务上创建身份链接 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建身份链接的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体(用户):**

    {
      "userId" : "kermit",
      "type" : "candidate",
    }

**请求体(用户组):**

    {
      "groupId" : "sales",
      "type" : "candidate",
    }

<table>
<caption>在任务上创建身份链接 - 响应码</caption>
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
<td><p>表示已找到任务并已创建身份链接。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有请求的身份链接。状态包含有关此错误的额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "userId" : null,
      "groupId" : "sales",
      "type" : "candidate",
      "url" : "http://localhost:8081/flowable-rest/service/runtime/tasks/100/identitylinks/groups/sales/candidate"
    }

### 删除任务上的身份链接

    DELETE runtime/tasks/{taskId}/identitylinks/{family}/{identityId}/{type}

<table>
<caption>删除任务上的身份链接 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>family</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>根据目标身份类型,可以是 groups 或 users。</p></td>
</tr>
<tr class="odd">
<td><p>identityId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>身份的 ID。</p></td>
</tr>
<tr class="even">
<td><p>type</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>身份链接的类型。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除任务上的身份链接 - 响应码</caption>
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
<td><p>表示已找到任务和身份链接并已删除该链接。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有请求的身份链接。状态包含有关此错误的额外信息。</p></td>
</tr>
</tbody>
</table>

### 在任务上创建新评论

    POST runtime/tasks/{taskId}/comments

<table>
<caption>在任务上创建新评论 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建评论的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    {
      "message" : "This is a comment on the task.",
      "saveProcessInstanceId" : true
    }

参数 saveProcessInstanceId 是可选的,如果为 true,则将任务的流程实例 ID 与评论一起保存。

**成功响应体:**

    {
      "id" : "123",
      "taskUrl" : "http://localhost:8081/flowable-rest/service/runtime/tasks/101/comments/123",
      "processInstanceUrl" : "http://localhost:8081/flowable-rest/service/history/historic-process-instances/100/comments/123",
      "message" : "This is a comment on the task.",
      "author" : "kermit",
      "time" : "2014-07-13T13:13:52.232+08:00"
      "taskId" : "101",
      "processInstanceId" : "100"
    }

<table>
<caption>在任务上创建新评论 - 响应码</caption>
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
<td><p>表示评论已创建并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求中缺少评论。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 获取任务的所有评论

    GET runtime/tasks/{taskId}/comments

<table>
<caption>获取任务的所有评论 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取评论的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
      {
        "id" : "123",
        "taskUrl" : "http://localhost:8081/flowable-rest/service/runtime/tasks/101/comments/123",
        "processInstanceUrl" : "http://localhost:8081/flowable-rest/service/history/historic-process-instances/100/comments/123",
        "message" : "This is a comment on the task.",
        "author" : "kermit"
        "time" : "2014-07-13T13:13:52.232+08:00"
        "taskId" : "101",
        "processInstanceId" : "100"
      },
      {
        "id" : "456",
        "taskUrl" : "http://localhost:8081/flowable-rest/service/runtime/tasks/101/comments/456",
        "processInstanceUrl" : "http://localhost:8081/flowable-rest/service/history/historic-process-instances/100/comments/456",
        "message" : "This is another comment on the task.",
        "author" : "gonzo",
        "time" : "2014-07-13T13:13:52.232+08:00"
        "taskId" : "101",
        "processInstanceId" : "100"
      }
    ]

<table>
<caption>获取任务的所有评论 - 响应码</caption>
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
<td><p>表示已找到任务并已返回评论。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 获取任务的评论

    GET runtime/tasks/{taskId}/comments/{commentId}

<table>
<caption>获取任务的评论 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取评论的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>commentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>评论的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id" : "123",
      "taskUrl" : "http://localhost:8081/flowable-rest/service/runtime/tasks/101/comments/123",
      "processInstanceUrl" : "http://localhost:8081/flowable-rest/service/history/historic-process-instances/100/comments/123",
      "message" : "This is a comment on the task.",
      "author" : "kermit",
      "time" : "2014-07-13T13:13:52.232+08:00"
      "taskId" : "101",
      "processInstanceId" : "100"
    }

<table>
<caption>获取任务的评论 - 响应码</caption>
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
<td><p>表示已找到任务和评论并已返回评论。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有具有给定 ID 的评论。</p></td>
</tr>
</tbody>
</table>

### 删除任务上的评论

    DELETE runtime/tasks/{taskId}/comments/{commentId}

<table>
<caption>删除任务上的评论 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除评论的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>commentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>评论的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除任务上的评论 - 响应码</caption>
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
<td><p>表示已找到任务和评论并已删除评论。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有具有给定 ID 的评论。</p></td>
</tr>
</tbody>
</table>

### 获取任务的所有事件

    GET runtime/tasks/{taskId}/events

<table>
<caption>获取任务的所有事件 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取事件的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
      {
        "action" : "AddUserLink",
        "id" : "4",
        "message" : [ "gonzo", "contributor" ],
        "taskUrl" : "http://localhost:8182/runtime/tasks/2",
        "time" : "2013-05-17T11:50:50.000+0000",
        "url" : "http://localhost:8182/runtime/tasks/2/events/4",
        "userId" : null
      }
    ]

<table>
<caption>获取任务的所有事件 - 响应码</caption>
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
<td><p>表示已找到任务并已返回事件。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 获取任务的事件

    GET runtime/tasks/{taskId}/events/{eventId}

<table>
<caption>获取任务的事件 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取事件的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>eventId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>事件的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "action" : "AddUserLink",
      "id" : "4",
      "message" : [ "gonzo", "contributor" ],
      "taskUrl" : "http://localhost:8182/runtime/tasks/2",
      "time" : "2013-05-17T11:50:50.000+0000",
      "url" : "http://localhost:8182/runtime/tasks/2/events/4",
      "userId" : null
    }

<table>
<caption>获取任务的事件 - 响应码</caption>
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
<td><p>表示已找到任务和事件并已返回事件。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有具有给定 ID 的事件。</p></td>
</tr>
</tbody>
</table>

### 在任务上创建包含外部资源链接的新附件

    POST runtime/tasks/{taskId}/attachments

<table>
<caption>在任务上创建包含外部资源链接的新附件 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建附件的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    {
      "name":"Simple attachment",
      "description":"Simple attachment description", 
      "type":"simpleType",
      "externalUrl":"http://flowable.org"
    }

只有附件名称是创建新附件所必需的。

**成功响应体:**

    {
      "id":"3",
      "url":"http://localhost:8182/runtime/tasks/2/attachments/3",
      "name":"Simple attachment",
      "description":"Simple attachment description",
      "type":"simpleType", 
      "taskUrl":"http://localhost:8182/runtime/tasks/2",
      "processInstanceUrl":null,
      "externalUrl":"http://flowable.org",
      "contentUrl":null
    }

<table>
<caption>在任务上创建包含外部资源链接的新附件 - 响应码</caption>
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
<td><p>表示附件已创建并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求中缺少附件名称。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 在任务上创建带附件文件的新附件

    POST runtime/tasks/{taskId}/attachments

<table>
<caption>在任务上创建带附件文件的新附件 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建附件的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

请求类型应为 multipart/form-data。应包含一个带有变量二进制值的单个文件部分。此外,还可以包含以下额外的表单字段:

-   name: 必需的变量名称。

-   description: 附件的描述,可选。

-   type: 附件类型,可选。支持任意字符串或有效的 HTTP content-type。

**成功响应体:**

    {
        "id":"5",
        "url":"http://localhost:8182/runtime/tasks/2/attachments/5",
        "name":"Binary attachment",
        "description":"Binary attachment description",
        "type":"binaryType",
        "taskUrl":"http://localhost:8182/runtime/tasks/2",
        "processInstanceUrl":null,
        "externalUrl":null,
        "contentUrl":"http://localhost:8182/runtime/tasks/2/attachments/5/content"
    }

<table>
<caption>在任务上创建带附件文件的新附件 - 响应码</caption>
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
<td><p>表示附件已创建并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求中缺少附件名称或请求中没有文件。错误消息包含额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 获取任务的所有附件

    GET runtime/tasks/{taskId}/attachments

<table>
<caption>获取任务的所有附件 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取附件的任务的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
      {
        "id":"3",
        "url":"http://localhost:8182/runtime/tasks/2/attachments/3",
        "name":"Simple attachment",
        "description":"Simple attachment description",
        "type":"simpleType",
        "taskUrl":"http://localhost:8182/runtime/tasks/2",
        "processInstanceUrl":null,
        "externalUrl":"http://flowable.org",
        "contentUrl":null
      },
      {
        "id":"5",
        "url":"http://localhost:8182/runtime/tasks/2/attachments/5",
        "name":"Binary attachment",
        "description":"Binary attachment description",
        "type":"binaryType",
        "taskUrl":"http://localhost:8182/runtime/tasks/2",
        "processInstanceUrl":null,
        "externalUrl":null,
        "contentUrl":"http://localhost:8182/runtime/tasks/2/attachments/5/content"
      }
    ]

<table>
<caption>获取任务的所有附件 - 响应码</caption>
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
<td><p>表示已找到任务并已返回附件。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 获取任务的附件

    GET runtime/tasks/{taskId}/attachments/{attachmentId}

<table>
<caption>获取任务的附件 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取附件的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>attachmentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>附件的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id":"5",
      "url":"http://localhost:8182/runtime/tasks/2/attachments/5",
      "name":"Binary attachment",
      "description":"Binary attachment description",
      "type":"binaryType",
      "taskUrl":"http://localhost:8182/runtime/tasks/2",
      "processInstanceUrl":null,
      "externalUrl":null,
      "contentUrl":"http://localhost:8182/runtime/tasks/2/attachments/5/content"
    }

-   externalUrl - contentUrl: 如果附件是外部资源的链接,则 externalUrl 包含指向外部内容的 URL。如果附件内容存在于 Flowable 引擎中,则 contentUrl 将包含可以从中流式传输二进制内容的 URL。

-   type: 可以是任意值。当包含有效格式的媒体类型(例如 application/xml、text/plain)时,二进制内容的 HTTP 响应 content-type 将设置为给定值。

<table>
<caption>获取任务的附件 - 响应码</caption>
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
<td><p>表示已找到任务和附件并已返回附件。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有具有给定 ID 的附件。</p></td>
</tr>
</tbody>
</table>

### 获取附件的内容

    GET runtime/tasks/{taskId}/attachment/{attachmentId}/content

<table>
<caption>获取附件的内容 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取变量数据的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>attachmentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>附件的 ID。如果附件指向外部 URL 而不是 Flowable 中附加的内容,则返回 404。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取附件的内容 - 响应码</caption>
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
<td><p>表示已找到任务和附件并已返回请求的内容。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有具有给定 ID 的附件,或附件没有可用的二进制流。状态消息提供额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含二进制内容。默认情况下,响应的 content-type 设置为 application/octet-stream,除非附件类型包含有效的 Content-type。

### 删除任务上的附件

    DELETE runtime/tasks/{taskId}/attachments/{attachmentId}

<table>
<caption>删除任务上的附件 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除附件的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>attachmentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>附件的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除任务上的附件 - 响应码</caption>
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
<td><p>表示已找到任务和附件并已删除附件。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或任务没有具有给定 ID 的附件。</p></td>
</tr>
</tbody>
</table>

## 历史

### 获取历史流程实例

    GET history/historic-process-instances/{processInstanceId}

<table>
<caption>获取历史流程实例 - 响应码</caption>
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
<td><p>表示已找到历史流程实例。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到历史流程实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id" : "5",
      "businessKey" : "myKey",
      "processDefinitionId" : "oneTaskProcess%3A1%3A4",
      "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
      "startTime" : "2013-04-17T10:17:43.902+0000",
      "endTime" : "2013-04-18T14:06:32.715+0000",
      "durationInMillis" : 86400056,
      "startUserId" : "kermit",
      "startActivityId" : "startEvent",
      "endActivityId" : "endEvent",
      "deleteReason" : null,
      "superProcessInstanceId" : "3",
      "url" : "http://localhost:8182/history/historic-process-instances/5",
      "variables": null,
      "tenantId":null
    }

### 获取历史流程实例列表

    GET history/historic-process-instances

<table>
<caption>获取历史流程实例列表 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史流程实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史流程实例的流程定义键。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史流程实例的流程定义 ID。</p></td>
</tr>
<tr class="even">
<td><p>businessKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史流程实例的业务键。</p></td>
</tr>
<tr class="odd">
<td><p>involvedUser</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史流程实例的参与用户。</p></td>
</tr>
<tr class="even">
<td><p>finished</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>历史流程实例是否已完成的标识。</p></td>
</tr>
<tr class="odd">
<td><p>superProcessInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史流程实例的可选父流程 ID。</p></td>
</tr>
<tr class="even">
<td><p>excludeSubprocesses</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>仅返回不是子流程的历史流程实例。</p></td>
</tr>
<tr class="odd">
<td><p>finishedAfter</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期之后完成的历史流程实例。</p></td>
</tr>
<tr class="even">
<td><p>finishedBefore</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期之前完成的历史流程实例。</p></td>
</tr>
<tr class="odd">
<td><p>startedAfter</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期之后启动的历史流程实例。</p></td>
</tr>
<tr class="even">
<td><p>startedBefore</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期之前启动的历史流程实例。</p></td>
</tr>
<tr class="odd">
<td><p>startedBy</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回由此用户启动的历史流程实例。</p></td>
</tr>
<tr class="even">
<td><p>includeProcessVariables</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>是否同时返回历史流程实例变量的标识。</p></td>
</tr>
<tr class="odd">
<td><p>tenantId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定租户 ID 的实例。</p></td>
</tr>
<tr class="even">
<td><p>tenantIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 与给定值相似的实例。</p></td>
</tr>
<tr class="odd">
<td><p>withoutTenantId</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,则仅返回未设置租户 ID 的实例。如果为 false,则忽略 withoutTenantId 参数。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取历史流程实例列表 - 响应码</caption>
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
<td><p>表示可以查询历史流程实例。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "5",
          "businessKey" : "myKey",
          "processDefinitionId" : "oneTaskProcess%3A1%3A4",
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "startTime" : "2013-04-17T10:17:43.902+0000",
          "endTime" : "2013-04-18T14:06:32.715+0000",
          "durationInMillis" : 86400056,
          "startUserId" : "kermit",
          "startActivityId" : "startEvent",
          "endActivityId" : "endEvent",
          "deleteReason" : null,
          "superProcessInstanceId" : "3",
          "url" : "http://localhost:8182/history/historic-process-instances/5",
          "variables": [
            {
              "name": "test",
              "variableScope": "local",
              "value": "myTest"
            }
          ],
          "tenantId":null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 查询历史流程实例

    POST query/historic-process-instances

**请求体:**

    {
      "processDefinitionId" : "oneTaskProcess%3A1%3A4",
      
      "variables" : [
        {
          "name" : "myVariable",
          "value" : 1234,
          "operation" : "equals",
          "type" : "long"
        }
      ]
    }

所有支持的 JSON 参数字段与[获取历史流程实例集合](bpmn/ch14-REST.md#list-of-historic-process-instances)中的参数完全相同,但作为 JSON 请求体参数而不是 URL 参数传递,以允许更高级的查询并防止请求 URI 过长的错误。此外,查询还允许基于流程变量进行过滤。variables 属性是一个 JSON 数组,包含[此处描述的格式](#json-query-variable-format)的对象。

<table>
<caption>查询历史流程实例 - 响应码</caption>
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
<td><p>表示请求成功并已返回任务。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "5",
          "businessKey" : "myKey",
          "processDefinitionId" : "oneTaskProcess%3A1%3A4",
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "startTime" : "2013-04-17T10:17:43.902+0000",
          "endTime" : "2013-04-18T14:06:32.715+0000",
          "durationInMillis" : 86400056,
          "startUserId" : "kermit",
          "startActivityId" : "startEvent",
          "endActivityId" : "endEvent",
          "deleteReason" : null,
          "superProcessInstanceId" : "3",
          "url" : "http://localhost:8182/history/historic-process-instances/5",
          "variables": [
            {
              "name": "test",
              "variableScope": "local",
              "value": "myTest"
            }
          ],
          "tenantId":null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 删除历史流程实例

    DELETE history/historic-process-instances/{processInstanceId}

<table>
<caption>响应码</caption>
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
<td><p>表示已删除历史流程实例。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到历史流程实例。</p></td>
</tr>
</tbody>
</table>

### 获取历史流程实例的身份链接

    GET history/historic-process-instance/{processInstanceId}/identitylinks

<table>
<caption>响应码</caption>
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
<td><p>表示请求成功并已返回身份链接。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到流程实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
     {
      "type" : "participant",
      "userId" : "kermit",
      "groupId" : null,
      "taskId" : null,
      "taskUrl" : null,
      "processInstanceId" : "5",
      "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/5"
     }
    ]

### 获取历史流程实例变量的二进制数据

    GET history/historic-process-instances/{processInstanceId}/variables/{variableName}/data

<table>
<caption>获取历史流程实例变量的二进制数据 - 响应码</caption>
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
<td><p>表示已找到流程实例并已返回请求的变量数据。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的流程实例,或流程实例没有具有给定名称的变量,或变量没有可用的二进制流。状态消息提供额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含变量的二进制值。当变量类型为二进制时,响应的 content-type 设置为 application/octet-stream,而不考虑变量的内容或请求的 accept-type 头。如果是可序列化的,则使用 application/x-java-serialized-object 作为 content-type。

### 在历史流程实例上创建新评论

    POST history/historic-process-instances/{processInstanceId}/comments

<table>
<caption>在历史流程实例上创建新评论 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建评论的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    {
      "message" : "This is a comment.",
      "saveProcessInstanceId" : true
    }

参数 saveProcessInstanceId 是可选的,如果为 true,则将任务的流程实例 ID 与评论一起保存。

**成功响应体:**

    {
      "id" : "123",
      "taskUrl" : "http://localhost:8081/flowable-rest/service/runtime/tasks/101/comments/123",
      "processInstanceUrl" : "http://localhost:8081/flowable-rest/service/history/historic-process-instances/100/comments/123",
      "message" : "This is a comment on the task.",
      "author" : "kermit",
      "time" : "2014-07-13T13:13:52.232+08:00",
      "taskId" : "101",
      "processInstanceId" : "100"
    }

<table>
<caption>在历史流程实例上创建新评论 - 响应码</caption>
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
<td><p>表示评论已创建并已返回结果。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求中缺少评论。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的历史流程实例。</p></td>
</tr>
</tbody>
</table>

### 获取历史流程实例的所有评论

    GET history/historic-process-instances/{processInstanceId}/comments

<table>
<caption>获取流程实例的所有评论 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取评论的流程实例的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
      {
        "id" : "123",
        "processInstanceUrl" : "http://localhost:8081/flowable-rest/service/history/historic-process-instances/100/comments/123",
        "message" : "This is a comment on the task.",
        "author" : "kermit",
        "time" : "2014-07-13T13:13:52.232+08:00",
        "processInstanceId" : "100"
      },
      {
        "id" : "456",
        "processInstanceUrl" : "http://localhost:8081/flowable-rest/service/history/historic-process-instances/100/comments/456",
        "message" : "This is another comment.",
        "author" : "gonzo",
        "time" : "2014-07-14T15:16:52.232+08:00",
        "processInstanceId" : "100"
      }
    ]

<table>
<caption>获取流程实例的所有评论 - 响应码</caption>
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
<td><p>表示已找到流程实例并已返回评论。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务。</p></td>
</tr>
</tbody>
</table>

### 获取历史流程实例的评论

    GET history/historic-process-instances/{processInstanceId}/comments/{commentId}

<table>
<caption>获取历史流程实例的评论 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取评论的历史流程实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>commentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>评论的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id" : "123",
      "processInstanceUrl" : "http://localhost:8081/flowable-rest/service/history/historic-process-instances/100/comments/456",
      "message" : "This is another comment.",
      "author" : "gonzo",
      "time" : "2014-07-14T15:16:52.232+08:00",
      "processInstanceId" : "100"
    }

<table>
<caption>获取历史流程实例的评论 - 响应码</caption>
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
<td><p>表示已找到历史流程实例和评论并已返回评论。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的历史流程实例,或历史流程实例没有具有给定 ID 的评论。</p></td>
</tr>
</tbody>
</table>

### 删除历史流程实例的评论

    DELETE history/historic-process-instances/{processInstanceId}/comments/{commentId}

<table>
<caption>删除历史流程实例的评论 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除评论的历史流程实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>commentId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>评论的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除历史流程实例的评论 - 响应码</caption>
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
<td><p>表示已找到历史流程实例和评论并已删除评论。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务,或历史流程实例没有具有给定 ID 的评论。</p></td>
</tr>
</tbody>
</table>

### 获取单个历史任务实例

    GET history/historic-task-instances/{taskId}

<table>
<caption>获取单个历史任务实例 - 响应码</caption>
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
<td><p>表示已找到历史任务实例。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到历史任务实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "id" : "5",
      "processDefinitionId" : "oneTaskProcess%3A1%3A4",
      "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
      "processInstanceId" : "3",
      "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/3",
      "executionId" : "4",
      "name" : "My task name",
      "description" : "My task description",
      "deleteReason" : null,
      "owner" : "kermit",
      "assignee" : "fozzie",
      "startTime" : "2013-04-17T10:17:43.902+0000",
      "endTime" : "2013-04-18T14:06:32.715+0000",
      "durationInMillis" : 86400056,
      "workTimeInMillis" : 234890,
      "claimTime" : "2013-04-18T11:01:54.715+0000",
      "taskDefinitionKey" : "taskKey",
      "formKey" : null,
      "priority" : 50,
      "dueDate" : "2013-04-20T12:11:13.134+0000",
      "parentTaskId" : null,
      "url" : "http://localhost:8182/history/historic-task-instances/5",
      "variables": null,
      "tenantId":null
    }

### 获取历史任务实例

    GET history/historic-task-instances

<table>
<caption>获取历史任务实例 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>processInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程实例 ID。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程定义键。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionKeyLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程定义键,匹配给定值。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程定义 ID。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程定义名称。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionNameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程定义名称,匹配给定值。</p></td>
</tr>
<tr class="even">
<td><p>processBusinessKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程实例业务键。</p></td>
</tr>
<tr class="odd">
<td><p>processBusinessKeyLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程实例业务键,匹配给定值。</p></td>
</tr>
<tr class="even">
<td><p>executionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的执行 ID。</p></td>
</tr>
<tr class="odd">
<td><p>taskDefinitionKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>流程中任务的任务定义键。</p></td>
</tr>
<tr class="even">
<td><p>taskName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的任务名称。</p></td>
</tr>
<tr class="odd">
<td><p>taskNameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>使用 'like' 运算符的历史任务实例的任务名称。</p></td>
</tr>
<tr class="even">
<td><p>taskDescription</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的任务描述。</p></td>
</tr>
<tr class="odd">
<td><p>taskDescriptionLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>使用 'like' 运算符的历史任务实例的任务描述。</p></td>
</tr>
<tr class="even">
<td><p>taskDefinitionKey</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的流程定义中的任务标识符。</p></td>
</tr>
<tr class="odd">
<td><p>taskCategory</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>选择具有给定类别的任务。注意这是任务类别,而不是流程定义的类别(BPMN XML 中的命名空间)。</p></td>
</tr>
<tr class="even">
<td><p>taskDeleteReason</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的任务删除原因。</p></td>
</tr>
<tr class="odd">
<td><p>taskDeleteReasonLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>使用 'like' 运算符的历史任务实例的任务删除原因。</p></td>
</tr>
<tr class="even">
<td><p>taskAssignee</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的受理人。</p></td>
</tr>
<tr class="odd">
<td><p>taskAssigneeLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>使用 'like' 运算符的历史任务实例的受理人。</p></td>
</tr>
<tr class="even">
<td><p>taskOwner</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的所有者。</p></td>
</tr>
<tr class="odd">
<td><p>taskOwnerLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>使用 'like' 运算符的历史任务实例的所有者。</p></td>
</tr>
<tr class="even">
<td><p>taskInvolvedUser</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的参与用户。</p></td>
</tr>
<tr class="odd">
<td><p>taskPriority</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的优先级。</p></td>
</tr>
<tr class="even">
<td><p>finished</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>历史任务实例是否已完成的标识。</p></td>
</tr>
<tr class="odd">
<td><p>processFinished</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>历史任务实例的流程实例是否已完成的标识。</p></td>
</tr>
<tr class="even">
<td><p>parentTaskId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史任务实例的可选父任务 ID。</p></td>
</tr>
<tr class="odd">
<td><p>dueDate</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回到期日等于此日期的历史任务实例。</p></td>
</tr>
<tr class="even">
<td><p>dueDateAfter</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回到期日在此日期之后的历史任务实例。</p></td>
</tr>
<tr class="odd">
<td><p>dueDateBefore</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回到期日在此日期之前的历史任务实例。</p></td>
</tr>
<tr class="even">
<td><p>withoutDueDate</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>仅返回没有到期日的历史任务实例。当提供 false 作为值时,此参数将被忽略。</p></td>
</tr>
<tr class="odd">
<td><p>taskCompletedOn</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期完成的历史任务实例。</p></td>
</tr>
<tr class="even">
<td><p>taskCompletedAfter</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期之后完成的历史任务实例。</p></td>
</tr>
<tr class="odd">
<td><p>taskCompletedBefore</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期之前完成的历史任务实例。</p></td>
</tr>
<tr class="even">
<td><p>taskCreatedOn</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期创建的历史任务实例。</p></td>
</tr>
<tr class="odd">
<td><p>taskCreatedBefore</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期之前创建的历史任务实例。</p></td>
</tr>
<tr class="even">
<td><p>taskCreatedAfter</p></td>
<td><p>否</p></td>
<td><p>Date</p></td>
<td><p>仅返回在此日期之后创建的历史任务实例。</p></td>
</tr>
<tr class="odd">
<td><p>includeTaskLocalVariables</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>是否同时返回历史任务实例的本地变量。</p></td>
</tr>
<tr class="even">
<td><p>includeProcessVariables</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>是否同时返回历史任务实例的全局变量。</p></td>
</tr>
<tr class="odd">
<td><p>tenantId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定租户 ID 的历史任务实例。</p></td>
</tr>
<tr class="even">
<td><p>tenantIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 与给定值相似的历史任务实例。</p></td>
</tr>
<tr class="odd">
<td><p>withoutTenantId</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,则仅返回未设置租户 ID 的历史任务实例。如果为 false,则忽略 withoutTenantId 参数。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取历史任务实例 - 响应码</caption>
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
<td><p>表示可以查询历史流程实例。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "5",
          "processDefinitionId" : "oneTaskProcess%3A1%3A4",
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "processInstanceId" : "3",
          "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/3",
          "executionId" : "4",
          "name" : "My task name",
          "description" : "My task description", 
          "deleteReason" : null,
          "owner" : "kermit",
          "assignee" : "fozzie",
          "startTime" : "2013-04-17T10:17:43.902+0000",
          "endTime" : "2013-04-18T14:06:32.715+0000",
          "durationInMillis" : 86400056,
          "workTimeInMillis" : 234890,
          "claimTime" : "2013-04-18T11:01:54.715+0000",
          "taskDefinitionKey" : "taskKey",
          "formKey" : null,
          "priority" : 50,
          "dueDate" : "2013-04-20T12:11:13.134+0000",
          "parentTaskId" : null,
          "url" : "http://localhost:8182/history/historic-task-instances/5",
          "taskVariables": [
            {
              "name": "test",
              "variableScope": "local",
              "value": "myTest"
            }
          ],
          "processVariables": [
            {
              "name": "processTest",
              "variableScope": "global", 
              "value": "myProcessTest"
            }
          ],
          "tenantId":null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 查询历史任务实例

    POST query/historic-task-instances

**查询历史任务实例 - 请求体:**

    {
      "processDefinitionId" : "oneTaskProcess%3A1%3A4",
      ...

      "variables" : [
        {
          "name" : "myVariable",
          "value" : 1234,
          "operation" : "equals",
          "type" : "long"
        }
      ]
    }

所有支持的 JSON 参数字段与[获取历史任务实例集合](bpmn/ch14-REST.md#get-historic-task-instances)中的参数完全相同,但作为 JSON 请求体参数而不是 URL 参数传递,以允许更高级的查询并防止请求 URI 过长的错误。此外,查询还允许基于流程变量进行过滤。taskVariables 和 processVariables 属性是 JSON 数组,包含[此处描述的格式](#json-query-variable-format)的对象。

<table>
<caption>查询历史任务实例 - 响应码</caption>
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
<td><p>表示请求成功并已返回任务。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "5",
          "processDefinitionId" : "oneTaskProcess%3A1%3A4",
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "processInstanceId" : "3",
          "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/3",
          "executionId" : "4",
          "name" : "My task name",
          "description" : "My task description",
          "deleteReason" : null,
          "owner" : "kermit",
          "assignee" : "fozzie",
          "startTime" : "2013-04-17T10:17:43.902+0000",
          "endTime" : "2013-04-18T14:06:32.715+0000",
          "durationInMillis" : 86400056,
          "workTimeInMillis" : 234890,
          "claimTime" : "2013-04-18T11:01:54.715+0000",
          "taskDefinitionKey" : "taskKey",
          "formKey" : null,
          "priority" : 50,
          "dueDate" : "2013-04-20T12:11:13.134+0000",
          "parentTaskId" : null,
          "url" : "http://localhost:8182/history/historic-task-instances/5",
          "taskVariables": [
            {
              "name": "test",
              "variableScope": "local",
              "value": "myTest"
            }
          ],
          "processVariables": [
            {
              "name": "processTest",
              "variableScope": "global",
              "value": "myProcessTest"
            }
          ],
          "tenantId":null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 删除历史任务实例

    DELETE history/historic-task-instances/{taskId}

<table>
<caption>响应码</caption>
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
<td><p>表示已删除历史任务实例。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到历史任务实例。</p></td>
</tr>
</tbody>
</table>

### 获取历史任务实例的身份链接

    GET history/historic-task-instance/{taskId}/identitylinks

<table>
<caption>响应码</caption>
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
<td><p>表示请求成功并已返回身份链接。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到任务实例。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    [
     {
      "type" : "assignee",
      "userId" : "kermit",
      "groupId" : null,
      "taskId" : "6",
      "taskUrl" : "http://localhost:8182/history/historic-task-instances/5",
      "processInstanceId" : null,
      "processInstanceUrl" : null
     }
    ]

### 获取历史任务实例变量的二进制数据

    GET history/historic-task-instances/{taskId}/variables/{variableName}/data

<table>
<caption>获取历史任务实例变量的二进制数据 - 响应码</caption>
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
<td><p>表示已找到任务实例并已返回请求的变量数据。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的任务实例,或流程实例没有具有给定名称的变量,或变量没有可用的二进制流。状态消息提供额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含变量的二进制值。当变量类型为二进制时,响应的 content-type 设置为 application/octet-stream,而不考虑变量的内容或请求的 accept-type 头。如果是可序列化的,则使用 application/x-java-serialized-object 作为 content-type。

### 获取历史活动实例

    GET history/historic-activity-instances

<table>
<caption>获取历史活动实例 - URL 参数</caption>
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
<td><p>activityId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>活动实例的 ID。</p></td>
</tr>
<tr class="even">
<td><p>activityInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史活动实例的 ID。</p></td>
</tr>
<tr class="odd">
<td><p>activityName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史活动实例的名称。</p></td>
</tr>
<tr class="even">
<td><p>activityType</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史活动实例的元素类型。</p></td>
</tr>
<tr class="odd">
<td><p>executionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史活动实例的执行 ID。</p></td>
</tr>
<tr class="even">
<td><p>finished</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>历史活动实例是否已完成的标识。</p></td>
</tr>
<tr class="odd">
<td><p>taskAssignee</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史活动实例的受理人。</p></td>
</tr>
<tr class="even">
<td><p>processInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史活动实例的流程实例 ID。</p></td>
</tr>
<tr class="odd">
<td><p>processDefinitionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史活动实例的流程定义 ID。</p></td>
</tr>
<tr class="even">
<td><p>tenantId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回具有给定租户 ID 的实例。</p></td>
</tr>
<tr class="odd">
<td><p>tenantIdLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 与给定值相似的实例。</p></td>
</tr>
<tr class="even">
<td><p>withoutTenantId</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,则仅返回未设置租户 ID 的实例。如果为 false,则忽略 withoutTenantId 参数。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取历史活动实例 - 响应码</caption>
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
<td><p>表示可以查询历史活动实例。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "5",
          "activityId" : "4", 
          "activityName" : "My user task",
          "activityType" : "userTask",
          "processDefinitionId" : "oneTaskProcess%3A1%3A4",
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "processInstanceId" : "3",
          "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/3",
          "executionId" : "4",
          "taskId" : "4",
          "calledProcessInstanceId" : null,
          "assignee" : "fozzie",
          "startTime" : "2013-04-17T10:17:43.902+0000",
          "endTime" : "2013-04-18T14:06:32.715+0000",
          "durationInMillis" : 86400056,
          "tenantId":null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 查询历史活动实例

    POST query/historic-activity-instances

**请求体:**

    {
      "processDefinitionId" : "oneTaskProcess%3A1%3A4"
    }

所有支持的 JSON 参数字段与[获取历史任务实例集合](bpmn/ch14-REST.md#get-historic-task-instances)中的参数完全相同,但作为 JSON 请求体参数而不是 URL 参数传递,以允许更高级的查询并防止请求 URI 过长的错误。

<table>
<caption>查询历史活动实例 - 响应码</caption>
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
<td><p>表示请求成功并已返回活动。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "5",
          "activityId" : "4",
          "activityName" : "My user task",
          "activityType" : "userTask",
          "processDefinitionId" : "oneTaskProcess%3A1%3A4",
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definitions/oneTaskProcess%3A1%3A4",
          "processInstanceId" : "3",
          "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/3",
          "executionId" : "4",
          "taskId" : "4",
          "calledProcessInstanceId" : null,
          "assignee" : "fozzie",
          "startTime" : "2013-04-17T10:17:43.902+0000",
          "endTime" : "2013-04-18T14:06:32.715+0000",
          "durationInMillis" : 86400056,
          "tenantId":null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 获取历史变量实例列表

    GET history/historic-variable-instances

<table>
<caption>获取历史变量实例列表 - URL 参数</caption>
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
<td><p>processInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史变量实例的流程实例 ID。</p></td>
</tr>
<tr class="even">
<td><p>taskId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史变量实例的任务 ID。</p></td>
</tr>
<tr class="odd">
<td><p>excludeTaskVariables</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>是否从结果中排除任务变量的标识。</p></td>
</tr>
<tr class="even">
<td><p>variableName</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史变量实例的变量名称。</p></td>
</tr>
<tr class="odd">
<td><p>variableNameLike</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>使用 'like' 运算符的历史变量实例的变量名称。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取历史变量实例列表 - 响应码</caption>
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
<td><p>表示可以查询历史变量实例。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "14",
          "processInstanceId" : "5",
          "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/5",
          "taskId" : "6",
          "variable" : {
            "name" : "myVariable",
            "variableScope": "global",
            "value" : "test"
          }
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 查询历史变量实例

    POST query/historic-variable-instances

**请求体:**

    {
      "processDefinitionId" : "oneTaskProcess%3A1%3A4",
      ...

      "variables" : [
        {
          "name" : "myVariable",
          "value" : 1234,
          "operation" : "equals",
          "type" : "long"
        }
      ]
    }

所有支持的 JSON 参数字段与[获取历史流程实例集合](bpmn/ch14-REST.md#list-of-historic-variable-instances)中的参数完全相同,但作为 JSON 请求体参数而不是 URL 参数传递,以允许更高级的查询并防止请求 URI 过长的错误。此外,查询还允许基于流程变量进行过滤。variables 属性是一个 JSON 数组,包含[此处描述的格式](#json-query-variable-format)的对象。

<table>
<caption>查询历史变量实例 - 响应码</caption>
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
<td><p>表示请求成功并已返回任务。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "14",
          "processInstanceId" : "5",
          "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/5",
          "taskId" : "6",
          "variable" : {
            "name" : "myVariable",
            "variableScope": "global",
            "value" : "test"
          }
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 获取历史任务实例变量的二进制数据

    GET history/historic-variable-instances/{varInstanceId}/data

<table>
<caption>获取历史任务实例变量的二进制数据 - 响应码</caption>
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
<td><p>表示已找到变量实例并已返回请求的变量数据。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的变量实例,或变量实例没有具有给定名称的变量,或变量没有可用的二进制流。状态消息提供额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含变量的二进制值。当变量类型为二进制时,响应的 content-type 设置为 application/octet-stream,而不考虑变量的内容或请求的 accept-type 头。如果是可序列化的,则使用 application/x-java-serialized-object 作为 content-type。

### 获取历史详情

    GET history/historic-detail

<table>
<caption>获取历史详情 - URL 参数</caption>
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
<td><p>id</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史详情的 ID。</p></td>
</tr>
<tr class="even">
<td><p>processInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史详情的流程实例 ID。</p></td>
</tr>
<tr class="odd">
<td><p>executionId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史详情的执行 ID。</p></td>
</tr>
<tr class="even">
<td><p>activityInstanceId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史详情的活动实例 ID。</p></td>
</tr>
<tr class="odd">
<td><p>taskId</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>历史详情的任务 ID。</p></td>
</tr>
<tr class="even">
<td><p>selectOnlyFormProperties</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>指示是否仅在结果中返回表单属性。</p></td>
</tr>
<tr class="odd">
<td><p>selectOnlyVariableUpdates</p></td>
<td><p>否</p></td>
<td><p>Boolean</p></td>
<td><p>指示是否仅在结果中返回变量更新。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取历史详情 - 响应码</caption>
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
<td><p>表示可以查询历史详情。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "26",
          "processInstanceId" : "5",
          "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/5",
          "executionId" : "6",
          "activityInstanceId", "10",
          "taskId" : "6",
          "taskUrl" : "http://localhost:8182/history/historic-task-instances/6",
          "time" : "2013-04-17T10:17:43.902+0000",
          "detailType" : "variableUpdate",
          "revision" : 2,
          "variable" : {
            "name" : "myVariable",
            "variableScope": "global",
            "value" : "test"
          },
          "propertyId": null,
          "propertyValue": null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 查询历史详情

    POST query/historic-detail

**请求体:**

    {
      "processInstanceId" : "5",
    }

所有支持的 JSON 参数字段与[获取历史流程实例集合](bpmn/ch14-REST.md#get-historic-detail)中的参数完全相同,但作为 JSON 请求体参数而不是 URL 参数传递,以允许更高级的查询并防止请求 URI 过长的错误。

<table>
<caption>查询历史详情 - 响应码</caption>
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
<td><p>表示请求成功并已返回历史详情。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "id" : "26",
          "processInstanceId" : "5",
          "processInstanceUrl" : "http://localhost:8182/history/historic-process-instances/5",
          "executionId" : "6",
          "activityInstanceId", "10",
          "taskId" : "6",
          "taskUrl" : "http://localhost:8182/history/historic-task-instances/6",
          "time" : "2013-04-17T10:17:43.902+0000",
          "detailType" : "variableUpdate",
          "revision" : 2,
          "variable" : {
            "name" : "myVariable",
            "variableScope": "global",
            "value" : "test"
          },
          "propertyId" : null,
          "propertyValue" : null
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 获取历史详情变量的二进制数据

    GET history/historic-detail/{detailId}/data

<table>
<caption>获取历史详情变量的二进制数据 - 响应码</caption>
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
<td><p>表示已找到历史详情实例并已返回请求的变量数据。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的历史详情实例,或历史详情实例没有具有给定名称的变量,或变量没有可用的二进制流。状态消息提供额外信息。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

响应体包含变量的二进制值。当变量类型为二进制时,响应的 content-type 设置为 application/octet-stream,而不考虑变量的内容或请求的 accept-type 头。如果是可序列化的,则使用 application/x-java-serialized-object 作为 content-type。

## 表单

### 获取表单数据

    GET form/form-data

<table>
<caption>获取表单数据 - URL 参数</caption>
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
<td><p>taskId</p></td>
<td><p>是(如果没有 processDefinitionId)</p></td>
<td><p>String</p></td>
<td><p>需要获取表单数据的任务的 ID。</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionId</p></td>
<td><p>是(如果没有 taskId)</p></td>
<td><p>String</p></td>
<td><p>需要获取开始事件表单数据的流程定义的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取表单数据 - 响应码</caption>
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
<td><p>表示可以查询表单数据。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到表单数据。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "data": [
        {
          "formKey" : null,
          "deploymentId" : "2",
          "processDefinitionId" : "3",
          "processDefinitionUrl" : "http://localhost:8182/repository/process-definition/3",
          "taskId" : "6",
          "taskUrl" : "http://localhost:8182/runtime/task/6",
          "formProperties" : [
            {
              "id" : "room",
              "name" : "Room",
              "type" : "string",
              "value" : null,
              "readable" : true,
              "writable" : true,
              "required" : true,
              "datePattern" : null,
              "enumValues" : [
                {
                  "id" : "normal",
                  "name" : "Normal bed"
                },
                {
                  "id" : "kingsize",
                  "name" : "Kingsize bed"
                },
              ]
            }
          ]
        }
      ],
      "total": 1,
      "start": 0,
      "sort": "name",
      "order": "asc",
      "size": 1
    }

### 提交任务表单数据

    POST form/form-data

**任务表单的请求体:**

    {
      "taskId" : "5",
      "properties" : [
        {
          "id" : "room",
          "value" : "normal"
        }
      ]
    }

**开始事件表单的请求体:**

    {
      "processDefinitionId" : "5",
      "businessKey" : "myKey",
      "properties" : [
        {
          "id" : "room",
          "value" : "normal"
        }
      ]
    }

<table>
<caption>提交任务表单数据 - 响应码</caption>
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
<td><p>表示请求成功并已提交表单数据。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示参数格式错误。状态消息包含额外信息。</p></td>
</tr>
</tbody>
</table>

**开始事件表单数据的成功响应体(任务表单数据没有响应):**

    {
      "id" : "5",
      "url" : "http://localhost:8182/history/historic-process-instances/5",
      "businessKey" : "myKey",
      "suspended": false,
      "processDefinitionId" : "3",
      "processDefinitionUrl" : "http://localhost:8182/repository/process-definition/3",
      "activityId" : "myTask"
    }

## 数据库表

### 获取表列表

    GET management/tables

<table>
<caption>获取表列表 - 响应码</caption>
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

    [
       {
          "name":"ACT_RU_VARIABLE",
          "url":"http://localhost:8182/management/tables/ACT_RU_VARIABLE",
          "count":4528
       },
       {
          "name":"ACT_RU_EVENT_SUBSCR",
          "url":"http://localhost:8182/management/tables/ACT_RU_EVENT_SUBSCR",
          "count":3
       }
    ]

### 获取单个表

    GET management/tables/{tableName}

<table>
<caption>获取单个表 - URL 参数</caption>
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
<td><p>tableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的表的名称。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
          "name":"ACT_RE_PROCDEF",
          "url":"http://localhost:8182/management/tables/ACT_RE_PROCDEF",
          "count":60
    }

<table>
<caption>获取单个表 - 响应码</caption>
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
<td><p>表示表存在并已返回表计数。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的表不存在。</p></td>
</tr>
</tbody>
</table>

### 获取单个表的列信息

    GET management/tables/{tableName}/columns

<table>
<caption>获取单个表的列信息 - URL 参数</caption>
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
<td><p>tableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的表的名称。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "tableName":"ACT_RU_VARIABLE",
       "columnNames":[
          "ID_",
          "REV_",
          "TYPE_",
          "NAME_"


       ],
       "columnTypes":[
          "VARCHAR",
          "INTEGER",
          "VARCHAR",
          "VARCHAR"


       ]
    }

<table>
<caption>获取单个表的列信息 - 响应码</caption>
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
<td><p>表示表存在并已返回表列信息。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的表不存在。</p></td>
</tr>
</tbody>
</table>

### 获取单个表的行数据

    GET management/tables/{tableName}/data

<table>
<caption>获取单个表的行数据 - URL 参数</caption>
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
<td><p>tableName</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的表的名称。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取单个表的行数据 - URL 查询参数</caption>
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
<td><p>start</p></td>
<td><p>否</p></td>
<td><p>Integer</p></td>
<td><p>要获取的第一行的索引。默认为 0。</p></td>
</tr>
<tr class="even">
<td><p>size</p></td>
<td><p>否</p></td>
<td><p>Integer</p></td>
<td><p>要获取的行数,从 start 开始。默认为 10。</p></td>
</tr>
<tr class="odd">
<td><p>orderAscendingColumn</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>用于对结果行进行升序排序的列名。</p></td>
</tr>
<tr class="even">
<td><p>orderDescendingColumn</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>用于对结果行进行降序排序的列名。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
      "total":3,
       "start":0,
       "sort":null,
       "order":null,
       "size":3,

       "data":[
          {
             "TASK_ID_":"2",
             "NAME_":"var1",
             "REV_":1,
             "TEXT_":"123",
             "LONG_":123,
             "ID_":"3",
             "TYPE_":"integer"
          }



       ]

    }

<table>
<caption>获取单个表的行数据 - 响应码</caption>
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
<td><p>表示表存在并已返回表行数据。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的表不存在。</p></td>
</tr>
</tbody>
</table>

## 引擎

### 获取引擎属性

    GET management/properties

返回引擎内部使用的属性的只读视图。

**成功响应体:**

    {
       "next.dbid":"101",
       "schema.history":"create(5.15)",
       "schema.version":"5.15"
    }

<table>
<caption>获取引擎属性 - 响应码</caption>
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
<td><p>表示已返回属性。</p></td>
</tr>
</tbody>
</table>

### 获取引擎信息

    GET management/engine

返回此 REST 服务中使用的引擎的只读视图。

**成功响应体:**

    {
       "name":"default",
       "version":"5.15",
       "resourceUrl":"file://flowable/flowable.cfg.xml",
       "exception":null
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

## 运行时

### 接收信号事件

    POST runtime/signals

通知引擎已收到信号事件,该事件未明确关联到特定执行。

**请求体 JSON:**

    {
      "signalName": "My Signal",
      "tenantId" : "execute",
      "async": true,
      "variables": [
          {"name": "testVar", "value": "This is a string"}
      ]
    }

<table>
<caption>接收信号事件 - JSON 请求体参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>是否必需</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>signalName</p></td>
<td><p>信号的名称</p></td>
<td><p>是</p></td>
</tr>
<tr class="even">
<td><p>tenantId</p></td>
<td><p>应处理信号事件的租户的 ID</p></td>
<td><p>否</p></td>
</tr>
<tr class="odd">
<td><p>async</p></td>
<td><p>如果为 true,信号处理将异步进行。返回码将为 202 - Accepted,表示请求已接受但尚未执行。如果为 false,信号处理将立即完成,结果(200 - OK)仅在成功完成后返回。如果省略则默认为 false。</p></td>
<td><p>否</p></td>
</tr>
<tr class="even">
<td><p>variables</p></td>
<td><p>用作与信号一起传递的有效负载的变量数组(采用通用变量格式)。当 async 设置为 true 时不能使用,这将导致错误。</p></td>
<td><p>否</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

<table>
<caption>接收信号事件 - 响应码</caption>
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
<td><p>表示信号已处理且未发生错误。</p></td>
</tr>
<tr class="even">
<td><p>202</p></td>
<td><p>表示信号处理已作为作业排队,准备执行。</p></td>
</tr>
<tr class="odd">
<td><p>400</p></td>
<td><p>信号未处理。缺少信号名称或变量与 async 一起使用(这是不允许的)。响应体包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

## 作业

### 获取单个作业

    GET management/jobs/{jobId}

<table>
<caption>获取单个作业 - URL 参数</caption>
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
<td><p>jobId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的作业的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"8",
       "url":"http://localhost:8182/management/jobs/8",
       "processInstanceId":"5",
       "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
       "processDefinitionId":"timerProcess:1:4",
       "processDefinitionUrl":"http://localhost:8182/repository/process-definitions/timerProcess%3A1%3A4",
       "executionId":"7",
       "executionUrl":"http://localhost:8182/runtime/executions/7",
       "retries":3,
       "exceptionMessage":null,
       "dueDate":"2013-06-04T22:05:05.474+0000",
       "tenantId":null
    }

<table>
<caption>获取单个作业 - 响应码</caption>
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
<td><p>表示作业存在并已返回。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的作业不存在。</p></td>
</tr>
</tbody>
</table>

### 删除作业

    DELETE management/jobs/{jobId}

<table>
<caption>删除作业 - URL 参数</caption>
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
<td><p>jobId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的作业的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除作业 - 响应码</caption>
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
<td><p>表示已找到作业并已删除。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的作业不存在。</p></td>
</tr>
</tbody>
</table>

### 执行单个作业

    POST management/jobs/{jobId}

**请求体 JSON:**

    {
      "action" : "execute"
    }

<table>
<caption>执行单个作业 - JSON 请求体参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>是否必需</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>action</p></td>
<td><p>要执行的操作。仅支持 execute。</p></td>
<td><p>是</p></td>
</tr>
</tbody>
</table>

<table>
<caption>执行单个作业 - 响应码</caption>
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
<td><p>表示作业已执行。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的作业。</p></td>
</tr>
<tr class="odd">
<td><p>500</p></td>
<td><p>表示执行作业时发生异常。状态描述包含有关错误的额外详细信息。如果需要,可以稍后获取完整的错误堆栈跟踪。</p></td>
</tr>
</tbody>
</table>

### 获取作业的异常堆栈跟踪

    GET management/jobs/{jobId}/exception-stacktrace

<table>
<caption>获取作业的异常堆栈跟踪 - URL 参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>是否必需</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>jobId</p></td>
<td><p>要获取堆栈跟踪的作业的 ID。</p></td>
<td><p>是</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取作业的异常堆栈跟踪 - 响应码</caption>
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
<td><p>表示已找到请求的作业并已返回堆栈跟踪。响应包含原始堆栈跟踪,且 Content-type 始终为 text/plain。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的作业,或作业没有异常堆栈跟踪。状态描述包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

### 获取作业列表

    GET management/jobs

<table>
<caption>获取作业列表 - URL 查询参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>类型</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>id</p></td>
<td><p>仅返回具有给定 ID 的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>processInstanceId</p></td>
<td><p>仅返回属于具有给定 ID 的流程的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>executionId</p></td>
<td><p>仅返回属于具有给定 ID 的执行的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionId</p></td>
<td><p>仅返回具有给定流程定义 ID 的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>withRetriesLeft</p></td>
<td><p>如果为 true,仅返回还有重试次数的作业。如果为 false,则忽略此参数。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="even">
<td><p>executable</p></td>
<td><p>如果为 true,仅返回可执行的作业。如果为 false,则忽略此参数。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="odd">
<td><p>timersOnly</p></td>
<td><p>如果为 true,仅返回定时器类型的作业。如果为 false,则忽略此参数。不能与 'messagesOnly' 一起使用。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="even">
<td><p>messagesOnly</p></td>
<td><p>如果为 true,仅返回消息类型的作业。如果为 false,则忽略此参数。不能与 'timersOnly' 一起使用。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="odd">
<td><p>withException</p></td>
<td><p>如果为 true,仅返回执行时发生异常的作业。如果为 false,则忽略此参数。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="even">
<td><p>dueBefore</p></td>
<td><p>仅返回在给定日期之前到期执行的作业。没有到期日期的作业永远不会使用此参数返回。</p></td>
<td><p>Date</p></td>
</tr>
<tr class="odd">
<td><p>dueAfter</p></td>
<td><p>仅返回在给定日期之后到期执行的作业。没有到期日期的作业永远不会使用此参数返回。</p></td>
<td><p>Date</p></td>
</tr>
<tr class="even">
<td><p>exceptionMessage</p></td>
<td><p>仅返回具有给定异常消息的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>tenantId</p></td>
<td><p>仅返回具有给定租户 ID 的作业。</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>tenantIdLike</p></td>
<td><p>仅返回租户 ID 与给定值相似的作业。</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>withoutTenantId</p></td>
<td><p>如果为 true,仅返回未设置租户 ID 的作业。如果为 false,则忽略此参数。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="even">
<td><p>withoutScopeType</p></td>
<td><p>如果为 true,仅返回未设置作用域类型的作业。如果为 false,则忽略此参数。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="odd">
<td><p>sort</p></td>
<td><p>用于对结果排序的字段,应为 id、dueDate、executionId、processInstanceId、retries 或 tenantId 之一。</p></td>
<td><p>String</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
          {
             "id":"13",
             "url":"http://localhost:8182/management/jobs/13",
             "processInstanceId":"5",
             "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
             "processDefinitionId":"timerProcess:1:4",
             "processDefinitionUrl":"http://localhost:8182/repository/process-definitions/timerProcess%3A1%3A4",
             "executionId":"12",
             "executionUrl":"http://localhost:8182/runtime/executions/12",
             "retries":0,
             "exceptionMessage":"Can't find scripting engine for 'unexistinglanguage'",
             "dueDate":"2013-06-07T10:00:24.653+0000",
             "tenantId":null
          }



       ],
       "total":2,
       "start":0,
       "sort":"id",
       "order":"asc",
       "size":2
    }

<table>
<caption>获取作业列表 - 响应码</caption>
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
<td><p>表示已返回请求的作业。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示在 URL 查询参数中使用了非法值,或同时使用了 'messagesOnly' 和 'timersOnly' 参数。状态描述包含有关错误的额外详细信息。</p></td>
</tr>
</tbody>
</table>

### 获取单个死信作业

    GET management/deadletter-jobs/{jobId}

<table>
<caption>获取单个死信作业 - URL 参数</caption>
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
<td><p>jobId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的死信作业的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"8",
       "url":"http://localhost:8182/management/jobs/8",
       "processInstanceId":"5",
       "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
       "processDefinitionId":"timerProcess:1:4",
       "processDefinitionUrl":"http://localhost:8182/repository/process-definitions/timerProcess%3A1%3A4",
       "executionId":"7",
       "executionUrl":"http://localhost:8182/runtime/executions/7",
       "retries":0,
       "exceptionMessage":"Can't find scripting engine for 'unexistinglanguage'",
       "dueDate":"2013-06-04T22:05:05.474+0000",
       "tenantId":null
    }

<table>
<caption>获取单个死信作业 - 响应码</caption>
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
<td><p>表示死信作业存在并已返回。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的死信作业不存在。</p></td>
</tr>
</tbody>
</table>

### 删除死信作业

    DELETE management/deadletter-jobs/{jobId}

<table>
<caption>删除死信作业 - URL 参数</caption>
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
<td><p>jobId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的死信作业的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除死信作业 - 响应码</caption>
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
<td><p>表示已找到死信作业并已删除。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的死信作业不存在。</p></td>
</tr>
</tbody>
</table>

### 恢复并执行死信作业

    POST management/deadletter-jobs/{jobId}

**请求体 JSON:**

    {
      "action" : "move"
    }

<table>
<caption>恢复并执行死信作业 - JSON 请求体参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>是否必需</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>action</p></td>
<td><p>要执行的操作。仅支持 execute。</p></td>
<td><p>是</p></td>
</tr>
</tbody>
</table>

<table>
<caption>恢复并执行死信作业 - 响应码</caption>
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
<td><p>表示死信作业已执行。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的死信作业。</p></td>
</tr>
<tr class="odd">
<td><p>500</p></td>
<td><p>表示执行死信作业时发生异常。状态描述包含有关错误的额外详细信息。如果需要,可以稍后获取完整的错误堆栈跟踪。</p></td>
</tr>
</tbody>
</table>

### 获取死信作业的异常堆栈跟踪

    GET management/deadletter-jobs/{jobId}/exception-stacktrace

<table>
<caption>获取死信作业的异常堆栈跟踪 - URL 参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>是否必需</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>jobId</p></td>
<td><p>要获取堆栈跟踪的死信作业的 ID。</p></td>
<td><p>是</p></td>
</tr>
</tbody>
</table>

<table>
<caption>获取死信作业的异常堆栈跟踪 - 响应码</caption>
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
<td><p>表示已找到请求的死信作业并已返回堆栈跟踪。响应包含原始堆栈跟踪,且 Content-type 始终为 text/plain。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的死信作业,或作业没有异常堆栈跟踪。状态描述包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

### 获取死信作业列表

    GET management/deadletter-jobs

<table>
<caption>获取死信作业列表 - URL 查询参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>类型</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>id</p></td>
<td><p>仅返回具有给定 ID 的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>processInstanceId</p></td>
<td><p>仅返回属于具有给定 ID 的流程的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>executionId</p></td>
<td><p>仅返回属于具有给定 ID 的执行的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>processDefinitionId</p></td>
<td><p>仅返回具有给定流程定义 ID 的作业</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>executable</p></td>
<td><p>如果为 true,仅返回可执行的作业。如果为 false,则忽略此参数。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="even">
<td><p>timersOnly</p></td>
<td><p>如果为 true,仅返回定时器类型的作业。如果为 false,则忽略此参数。不能与 'messagesOnly' 一起使用。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="odd">
<td><p>messagesOnly</p></td>
<td><p>如果为 true,仅返回消息类型的作业。如果为 false,则忽略此参数。不能与 'timersOnly' 一起使用。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="even">
<td><p>withException</p></td>
<td><p>如果为 true,仅返回执行时发生异常的作业。如果为 false,则忽略此参数。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="odd">
<td><p>dueBefore</p></td>
<td><p>仅返回在给定日期之前到期执行的作业。没有到期日期的作业永远不会使用此参数返回。</p></td>
<td><p>Date</p></td>
</tr>
<tr class="even">
<td><p>dueAfter</p></td>
<td><p>仅返回在给定日期之后到期执行的作业。没有到期日期的作业永远不会使用此参数返回。</p></td>
<td><p>Date</p></td>
</tr>
<tr class="odd">
<td><p>withException</p></td>
<td><p>如果为 true,仅返回执行时发生异常的作业。如果为 false,则忽略此参数。</p></td>
<td><p>Boolean</p></td>
</tr>
<tr class="even">
<td><p>tenantId</p></td>
<td><p>String</p></td>
<td><p>仅返回具有异常的作业。</p></td>
</tr>
<tr class="odd">
<td><p>tenantIdLike</p></td>
<td><p>String</p></td>
<td><p>仅返回租户 ID 与给定值相似的作业。</p></td>
</tr>
<tr class="even">
<td><p>withoutTenantId</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,仅返回未设置租户 ID 的作业。如果为 false,则忽略此参数。</p></td>
</tr>
<tr class="odd">
<td><p>locked</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,仅返回已锁定的作业。如果为 false,则忽略此参数。</p></td>
</tr>
<tr class="even">
<td><p>unlocked</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,仅返回未锁定的作业。如果为 false,则忽略此参数。</p></td>
</tr>
<tr class="odd">
<td><p>withoutScopeType</p></td>
<td><p>Boolean</p></td>
<td><p>如果为 true,仅返回未设置作用域类型的作业。如果为 false,则忽略此参数。</p></td>
</tr>
<tr class="even">
<td><p>sort</p></td>
<td><p>用于对结果排序的字段,应为 id、dueDate、executionId、processInstanceId、retries 或 tenantId 之一。</p></td>
<td><p>String</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
          {
             "id":"13",
             "url":"http://localhost:8182/management/jobs/13",
             "processInstanceId":"5",
             "processInstanceUrl":"http://localhost:8182/runtime/process-instances/5",
             "processDefinitionId":"timerProcess:1:4",
             "processDefinitionUrl":"http://localhost:8182/repository/process-definitions/timerProcess%3A1%3A4",
             "executionId":"12",
             "executionUrl":"http://localhost:8182/runtime/executions/12",
             "retries":0,
             "withException":"Can't find scripting engine for 'unexistinglanguage'",
             "dueDate":"2013-06-07T10:00:24.653+0000",
             "createTime":"2013-06-06T08:08:24.007+0000"
             "tenantId":null
          }
       ],
       "total":2,
       "start":0,
       "sort":"id",
       "order":"asc",
       "size":2
    }

<table>
<caption>获取死信作业列表 - 响应码</caption>
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
<td><p>表示已返回请求的作业。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示在 URL 查询参数中使用了非法值,或同时使用了 'messagesOnly' 和 'timersOnly' 参数。状态描述包含有关错误的额外详细信息。</p></td>
</tr>
</tbody>
</table>

## 用户

### 获取单个用户

    GET identity/users/{userId}

<table>
<caption>获取单个用户 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的用户的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"testuser",
       "firstName":"Fred",
       "lastName":"McDonald",
       "url":"http://localhost:8182/identity/users/testuser",
       "email":"no-reply@flowable.org"
    }

<table>
<caption>获取单个用户 - 响应码</caption>
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
<td><p>表示用户存在并已返回。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的用户不存在。</p></td>
</tr>
</tbody>
</table>

### 获取用户列表

    GET identity/users

<table>
<caption>获取用户列表 - URL 查询参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>类型</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>id</p></td>
<td><p>仅返回具有给定 ID 的用户</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>firstName</p></td>
<td><p>仅返回具有给定名字的用户</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>lastName</p></td>
<td><p>仅返回具有给定姓氏的用户</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>email</p></td>
<td><p>仅返回具有给定电子邮件的用户</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>firstNameLike</p></td>
<td><p>仅返回名字与给定值相似的用户。使用 % 作为通配符。</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>lastNameLike</p></td>
<td><p>仅返回姓氏与给定值相似的用户。使用 % 作为通配符。</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>emailLike</p></td>
<td><p>仅返回电子邮件与给定值相似的用户。使用 % 作为通配符。</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>memberOfGroup</p></td>
<td><p>仅返回是给定组成员的用户。</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>potentialStarter</p></td>
<td><p>仅返回是给定 ID 的流程定义的潜在启动者的用户。</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>sort</p></td>
<td><p>用于对结果排序的字段,应为 id、firstName、lastname 或 email 之一。</p></td>
<td><p>String</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
          {
             "id":"anotherUser",
             "firstName":"Tijs",
             "lastName":"Barrez",
             "url":"http://localhost:8182/identity/users/anotherUser",
             "email":"no-reply@flowable.org"
          },
          {
             "id":"kermit",
             "firstName":"Kermit",
             "lastName":"the Frog",
             "url":"http://localhost:8182/identity/users/kermit",
             "email":null
          },
          {
             "id":"testuser",
             "firstName":"Fred",
             "lastName":"McDonald",
             "url":"http://localhost:8182/identity/users/testuser",
             "email":"no-reply@flowable.org"
          }
       ],
       "total":3,
       "start":0,
       "sort":"id",
       "order":"asc",
       "size":3
    }

<table>
<caption>获取用户列表 - 响应码</caption>
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
<td><p>表示已返回请求的用户。</p></td>
</tr>
</tbody>
</table>

### 更新用户

    PUT identity/users/{userId}

**请求体 JSON:**

    {
      "firstName":"Tijs",
      "lastName":"Barrez", 
      "email":"no-reply@flowable.org",
      "password":"pass123"
    }

所有请求值都是可选的。例如,你可以在请求体 JSON 对象中只包含 'firstName' 属性,只更新用户的名字,而不影响其他字段。当显式包含某个属性并将其设置为 null 时,用户的该值将被更新为 null。例如:{"firstName" : null} 将清除用户的名字。

<table>
<caption>更新用户 - 响应码</caption>
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
<td><p>表示用户已更新。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户。</p></td>
</tr>
<tr class="odd">
<td><p>409</p></td>
<td><p>表示请求的用户被同时更新。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 identity/users/{userId} 的响应。

### 创建用户

    POST identity/users

**请求体 JSON:**

    {
      "id":"tijs",
      "firstName":"Tijs",
      "lastName":"Barrez",
      "email":"no-reply@flowable.org",
      "password":"pass123"
    }

<table>
<caption>创建用户 - 响应码</caption>
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
<td><p>表示用户已创建。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求中缺少用户的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 identity/users/{userId} 的响应。

### 删除用户

    DELETE identity/users/{userId}

<table>
<caption>删除用户 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的用户的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除用户 - 响应码</caption>
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
<td><p>表示已找到用户并已删除。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户。</p></td>
</tr>
</tbody>
</table>

### 获取用户头像

    GET identity/users/{userId}/picture

<table>
<caption>获取用户头像 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取头像的用户的 ID。</p></td>
</tr>
</tbody>
</table>

**响应体:**

响应体包含原始图片数据,表示用户的头像。响应的 Content-type 对应于创建图片时设置的 mimeType。

<table>
<caption>获取用户头像 - 响应码</caption>
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
<td><p>表示已找到用户且用户有头像,头像已在响应体中返回。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户,或用户没有头像。状态描述包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

### 更新用户头像

    GET identity/users/{userId}/picture

<table>
<caption>更新用户头像 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取头像的用户的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

请求类型应为 multipart/form-data。应包含一个带有图片二进制值的单个文件部分。此外,还可以包含以下额外的表单字段:

-   mimeType: 上传图片的可选 mime 类型。如果省略,则使用默认的 image/jpeg 作为图片的 mime 类型。

<table>
<caption>更新用户头像 - 响应码</caption>
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
<td><p>表示已找到用户且头像已更新。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户。</p></td>
</tr>
</tbody>
</table>

### 列出用户信息

    PUT identity/users/{userId}/info

<table>
<caption>列出用户信息 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取信息的用户的 ID。</p></td>
</tr>
</tbody>
</table>

**响应体:**

    [
       {
          "key":"key1",
          "url":"http://localhost:8182/identity/users/testuser/info/key1"
       },
       {
          "key":"key2",
          "url":"http://localhost:8182/identity/users/testuser/info/key2"
       }
    ]

<table>
<caption>列出用户信息 - 响应码</caption>
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
<td><p>表示已找到用户并已返回信息列表(键和 URL)。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户。</p></td>
</tr>
</tbody>
</table>

### 获取用户信息

    GET identity/users/{userId}/info/{key}

<table>
<caption>获取用户信息 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取信息的用户的 ID。</p></td>
</tr>
<tr class="even">
<td><p>key</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的用户信息的键。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "key":"key1",
       "value":"Value 1",
       "url":"http://localhost:8182/identity/users/testuser/info/key1"
    }

<table>
<caption>获取用户信息 - 响应码</caption>
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
<td><p>表示已找到用户且用户具有给定键的信息。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户,或用户没有给定键的信息。状态描述包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

### 更新用户信息

    PUT identity/users/{userId}/info/{key}

<table>
<caption>更新用户信息 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新信息的用户的 ID。</p></td>
</tr>
<tr class="even">
<td><p>key</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要更新的用户信息的键。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    {
       "value":"更新后的值"
    }

**响应体:**

    {
       "key":"key1",
       "value":"更新后的值",
       "url":"http://localhost:8182/identity/users/testuser/info/key1"
    }

<table>
<caption>更新用户信息 - 响应码</caption>
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
<td><p>表示已找到用户且信息已更新。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体中缺少值。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的用户,或用户没有具有给定键的信息。状态描述包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

### 创建新的用户信息条目

    POST identity/users/{userId}/info

<table>
<caption>创建新的用户信息条目 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要创建信息的用户的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体:**

    {
       "key":"key1",
       "value":"The value"
    }

**响应体:**

    {
       "key":"key1",
       "value":"The value",
       "url":"http://localhost:8182/identity/users/testuser/info/key1"
    }

<table>
<caption>创建新的用户信息条目 - 响应码</caption>
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
<td><p>表示已找到用户且已创建信息。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求体中缺少键或值。状态描述包含有关错误的额外信息。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的用户。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示用户已存在具有给定键的信息条目,需要更新资源实例(PUT)。</p></td>
</tr>
</tbody>
</table>

### 删除用户信息

    DELETE identity/users/{userId}/info/{key}

<table>
<caption>删除用户信息 - URL 参数</caption>
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
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除信息的用户的 ID。</p></td>
</tr>
<tr class="even">
<td><p>key</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的用户信息的键。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除用户信息 - 响应码</caption>
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
<td><p>表示已找到用户且已删除给定键的信息。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户,或用户没有具有给定键的信息。状态描述包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

## 用户组

### 获取单个用户组

    GET identity/groups/{groupId}

<table>
<caption>获取单个用户组 - URL 参数</caption>
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
<td><p>groupId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要获取的用户组的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "id":"testgroup",
       "url":"http://localhost:8182/identity/groups/testgroup",
       "name":"Test group",
       "type":"Test type"
    }

<table>
<caption>获取单个用户组 - 响应码</caption>
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
<td><p>表示用户组存在并已返回。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求的用户组不存在。</p></td>
</tr>
</tbody>
</table>

### 获取用户组列表

    GET identity/groups

<table>
<caption>获取用户组列表 - URL 查询参数</caption>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>参数</th>
<th>描述</th>
<th>类型</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>id</p></td>
<td><p>仅返回具有给定 ID 的用户组</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>name</p></td>
<td><p>仅返回具有给定名称的用户组</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>type</p></td>
<td><p>仅返回具有给定类型的用户组</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>nameLike</p></td>
<td><p>仅返回名称与给定值相似的用户组。使用 % 作为通配符。</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>member</p></td>
<td><p>仅返回具有给定用户名成员的用户组。</p></td>
<td><p>String</p></td>
</tr>
<tr class="even">
<td><p>potentialStarter</p></td>
<td><p>仅返回其成员是给定 ID 的流程定义的潜在启动者的用户组。</p></td>
<td><p>String</p></td>
</tr>
<tr class="odd">
<td><p>sort</p></td>
<td><p>用于对结果排序的字段,应为 id、name 或 type 之一。</p></td>
<td><p>String</p></td>
</tr>
</tbody>
</table>

**成功响应体:**

    {
       "data":[
         {
            "id":"testgroup",
            "url":"http://localhost:8182/identity/groups/testgroup",
            "name":"Test group",
            "type":"Test type"
         }
       ],
       "total":3,
       "start":0,
       "sort":"id",
       "order":"asc",
       "size":3
    }

<table>
<caption>获取用户组列表 - 响应码</caption>
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
<td><p>表示已返回请求的用户组。</p></td>
</tr>
</tbody>
</table>

### 更新用户组

    PUT identity/groups/{groupId}

**请求体 JSON:**

    {
       "name":"Test group",
       "type":"Test type"
    }

所有请求值都是可选的。例如,你可以在请求体 JSON 对象中只包含 'name' 属性,只更新用户组的名称,而不影响其他字段。当显式包含某个属性并将其设置为 null 时,用户组的该值将被更新为 null。

<table>
<caption>更新用户组 - 响应码</caption>
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
<td><p>表示用户组已更新。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户组。</p></td>
</tr>
<tr class="odd">
<td><p>409</p></td>
<td><p>表示请求的用户组被同时更新。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 identity/groups/{groupId} 的响应。

### 创建用户组

    POST identity/groups

**请求体 JSON:**

    {
       "id":"testgroup",
       "name":"Test group",
       "type":"Test type"
    }

<table>
<caption>创建用户组 - 响应码</caption>
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
<td><p>表示用户组已创建。</p></td>
</tr>
<tr class="even">
<td><p>400</p></td>
<td><p>表示请求中缺少用户组的 ID。</p></td>
</tr>
</tbody>
</table>

**成功响应体:** 参见 identity/groups/{groupId} 的响应。

### 删除用户组

    DELETE identity/groups/{groupId}

<table>
<caption>删除用户组 - URL 参数</caption>
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
<td><p>groupId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的用户组的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>删除用户组 - 响应码</caption>
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
<td><p>表示已找到用户组并已删除。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户组。</p></td>
</tr>
</tbody>
</table>

### 获取用户组中的成员

不允许对 identity/groups/members 使用 GET。使用 identity/users?memberOfGroup=sales URL 来获取属于特定用户组的所有用户。

### 向用户组添加成员

    POST identity/groups/{groupId}/members

<table>
<caption>向用户组添加成员 - URL 参数</caption>
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
<td><p>groupId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要添加成员的用户组的 ID。</p></td>
</tr>
</tbody>
</table>

**请求体 JSON:**

    {
       "userId":"kermit"
    }

<table>
<caption>向用户组添加成员 - 响应码</caption>
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
<td><p>表示已找到用户组并已添加成员。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示请求体中未包含用户 ID。</p></td>
</tr>
<tr class="odd">
<td><p>404</p></td>
<td><p>表示未找到请求的用户组。</p></td>
</tr>
<tr class="even">
<td><p>409</p></td>
<td><p>表示请求的用户已经是该用户组的成员。</p></td>
</tr>
</tbody>
</table>

**响应体:**

    {
       "userId":"kermit",
       "groupId":"sales",
        "url":"http://localhost:8182/identity/groups/sales/members/kermit"
    }

### 从用户组中删除成员

    DELETE identity/groups/{groupId}/members/{userId}

<table>
<caption>从用户组中删除成员 - URL 参数</caption>
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
<td><p>groupId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除成员的用户组的 ID。</p></td>
</tr>
<tr class="even">
<td><p>userId</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要删除的用户的 ID。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>从用户组中删除成员 - 响应码</caption>
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
<td><p>表示已找到用户组且成员已删除。响应体特意留空。</p></td>
</tr>
<tr class="even">
<td><p>404</p></td>
<td><p>表示未找到请求的用户组,或该用户不是该组的成员。状态描述包含有关错误的额外信息。</p></td>
</tr>
</tbody>
</table>

**响应体:**

    {
       "userId":"kermit",
       "groupId":"sales",
        "url":"http://localhost:8182/identity/groups/sales/members/kermit"
    }