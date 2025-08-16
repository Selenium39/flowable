---
id: header-rest
title: Flowable REST 通用原则
description: Flowable REST API通用原则文档，涵盖安装配置、身份认证、Tomcat部署等核心内容，提供REST API集成指南与安全最佳实践，助力开发者快速实现流程引擎集成。
keywords: Flowable,REST API,安装配置,身份认证,Spring MVC,Tomcat部署,流程引擎,JSON集成
---

## 安装和认证

Flowable 包含一个 REST API,可以通过将 flowable-rest.war 文件部署到 Apache Tomcat 等 servlet 容器来安装。此外,通过在应用程序中包含 servlet(及其映射)并将所有 flowable-rest 依赖项添加到类路径中,也可以在其他 Web 应用程序中使用它。

默认情况下,Flowable 引擎将连接到内存中的 H2 数据库。你可以在 *WEB-INF/META-INF/flowable-app* 文件夹中的 flowable-app.properties 文件中更改数据库设置。REST API 使用 JSON 格式(<http://www.json.org>),并基于 Spring MVC (<http://docs.spring.io/spring/docs/current/spring-framework-reference/html/mvc.html>)构建。

默认情况下,所有 REST 资源都需要具有 *rest-access-api* 权限的有效用户进行身份验证。如果任何有效用户都应该能够调用 REST API,则可以将 *flowable.rest.app.authentication-mode* 设置为 *any-user*(这是 Flowable 旧版本中的默认设置)。

可以通过设置以下属性来配置可以访问 REST API 的默认用户:

    flowable.rest.app.admin.user-id=rest-admin
    flowable.rest.app.admin.password=test
    flowable.rest.app.admin.first-name=Rest
    flowable.rest.app.admin.last-name=Admin

当 REST 应用程序启动时,如果用户不存在则创建用户,否则获取现有用户。该用户将被授予默认访问 REST API 所需的 *access-rest-api* 权限。**不要忘记之后更改此用户的密码**。如果未设置 *flowable.rest.app.admin.user-id*,则不会创建任何用户或权限。因此,在初始设置后,删除此属性不会删除之前配置的用户或权限。

使用基本的 HTTP 访问认证,因此在执行请求时应始终包含 *Authorization: Basic …​==* HTTP 标头,或在请求 URL 中包含用户名和密码(例如,*<http://username:password@localhost:8080/xyz>*)。

**我们建议将基本身份验证与 HTTPS 结合使用。**

## 配置

Flowable REST Web 应用程序使用 Spring Java 配置来启动 Flowable Form 引擎、使用 Spring Security 定义基本身份验证安全性,以及定义特定变量处理的变量转换器。
可以通过更改 WEB-INF/META-INF/flowable-app/flowable-app.properties 文件夹中的 flowable-app.properties 文件来定义少量属性。
如果需要更高级的配置选项,可以在 WEB-INF/classes 文件夹中的 flowable-custom-context.xml 文件中覆盖默认的 Spring bean。
该文件中已经在注释中提供了示例配置。这也是通过定义名为 restResponsefactory 的新 Spring bean 并使用自定义实现类来覆盖默认 RestResponseFactory 的地方。

## 在 Tomcat 中使用

由于 [Tomcat 的默认安全属性](http://tomcat.apache.org/tomcat-8.0-doc/security-howto.html),**默认情况下不允许使用转义的正斜杠(%2F 和 %5C)(返回 400 结果)**。这可能会影响部署资源及其数据 URL,因为 URL 可能包含转义的正斜杠。

当遇到意外的 400 结果时,请设置以下系统属性:

*-Dorg.apache.tomcat.util.buf.UDecoder.ALLOW\_ENCODED\_SLASH=true*

最佳实践是在下面描述的 HTTP 请求中始终将 **Accept** 和 **Content-Type**(在发布/放置 JSON 的情况下)标头设置为 **application/json**。

## 方法和返回码

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
<td><p>更新现有资源的属性。也用于调用现有资源上的操作。</p></td>
</tr>
<tr class="even">
<td><p>DELETE</p></td>
<td><p>删除现有资源。</p></td>
</tr>
</tbody>
</table>

<table>
<caption>HTTP 方法响应代码</caption>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>响应</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>200 - Ok</p></td>
<td><p>操作成功,并返回了响应(GET 和 PUT 请求)。</p></td>
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
<td><p>操作失败。该操作需要设置身份验证标头。如果请求中存在此标头,则提供的凭据无效或用户无权执行此操作。</p></td>
</tr>
<tr class="odd">
<td><p>403 - Forbidden</p></td>
<td><p>该操作被禁止,不应重试。这表明存在授权问题而不是身份验证问题,这是一个不允许的操作。示例:删除正在运行的进程中的任务是不允许的,并且永远不会被允许,无论用户或进程/任务状态如何。</p></td>
</tr>
<tr class="even">
<td><p>404 - Not found</p></td>
<td><p>操作失败。未找到请求的资源。</p></td>
</tr>
<tr class="odd">
<td><p>405 - Method not allowed</p></td>
<td><p>操作失败。该方法不允许用于此资源。例如,尝试更新(PUT)部署资源将导致 405 状态。</p></td>
</tr>
<tr class="even">
<td><p>409 - Conflict</p></td>
<td><p>操作失败。该操作导致更新已被另一个操作更新的资源,这使得更新不再有效。也可以表示在已存在具有该标识符的资源的集合中创建资源。</p></td>
</tr>
<tr class="odd">
<td><p>415 - Unsupported Media Type</p></td>
<td><p>操作失败。请求体包含不支持的媒体类型。当请求体 JSON 包含未知属性或值的格式/类型不正确而无法接受时也会发生。</p></td>
</tr>
<tr class="even">
<td><p>500 - Internal server error</p></td>
<td><p>操作失败。执行操作时发生意外异常。响应体包含有关错误的详细信息。</p></td>
</tr>
</tbody>
</table>

HTTP 响应的媒体类型始终为 application/json,除非请求二进制内容(例如,部署资源数据),则使用内容的媒体类型。

## 错误响应体

当发生错误时(客户端和服务器,4XX 和 5XX 状态码),响应体包含描述所发生错误的对象。以下是任务未找到时 404 状态的示例:

    {
      "statusCode" : 404,
      "errorMessage" : "Could not find a task with id '444'."
    }

## 请求参数

### URL 片段

作为 URL 一部分的参数(例如,http://host/flowable-rest/process-api/repository/deployments/{deploymentId} 中的 deploymentId 参数)
如果段包含特殊字符,需要正确转义(参见 [URL 编码或百分比编码](https://en.wikipedia.org/wiki/Percent-encoding))。大多数框架都内置了此功能,但应该考虑到这一点。特别是对于可能包含正斜杠的段(例如,部署资源),这是必需的。

### REST URL 查询参数

作为查询字符串添加到 URL 中的参数(例如,http://host/flowable-rest/process-api/repository/deployments?name=Deployment 中使用的 name 参数)可以具有以下类型,并在相应的 REST API 文档中提到:

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
<td><p>纯文本参数。可以包含 URL 中允许的任何有效字符。在 XXXLike 参数的情况下,字符串应包含通配符字符 %(正确 URL 编码)。这允许你指定模糊搜索的意图。例如,'Tas%' 匹配所有以 'Tas' 开头的值。</p></td>
</tr>
<tr class="even">
<td><p>Integer</p></td>
<td><p>表示整数值的参数。只能包含数字非小数值,介于 -2.147.483.648 和 2.147.483.647 之间。</p></td>
</tr>
<tr class="odd">
<td><p>Long</p></td>
<td><p>表示长整型值的参数。只能包含数字非小数值,介于 -9.223.372.036.854.775.808 和 9.223.372.036.854.775.807 之间。</p></td>
</tr>
<tr class="even">
<td><p>Boolean</p></td>
<td><p>表示布尔值的参数。可以是 true 或 false。除这些值之外的所有其他值都将导致 '405 - Bad request' 响应。</p></td>
</tr>
<tr class="odd">
<td><p>Date</p></td>
<td><p>表示日期值的参数。使用 ISO-8601 日期格式(参见 <a href="http://en.wikipedia.org/wiki/ISO_8601">维基百科上的 ISO-8601</a>)同时使用时间和日期组件(例如 2013-04-03T23:45Z)。</p></td>
</tr>
</tbody>
</table>

### JSON 体参数

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
<td><p>纯文本参数。在 XXXLike 参数的情况下,字符串应包含通配符字符 %。这允许你指定模糊搜索的意图。例如,'Tas%' 匹配所有以 'Tas' 开头的值。</p></td>
</tr>
<tr class="even">
<td><p>Integer</p></td>
<td><p>使用 JSON 数字表示整数值的参数。只能包含数字非小数值,介于 -2.147.483.648 和 2.147.483.647 之间。</p></td>
</tr>
<tr class="odd">
<td><p>Long</p></td>
<td><p>使用 JSON 数字表示长整型值的参数。只能包含数字非小数值,介于 -9.223.372.036.854.775.808 和 9.223.372.036.854.775.807 之间。</p></td>
</tr>
<tr class="even">
<td><p>Date</p></td>
<td><p>使用 JSON 文本表示日期值的参数。使用 ISO-8601 日期格式(参见 <a href="http://en.wikipedia.org/wiki/ISO_8601">维基百科上的 ISO-8601</a>)同时使用时间和日期组件(例如,2013-04-03T23:45Z)。</p></td>
</tr>
</tbody>
</table>

### 分页和排序

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
<td><p>根据查询实现不同而不同</p></td>
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
> 请记住,start 参数用作查询的偏移量。例如,要获取三页每页三个项目的任务(共 9 个项目),我们可以使用:
>
>     GET /runtime/tasks?start=0&size=3
>     GET /runtime/tasks?start=3&size=3
>     GET /runtime/tasks?start=6&size=3

### JSON 查询变量格式

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
<th>必需</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>name</p></td>
<td><p>否</p></td>
<td><p>要包含在查询中的变量名称。在某些查询中使用 'equals' 来查询具有给定值的<strong>任何变量名称</strong>的资源时可以为空。</p></td>
</tr>
<tr class="even">
<td><p>value</p></td>
<td><p>是</p></td>
<td><p>查询中包含的变量值,应包含给定类型的正确格式。</p></td>
</tr>
<tr class="odd">
<td><p>operator</p></td>
<td><p>是</p></td>
<td><p>查询中使用的运算符,可以具有以下值:equals、notEquals、equalsIgnoreCase、notEqualsIgnoreCase、lessThan、greaterThan、lessThanOrEquals、greaterThanOrEquals 和 like。</p></td>
</tr>
<tr class="even">
<td><p>type</p></td>
<td><p>否</p></td>
<td><p>要使用的变量类型。当省略时,类型将从 value 参数推断。任何 JSON 文本值都将被视为 string 类型,JSON 布尔值为 boolean 类型,JSON 数字根据数字大小为 long 或 integer 类型。我们建议在有疑问时包含显式类型。下面列出了开箱即用支持的类型。</p></td>
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

### 变量表示

在处理变量(执行决策)时,REST API 对读写都使用一些通用原则和 JSON 格式。变量的 JSON 表示如下所示:

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
<th>必需</th>
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
<td><p>变量的值。写入变量且省略值时,将使用 null 作为值。</p></td>
</tr>
<tr class="odd">
<td><p>valueUrl</p></td>
<td><p>否</p></td>
<td><p>读取二进制或可序列化类型的变量时,此属性将指向可以获取原始二进制数据的 URL。</p></td>
</tr>
<tr class="even">
<td><p>type</p></td>
<td><p>否</p></td>
<td><p>变量的类型。有关类型的其他信息,请参见下表。写入变量且省略此值时,类型将从原始 JSON 属性请求类型推断,并限制为 string、double、integer 和 boolean。我们建议始终包含类型,以确保不会对类型做出错误假设。</p></td>
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
<td><p>值被视为 java.lang.Integer。写入时,JSON 数字值用作转换的基础,回退到 JSON 文本。</p></td>
</tr>
<tr class="odd">
<td><p>short</p></td>
<td><p>值被视为 java.lang.Short。写入时,JSON 数字值用作转换的基础,回退到 JSON 文本。</p></td>
</tr>
<tr class="even">
<td><p>long</p></td>
<td><p>值被视为 java.lang.Long。写入时,JSON 数字值用作转换的基础,回退到 JSON 文本。</p></td>
</tr>
<tr class="odd">
<td><p>double</p></td>
<td><p>值被视为 java.lang.Double。写入时,JSON 数字值用作转换的基础,回退到 JSON 文本。</p></td>
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

可以通过自定义 JSON 表示(简单值或复杂/嵌套 JSON 对象)支持其他变量类型。通过扩展 org.flowable.dmn.rest.service.api.DmnRestResponseFactory 上的 initializeVariableConverters() 方法,你可以添加额外的 org.flowable.rest.variable.RestVariableConverter 类,以支持将 POJO 转换为适合通过 REST 传输的格式,并将 REST 值转换回 POJO。实际的 JSON 转换由 Jackson 完成。
