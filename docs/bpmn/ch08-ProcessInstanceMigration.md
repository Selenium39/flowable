---
id: ch08-ProcessInstanceMigration
title: 流程实例迁移
description: 本文详细介绍Flowable引擎的流程实例迁移功能，帮助用户将运行中的流程实例无缝迁移到新版本的流程定义，包含简单示例、活动映射迁移及支持场景等实用内容。
keywords: Flowable,BPMN,流程实例迁移,流程定义版本,用户任务,活动映射,运行中流程
---

当流程定义更新到新版本时，就会出现一个问题：对于使用旧版本流程定义的正在运行的流程实例应该如何处理。
如果需要将正在运行的流程实例迁移到另一个流程定义版本，你可以使用 Flowable 引擎提供的流程实例迁移功能。

## 简单示例

让我们从一个简单的示例开始，来解释 Flowable 引擎中流程实例迁移的基础知识。
在这个简单示例中，我们使用以下用例：

-   有一个正在运行的流程实例，其流程定义的 key 名为 simpleTasks，它由一个开始事件 - 用户任务1 - 结束事件组成。

-   该运行中的流程实例当前处于用户任务1的活动状态。

-   部署了一个具有相同 key（simpleTasks）的新流程定义，新的流程定义现在由开始事件 - 用户任务1 - 用户任务2 - 结束事件组成。

-   需要将运行中的流程实例迁移到新的流程定义。

要测试流程实例是否可以无问题地迁移，可以使用以下代码：

    ProcessInstanceMigrationValidationResult validationResult = runtimeService.createProcessInstanceMigrationBuilder()
        .migrateToProcessDefinition(version2ProcessDef.getId())
        .validateMigration(processInstanceToMigrate.getId());

    boolean isMigrationValid = validationResult.isMigrationValid();

流程实例迁移构建器可用于验证并（正如我们稍后将看到的）迁移一个或多个流程实例。
在这个例子中，我们测试运行中的流程实例是否可以迁移到包含2个用户任务的新流程定义版本。
由于两个流程定义版本之间的用户任务 ID 没有发生变化，因此流程实例可以在不需要任何额外映射配置的情况下进行迁移。
因此，迁移验证将返回 true 值。这意味着我们可以执行实际的迁移而不会出现预期之外的问题。

    ProcessInstanceMigrationValidationResult validationResult = runtimeService.createProcessInstanceMigrationBuilder()
        .migrateToProcessDefinition(version2ProcessDef.getId())
        .migrate(processInstanceToMigrate.getId());

执行迁移方法后，运行中的流程实例将被迁移到新的流程定义（包括历史信息）。
这意味着当用户任务1完成后，用户任务2将成为运行中流程实例的下一个活动状态。

## 使用活动迁移映射进行迁移

在简单示例中，用户任务1被自动映射到新流程定义版本中的相同用户任务。
但在某些情况下，运行中流程实例的当前活动在新流程定义中可能已不存在，或者由于其他原因需要将活动迁移到另一个活动。
对于这种用例，流程实例迁移构建器允许你指定一个特定的活动迁移映射列表。

    ProcessInstanceMigrationValidationResult validationResult = runtimeService.createProcessInstanceMigrationBuilder()
        .migrateToProcessDefinition(version2ProcessDef.getId())
        .addActivityMigrationMapping("userTask1Id", "userTask2Id")
        .migrate(processInstanceToMigrate.getId());

在这个例子中，处于用户任务1活动状态的运行中流程实例将被迁移到包含2个用户任务的新流程定义版本，且其活动状态将被迁移到用户任务2。
这意味着当用户任务2完成后，流程实例将结束。

## 支持的流程实例迁移场景

本节概述了流程实例迁移支持的场景。
如果你要找的场景尚未得到支持，请查看下一节中即将支持的内容。

-   将等待状态（用户任务、接收任务、中间捕获事件）自动迁移到新流程定义版本中具有相同ID的活动。

-   通过为运行中流程实例的特定活动状态指定目标活动来手动迁移等待状态。

-   将等待状态迁移到具有边界定时器、信号或消息事件的活动。

-   将带有边界定时器、信号或消息事件的等待状态迁移到没有边界事件的活动。

-   将等待状态迁移到嵌入式子流程或嵌套的嵌入式子流程中的活动。

-   将嵌入式子流程或嵌套的嵌入式子流程中的等待状态迁移到流程定义的根级别或另一个嵌套作用域。

-   将等待状态迁移到（嵌套的）事件子流程中的活动，支持中断和非中断两种类型。

-   在使用并行或包容网关时，将多个执行实例迁移到网关作用域之外的单个执行实例。

-   将单个执行实例迁移到并行或包容网关内的多个执行实例。

-   将等待状态迁移到父流程中的活动。

## 即将支持的流程实例迁移功能

在这个版本的 Flowable 引擎中，已经添加了流程实例迁移支持的第一步。在下一个版本中，将重点添加对以下迁移场景的支持：

-   支持将多实例执行的集合迁移到另一个活动。

-   支持将等待状态迁移到多实例活动。

-   支持在流程定义中存在一个或多个调用活动时，将等待状态迁移到子流程中的活动。

-   支持在流程实例或本地执行作用域中添加和删除变量。

-   支持定义目标用户任务的分配规则和其他配置选项。
