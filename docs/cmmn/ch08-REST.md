---
id: ch08-REST
title: REST API
description: 本文档详细介绍Flowable CMMN引擎的REST API安装配置、认证方式和最佳实践，包括Tomcat部署、权限设置和JSON数据格式处理，帮助开发者快速集成流程管理功能。
keywords: Flowable,CMMN,REST API,流程管理,认证配置,Tomcat部署,JSON格式,Spring MVC
---

## Flowable REST 基本原则

### 安装和认证

Flowable 包含一个 REST API，可以通过将 flowable-rest.war 文件部署到 Apache Tomcat 等 servlet 容器来安装到 Flowable CMMN 引擎。此外，也可以通过在应用程序中包含 servlet（和/或其映射）并将所有 flowable-rest 依赖项添加到类路径中来在其他 Web 应用程序中使用它。

默认情况下，Flowable REST 将连接到内存中的 H2 数据库。你可以在 *WEB-INF/META-INF/flowable-app* 文件夹中的 flowable-app.properties 文件中更改数据库设置。REST API 使用 JSON 格式（<http://www.json.org>）并基于 Spring MVC（<http://docs.spring.io/spring/docs/current/spring-framework-reference/html/mvc.html>）构建。

默认情况下，所有 REST 资源都需要具有 *rest-access-api* 权限的有效用户进行身份验证。如果希望任何有效用户都能调用 REST API，可以将 *flowable.rest.app.authentication-mode* 设置为 *any-user*（这是 Flowable 旧版本中的默认设置）。

可以通过设置以下属性来配置可以访问 REST API 的默认用户：

    flowable.rest.app.admin.user-id=rest-admin
    flowable.rest.app.admin.password=test
    flowable.rest.app.admin.first-name=Rest
    flowable.rest.app.admin.last-name=Admin

当 REST 应用程序启动时，如果用户不存在则创建，否则获取已存在的用户。该用户将被授予默认访问 REST API 所需的 *access-rest-api* 权限。**不要忘记之后更改此用户的密码**。如果未设置 *flowable.rest.app.admin.user-id*，则不会创建任何用户或权限。因此，在初始设置后，删除此属性不会删除之前配置的用户或权限。

使用基本的 HTTP 访问认证，因此在执行请求时应始终包含 *Authorization: Basic …​==* HTTP 头，或在请求 URL 中包含用户名和密码（例如，*<http://username:password@localhost:8080/xyz>*）。

**我们建议将基本认证与 HTTPS 结合使用。**

### 配置

Flowable REST Web 应用程序使用 Spring Boot Flowable starter 来启动 Flowable CMMN 引擎，使用 Spring Security 定义基本认证安全性，并定义特定变量处理的变量转换器。
可以通过更改 flowable-app.properties 文件来定义少量属性。

### 在 Tomcat 中使用

由于 [Tomcat 的默认安全属性](http://tomcat.apache.org/tomcat-8.0-doc/security-howto.html)，**默认情况下不允许使用转义的正斜杠（%2F 和 %5C）（返回 400 结果）。** 这可能会影响部署资源及其数据 URL，因为 URL 可能包含转义的正斜杠。

当遇到意外的 400 结果时，请设置以下系统属性：

*-Dorg.apache.tomcat.util.buf.UDecoder.ALLOW\_ENCODED\_SLASH=true*

最佳实践是在下面描述的 HTTP 请求中始终将 **Accept** 和 **Content-Type**（在发送/放置 JSON 时）头设置为 **application/json**。

### 方法和返回码

<table>
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
<td><p>更新现有资源的属性。也用于对现有资源调用操作。</p></td>
</tr>
<tr class="even">
<td><p>DELETE</p></td>
<td><p>删除现有资源。</p></td>
</tr>
</tbody>
</table>

<table>
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
<td><p>操作成功，并已返回响应（GET 和 PUT 请求）。</p></td>
</tr>
<tr class="even">
<td><p>201 - Created</p></td>
<td><p>操作成功，实体已创建并在响应体中返回（POST 请求）。</p></td>
</tr>
<tr class="odd">
<td><p>204 - No content</p></td>
<td><p>操作成功，实体已被删除，因此没有返回响应体（DELETE 请求）。</p></td>
</tr>
<tr class="even">
<td><p>401 - Unauthorized</p></td>
<td><p>操作失败。该操作需要设置身份验证头。如果请求中存在身份验证头，则提供的凭据无效或用户未被授权执行此操作。</p></td>
</tr>
<tr class="odd">
<td><p>403 - Forbidden</p></td>
<td><p>操作被禁止，不应重试。这表明是授权而非身份验证的问题，是不允许的操作。例如：删除正在运行的案例中的任务是不允许的，并且永远不会被允许，无论用户或案例/任务状态如何。</p></td>
</tr>
<tr class="even">
<td><p>404 - Not found</p></td>
<td><p>操作失败。请求的资源未找到。</p></td>
</tr>
<tr class="odd">
<td><p>405 - Method not allowed</p></td>
<td><p>操作失败。该方法不允许用于此资源。例如，尝试更新（PUT）部署资源将导致 405 状态。</p></td>
</tr>
<tr class="even">
<td><p>409 - Conflict</p></td>
<td><p>操作失败。该操作导致更新一个已被另一个操作更新的资源，这使得更新不再有效。也可能表示在一个已存在具有该标识符的资源的集合中创建资源。</p></td>
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

HTTP 响应的媒体类型始终为 application/json，除非请求二进制内容（例如，部署资源数据），此时使用内容的媒体类型。

### 错误响应体

当发生错误时（包括客户端和服务器端的 4XX 和 5XX 状态码），响应体包含一个描述所发生错误的对象。以下是一个任务未找到时返回 404 状态的示例：

    {
      "statusCode" : 404,
      "errorMessage" : "Could not find a task with id '444'."
    }

### 请求参数

#### URL 片段

作为 URL 一部分的参数（例如，在 http://host/flowable-rest/cmmn-api/cmmn-repository/deployments/{deploymentId} 中的 deploymentId 参数）在包含特殊字符时需要正确转义（参见 [URL 编码或百分号编码](https://en.wikipedia.org/wiki/Percent-encoding)）。大多数框架都内置了此功能，但需要注意这一点。特别是对于可能包含正斜杠的片段（例如，部署资源），这是必需的。

#### REST URL 查询参数

作为查询字符串添加到 URL 中的参数（例如，在 http://host/flowable-rest/cmmn-api/cmmn-repository/deployments?name=Deployment 中使用的 name 参数）可以具有以下类型，这些类型在相应的 REST-API 文档中有所提及：

<table>
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
<td><p>纯文本参数。可以包含 URL 中允许的任何有效字符。对于 XXXLike 参数，字符串应包含通配符字符 %（需正确进行 URL 编码）。这允许你指定模糊搜索的意图。例如，'Tas%' 匹配所有以 'Tas' 开头的值。</p></td>
</tr>
<tr class="even">
<td><p>Integer</p></td>
<td><p>表示整数值的参数。只能包含数字非小数值，范围在 -2.147.483.648 到 2.147.483.647 之间。</p></td>
</tr>
<tr class="odd">
<td><p>Long</p></td>
<td><p>表示长整型值的参数。只能包含数字非小数值，范围在 -9.223.372.036.854.775.808 到 9.223.372.036.854.775.807 之间。</p></td>
</tr>
<tr class="even">
<td><p>Boolean</p></td>
<td><p>表示布尔值的参数。只能是 true 或 false。除这些值以外的任何其他值都将导致 '405 - Bad request' 响应。</p></td>
</tr>
<tr class="odd">
<td><p>Date</p></td>
<td><p>表示日期值的参数。使用 ISO-8601 日期格式（参见 <a href="http://en.wikipedia.org/wiki/ISO_8601">维基百科上的 ISO-8601</a>），同时使用时间和日期组件（例如 2013-04-03T23:45Z）。</p></td>
</tr>
</tbody>
</table>

#### JSON 请求体参数

<table>
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
<td><p>纯文本参数。对于 XXXLike 参数，字符串应包含通配符字符 %。这允许你指定模糊搜索的意图。例如，'Tas%' 匹配所有以 'Tas' 开头的值。</p></td>
</tr>
<tr class="even">
<td><p>Integer</p></td>
<td><p>表示整数值的参数，使用 JSON 数字。只能包含数字非小数值，范围在 -2.147.483.648 到 2.147.483.647 之间。</p></td>
</tr>
<tr class="odd">
<td><p>Long</p></td>
<td><p>表示长整型值的参数，使用 JSON 数字。只能包含数字非小数值，范围在 -9.223.372.036.854.775.808 到 9.223.372.036.854.775.807 之间。</p></td>
</tr>
<tr class="even">
<td><p>Date</p></td>
<td><p>表示日期值的参数，使用 JSON 文本。使用 ISO-8601 日期格式（参见 <a href="http://en.wikipedia.org/wiki/ISO_8601">维基百科上的 ISO-8601</a>），同时使用时间和日期组件（例如，2013-04-03T23:45Z）。</p></td>
</tr>
</tbody>
</table>

#### 分页和排序

分页和排序参数可以作为查询字符串添加到 URL 中（例如，在 http://host/flowable-rest/cmmn-api/cmmn-repository/deployments?sort=name 中使用的 name 参数）。

<table>
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
<td><p>排序键的名称，其默认值和允许值因查询实现而异。</p></td>
</tr>
<tr class="even">
<td><p>order</p></td>
<td><p>asc</p></td>
<td><p>排序顺序，可以是 'asc'（升序）或 'desc'（降序）。</p></td>
</tr>
<tr class="odd">
<td><p>start</p></td>
<td><p>0</p></td>
<td><p>用于结果分页的参数。默认情况下，结果将从 0 开始。</p></td>
</tr>
<tr class="even">
<td><p>size</p></td>
<td><p>10</p></td>
<td><p>用于结果分页的参数。默认情况下，每页大小为 10。</p></td>
</tr>
</tbody>
</table>

> **注意**
>
> 请记住，start 参数用作查询的偏移量。例如，要获取每页包含三个项目的三页任务（共 9 个项目），我们可以使用：
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
<td><p>要包含在查询中的变量名称。在某些查询中使用 'equals' 来查询具有给定值的<strong>任何变量名</strong>的资源时可以为空。</p></td>
</tr>
<tr class="even">
<td><p>value</p></td>
<td><p>是</p></td>
<td><p>查询中包含的变量值，应该包含给定类型的正确格式。</p></td>
</tr>
<tr class="odd">
<td><p>operator</p></td>
<td><p>是</p></td>
<td><p>查询中使用的运算符，可以具有以下值：equals（等于）、notEquals（不等于）、equalsIgnoreCase（忽略大小写等于）、notEqualsIgnoreCase（忽略大小写不等于）、lessThan（小于）、greaterThan（大于）、lessThanOrEquals（小于等于）、greaterThanOrEquals（大于等于）和 like（模糊匹配）。</p></td>
</tr>
<tr class="even">
<td><p>type</p></td>
<td><p>否</p></td>
<td><p>要使用的变量类型。当省略时，类型将从 value 参数推断。任何 JSON 文本值将被视为 string 类型，JSON 布尔值将被视为 boolean 类型，JSON 数字将根据数字大小被视为 long 或 integer 类型。我们建议在有疑问时包含显式类型。下面列出了开箱即用支持的类型。</p></td>
</tr>
</tbody>
</table>

<table>
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

在处理变量（执行决策）时，REST API 对读写操作使用一些通用原则和 JSON 格式。变量的 JSON 表示如下所示：

    {
      "name" : "variableName",
      "value" : "variableValue",
      "valueUrl" : "http://...",
      "type" : "string"
    }

<table>
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
<td><p>变量的值。在写入变量时如果省略该值，将使用 null 作为值。</p></td>
</tr>
<tr class="odd">
<td><p>valueUrl</p></td>
<td><p>否</p></td>
<td><p>当读取二进制或可序列化类型的变量时，此属性将指向可以获取原始二进制数据的 URL。</p></td>
</tr>
<tr class="even">
<td><p>type</p></td>
<td><p>否</p></td>
<td><p>变量的类型。有关类型的其他信息，请参见下表。在写入变量时如果省略此值，类型将从原始 JSON 属性请求类型推断，并限制为 string、double、integer 和 boolean。我们建议始终包含类型，以确保不会对类型做出错误假设。</p></td>
</tr>
</tbody>
</table>

<table>
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
<td><p>值被视为 java.lang.Integer。写入时，使用 JSON 数字值作为转换基础，如果失败则回退到 JSON 文本。</p></td>
</tr>
<tr class="odd">
<td><p>short</p></td>
<td><p>值被视为 java.lang.Short。写入时，使用 JSON 数字值作为转换基础，如果失败则回退到 JSON 文本。</p></td>
</tr>
<tr class="even">
<td><p>long</p></td>
<td><p>值被视为 java.lang.Long。写入时，使用 JSON 数字值作为转换基础，如果失败则回退到 JSON 文本。</p></td>
</tr>
<tr class="odd">
<td><p>double</p></td>
<td><p>值被视为 java.lang.Double。写入时，使用 JSON 数字值作为转换基础，如果失败则回退到 JSON 文本。</p></td>
</tr>
<tr class="even">
<td><p>boolean</p></td>
<td><p>值被视为 java.lang.Boolean。写入时，使用 JSON 布尔值进行转换。</p></td>
</tr>
<tr class="odd">
<td><p>date</p></td>
<td><p>值被视为 java.util.Date。写入时，JSON 文本将使用 ISO-8601 日期格式进行转换。</p></td>
</tr>
</tbody>
</table>

可以通过自定义 JSON 表示（简单值或复杂/嵌套 JSON 对象）来支持其他变量类型。通过扩展 org.flowable.cmmn.rest.service.api.CmmnRestResponseFactory 上的 initializeVariableConverters() 方法，你可以添加额外的 org.flowable.rest.variable.RestVariableConverter 类，以支持将你的 POJO 转换为适合通过 REST 传输的格式，并将 REST 值转换回你的 POJO。实际的 JSON 转换由 Jackson 完成。

## 部署

**当使用 Tomcat 时，请阅读[在 Tomcat 中使用](#usage-in-tomcat)。**

### 部署列表

查询所有 CMMN 部署并返回匹配的结果。

    GET cmmn-repository/deployments
    
| 参数 | 是否必需 | 值类型 | 描述 |
| ------------- | ------------- | ------------- | ------------- |
| name | 否 | String | 仅返回具有给定名称的部署。 |
| nameLike | 否 | String | 仅返回名称类似于给定字符串的部署。 |
| category | 否 | String | 仅返回具有给定类别的部署。 |
| categoryLike | 否 | String | 仅返回类别类似于给定字符串的部署。 |
| categoryNotEquals | 否 | String | 仅返回类别与给定类别不匹配的部署。 |
| parentDeploymentId | 否 | String | 仅返回具有给定父部署 ID 的部署。 |
| parentDeploymentId | 否 | String | 仅返回父部署 ID 类似于给定字符串的部署。 |
| tenantId | 否 | String | 仅返回具有给定租户标识符的部署。 |
| tenantIdLike | 否 | String | 仅返回租户标识符类似于给定字符串的部署。 |
| withoutTenantId | 否 | String | 仅返回没有租户标识符的部署。 |
| sort | 否 | String | 用于排序的属性，需要与 order 一起使用。可能的值：id/name/deployTime/tenantId |

| 响应代码 | 描述 |
| ---- | ---- |
| 200 | 表示请求成功。 |

响应体示例：

```
{
    "data": [
        {
            "id": "59eca679-3c6b-11ea-8548-38c986587585",
            "name": "test-case",
            "deploymentTime": "2020-01-21T17:30:35.607+01:00",
            "category": null,
            "parentDeploymentId": null,
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585",
            "tenantId": ""
        }
    ],
    "total": 1,
    "start": 0,
    "sort": "id",
    "order": "asc",
    "size": 1
}
```

### 获取部署

    GET cmmn-repository/deployments/{deploymentId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|deploymentId|是|String|要获取的部署的 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到并返回部署。|
|404|表示未找到请求的部署。|

*成功响应体：*

```
{
    "id": "59eca679-3c6b-11ea-8548-38c986587585",
    "name": "test-case",
    "deploymentTime": "2020-01-21T17:30:35.607+01:00",
    "category": null,
    "parentDeploymentId": null,
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585",
    "tenantId": ""
}
```


### 创建新部署

    POST cmmn-repository/deployments

*请求体：*

请求体应包含 _multipart/form-data_ 类型的数据。请求中应该只包含一个文件，任何额外的文件都将被忽略。部署名称是传入的文件字段的名称。如果需要在单个部署中部署多个资源，请将资源压缩成 zip 文件，并确保文件名以 +.bar+ 或 +.zip+ 结尾。

可以在请求体中传入一个名为 +tenantId+ 的额外参数（表单字段）。该字段的值将用作执行此部署的租户的 ID。

|响应代码|描述|
| - | - |
|201|表示部署已创建。|
|400|表示请求体中没有内容，或内容的 mime 类型不支持部署。状态描述包含额外信息。|

*成功响应体：*

```
{
    "id": "59eca679-3c6b-11ea-8548-38c986587585",
    "name": "test-case",
    "deploymentTime": "2020-01-21T17:30:35.607+01:00",
    "category": null,
    "parentDeploymentId": null,
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585",
    "tenantId": ""
}
```

### 删除部署

    DELETE repository/deployments/{deploymentId}

|参数|是否必需|值类型|描述|
|- |- |- |- |
|deploymentId|是|String|要删除的部署的 ID。|

|响应代码|描述|
|- |- |
|204|表示已找到并删除部署。响应体有意为空。|
|404|表示未找到请求的部署。|

### 列出部署中的资源

    GET cmmn-repository/deployments/{deploymentId}/resources

|参数|是否必需|值类型|描述|
|- |- |- |- |
|deploymentId|是|String|要获取资源的部署的 ID。|

|响应代码|描述|
|- |- |
|200|表示已找到部署并已返回资源列表。|
|404|表示未找到请求的部署。|

*成功响应体：*

```
[
    {
        "id": "test-case.cmmn.xml",
        "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resources/test-case.cmmn.xml",
        "contentUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resourcedata/test-case.cmmn.xml",
        "mediaType": "text/xml",
        "type": "caseDefinition"
    },
    {
        "id": "test-case.testCase.png",
        "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resources/test-case.testCase.png",
        "contentUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resourcedata/test-case.testCase.png",
        "mediaType": "image/png",
        "type": "resource"
    }
]
```

结果 JSON 中的 contentUrl 属性包含用于获取二进制资源的实际 URL。


### 获取部署资源

    GET cmmn-repository/deployments/{deploymentId}/resources/{resourceId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|deploymentId|是|String|请求资源所属的部署的 ID。|
|resourceId|是|String|要获取的资源的 ID。*如果 resourceId 包含正斜杠，请确保进行 URL 编码。例如：使用 'diagrams%2Fmy-case.cmmn.xml' 而不是 'diagrams/Fmy-case.cmmn.xml'。*|

|响应代码|描述|
| - | - |
|200|表示已找到部署和资源，并已返回资源。|
|404|表示未找到请求的部署，或部署中不存在具有给定 ID 的资源。状态描述包含额外信息。|

*成功响应体：*

```
{
    "id": "test-case.cmmn.xml",
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resources/test-case.cmmn.xml",
    "contentUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resourcedata/test-case.cmmn.xml",
    "mediaType": "text/xml",
    "type": "caseDefinition"
}
```

### 获取部署资源内容

    GET cmmn-repository/deployments/{deploymentId}/resourcedata/{resourceId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|deploymentId|是|String|请求资源所属的部署的 ID。|
|resourceId|是|String|要获取数据的资源的 ID。*如果 resourceId 包含正斜杠，请确保进行 URL 编码。例如：使用 'diagrams%2Fmy-case.cmmn.xml' 而不是 'diagrams/Fmy-case.cmmn.xml'。*|

|响应代码|描述|
| - | - |
|200|表示已找到部署和资源，并已返回资源数据。|
|404|表示未找到请求的部署，或部署中不存在具有给定 ID 的资源。状态描述包含额外信息。|

*成功响应体：*

响应体将包含请求资源的二进制资源内容。响应的内容类型将与资源的 'mimeType' 属性中返回的类型相同。此外，还设置了 content-disposition 头，允许浏览器下载文件而不是直接显示。

## 案例定义


### 案例定义列表

    GET cmmn-repository/case-definitions

|参数|是否必需|值类型|描述|
| - | - | - | - |
|version|否|integer|仅返回具有给定版本的案例定义。|
|name|否|String|仅返回具有给定名称的案例定义。|
|nameLike|否|String|仅返回名称类似于给定名称的案例定义。|
|key|否|String|仅返回具有给定键的案例定义。|
|keyLike|否|String|仅返回键类似于给定键的案例定义。|
|resourceName|否|String|仅返回具有给定资源名称的案例定义。|
|resourceNameLike|否|String|仅返回资源名称类似于给定名称的案例定义。|
|category|否|String|仅返回具有给定类别的案例定义。|
|categoryLike|否|String|仅返回类别类似于给定名称的案例定义。|
|categoryNotEquals|否|String|仅返回不具有给定类别的案例定义。|
|deploymentId|否|String|仅返回属于具有给定 ID 的部署的案例定义。|
|startableByUser|否|String|仅返回可以由给定用户启动的案例定义。|
|latest|否|Boolean|仅返回最新的案例定义版本。只能与 'key' 和 'keyLike' 参数一起使用，使用其他参数将导致 400 响应。|
|suspended|否|Boolean|如果为 +true+，则仅返回已挂起的案例定义。如果为 +false+，则仅返回活动的（未挂起的）案例定义。|
|sort|否|'name'（默认）、'id'、'key'、'category'、'deploymentId' 和 'version'|用于排序的属性，需要与 'order' 一起使用。|

|响应代码|描述|
| - | - |
|200|表示请求成功，并已返回案例定义。|
|400|表示参数格式错误，或者 'latest' 与 'key' 和 'keyLike' 以外的参数一起使用。状态消息包含额外信息。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "59fd213c-3c6b-11ea-8548-38c986587585",
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
            "key": "testCase",
            "version": 1,
            "name": "Test Case",
            "description": null,
            "tenantId": "",
            "deploymentId": "59eca679-3c6b-11ea-8548-38c986587585",
            "deploymentUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585",
            "resource": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resources/test-case.cmmn.xml",
            "diagramResource": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resources/test-case.testCase.png",
            "category": "http://flowable.org/cmmn",
            "graphicalNotationDefined": true,
            "startFormDefined": false
        }
    ],
    "total": 1,
    "start": 0,
    "sort": "name",
    "order": "asc",
    "size": 1
}
```


* `graphicalNotationDefined`：表示案例定义包含图形信息（BPMN DI）。
* `resource`：包含实际部署的 CMMN 1.1 xml。
* `diagramResource`：包含案例定义的图形表示，如果没有可用的图表则为 null。


### 获取案例定义

    GET cmmn-repository/case-definitions/{caseDefinitionId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseDefinitionId|是|String|要获取的案例定义的 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到并返回案例定义。|
|404|表示未找到请求的案例定义。|

*成功响应体：*

```
{
    "id": "59fd213c-3c6b-11ea-8548-38c986587585",
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
    "key": "testCase",
    "version": 1,
    "name": "Test Case",
    "description": null,
    "tenantId": "",
    "deploymentId": "59eca679-3c6b-11ea-8548-38c986587585",
    "deploymentUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585",
    "resource": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resources/test-case.cmmn.xml",
    "diagramResource": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/deployments/59eca679-3c6b-11ea-8548-38c986587585/resources/test-case.testCase.png",
    "category": "http://flowable.org/cmmn",
    "graphicalNotationDefined": true,
    "startFormDefined": false
}
```

* `graphicalNotationDefined`：表示案例定义包含图形信息（BPMN DI）。
* `resource`：包含实际部署的 BPMN 2.0 xml。
* `diagramResource`：包含案例的图形表示，如果没有可用的图表则为 null。


### 更新案例定义的类别

    PUT cmmn-repository/case-definitions/{caseDefinitionId}

*请求体 JSON：*

```
{
  "category" : "updatedcategory"
}
```


|响应代码|描述|
| - | - |
|200|表示案例类别已被修改。|
|400|表示请求体中未定义类别。|
|404|表示未找到请求的案例定义。|

### 获取案例定义资源内容

    GET cmmn-repository/case-definitions/{caseDefinitionId}/resourcedata

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseDefinitionId|是|String|要获取资源数据的案例定义的 ID。|

*响应：*

与 +GET cmmn-repository/deployment/{deploymentId}/resourcedata/{resourceId}+ 完全相同的响应代码/响应体。


### 获取案例定义的 BPMN 模型

    GET cmmn-repository/case-definitions/{caseDefinitionId}/model

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseDefinitionId|是|String|要获取模型的案例定义的 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到案例定义并返回了模型。|
|404|表示未找到请求的案例定义。|

*响应体：*
响应体是 +org.flowable.cmmn.model.CmmnModel+ 的 JSON 表示，包含完整的案例定义模型。

### 获取案例定义的所有候选启动者

    GET repository/case-definitions/{caseDefinitionId}/identitylinks

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseDefinitionId|是|String|要获取身份链接的案例定义的 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到案例定义并返回了请求的身份链接。|
|404|表示未找到请求的案例定义。|

*成功响应体：*

```
[
    {
        "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585/identitylinks/groups/flowableUser",
        "user": null,
        "group": "flowableUser",
        "type": "candidate"
    }
]
```


### 为案例定义添加候选启动者

    POST cmmn-repository/case-definitions/{caseDefinitionId}/identitylinks

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseDefinitionId|是|String|案例定义的 ID。|

*请求体（用户）：*

```
{
  "user" : "kermit"
}
```

*请求体（用户组）：*

```
{
  "groupId" : "sales"
}
```

|响应代码|描述|
| - | - |
|201|表示已找到案例定义并已创建身份链接。|
|404|表示未找到请求的案例定义。|

*成功响应体：*

### 从案例定义中删除候选启动者

    DELETE cmmn-repository/case-definitions/{caseDefinitionId}/identitylinks/{family}/{identityId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseDefinitionId|是|String|案例定义的 ID。|
|family|是|String|根据身份链接的类型，可以是 +users+ 或 +groups+。|
|identityId|是|String|要移除作为候选启动者的用户 ID 或用户组 ID。|

|响应代码|描述|
|- | - |
|204|表示已找到案例定义并已移除身份链接。响应体有意为空。|
|404|表示未找到请求的案例定义，或案例定义没有与 URL 匹配的身份链接。|

### 获取案例定义的候选启动者

    GET cmmn-repository/case-definitions/{caseDefinitionId}/identitylinks/{family}/{identityId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseDefinitionId|是|String|案例定义的 ID。|
|family|是|String|根据身份链接的类型，可以是 +users+ 或 +groups+。|
|identityId|是|String|要获取作为候选启动者的用户 ID 或用户组 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到案例定义并返回了身份链接。|
|404|表示未找到请求的案例定义，或案例定义没有与 URL 匹配的身份链接。|


## 案例实例

### 获取案例实例

    GET cmmn-runtime/case-instances/{caseInstanceId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要获取的案例实例的 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到并返回案例实例。|
|404|表示未找到请求的案例实例。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "095fd94e-3c78-11ea-8548-38c986587585",
            "name": null,
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "businessKey": null,
            "startTime": "2020-01-21T19:01:23.923+01:00",
            "startUserId": "rest-admin",
            "state": "active",
            "ended": false,
            "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionName": "Test Case",
            "caseDefinitionDescription": null,
            "parentId": null,
            "callbackId": null,
            "callbackType": null,
            "referenceId": null,
            "referenceType": null,
            "variables": [],
            "tenantId": "",
            "completed": false
        }
    ],
    "total": 1,
    "start": 0,
    "sort": "id",
    "order": "asc",
    "size": 1
}
```

### 删除案例实例

    DELETE cmmn-runtime/case-instances/{caseInstanceId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要删除的案例实例的 ID。|

|响应代码|描述|
| - | - |
|204|表示已找到并删除案例实例。响应体有意为空。|
|404|表示未找到请求的案例实例。|

### 启动案例实例

    POST cmmn-runtime/case-instances

*请求体（通过案例定义 ID 启动）：*

```
{
      "caseDefinitionId":"59fd213c-3c6b-11ea-8548-38c986587585",
      "variables": [
         {
           "name":"myVar",
           "value":"This is a variable"
         }
      ]
   }
```

*请求体（通过案例定义键启动）：*

```
{
   "caseDefinitionKey":"testCase",
   "businessKey":"myBusinessKey",
   "tenantId": "tenant1",
   "variables": [
      {
        "name":"myVar",
        "value":"This is a variable"
      }
   ]
}
```

注意，JSON 中也接受 _transientVariables_ 属性，其结构与 _variables_ 属性相同。

可以使用 _returnVariables_ 属性在响应中获取案例实例上下文中的现有变量。默认情况下不返回变量。

请求体中只能使用 +caseDefinitionId+ 或 +caseDefinitionKey+ 其中之一。参数 +businessKey+、+variables+ 和 +tenantId+ 是可选的。如果省略 +tenantId+，将使用默认租户。


|响应代码|描述|
| - | - |
|201|表示已创建案例实例。|
|400|表示未找到案例定义（基于 ID 或键）或传入了无效变量。状态描述包含有关错误的其他信息。|

*成功响应体：*

```
{
    "id": "095fd94e-3c78-11ea-8548-38c986587585",
    "name": null,
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585",
    "businessKey": null,
    "startTime": "2020-01-21T19:01:23.923+01:00",
    "startUserId": "rest-admin",
    "state": "active",
    "ended": false,
    "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
    "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
    "caseDefinitionName": "Test Case",
    "caseDefinitionDescription": null,
    "parentId": null,
    "callbackId": null,
    "callbackType": null,
    "referenceId": null,
    "referenceType": null,
    "variables": [
        {
            "name": "myVar",
            "type": "string",
            "value": "This is a variable",
            "scope": "local"
        },
        {
            "name": "initiator",
            "type": "string",
            "value": "rest-admin",
            "scope": "local"
        }
    ],
    "tenantId": "",
    "completed": false
}
```

### 案例实例列表

    GET cmmn-runtime/case-instances

|参数|是否必需|值类型|描述|
| - | - | - | - |
|id|否|String|仅返回具有给定 ID 的案例实例。|
|caseDefinitionKey|否|String|仅返回具有给定案例定义键的案例实例。|
|caseDefinitionId|否|String|仅返回具有给定案例定义 ID 的案例实例。|
|businessKey|否|String|仅返回具有给定业务键的案例实例。|
|involvedUser|否|String|仅返回给定用户参与的案例实例。|
|includeCaseVariables|否|Boolean|指示是否在结果中包含案例变量。|
|tenantId|否|String|仅返回具有给定租户 ID 的案例实例。|
|tenantIdLike|否|String|仅返回租户 ID 类似于给定值的案例实例。|
|withoutTenantId|否|Boolean|如果为 +true+，则仅返回未设置租户 ID 的案例实例。如果为 +false+，则忽略 +withoutTenantId+ 参数。|
|sort|否|String|排序字段，应该是 +id+（默认）、+caseDefinitionId+、+tenantId+ 或 +caseDefinitionKey+ 之一。|

|响应代码|描述|
| - | - |
|200|表示请求成功，并已返回案例实例。|
|400|表示参数格式错误。状态消息包含额外信息。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "095fd94e-3c78-11ea-8548-38c986587585",
            "name": null,
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "businessKey": null,
            "startTime": "2020-01-21T19:01:23.923+01:00",
            "startUserId": "rest-admin",
            "state": "active",
            "ended": false,
            "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionName": "Test Case",
            "caseDefinitionDescription": null,
            "parentId": null,
            "callbackId": null,
            "callbackType": null,
            "referenceId": null,
            "referenceType": null,
            "variables": [],
            "tenantId": "",
            "completed": false
        }
    ],
    "total": 1,
    "start": 0,
    "sort": "id",
    "order": "asc",
    "size": 1
}
```

### 查询案例实例

GET 方法的替代方案，它接受带有查询参数的请求体

    POST query/case-instances


*请求体：*


```
{
  "caseDefinitionKey":"myCase",
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
```

|响应代码|描述|
| - | - |
|200|表示请求成功，并已返回案例实例。|
|400|表示参数格式错误。状态消息包含额外信息。|


### 获取案例实例的图表

    GET cmmn-runtime/case-instances/{caseInstanceId}/diagram

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要获取图表的案例实例的 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到案例实例并返回了图表。|
|400|表示未找到请求的案例实例，但案例不包含任何图形信息（CMMN:DI），无法创建图表。|
|404|表示未找到请求的案例实例。|

### 获取案例实例的相关人员

    GET cmmn-runtime/case-instances/{caseInstanceId}/identitylinks

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要获取链接的案例实例的 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到案例实例并返回了链接。|
|404|表示未找到请求的案例实例。|


*成功响应体：*

```
[
    {
        "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585/identitylinks/users/rest-admin/starter",
        "user": "rest-admin",
        "group": null,
        "type": "starter"
    },
    {
        "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585/identitylinks/users/rest-admin/participant",
        "user": "rest-admin",
        "group": null,
        "type": "participant"
    }
]
```


### 为案例实例添加相关用户

    POST cmmn-runtime/case-instances/{caseInstanceId}/identitylinks

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要添加链接的案例实例的 ID。|

*请求体：*

```
{
  "userId":"kermit",
  "type":"participant"
}
```


+userId+ 和 +type+ 都是必需的。

|响应代码|描述|
| - | - |
|201|表示已找到案例实例并已创建链接。|
|400|表示请求体中未包含 userId 或 type。|
|404|表示未找到请求的案例实例。|

### 从案例实例中移除相关用户

    DELETE cmmn-runtime/case-instances/{caseInstanceId}/identitylinks/users/{userId}/{type}


|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|案例实例的 ID。|
|userId|是|String|要删除链接的用户的 ID。|
|type|是|String|要删除的链接类型。|

|响应代码|描述|
| - | - |
|204|表示已找到案例实例并已删除链接。响应体有意为空。|
|404|表示未找到请求的案例实例，或要删除的链接不存在。响应状态包含有关错误的其他信息。|

### 案例实例的变量列表

    GET cmmn-runtime/case-instances/{caseInstanceId}/variables

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要获取变量的案例实例的 ID。|

|响应代码|描述|
| - | - |
|200|表示已找到案例实例并返回了变量。|
|404|表示未找到请求的案例实例。|


*成功响应体：*

```
| - | - | - | - | 
```


如果变量是二进制变量或可序列化变量，+valueUrl+ 指向用于获取原始值的 URL。如果是普通变量，则值直接包含在响应中。


### 获取案例实例的变量

    GET cmmn-runtime/case-instances/{caseInstanceId}/variables/{variableName}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要获取变量的案例实例的 ID。|
|variableName|是|String|要获取的变量的名称。|

|响应代码|描述|
| - | - |
|200|表示已找到案例实例和变量，并已返回变量。|
|400|表示请求体不完整或包含非法值。状态描述包含有关错误的其他信息。|
|404|表示未找到请求的案例实例，或案例实例没有具有给定名称的变量。状态描述包含有关错误的其他信息。|

*成功响应体：*

```
{
    "name": "myVar",
    "type": "string",
    "value": "This is a variable",
    "scope": null
}
```


如果变量是二进制变量或可序列化变量，+valueUrl+ 指向用于获取原始值的 URL。如果是普通变量，则值直接包含在响应中。注意，由于案例实例变量没有 +global+ 作用域，因此只返回 +local+ 作用域的变量。


### 在案例实例上创建（或更新）变量

    POST cmmn-runtime/case-instances/{caseInstanceId}/variables

    PUT cmmn-runtime/case-instances/{caseInstanceId}/variables


使用 +POST+ 时，将创建所有传入的变量。如果案例实例上已存在其中一个变量，请求将导致错误（409 - CONFLICT）。使用 +PUT+ 时，将在案例实例上创建不存在的变量，并覆盖现有变量，不会产生任何错误。

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要设置变量的案例实例的 ID。|


*请求体：*

```
[
   {
      "name":"intProcVar",
      "type":"integer",
      "value":123
   },

   ...
]
```


可以在请求体数组中传入任意数量的变量。

|响应代码|描述|
| - | - |
|201|表示已找到案例实例并已创建变量。|
|400|表示请求体不完整或包含非法值。状态描述包含有关错误的其他信息。|
|404|表示未找到请求的案例实例。|
|409|表示已找到案例实例，但已包含具有给定名称的变量（仅在使用 POST 方法时抛出）。请改用更新方法。|

### 更新案例实例上的单个变量

    PUT cmmn-runtime/case-instances/{caseInstanceId}/variables/{variableName}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要设置变量的案例实例的 ID。|
|variableName|是|String|要获取的变量的名称。|

```
 {
    "name":"intProcVar"
    "type":"integer"
    "value":123
 }
```


|响应代码|描述|
| - | - |
|200|表示已找到案例实例和变量，并已更新变量。|
|404|表示未找到请求的案例实例，或案例实例没有具有给定名称的变量。状态描述包含有关错误的其他信息。|

如果变量是二进制变量或可序列化变量，+valueUrl+ 指向用于获取原始值的 URL。如果是普通变量，则值直接包含在响应中。

### 在案例实例上创建新的二进制变量

    POST runtime/case-instances/{caseInstanceId}/variables

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要创建新变量的案例实例的 ID。|

*请求体：*

请求应为 +multipart/form-data+ 类型。应包含一个带有变量二进制值的单个文件部分。此外，还可以包含以下附加表单字段：

* `name`：必需的变量名称。
* `type`：要创建的变量类型。如果省略，则假定为 +binary+，请求中的二进制数据将存储为字节数组。

*成功响应体：*

```
{
    "name": "test",
    "type": "binary",
    "value": null,
    "valueUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585/variables/test/data",
    "scope": "local"
}
```

|响应代码|描述|
| - | - |
|201|表示已创建变量并返回结果。|
|400|表示缺少要创建的变量的名称。状态消息提供额外信息。|
|404|表示未找到请求的案例实例。|
|409|表示案例实例已包含具有给定名称的变量。请改用 PUT 方法更新任务变量。|
|415|表示可序列化数据包含一个对象，该对象在运行 Flowable 引擎的 JVM 中没有对应的类，因此无法反序列化。|

### 更新案例实例上的现有二进制变量

    PUT runtime/case-instances/{caseInstanceId}/variables

|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|是|String|要创建新变量的案例实例的 ID。|

*请求体：*
请求应为 +multipart/form-data+ 类型。应包含一个带有变量二进制值的单个文件部分。此外，还可以包含以下附加表单字段：

* `name`：必需的变量名称。
* `type`：要创建的变量类型。如果省略，则假定为 +binary+，请求中的二进制数据将存储为字节数组。

|响应代码|描述|
| - | - |
|200|表示已更新变量并返回结果。|
|400|表示缺少要更新的变量的名称。状态消息提供额外信息。|
|404|表示未找到请求的案例实例，或案例实例没有具有给定名称的变量。|
|415|表示可序列化数据包含一个对象，该对象在运行 Flowable 引擎的 JVM 中没有对应的类，因此无法反序列化。|

### 获取阶段概览

    GET /cmmn-runtime/{caseInstanceId}/stage-overview
    
|参数|是否必需|值类型|描述|
| - | - | - | - |
|caseInstanceId|否|String|要获取阶段概览的案例实例 ID。|

*成功响应体：* 

```
[
    {
        "id": "stage1",
        "name": "First Stage",
        "current": true
        "ended": false,
        "endTime": null,
    },
    {
        "id": "stage2",
        "name": "Second stage",
        "current": false
        "ended": false,
        "endTime": null,
    }
]
```

## 计划项实例

### 计划项实例列表

    GET cmmn-runtime/plan-item-instances

|参数|是否必需|值类型|描述|
| - | - | - | - |
|id|否|String|仅返回具有给定 ID 的计划项实例。|
|caseDefinitionId|否|String|仅返回具有给定案例定义 ID 的计划项实例。|
|caseInstanceId|否|String|仅返回具有给定案例实例 ID 的计划项实例。|
|stageInstanceId|否|String|仅返回具有给定阶段实例 ID 的计划项实例（阶段实例本身就是一个计划项实例）。|
|planItemDefinitionId|否|String|仅返回具有给定计划项定义 ID 的计划项实例。|
|planItemDefinitionType|否|String|仅返回具有给定计划项定义类型的计划项实例（例如：阶段、里程碑等）。|
|planItemDefinitionTypes|否|String|仅返回具有任意给定类型的计划项实例。类型以逗号分隔的列表形式传递。|
|state|否|String|仅返回处于给定状态的计划项实例。|
|name|否|String|仅返回具有给定名称的计划项实例。|
|elementId|否|String|仅返回具有给定元素 ID 的计划项实例（如 CMMN 模型中所定义）。|
|referenceId|否|String|仅返回具有给定引用 ID 的计划项实例（例如：当计划项是流程任务时）。|
|referenceType|否|Date|仅返回具有给定引用类型的计划项实例。|
|createdBefore|否|Date|仅返回在给定日期之前启动的计划项实例。|
|createdAfter|否|String|仅返回在给定日期之后启动的计划项实例。|
|starUserId|否|String|仅返回由给定用户启动的计划项实例。|
|tenantId|否|String|仅返回具有给定租户 ID 的计划项实例。|
|withoutTenantId|否|String|仅返回没有租户 ID 的计划项实例。|
|sort|否|'name' 和 'createTime'|用于排序的属性，与 'order' 一起使用。|

|响应代码|描述|
| - | - |
|200|表示请求成功，并已返回计划项实例。|
|400|表示参数格式错误。状态消息包含额外信息。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "09618702-3c78-11ea-8548-38c986587585",
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/plan-item-instances/09618702-3c78-11ea-8548-38c986587585",
            "name": null,
            "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
            "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
            "derivedCaseDefinitionId": null,
            "derivedCaseDefinitionUrl": null,
            "stageInstanceId": null,
            "stageInstanceUrl": null,
            "planItemDefinitionId": "expandedStage1",
            "planItemDefinitionType": "stage",
            "state": "active",
            "stage": true,
            "elementId": "planItem2",
            "createTime": "2020-01-21T19:01:23.934+01:00",
            "lastAvailableTime": "2020-01-21T19:01:23.942+01:00",
            "lastEnabledTime": null,
            "lastDisabledTime": null,
            "lastStartedTime": "2020-01-21T19:01:23.974+01:00",
            "lastSuspendedTime": null,
            "completedTime": null,
            "occurredTime": null,
            "terminatedTime": null,
            "exitTime": null,
            "endedTime": null,
            "startUserId": null,
            "referenceId": null,
            "referenceType": null,
            "completable": false,
            "entryCriterionId": null,
            "exitCriterionId": null,
            "formKey": null,
            "extraValue": null,
            "tenantId": ""
        },
        ...
    ],
    "total": 3,
    "start": 0,
    "sort": "createTime",
    "order": "asc",
    "size": 3
}
```

### 获取单个计划项实例

    GET cmmn-runtime/plan-item-instances/{planItemInstanceId}
    
|参数|是否必需|值类型|描述|
| - | - | - | - |
|planItemInstanceId|是|String|计划项实例的 ID。|

|响应代码|描述|
| - | - |
|200|表示请求成功，并已返回计划项实例。|
|404|表示未找到计划项实例。|

*成功响应体：*

```
{
    "id": "09618702-3c78-11ea-8548-38c986587585",
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/plan-item-instances/09618702-3c78-11ea-8548-38c986587585",
    "name": null,
    "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
    "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585",
    "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
    "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
    "derivedCaseDefinitionId": null,
    "derivedCaseDefinitionUrl": null,
    "stageInstanceId": null,
    "stageInstanceUrl": null,
    "planItemDefinitionId": "expandedStage1",
    "planItemDefinitionType": "stage",
    "state": "active",
    "stage": true,
    "elementId": "planItem2",
    "createTime": "2020-01-21T19:01:23.934+01:00",
    "lastAvailableTime": "2020-01-21T19:01:23.942+01:00",
    "lastEnabledTime": null,
    "lastDisabledTime": null,
    "lastStartedTime": "2020-01-21T19:01:23.974+01:00",
    "lastSuspendedTime": null,
    "completedTime": null,
    "occurredTime": null,
    "terminatedTime": null,
    "exitTime": null,
    "endedTime": null,
    "startUserId": null,
    "referenceId": null,
    "referenceType": null,
    "completable": false,
    "entryCriterionId": null,
    "exitCriterionId": null,
    "formKey": null,
    "extraValue": null,
    "tenantId": ""
}
```

### 对计划项实例执行操作

    PUT cmmn-runtime/plan-item-instances/{planItemInstanceId}
    
使用如下 JSON 请求体：

```
{
    "action": "start"
}
```    


可用的操作：

|操作|描述|
| - | - |
|start|启动计划项（需要处于已启用状态）。|
|trigger|触发计划项（正在等待触发）。|
|enable|启用计划项（当前处于禁用状态）。|
|disable|触发计划项（当前处于启用状态）。|
|evaluateCriteria|评估计划项实例的哨兵（以及执行该操作可能产生的任何后果）。|


## 任务

### 任务列表

    GET cmmn-runtime/tasks

|参数|是否必需|值类型|描述|
| - | - | - | - |
|name|否|String|仅返回具有给定名称的任务。|
|nameLike|否|String|仅返回名称类似于给定名称的任务。|
|description|否|String|仅返回具有给定描述的任务。|
|priority|否|Integer|仅返回具有给定优先级的任务。|
|minimumPriority|否|Integer|仅返回优先级大于给定值的任务。|
|maximumPriority|否|Integer|仅返回优先级小于给定值的任务。|
|assignee|否|String|仅返回分配给给定用户的任务。|
|assigneeLike|否|String|仅返回受理人类似于给定值的任务。|
|owner|否|String|仅返回由给定用户拥有的任务。|
|ownerLike|否|String|仅返回所有者类似于给定值的任务。|
|unassigned|否|Boolean|仅返回未分配给任何人的任务。如果传入 +false+，则忽略该值。|
|delegationState|否|String|仅返回具有给定委派状态的任务。可能的值为 +pending+ 和 +resolved+。|
|candidateUser|否|String|仅返回可由给定用户认领的任务。这包括用户是其明确候选人的任务，以及用户所属组可以认领的任务。|
|candidateGroup|否|String|仅返回可由给定组中的用户认领的任务。|
|candidateGroups|否|String|仅返回可由给定组中的用户认领的任务。值以逗号分隔。|
|involvedUser|否|String|仅返回给定用户参与的任务。|
|taskDefinitionKey|否|String|仅返回具有给定任务定义 ID 的任务。|
|taskDefinitionKeyLike|否|String|仅返回任务定义 ID 类似于给定值的任务。|
|caseInstanceId|否|String|仅返回属于给定 ID 的案例实例的任务。|
|caseDefinitionId|否|String|仅返回属于给定 ID 的案例定义的任务。|
|createdOn|否|ISO Date|仅返回在给定日期创建的任务。|
|createdBefore|否|ISO Date|仅返回在给定日期之前创建的任务。|
|createdAfter|否|ISO Date|仅返回在给定日期之后创建的任务。|
|dueOn|否|ISO Date|仅返回在给定日期到期的任务。|
|dueBefore|否|ISO Date|仅返回在给定日期之前到期的任务。|
|dueAfter|否|ISO Date|仅返回在给定日期之后到期的任务。|
|withoutDueDate|否|boolean|仅返回没有到期日期的任务。如果值为 +false+，则忽略该属性。|
|excludeSubTasks|否|Boolean|仅返回不是其他任务的子任务的任务。|
|active|否|Boolean|如果为 +true+，则仅返回未挂起的任务（属于未挂起的流程或根本不属于流程）。如果为 false，则仅返回属于已挂起流程实例的任务。|
|includeTaskLocalVariables|否|Boolean|指示是否在结果中包含任务本地变量。|
|tenantId|否|String|仅返回具有给定租户 ID 的任务。|
|tenantIdLike|否|String|仅返回租户 ID 类似于给定值的任务。|
|withoutTenantId|否|Boolean|如果为 +true+，则仅返回未设置租户 ID 的任务。如果为 +false+，则忽略 +withoutTenantId+ 参数。|
|candidateOrAssigned|否|String|选择已被用户认领或分配，或等待用户（候选用户或组）认领的任务。|
|category|否|string|选择具有给定类别的任务。注意，这是任务类别，而不是案例定义的类别。|


|响应代码|描述|
| - | - |
|200|表示请求成功，并已返回任务。|
|400|表示参数格式错误。状态消息包含额外信息。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "09688be5-3c78-11ea-8548-38c986587585",
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/tasks/09688be5-3c78-11ea-8548-38c986587585",
            "owner": null,
            "assignee": "rest-admin",
            "delegationState": null,
            "name": "Human task",
            "description": null,
            "createTime": "2020-01-21T19:01:23.975+01:00",
            "dueDate": null,
            "priority": 50,
            "suspended": false,
            "claimTime": null,
            "taskDefinitionKey": "humanTask1",
            "tenantId": "",
            "category": null,
            "formKey": null,
            "parentTaskId": null,
            "parentTaskUrl": null,
            "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
            "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
            "variables": []
        }
    ],
    "total": 1,
    "start": 0,
    "sort": "id",
    "order": "asc",
    "size": 1
}
```

### 获取任务

    GET cmmn-runtime/tasks/{taskId}

|参数|是否必需|值类型|描述|
| - | - | - | - |
|taskId|是|String|要获取的任务的 ID。|

|响应代码|描述|
|- | - |
|200|表示已找到并返回任务。|
|404|表示未找到请求的任务。|

*成功响应体：*

```
{
    "id": "09688be5-3c78-11ea-8548-38c986587585",
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/tasks/09688be5-3c78-11ea-8548-38c986587585",
    "owner": null,
    "assignee": "rest-admin",
    "delegationState": null,
    "name": "Human task",
    "description": null,
    "createTime": "2020-01-21T19:01:23.975+01:00",
    "dueDate": null,
    "priority": 50,
    "suspended": false,
    "claimTime": null,
    "taskDefinitionKey": "humanTask1",
    "tenantId": "",
    "category": null,
    "formKey": null,
    "parentTaskId": null,
    "parentTaskUrl": null,
    "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
    "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/case-instances/095fd94e-3c78-11ea-8548-38c986587585",
    "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
    "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
    "variables": []
}
```

### 更新任务

    PUT cmmn-runtime/tasks/{taskId}

*请求体 JSON：*

```
{
  "assignee" : "assignee",
  "delegationState" : "resolved",
  "description" : "New task description",
  "dueDate" : "2020-04-17T13:06:02.438+02:00",
  "name" : "New task name",
  "owner" : "owner",
  "parentTaskId" : "3",
  "priority" : 20
}
```

所有请求值都是可选的。例如，你可以在请求体 JSON 对象中只包含 'assignee' 属性，仅更新任务的受理人，而不影响其他字段。当显式包含某个属性并将其设置为 null 时，任务值将被更新为 null。例如：+{"dueDate" : null}+ 将清除任务的到期日期。

可以更新以下参数：

|参数|类型|
|-|-|
|name|String|
|description|String|
|dueDate|Date|
|assignee|String|
|owner|String|
|parentTaskId|String|
|priority|integer|
|category|String|
|formKey|String|
|delegationState|String|
|tenantId|String|


|响应代码|描述|
|-|-|
|200|表示任务已更新。|
|404|表示未找到请求的任务。|
|409|表示请求的任务被同时更新。|

### 任务操作

    POST cmmn-runtime/tasks/{taskId}

*完成任务 - 请求体 JSON：*

```
{
  "action" : "complete",
  "variables" : []
}
```

|参数|类型|描述|
|-|-|-|
|action|String|可以是 complete、claim、delegate 或 resolve。|
|assignee|String|任务的受理人|
|outcome|String|用于在完成任务时指定任务的结果。|
|variables|String|要设置的变量。|
|transientVariables|String|要设置的瞬时变量|

*认领任务 - 请求体 JSON：*

```
{
  "action" : "claim",
  "assignee" : "userWhoClaims"
}
```

由给定的受理人认领任务。如果受理人为 +null+，则任务不分配给任何人，可以再次被认领。


|响应代码|描述|
|-|-|
|200|表示操作已执行。|
|400|当请求体包含无效值，或在需要受理人时未提供受理人。|
|404|表示未找到请求的任务。|
|409|表示由于冲突无法执行操作。要么任务被同时更新，要么在 '`claim`' 操作的情况下任务已被其他用户认领。|

### 删除任务

    DELETE cmmn-runtime/tasks/{taskId}?cascadeHistory={cascadeHistory}&deleteReason={deleteReason}


|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要删除的任务的 ID。|
|cascadeHistory|否|Boolean|删除任务时是否同时删除历史任务实例（如果适用）。如果未提供，此值默认为 false。|
|deleteReason|否|String|删除任务的原因。当 +cascadeHistory+ 为 true 时忽略此值。|

|响应代码|描述|
|-|-|
|204|表示已找到任务并已删除。响应体有意为空。|
|403|表示无法删除请求的任务，因为它是案例实例的一部分。|
|404|表示未找到请求的任务。|

### 获取任务的所有变量

    GET cmmn-runtime/tasks/{taskId}/variables?scope={scope}


|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要获取变量的任务的 ID。|
|scope|否|String|要返回的变量范围。当为 '`local`' 时，仅返回任务本地变量。当为 '`global`' 时，仅返回来自任务父执行层次的变量。当省略该参数时，返回本地和全局变量。|

|响应代码|描述|
|-|-|
|200|表示已找到任务并返回请求的变量。|
|404|表示未找到请求的任务。|

*成功响应体：*

```
[
    {
        "name": "myVar",
        "type": "string",
        "value": "This is a variable",
        "scope": "global"
    },
    {
        "name": "test",
        "type": "binary",
        "value": null,
        "valueUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/tasks/09688be5-3c78-11ea-8548-38c986587585/variables/test/data",
        "scope": "global"
    },
    {
        "name": "initiator",
        "type": "string",
        "value": "rest-admin",
        "scope": "global"
    }
]
```

### 获取任务的变量

    GET cmmn-runtime/tasks/{taskId}/variables/{variableName}?scope={scope}


|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要获取变量的任务的 ID。|
|variableName|是|String|要获取的变量的名称。|
|scope|否|String|要返回的变量范围。当为 '`local`' 时，仅返回任务本地变量值。当为 '`global`' 时，仅返回来自任务父执行层次的变量值。当省略该参数时，如果存在则返回本地变量，否则返回全局变量。|

|响应代码|描述|
|-|-|
|200|表示已找到任务并返回请求的变量。|
|404|表示未找到请求的任务，或任务在给定范围内没有具有给定名称的变量。状态消息提供额外信息。|


*成功响应体：*

```
{
    "name": "myVar",
    "type": "string",
    "value": "This is a variable",
    "scope": "global"
}
```


### 获取变量的二进制数据

    GET cmmn-runtime/tasks/{taskId}/variables/{variableName}/data?scope={scope}


|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要获取变量数据的任务的 ID。|
|variableName|是|String|要获取数据的变量的名称。只能使用类型为 +binary+ 和 +serializable+ 的变量。如果使用任何其他类型的变量，将返回 +404+。|
|scope|否|String|要返回的变量范围。当为 '`local`' 时，仅返回任务本地变量值。当为 '`global`' 时，仅返回来自任务父执行层次的变量值。当省略该参数时，如果存在则返回本地变量，否则返回全局变量。|

|响应代码|描述|
|-|-|
|200|表示已找到任务并返回请求的变量。|
|404|表示未找到请求的任务，或任务在给定范围内没有具有给定名称的变量，或变量没有可用的二进制流。状态消息提供额外信息。|

*成功响应体：*

响应体包含变量的二进制值。当变量类型为 +binary+ 时，响应的 content-type 设置为 +application/octet-stream+，无论变量的内容或请求的 accept-type 头如何。对于 +serializable+ 类型，使用 +application/x-java-serialized-object+ 作为 content-type。


### 在任务上创建新变量

    POST cmmn-runtime/tasks/{taskId}/variables

|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要创建新变量的任务的 ID。|


*创建简单（非二进制）变量的请求体：*

```
[
  {
    "name" : "myTaskVariable",
    "scope" : "local",
    "type" : "string",
    "value" : "Hello World"
  },
  {
    ...
  }
]
```


请求体应该是一个数组，包含一个或多个表示要创建的变量的 JSON 对象。

* `name`：必需的变量名称
* `scope`：创建的变量的范围。如果省略，则假定为 +local+。
* `type`：创建的变量的类型。如果省略，则恢复为原始 JSON 值类型（字符串、布尔值、整数或双精度数）。
* `value`：变量值。

|响应代码|描述|
|-|-|
|201|表示已创建变量并返回结果。|
|400|表示缺少要创建的变量的名称，或尝试在独立任务（没有关联的流程）上创建范围为 +global+ 的变量，或请求中包含了空的变量数组，或请求未包含变量数组。状态消息提供额外信息。|
|404|表示未找到请求的任务。|
|409|表示任务已具有给定名称的变量。请改用 PUT 方法更新任务变量。|

### 在任务上创建新的二进制变量

    POST cmmn-runtime/tasks/{taskId}/variables


|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要创建新变量的任务的 ID。|


*请求体：*

请求应为 +multipart/form-data+ 类型。应包含一个带有变量二进制值的单个文件部分。此外，还可以包含以下附加表单字段：

* `name`：必需的变量名称。
* `scope`：创建的变量的范围。如果省略，则假定为 +local+。
* `type`：创建的变量的类型。如果省略，则假定为 +binary+，请求中的二进制数据将存储为字节数组。

|响应代码|描述|
|-|-|
|201|表示已创建变量并返回结果。|
|400|表示缺少要创建的变量的名称，或尝试在独立任务（没有关联的流程）上创建范围为 +global+ 的变量。状态消息提供额外信息。|
|404|表示未找到请求的任务。|
|409|表示任务已具有给定名称的变量。请改用 PUT 方法更新任务变量。|
|415|表示可序列化数据包含一个对象，该对象在运行 Flowable 引擎的 JVM 中没有对应的类，因此无法反序列化。|

### 更新任务上的现有变量

    PUT cmmn-runtime/tasks/{taskId}/variables/{variableName}

|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要更新变量的任务的 ID。|
|variableName|是|String|要更新的变量的名称。|

*更新简单（非二进制）变量的请求体：*

```
{
  "name" : "myTaskVariable",
  "scope" : "local",
  "type" : "string",
  "value" : "Hello World"
}
```

* `name`：必需的变量名称
* `scope`：更新的变量的范围。如果省略，则假定为 +local+。
* `type`：更新的变量的类型。如果省略，则恢复为原始 JSON 值类型（字符串、布尔值、整数或双精度数）。
* `value`：变量值。

|响应代码|描述|
|-|-|
|200|表示变量已更新并返回结果。|
|400|表示缺少要更新的变量的名称，或尝试在独立任务（没有关联的流程）上更新范围为 +global+ 的变量。状态消息提供额外信息。|
|404|表示未找到请求的任务，或任务在给定范围内没有具有给定名称的变量。状态消息包含有关错误的额外信息。|

### 更新任务上的二进制变量

    PUT cmmn-runtime/tasks/{taskId}/variables/{variableName}

|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要更新变量的任务的 ID。|
|variableName|是|String|要更新的变量的名称。|

*请求体：*

请求应为 +multipart/form-data+ 类型。应包含一个带有变量二进制值的单个文件部分。此外，还可以包含以下附加表单字段：

* `name`：必需的变量名称。
* `scope`：更新的变量的范围。如果省略，则假定为 +local+。
* `type`：更新的变量的类型。如果省略，则假定为 +binary+，请求中的二进制数据将存储为字节数组。

|响应代码|描述|
|-|-|
|200|表示变量已更新并返回结果。|
|400|表示缺少要更新的变量的名称，或尝试在独立任务（没有关联的流程）上更新范围为 +global+ 的变量。状态消息提供额外信息。|
|404|表示未找到请求的任务，或给定任务在给定范围内不存在要更新的变量。|
|415|表示可序列化数据包含一个对象，该对象在运行 Flowable 引擎的 JVM 中没有对应的类，因此无法反序列化。|

### 删除任务上的变量

    DELETE cmmn-runtime/tasks/{taskId}/variables/{variableName}?scope={scope}

|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要删除变量的任务的 ID。|
|variableName|是|String|要删除的变量的名称。|
|scope|否|String|要删除的变量的范围。可以是 +local+ 或 +global+。如果省略，则假定为 +local+。|


|响应代码|描述|
|-|-|
|204|表示已找到任务变量并已删除。响应体有意为空。|
|404|表示未找到请求的任务，或任务没有具有给定名称的变量。状态消息包含有关错误的额外信息。|

### 删除任务上的所有本地变量

    DELETE cmmn-runtime/tasks/{taskId}/variables

|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要删除变量的任务的 ID。|


|响应代码|描述|
|-|-|
|204|表示所有本地任务变量已删除。响应体有意为空。|
|404|表示未找到请求的任务。|

### 获取任务的所有身份链接

    GET cmmn-runtime/tasks/{taskId}/identitylinks


|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|要获取身份链接的任务的 ID。|

|响应代码|描述|
|-|-|
|200|表示已找到任务并返回请求的身份链接。|
|404|表示未找到请求的任务。|

*成功响应体：*

```
[
    {
        "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-runtime/tasks/09688be5-3c78-11ea-8548-38c986587585/identitylinks/users/rest-admin/assignee",
        "user": "rest-admin",
        "group": null,
        "type": "assignee"
    }
]
```


### 获取任务的用户组或用户身份链接

    GET cmmn-runtime/tasks/{taskId}/identitylinks/users
    GET cmmn-runtime/tasks/{taskId}/identitylinks/groups


仅返回针对用户或组的身份链接。响应体和状态码与获取任务的完整身份链接列表时完全相同。


### 获取任务的单个身份链接

    GET cmmn-runtime/tasks/{taskId}/identitylinks/{family}/{identityId}/{type}


|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|任务的 ID。|
|family|是|String|可以是 +groups+ 或 +users+，取决于目标身份类型。|
|identityId|是|String|身份的 ID。|
|type|是|String|身份链接的类型。|

|响应代码|描述|
|-|-|
|200|表示已找到任务和身份链接并已返回。|
|404|表示未找到请求的任务，或任务没有请求的身份链接。状态消息包含有关此错误的额外信息。|

### 在任务上创建身份链接

    POST cmmn-runtime/tasks/{taskId}/identitylinks

|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|任务的 ID。|

*请求体（用户）：*

```
{
  "userId" : "kermit",
  "type" : "candidate",
}
```

*请求体（组）：*

```
{
  "groupId" : "sales",
  "type" : "candidate",
}
```

|响应代码|描述|
|-|-|
|201|表示已找到任务并已创建身份链接。|
|404|表示未找到请求的任务，或任务没有请求的身份链接。状态消息包含有关此错误的额外信息。|

*成功响应体：*

```
{
  "userId" : null,
  "groupId" : "sales",
  "type" : "candidate",
  "url" : "http://localhost:8081/flowable-rest/service/runtime/tasks/100/identitylinks/groups/sales/candidate"
}
```

### 删除任务上的身份链接

    DELETE cmmn-runtime/tasks/{taskId}/identitylinks/{family}/{identityId}/{type}

|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|是|String|任务的 ID。|
|family|是|String|可以是 +groups+ 或 +users+，取决于目标身份类型。|
|identityId|是|String|身份的 ID。|
|type|是|String|身份链接的类型。|

|响应代码|描述|
|-|-|
|204|表示已找到任务和身份链接并已删除该链接。响应体有意为空。|
|404|表示未找到请求的任务，或任务没有请求的身份链接。状态消息包含有关此错误的额外信息。|

## 历史记录

### 历史案例实例列表

    GET cmmn-history/historic-case-instances

URL 参数：

|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|历史案例实例的 ID。|
|caseDefinitionKey|否|String|历史案例实例的案例定义键。|
|caseDefinitionId|否|String|历史案例实例的案例定义 ID。|
|businessKey|否|String|历史案例实例的业务键。|
|involvedUser|否|String|历史案例实例的参与用户。|
|finished|否|Boolean|表示历史案例实例是否已完成。|
|finishedAfter|否|Date|仅返回在此日期之后完成的历史案例实例。|
|finishedBefore|否|Date|仅返回在此日期之前完成的历史案例实例。|
|startedAfter|否|Date|仅返回在此日期之后启动的历史案例实例。|
|startedBefore|否|Date|仅返回在此日期之前启动的历史案例实例。|
|startedBy|否|String|仅返回由此用户启动的历史案例实例。|
|includeCaseVariables|否|Boolean|表示是否同时返回历史案例实例变量。|
|tenantId|否|String|仅返回具有给定租户 ID 的实例。|
|tenantIdLike|否|String|仅返回租户 ID 类似于给定值的实例。|
|withoutTenantId|否|Boolean|如果为 +true+，则仅返回未设置租户 ID 的实例。如果为 +false+，则忽略 +withoutTenantId+ 参数。|

|响应代码|描述|
|-|-|
|200|表示可以查询历史案例实例。|
|400|表示参数格式错误。状态消息包含额外信息。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "095fd94e-3c78-11ea-8548-38c986587585",
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "name": null,
            "businessKey": null,
            "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionName": "Test Case",
            "caseDefinitionDescription": null,
            "startTime": "2020-01-21T19:01:23.923+01:00",
            "endTime": null,
            "startUserId": "rest-admin",
            "superProcessInstanceId": null,
            "variables": [],
            "tenantId": "",
            "state": "active",
            "callbackId": null,
            "callbackType": null,
            "referenceId": null,
            "referenceType": null
        }
    ],
    "total": 1,
    "start": 0,
    "sort": "caseInstanceId",
    "order": "asc",
    "size": 1
}
```

### 查询历史案例实例

    POST query/historic-case-instances

*请求体：*

```
{
  "caseDefinitionKey" : "myCase",


  "variables" : [
    {
      "name" : "myVariable",
      "value" : 1234,
      "operation" : "equals",
      "type" : "long"
    }
  ]
}
```

所有支持的 JSON 参数字段与上一节中的参数完全相同，但作为 JSON 请求体参数传入，而不是作为 URL 参数，这样可以实现更高级的查询，并防止请求 URI 过长导致的错误。此外，查询还允许基于案例变量进行过滤。+variables+ 属性是一个 JSON 数组，包含使用常规 Flowable REST 格式的对象。

|响应代码|描述|
|-|-|
|200|表示请求成功，并已返回任务。|
|400|表示参数格式错误。状态消息包含额外信息。|

*成功响应体：*

### 获取历史案例实例

    GET cmmn-history/historic-case-instances/{caseInstanceId}
    
|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|历史案例实例的 ID。|    

|响应代码|描述|
|-|-|
|200|表示可以找到历史案例实例。|
|404|表示无法找到历史案例实例。|

*成功响应体：*

```
{
    "id": "095fd94e-3c78-11ea-8548-38c986587585",
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
    "name": null,
    "businessKey": null,
    "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
    "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
    "caseDefinitionName": "Test Case",
    "caseDefinitionDescription": null,
    "startTime": "2020-01-21T19:01:23.923+01:00",
    "endTime": null,
    "startUserId": "rest-admin",
    "superProcessInstanceId": null,
    "variables": [],
    "tenantId": "",
    "state": "active",
    "callbackId": null,
    "callbackType": null,
    "referenceId": null,
    "referenceType": null
}
```

### 删除历史案例实例

    DELETE cmmn-history/historic-case-instances/{caseInstanceId}

|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|历史案例实例的 ID。|    

|响应代码|描述|
|-|-|
|200|表示已删除历史案例实例。|
|404|表示无法找到历史案例实例。|

### 获取历史案例实例的身份链接

    GET cmmn-history/historic-case-instance/{caseInstanceId}/identitylinks

|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|历史案例实例的 ID。|    

|响应代码|描述|
|-|-|
|200|表示请求成功，并已返回身份链接。|
|404|表示无法找到案例实例。|

*成功响应体：*

```
[
    {
        "type": "starter",
        "userId": "rest-admin",
        "groupId": null,
        "taskId": null,
        "taskUrl": null,
        "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
        "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585"
    },
    {
        "type": "participant",
        "userId": "rest-admin",
        "groupId": null,
        "taskId": null,
        "taskUrl": null,
        "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
        "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585"
    }
]
```

### 获取历史案例实例变量的二进制数据

    GET cmmn-history/historic-case-instances/{caseInstanceId}/variables/{variableName}/data

|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|历史案例实例的 ID。|
|variableName|变量名称|需要返回其数据的变量的名称。|

|响应代码|描述|
|-|-|
|200|表示已找到案例实例并返回请求的变量数据。|
|404|表示未找到请求的案例实例，或案例实例没有具有给定名称的变量，或变量没有可用的二进制流。状态消息提供额外信息。|

*成功响应体：*

响应体包含变量的二进制值。当变量类型为 +binary+ 时，响应的 content-type 设置为 +application/octet-stream+，无论变量的内容或请求的 accept-type 头如何。对于 +serializable+ 类型，使用 +application/x-java-serialized-object+ 作为 content-type。

### 获取历史案例实例的阶段概览

    GET cmmn-history/historic-case-instances/{caseInstanceId}/stage-overview
    
|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|历史案例实例的 ID。|    

*成功响应体：*

```
[
    {
        "id": "stage1",
        "name": "First Stage",
        "current": true
        "ended": false,
        "endTime": null,
    },
    {
        "id": "stage2",
        "name": "Second stage",
        "current": false
        "ended": false,
        "endTime": null,
    }
]
```

### 历史里程碑列表

    GET cmmn-history/historic-milestone-instances
    
注意：里程碑实际上是作为计划项实例来表示的。    
    
|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|仅返回属于给定 ID 的案例实例的里程碑实例。|
|caseDefinitionId|否|String|仅返回属于给定 ID 的案例定义的里程碑实例。|
|mileStoneId|否|String|仅返回具有给定 ID 的里程碑实例（即计划项实例 ID）。|
|mileStoneName|否|String|仅返回具有给定名称的里程碑实例。|
|reachedBefore|否|Date|仅返回在提供的日期之前达到的里程碑实例。|
|reachedBefore|否|Date|仅返回在提供的日期之后达到的里程碑实例。|

|响应代码|描述|
|-|-|
|200|表示已找到里程碑实例并返回请求的变量数据。|
|404|未找到里程碑实例。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "095fd94e-3c78-11ea-8548-38c986587585",
            "name": "My milestone",
            "elementId": "milestone1",
            "caseInstanceId: "123fd94e-3c78-23ea-8548-38c986587585",
            "caseDefinitionId: "567fd94e-3c78-23ea-8548-38c981236545",
            "timestamp": "2020-01-21T19:01:23.923+01:00"
            ...
        }
    ],
    "total": 1,
    "start": 0,
    "sort": "caseInstanceId",
    "order": "asc",
    "size": 1
}
```

### 获取单个历史里程碑实例

    GET cmmn-history/historic-milestone-instances/{milestoneInstanceId}
    
|参数|是否必需|值类型|描述|
|-|-|-|-|
|milestoneInstanceId|否|String|历史里程碑实例的 ID。|       

|响应代码|描述|
|-|-|
|200|表示已找到里程碑实例并返回请求的变量数据。|
|404|未找到里程碑实例。|

*成功响应体：*

```
{
    "id": "095fd94e-3c78-11ea-8548-38c986587585",
    "name": "My milestone",
    "elementId": "milestone1",
    "caseInstanceId: "123fd94e-3c78-23ea-8548-38c986587585",
    "caseDefinitionId: "567fd94e-3c78-23ea-8548-38c981236545",
    "timestamp": "2020-01-21T19:01:23.923+01:00"
    ...
}
```

### 历史计划项实例列表

    GET cmmn-history/historic-planitem-instance
   
URL 参数：       

|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|仅返回属于给定 ID 的案例实例的计划项实例。|
|caseDefinitionId|否|String|仅返回属于给定 ID 的案例定义的计划项实例。|
|planItemInstanceId|否|String|仅返回具有给定 ID 的计划项实例。|
|planItemInstanceName|否|String|仅返回具有给定名称的计划项实例。|
|planItemInstanceState|否|String|仅返回具有给定状态的计划项实例。|   
|stageInstanceId|否|String|仅返回属于给定 ID 的阶段计划项实例的计划项实例。|
|elementId|否|String|仅返回具有给定元素（即来自模型）ID 的计划项实例。|
|planItemDefinitionId|否|String|仅返回具有给定计划项定义 ID 的计划项实例。|
|planItemDefinitionType|否|String|仅返回具有给定计划项定义类型的计划项实例。|
|referenceId|否|String|仅返回具有给定引用 ID 的计划项实例。|
|referenceType|否|String|仅返回具有给定引用类型的计划项实例。|
|startUserId|否|Date|仅返回由给定用户启动的计划项实例。|
|createdBefore|否|Date|仅返回在给定日期之前创建的计划项实例。|
|createdAfter|否|Date|仅返回在给定日期之后创建的计划项实例。|
|tenantId|否|String|仅返回属于给定租户 ID 的计划项实例。|
|withoutTenantId|否|String|仅返回不属于任何租户的计划项实例。|

由于计划项实例可以在不同状态之间移动，以下状态时间戳参数也可用（均为日期参数）：

* lastAvailableBefore
* lastAvailableAfter
* lastEnabledBefore
* lastEnabledAfter
* lastDisabledBefore
* lastDisabledAfter
* lastStartedBefore
* lastStartedAfter
* lastSuspendedBefore
* lastSuspendedAfter
* completedBefore
* completedAfter
* terminatedBefore
* terminatedAfter 
* occurredBefore
* occurredAfter
* exitBefore
* exitAfter
* endedBefore（适用于所有终止状态）
* endedAfter（适用于所有终止状态）

|响应代码|描述|
|-|-|
|200|表示请求成功，并已返回身份链接。|
|400|表示参数格式错误。状态消息包含额外信息。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "09618702-3c78-11ea-8548-38c986587585",
            "name": null,
            "state": "active",
            "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
            "derivedCaseDefinitionId": null,
            "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
            "stageInstanceId": null,
            "stage": true,
            "elementId": "planItem2",
            "planItemDefinitionId": "expandedStage1",
            "planItemDefinitionType": "stage",
            "createTime": "2020-01-21T19:01:23.934+01:00",
            "lastAvailableTime": "2020-01-21T19:01:23.942+01:00",
            "lastEnabledTime": null,
            "lastDisabledTime": null,
            "lastStartedTime": "2020-01-21T19:01:23.974+01:00",
            "lastSuspendedTime": null,
            "completedTime": null,
            "occurredTime": null,
            "terminatedTime": null,
            "exitTime": null,
            "endedTime": null,
            "lastUpdatedTime": "2020-01-21T19:01:23.974+01:00",
            "startUserId": null,
            "referenceId": null,
            "referenceType": null,
            "entryCriterionId": null,
            "exitCriterionId": null,
            "formKey": null,
            "extraValue": null,
            "showInOverview": true,
            "tenantId": "",
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-planitem-instances/09618702-3c78-11ea-8548-38c986587585",
            "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
            "derivedCaseDefinitionUrl": null,
            "stageInstanceUrl": null
        },
        ...
    ],
    "total": 3,
    "start": 0,
    "sort": "createTime",
    "order": "asc",
    "size": 3
}
```

### 获取历史计划项实例

    GET cmmn-history/historic-planitem-instances/{planItemInstanceId}
    
|参数|是否必需|值类型|描述|
|-|-|-|-|
|planItemInstanceId|否|String|历史计划项实例的 ID。|       

|响应代码|描述|
|-|-|
|200|表示已找到里程碑实例并返回请求的变量数据。|
|404|未找到计划项实例。|    

*成功响应体：*

```
{
    "id": "09618702-3c78-11ea-8548-38c986587585",
    "name": "My Stage",
    "state": "active",
    "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
    "derivedCaseDefinitionId": null,
    "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
    "stageInstanceId": null,
    "stage": true,
    "elementId": "planItem2",
    "planItemDefinitionId": "expandedStage1",
    "planItemDefinitionType": "stage",
    "createTime": "2020-01-21T19:01:23.934+01:00",
    "lastAvailableTime": "2020-01-21T19:01:23.942+01:00",
    "lastEnabledTime": null,
    "lastDisabledTime": null,
    "lastStartedTime": "2020-01-21T19:01:23.974+01:00",
    "lastSuspendedTime": null,
    "completedTime": null,
    "occurredTime": null,
    "terminatedTime": null,
    "exitTime": null,
    "endedTime": null,
    "lastUpdatedTime": "2020-01-21T19:01:23.974+01:00",
    "startUserId": null,
    "referenceId": null,
    "referenceType": null,
    "entryCriterionId": null,
    "exitCriterionId": null,
    "formKey": null,
    "extraValue": null,
    "showInOverview": true,
    "tenantId": "",
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-planitem-instances/09618702-3c78-11ea-8548-38c986587585",
    "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
    "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585",
    "derivedCaseDefinitionUrl": null,
    "stageInstanceUrl": null
}
```

### 获取历史任务实例

    GET cmmn-history/historic-task-instances


|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|否|String|历史任务实例的 ID。|
|caseInstanceId|否|String|历史任务实例的案例实例 ID。|
|caseDefinitionId|否|String|历史任务实例的案例定义 ID。|
|taskDefinitionKey|否|String|案例中任务的任务定义键。|
|taskName|否|String|历史任务实例的任务名称。|
|taskNameLike|否|String|使用 'like' 运算符的历史任务实例的任务名称。|
|taskDescription|否|String|历史任务实例的任务描述。|
|taskDescriptionLike|否|String|使用 'like' 运算符的历史任务实例的任务描述。|
|taskDefinitionKey|否|String|来自案例定义的历史任务实例的任务标识符。|
|taskCategory|否|String|选择具有给定类别的任务。注意这是任务类别，而不是案例定义的类别（BPMN XML 中的命名空间）。|
|taskDeleteReason|否|String|历史任务实例的任务删除原因。|
|taskDeleteReasonLike|否|String|使用 'like' 运算符的历史任务实例的任务删除原因。|
|taskAssignee|否|String|历史任务实例的受理人。|
|taskAssigneeLike|否|String|使用 'like' 运算符的历史任务实例的受理人。|
|taskOwner|否|String|历史任务实例的所有者。|
|taskOwnerLike|否|String|使用 'like' 运算符的历史任务实例的所有者。|
|taskInvolvedUser|否|String|历史任务实例的参与用户。|
|taskPriority|否|String|历史任务实例的优先级。|
|finished|否|Boolean|表示历史任务实例是否已完成。|
|caseFinished|否|Boolean|表示历史任务实例的案例实例是否已完成。|
|parentTaskId|否|String|历史任务实例的可选父任务 ID。|
|dueDate|否|Date|仅返回到期日等于此日期的历史任务实例。|
|dueDateAfter|否|Date|仅返回到期日在此日期之后的历史任务实例。|
|dueDateBefore|否|Date|仅返回到期日在此日期之前的历史任务实例。|
|withoutDueDate|否|Boolean|仅返回没有到期日的历史任务实例。当提供值为 +false+ 时，此参数将被忽略。|
|taskCompletedOn|否|Date|仅返回在此日期完成的历史任务实例。|
|taskCompletedAfter|否|Date|仅返回在此日期之后完成的历史任务实例。|
|taskCompletedBefore|否|Date|仅返回在此日期之前完成的历史任务实例。|
|taskCreatedOn|否|Date|仅返回在此日期创建的历史任务实例。|
|taskCreatedBefore|否|Date|仅返回在此日期之前创建的历史任务实例。|
|taskCreatedAfter|否|Date|仅返回在此日期之后创建的历史任务实例。|
|includeTaskLocalVariables|否|Boolean|表示是否同时返回历史任务实例的本地变量。|
|tenantId|否|String|仅返回具有给定租户 ID 的历史任务实例。|
|tenantIdLike|否|String|仅返回租户 ID 类似于给定值的历史任务实例。|
|withoutTenantId|否|Boolean|如果为 +true+，则仅返回未设置租户 ID 的历史任务实例。如果为 +false+，则忽略 +withoutTenantId+ 参数。|

|响应代码|描述|
|-|-|
|200|表示可以查询历史案例实例。|
|400|表示参数格式错误。状态消息包含额外信息。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "09688be5-3c78-11ea-8548-38c986587585",
            "name": "Human task",
            "description": null,
            "deleteReason": null,
            "owner": null,
            "assignee": "rest-admin",
            "startTime": "2020-01-21T19:01:23.975+01:00",
            "endTime": null,
            "durationInMillis": null,
            "workTimeInMillis": null,
            "claimTime": null,
            "taskDefinitionKey": "humanTask1",
            "formKey": null,
            "priority": 50,
            "dueDate": null,
            "parentTaskId": null,
            "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-task-instances/09688be5-3c78-11ea-8548-38c986587585",
            "variables": [],
            "tenantId": "",
            "category": null,
            "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
            "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
            "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585"
        }
    ],
    "total": 1,
    "start": 0,
    "sort": "taskInstanceId",
    "order": "asc",
    "size": 1
}
```

### 获取单个历史任务实例

    GET cmmn-history/historic-task-instances/{taskId}

|参数|是否必需|值类型|描述|
|-|-|-|-|
|taskId|否|String|历史任务的 ID。|    

|响应代码|描述|
|-|-|
|200|表示已找到历史任务实例。|
|404|表示未找到历史任务实例。|

*成功响应体：*

```
{
    "id": "09688be5-3c78-11ea-8548-38c986587585",
    "name": "Human task",
    "description": null,
    "deleteReason": null,
    "owner": null,
    "assignee": "rest-admin",
    "startTime": "2020-01-21T19:01:23.975+01:00",
    "endTime": null,
    "durationInMillis": null,
    "workTimeInMillis": null,
    "claimTime": null,
    "taskDefinitionKey": "humanTask1",
    "formKey": null,
    "priority": 50,
    "dueDate": null,
    "parentTaskId": null,
    "url": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-task-instances/09688be5-3c78-11ea-8548-38c986587585",
    "variables": [],
    "tenantId": "",
    "category": null,
    "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
    "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
    "caseDefinitionId": "59fd213c-3c6b-11ea-8548-38c986587585",
    "caseDefinitionUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-repository/case-definitions/59fd213c-3c6b-11ea-8548-38c986587585"
}
```

### 查询历史任务实例

    POST query/historic-task-instances

所有支持的 JSON 参数字段与上一节中的参数完全相同，但作为 JSON 请求体参数传入，而不是作为 URL 参数，这样可以实现更高级的查询，并防止请求 URI 过长导致的错误。此外，查询还允许基于案例变量进行过滤。

|响应代码|描述|
|-|-|
|200|表示请求成功，并已返回任务。|
|400|表示参数格式错误。状态消息包含额外信息。|

### 删除历史任务实例

    DELETE cmmn-history/historic-task-instances/{taskId}

|响应代码|描述|
|-|-|
|200|表示已删除历史任务实例。|
|404|表示未找到历史任务实例。|

### 获取历史任务实例的身份链接

    GET cmmn-history/historic-task-instance/{taskId}/identitylinks

|响应代码|描述|
|-|-|
|200|表示请求成功，并已返回身份链接。|
|404|表示未找到任务实例。|

*成功响应体：*

```
[
    {
        "type": "assignee",
        "userId": "rest-admin",
        "groupId": null,
        "taskId": "09688be5-3c78-11ea-8548-38c986587585",
        "taskUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-task-instances/09688be5-3c78-11ea-8548-38c986587585",
        "caseInstanceId": null,
        "caseInstanceUrl": null
    }
]
```

### 获取历史任务实例变量的二进制数据

    GET cmmn-history/historic-task-instances/{taskId}/variables/{variableName}/data

|响应代码|描述|
|-|-|
|200|表示已找到任务实例并返回请求的变量数据。|
|404|表示未找到请求的任务实例，或案例实例没有具有给定名称的变量，或变量没有可用的二进制流。状态消息提供额外信息。|

*成功响应体：*

响应体包含变量的二进制值。当变量类型为 +binary+ 时，响应的 content-type 设置为 +application/octet-stream+，无论变量的内容或请求的 accept-type 头如何。对于 +serializable+ 类型，使用 +application/x-java-serialized-object+ 作为 content-type。

### 历史变量实例列表

    GET cmmn-history/historic-variable-instances

URL 参数：

|参数|是否必需|值类型|描述|
|-|-|-|-|
|caseInstanceId|否|String|历史变量实例的案例实例 ID。|
|taskId|否|String|历史变量实例的任务 ID。|
|excludeTaskVariables|否|Boolean|表示是否从结果中排除任务变量。|
|variableName|否|String|历史变量实例的变量名称。|
|variableNameLike|否|String|使用 'like' 运算符的历史变量实例的变量名称。|

|响应代码|描述|
|-|-|
|200|表示可以查询历史变量实例。|
|400|表示参数格式错误。状态消息包含额外信息。|

*成功响应体：*

```
{
    "data": [
        {
            "id": "09604e80-3c78-11ea-8548-38c986587585",
            "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
            "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "taskId": null,
            "variable": {
                "name": "initiator",
                "type": "string",
                "value": "rest-admin",
                "scope": null
            }
        },
        {
            "id": "0960c3b1-3c78-11ea-8548-38c986587585",
            "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
            "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "taskId": null,
            "variable": {
                "name": "myVar",
                "type": "string",
                "value": "This is a variable",
                "scope": null
            }
        },
        {
            "id": "06436c38-3c7a-11ea-8548-38c986587585",
            "caseInstanceId": "095fd94e-3c78-11ea-8548-38c986587585",
            "caseInstanceUrl": "http://localhost:8080/flowable-rest/cmmn-api/cmmn-history/historic-case-instances/095fd94e-3c78-11ea-8548-38c986587585",
            "taskId": null,
            "variable": {
                "name": "test",
                "type": "binary",
                "value": null,
                "scope": null
            }
        }
    ],
    "total": 3,
    "start": 0,
    "sort": "variableName",
    "order": "asc",
    "size": 3
}
```

### 查询历史变量实例

    POST query/historic-variable-instances

*请求体：*

```
{
  "caseDefinitionId" : "59fd213c-3c6b-11ea-8548-38c986587585",
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
```


所有支持的 JSON 参数字段与上一节中的参数完全相同，但作为 JSON 请求体参数传入，而不是作为 URL 参数，这样可以实现更高级的查询，并防止请求 URI 过长导致的错误。此外，查询还允许基于案例变量进行过滤。+variables+ 属性是一个 JSON 数组，包含使用常规 Flowable 变量格式的对象。

|响应代码|描述|
|-|-|
|200|表示请求成功，并已返回任务。|
|400|表示参数格式错误。状态消息包含额外信息。|

### 获取历史任务实例变量的二进制数据

    GET cmmn-history/historic-variable-instances/{varInstanceId}/data

|参数|是否必需|值类型|描述|
|-|-|-|-|
|varInstanceId|否|String|需要获取其数据的历史变量 ID。|

|响应代码|描述|
|-|-|
|200|表示已找到变量实例并返回请求的变量数据。|
|404|表示未找到请求的变量实例，或变量实例没有具有给定名称的变量，或变量没有可用的二进制流。状态消息提供额外信息。|

*成功响应体：*

响应体包含变量的二进制值。当变量类型为 +binary+ 时，响应的 content-type 设置为 +application/octet-stream+，无论变量的内容或请求的 accept-type 头如何。对于 +serializable+ 类型，使用 +application/x-java-serialized-object+ 作为 content-type。

## 作业管理

CMMN REST API 允许完全访问管理异步作业、定时作业、挂起的作业和死信作业。
该 API 与[BPMN 引擎的 API](../bpmn/ch14-REST#jobs)完全相同，只是将 `management` 替换为 `cmmn-management`。