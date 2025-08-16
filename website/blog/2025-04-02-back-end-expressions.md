---
title: Flowable 后端表达式
description: 本文详细介绍了Flowable后端表达式的概念、类型及使用方法，包括值表达式和方法表达式，帮助用户在流程、案例或决策表执行中动态获取或设置变量，实现自定义逻辑。
keywords: Flowable,后端表达式,流程变量,动态任务,统一表达式语言,UEL,Spring bean,自定义逻辑
authors: Flowable中文文档
authorURL: http://flowable.me
---

![后端表达式](/img/blog/back-end-expressions.svg)

## 简介

后端表达式是一种在执行流程、案例或决策表期间获取或设置变量的工具。后端表达式还可以用于实现自定义逻辑，或将该逻辑委托给部署在服务器上的Java服务。使用表达式的示例包括设置动态任务名称、网关后序列流的评估，或创建特定类型的变量。顾名思义，这些表达式在执行期间在后端运行。因此，在评估时它们无法访问前端数据。

在Flowable Design中，表达式可以在带有闪电图标的字段中使用：⚡️

Flowable使用统一表达式语言([`UEL`](https://javaee.github.io/tutorial/jsf-el.html))来解析表达式。UEL的文档是了解语法和可用运算符的良好参考。每个表达式都以${开始，以}结束。

表达式分为两种类型：

1. 值表达式：提供一个值。支持的值包括布尔值、字符串、整数、浮点数和null。典型的值表达式形式为`${variable.property}`或`${bean.property}`。

2. 方法表达式：调用带参数或不带参数的方法。方法表达式的示例为`${bean.setPropertyValue('newValue')}`。为了区分不带参数的值表达式和方法表达式，在方法调用的末尾使用空括号。例如：`${variable.toString()}`。

理论上，任何暴露给应用程序的Spring bean都可以在后端表达式中使用，但并非所有类都能以允许正确表达式评估的方式进行序列化。

> 信息提示
> 某些表达式可在脚本中使用（例如在BPMN或CMMN脚本任务中）。可用表达式的列表可在后端脚本文档中找到。

## 关键字

流程和CMMN引擎支持上下文相关的对象。两种引擎都可以解析层次对象，如root和parent，并可用于访问它们的本地属性。root代表执行层次结构顶部的对象，可以是流程实例或案例实例。parent是对当前对象在层次结构中紧邻上方的第一个流程或案例实例的引用。

对于流程实例和案例实例，definition提供对定义及其所有属性的访问。

在BPMN执行上下文中，额外的保留关键字包括execution和authenticatedUserId：

- execution：引用当前的"执行路径"或"令牌"。它提供对name、businessKey、processDefinitionId和parentExecution等属性的访问（在技术上，它由ExecutionEntity类支持）。

- task：引用当前任务（在技术上，它由TaskEntity类支持）。

- authenticatedUserId：当前认证用户的字符串标识符。如果没有认证用户，该变量将不可用。

CMMN引擎上下文支持task（见上文）、caseInstance和planItemInstance：

- caseInstance：引用当前案例实例。它提供对name、state、businessKey、caseDefinitionId和parentId等属性的访问（在技术上，它由CaseInstanceEntity类支持）。

- planItemInstance：引用与案例关联的计划项实例。 

## 表达式概述

### 流程实例属性

以下属性在流程实例上可用，例如当使用root或parent时。

示例用法：`${root.businessKey}`

| 属性 | 描述 |
|------|------|
| businessKey | 流程实例的业务键（如果已设置） |
| businessStatus | 流程实例的业务状态（如果已设置） |
| callbackId | 如果流程实例是通过CMMN案例实例中的流程任务启动的，此值将引用关联的计划项实例的ID |
| description | 流程实例的描述（如果已设置） |
| definition | 流程定义。详细信息见下文 |
| id | 流程实例的唯一技术标识符 |
| name | 流程实例的名称（如果已设置） |
| startTime | 流程实例启动的时间（java.util.Date类型） |
| startUserId | 启动此流程实例的用户ID |
| tenantId | 此流程实例的租户标识符 |

### 案例实例属性

以下属性在案例实例上可用，例如当使用root或parent时。

示例用法：`${parent.businessStatus}`

| 属性 | 描述 |
|------|------|
| businessKey | 案例实例的业务键（如果已设置） |
| businessStatus | 案例实例的业务状态（如果已设置） |
| callbackId | 如果案例实例是通过CMMN案例实例中的案例任务启动的，此值将引用关联的计划项实例的ID |
| description | 案例实例的描述（如果已设置） |
| definition | 案例定义。详细信息见下文 |
| id | 案例实例的唯一技术标识符 |
| name | 案例实例的名称（如果已设置） |
| startTime | 案例实例启动的时间（java.util.Date类型） |
| startUserId | 启动此案例实例的用户ID |
| tenantId | 此案例实例的租户标识符 |

### 定义属性

| 属性 | 描述 |
|------|------|
| id | 定义的唯一技术标识符 |
| category | 定义的类别（如果在相关模型中设置） |
| deploymentId | 与此定义相关的部署引用。查看部署文档以了解更多信息 |
| description | 定义的描述（如果在模型中配置） |
| key | 定义的键，对于所有类似的模型类型必须是唯一的。对于给定的键，通常在运行时系统中部署多个版本 |
| name | 定义的名称，与BPMN或CMMN模型的名称匹配 |
| tenantId | 部署此定义的租户标识符 |
| version | 定义的版本。每次发布模型时，都会为相同的键创建一个新定义，版本等于最后版本 + 1 |

### 变量函数

变量操作是表达式的重要用例。

设置变量可以通过runtimeService完成：

```java
${runtimeService.setVariable(processInstanceId, variableName, variableValue)}
${cmmnRuntimeService.setVariable(caseInstanceId, variableName, variableValue)}
```

或在关键字对象上（取决于上下文）：

- `${execution.setVariable(varName, varValue)}` 设置当前流程实例的变量varName的值为varValue
- `${caseInstance.setVariable(varName, varValue)}` 设置当前案例实例的变量varName的值为varValue
- `${planItemInstance.setVariable(varName, varValue)}` 设置当前案例实例的变量varName的值为varValue
- `${task.setVariable(varName, varValue)}` 设置当前流程/案例实例的变量varName的值为varValue

以下函数可用于处理变量，适用于BPMN和CMMN上下文：

| 函数 | 描述 |
|------|------|
| `${var:get(varName)}` | 获取变量的值。与直接在表达式中写变量名的主要区别是，使用此函数在变量不存在时不会抛出异常 |
| `${var:getOrDefault(varName, defaultValue)}` | 获取变量值，如果变量不存在则返回默认值 |
| `${var:exists(varName)}` | 检查变量是否存在 |
| `${var:isEmpty(varName)}` | 检查变量值是否为空。根据变量类型，行为如下：对于String变量，如果是空字符串则为空；对于java.util.Collection变量，如果集合没有元素则为真；对于ArrayNode变量，如果没有元素则为真。如果变量为null，始终返回真 |
| `${var:isNotEmpty(varName)}` | isEmpty的反向操作 |
| `${var:equals(varName, value)}` | 检查变量是否等于给定值。这是`${execution.getVariable("varName") != null && execution.getVariable("varName") == value}`的简写函数 |
| `${var:notEquals(varName, value)}` | equals的反向操作 |
| `${var:contains(varName, value1, value2, ...)}` | 检查所有提供的值是否包含在变量中。根据变量类型有不同的行为 |
| `${var:containsAny(varName, value1, value2, ...)}` | 类似于contains函数，但如果任何（而不是所有）传递的值包含在变量中，则返回true |
| `${var:base64(varName)}` | 将Binary或String变量转换为Base64字符串 |
| `${var:lowerThan(varName, value)}` | `${execution.getVariable("varName") != null && execution.getVariable("varName") < value}`的简写。别名 = lt |
| `${var:lowerThanOrEquals(varName, value)}` | 类似，但用于 <= 。别名 = lte |
| `${variables:greaterThan(varName, value)}` | 类似，但用于 > 。别名 = gr |
| `${variables:greaterThanOrEquals(varName, value)}` | 类似，但用于 >= 。别名 = gte |

### 流程分配函数

以下函数在BPMN流程执行上下文中可用：

| 函数 | 描述 |
|------|------|
| `${bpmn:setAssignee(processInstanceId, userId)}` | 将指定processInstanceId的流程的受理人设置为给定的userId |
| `${bpmn:getAssignee()}` | 返回当前流程的受理人 |
| `${bpmn:getAssignee(processInstanceId)}` | 返回指定processInstanceId的流程的受理人 |
| `${bpmn:removeAssignee()}` | 移除当前流程的受理人 |
| `${bpmn:removeAssignee(processInstanceId)}` | 移除指定processInstanceId的流程的受理人 |
| `${bpmn:setOwner(processInstanceId, userId)}` | 将指定processInstanceId的流程的所有者设置为给定的userId |
| `${bpmn:getOwner()}` | 返回当前流程的所有者 |
| `${bpmn:getOwner(processInstanceId)}` | 返回指定processInstanceId的流程的所有者 |
| `${bpmn:removeOwner()}` | 移除当前流程的所有者 |
| `${bpmn:removeOwner(processInstanceId)}` | 移除指定processInstanceId的流程的所有者 |
| `${bpmn:addParticipantUser(processInstanceId, userId)}` | 将给定userId的用户作为参与者添加到指定processInstanceId的流程中 |
| `${bpmn:addParticipantUsers(processInstanceId, userIds)}` | 将给定userIds的用户作为参与者添加到指定processInstanceId的流程中。userIds可以是ArrayNode、Iterable或逗号分隔的userId列表 |
| `${bpmn:removeParticipantUser(processInstanceId, userId)}` | 从指定processInstanceId的流程中移除给定userId的参与者用户 |
| `${bpmn:removeParticipantUsers(processInstanceId, userIds)}` | 从指定processInstanceId的流程中移除给定userIds的参与者用户。userIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |
| `${bpmn:addCandidateUser(processInstanceId, userId)}` | 将给定userId的用户作为候选人添加到指定processInstanceId的流程中 |
| `${bpmn:addCandidateUsers(processInstanceId, userIds)}` | 将给定userIds的用户作为候选人添加到指定processInstanceId的流程中。userIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |
| `${bpmn:removeCandidateUser(processInstanceId, userId)}` | 从指定processInstanceId的流程中移除给定userId的候选人用户 |
| `${bpmn:removeCandidateUsers(processInstanceId, userIds)}` | 从指定processInstanceId的流程中移除给定userIds的候选人用户。userIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |
| `${bpmn:addCandidateGroup(processInstanceId, groupId)}` | 将给定groupId的组作为候选组添加到指定processInstanceId的流程中 |
| `${bpmn:addCandidateGroups(processInstanceId, groupIds)}` | 将给定groupIds的组作为候选组添加到指定processInstanceId的流程中。groupIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |
| `${bpmn:removeCandidateGroup(processInstanceId, groupId)}` | 从指定processInstanceId的流程中移除给定groupId的候选组 |
| `${bpmn:removeCandidateGroups(processInstanceId, groupIds)}` | 从指定processInstanceId的流程中移除给定groupIds的候选组。groupIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |

### 案例分配函数

以下函数在CMMN案例执行上下文中可用：

| 函数 | 描述 |
|------|------|
| `${cmmn:setAssignee(caseInstanceId, userId)}` | 将指定caseInstanceId的案例的受理人设置为给定的userId |
| `${cmmn:getAssignee()}` | 返回当前案例的受理人 |
| `${cmmn:getAssignee(caseInstanceId)}` | 返回指定caseInstanceId的案例的受理人 |
| `${cmmn:removeAssignee()}` | 移除当前案例的受理人 |
| `${cmmn:removeAssignee(caseInstanceId)}` | 移除指定caseInstanceId的案例的受理人 |
| `${cmmn:setOwner(caseInstanceId, userId)}` | 将指定caseInstanceId的案例的所有者设置为给定的userId |
| `${cmmn:getOwner()}` | 返回当前案例的所有者 |
| `${cmmn:getOwner(caseInstanceId)}` | 返回指定caseInstanceId的案例的所有者 |
| `${cmmn:removeOwner()}` | 移除当前案例的所有者 |
| `${cmmn:removeOwner(caseInstanceId)}` | 移除指定caseInstanceId的案例的所有者 |
| `${cmmn:addParticipantUser(caseInstanceId, userId)}` | 将给定userId的用户作为参与者添加到指定caseInstanceId的案例中 |
| `${cmmn:addParticipantUsers(caseInstanceId, userIds)}` | 将给定userIds的用户作为参与者添加到指定caseInstanceId的案例中。userIds可以是ArrayNode、Iterable或逗号分隔的userId列表 |
| `${cmmn:removeParticipantUser(caseInstanceId, userId)}` | 从指定caseInstanceId的案例中移除给定userId的参与者用户 |
| `${cmmn:removeParticipantUsers(caseInstanceId, userIds)}` | 从指定caseInstanceId的案例中移除给定userIds的参与者用户。userIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |
| `${cmmn:addCandidateUser(caseInstanceId, userId)}` | 将给定userId的用户作为候选人添加到指定caseInstanceId的案例中 |
| `${cmmn:addCandidateUsers(caseInstanceId, userIds)}` | 将给定userIds的用户作为候选人添加到指定caseInstanceId的案例中。userIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |
| `${cmmn:removeCandidateUser(caseInstanceId, userId)}` | 从指定caseInstanceId的案例中移除给定userId的候选人用户 |
| `${cmmn:removeCandidateUsers(caseInstanceId, userIds)}` | 从指定caseInstanceId的案例中移除给定userIds的候选人用户。userIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |
| `${cmmn:addCandidateGroup(caseInstanceId, groupId)}` | 将给定groupId的组作为候选组添加到指定caseInstanceId的案例中 |
| `${cmmn:addCandidateGroups(caseInstanceId, groupIds)}` | 将给定groupIds的组作为候选组添加到指定caseInstanceId的案例中。groupIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |
| `${cmmn:removeCandidateGroup(caseInstanceId, groupId)}` | 从指定caseInstanceId的案例中移除给定groupId的候选组 |
| `${cmmn:removeCandidateGroups(caseInstanceId, groupIds)}` | 从指定caseInstanceId的案例中移除给定groupIds的候选组。groupIds可以是TextNode的ArrayNode、String的Iterable或逗号分隔的userId字符串 |

### CMMN函数

以下函数在CMMN上下文中可用：

| 函数 | 描述 |
|------|------|
| `${cmmn:copyLocalVariable(planItemInstance, localVariableName, index, variableName)}` | 将计划项实例的本地变量复制到案例实例 |
| `${cmmn:getTask(taskId)}` | 返回具有提供的ID的任务（运行时或历史） |
| `${cmmn:isPlanItemCompleted(planItemInstance)}` | 此函数评估计划项是否已完成，这很可能用于具有重复规则的计划项，以检查它是否已经完成 |
| `${cmmn:isStageCompletable()}` | 返回当前案例阶段是否可完成（取决于阶段及其元素的配置，参见"自动完成"等） |
| `${cmmn:replaceVariableInList(planItemInstance, variableName, index, listVariableName)}` | 使用variableName引用的变量值更改具有给定listVariableName的列表中提供的索引处的条目 |
| `${cmmn:setBusinessStatus(caseInstanceId, businessStatus)}` | v3.16.0+ 更改匹配提供的caseInstanceId的案例实例的业务状态属性 |
| `${cmmn:triggerCaseEvaluation(<parameter>)}` | 触发案例实例的案例实例哨兵的评估。参数可以是planItemInstance、caseInstance或案例实例的ID |

### BPMN函数

以下函数在BPMN上下文中可用：

| 函数 | 描述 |
|------|------|
| `${bpmn:copyLocalVariable(localVariableName, variableName)}` | 将执行本地变量复制到流程实例 |
| `${bpmn:copyLocalVariableToParent(localVariableName, variableName)}` | 将执行本地变量复制到其父执行 |
| `${bpmn:getTask(taskId)}` | 返回具有提供的ID的任务（运行时或历史） |
| `${bpmn:replaceVariableInList(variableName, index, listVariableName)}` | 使用variableName引用的变量值更改具有给定listVariableName的列表中提供的索引处的条目 |
| `${bpmn:setBusinessStatus(processInstanceId, businessStatus)}` | v3.16.0+ 更改匹配提供的processInstanceId的流程实例的业务状态属性 |
| `${bpmn:triggerCaseEvaluation()}` | 触发作为流程实例父级的案例实例的案例实例哨兵的评估 |

### 字符串工具函数

字符串操作方法是表达式的经典用例。以下方法可用：

| 表达式 | 描述 |
|--------|------|
| `${flwStringUtils.carriageReturn()}` | 返回回车字符 |
| `${flwStringUtils.capitalize(text)}` | 将文本首字母大写。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.contains(text, otherText)}` | 检查字符串是否包含另一个字符串。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.containsIgnoreCase(text, otherText)}` | 检查字符串是否包含另一个字符串（忽略大小写）。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.equals(text, otherText)}` | 检查两个字符串是否相等。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.equalsIgnoreCase(text, otherText)}` | 检查两个字符串是否相等（忽略大小写）。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.escapeHtml(text)}` | 使用HTML实体转义对象中的字符。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.hasText(text)}` | 检查字符串是否包含文本（不为null或空）。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.join(collection, String delimiter)}` | 使用给定的分隔符将列表或集合的所有条目连接成单个字符串。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.matches(text, regularExpression)}` | 检查文本是否匹配正则表达式。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.newline()}` | 返回换行符 |
| `${flwStringUtils.substring(text, from, to)}` | 返回提供的字符范围内的子字符串。索引从0开始，from包含在内，to不包含在内。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.substringFrom(text, from)}` | 返回从给定位置开始的文本（索引从0开始）。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.split(text, delimiter)}` | 使用给定的分隔符将文本分割成集合。分隔符可以是单个字符（如分号）或正则表达式。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.toLowerCase(text)}` | 将字符串的所有字符转换为小写 |
| `${flwStringUtils.toUpperCase(text)}` | 将字符串的所有字符转换为大写 |
| `${flwStringUtils.trimWhitespace(text)}` | 删除文本中的所有前导和尾随空格。支持的值类型有String、Json TextNode或null |
| `${flwStringUtils.unescapeHtml(text)}` | 将包含实体转义的字符串转换为包含对应Unicode字符的字符串。支持的值类型有String、Json TextNode或null |

### 日期和时间工具函数

以下是可用的日期和时间操作函数：

#### 基本操作

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.now()}` | 返回UTC时区的当前日期和时间 |
| `${flwTimeUtils.currentDate()}` | 返回UTC时区00:00 AM的当前日期，返回类型为Instant |
| `${flwTimeUtils.currentLocalDate()}` | 返回系统时区（UTC）的当前日期，返回类型为LocalDate |
| `${flwTimeUtils.currentLocalDateTime()}` | 返回系统时区（UTC）的当前日期和时间，返回类型为LocalDateTime |

#### 转换函数

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.instantFromTimestamp(long timestamp)}` | 从Unix时间戳（自1970年1月1日起的秒数）创建Instant |
| `${flwTimeUtils.dateFromTimestamp(long timestamp)}` | 从Unix时间戳创建Date |
| `${flwTimeUtils.parseInstant(Date date)}` | 将Date转换为Instant |
| `${flwTimeUtils.parseInstant(String instantIsoString)}` | 将ISO8601格式的字符串解析为Instant |
| `${flwTimeUtils.parseInstant(Object value, String pattern)}` | 使用指定模式将对象解析为Instant |
| `${flwTimeUtils.parseLocalDate(Object value, String pattern)}` | 使用指定模式将对象解析为LocalDate |
| `${flwTimeUtils.parseLocalDateTime(Object value, String pattern)}` | 使用指定模式将对象解析为LocalDateTime |

#### 类型转换函数

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.asInstant(Object value)}` | 将值转换为UTC时区的Instant |
| `${flwTimeUtils.asInstant(Object value, String timeZoneId)}` | 将值转换为指定时区的Instant |
| `${flwTimeUtils.asLocalDate(Object value)}` | 将值转换为UTC时区的LocalDate |
| `${flwTimeUtils.asLocalDate(Object value, String timeZoneId)}` | 将值转换为指定时区的LocalDate |
| `${flwTimeUtils.asLocalDateTime(Object value)}` | 将值转换为UTC时区的LocalDateTime |
| `${flwTimeUtils.asLocalDateTime(Object value, String timeZoneId)}` | 将值转换为指定时区的LocalDateTime |
| `${flwTimeUtils.asDate(Object value)}` | 将值转换为UTC时区的Date |

#### 时间操作函数

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.atTime(Object value, int hours, int minutes, int seconds)}` | 在UTC时区设置指定时间的小时、分钟和秒 |
| `${flwTimeUtils.atTimeWithTimeZone(Object value, int hours, int minutes, int seconds, String timeZoneId)}` | 在指定时区设置指定时间的小时、分钟和秒 |
| `${flwTimeUtils.atTimeZone(Object value, String timeZoneId)}` | 返回指定时区的Instant（仅用于显示，不要用于存储） |
| `${flwTimeUtils.getAvailableTimeZoneIds()}` | 返回可用时区ID列表 |
| `${flwTimeUtils.getField(Object value, String chronoFieldString)}` | 获取指定ChronoField的时间片段 |
| `${flwTimeUtils.isWeekend(Object value)}` | 判断给定值是否为周末 |

#### 日期时间创建函数

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.fullDateTimeInstant(int year, int month, int day, int hour, int minute, int second)}` | 在UTC时区创建具有给定值的Instant |
| `${flwTimeUtils.fullDateTimeDate(int year, int month, int day, int hour, int minute, int second)}` | 创建具有给定值的Date |

#### 时间增加函数

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.plusSeconds(Object value, long seconds)}` | 添加秒数 |
| `${flwTimeUtils.plusMinutes(Object value, long minutes)}` | 添加分钟数 |
| `${flwTimeUtils.plusHours(Object value, long hours)}` | 添加小时数 |
| `${flwTimeUtils.plusDays(Object value, long days)}` | 添加天数 |
| `${flwTimeUtils.plusWeeks(Object value, long weeks)}` | 添加周数 |
| `${flwTimeUtils.plusMonths(Object value, long months)}` | 添加月数 |
| `${flwTimeUtils.plusYears(Object value, long years)}` | 添加年数 |
| `${flwTimeUtils.plusDuration(Object value, String iso8601Duration)}` | 添加ISO8601编码的持续时间 |

#### 时间减少函数

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.minusSeconds(Object value, long seconds)}` | 减少秒数 |
| `${flwTimeUtils.minusMinutes(Object value, long minutes)}` | 减少分钟数 |
| `${flwTimeUtils.minusHours(Object value, long hours)}` | 减少小时数 |
| `${flwTimeUtils.minusDays(Object value, long days)}` | 减少天数 |
| `${flwTimeUtils.minusWeeks(Object value, long weeks)}` | 减少周数 |
| `${flwTimeUtils.minusMonths(Object value, long months)}` | 减少月数 |
| `${flwTimeUtils.minusYears(Object value, long years)}` | 减少年数 |
| `${flwTimeUtils.minusDuration(Object value, String iso8601Duration)}` | 减少ISO8601编码的持续时间 |

#### 时间比较和计算函数

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.secondsOfDuration(String iso8601Duration)}` | 返回ISO持续时间字符串中的秒数 |
| `${flwTimeUtils.isBefore(Object firstValue, Object secondValue)}` | 检查第一个值是否在第二个值之前 |
| `${flwTimeUtils.isBeforeOrEqual(Object firstValue, Object secondValue)}` | 检查第一个值是否在第二个值之前或等于第二个值 |
| `${flwTimeUtils.isAfter(Object firstValue, Object secondValue)}` | 检查第一个值是否在第二个值之后 |
| `${flwTimeUtils.isAfterOrEqual(Object firstValue, Object secondValue)}` | 检查第一个值是否在第二个值之后或等于第二个值 |
| `${flwTimeUtils.areEqual(Object firstValue, Object secondValue)}` | 检查两个值是否相等 |
| `${flwTimeUtils.isBeforeTime(Object value, String timeZoneId, int hours, int minutes, int seconds)}` | 检查给定值是否在指定时区的某个时间之前 |
| `${flwTimeUtils.isAfterTime(Object value, String timeZoneId, int hours, int minutes, int seconds)}` | 检查给定值是否在指定时区的某个时间之后 |

#### 时间间隔计算函数

| 表达式 | 描述 |
|--------|------|
| `${flwTimeUtils.getFieldFromDurationBetweenDates(Object firstValue, Object secondValue, String chronoUnitString)}` | 返回两个值之间的持续时间 |
| `${flwTimeUtils.secondsBetween(Object firstValue, Object secondValue)}` | 返回两个值之间的秒数 |
| `${flwTimeUtils.minutesBetween(Object firstValue, Object secondValue)}` | 返回两个值之间的分钟数 |
| `${flwTimeUtils.hoursBetween(Object firstValue, Object secondValue)}` | 返回两个值之间的小时数 |
| `${flwTimeUtils.daysBetween(Object firstValue, Object secondValue)}` | 返回两个值之间的天数 |
| `${flwTimeUtils.weeksBetween(Object firstValue, Object secondValue)}` | 返回两个值之间的周数 |
| `${flwTimeUtils.monthsBetween(Object firstValue, Object secondValue)}` | 返回两个值之间的月数 |
| `${flwTimeUtils.yearsBetween(Object firstValue, Object secondValue)}` | 返回两个值之间的年数 |
| `${flwTimeUtils.getTimeZoneOffset(Object value, String timeZoneId)}` | 计算指定时区的特定时间点与UTC的秒数偏移量 |

> 注意：对于大多数函数，支持的值类型包括Date、Instant、LocalDate、LocalDateTime或ISO8601格式的字符串。不同类型的值会在需要时自动转换。 

### JSON工具函数

以下函数在BPMN和CMMN上下文中处理JSON对象时可用：

| 表达式 | 描述 |
|--------|------|
| `${json:object()}` | 返回一个空的JSON对象 |
| `${json:array()}` | 返回一个空的JSON数组 |
| `${json:arrayWithSize(size)}` | 返回指定大小的JSON数组 |
| `${json:addToArray(arrayNode, object)}` | 将给定对象添加到给定的数组节点中 |

### 格式化工具函数

以下方法用于格式化值：

| 表达式 | 描述 |
|--------|------|
| `${flwFormatUtils.formatString(text, substitutes)}` | 根据Java格式化器规范格式化字符串 |
| `${flwFormatUtils.formatDate(value, dateFormat)}` | 使用给定格式将值格式化为字符串。支持Date、Instant、LocalDate、LocalDateTime或ISO8601格式的字符串 |
| `${flwFormatUtils.formatDecimal(pattern, decimal)}` | 使用默认区域设置的十进制格式化器根据Java格式化器规范格式化字符串 |
| `${flwFormatUtils.formatStringWithLocale(languageTag, text, substitutes)}` | 根据Java格式化器规范格式化字符串。字符串根据提供的语言标签的区域设置格式进行格式化 |
| `${flwFormatUtils.formatCurrencyWithLocale(currencyCode, amount, languageTag)}` | 根据提供的语言标签的区域设置格式化货币金额 |

示例：`${flwFormatUtils.formatDate(flwTimeUtils.now(), 'dd.MM.yyyy')}` 将今天的日期格式化为dd.MM.yyyy格式

### 区域设置工具函数

| 表达式 | 描述 |
|--------|------|
| `${flwLocaleUtils.getLocaleForLanguageTag(languageTag)}` | 返回具有给定语言标签的区域设置，例如'ch-DE' |
| `${flwLocaleUtils.getAvailableLocales()}` | 返回可用区域设置列表 |
| `${flwLocaleUtils.getDefaultLocale()}` | 返回系统默认区域设置 |
| `${flwLocaleUtils.getAllCountryCodes()}` | 返回所有2字母ISO国家代码列表 |
| `${flwLocaleUtils.getAllLanguageCodes()}` | 返回所有ISO语言代码列表，例如"de"（不是"de-CH"） |
| `${flwLocaleUtils.getLanguageDisplayName(languageIsoCode, displayLanguageTag)}` | 返回某种语言的单一语言名称，例如"German"或"Spanish" |
| `${flwLocaleUtils.getCountryDisplayName(languageTag, displayLanguageTag)}` | 返回某种语言的单一国家名称，例如"Switzerland"或"Germany" |
| `${flwLocaleUtils.getAllLanguageDisplayNames(displayLanguageTag)}` | 返回某种语言的所有语言名称列表 |
| `${flwLocaleUtils.getAllCountryDisplayNames(displayLanguageTag)}` | 返回某种语言的所有国家名称列表 |

### 数学工具函数

以下方法用于执行数学运算：

| 表达式 | 描述 |
|--------|------|
| `${flwMathUtils.abs(number)}` | 返回数字的绝对值 |
| `${flwMathUtils.average(numbers)}` | 计算数字列表的平均值 |
| `${flwMathUtils.ceil(number)}` | 返回提供的数字的下一个更高整数 |
| `${flwMathUtils.floor(number)}` | 返回提供的数字的下一个更低整数 |
| `${flwMathUtils.median(numbers)}` | 返回数字列表的中位数 |
| `${flwMathUtils.min(numbers)}` | 返回数字列表中的最小数 |
| `${flwMathUtils.max(numbers)}` | 返回数字列表中的最大数 |
| `${flwMathUtils.parseDouble(string)}` | 将字符串转换为双精度值 |
| `${flwMathUtils.parseInt(string)}` | 将字符串转换为整数值 |
| `${flwMathUtils.round(number)}` | 将数字四舍五入为整数值 |
| `${flwMathUtils.round(number, scale)}` | 使用RoundingMode#HALF_UP将数字四舍五入到最多小数位数 |
| `${flwMathUtils.sum(numbers)}` | 计算数字列表的总和 |

### 用户函数

以下方法可用于检索用户信息：

| 表达式 | 描述 |
|--------|------|
| `${findUser(userId)}` | 返回与传递的ID对应的用户表示 |
| `${findGroupMemberUserIds('GROUP_A, GROUP_B')}` | v3.14.0+ 返回给定组成员的userIds的字符串集合。注意：字符串集合String应该只是暂时存储，如果要将其作为变量持久化，需要将其转换为JSON |
| `${findGroupMemberEmails('GROUP_A, GROUP_B')}` | v3.14.0+ 返回给定组成员的电子邮件的字符串集合。忽略没有电子邮件的用户 |
| `${isUserInAllGroups(userId, groupKeys)}` | 如果给定的userId在具有给定键的提供组中，则返回true |
| `${isUserInAnyGroup(userId, groupKeys)}` | 如果给定的userId在具有给定键的提供组中的任何一个中，则返回true |
| `${isUserInNoGroup(userId, groupKeys)}` | 如果给定的userId不在具有给定键的提供组中的任何一个中，则返回true |
| `${userInfo:findUserInfo(property, findUser(authenticatedUserId))}` | 返回当前用户的给定用户信息属性 |
| `${userInfo:findBooleanUserInfo(property, findUser(authenticatedUserId))}` | 返回当前用户的给定布尔用户信息属性 |

### 任务服务

任务服务可以在表达式中用于以编程方式与任务交互：

| 表达式 | 描述 |
|--------|------|
| `${taskService.claim(taskId, userId)}` | 由具有提供的用户ID的用户认领给定ID的任务 |
| `${taskService.unclaim(taskId)}` | 取消认领已认领的任务 |
| `${taskService.complete(taskId, userId, variables)}` | 完成给定的任务。userId和variables（String到Objects的Map）是可选的 |
| `${taskService.setDueDate(taskId, userId)}` | 为任务设置截止日期 |
| `${taskService.setPriority(taskId, userId)}` | 为任务设置优先级 |
| `${taskService.setAssignee(taskId, userId)}` | 将给定的userId设置为任务的受理人 |
| `${taskService.setOwner(taskId, userId)}` | 将给定的userId设置为任务的所有者 |
| `${taskService.addCandidateUser(taskId, userId)}` | 将给定的userId添加为任务的候选用户 |
| `${taskService.addCandidateGroup(taskId, userId)}` | 将给定的groupId添加为任务的候选组 |
| `${taskService.addUserIdentityLink(taskId, userId, identityLink)}` | 向给定任务添加用户身份链接 |
| `${taskService.addGroupIdentityLink(taskId, groupId, identityLink)}` | 向给定任务添加组身份链接 |

### 序列模型

在使用序列模型时，经常需要在BPMN或CMMN实例的活动名称中生成这些数字。以下函数可用于此目的：

| 表达式 | 描述 |
|--------|------|
| `${seq:nextNumber(<parameter>, sequenceDefinitionKey)}` | 返回序列的下一个数字。参数应该是具有对当前变量访问权限的运行时对象，如流程实例、案例实例、执行、任务、计划项实例等。sequenceDefinitionKey应与模型中设置的键匹配 |
| `${seq:next(<parameter>, sequenceDefinitionKey)}` | 与前一个类似，但也考虑了在模型中设置的格式配置设置 |

### 配置服务

配置服务允许访问配置属性（例如在application.properties文件或类似文件中设置的属性）。在表达式中，此服务很有用，因为它允许根据环境特定属性（例如DEV、TEST、PROD环境）更改行为。

| 表达式 | 描述 |
|--------|------|
| `${propertyConfigurationService.getProperty(key, defaultValue)}` | 返回配置属性的字符串值 |
| `${propertyConfigurationService.getBooleanProperty(key, defaultValue)}` | 返回配置属性的布尔值 |
| `${propertyConfigurationService.getIntegerProperty(key, defaultValue)}` | 返回配置属性的整数值 |

### 认证令牌

这个高级表达式在使用外部服务和OAuth时很有用。显然，在表达式中硬编码凭据是不可取的。此表达式将帮助解决这个问题：

`${flwAuthTokenUtils.getAccessToken('externalServiceId')}` - 注意：当给定的externalServiceId有可用的Spring Security OAuth2客户端配置时，解析该外部服务ID的访问令牌。

### 集合工具

以下选项用于处理集合或ContentItem列表：

| 表达式 | 描述 |
|--------|------|
| `${flwCollectionUtils.emptyNode()}` | 创建一个空的JSON对象节点 |
| `${flwCollectionUtils.emptyList()}` | 创建一个空的Java List。结果不应直接存储为非瞬态变量 |
| `${flwCollectionUtils.emptyMap()}` | 创建一个空的Java Map。结果不应直接存储为非瞬态变量 |
| `${flwCollectionUtils.distinct(list)}` | 从Java列表中删除重复元素。结果只应为ContentItems存储为非瞬态变量 |
| `${flwCollectionUtils.listWithElements(itemOne, itemTwo, ...)}` | 创建包含多个元素的Java列表。结果只应为ContentItem存储为非瞬态变量 |
| `${flwCollectionUtils.mergeCollections(collection1, collection2, ...)}` | 将多个Java集合合并为单个列表。结果只应为ContentItem存储为非瞬态变量 |

> 注意：当使用Java的List或Map时，它们将作为可序列化对象存储在Flowable数据库中。这意味着它们将存储在字节数组表中，对于大量数据可能会变得效率低下。ContentItem列表是唯一的例外。 

## 表达式自定义

### 使用场景

让我们考虑一个实际的例子：假设有一个依赖于公司部门的流程实例。用户任务的分配取决于流程实例在哪个部门执行。表达式是确定受理人的自然方式。

假设有一个作为流程实例变量的部门引用。给定部门ID后，可以用它来查找部门成员，并使用该信息来确定给定流程的受理人。

### 使用Bean实现

扩展表达式功能最直接的方式是暴露一个带有方法的Spring Bean。默认情况下，表达式可以包含Spring Bean引用。

在Spring配置中的Bean定义：

```java
@Bean
public DepartmentResolver departmentResolver() {
    return new DepartmentResolver();
}
```

这是一个简单的解析器示例：

```java
public class DepartmentResolver {
    public String getAssignee(ExecutionEntity execution) {
        String departmentId = execution.getVariable("departmentId", String.class);
        return departmentId + ".assignee";
    }
}
```

最后一步是在流程定义中使用这个Bean：

```xml
<process id="oneTaskProcess">
  <startEvent id="start"/>
  <sequenceFlow id="flow1" sourceRef="start" targetRef="theTask"/>
  <userTask id="theTask" name="My Task" flowable:assignee="${departmentResolver.getAssignee(execution)}"/>
  <sequenceFlow id="flow2" sourceRef="theTask" targetRef="theEnd" />
  <endEvent id="theEnd"/>
</process>
```

下面的JUnit测试验证了用户任务受理人是否来自DepartmentResolver：

```java
@Test
@Deployment(resources = "AssigneeExpressionBeanTest.oneTaskProcessWithBeanAssignment.bpmn20.xml")
public void springBeanAssignUserTask() {
    ProcessInstance processInstance = runtimeService.startProcessInstanceByKey("oneTaskProcess", 
        Collections.singletonMap("departmentId", "testDepartmentId"));
    Task task = taskService.createTaskQuery().processInstanceId(processInstance.getId()).singleResult();
    assertThat(task.getAssignee()).isEqualTo("testDepartmentId.assignee");
}
```

对于CMMN示例，请参考`SpringCustomBeanTest`及其相关文件和资源。

### 使用表达式解析器实现

使用表达式Bean（如`${departmentResolver.getAssignee(execution)}`）非常容易，但它们不是一等公民表达式。它们需要执行方法调用并将execution作为参数传入方法。为了避免这一步，我们可以使用简单的受理人表达式格式`${departmentAssignee}`。这需要扩展引擎表达式管理器中的表达式解析器（ELResolvers）。

```java
@Bean
public SpringProcessEngineConfiguration processEngineConfiguration(ApplicationContext applicationContext, 
    DataSource dataSource, PlatformTransactionManager transactionManager) {
    SpringProcessEngineConfiguration configuration = new SpringProcessEngineConfiguration();
    configuration.setDataSource(dataSource);
    configuration.setTransactionManager(transactionManager);
    configuration.setDatabaseSchemaUpdate("true");
    configuration.setExpressionManager(new CustomExpressionManager(applicationContext, Collections.emptyMap()));
    return configuration;
}
```

CustomExpressionManager通过新的部门特定ELResolver扩展了可用的ELResolvers集合：

```java
public static class CustomExpressionManager extends SpringExpressionManager {
    @Override
    protected ELResolver createElResolver(VariableContainer variableContainer) {
        CompositeELResolver compositeElResolver = new CompositeELResolver();
        compositeElResolver.add(createVariableElResolver(variableContainer));
        compositeElResolver.add(createSpringElResolver());
        compositeElResolver.add(new ArrayELResolver());
        compositeElResolver.add(new ListELResolver());
        compositeElResolver.add(new MapELResolver());
        compositeElResolver.add(new JsonNodeELResolver());
        compositeElResolver.add(new BeanELResolver());
        compositeElResolver.add(new DepartmentELResolver(variableContainer));
        compositeElResolver.add(new CouldNotResolvePropertyELResolver());
        return compositeElResolver;
    }
}
```

DepartmentELResolver解析"departmentAssignee"关键字并返回其关联的部门特定值：

```java
public static class DepartmentELResolver extends VariableContainerELResolver {
    public DepartmentELResolver(VariableContainer variableContainer) {
        super(variableContainer);
    }

    @Override
    public Object getValue(ELContext context, Object base, Object property) {
        if (base == null && "departmentAssignee".equals(property) && variableContainer instanceof ExecutionEntity) {
            Object departmentId = variableContainer.getVariable("departmentId");
            if (departmentId == null) {
                throw new RuntimeException("departmentId was not found in execution " + 
                    ((ExecutionEntity) variableContainer).getId());
            }
            context.setPropertyResolved(true);
            return getDepartmentAssignee(departmentId);
        }
        return null;
    }

    protected String getDepartmentAssignee(Object departmentId) {
        return departmentId + ".assignee";
    }

    @Override
    public boolean isReadOnly(ELContext context, Object base, Object property) {
        return true;
    }
}
```

现在流程模型用户任务规范变为：

```xml
<userTask id="theTask" name="My Task" flowable:assignee="${departmentAssignee}"/>
```

### 设置值

到目前为止，所有表达式示例都只是返回值。但是，表达式也可以用来改变值。例如，给定这个人工任务案例模型：

```xml
<case id="oneHumanTaskCase">
    <casePlanModel id="myPlanModel" name="My CasePlanModel">
        <planItem id="planItem1" name="The Task" definitionRef="theTask" />
        <humanTask id="theTask" name="The Task" isBlocking="true" flowable:assignee="johnDoe"/>
    </casePlanModel>
</case>
```

可以在不使用任何表达式的情况下更新案例实例变量，如下面的JUnit测试所示：

```java
@Test
@CmmnDeployment(resources = "org/flowable/cmmn/test/task/CmmnTaskServiceTest.testOneHumanTaskCase.cmmn")
public void testOneHumanTaskCaseScopeExpression() {
    // 创建带有一个人工任务的案例实例
    CaseInstance caseInstance = cmmnRuntimeService.createCaseInstanceBuilder()
                    .caseDefinitionKey("oneHumanTaskCase")
                    // 创建变量并设置其值。默认表达式管理器允许变量更新
                    .variable("variableToUpdate", "VariableValue")
                    .start();
    Task task = cmmnTaskService.createTaskQuery().caseInstanceId(caseInstance.getId()).singleResult();

    // 完成任务并更新案例实例中的变量
    cmmnTaskService.complete(task.getId(), Collections.singletonMap(
            "${variableToUpdate}", "updatedVariableValue"
        )
    );
    HistoricCaseInstance historicCaseInstance = cmmnHistoryService
                    .createHistoricCaseInstanceQuery()
                    .caseInstanceId(caseInstance.getId())
                    .includeCaseVariables().singleResult();
    assertThat(historicCaseInstance.getCaseVariables().get("variableToUpdate"), is("updatedVariableValue"));
}
```

代码将变量`variableToUpdate`添加到案例中，值为"VariableValue"。在任务完成时，`VariableContainerELResolver`解析表达式`${variableToUpdate}`并为变量设置新值"updatedVariableValue"。`assertThat()`验证这确实发生了。

更多设置值的表达式示例可以在[`CmmnTaskServiceTest`](https://github.com/flowable/flowable-engine/blob/032ce669d079f9971fadd33dbf3bb6430f534801/modules/flowable-cmmn-engine/src/test/java/org/flowable/cmmn/test/task/CmmnTaskServiceTest.java)中找到。 