---
title: Flowable 后端脚本
description: 本文详细介绍Flowable后端脚本API的使用方法，包括输入输出处理、BPMN错误抛出和JSON工具操作，帮助开发者高效实现业务流程自动化。
keywords: Flowable,脚本API,后端开发,BPMN错误处理,JSON工具,流程自动化,JavaScript,Groovy
authors: Flowable中文文档
authorURL: http://flowable.me
---

![Flowable 脚本 API 架构](/img/blog/flowable-scripting-architecture.svg)

## 简介

脚本可以在各种场景中使用，如流程的脚本任务、案例的脚本任务以及使用脚本的服务注册定义中。

可以使用符合JSR-223标准的脚本语言（如JavaScript或Groovy）来编写脚本，Flowable将脚本API暴露到脚本上下文中，您可以访问各种实用工具，以及创建JSON对象、访问服务、请求输入变量和注册输出参数，当然这取决于您的具体使用场景。

本文档主要介绍Flowable脚本API，它通过flw对象进行访问和使用。 

## 输入和输出

在脚本中，您可以使用`flw.getInput(name)`获取输入值，根据上下文的不同，返回的可能是具有请求名称的变量或具有该名称的输入参数。

同样，使用`flw.setOutput(name, value)`可以设置变量值或注册输出参数值。

以下方法可用：

- `flw.getInput(name)` - 根据上下文的不同，返回请求名称的变量或对应名称的输入参数。
- `flw.setOutput(name, value)` - 设置变量值或注册输出参数值。
- `flw.setTransientOutput(name, value)` - 设置临时变量值。
- `flw.setLocalOutput(name, value)` - 将变量值设置为本地作用域。

脚本任务示例：

- `flw.getInput('foo');` 将返回名为foo的变量。
- `flw.setOutput('bar', myBarValue);` 将存储一个名为bar的新变量，其值由本地脚本变量myBarValue提供。

使用脚本的注册服务示例：

- `flw.getInput('foo');` 将返回名为foo的映射输入参数。
- `flw.setOutput('bar', myBarValue);` 将本地脚本变量myBarValue提供的值注册为名为bar的输出参数。

## BPMN错误

脚本API支持使用以下方法抛出BPMN错误：

- `flw.bpmn.throwError('ERROR_CODE')`
- `flw.bpmn.throwError('ERROR_CODE', 'Error Message')`

BPMN错误可以在BPMN模型中使用错误边界事件或错误事件子流程进行处理，这使其成为基于模型的错误处理的强大工具，无需修改Java代码。

这些工具方法相当于便捷地执行`throw new org.flowable.engine.delegate.BpmnError('ERROR_CODE')`。

## JSON工具

脚本API还支持各种围绕JSON对象处理的工具，如创建JSON对象或数组，或将JSON字符串转换为JSON对象结构。

您可以通过`flw.json`访问这些工具。

要创建一个新的空JSON对象，使用`flw.json.createObject()`，并将结果存储为本地变量，或使用返回的JSON对象的流式API来创建其值。

### 带有简单值的JSON对象

只使用值而不带嵌套或列表值的简单JSON对象可以如下创建：

示例：

```javascript
var myJson = flw.json.createObject();
myJson.putString('name', 'Sample Json object');
myJson.putInteger('sum', 100);
myJson.putBoolean('verified', true);
```

这个例子也可以写成：

```javascript
var myJson = flw.json.createObject()
    .putString('name', 'Sample Json object')
    .putInteger('sum', 100)
    .putBoolean('verified', true);
```

或者，如果用作输出值：

```javascript
flw.setOutput('myJsonOutputParameter', flw.json.createObject()
    .putString('name', 'Sample Json object')
    .putInteger('sum', 100)
    .putBoolean('verified', true));
```

### 脚本变量、JSON和FLOWABLE变量
有不同的方式来表示脚本中的数据：

1. Groovy/JavaScript变量（以下为简化起见，专注于JavaScript）
2. JSON
3. Flowable变量

在JavaScript中，您可以创建对象结构并向这些对象添加不同的元素，包括例如日期。例如：`{name: 'Sample Json object', myDate: new Date()}`

将其转换为JSON将产生如下结果：`{"test":"2024-01-17T05:53:01.880Z"}`。这可以在JavaScript中分配给变量，但并不是每个JavaScript变量都是有效的JSON。例如，`{test: () => { return 'test' }}`在JavaScript中是有效的对象，但将其转换为JSON会导致一个空对象`{}`。

Flowable的`flw.json` API在不同脚本语言之间与向后兼容性无关。JavaScript执行来自Nashorn引擎，可能在不同的Java版本和/或类路径上可用的Nashorn引擎版本之间有所不同。

也可以直接使用JavaScript/Groovy创建JSON结构，只需注意这取决于执行引擎。

以下示例将使用JavaScript引擎创建一个对象，将其转换为JSON，然后将其添加为Flowable JSON变量testJson：

```javascript
flw.setOutput("testJson",
   flw.json.stringToJson(
      JSON.stringify({name: 'Sample Json object', test: new Date()})
   )
);
```

### 嵌套JSON对象

嵌套对象也可以轻松创建：

```javascript
var myJson = flw.json.createObject()
    .putString('name', 'Sample Json object');

myJson.createChildObject('nestedObject')
    .putString('nestedObjectName', 'Nested Json object');
```

> **注意**
>
> `createChildObject`方法将创建一个新的子JSON对象，并使用提供的字段名将其添加到当前对象（从中调用该方法的对象）。
>
> 请注意返回值；`createObject()`将返回根JSON对象，但`createChildObject`始终只返回新创建的子对象以进行进一步处理，如添加值。如果您最终需要使用根对象，请确保保留一个包含返回的根JSON对象的变量，而不仅仅是最新的嵌套对象。

### JSON数组

JSON数组可以作为"根"JSON对象创建，也可以作为嵌套对象创建。

创建JSON数组可以使用json工具的`createArray`方法：

```javascript
var myJsonArray = flw.json.createArray()
    .addString('hello')
    .addString('world');
```

创建嵌套JSON数组也很简单：

```javascript
var myJson = flw.json.createObject()
    .putString('name', 'Sample Json object');

myJson.createChildArray('nestedList')
    .addString('hello')
    .addString('world');
```

> **注意**
>
> 要向数组添加值，请使用`addXY`方法，而不是用于设置JSON对象值的`putXY`方法。

### 可用方法

以下部分列出了使用`flw.json.createObject`，`flw.json.createArray`或`flw.json.stringToJson`创建的JSON对象的可用方法。

#### 通用方法

这是可用通用方法的列表：

- `size()` 此对象的属性数量或数组长度。
- `isArray()` 当节点是数组节点时返回true。
- `isObject()` 当节点是对象节点时返回true。
- `isValue()` 当节点是值节点时返回true。
- `isPresent()` 当节点存在时返回true。
- `isNonNull()` 当节点存在且不为null时返回true。
- `iterator()` 返回一个迭代器以迭代数组元素。对于对象节点，返回带有对象本身的单个元素迭代器。

#### 对象方法

这是JSON对象（非数组）可用方法的列表：

- `putString(fieldName, value)` 带有String值。
- `putInteger(fieldName, value)` 带有Number值。
- `putInt(fieldName, value)` 带有int值。
- `putBoolean(fieldName, value)` 带有boolean值。
- `putShort(fieldName, value)` 带有Number或short值。
- `putLong(fieldName, value)` 带有Number或long值。
- `putDouble(fieldName, value)` 带有Number或double值。
- `putFloat(fieldName, value)` 带有Number或float值。
- `putObject(fieldName, value)` 添加一个对象。该对象可以是null（则使用putNull）或另一个JSON对象或数组。
- `putNull(fieldName)` 向对象添加null值。
- `createChildObject(fieldName)` 创建一个新的子JSON对象并将其作为嵌套对象添加到当前对象。
- `createChildArray(fieldName)` 创建一个新的JSON数组并将其作为子数组添加到当前对象。
- `path(path)` 返回给定路径的JSON节点。当路径不存在时，结果对象对`isPresent()`返回false。
- `fieldNames()` 返回对象节点的所有字段名称的集合。如果节点不是对象，则返回空集合。

#### 数组方法

这是JSON数组（非对象）可用方法的列表：

- `addString(value)` 带有String值。
- `addInteger(value)` 带有Number值。
- `addInt(value)` 带有int值。
- `addBoolean(value)` 带有boolean值。
- `addShort(value)` 带有Number或short值。
- `addLong(value)` 带有Number或long值。
- `addDouble(value)` 带有Number或double值。
- `addFloat(value)` 带有Number或float值。
- `addNull()` 向数组添加null值。
- `addObject(value)` 向数组添加对象。该对象可以是null或另一个JSON对象或数组。
- `path(index)` 将返回提供的索引处的元素。当索引不存在时，结果对象对`isPresent()`返回false。

#### 值方法

这是值可用方法的列表。所有方法在被调用在非值或null节点上时都会抛出FlowableException。

- `asString()` 将给定值节点作为字符串返回。将非字符串值转换为其字符串表示形式。
- `asInteger()` 将数值作为整数返回。如果不是整数或整数溢出，则抛出FlowableException。
- `asLong()` 将数值作为long返回。如果不是整数，则抛出FlowableException。
- `asDouble()` 将数值作为double返回。
- `asBoolean()` 返回布尔值。不将其他值类型强制转换为布尔值。
- `isString()` 当节点是字符串时返回true。
- `isNumber()` 当节点是数字时返回true。
- `isBoolean()` 当节点是布尔值时返回true。

### JSON字符串转换

如果您有表示JSON对象的字符串，可以将其转换为JSON对象以进行进一步处理，如果需要，也可以转回字符串。

- `flw.json.stringToJson`
- `flw.json.jsonToString`

示例：

```javascript
var myJsonString = '{ "foo": "fooValue", "bar": "barValue", "sum": 100, "verified": true }';
var myJson = flw.json.stringToJson(myJsonString);
myJson.putString("my_value", "value");
var string = flw.json.jsonToString(myJson);
```

## 时间工具

脚本API还支持日期和时间处理的实用工具，可通过`flw.time`访问。
如果没有特别说明，默认时区始终是UTC。

您可以使用与表达式中相同的功能，使用`flwTimeUtils`。

以下是可用函数的列表：

| 函数 | 描述 |
| --- | --- |
| `Instant now()` | 返回UTC中的当前日期和时间。 |
| `Instant currentDate()` | 返回UTC时间上午00:00的当前日期作为Instant。 |
| `LocalDate currentLocalDate()` | 返回系统时区（即UTC）中的当前日期，作为LocalDate实例。 |
| `LocalDateTime currentLocalDateTime()` | 返回系统时区（即UTC）中的当前日期和时间，作为LocalDateTime实例。 |
| `Instant instantFromTimestamp(long timestamp)` | 从1970年1月1日以来经过的秒数（Unix时间戳）返回一个Instant。 |
| `Date dateFromTimestamp(long timestamp)` | 从1970年1月1日以来经过的秒数（Unix时间戳）返回一个Date。 |
| `Instant parseInstant(Date date)` | 从Date中返回一个Instant。 |
| `Instant parseInstant(String instantIsoString)` | 将ISO8601格式的字符串解析为Instant。 |
| `Instant parseInstant(Object value, String pattern)` | 使用提供的模式将对象解析为Instant。支持的输入是String、Json TextNode或null。 |
| `LocalDate parseLocalDate(Object value, String pattern)` | 使用提供的模式将对象解析为LocalDate。支持的输入是String、Json TextNode或null。 |
| `LocalDateTime parseLocalDateTime(Object value, String pattern)` | 使用提供的模式将对象解析为LocalDateTime。支持的输入是String、Json TextNode或null。 |
| `Instant asInstant(Object value)` | 将值转换为带有UTC时区的Instant。支持的值有：Date、Instant（直接返回）、LocalDate、LocalDateTime、ISO8601格式的String或null。 |
| `Instant asInstant(Object value, String timeZoneId)` | 将值转换为给定时区的Instant。支持的值有：Date、Instant（直接返回）、LocalDate、LocalDateTime、ISO8601格式的String或null。 |
| `LocalDate asLocalDate(Object value)` | 将值转换为带有UTC时区的LocalDate。支持的值有：Date、Instant、LocalDate（直接返回）、LocalDateTime、ISO8601格式的String或null。 |
| `LocalDate asLocalDate(Object value, String timeZoneId)` | 将值转换为给定时区的LocalDate。支持的值有：Date、Instant、LocalDate（直接返回）、LocalDateTime、ISO8601格式的String或null。 |
| `LocalDateTime asLocalDateTime(Object value)` | 将值转换为带有UTC时区的LocalDateTime。支持的值有：Date、Instant、LocalDate、LocalDateTime（直接返回）、ISO8601格式的String或null。 |
| `LocalDateTime asLocalDateTime(Object value, String timeZoneId)` | 将值转换为给定时区的LocalDateTime。支持的值有：Date、Instant、LocalDate、LocalDateTime（直接返回）、ISO8601格式的String或null。 |
| `Date asDate(Object value)` | 将值转换为UTC时区中的Date。支持的值有Instant、LocalDate、LocalDateTime、ISO8601格式的String或null。 |
| `Object atTime(Object value, int hours, int minutes, int seconds)` | 在UTC时区中将值的时间设置为指定的小时、分钟和秒。支持的值有Date、Instant、LocalDateTime或ISO8601格式的String。返回值将与输入类型相同，对于字符串，根据提供的字符串格式，将是Instant或LocalDateTime。 |
| `Object atTimeWithTimeZone(Object value, int hours, int minutes, int seconds, String timeZoneId)` | 在给定时区中将值的时间设置为指定的小时、分钟和秒。支持的值有Date、Instant、LocalDateTime或ISO8601格式的String。返回值将与输入类型相同，对于字符串，根据提供的字符串格式，将是Instant或LocalDateTime。 |
| `Object atTimeZone(Object value, String timeZoneId)` | 返回指定时区的Instant。支持的值有Date或Instant。仅将此用于显示目的，切勿将日期存储在UTC以外的其他时区中。 |
| `List<String> getAvailableTimeZoneIds()` | 返回可用时区ID的列表。更完整的列表也可以在[这里](https://docs.oracle.com/javase/8/docs/api/java/time/ZoneId.html)找到。 |
| `int getField(Object value, String chronoFieldString)` | 通过指定ChronoField作为字符串来获取"时间片段"。chrono字段可以指定为显示名称或枚举名称。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。所有chrono字段的列表可以在[这里](https://docs.oracle.com/javase/8/docs/api/java/time/temporal/ChronoField.html)找到。例如：`flw.time.getField(flw.time.now(), 'DAY_OF_WEEK')`或`flw.time.getField(flw.time.now(), 'AlignedWeekOfYear')`。 |
| `boolean isWeekend(Object value)` | 确定给定值是否表示周末。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Instant fullDateTimeInstant(int year, int month, int day, int hour, int minute, int second)` | 使用给定的值在UTC时区创建Instant。 |
| `Date fullDateTimeDate(int year, int month, int day, int hour, int minute, int second)` | 使用给定的值创建Date。 |
| `Object plusSeconds(Object value, long seconds)` | 向给定值添加秒数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object plusMinutes(Object value, long minutes)` | 向给定值添加分钟数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object plusHours(Object value, long hours)` | 向给定值添加小时数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object plusDays(Object value, long days)` | 向给定值添加天数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object plusWeeks(Object value, long days)` | 向给定值添加周数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object plusMonths(Object value, long days)` | 向给定值添加月数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object plusYears(Object value, long days)` | 向给定值添加年数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object plusDuration(Object value, String iso8601Duration)` | 向给定值添加ISO8601编码的持续时间。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。例如：`flw.time.plusDuration(flw.time.now(), 'P1Y')`（向现在添加一年），`flw.time.plusDuration(flw.time.now(), 'P14D')`（向现在添加14天），`flw.time.plusDuration(flw.time..now(), 'PT30M10S')`（向现在添加30分钟和10秒）。 |
| `Object minusSeconds(Object value, long seconds)` | 从给定值减去秒数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object minusMinutes(Object value, long minutes)` | 从给定值减去分钟数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object minusHours(Object value, long hours)` | 从给定值减去小时数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object minusDays(Object value, long days)` | 从给定值减去天数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object minusWeeks(Object value, long days)` | 从给定值减去周数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object minusMonths(Object value, long days)` | 从给定值减去月数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object minusYears(Object value, long days)` | 从给定值减去年数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `Object minusDuration(Object value, String iso8601Duration)` | 从给定值减去ISO8601编码的持续时间。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。例如：`flw.time.minusDuration(flw.time.now(), 'P1Y')`（从现在减去一年），`flw.time.minusDuration(flw.time.now(), 'P14D')`（从现在减去14天），`flw.time.minusDuration(flw.time..now(), 'PT30M10S')`（从现在减去30分钟和10秒）。 |
| `long secondsOfDuration(String iso8601Duration)` | 返回ISO持续时间字符串中的秒数，例如PT60M返回3600。 |
| `boolean isBefore(Object firstValue, Object secondValue)` | 检查第一个值是否在第二个值之前。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。这些值不需要是相同类型，如果需要，它们将自动转换。 |
| `boolean isBeforeOrEqual(Object firstValue, Object secondValue)` | 检查第一个值是否在第二个值之前或等于第二个值。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。这些值不需要是相同类型，如果需要，它们将自动转换。 |
| `boolean isAfter(Object firstValue, Object secondValue)` | 检查第一个值是否在第二个值之后。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。这些值不需要是相同类型，如果需要，它们将自动转换。 |
| `boolean isAfterOrEqual(Object firstValue, Object secondValue)` | 检查第一个值是否在第二个值之后或等于第二个值。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。这些值不需要是相同类型，如果需要，它们将自动转换。 |
| `boolean areEqual(Object firstValue, Object secondValue)` | 检查第一个值是否等于第二个值。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。这些值不需要是相同类型，如果需要，它们将自动转换。 |
| `boolean isBeforeTime(Object value, String timeZoneId, int hours, int minutes, int seconds)` | 检查给定值是否在给定时区的某个时间之前。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `boolean isAfterTime(Object value, String timeZoneId, int hours, int minutes, int seconds)` | 检查给定值是否在给定时区的某个时间之后。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `long getFieldFromDurationBetweenDates(Object firstValue, Object secondValue, String chronoUnitString)` | 返回两个值之间的持续时间。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。支持以下单位：Nanos、Micros、Millis、Seconds、Hours、HalfDays、Days、Weeks、Months、Years、Decades、Centuries、Millenia。请注意，数字始终是long类型，即数字始终会被四舍五入。 |
| `long secondsBetween(Object firstValue, Object secondValue)` | 返回两个值之间的秒数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `long minutesBetween(Object firstValue, Object secondValue)` | 返回两个值之间的分钟数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `long hoursBetween(Object firstValue, Object secondValue)` | 返回两个值之间的小时数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `long daysBetween(Object firstValue, Object secondValue)` | 返回两个值之间的天数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `long weeksBetween(Object firstValue, Object secondValue)` | 返回两个值之间的周数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `long monthsBetween(Object firstValue, Object secondValue)` | 返回两个值之间的月数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `long yearsBetween(Object firstValue, Object secondValue)` | 返回两个值之间的年数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |
| `long getTimeZoneOffset(Object value, String timeZoneId)` | 计算指定时区中特定时间点与UTC的偏移秒数。支持的值有Date、Instant、LocalDate、LocalDateTime或ISO8601格式的String。 |

## 字符串工具

脚本API还支持字符串处理的实用工具，可通过`flw.string`访问。

您可以使用与表达式中相同的功能，使用`flwStringUtils`。

以下是可用函数的列表：

| 函数 | 描述 |
| --- | --- |
| `String toUpperCase(Object text)` | 将对象的所有字母转换为大写。支持的值有String、Json TextNode或null。 |
| `String toLowerCase(Object text)` | 将对象的所有字母转换为小写。支持的值有String、Json TextNode或null。 |
| `String capitalize(Object text)` | 将文本首字母大写，即将第一个字母设置为大写。支持的值有String、Json TextNode或null。 |
| `String trimWhitespace(Object text)` | 删除文本中所有前导和尾随空格。支持的值有String、Json TextNode或null。 |
| `boolean hasText(Object text)` | 检查字符串是否包含文本（不为null或空）。支持的值有String、Json TextNode或null。 |
| `boolean contains(Object text, String otherText)` | 检查字符串是否包含另一个字符串。支持的值有String、Json TextNode或null。 |
| `boolean containsIgnoreCase(Object text, String otherText)` | 检查字符串是否包含另一个字符串，忽略大小写。支持的值有String、Json TextNode或null。 |
| `boolean matches(Object text, String regularExpression)` | 检查文本是否匹配正则表达式。支持的值有String、Json TextNode或null。 |
| `boolean equals(Object text, String otherText)` | 检查两个字符串是否相等。支持的值有String、Json TextNode或null。 |
| `boolean equalsIgnoreCase(Object text, String otherText)` | 检查两个字符串是否相等，忽略大小写。支持的值有String、Json TextNode或null。 |
| `String substring(Object text, int from, int to)` | 返回提供的字符范围内的子字符串。索引基于0，from包含在内，to不包含在内。支持的值有String、Json TextNode或null。 |
| `String substringFrom(Object text, int from)` | 返回从给定位置开始的文本（索引基于0）。支持的值有String、Json TextNode或null。 |
| `List<String> split(Object text, String delimiter)` | 使用给定的分隔符将文本拆分为集合。分隔符可以是单个字符，例如分号，或正则表达式。支持的值有String、Json TextNode或null。 |
| `String join(Collection<String> collection, String delimiter)` | 使用给定的分隔符将列表或集合的所有条目连接为单个字符串。支持的值有String、Json TextNode或null。 |
| `String newline()` | 返回新行/换行符。 |
| `String carriageReturn()` | 返回回车符。 |
| `String escapeHtml(Object text)` | 使用HTML实体转义对象中的字符。支持的值有String、Json TextNode或null。 |
| `String unescapeHtml(Object text)` | 将包含实体转义的字符串转义为包含与转义对应的实际Unicode字符的字符串。支持的值有String、Json TextNode或null。 |

## 数学工具

脚本API还支持数学运算工具，可通过`flw.math`访问。

您可以使用与表达式中相同的功能，使用`flwMathUtils`。

以下是可用函数的列表：

| 函数 | 描述 |
| --- | --- |
| `double sum(Collection<Double> numbers)` | 计算数字列表的总和。 |
| `double average(Collection<Double> numbers)` | 计算数字列表的平均值。 |
| `double floor(double number)` | 返回提供的数字的下一个较低整数。 |
| `double ceil(double number)` | 返回提供的数字的下一个较高整数。 |
| `double round(double number)` | 将数字四舍五入为整数值。 |
| `double round(double number, int scale)` | 使用RoundingMode#HALF_UP将数字四舍五入到最多小数位数。 |
| `double min(Collection<Double> numbers)` | 返回数字列表中的最小数字。 |
| `double max(Collection<Double> numbers)` | 返回数字列表中的最大数字。 |
| `double abs(double number)` | 返回数字的绝对值。 |
| `double median(Collection<Double> numbers)` | 返回数字列表的中位数。 |
| `double parseDouble(String string)` | 将字符串转换为double值。 |
| `int parseInt(String string)` | 将字符串转换为整数值。 |

## 区域工具

脚本API还提供用于处理区域设置、国家和语言的工具，可通过`flw.locale`访问。

您可以使用与表达式中相同的功能，使用`flwLocaleUtils`。

以下是可用函数的列表：

| 函数 | 描述 |
| --- | --- |
| `Locale getLocaleForLanguageTag(String languageTag)` | 返回具有给定语言标签的区域设置，例如'ch-DE'。 |
| `List<Locale> getAvailableLocales()` | 返回可用区域设置的列表。 |
| `Locale getDefaultLocale()` | 返回系统默认区域设置。 |
| `List<String> getAllCountryCodes()` | 返回所有2字母ISO国家代码的列表。 |
| `List<String> getAllLanguageCodes()` | 返回所有ISO语言代码的列表，例如"de"（不是"de-CH"）。 |
| `String getLanguageDisplayName(String languageIsoCode, String displayLanguageTag)` | 返回某种语言的单一语言名称，例如"German"或"Spanish"。 |
| `String getCountryDisplayName(String languageTag, String displayLanguageTag)` | 返回某种语言的单一国家名称，例如"Switzerland"或"Germany"。 |
| `List<String> getAllLanguageDisplayNames(String displayLanguageTag)` | 返回某种语言中所有语言名称的列表。 |
| `List<String> getAllCountryDisplayNames(String displayLanguageTag)` | 返回某种语言中所有国家名称的列表。 |

## 格式化工具

脚本API还提供围绕格式化的工具，可通过`flw.format`访问。

您可以使用与表达式中相同的功能，使用`flwFormatUtils`。

以下是可用函数的列表：

| 函数 | 描述 |
| --- | --- |
| `String formatString(String text, Object... substitutes)` | 根据Java格式化程序规范格式化字符串，参见[这里](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html)或[这里](https://docs.oracle.com/javase/tutorial/java/data/numberformat.html)。 |
| `String formatDate(Object value, String dateFormat)` | 使用给定格式将值格式化为字符串。支持的值有Date、Instant、LocalDate、LocaDateTime或ISO8601格式的字符串。 |
| `String formatDecimal(String pattern, double decimal)` | 使用默认区域设置中的十进制格式化程序根据Java格式化程序规范格式化字符串。参见[格式化规范](https://docs.oracle.com/javase/8/docs/api/java/text/DecimalFormat.html)。 |
| `String formatStringWithLocale(String languageTag, String text, Object... substitutes)` | 根据Java格式化程序规范格式化字符串。字符串根据提供的语言标签的区域设置中指定的格式进行格式化。参见[这里](https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html)或[这里](https://docs.oracle.com/javase/tutorial/java/data/numberformat.html)。 |
| `String formatCurrencyWithLocale(String currencyCode, double amount, String languageTag)` | 根据提供的语言标签的区域设置中指定的格式格式化货币金额。 | 