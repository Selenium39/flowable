---
id: ch07-architecture
title: 架构
description: 本文详细介绍Flowable CMMN引擎的架构设计，包括其核心组件、共享服务机制以及与BPMN引擎的差异，帮助开发者理解CMMN引擎的工作原理和内部流程。
keywords: Flowable,CMMN引擎,架构设计,共享服务,BPMN引擎,计划项实例,CommandInterceptors,EvaluateCriteriaOperation
---

本章从高层次的角度简要介绍 CMMN 引擎的内部结构。当然，由于 CMMN 引擎代码是开源的，通过深入研究源代码可以找到实际的实现细节。

CMMN 引擎（如下图所示）是 Flowable 引擎生态系统中的一个引擎，其设计方式与其他引擎类似。CMMN 引擎建立在 CMMN 特定服务和共享服务之上：任务、变量、身份和作业服务，这些服务独立于引擎。在较低层面，实体和数据管理器层负责处理底层持久化，这与其他引擎相同。

![cmmn.architecture](assets/cmmn/cmmn.architecture.png)

通过使用共享服务，这也意味着来自 BPMN 和 CMMN 引擎的任务最终会聚合在一起，可以通过相同的 API 进行查询和管理。异步执行器也是类似的：定时器和异步作业使用相同的逻辑，甚至可以由中央执行器管理。

共享服务架构有第二个好处。当引擎一起使用时（这种情况很常见），引擎会尽可能共享资源，数据库事务会跨越多个引擎操作的调用，查找缓存是通用的，持久化独立于引擎本身处理。

CMMN 引擎的设计原则与 Flowable 项目的其他引擎相同。下图给出了使用 CMMN 引擎时涉及的不同组件的高层次概述：

![cmmn.api call flow](assets/cmmn/cmmn.api-call-flow.png)

从高层次来看：

-   **CmmnEngine** 实例是从 **CmmnEngineConfiguration** 创建的。配置实例可以通过配置文件或以编程方式创建。

-   *CmmnEngine* 以服务的形式提供对 Flowable CMMN API 的访问：**CmmnRepositoryService**、**CmmnRuntimeService**、**CmmnTaskService**、**CmmnHistoryService**、**CmmnManagementService**。这些服务的命名和职责与其他引擎类似。

-   每个 API 方法都会转换为一个 **Command** 实例。这个 *Command* 实例被传递给 **CommandExecutor**，后者会让它通过一系列 **CommandInterceptors**。这些拦截器有各种职责，包括处理事务。

-   最终，*Command*（除非是纯数据修改 *Command*）通常会在 **CmmnEngineAgenda** 上计划一个 **CmmnOperation**。

-   操作会从 *CmmnEngineAgenda* 中获取，直到没有更多操作为止。通常，一个操作会作为其逻辑的一部分计划新的操作。

-   操作中的逻辑将调用较低层次的服务和/或实体管理器。

BPMN 和 CMMN 引擎之间的一个重大区别是 BPMN 引擎通常是"局部的"：引擎查看当前状态，检查流程中的下一步并继续（当然这是一个简化说法，有很多操作并不适用这种情况，但从概念上做出区分是正确的）。CMMN 引擎的工作方式不同：在 CMMN 中，数据扮演着重要角色，数据的变化可以在案例定义的各个地方触发许多事情。因此，每当发生变化时，**EvaluateCriteriaOperation** 都会被频繁地计划和执行。当引擎检测到重复或无用的评估时，会对这些评估进行优化。

CMMN 引擎工作的核心是 **Plan item instance**（计划项实例）的概念，它表示当前在案例中"活跃"的*计划项*及其状态。与 BPMN 很不同的是，CMMN 为计划项定义了严格的状态生命周期。这体现在 *CmmnRuntimeService* 方法、查询 API 和 **PlanItemInstance** 对象的数据字段部分中。

可以通过为议程包设置调试日志来检查议程、操作以及计划项实例的处理方式。例如，当使用 log4j 时：

    log4j.logger.org.flowable.cmmn.engine.impl.agenda=DEBUG

这会产生如下日志：

    Planned [Init Plan Model] initializing plan model for case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122
    Planned [Change PlanItem state] Task A (id: planItemTaskA), new state: [available] with transition [create]
    Planned [Change PlanItem state] PlanItem Milestone One (id: planItemMileStoneOne), new state: [available] with transition [create]
    Planned [Change PlanItem state] Task B (id: planItemTaskB), new state: [available] with transition [create]
    Planned [Change PlanItem state] PlanItem Milestone Two (id: planItemMileStoneTwo), new state: [available] with transition [create]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'create' having fired for plan item planItemTaskA (Task A)
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'create' having fired for plan item planItemMileStoneOne (PlanItem Milestone One)
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'create' having fired for plan item planItemTaskB (Task B)
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'create' having fired for plan item planItemMileStoneTwo (PlanItem Milestone Two)
    Planned [Activate PlanItem] Task A (planItemTaskA)
    Planned [Change PlanItem state] Task A (id: planItemTaskA), new state: [active] with transition [start]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'start' having fired for plan item planItemTaskA (Task A)
    Planned [Change PlanItem state] Task A (id: planItemTaskA), new state: [completed] with transition [complete]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'complete' having fired for plan item planItemTaskA (Task A)
    Planned [Activate PlanItem] PlanItem Milestone One (planItemMileStoneOne)
    Planned [Change PlanItem state] PlanItem Milestone One (id: planItemMileStoneOne), new state: [active] with transition [start]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'start' having fired for plan item planItemMileStoneOne (PlanItem Milestone One)
    Planned [Change PlanItem state] PlanItem Milestone One (id: planItemMileStoneOne), new state: [completed] with transition [occur]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'occur' having fired for plan item planItemMileStoneOne (PlanItem Milestone One)
    Planned [Activate PlanItem] Task B (planItemTaskB)
    Planned [Change PlanItem state] Task B (id: planItemTaskB), new state: [active] with transition [start]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'start' having fired for plan item planItemTaskB (Task B)
    Planned [Change PlanItem state] Task B (id: planItemTaskB), new state: [completed] with transition [complete]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'complete' having fired for plan item planItemTaskB (Task B)
    Planned [Activate PlanItem] PlanItem Milestone Two (planItemMileStoneTwo)
    Planned [Change PlanItem state] PlanItem Milestone Two (id: planItemMileStoneTwo), new state: [active] with transition [start]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'start' having fired for plan item planItemMileStoneTwo (PlanItem Milestone Two)
    Planned [Change PlanItem state] PlanItem Milestone Two (id: planItemMileStoneTwo), new state: [completed] with transition [occur]
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122 with transition 'occur' having fired for plan item planItemMileStoneTwo (PlanItem Milestone Two)
    Planned [Evaluate Criteria] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122
    No active plan items found for plan model, completing case instance
    Planned [Complete case instance] case instance bfaf0e64-eaf4-11e7-b9d0-acde48001122
