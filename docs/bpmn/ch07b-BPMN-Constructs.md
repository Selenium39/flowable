---
id: ch07b-BPMN-Constructs
title: BPMN 2.0 构件
description: 本文详细介绍Flowable支持的BPMN 2.0标准构件及其自定义扩展，包括事件定义和定时器事件配置，帮助开发者更高效地实现业务流程管理。
keywords: Flowable,BPMN 2.0,自定义扩展,事件定义,定时器事件,业务流程管理,开源框架,XML配置
---

本章介绍 Flowable 支持的 BPMN 2.0 构件,以及对 BPMN 标准的自定义扩展。

## 自定义扩展

BPMN 2.0 标准对所有相关方来说都是一件好事。最终用户不会受制于依赖专有解决方案带来的供应商锁定。框架,特别是像 Flowable 这样的开源框架,可以实现一个具有与大型供应商相同(通常实现得更好 ;-))功能的解决方案。得益于 BPMN 2.0 标准,从这样的大型供应商解决方案向 Flowable 的过渡可以是一条简单而平稳的道路。

然而,标准的缺点在于它总是不同公司(通常是不同愿景)之间多次讨论和妥协的结果。作为开发人员在阅读流程定义的 BPMN 2.0 XML 时,有时会觉得某些构件或处理方式非常繁琐。由于 Flowable 将易用性作为首要任务,我们引入了所谓的 **'Flowable BPMN 扩展'**。这些"扩展"是新的构件或简化某些构件的方法,它们不是 BPMN 2.0 规范的一部分。

尽管 BPMN 2.0 规范明确指出它是为自定义扩展而设计的,但我们要确保:

- 作为此类自定义扩展的先决条件,**始终**必须有一个简单的方法可以转换为**标准的处理方式**。因此,当您决定使用自定义扩展时,您不必担心没有退路。

- 使用自定义扩展时,通过给新的 XML 元素、属性等赋予 **flowable:** 命名空间前缀来清楚地表明这一点。请注意,Flowable 引擎也支持 **activiti:** 命名空间前缀。

是否使用自定义扩展完全取决于您。多个因素会影响这个决定(图形编辑器使用、公司政策等)。我们提供这些扩展仅仅是因为我们认为标准中的某些点可以用更简单或更高效的方式来实现。欢迎您对我们的扩展提供(正面或负面的)反馈,或者提出新的扩展想法。说不定有一天您的想法会出现在规范中!

## 事件

事件用于对流程生命周期中发生的事情进行建模。事件在视觉上始终表示为一个圆圈。在 BPMN 2.0 中,存在两个主要的事件类别: *捕获(catching)* 和 *抛出(throwing)* 事件。

- **捕获:** 当流程执行到达该事件时,它将等待触发器的发生。触发器的类型由内部图标或 XML 中的类型声明定义。捕获事件通过其未填充的内部图标(仅为白色)与抛出事件在视觉上区分开来。

- **抛出:** 当流程执行到达该事件时,会触发一个触发器。触发器的类型由内部图标或 XML 中的类型声明定义。抛出事件通过其填充为黑色的内部图标与捕获事件在视觉上区分开来。

### 事件定义

事件定义定义了事件的语义。如果没有事件定义,事件"不会做任何特殊的事情"。例如,没有事件定义的开始事件无法指定究竟是什么启动了流程。如果我们为开始事件添加事件定义(例如,定时器事件定义),我们就声明了什么"类型"的事件启动流程(在定时器事件定义的情况下,是指达到某个特定时间点)。

### 定时器事件定义

定时器事件是由定义的定时器触发的事件。它们可以用作[开始事件](bpmn/ch07b-BPMN-Constructs.md#timer-start-event)、[中间事件](bpmn/ch07b-BPMN-Constructs.md#intermediate-catching-events)或[边界事件](bpmn/ch07b-BPMN-Constructs.md#timer-boundary-event)。时间事件的行为取决于所使用的业务日历。每个定时器事件都有一个默认的业务日历,但业务日历也可以作为定时器事件定义的一部分提供。

    <timerEventDefinition flowable:businessCalendarName="custom">
        ...
    </timerEventDefinition>

其中 businessCalendarName 指向流程引擎配置中的业务日历。当省略业务日历时,将使用默认的业务日历。

定时器定义必须恰好包含以下元素之一:

- **timeDate**。此格式指定了触发器将在何时触发的固定日期,使用 [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601#Dates) 格式。例如:

<!-- -->

    <timerEventDefinition>
        <timeDate>2011-03-11T12:13:14</timeDate>
    </timerEventDefinition>

- **timeDuration**。要指定定时器在触发之前应运行多长时间,可以将 *timeDuration* 指定为 *timerEventDefinition* 的子元素。使用的格式是 [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601#Durations) 格式(BPMN 2.0 规范要求)。例如(持续 10 天的间隔):

<!-- -->

    <timerEventDefinition>
        <timeDuration>P10D</timeDuration>
    </timerEventDefinition>

- **timeCycle**。指定重复间隔,这对于定期启动流程或为逾期的用户任务发送多个提醒很有用。时间周期元素可以采用两种格式之一。第一种是由 [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601#Repeating_intervals) 标准指定的重复时间持续格式。示例(3 个重复间隔,每个间隔持续 10 小时):

也可以在 *timeCycle* 上指定 *endDate* 作为可选属性,或者在时间表达式的末尾指定,如下所示: R3/PT10H/${EndDate}。
当达到 endDate 时,应用程序将停止为此任务创建其他作业。
它接受静态值 [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601#Dates) 标准,例如 *"2015-02-25T16:42:11+00:00"*,或变量,例如 *${EndDate}* 作为值

    <timerEventDefinition>
        <timeCycle flowable:endDate="2015-02-25T16:42:11+00:00">R3/PT10H</timeCycle>
    </timerEventDefinition>

    <timerEventDefinition>
        <timeCycle>R3/PT10H/${EndDate}</timeCycle>
    </timerEventDefinition>

如果两者都指定了,系统将使用作为属性指定的 endDate。

目前,只有 *BoundaryTimerEvents* 和 *CatchTimerEvent* 支持 *EndDate* 功能。

此外,您可以使用 cron 表达式指定时间周期;下面的示例显示了从整点开始每 5 分钟触发一次:

    0 0/5 * * * ?

请参阅[本教程](http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)了解如何使用 cron 表达式。

**注意:** 第一个符号表示秒,而不是普通 Unix cron 中的分钟。

重复时间持续更适合处理相对定时器,这些定时器是相对于某个特定时间点计算的(例如,用户任务开始的时间),而 cron 表达式可以处理绝对定时器,这对于[定时器开始事件](bpmn/ch07b-BPMN-Constructs.md#description)特别有用。

您可以对定时器事件定义使用表达式,通过这样做,您可以基于流程变量影响定时器定义。流程变量必须包含适当定时器类型的 ISO 8601(或周期类型的 cron)字符串。
此外,对于持续时间,可以使用类型为 `java.time.Duration` 的变量或返回该类型的表达式。

    <boundaryEvent id="escalationTimer" cancelActivity="true" attachedToRef="firstLineSupport">
      <timerEventDefinition>
        <timeDuration>${duration}</timeDuration>
      </timerEventDefinition>
    </boundaryEvent>

**注意:** 只有在启用异步执行器时才会触发定时器(*asyncExecutorActivate* 必须在 flowable.cfg.xml 中设置为 true,因为异步执行器默认是禁用的)。

### 错误事件定义

**重要提示:** BPMN 错误与 Java 异常不是同一回事。事实上,两者毫无关联。BPMN 错误事件是一种对*业务异常*进行建模的方式。Java 异常通过[其特定的方式](bpmn/ch07b-BPMN-Constructs.md#handling-exceptions)处理。

    <endEvent id="myErrorEndEvent">
      <errorEventDefinition errorRef="myError" />
    </endEvent>

### 信号事件定义

信号事件是引用命名信号的事件。信号是一个全局范围的事件(广播语义),它会被传递给所有活动的处理程序(等待的流程实例/捕获信号事件)。

信号事件定义使用 signalEventDefinition 元素声明。属性 signalRef 引用了在 definitions 根元素下声明为子元素的 signal 元素。以下是一个流程的示例,其中信号事件由中间事件抛出和捕获。

    <definitions... >
        <!-- 信号的声明 -->
        <signal id="alertSignal" name="alert" />

        <process id="catchSignal">
            <intermediateThrowEvent id="throwSignalEvent" name="Alert">
                <!-- 信号事件定义 -->
                <signalEventDefinition signalRef="alertSignal" />
            </intermediateThrowEvent>
            ...
            <intermediateCatchEvent id="catchSignalEvent" name="On Alert">
                <!-- 信号事件定义 -->
                <signalEventDefinition signalRef="alertSignal" />
            </intermediateCatchEvent>
            ...
        </process>
    </definitions>

signalEventDefinitions 引用相同的信号元素。

#### 抛出信号事件

信号可以通过使用 BPMN 构件的流程实例抛出,也可以通过使用 Java API 以编程方式抛出。可以使用 org.flowable.engine.RuntimeService 上的以下方法以编程方式抛出信号:

    RuntimeService.signalEventReceived(String signalName);
    RuntimeService.signalEventReceived(String signalName, String executionId);

signalEventReceived(String signalName) 和 signalEventReceived(String signalName, String executionId) 的区别在于,第一个方法将信号全局抛出给所有订阅的处理程序(广播语义),而第二个方法仅将信号传递给特定的执行。

#### 捕获信号事件

信号事件可以由中间捕获信号事件或信号边界事件捕获。

#### 查询信号事件订阅

可以查询所有已订阅特定信号事件的执行:

     List<Execution> executions = runtimeService.createExecutionQuery()
          .signalEventSubscriptionName("alert")
          .list();

然后我们可以使用 signalEventReceived(String signalName, String executionId) 方法将信号传递给这些执行。

#### 信号事件范围

默认情况下,信号是*流程引擎范围内的广播*。这意味着您可以在一个流程实例中抛出信号事件,其他具有不同流程定义的流程实例可以对此事件的发生做出反应。

然而,有时希望仅在*同一流程实例*内对信号事件做出反应。例如,一个用例是当两个或多个活动互斥时,流程实例中的同步机制。

要限制信号事件的*范围*,请向信号事件定义添加(非 BPMN 2.0 标准的!) *scope 属性*:

    <signal id="alertSignal" name="alert" flowable:scope="processInstance"/>

此属性的默认值是 *"global"*。

#### Signal Event 示例

以下是两个使用信号进行通信的独立进程的示例。当保险单被更新或更改时,第一个进程会启动。在人工参与者审核完变更后,会抛出一个信号事件,表示保单已更改:

![bpmn.signal.event.throw](assets/bpmn/bpmn.signal.event.throw.png)

现在所有感兴趣的进程实例都可以捕获这个事件。下面是一个订阅该事件的进程示例。

![bpmn.signal.event.catch](assets/bpmn/bpmn.signal.event.catch.png)

**注意:** 理解信号事件会广播给**所有**活动的处理程序这一点很重要。这意味着,在上述示例中,所有捕获该信号的进程实例都会收到该事件。在这种场景下,这正是我们想要的。然而,在某些情况下这种广播行为可能并非预期。考虑以下进程:

![bpmn.signal.event.warning.1](assets/bpmn/bpmn.signal.event.warning.1.png)

BPMN 不支持上述进程中描述的模式。其设想是在执行"do something"任务时抛出的错误被边界错误事件捕获,通过信号抛出事件传播到并行执行路径,然后中断"do something in parallel"任务。到目前为止,Flowable 会按预期执行。信号会传播到捕获边界事件并中断任务。**但是,由于信号的广播语义,它也会传播到所有其他订阅了该信号事件的进程实例。** 在这种情况下,这可能不是我们想要的。

**注意:** 信号事件不会执行任何特定进程实例的关联。相反,它会广播给所有进程实例。如果你需要只将信号传递给特定的进程实例,请手动执行关联并使用 signalEventReceived(String signalName, String executionId) 以及适当的[查询机制](bpmn/ch07b-BPMN-Constructs.md#querying-for-signal-event-subscriptions)。

Flowable 通过将信号事件的 *scope* 属性设置为 *processInstance* 来解决这个问题。

### Message Event 定义

Message 事件是引用命名消息的事件。消息具有名称和负载。与信号不同,消息事件始终指向单个接收者。

消息事件定义使用 messageEventDefinition 元素声明。属性 messageRef 引用在 definitions 根元素下声明为子元素的 message 元素。以下是一个流程的示例,其中声明了两个消息事件,并由开始事件和中间捕获消息事件引用。

    <definitions id="definitions"
      xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:flowable="http://flowable.org/bpmn"
      targetNamespace="Examples"
      xmlns:tns="Examples">

      <message id="newInvoice" name="newInvoiceMessage" />
      <message id="payment" name="paymentMessage" />

      <process id="invoiceProcess">

        <startEvent id="messageStart" >
            <messageEventDefinition messageRef="newInvoice" />
        </startEvent>
        ...
        <intermediateCatchEvent id="paymentEvt" >
            <messageEventDefinition messageRef="payment" />
        </intermediateCatchEvent>
        ...
      </process>

    </definitions>

#### 抛出消息事件

作为一个可嵌入的流程引擎,Flowable 并不关心实际接收消息的过程。这取决于环境并涉及特定平台的活动,例如连接到 JMS (Java Messaging Service) 队列/主题或处理 Webservice 或 REST 请求。因此,消息的接收是您必须作为应用程序或基础设施的一部分来实现的,流程引擎就嵌入其中。

在应用程序中接收到消息后,您必须决定如何处理它。如果消息应该触发新的流程实例的启动,可以选择运行时服务提供的以下方法:

    ProcessInstance startProcessInstanceByMessage(String messageName);
    ProcessInstance startProcessInstanceByMessage(String messageName, Map<String, Object> processVariables);
    ProcessInstance startProcessInstanceByMessage(String messageName, String businessKey,
        Map<String, Object> processVariables);

这些方法使用引用的消息启动流程实例。

如果现有的流程实例需要接收消息,您首先必须将消息关联到特定的流程实例(参见下一节),然后触发等待执行的继续。运行时服务提供以下方法,用于基于消息事件订阅触发执行:

    void messageEventReceived(String messageName, String executionId);
    void messageEventReceived(String messageName, String executionId, HashMap<String, Object> processVariables);

#### 查询消息事件订阅

- 对于消息开始事件,消息事件订阅与特定的*流程定义*相关联。可以使用 ProcessDefinitionQuery 查询此类消息订阅:

<!-- -->

    ProcessDefinition processDefinition = repositoryService.createProcessDefinitionQuery()
          .messageEventSubscription("newCallCenterBooking")
          .singleResult();

由于一个特定的消息订阅只能有一个流程定义,因此查询始终返回零个或一个结果。如果更新了流程定义,只有最新版本的流程定义会订阅该消息事件。

- 对于中间捕获消息事件,消息事件订阅与特定的*执行*相关联。可以使用 ExecutionQuery 查询此类消息事件订阅:

<!-- -->

    Execution execution = runtimeService.createExecutionQuery()
          .messageEventSubscriptionName("paymentReceived")
          .variableValueEquals("orderId", message.getOrderId())
          .singleResult();

这类查询被称为关联查询,通常需要了解流程的相关知识(在本例中,对于给定的 orderId 最多只会有一个流程实例)。

#### Message Event 示例

以下是一个可以使用两个不同消息启动的流程示例:

![bpmn.start.message.event.example.1](assets/bpmn/bpmn.start.message.event.example.1.png)

如果流程需要以不同方式对不同的开始事件做出反应,但最终以统一的方式继续,这种方法很有用。

### 开始事件

开始事件表示流程的起点。开始事件的类型(流程在消息到达时启动、在特定时间间隔启动等)定义了流程*如何*启动,在事件的可视化表示中显示为一个小图标。在 XML 表示中,类型由子元素的声明给出。

开始事件**始终是捕获的**:从概念上讲,事件(在任何时候)都在等待某个特定触发器的发生。

在开始事件中,可以指定以下 Flowable 特定的属性:

- **initiator**: 标识在流程启动时存储认证用户 ID 的变量名。例如:

<!-- -->

    <startEvent id="request" flowable:initiator="initiator" />

认证用户必须在 try-finally 块中使用 IdentityService.setAuthenticatedUserId(String) 方法设置,如下所示:

    try {
      identityService.setAuthenticatedUserId("bono");
      runtimeService.startProcessInstanceByKey("someProcessKey");
    } finally {
      identityService.setAuthenticatedUserId(null);
    }

此代码已内置到 Flowable 应用程序中,因此可以与[表单](bpmn/ch08-Forms.md#forms)结合使用。

### None Start Event

#### 描述

从技术上讲,'none' start event 意味着启动流程实例的触发器未指定。这意味着引擎无法预测流程实例何时必须启动。当通过 API 调用 *startProcessInstanceByXXX* 方法之一启动流程实例时,使用 none start event。

    ProcessInstance processInstance = runtimeService.startProcessInstanceByXXX();

*注意:* 子流程始终具有 none start event。

#### 图形标记

none start event 在视觉上表示为一个没有内部图标的圆圈(换句话说,没有触发器类型)。

![bpmn.none.start.event](assets/bpmn/bpmn.none.start.event.png)

#### XML 表示

none start event 的 XML 表示是普通的开始事件声明,没有任何子元素(其他开始事件类型都有声明类型的子元素)。

    <startEvent id="start" name="my start event" />

#### None Start Event 的自定义扩展

**formKey**: 引用用户在启动新流程实例时必须填写的表单定义。更多信息可以在[表单章节](bpmn/ch08-Forms.md#forms)中找到。示例:

    <startEvent id="request" flowable:formKey="request" />

### 定时器开始事件

#### 描述

定时器开始事件用于在给定时间创建流程实例。它既可以用于只需启动一次的流程,也可以用于需要在特定时间间隔内启动的流程。

*注意:* 子流程不能有定时器开始事件。

*注意:* 定时器开始事件在流程部署后立即被调度。无需调用 startProcessInstanceByXXX,尽管调用启动流程方法不受限制,但会在调用 startProcessInstanceByXXX 时导致流程再次启动。

*注意:* 当部署带有定时器开始事件的流程的新版本时,与先前定时器对应的作业将被移除。原因是通常不希望继续自动启动旧版本流程的新实例。

#### 图形标记

定时器开始事件在视觉上表示为带有时钟内部图标的圆圈。

![bpmn.clock.start.event](assets/bpmn/bpmn.clock.start.event.png)

#### XML 表示

定时器开始事件的 XML 表示是普通的开始事件声明,带有定时器定义子元素。配置详情请参考[定时器定义](bpmn/ch07b-BPMN-Constructs.md#timer-event-definitions)。

示例:流程将从 2011 年 3 月 11 日 12:13 开始,每隔 5 分钟启动一次,共启动 4 次

    <startEvent id="theStart">
      <timerEventDefinition>
        <timeCycle>R4/2011-03-11T12:13/PT5M</timeCycle>
      </timerEventDefinition>
    </startEvent>

示例:流程将在选定日期启动一次

    <startEvent id="theStart">
      <timerEventDefinition>
        <timeDate>2011-03-11T12:13:14</timeDate>
      </timerEventDefinition>
    </startEvent>

### 消息开始事件

#### 描述

[消息](bpmn/ch07b-BPMN-Constructs.md#message-event-definitions)开始事件可用于使用命名消息启动流程实例。这实际上允许我们使用消息名称从一组可选的开始事件中*选择*正确的开始事件。

当**部署**带有一个或多个消息开始事件的流程定义时,需要注意以下几点:

- 消息开始事件的名称在给定的流程定义中必须是唯一的。流程定义不能有多个具有相同名称的消息开始事件。如果流程定义包含两个或更多引用相同消息的消息开始事件,或者如果两个或更多消息开始事件引用具有相同消息名称的消息,Flowable 将在部署时抛出异常。

- 消息开始事件的名称在所有已部署的流程定义中必须是唯一的。如果流程定义包含一个或多个消息开始事件,引用的消息与其他流程定义已部署的消息开始事件具有相同的名称,Flowable 将在部署时抛出异常。

- 流程版本控制:当部署流程定义的新版本时,先前版本的开始消息订阅将被移除。

当**启动**流程实例时,可以使用 RuntimeService 上的以下方法触发消息开始事件:

    ProcessInstance startProcessInstanceByMessage(String messageName);
    ProcessInstance startProcessInstanceByMessage(String messageName, Map<String, Object> processVariables);
    ProcessInstance startProcessInstanceByMessage(String messageName, String businessKey,
        Map<String, Object< processVariables);

messageName 是在 messageEventDefinition 的 messageRef 属性引用的 message 元素的 name 属性中给出的名称。在**启动**流程实例时,需要注意以下几点:

- 消息开始事件仅支持顶级流程。嵌入式子流程不支持消息开始事件。

- 如果流程定义有多个消息开始事件,runtimeService.startProcessInstanceByMessage(...) 允许选择适当的开始事件。

- 如果流程定义有多个消息开始事件和一个 none 开始事件,runtimeService.startProcessInstanceByKey(...) 和 runtimeService.startProcessInstanceById(...) 将使用 none 开始事件启动流程实例。

- 如果流程定义有多个消息开始事件但没有 none 开始事件,runtimeService.startProcessInstanceByKey(...) 和 runtimeService.startProcessInstanceById(...) 将抛出异常。

- 如果流程定义只有一个消息开始事件,runtimeService.startProcessInstanceByKey(...) 和 runtimeService.startProcessInstanceById(...) 将使用该消息开始事件启动新的流程实例。

- 如果流程是从调用活动启动的,仅在以下情况下支持消息开始事件:

    - 除了消息开始事件外,流程还有一个 none 开始事件
    
    - 流程只有一个消息开始事件且没有其他开始事件。

#### 图形标记

消息开始事件在视觉上表示为带有消息事件符号的圆圈。该符号是未填充的,用于表示捕获(接收)行为。

![bpmn.start.message.event](assets/bpmn/bpmn.start.message.event.png)

#### XML 表示

消息开始事件的 XML 表示是普通的开始事件声明,带有 messageEventDefinition 子元素:

    <definitions id="definitions"
      xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
      xmlns:flowable="http://flowable.org/bpmn"
      targetNamespace="Examples"
      xmlns:tns="Examples">

      <message id="newInvoice" name="newInvoiceMessage" />

      <process id="invoiceProcess">

        <startEvent id="messageStart" >
            <messageEventDefinition messageRef="tns:newInvoice" />
        </startEvent>
        ...
      </process>

    </definitions>

### 信号开始事件

#### 描述

[信号](bpmn/ch07b-BPMN-Constructs.md#signal-event-definitions)开始事件可用于使用命名信号启动流程实例。信号可以通过中间信号抛出事件从流程实例内部"触发",也可以通过 API (*runtimeService.signalEventReceivedXXX* 方法)触发。在这两种情况下,所有具有相同名称的信号开始事件的流程定义都将被启动。

注意,在这两种情况下,都可以在同步和异步启动流程实例之间进行选择。

必须在 API 中传递的 signalName 是在 signalEventDefinition 的 signalRef 属性引用的 signal 元素的 name 属性中给出的名称。

#### 图形标记

信号开始事件在视觉上表示为带有信号事件符号的圆圈。该符号是未填充的,用于表示捕获(接收)行为。

![bpmn.start.signal.event](assets/bpmn/bpmn.start.signal.event.png)

#### XML 表示

信号开始事件的 XML 表示是普通的开始事件声明,带有 signalEventDefinition 子元素:

    <signal id="theSignal" name="The Signal" />

    <process id="processWithSignalStart1">
      <startEvent id="theStart">
        <signalEventDefinition id="theSignalEventDefinition" signalRef="theSignal"  />
      </startEvent>
      <sequenceFlow id="flow1" sourceRef="theStart" targetRef="theTask" />
      <userTask id="theTask" name="Task in process A" />
      <sequenceFlow id="flow2" sourceRef="theTask" targetRef="theEnd" />
      <endEvent id="theEnd" />
    </process>

### 错误开始事件

#### 描述

[错误](bpmn/ch07b-BPMN-Constructs.md#error-event-definitions)开始事件可用于触发事件子流程。**错误开始事件不能用于启动流程实例**。

错误开始事件始终是中断的。

#### 图形标记

错误开始事件在视觉上表示为带有错误事件符号的圆圈。该符号是未填充的,用于表示捕获(接收)行为。

![bpmn.start.error.event](assets/bpmn/bpmn.start.error.event.png)

#### XML 表示

错误开始事件的 XML 表示是普通的开始事件声明,带有 errorEventDefinition 子元素:

    <startEvent id="messageStart" >
        <errorEventDefinition errorRef="someError" />
    </startEvent>

### 结束事件

结束事件表示流程或子流程中路径的结束。结束事件**始终是抛出的**。这意味着当流程执行到达结束事件时,会抛出一个*结果*。结果的类型由事件内部的黑色图标表示。在 XML 表示中,类型由子元素的声明给出。

### None 结束事件

#### 描述

'none' 结束事件意味着当到达该事件时抛出的*结果*是未指定的。因此,引擎除了结束当前执行路径外不会做任何额外的事情。

#### 图形标记

none 结束事件在视觉上表示为一个带有粗边框的圆圈,内部没有图标(没有结果类型)。

![bpmn.none.end.event](assets/bpmn/bpmn.none.end.event.png)

#### XML 表示

none 结束事件的 XML 表示是普通的结束事件声明,没有任何子元素(其他结束事件类型都有声明类型的子元素)。

    <endEvent id="end" name="my end event" />

### 错误结束事件

#### 描述

当流程执行到达**错误结束事件**时,当前执行路径结束并抛出一个错误。这个错误可以被[匹配的中间边界错误事件](bpmn/ch07b-BPMN-Constructs.md#error-boundary-event)捕获。如果找不到匹配的边界错误事件,将抛出异常。

#### 图形标记

错误结束事件在视觉上表示为一个典型的结束事件(带有粗边框的圆圈),内部有错误图标。错误图标完全为黑色,表示其抛出语义。

![bpmn.error.end.event](assets/bpmn/bpmn.error.end.event.png)

#### XML 表示

错误结束事件表示为一个结束事件,带有 *errorEventDefinition* 子元素。

    <endEvent id="myErrorEndEvent">
      <errorEventDefinition errorRef="myError" />
    </endEvent>

*errorRef* 属性可以引用在流程外部定义的 *error* 元素:

    <error id="myError" errorCode="123" />
    ...
    <process id="myProcess">
    ...

*error* 的 **errorCode** 将用于查找匹配的捕获边界错误事件。如果 *errorRef* 与任何已定义的 *error* 不匹配,则 *errorRef* 将用作 *errorCode* 的快捷方式。这是 Flowable 特有的快捷方式。具体来说,以下代码片段在功能上是等效的。

    <error id="myError" errorCode="error123" />
    ...
    <process id="myProcess">
    ...
      <endEvent id="myErrorEndEvent">
        <errorEventDefinition errorRef="myError" />
      </endEvent>
    ...

等同于

    <endEvent id="myErrorEndEvent">
      <errorEventDefinition errorRef="error123" />
    </endEvent>

注意 *errorRef* 必须符合 BPMN 2.0 模式,并且必须是有效的 QName。

### 终止结束事件

#### 描述

当到达*终止结束事件*时,当前流程实例或子流程将被终止。从概念上讲,当执行到达终止结束事件时,将确定并结束第一个*作用域*(流程或子流程)。注意在 BPMN 2.0 中,子流程可以是嵌入式子流程、调用活动、事件子流程或事务子流程。这条规则普遍适用:例如,当存在多实例调用活动或嵌入式子流程时,只有该实例会结束,其他实例和流程实例不受影响。

可以添加一个可选的 *terminateAll* 属性。当设置为 *true* 时,无论终止结束事件在流程定义中的位置如何,也无论是否在子流程中(即使是嵌套的),都将终止(根)流程实例。

#### 图形标记

终止结束事件在视觉上表示为一个典型的结束事件(带有粗边框的圆圈),内部有一个实心黑色圆圈。

![bpmn.terminate.end.event](assets/bpmn/bpmn.terminate.end.event.png)

#### XML 表示

终止结束事件表示为一个结束事件,带有 *terminateEventDefinition* 子元素。

注意 *terminateAll* 属性是可选的(默认为 *false*)。

    <endEvent id="myEndEvent >
      <terminateEventDefinition flowable:terminateAll="true"></terminateEventDefinition>
    </endEvent>

### 取消结束事件

#### 描述

取消结束事件只能与 BPMN 事务子流程一起使用。当到达取消结束事件时,会抛出一个取消事件,该事件必须由取消边界事件捕获。然后取消边界事件取消事务并触发补偿。

#### 图形标记

取消结束事件在视觉上表示为一个典型的结束事件(带有粗边框的圆圈),内部有取消图标。取消图标完全为黑色,表示其抛出语义。

![bpmn.cancel.end.event](assets/bpmn/bpmn.cancel.end.event.png)

#### XML 表示

取消结束事件表示为一个结束事件,带有 *cancelEventDefinition* 子元素。

    <endEvent id="myCancelEndEvent">
      <cancelEventDefinition />
    </endEvent>

### 边界事件

边界事件是附加到活动的*捕获*事件(边界事件永远不能是抛出的)。这意味着当活动运行时,事件正在*监听*某种类型的触发器。当事件被*捕获*时,活动被中断,并遵循从事件出发的序列流。

所有边界事件都以相同的方式定义:

    <boundaryEvent id="myBoundaryEvent" attachedToRef="theActivity">
          <XXXEventDefinition/>
    </boundaryEvent>

边界事件定义包含:

- 一个唯一标识符(在流程范围内)

- 通过 **attachedToRef** 属性引用事件所附加的活动。
  注意边界事件的定义与其所附加的活动处于相同层级(换句话说,边界事件不包含在活动内部)。

- 形如 *XXXEventDefinition* 的 XML 子元素(例如, *TimerEventDefinition*, *ErrorEventDefinition* 等)用于定义边界事件的类型。有关详细信息,请参见具体的边界事件类型。

### 定时器边界事件

#### 描述

定时器边界事件充当秒表和闹钟的角色。当执行到达附加了边界事件的活动时,定时器启动。当定时器触发时(例如,在指定的时间间隔后),活动被中断,并遵循从边界事件出发的序列流。

#### 图形标记

定时器边界事件在视觉上表示为一个典型的边界事件(边界上的圆圈),内部有定时器图标。

![bpmn.boundary.timer.event](assets/bpmn/bpmn.boundary.timer.event.png)

#### XML 表示

定时器边界事件被定义为一个[常规边界事件](bpmn/ch07b-BPMN-Constructs.md#boundary-events)。在这种情况下,特定类型的子元素是 **timerEventDefinition** 元素。

    <boundaryEvent id="escalationTimer" cancelActivity="true" attachedToRef="firstLineSupport">
      <timerEventDefinition>
        <timeDuration>PT4H</timeDuration>
      </timerEventDefinition>
    </boundaryEvent>

有关定时器配置的详细信息,请参阅[定时器事件定义](bpmn/ch07b-BPMN-Constructs.md#timer-event-definitions)。

在图形表示中,如上例所示,圆圈的线条是虚线的:

![bpmn.non.interrupting.boundary.timer.event](assets/bpmn/bpmn.non.interrupting.boundary.timer.event.png)

一个典型的用例是在一段时间后发送升级电子邮件,但不影响正常的流程流转。

中断和非中断定时器事件之间有一个关键区别。非中断意味着原始活动**不会**被中断而是保持原样。中断行为是默认的。在 XML 表示中,*cancelActivity* 属性设置为 false:

    <boundaryEvent id="escalationTimer" cancelActivity="false" attachedToRef="firstLineSupport"/>

**注意:** 只有在启用异步执行器时才会触发边界定时器事件(*asyncExecutorActivate* 需要在 flowable.cfg.xml 中设置为 true,因为异步执行器默认是禁用的)。

#### 边界事件的已知问题

在使用任何类型的边界事件时,存在一个关于并发的已知问题。目前,无法将多个传出序列流附加到边界事件。解决这个问题的方法是使用一个指向并行网关的传出序列流。

![bpmn.known.issue.boundary.event](assets/bpmn/bpmn.known.issue.boundary.event.png)

### 错误边界事件

#### 描述

活动边界上的中间*捕获*错误,或简称为**边界错误事件**,用于捕获在其所定义的活动范围内抛出的错误。

在[嵌入式子流程](bpmn/ch07b-BPMN-Constructs.md#aocess)或[调用活动](bpmn/ch07b-BPMN-Constructs.md#call-activity-(sub-process))上定义边界错误事件最有意义,因为子流程为其内部的所有活动创建了一个作用域。错误由[错误结束事件](bpmn/ch07b-BPMN-Constructs.md#error-end-event)抛出。这样的错误会向上传播到其父作用域,直到找到一个定义了与错误事件定义匹配的边界错误事件的作用域。

当捕获到错误事件时,定义了边界事件的活动会被销毁,同时也会销毁其中的所有当前执行(并发活动、嵌套子流程等)。流程执行将沿着边界事件的传出序列流继续。

#### 图形标记

边界错误事件在视觉上表示为边界上的典型中间事件(带有内部小圆圈的圆圈),内部有错误图标。错误图标为白色,表示其*捕获*语义。

![bpmn.boundary.error.event](assets/bpmn/bpmn.boundary.error.event.png)

#### XML 表示

边界错误事件被定义为一个典型的[边界事件](bpmn/ch07b-BPMN-Constructs.md#boundary-events):

    <boundaryEvent id="catchError" attachedToRef="mySubProcess">
      <errorEventDefinition errorRef="myError"/>
    </boundaryEvent>

与[错误结束事件](bpmn/ch07b-BPMN-Constructs.md#error-end-event)一样,*errorRef* 引用了在流程元素外部定义的错误:

    <error id="myError" errorCode="123" />
    ...
    <process id="myProcess">
    ...

**errorCode** 用于匹配要捕获的错误:

- 如果省略 *errorRef*,边界错误事件将捕获**任何错误事件**,而不管 *error* 的 errorCode 是什么。

- 如果提供了 *errorRef* 并且它引用了一个现有的 *error*,边界事件将**只捕获具有相同错误代码的错误**。

- 如果提供了 *errorRef*,但在 BPMN 2.0 文件中没有定义 *error*,则**errorRef 将被用作 errorCode**(与错误结束事件类似)。

#### 示例

以下示例流程展示了如何使用错误结束事件。当通过表明没有提供足够信息来完成 *'Review profitability'* 用户任务时,将抛出一个错误。当这个错误在子流程的边界被捕获时,*'Review sales lead'* 子流程中的所有活动活动都会被销毁(即使 *'Review customer rating'* 尚未完成),并创建 *'Provide additional details'* 用户任务。

![bpmn.boundary.error.example](assets/bpmn/bpmn.boundary.error.example.png)

此流程作为示例包含在演示设置中。流程 XML 和单元测试可以在 *org.flowable.examples.bpmn.event.error* 包中找到。

### 信号边界事件

#### 描述

活动边界上的中间*捕获*[信号](bpmn/ch07b-BPMN-Constructs.md#signal-event-definitions),或简称为**边界信号事件**,用于捕获与引用的信号定义具有相同信号名称的信号。

**注意:** 与其他事件(如边界错误事件)不同,边界信号事件不仅捕获从其所附加的作用域抛出的信号事件。相反,信号事件具有全局作用域(广播语义),这意味着信号可以从任何地方抛出,甚至可以从不同的流程实例抛出。

**注意:** 与其他事件(如错误事件)不同,如果信号被捕获,它不会被消耗。如果您有两个活动的边界信号事件捕获相同的信号事件,两个边界事件都会被触发,即使它们属于不同的流程实例。

#### 图形标记

边界信号事件在视觉上表示为边界上的典型中间事件(带有内部小圆圈的圆圈),内部有信号图标。信号图标为白色(未填充),表示其*捕获*语义。

![bpmn.boundary.signal.event](assets/bpmn/bpmn.boundary.signal.event.png)

#### XML 表示

边界信号事件被定义为一个典型的[边界事件](bpmn/ch07b-BPMN-Constructs.md#boundary-events):

    <boundaryEvent id="boundary" attachedToRef="task" cancelActivity="true">
        <signalEventDefinition signalRef="alertSignal"/>
    </boundaryEvent>

#### 示例

参见[信号事件定义](bpmn/ch07b-BPMN-Constructs.md#signal-event-definitions)章节。

### 消息边界事件

#### 描述

活动边界上的中间*捕获*[消息](bpmn/ch07b-BPMN-Constructs.md#message-event-definitions),或简称为**边界消息事件**,用于捕获与引用的消息定义具有相同消息名称的消息。

#### 图形标记

边界消息事件在视觉上表示为边界上的典型中间事件(带有内部小圆圈的圆圈),内部有消息图标。消息图标为白色(未填充),表示其*捕获*语义。

![bpmn.boundary.message.event](assets/bpmn/bpmn.boundary.message.event.png)

注意边界消息事件可以是中断的(右侧)也可以是非中断的(左侧)。

#### XML 表示

边界消息事件被定义为一个典型的[边界事件](bpmn/ch07b-BPMN-Constructs.md#boundary-events):

    <boundaryEvent id="boundary" attachedToRef="task" cancelActivity="true">
        <messageEventDefinition messageRef="newCustomerMessage"/>
    </boundaryEvent>

#### 示例

参见[消息事件定义](bpmn/ch07b-BPMN-Constructs.md#message-event-definitions)章节。

### 取消边界事件

#### 描述

事务子流程边界上的中间*捕获*取消事件,或简称为**边界取消事件**,在事务被取消时触发。当取消边界事件被触发时,它首先中断当前作用域中的所有活动执行。接下来,它开始对事务作用域内的所有活动补偿边界事件进行补偿。补偿是同步执行的,换句话说,边界事件在离开事务之前会等待补偿完成。当补偿完成后,事务子流程通过从取消边界事件出发的任何序列流离开。

**注意:** 一个事务子流程只允许有一个取消边界事件。

**注意:** 如果事务子流程包含嵌套的子流程,补偿只会对已成功完成的子流程触发。

**注意:** 如果在具有多实例特征的事务子流程上放置了取消边界事件,如果一个实例触发取消,边界事件会取消所有实例。

#### 图形标记

取消边界事件在视觉上表示为边界上的典型中间事件(带有内部小圆圈的圆圈),内部有取消图标。取消图标为白色(未填充),表示其*捕获*语义。

![bpmn.boundary.cancel.event](assets/bpmn/bpmn.boundary.cancel.event.png)

#### XML 表示

取消边界事件被定义为一个典型的[边界事件](bpmn/ch07b-BPMN-Constructs.md#boundary-events):

    <boundaryEvent id="boundary" attachedToRef="transaction" >
              <cancelEventDefinition />
    </boundaryEvent>

由于取消边界事件始终是中断的,因此不需要 cancelActivity 属性。

### 补偿边界事件

#### 描述

活动边界上的中间*捕获*补偿,或简称为**补偿边界事件**,可用于将补偿处理器附加到活动上。

补偿边界事件必须使用定向关联引用单个补偿处理器。

补偿边界事件具有与其他边界事件不同的激活策略。其他边界事件(如信号边界事件)在其所附加的活动启动时被激活。当活动完成时,它们被停用,相应的事件订阅被取消。补偿边界事件则不同。补偿边界事件在其所附加的活动**成功完成**时被激活。此时,将创建对补偿事件的相应订阅。当触发补偿事件或相应的流程实例结束时,订阅将被移除。由此可知:

- 当触发补偿时,与补偿边界事件关联的补偿处理器被调用的次数与其所附加的活动成功完成的次数相同。

- 如果补偿边界事件附加到具有多实例特征的活动上,则会为每个实例创建一个补偿事件订阅。

- 如果补偿边界事件附加到循环内的活动上,则每次执行该活动时都会创建一个补偿事件订阅。

- 如果流程实例结束,补偿事件的订阅将被取消。

**注意:** 嵌入式子流程不支持补偿边界事件。

#### 图形标记

补偿边界事件在视觉上表示为边界上的典型中间事件(带有内部小圆圈的圆圈),内部有补偿图标。补偿图标为白色(未填充),表示其*捕获*语义。除了补偿边界事件外,下图还展示了使用单向关联与边界事件关联的补偿处理器:

![bpmn.boundary.compensation.event](assets/bpmn/bpmn.boundary.compensation.event.png)

#### XML 表示

补偿边界事件被定义为一个典型的[边界事件](bpmn/ch07b-BPMN-Constructs.md#boundary-events):

    <boundaryEvent id="compensateBookHotelEvt" attachedToRef="bookHotel" >
        <compensateEventDefinition />
    </boundaryEvent>

    <association associationDirection="One" id="a1"
        sourceRef="compensateBookHotelEvt" targetRef="undoBookHotel" />

    <serviceTask id="undoBookHotel" isForCompensation="true" flowable:class="..." />

由于补偿边界事件在活动成功完成后才被激活,因此不支持 cancelActivity 属性。

### 中间捕获事件

所有中间捕获事件的定义方式都相同:

    <intermediateCatchEvent id="myIntermediateCatchEvent" >
        <XXXEventDefinition/>
    </intermediateCatchEvent>

中间捕获事件的定义包含:

- 一个唯一标识符(在流程范围内)

- 形如 *XXXEventDefinition* (例如, *TimerEventDefinition*) 的 XML 子元素,用于定义中间捕获事件的类型。有关详细信息,请参见具体的捕获事件类型。

### 定时器中间捕获事件

#### 描述

定时器中间事件充当秒表的角色。当执行到达捕获事件活动时,定时器启动。当定时器触发时(例如,在指定的时间间隔后),将遵循从定时器中间事件出发的序列流。

#### 图形标记

定时器中间事件在视觉上表示为一个中间捕获事件,内部有定时器图标。

![bpmn.intermediate.timer.event](assets/bpmn/bpmn.intermediate.timer.event.png)

#### XML 表示

定时器中间事件被定义为一个[中间捕获事件](bpmn/ch07b-BPMN-Constructs.md#intermediate-catching-events)。在这种情况下,特定类型的子元素是 **timerEventDefinition** 元素。

    <intermediateCatchEvent id="timer">
      <timerEventDefinition>
        <timeDuration>PT5M</timeDuration>
      </timerEventDefinition>
    </intermediateCatchEvent>

有关定时器配置的详细信息,请参阅[定时器事件定义](bpmn/ch07b-BPMN-Constructs.md#timer-event-definitions)。

### 信号中间捕获事件

#### 描述

中间*捕获*[信号](bpmn/ch07b-BPMN-Constructs.md#signal-event-definitions)事件捕获与引用的信号定义具有相同信号名称的信号。

**注意:** 与其他事件(如错误事件)不同,如果信号被捕获,它不会被消耗。如果您有两个活动的信号边界事件捕获相同的信号事件,两个边界事件都会被触发,即使它们属于不同的流程实例。

#### 图形标记

信号中间捕获事件在视觉上表示为一个典型的中间事件(带有内部小圆圈的圆圈),内部有信号图标。信号图标为白色(未填充),表示其*捕获*语义。

![bpmn.intermediate.signal.catch.event](assets/bpmn/bpmn.intermediate.signal.catch.event.png)

#### XML 表示

信号中间事件被定义为一个[中间捕获事件](bpmn/ch07b-BPMN-Constructs.md#intermediate-catching-events)。在这种情况下,特定类型的子元素是 **signalEventDefinition** 元素。

    <intermediateCatchEvent id="signal">
      <signalEventDefinition signalRef="newCustomerSignal" />
    </intermediateCatchEvent>

#### 示例

参见[信号事件定义](bpmn/ch07b-BPMN-Constructs.md#signal-event-definitions)章节。

### 消息中间捕获事件

#### 描述

中间*捕获*[消息](bpmn/ch07b-BPMN-Constructs.md#message-event-definitions)事件捕获具有指定名称的消息。

#### 图形标记

消息中间捕获事件在视觉上表示为一个典型的中间事件(带有内部小圆圈的圆圈),内部有消息图标。消息图标为白色(未填充),表示其*捕获*语义。

![bpmn.intermediate.message.catch.event](assets/bpmn/bpmn.intermediate.message.catch.event.png)

#### XML 表示

消息中间事件被定义为一个[中间捕获事件](bpmn/ch07b-BPMN-Constructs.md#intermediate-catching-events)。在这种情况下,特定类型的子元素是 **messageEventDefinition** 元素。

    <intermediateCatchEvent id="message">
      <messageEventDefinition signalRef="newCustomerMessage" />
    </intermediateCatchEvent>

#### 示例

参见[消息事件定义](bpmn/ch07b-BPMN-Constructs.md#message-event-definitions)章节。

### 中间抛出事件

所有中间抛出事件的定义方式都相同:

    <intermediateThrowEvent id="myIntermediateThrowEvent" >
          <XXXEventDefinition/>
    </intermediateThrowEvent>

中间抛出事件的定义包含:

- 一个唯一标识符(在流程范围内)

- 形如 *XXXEventDefinition* (例如, *signalEventDefinition*) 的 XML 子元素,用于定义中间抛出事件的类型。有关详细信息,请参见具体的抛出事件类型。

### None 中间抛出事件

下面的流程图展示了一个 none 中间事件的简单示例,它通常用于指示流程中达到的某个状态。

![bpmn.intermediate.none.event](assets/bpmn/bpmn.intermediate.none.event.png)

通过添加[执行监听器](bpmn/ch07b-BPMN-Constructs.md#execution-listener),这可以成为监控某些 KPI 的好钩子。

    <intermediateThrowEvent id="noneEvent">
      <extensionElements>
        <flowable:executionListener class="org.flowable.engine.test.bpmn.event.IntermediateNoneEventTest$MyExecutionListener" event="start" />
      </extensionElements>
    </intermediateThrowEvent>

在这里您可以添加自己的代码,比如向您的 BAM 工具或数据仓库发送一些事件。引擎本身在这种情况下不做任何事情,它只是简单地通过。

### 信号中间抛出事件

#### 描述

中间*抛出*[信号](bpmn/ch07b-BPMN-Constructs.md#signal-event-definitions)事件为已定义的信号抛出一个信号事件。

在 Flowable 中,信号会广播给所有活动的处理器(换句话说,所有捕获信号事件)。信号可以同步或异步发布。

- 在默认配置中,信号是**同步**传递的。这意味着抛出流程实例会等待,直到信号被传递给所有捕获流程实例。捕获流程实例也在与抛出流程实例相同的事务中被通知,这意味着如果其中一个被通知的实例产生技术错误(抛出异常),所有相关实例都会失败。

- 信号也可以**异步**传递。在这种情况下,会确定在到达抛出信号事件时哪些处理器是活动的。对于每个活动的处理器,都会存储一个异步通知消息(Job)并由 JobExecutor 传递。

#### 图形标记

信号中间抛出事件在视觉上表示为一个典型的中间事件(带有内部小圆圈的圆圈),内部有信号图标。信号图标为黑色(填充),表示其*抛出*语义。

![bpmn.intermediate.signal.throw.event](assets/bpmn/bpmn.intermediate.signal.throw.event.png)

#### XML 表示

信号中间事件被定义为一个[中间抛出事件](bpmn/ch07b-BPMN-Constructs.md#intermediate-throwing-event)。在这种情况下,特定类型的子元素是 **signalEventDefinition** 元素。

    <intermediateThrowEvent id="signal">
      <signalEventDefinition signalRef="newCustomerSignal" />
    </intermediateThrowEvent>

异步信号事件的定义如下:

    <intermediateThrowEvent id="signal">
      <signalEventDefinition signalRef="newCustomerSignal" flowable:async="true" />
    </intermediateThrowEvent>

#### 示例

参见[信号事件定义](bpmn/ch07b-BPMN-Constructs.md#signal-event-definitions)章节。

### 补偿中间抛出事件

#### 描述

中间*抛出*补偿事件可用于触发补偿。

**触发补偿:** 补偿可以针对指定的活动触发,也可以针对托管补偿事件的作用域触发。补偿是通过执行与活动关联的补偿处理器来执行的。

- 当针对某个活动抛出补偿时,相关的补偿处理器将按照该活动成功完成的次数执行相同次数。

- 如果针对当前作用域抛出补偿,当前作用域内的所有活动都将被补偿,包括并发分支上的活动。

- 补偿是按层级触发的:如果要补偿的活动是子流程,则会为子流程中包含的所有活动触发补偿。如果子流程有嵌套活动,补偿会递归抛出。但是,补偿不会传播到流程的"上层":如果在子流程内触发补偿,它不会传播到子流程作用域之外的活动。BPMN 规范指出,补偿是针对"相同子流程级别"的活动触发的。

- 在 Flowable 中,补偿按执行的相反顺序执行。这意味着最后完成的活动首先被补偿,依此类推。

- 中间抛出补偿事件可用于补偿已成功完成的事务子流程。

**注意:** 如果在包含子流程的作用域内抛出补偿,且该子流程包含带有补偿处理器的活动,则只有当补偿抛出时子流程已成功完成,补偿才会传播到该子流程。如果子流程内嵌套的某些活动已完成并附加了补偿处理器,但包含这些活动的子流程尚未完成,则不会执行补偿处理器。请考虑以下示例:

![bpmn.throw.compensation.example1](assets/bpmn/bpmn.throw.compensation.example1.png)

在这个流程中,我们有两个并发执行:一个执行嵌入式子流程,另一个执行"charge credit card"活动。假设两个执行都已启动,第一个并发执行正在等待用户完成"review bookings"任务。第二个执行执行"charge credit card"活动并抛出错误,这导致"cancel reservations"事件触发补偿。此时并行子流程尚未完成,这意味着补偿事件不会传播到子流程,因此不会执行"cancel hotel reservation"补偿处理器。如果用户任务(因此也包括嵌入式子流程)在执行"cancel reservations"之前完成,补偿将传播到嵌入式子流程。

**流程变量:** 在补偿嵌入式子流程时,用于执行补偿处理器的执行可以访问子流程在完成执行时的本地流程变量状态。为了实现这一点,会对与作用域执行(为执行子流程而创建的执行)关联的流程变量进行快照。由此产生以下几个影响:

- 补偿处理器无法访问在子流程作用域内创建的并发执行中添加的变量。

- 快照中不包含层级结构中更高级别的执行相关的流程变量(例如,与流程实例执行关联的流程变量):补偿处理器可以访问这些流程变量在抛出补偿时的状态。

- 变量快照仅针对嵌入式子流程进行,不针对其他活动。

**当前限制:**

- 目前不支持 waitForCompletion="false"。当使用中间抛出补偿事件触发补偿时,只有在补偿成功完成后才会离开该事件。

- 补偿本身目前由并发执行执行。并发执行按照补偿活动完成的相反顺序启动。

- 补偿不会传播到由调用活动产生的子流程实例。

#### 图形标记

补偿中间抛出事件在视觉上表示为一个典型的中间事件(带有内部小圆圈的圆圈),内部有补偿图标。补偿图标为黑色(填充),表示其*抛出*语义。

![bpmn.intermediate.compensation.throw.event](assets/bpmn/bpmn.intermediate.compensation.throw.event.png)

#### XML 表示

补偿中间事件被定义为一个[中间抛出事件](bpmn/ch07b-BPMN-Constructs.md#intermediate-throwing-event)。在这种情况下,特定类型的子元素是 **compensateEventDefinition** 元素。

    <intermediateThrowEvent id="throwCompensation">
        <compensateEventDefinition />
    </intermediateThrowEvent>

此外,可以使用可选参数 activityRef 来触发特定作用域或活动的补偿:

    <intermediateThrowEvent id="throwCompensation">
        <compensateEventDefinition activityRef="bookHotel" />
    </intermediateThrowEvent>

## 序列流

### 描述

序列流是连接流程中两个元素的连接器。当在流程执行期间访问某个元素时,将遵循所有传出序列流。这意味着 BPMN 2.0 的默认特性是并行的:两个传出序列流将创建两条独立的、并行的执行路径。

### 图形标记

序列流在视觉上表示为一个从源元素指向目标元素的箭头。箭头始终指向目标。

![bpmn.sequence.flow](assets/bpmn/bpmn.sequence.flow.png)

### XML 表示

序列流需要有一个在流程中唯一的 **id** 以及对现有 **source** 和 **target** 元素的引用。

    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="theTask" />

### 条件序列流

#### 描述

序列流可以定义一个条件。当离开 BPMN 2.0 活动时,默认行为是评估传出序列流上的条件。当条件评估为 *true* 时,将选择该传出序列流。当以这种方式选择多个序列流时,将生成多个*执行*,并且流程将以并行方式继续。

**注意:** 上述内容适用于 BPMN 2.0 活动(和事件),但不适用于网关。网关将根据网关类型以特定方式处理带有条件的序列流。

#### 图形标记

条件序列流在视觉上表示为一个常规序列流,在开始处有一个小菱形。条件表达式显示在序列流旁边。

![bpmn.conditional.sequence.flow](assets/bpmn/bpmn.conditional.sequence.flow.png)

#### XML 表示

条件序列流在 XML 中表示为一个常规序列流,包含一个 **conditionExpression** 子元素。注意目前只支持 *tFormalExpressions*,省略 *xsi:type=""* 定义将简单地默认为唯一支持的表达式类型。

    <sequenceFlow id="flow" sourceRef="theStart" targetRef="theTask">
      <conditionExpression xsi:type="tFormalExpression">
        <![CDATA[${order.price > 100 && order.price < 250}]]>
      </conditionExpression>
    </sequenceFlow>

目前,条件表达式**只能与 UEL 一起使用**。有关这些内容的详细信息,请参见[表达式](bpmn/ch04-API.md#expressions)章节。使用的表达式应解析为布尔值,否则在评估条件时会抛出异常。

- 下面的示例以典型的 JavaBean 风格通过 getter 引用流程变量的数据。

<!-- -->

    <conditionExpression xsi:type="tFormalExpression">
      <![CDATA[${order.price > 100 && order.price < 250}]]>
    </conditionExpression>

- 此示例调用一个解析为布尔值的方法。

<!-- -->

    <conditionExpression xsi:type="tFormalExpression">
      <![CDATA[${order.isStandardOrder()}]]>
    </conditionExpression>

Flowable 发行版包含以下使用值和方法表达式的示例流程(参见 *org.flowable.examples.bpmn.expression*):

![bpmn.uel expression.on.seq.flow](assets/bpmn/bpmn.uel-expression.on.seq.flow.png)

### 默认序列流

#### 描述

所有 BPMN 2.0 任务和网关都可以有一个**默认序列流**。只有当其他所有序列流都无法被选择时,才会将该序列流选择为该活动的传出序列流。默认序列流上的条件始终被忽略。

#### 图形标记

默认序列流在视觉上表示为一个常规序列流,在开始处有一个"斜线"标记。

![bpmn.default.sequence.flow](assets/bpmn/bpmn.default.sequence.flow.png)

#### XML 表示

某个活动的默认序列流通过该活动上的 **default 属性**来定义。以下 XML 片段展示了一个排他网关的示例,它将 *flow 2* 作为默认序列流。只有当 *conditionA* 和 *conditionB* 都评估为 false 时,它才会被选择为网关的传出序列流。

    <exclusiveGateway id="exclusiveGw" name="Exclusive Gateway" default="flow2" />

    <sequenceFlow id="flow1" sourceRef="exclusiveGw" targetRef="task1">
        <conditionExpression xsi:type="tFormalExpression">${conditionA}</conditionExpression>
    </sequenceFlow>

    <sequenceFlow id="flow2" sourceRef="exclusiveGw" targetRef="task2"/>

    <sequenceFlow id="flow3" sourceRef="exclusiveGw" targetRef="task3">
        <conditionExpression xsi:type="tFormalExpression">${conditionB}</conditionExpression>
    </sequenceFlow>

这对应于以下图形表示：

## 网关

网关用于控制执行流程(或者按照 BPMN 2.0 的描述,控制*执行令牌*)。网关能够*消耗*或*生成*令牌。

网关在图形上表示为一个菱形,内部有一个图标。该图标显示网关的类型。

![bpmn.gateway](assets/bpmn/bpmn.gateway.png)

### 排他网关

#### 描述

排他网关(也称为 *XOR 网关*,或者更专业地称为*基于数据的排他网关*)用于在流程中对**决策**进行建模。当执行到达此网关时,所有传出序列流都会按照定义的顺序进行评估。第一个条件评估为 true 的序列流(或者没有设置条件,概念上在序列流上定义了*'true'*)将被选择用于继续流程。

**注意,在这种情况下,传出序列流的语义与 BPMN 2.0 中的一般情况不同。虽然在一般情况下,所有条件评估为 true 的序列流都会被选择以并行方式继续,但在使用排他网关时只会选择一个序列流。如果多个序列流的条件评估为 true,则只会选择 XML 中定义的第一个(而且只有这一个!)用于继续流程。如果没有序列流可以被选择,将抛出异常。**

#### 图形标记

排他网关在视觉上表示为一个典型的网关(菱形),内部有一个"X"图标,表示其 *XOR* 语义。注意,没有内部图标的网关默认为排他网关。BPMN 2.0 规范不允许在同一个流程定义中同时使用带 X 和不带 X 的菱形。

![bpmn.exclusive.gateway.notation](assets/bpmn/bpmn.exclusive.gateway.notation.png)

#### XML 表示

排他网关的 XML 表示非常直接:一行用于定义网关,另外在传出序列流上定义条件表达式。有关此类表达式可用选项的详细信息,请参见[条件序列流](bpmn/ch07b-BPMN-Constructs.md#conditional-sequence-flow)章节。

例如,以下模型:

![bpmn.exclusive.gateway](assets/bpmn/bpmn.exclusive.gateway.png)

在 XML 中表示如下:

    <exclusiveGateway id="exclusiveGw" name="Exclusive Gateway" />

    <sequenceFlow id="flow2" sourceRef="exclusiveGw" targetRef="theTask1">
      <conditionExpression xsi:type="tFormalExpression">${input == 1}</conditionExpression>
    </sequenceFlow>

    <sequenceFlow id="flow3" sourceRef="exclusiveGw" targetRef="theTask2">
      <conditionExpression xsi:type="tFormalExpression">${input == 2}</conditionExpression>
    </sequenceFlow>

    <sequenceFlow id="flow4" sourceRef="exclusiveGw" targetRef="theTask3">
      <conditionExpression xsi:type="tFormalExpression">${input == 3}</conditionExpression>
    </sequenceFlow>

### 并行网关

#### 描述

网关也可以用于在流程中对并发进行建模。在流程模型中引入并发最直接的网关是**并行网关**,它允许您将执行路径*分叉*为多个路径或*合并*多个传入的执行路径。

并行网关的功能基于传入和传出序列流:

- **分叉:** 所有传出序列流都会并行执行,为每个序列流创建一个并发执行。

- **合并:** 到达并行网关的所有并发执行都会在网关处等待,直到每个传入序列流都有一个执行到达。然后流程继续通过合并网关。

注意,如果同一个并行网关有多个传入和传出序列流,则该并行网关可以**同时具有分叉和合并行为**。在这种情况下,网关会先合并所有传入序列流,然后再分叉为多个并发执行路径。

**与其他网关类型的一个重要区别是,并行网关不会评估条件。如果在连接到并行网关的序列流上定义了条件,这些条件会被简单地忽略。**

#### 图形标记

并行网关在视觉上表示为一个网关(菱形),内部有"加号"符号,表示"AND"语义。

![bpmn.parallel.gateway](assets/bpmn/bpmn.parallel.gateway.png)

#### XML 表示

定义并行网关只需要一行 XML:

    <parallelGateway id="myParallelGateway" />

实际的行为(分叉、合并或两者都有)由连接到并行网关的序列流定义。

例如,上面的模型可以转换为以下 XML:

    <startEvent id="theStart" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="fork" />

    <parallelGateway id="fork" />
    <sequenceFlow sourceRef="fork" targetRef="receivePayment" />
    <sequenceFlow sourceRef="fork" targetRef="shipOrder" />

    <userTask id="receivePayment" name="Receive Payment" />
    <sequenceFlow sourceRef="receivePayment" targetRef="join" />

    <userTask id="shipOrder" name="Ship Order" />
    <sequenceFlow sourceRef="shipOrder" targetRef="join" />

    <parallelGateway id="join" />
    <sequenceFlow sourceRef="join" targetRef="archiveOrder" />

    <userTask id="archiveOrder" name="Archive Order" />
    <sequenceFlow sourceRef="archiveOrder" targetRef="theEnd" />

    <endEvent id="theEnd" />

在上面的示例中,流程启动后将创建两个任务:

    ProcessInstance pi = runtimeService.startProcessInstanceByKey("forkJoin");
    TaskQuery query = taskService.createTaskQuery()
        .processInstanceId(pi.getId())
        .orderByTaskName()
        .asc();

    List<Task> tasks = query.list();
    assertEquals(2, tasks.size());

    Task task1 = tasks.get(0);
    assertEquals("Receive Payment", task1.getName());
    Task task2 = tasks.get(1);
    assertEquals("Ship Order", task2.getName());

当这两个任务完成后,第二个并行网关将合并两个执行,由于只有一个传出序列流,不会创建并发执行路径,只有 *Archive Order* 任务会被激活。

注意,并行网关不需要"平衡"(对应的并行网关有相匹配数量的传入/传出序列流)。并行网关只会简单地等待所有传入序列流,并为每个传出序列流创建一个并发执行路径,不受流程模型中其他构件的影响。因此,以下流程在 BPMN 2.0 中是合法的:
![bpmn.unbalanced.parallel.gateway](assets/bpmn/bpmn.unbalanced.parallel.gateway.png)

### 包容网关

#### 描述

**包容网关**可以看作是排他网关和并行网关的组合。与排他网关一样,您可以在传出序列流上定义条件,包容网关将对它们进行评估。但主要的区别在于包容网关可以像并行网关一样选择多个序列流。

包容网关的功能基于传入和传出序列流:

- **分叉:** 所有传出序列流的条件都会被评估,对于条件评估为 true 的序列流,将以并行方式执行这些流,为每个序列流创建一个并发执行。

- **合并:** 到达包容网关的所有并发执行都会在网关处等待,直到每个具有流程令牌的传入序列流都有一个执行到达。这是与并行网关的一个重要区别。换句话说,包容网关只会等待那些将被执行的传入序列流。合并之后,流程继续通过合并的包容网关。

注意,如果同一个包容网关有多个传入和传出序列流,则该包容网关可以**同时具有分叉和合并行为**。在这种情况下,网关会先合并所有具有流程令牌的传入序列流,然后再为条件评估为 true 的传出序列流分叉为多个并发执行路径。

#### 图形标记

包容网关在视觉上表示为一个网关(菱形),内部有"圆圈"符号。

![bpmn.inclusive.gateway](assets/bpmn/bpmn.inclusive.gateway.png)

#### XML 表示

定义包容网关只需要一行 XML:

    <inclusiveGateway id="myInclusiveGateway" />

实际的行为(分叉、合并或两者都有)由连接到包容网关的序列流定义。

例如,上面的模型可以转换为以下 XML:

    <startEvent id="theStart" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="fork" />

    <inclusiveGateway id="fork" />
    <sequenceFlow sourceRef="fork" targetRef="receivePayment" >
      <conditionExpression xsi:type="tFormalExpression">${paymentReceived == false}</conditionExpression>
    </sequenceFlow>
    <sequenceFlow sourceRef="fork" targetRef="shipOrder" >
      <conditionExpression xsi:type="tFormalExpression">${shipOrder == true}</conditionExpression>
    </sequenceFlow>

    <userTask id="receivePayment" name="Receive Payment" />
    <sequenceFlow sourceRef="receivePayment" targetRef="join" />

    <userTask id="shipOrder" name="Ship Order" />
    <sequenceFlow sourceRef="shipOrder" targetRef="join" />

    <inclusiveGateway id="join" />
    <sequenceFlow sourceRef="join" targetRef="archiveOrder" />

    <userTask id="archiveOrder" name="Archive Order" />
    <sequenceFlow sourceRef="archiveOrder" targetRef="theEnd" />

    <endEvent id="theEnd" />

在上面的示例中,如果流程变量 paymentReceived == false 且 shipOrder == true,则在流程启动后将创建两个任务。如果这些流程变量中只有一个等于 true,则只会创建一个任务。如果没有条件评估为 true,将抛出异常。这可以通过指定默认的传出序列流来防止。在下面的示例中,将创建一个任务,即发货订单任务:

    HashMap<String, Object> variableMap = new HashMap<String, Object>();
    variableMap.put("receivedPayment", true);
    variableMap.put("shipOrder", true);

    ProcessInstance pi = runtimeService.startProcessInstanceByKey("forkJoin");

    TaskQuery query = taskService.createTaskQuery()
        .processInstanceId(pi.getId())
        .orderByTaskName()
        .asc();

    List<Task> tasks = query.list();
    assertEquals(1, tasks.size());

    Task task = tasks.get(0);
    assertEquals("Ship Order", task.getName());

当这个任务完成后,第二个包容网关将合并两个执行,由于只有一个传出序列流,不会创建并发执行路径,只有 *Archive Order* 任务会被激活。

注意,包容网关不需要"平衡"(对应的包容网关有相匹配数量的传入/传出序列流)。包容网关只会简单地等待所有传入序列流,并为每个传出序列流创建一个并发执行路径,不受流程模型中其他构件的影响。

### 基于事件的网关

#### 描述

基于事件的网关提供了一种基于事件做出决策的方式。网关的每个传出序列流都需要连接到一个中间捕获事件。当流程执行到达基于事件的网关时,该网关会像等待状态一样工作:执行被暂停。此外,会为每个传出序列流创建一个事件订阅。

注意,从基于事件的网关出发的序列流与普通序列流不同。这些序列流实际上永远不会被"执行"。相反,它们允许流程引擎确定到达基于事件的网关的执行需要订阅哪些事件。以下限制适用:

- 基于事件的网关必须有两个或更多传出序列流。

- 基于事件的网关必须只能连接到 intermediateCatchEvent 类型的元素(Flowable 不支持基于事件的网关之后的接收任务)。

- 连接到基于事件的网关的 intermediateCatchEvent 必须有一个单一的传入序列流。    

#### 图形标记

基于事件的网关在视觉上表示为一个与其他 BPMN 网关类似的菱形,内部有一个特殊图标。

![bpmn.event.based.gateway.notation](assets/bpmn/bpmn.event.based.gateway.notation.png)

#### XML 表示

用于定义基于事件的网关的 XML 元素是 eventBasedGateway。

#### 示例

以下流程是一个包含基于事件的网关的流程示例。当执行到达基于事件的网关时,流程执行被暂停。此外,流程实例会订阅警报信号事件并创建一个 10 分钟后触发的定时器。这实际上使流程引擎等待十分钟来接收信号事件。如果在 10 分钟内收到信号,定时器将被取消,执行在信号之后继续。如果未触发信号,执行将在定时器之后继续,并取消信号订阅。

![bpmn.event.based.gateway.example](assets/bpmn/bpmn.event.based.gateway.example.png)

    <definitions id="definitions"
        xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
        xmlns:flowable="http://flowable.org/bpmn"
        targetNamespace="Examples">

        <signal id="alertSignal" name="alert" />

        <process id="catchSignal">

            <startEvent id="start" />

            <sequenceFlow sourceRef="start" targetRef="gw1" />

            <eventBasedGateway id="gw1" />

            <sequenceFlow sourceRef="gw1" targetRef="signalEvent" />
            <sequenceFlow sourceRef="gw1" targetRef="timerEvent" />

            <intermediateCatchEvent id="signalEvent" name="Alert">
                <signalEventDefinition signalRef="alertSignal" />
            </intermediateCatchEvent>

            <intermediateCatchEvent id="timerEvent" name="Alert">
                <timerEventDefinition>
                    <timeDuration>PT10M</timeDuration>
                </timerEventDefinition>
            </intermediateCatchEvent>

            <sequenceFlow sourceRef="timerEvent" targetRef="exGw1" />
            <sequenceFlow sourceRef="signalEvent" targetRef="task" />

            <userTask id="task" name="Handle alert"/>

            <exclusiveGateway id="exGw1" />

            <sequenceFlow sourceRef="task" targetRef="exGw1" />
            <sequenceFlow sourceRef="exGw1" targetRef="end" />

            <endEvent id="end" />
        </process>
    </definitions>

## 任务

### 用户任务

#### 描述

"用户任务"用于对需要由人工完成的工作进行建模。当流程执行到达这样的用户任务时,会在被分配该任务的用户或组的任务列表中创建一个新任务。

#### 图形标记

用户任务在视觉上表示为一个典型的任务(圆角矩形),在左上角有一个小的用户图标。

![bpmn.user.task](assets/bpmn/bpmn.user.task.png)

#### XML 表示

用户任务在 XML 中定义如下。*id* 属性是必需的,*name* 属性是可选的。

    <userTask id="theTask" name="Important task" />

用户任务也可以有描述。实际上,任何 BPMN 2.0 元素都可以有描述。描述通过添加 **documentation** 元素来定义。

    <userTask id="theTask" name="Schedule meeting" >
      <documentation>
          Schedule an engineering meeting for next week with the new hire.
      </documentation>

可以通过标准的 Java 方式从任务中获取描述文本:

    task.getDescription()

#### 到期日期

每个任务都有一个字段表示该任务的到期日期。可以使用查询 API 来查询在指定日期当天、之前或之后到期的任务。

有一个活动扩展允许您在任务定义中指定一个表达式,用于在创建任务时设置任务的初始到期日期。该表达式**必须始终解析为 java.util.Date、java.util.String(ISO8601 格式)、ISO8601 时间段(例如,PT50M)或 null**。例如,您可以使用在流程中之前的表单中输入的日期,或在之前的服务任务中计算的日期。如果使用时间段,则到期日期将基于当前时间计算并增加指定的时间段。例如,当使用"PT30M"作为 dueDate 时,任务将在从现在起三十分钟后到期。

    <userTask id="theTask" name="Important task" flowable:dueDate="${dateVariable}"/>

任务的到期日期也可以使用 TaskService 或在 TaskListeners 中使用传递的 DelegateTask 来修改。

#### 用户分配

用户任务可以直接分配给一个用户。这是通过定义一个 **humanPerformer** 子元素来完成的。这样的 *humanPerformer* 定义需要一个实际定义用户的 **resourceAssignmentExpression**。目前,仅支持 **formalExpressions**。

    <process >

      ...

      <userTask id='theTask' name='important task' >
        <humanPerformer>
          <resourceAssignmentExpression>
            <formalExpression>kermit</formalExpression>
          </resourceAssignmentExpression>
        </humanPerformer>
      </userTask>

**只能**将一个用户分配为任务的人工执行者。在 Flowable 术语中,这个用户被称为**受理人**。具有受理人的任务在其他人的任务列表中不可见,而是可以在受理人的**个人任务列表**中找到。

可以通过 TaskService 按以下方式检索直接分配给用户的任务:

    List<Task> tasks = taskService.createTaskQuery().taskAssignee("kermit").list();

任务也可以放在人员的**候选任务列表**中。在这种情况下,必须使用 **potentialOwner** 结构。其用法类似于 *humanPerformer* 结构。请注意,必须为正式表达式中的每个元素指定它是用户还是组(引擎无法猜测这一点)。

    <process >

      ...

      <userTask id='theTask' name='important task' >
        <potentialOwner>
          <resourceAssignmentExpression>
            <formalExpression>user(kermit), group(management)</formalExpression>
          </resourceAssignmentExpression>
        </potentialOwner>
      </userTask>

使用 *potential owner* 结构定义的任务可以按以下方式检索(或使用类似于带有受理人的任务的 *TaskQuery* 用法):

     List<Task> tasks = taskService.createTaskQuery().taskCandidateUser("kermit");

这将检索所有 kermit 是**候选用户**的任务,换句话说,正式表达式包含 *user(kermit)*。这也将检索所有**分配给 kermit 所属组**的任务(例如,*group(management)*,如果 kermit 是该组的成员且使用了 Flowable 身份组件)。用户的组在运行时解析,这些可以通过 [IdentityService](bpmn/ch04-API.md#the-process-engine-api-and-services) 进行管理。

如果没有指定给定的文本字符串是用户还是组,引擎默认为组。以下内容与声明 *group(accountancy)* 时相同。

    <formalExpression>accountancy</formalExpression>

#### 用户任务分配的 Flowable 扩展

对于分配不复杂的用例来说,用户和组的分配方式显得过于繁琐。为了避免这些复杂性,可以在用户任务上使用[自定义扩展](bpmn/ch07b-BPMN-Constructs.md#custom-extensions)。

- **assignee 属性**: 这个自定义扩展允许直接将指定用户分配给任务。

<!-- -->

    <userTask id="theTask" name="my task" flowable:assignee="kermit" />

这与使用[上文](bpmn/ch07b-BPMN-Constructs.md#user-assignment)定义的 **humanPerformer** 结构完全相同。

- **candidateUsers 属性**: 这个自定义扩展使指定用户成为任务的候选人。

<!-- -->

    <userTask id="theTask" name="my task" flowable:candidateUsers="kermit, gonzo" />

这与使用[上文](bpmn/ch07b-BPMN-Constructs.md#user-assignment)定义的 **potentialOwner** 结构完全相同。注意,不需要使用 *user(kermit)* 声明,因为与 *potential owner* 结构不同,该属性只能用于用户。

- **candidateGroups 属性**: 这个自定义扩展使指定组成为任务的候选组。

<!-- -->

    <userTask id="theTask" name="my task" flowable:candidateGroups="management, accountancy" />

这与使用[上文](bpmn/ch07b-BPMN-Constructs.md#user-assignment)定义的 **potentialOwner** 结构完全相同。注意,不需要使用 *group(management)* 声明,因为与 *potential owner* 结构不同,该属性只能用于组。

- *candidateUsers* 和 *candidateGroups* 可以在同一个用户任务上同时定义。

注意:尽管 Flowable 提供了一个通过 [IdentityService](bpmn/ch04-API.md#the-process-engine-api-and-services) 暴露的身份管理组件,但不会检查提供的用户是否被身份组件所知。这是为了让 Flowable 在嵌入到应用程序中时能够与现有的身份管理解决方案集成。

#### 自定义身份链接类型

BPMN 标准支持单个指定用户(**humanPerformer**)或构成潜在池的一组用户(**potentialOwners**),如[用户分配](bpmn/ch07b-BPMN-Constructs.md#user-assignment)中所定义。此外,Flowable 为用户任务定义了[扩展属性元素](bpmn/ch07b-BPMN-Constructs.md#flowable-extensions-for-task-assignment),可以表示任务的**受理人**或**候选人**。

Flowable 支持的身份链接类型有:

    public class IdentityLinkType {
      /* Flowable 原生角色 */
      public static final String ASSIGNEE = "assignee";
      public static final String CANDIDATE = "candidate";
      public static final String OWNER = "owner"; 
      public static final String STARTER = "starter";
      public static final String PARTICIPANT = "participant";
    }

BPMN 标准和 Flowable 示例授权身份是**用户**和**组**。如前一节所述,Flowable 的身份管理实现并不适用于生产环境,而是应该根据支持的授权方案进行扩展。

如果需要额外的链接类型,可以使用以下语法将自定义资源定义为扩展元素:

    <userTask id="theTask" name="make profit">
      <extensionElements>
        <flowable:customResource flowable:name="businessAdministrator">
          <resourceAssignmentExpression>
            <formalExpression>user(kermit), group(management)</formalExpression>
          </resourceAssignmentExpression>
        </flowable:customResource>
      </extensionElements>
    </userTask>

自定义链接表达式被添加到 *TaskDefinition* 类中:

    protected Map<String, Set<Expression>> customUserIdentityLinkExpressions =
        new HashMap<String, Set<Expression>>();
    protected Map<String, Set<Expression>> customGroupIdentityLinkExpressions =
        new HashMap<String, Set<Expression>>();

    public Map<String, Set<Expression>> getCustomUserIdentityLinkExpressions() {
        return customUserIdentityLinkExpressions;
    }

    public void addCustomUserIdentityLinkExpression(
            String identityLinkType, Set<Expression> idList) {

        customUserIdentityLinkExpressions.put(identityLinkType, idList);
    }

    public Map<String, Set<Expression>> getCustomGroupIdentityLinkExpressions() {
        return customGroupIdentityLinkExpressions;
    }

    public void addCustomGroupIdentityLinkExpression(
            String identityLinkType, Set<Expression> idList) {

        customGroupIdentityLinkExpressions.put(identityLinkType, idList);
    }

这些内容在运行时由 *UserTaskActivityBehavior handleAssignments* 方法填充。

最后,必须扩展 *IdentityLinkType* 类以支持自定义身份链接类型:

    package com.yourco.engine.task;

    public class IdentityLinkType extends org.flowable.engine.task.IdentityLinkType {

        public static final String ADMINISTRATOR = "administrator";

        public static final String EXCLUDED_OWNER = "excludedOwner";
    }

#### 通过任务监听器进行自定义分配

如果前面的方法不够用,可以使用 create 事件的[任务监听器](bpmn/ch07b-BPMN-Constructs.md#task-listener)来委托自定义分配逻辑:

    <userTask id="task1" name="My task" >
      <extensionElements>
        <flowable:taskListener event="create" class="org.flowable.MyAssignmentHandler" />
      </extensionElements>
    </userTask>

传递给 TaskListener 实现的 DelegateTask 可以设置受理人和候选用户/组:

    public class MyAssignmentHandler implements TaskListener {

      public void notify(DelegateTask delegateTask) {
        // 在这里执行自定义身份查找

        // 然后例如调用以下方法:
        delegateTask.setAssignee("kermit");
        delegateTask.addCandidateUser("fozzie");
        delegateTask.addCandidateGroup("management");
        ...
      }

    }

当使用 Spring 时,可以使用上述章节描述的自定义分配属性,并使用带有监听任务 *create* 事件的[表达式](bpmn/ch05-Spring.md#expressions)的[任务监听器](bpmn/ch07b-BPMN-Constructs.md#task-listener)来委托给 Spring bean。在下面的示例中,受理人将通过调用 ldapService Spring bean 的 findManagerOfEmployee 方法来设置。传递的 *emp* 参数是一个流程变量。

    <userTask id="task" name="My Task" flowable:assignee="${ldapService.findManagerForEmployee(emp)}"/>

这种方式同样适用于候选用户和组:

    <userTask id="task" name="My Task" flowable:candidateUsers="${ldapService.findAllSales()}"/>

注意,这种方式只有在被调用方法的返回类型是 String 或 Collection<String>(用于候选用户和组)时才有效:

    public class FakeLdapService {

      public String findManagerForEmployee(String employee) {
        return "Kermit The Frog";
      }

      public List<String> findAllSales() {
        return Arrays.asList("kermit", "gonzo", "fozzie");
      }

    }

### 脚本任务

#### 描述

脚本任务是一个自动活动。当流程执行到达脚本任务时,将执行相应的脚本。

属性:

- **name**: 用于指示任务名称的任务属性

- **type**: 任务属性,其值必须为"script"以指示任务类型

- **scriptFormat**: 指示脚本语言的扩展属性(例如,javascript、groovy)

- **script**: 要执行的脚本,在名为"script"的字段元素中定义为字符串

- **autoStoreVariables**: 可选的任务属性标志(默认值:false),用于指示脚本中定义的变量是否将存储在执行上下文中(参见下面的说明)

- **resultVariableName**: 可选的任务属性,如果存在,将使用脚本评估结果在执行上下文中存储具有指定名称的变量(参见下面的说明)

#### 图形标记

脚本任务在视觉上表示为典型的 BPMN 2.0 任务(圆角矩形),在矩形的左上角有一个小的"脚本"图标。

![bpmn.scripttask](assets/bpmn/bpmn.scripttask.png)

#### XML 表示

脚本任务通过指定 **script** 和 **scriptFormat** 来定义。

    <scriptTask id="theScriptTask" name="Execute script" scriptFormat="groovy">
      <script>
        sum = 0
        for ( i in inputArray ) {
          sum += i
        }
      </script>
    </scriptTask>

**scriptFormat** 属性的值必须是与 [JSR-223](http://jcp.org/en/jsr/detail?id=223)(Java 平台的脚本规范)兼容的名称。默认情况下,JavaScript 包含在每个 JDK 中,因此不需要任何额外的 JAR 文件。如果你想使用其他(兼容 JSR-223 的)脚本引擎,只需将相应的 JAR 添加到类路径并使用适当的名称即可。例如,Flowable 单元测试经常使用 Groovy,因为其语法与 Java 类似。

请注意,Groovy 脚本引擎与 groovy-jsr223 jar 捆绑在一起。因此,必须添加以下依赖:

    <dependency>
        <groupId>org.apache.groovy</groupId>
        <artifactId>groovy-jsr223</artifactId>
        <version>4.x.x<version>
    </dependency>

#### 脚本中的变量

通过到达脚本任务的执行可访问的所有流程变量都可以在脚本中使用。在示例中,脚本变量 *'inputArray'* 实际上是一个流程变量(一个整数数组)。

    <script>
        sum = 0
        for ( i in inputArray ) {
          sum += i
        }
    </script>

也可以通过调用 *execution.setVariable("variableName", variableValue)* 在脚本中设置流程变量。默认情况下,不会自动存储变量(**注意:在某些旧版本中是这样的!**)。可以通过将 scriptTask 的 autoStoreVariables 属性设置为 true 来自动存储脚本中定义的任何变量(例如,上例中的 *sum*)。但是,**最佳实践是不要这样做,而是使用显式的 execution.setVariable() 调用**,因为在某些最新版本的 JDK 中,某些脚本语言的变量自动存储不起作用。详见[此链接](http://www.jorambarrez.be/blog/2013/03/25/bug-on-jdk-1-7-0_17-when-using-scripttask-in-activiti/)。

    <scriptTask id="script" scriptFormat="JavaScript" flowable:autoStoreVariables="false">

此参数的默认值为 false,这意味着如果在脚本任务定义中省略该参数,所有声明的变量将仅在脚本执行期间存在。

以下是在脚本中设置变量的示例:

    <script>
        def scriptVar = "test123"
        execution.setVariable("myVar", scriptVar)
    </script>

注意:以下名称是保留的,**不能用作**变量名:**out、out:print、lang:import、context、elcontext**。

#### 脚本结果

通过将流程变量名指定为脚本任务定义的 *'flowable:resultVariable'* 属性的字面值,脚本任务的返回值可以分配给已存在的或新的流程变量。特定流程变量的任何现有值都将被脚本执行的结果值覆盖。如果未指定结果变量名,脚本结果值将被忽略。

    <scriptTask id="theScriptTask" name="Execute script" scriptFormat="juel" flowable:resultVariable="myVar">
      <script>#{echo}</script>
    </scriptTask>

在上面的示例中,脚本执行的结果(已解析表达式 *'#{echo}'* 的值)在脚本完成后被设置到名为 *'myVar'* 的流程变量中。

#### 安全性

当使用 *javascript* 作为脚本语言时,也可以使用"*安全脚本*"功能。详见[安全脚本部分](bpmn/ch18-Advanced.md#secure-scripting)。

### Java 服务任务

#### 描述

Java 服务任务用于调用外部 Java 类。

#### 图形标记

服务任务在视觉上表示为一个圆角矩形,在左上角有一个小齿轮图标。

![bpmn.java.service.task](assets/bpmn/bpmn.java.service.task.png)

#### XML 表示

有四种声明如何调用 Java 逻辑的方式:

- 指定一个实现了 JavaDelegate、FutureJavaDelegate 或 ActivityBehavior 的类

- 计算解析为委托对象的表达式

- 调用方法表达式

- 计算值表达式

要指定在流程执行期间调用的类,需要通过 **'flowable:class'** 属性提供完全限定的类名。

    <serviceTask id="javaService"
                 name="My Java Service Task"
                 flowable:class="org.flowable.MyJavaDelegate" />

有关如何使用此类的更多详细信息,请参见[实现部分](bpmn/ch07b-BPMN-Constructs.md#implementation)。

也可以使用解析为对象的表达式。当使用 flowable:class 属性创建对象时,该对象必须遵循相同的规则(参见[进一步说明](bpmn/ch07b-BPMN-Constructs.md#implementation))。

    <serviceTask id="serviceTask" flowable:delegateExpression="${delegateExpressionBean}" />

这里,delegateExpressionBean 是一个实现了 JavaDelegate 或 FutureJavaDelegate 接口的 bean,例如在 Spring 容器中定义。

要指定需要计算的 UEL 方法表达式,请使用 **flowable:expression** 属性。

    <serviceTask id="javaService"
                 name="My Java Service Task"
                 flowable:expression="#{printer.printMessage()}" />

将在名为 printer 的对象上调用 printMessage 方法(不带参数)。

也可以在表达式中使用带参数的方法。

    <serviceTask id="javaService"
                 name="My Java Service Task"
                 flowable:expression="#{printer.printMessage(execution, myVar)}" />

将在名为 printer 的对象上调用 printMessage 方法。传递的第一个参数是 DelegateExecution,它在表达式上下文中默认可用,作为 execution。传递的第二个参数是当前执行中名为 myVar 的变量的值。

注意:当在 **flowable:expression** 中定义的方法执行时间较长时,可以返回一个 `CompletableFuture<?>`。
使用这种方式时,其他并行流程可以同时执行。

要指定需要计算的 UEL 值表达式,请使用 **flowable:expression** 属性。

    <serviceTask id="javaService"
                 name="My Java Service Task"
                 flowable:expression="#{split.ready}" />

将在名为 split 的 bean 上调用属性 ready 的 getter 方法 getReady(不带参数)。命名对象将在执行的流程变量中解析,如果适用的话也会在 Spring 上下文中解析。

#### 实现

要实现一个可以在流程执行期间调用的类,该类需要实现 *org.flowable.engine.delegate.JavaDelegate* 接口,并在 *execute* 方法中提供所需的逻辑。当流程执行到达这个特定步骤时,它将执行该方法中定义的逻辑,并以默认的 BPMN 2.0 方式离开该活动。

让我们创建一个示例,一个可用于将流程变量字符串转换为大写的 Java 类。这个类需要实现 *org.flowable.engine.delegate.JavaDelegate* 接口,该接口要求我们实现 *execute(DelegateExecution)* 方法。引擎将调用这个操作,其中需要包含业务逻辑。流程实例信息(如流程变量)可以通过 [DelegateExecution](http://www.flowable.org/javadocs/org/flowable/engine/delegate/DelegateExecution.html) 接口访问和操作(点击链接查看其操作的详细 Javadoc)。

    public class ToUppercase implements JavaDelegate {

      public void execute(DelegateExecution execution) {
        String var = (String) execution.getVariable("input");
        var = var.toUpperCase();
        execution.setVariable("input", var);
      }

    }

注意:对于定义的每个服务任务,**其 Java 类将只创建一个实例**。所有流程实例共享同一个类实例来调用 *execute(DelegateExecution)*。这意味着该类不能使用任何成员变量,并且必须是线程安全的,因为它可能会被不同的线程同时执行。这也会影响[字段注入](bpmn/ch07b-BPMN-Constructs.md#field-injection)的处理方式。

在流程定义中引用的类(通过使用 flowable:class)**不会在部署期间实例化**。只有当流程执行首次到达使用该类的流程点时,才会创建该类的实例。如果找不到该类,将抛出 FlowableException。这样设计的原因是部署时的环境(特别是 *classpath*)通常与实际的运行时环境不同。例如,当使用 *ant* 或在 Flowable 应用程序中使用业务存档上传来部署流程时,类路径不会自动包含引用的类。

如果执行时间较长,可以将该工作委托给不同的线程,但仍然继续执行并行活动。
为此,需要实现 *org.flowable.engine.delegate.FutureJavaDelegate*。
这是一个更高级的接口,需要特别注意在 `DelegateExecution` 上设置数据以及处理事务边界。

```java
public class LongRunningJavaDelegate implements FutureJavaDelegate<String> {

    public CompletableFuture<String> execute(DelegateExecution execution, AsyncTaskInvoker taskInvoker) {
        // 这部分在与流程实例相同的事务中运行,仍然可以在执行上下文中设置和提取数据
        String input = (String) execution.getVariable("input");
        // taskInvoker 是 Flowable 提供的通用调用器,可用于在新线程上提交复杂的执行任务
        // 但是,你不必使用它,你可以使用自己的自定义 ExecutorService 或从自己的服务返回 CompletableFuture
        return taskInvoker.submit(() -> {
            // 这部分在新线程上运行。这里不应该使用 execution
            // 这里也没有事务。如果需要新的事务,则应该由你自己的服务来管理
            // 执行一些需要时间的复杂逻辑,例如调用外部服务
            return "done";
        });
    }

    public void afterExecution(DelegateExecution execution, String executionData) {
        // 这部分在与流程实例相同的事务和线程中运行,可以在执行上下文中设置数据
        execution.setVariable("longRunningResult", executionData);
    }
}
```

还有 2 个其他接口可以用来简化你的实现:
* *org.flowable.engine.delegate.FlowableFutureJavaDelegate*,它使用默认(或配置的) AsyncTaskInvoker,简化了逻辑。
* *org.flowable.engine.delegate.MapBasedFlowableFutureJavaDelegate*,它通过使用 ReadOnlyDelegateExecution 和 Map 进一步简化了输入和输出的传递。

使用其他接口的相同实现如下:

```java
public class LongRunningJavaDelegate implements FlowableFutureJavaDelegate<String, String> {


    public String prepareExecutionData(DelegateExecution execution) {
        // 这部分在与流程实例相同的事务和线程中运行
        // 可以使用 execution 对象
        return execution.getVariable("input");
    }

    public String execute(String inputData) {
        // 这部分在新线程上运行。这里不应该使用 execution
        // 这里也没有事务。如果需要新的事务,则应该由你自己的服务来管理
        // 执行一些需要时间的复杂逻辑,例如调用外部服务
        return "done";
    }

    public void afterExecution(DelegateExecution execution, String executionData) {
        // 这部分在与流程实例相同的事务和线程中运行,可以在执行上下文中设置数据
        execution.setVariable("longRunningResult", executionData);
    }
}
```

```java
public class LongRunningJavaDelegate implements MapBasedFlowableFutureJavaDelegate {

    public Map<String, Object> execute(ReadOnlyDelegateExecution execution) {
        // execution 是委托执行的只读快照
        // 这部分在新线程上运行。这里不应该使用 execution
        // 这里也没有事务。如果需要新的事务,则应该由你自己的服务来管理
        // 执行一些需要时间的复杂逻辑,例如调用外部服务
        Map<String, Object> result = new HashMap<>();
        result.put("longRunningResult", "done");
        // 返回的 map 中的所有值都将被设置到执行上下文中
        return result;
    }
}
```

注意:适用于 `JavaDelegate` 的规则和逻辑同样适用于 `FutureJavaDelegate`。
请记住,当使用字段表达式注入时,表达式的求值应该只在执行之前或之后完成(在与流程实例相同的线程上)。

[\[INTERNAL: 非公开实现类\]](../oss-introduction.md#internal-implementation-classes) 也可以提供一个实现 *org.flowable.engine.impl.delegate.ActivityBehavior* 接口的类。这样的实现可以访问更强大的引擎功能,例如,影响流程的控制流。但是请注意,这不是一个很好的实践,应该尽可能避免。因此,建议只在高级用例中使用 *ActivityBehavior* 接口,而且必须完全了解自己在做什么。

#### 字段注入

可以将值注入到委托类的字段中。支持以下类型的注入:

- 固定字符串值

- 表达式

如果可用,该值会通过委托类上的公共 setter 方法注入,遵循 Java Bean 命名约定(例如,字段 firstName 有 setter setFirstName(...))。如果该字段没有可用的 setter,则会在委托上设置私有成员的值。某些环境中的 SecurityManagers 不允许修改私有字段,因此对于要注入的字段,暴露一个公共的 setter 方法会更安全。

**无论在流程定义中声明的值类型如何,注入目标上的 setter/私有字段的类型应该始终是 org.flowable.engine.delegate.Expression。当表达式被解析时,它可以被转换为适当的类型。**

使用 *'flowable:class'* 属性时支持字段注入。使用 *flowable:delegateExpression* 属性时也可以进行字段注入,但是需要遵循特殊的线程安全规则(参见下一节)。

以下代码片段展示了如何将常量值注入到类中声明的字段。注意,我们需要在实际的字段注入声明之前**声明一个 'extensionElements' XML 元素**,这是 BPMN 2.0 XML Schema 的要求。

    <serviceTask id="javaService"
        name="Java service invocation"
        flowable:class="org.flowable.examples.bpmn.servicetask.ToUpperCaseFieldInjected">
        <extensionElements>
          <flowable:field name="text" stringValue="Hello World" />
      </extensionElements>
    </serviceTask>

ToUpperCaseFieldInjected 类有一个类型为 org.flowable.engine.delegate.Expression 的字段 text。当调用 text.getValue(execution) 时,将返回配置的字符串值 Hello World:

    public class ToUpperCaseFieldInjected implements JavaDelegate {

      private Expression text;

      public void execute(DelegateExecution execution) {
        execution.setVariable("var", ((String)text.getValue(execution)).toUpperCase());
      }

    }

另外,对于长文本(例如,内联电子邮件),可以使用 *'flowable:string'* 子元素:

    <serviceTask id="javaService"
        name="Java service invocation"
        flowable:class="org.flowable.examples.bpmn.servicetask.ToUpperCaseFieldInjected">
      <extensionElements>
        <flowable:field name="text">
            <flowable:string>
              这是一个包含很多单词且可能更长的长字符串!
          </flowable:string>
        </flowable:field>
      </extensionElements>
    </serviceTask>

要注入在运行时动态解析的值,可以使用表达式。这些表达式可以使用流程变量或 Spring 定义的 bean(如果使用了 Spring)。如[服务任务实现](bpmn/ch07b-BPMN-Constructs.md#implementation)中所述,当使用 *flowable:class* 属性时,Java 类的实例在服务任务中的所有流程实例之间共享。要在字段中动态注入值,你可以在 org.flowable.engine.delegate.Expression 中注入值和方法表达式,这些表达式可以使用在 execute 方法中传递的 DelegateExecution 来求值/调用。

下面的示例类使用注入的表达式,并使用当前的 DelegateExecution 来解析它们。在传递 *gender* 变量时使用了 *genderBean* 方法调用。完整的代码和测试可以在 org.flowable.examples.bpmn.servicetask.JavaServiceTaskTest.testExpressionFieldInjection 中找到。

    <serviceTask id="javaService" name="Java service invocation"
      flowable:class="org.flowable.examples.bpmn.servicetask.ReverseStringsFieldInjected">

      <extensionElements>
        <flowable:field name="text1">
          <flowable:expression>${genderBean.getGenderString(gender)}</flowable:expression>
        </flowable:field>
        <flowable:field name="text2">
           <flowable:expression>Hello ${gender == 'male' ? 'Mr.' : 'Mrs.'} ${name}</flowable:expression>
        </flowable:field>
      </ extensionElements>
    </ serviceTask>

    public class ReverseStringsFieldInjected implements JavaDelegate {

      private Expression text1;
      private Expression text2;

      public void execute(DelegateExecution execution) {
        String value1 = (String) text1.getValue(execution);
        execution.setVariable("var1", new StringBuffer(value1).reverse().toString());

        String value2 = (String) text2.getValue(execution);
        execution.setVariable("var2", new StringBuffer(value2).reverse().toString());
      }
    }

另外,你也可以将表达式设置为属性而不是子元素,以使 XML 更简洁。

    <flowable:field name="text1" expression="${genderBean.getGenderString(gender)}" />
    <flowable:field name="text1" expression="Hello ${gender == 'male' ? 'Mr.' : 'Mrs.'} ${name}" />

#### 字段注入和线程安全

通常情况下,使用带有 Java 委托和字段注入的服务任务是线程安全的。但是,在某些情况下,线程安全性无法得到保证,这取决于 Flowable 运行的设置或环境。

使用 *flowable:class* 属性时,字段注入总是线程安全的。对于引用某个类的每个服务任务,都会实例化一个新实例,并且在创建实例时只注入一次字段。在不同的任务或流程定义中多次重用相同的类不会有问题。

使用 *flowable:expression* 属性时,不能使用字段注入。参数通过方法调用传递,这些调用始终是线程安全的。

使用 *flowable:delegateExpression* 属性时,委托实例的线程安全性将取决于表达式如何解析。如果委托表达式在各种任务或流程定义中重用,并且表达式始终返回相同的实例,那么使用字段注入**不是线程安全的**。让我们看几个例子来说明。

假设表达式是 *${factory.createDelegate(someVariable)}*,其中 factory 是引擎已知的 Java bean(例如,使用 Spring 集成时的 Spring bean),每次解析表达式时都会创建一个新实例。在这种情况下使用字段注入不会有线程安全性问题:每次解析表达式时,字段都会注入到这个新实例中。

但是,假设表达式是 *${someJavaDelegateBean}*,它解析为 JavaDelegate 类的实现,并且我们在一个为每个 bean 创建单例实例的环境中运行(例如 Spring,但也有许多其他环境)。在不同的任务或流程定义中使用此表达式时,表达式将始终解析为相同的实例。在这种情况下,使用字段注入不是线程安全的。例如:

    <serviceTask id="serviceTask1" flowable:delegateExpression="${someJavaDelegateBean}">
        <extensionElements>
            <flowable:field name="someField" expression="${input * 2}"/>
        </extensionElements>
    </serviceTask>

    <!-- other process definition elements -->

    <serviceTask id="serviceTask2" flowable:delegateExpression="${someJavaDelegateBean}">
        <extensionElements>
            <flowable:field name="someField" expression="${input * 2000}"/>
        </extensionElements>
    </serviceTask>

这个示例片段有两个使用相同委托表达式的服务任务,但为 *Expression* 字段注入不同的值。**如果表达式解析到同一个实例,在并发场景下当流程执行时注入字段 *someField* 可能会出现竞态条件**。

解决这个问题最简单的方法是:

- 重写 Java 委托以使用表达式,并通过方法参数将所需数据传递给委托。

- 每次解析委托表达式时返回委托类的新实例。例如,当使用 Spring 时,这意味着 bean 的作用域必须设置为 **prototype**(比如通过给委托类添加 @Scope(SCOPE_PROTOTYPE) 注解)。

从 Flowable v5.22 开始,可以通过设置 *delegateExpressionFieldInjectionMode* 属性的值(该属性接受 *org.flowable.engine.imp.cfg.DelegateExpressionFieldInjectionMode* 枚举中的值之一)来配置流程引擎,以禁用委托表达式上的字段注入。

可以使用以下设置:

- **DISABLED**: 在使用委托表达式时完全禁用字段注入。不会尝试任何字段注入。这是在线程安全性方面最安全的模式。

- **COMPATIBILITY**: 在此模式下,行为将与 v5.21 之前完全相同:使用委托表达式时可以进行字段注入,如果委托类上未定义字段,则会抛出异常。当然,这在线程安全性方面是最不安全的模式,但在需要向后兼容时可能是必需的,或者当委托表达式仅在一组流程定义中的一个任务上使用时(因此不会发生并发竞态条件)可以安全使用。

- **MIXED**: 允许在使用委托表达式时进行注入,但当委托上未定义字段时不会抛出异常。这允许混合行为,其中一些委托有注入(例如,因为它们不是单例)而另一些没有。

- **Flowable 5.x 版本的默认模式是 COMPATIBILITY。**

- **Flowable 6.x 版本的默认模式是 MIXED。**

举个例子,假设我们使用 *MIXED* 模式并使用 Spring 集成。假设我们在 Spring 配置中有以下 bean:

    <bean id="singletonDelegateExpressionBean"
      class="org.flowable.spring.test.fieldinjection.SingletonDelegateExpressionBean" />

    <bean id="prototypeDelegateExpressionBean"
      class="org.flowable.spring.test.fieldinjection.PrototypeDelegateExpressionBean"
      scope="prototype" />

第一个 bean 是一个常规的 Spring bean,因此是单例。第二个 bean 的作用域是 *prototype*,Spring 容器每次请求该 bean 时都会返回一个新实例。

给定以下流程定义:

    <serviceTask id="serviceTask1" flowable:delegateExpression="${prototypeDelegateExpressionBean}">
      <extensionElements>
        <flowable:field name="fieldA" expression="${input * 2}"/>
        <flowable:field name="fieldB" expression="${1 + 1}"/>
        <flowable:field name="resultVariableName" stringValue="resultServiceTask1"/>
      </extensionElements>
    </serviceTask>

    <serviceTask id="serviceTask2" flowable:delegateExpression="${prototypeDelegateExpressionBean}">
      <extensionElements>
        <flowable:field name="fieldA" expression="${123}"/>
        <flowable:field name="fieldB" expression="${456}"/>
        <flowable:field name="resultVariableName" stringValue="resultServiceTask2"/>
      </extensionElements>
    </serviceTask>

    <serviceTask id="serviceTask3" flowable:delegateExpression="${singletonDelegateExpressionBean}">
      <extensionElements>
        <flowable:field name="fieldA" expression="${input * 2}"/>
        <flowable:field name="fieldB" expression="${1 + 1}"/>
        <flowable:field name="resultVariableName" stringValue="resultServiceTask1"/>
      </extensionElements>
    </serviceTask>

    <serviceTask id="serviceTask4" flowable:delegateExpression="${singletonDelegateExpressionBean}">
      <extensionElements>
        <flowable:field name="fieldA" expression="${123}"/>
        <flowable:field name="fieldB" expression="${456}"/>
        <flowable:field name="resultVariableName" stringValue="resultServiceTask2"/>
      </extensionElements>
    </serviceTask>

我们有四个服务任务,其中第一个和第二个使用 *${prototypeDelegateExpressionBean}* 委托表达式,第三个和第四个使用 *${singletonDelegateExpressionBean}* 委托表达式。

让我们先看看原型 bean:

    public class PrototypeDelegateExpressionBean implements JavaDelegate {

      public static AtomicInteger INSTANCE_COUNT = new AtomicInteger(0);

      private Expression fieldA;
      private Expression fieldB;
      private Expression resultVariableName;

      public PrototypeDelegateExpressionBean() {
        INSTANCE_COUNT.incrementAndGet();
      }

      @Override
      public void execute(DelegateExecution execution) {

        Number fieldAValue = (Number) fieldA.getValue(execution);
        Number fieldValueB = (Number) fieldB.getValue(execution);

        int result = fieldAValue.intValue() + fieldValueB.intValue();
        execution.setVariable(resultVariableName.getValue(execution).toString(), result);
      }

    }

当我们在运行上述流程定义的流程实例后检查 *INSTANCE_COUNT* 时,会得到 *two* 的返回值,这是因为每次解析 *${prototypeDelegateExpressionBean}* 时都会创建一个新实例。这里可以毫无问题地注入字段,我们可以看到这三个 *Expression* 成员字段。

然而,单例 bean 看起来略有不同:

    public class SingletonDelegateExpressionBean implements JavaDelegate {

      public static AtomicInteger INSTANCE_COUNT = new AtomicInteger(0);

      public SingletonDelegateExpressionBean() {
        INSTANCE_COUNT.incrementAndGet();
      }

      @Override
      public void execute(DelegateExecution execution) {

        Expression fieldAExpression = DelegateHelper.getFieldExpression(execution, "fieldA");
        Number fieldA = (Number) fieldAExpression.getValue(execution);

        Expression fieldBExpression = DelegateHelper.getFieldExpression(execution, "fieldB");
        Number fieldB = (Number) fieldBExpression.getValue(execution);

        int result = fieldA.intValue() + fieldB.intValue();

        String resultVariableName = DelegateHelper.getFieldExpression(execution,
            "resultVariableName").getValue(execution).toString();
        execution.setVariable(resultVariableName, result);
      }

    }

这里的 *INSTANCE_COUNT* 将始终为 *one*,因为它是一个单例。在这个委托中,没有 *Expression* 成员字段。这在 *MIXED* 模式下是可能的。在 *COMPATIBILITY* 模式下,这会抛出异常,因为它期望存在成员字段。*DISABLED* 模式对这个 bean 也可以工作,但它会禁止使用上面使用字段注入的原型 bean。

在这个委托代码中,使用了 **org.flowable.engine.delegate.DelegateHelper** 类,它提供了一些有用的工具方法来执行相同的逻辑,但在委托是单例时以线程安全的方式执行。不是注入 *Expression*,而是通过 *getFieldExpression* 方法获取。这意味着在服务任务 XML 中,字段的定义与单例 bean 完全相同。如果你查看上面的 XML 片段,你可以看到它们在定义上是相同的,只有实现逻辑不同。

技术说明:*getFieldExpression* 将在方法执行时检查 BpmnModel 并动态创建 Expression,从而实现线程安全。

- 对于 Flowable v5.x,DelegateHelper 不能用于 *ExecutionListener* 或 *TaskListener*(由于架构缺陷)。要使这些监听器的实例线程安全,要么使用表达式,要么确保每次解析委托表达式时都创建一个新实例。

- 对于 Flowable v6.x,DelegateHelper 可以在 *ExecutionListener* 和 *TaskListener* 实现中工作。例如,在 v6.x 中,可以使用 **DelegateHelper** 编写以下代码:

<!-- -->

    <extensionElements>
      <flowable:executionListener
          delegateExpression="${testExecutionListener}" event="start">
        <flowable:field name="input" expression="${startValue}" />
        <flowable:field name="resultVar" stringValue="processStartValue" />
      </flowable:executionListener>
    </extensionElements>

其中 *testExecutionListener* 解析为一个实现了 ExecutionListener 接口的实例:

    @Component("testExecutionListener")
    public class TestExecutionListener implements ExecutionListener {

      @Override
      public void notify(DelegateExecution execution) {
        Expression inputExpression = DelegateHelper.getFieldExpression(execution, "input");
        Number input = (Number) inputExpression.getValue(execution);

        int result = input.intValue() * 100;

        Expression resultVarExpression = DelegateHelper.getFieldExpression(execution, "resultVar");
        execution.setVariable(resultVarExpression.getValue(execution).toString(), result);
      }

    }

#### 服务任务结果

服务执行的返回值(仅适用于使用表达式的服务任务)可以通过将流程变量名指定为服务任务定义的 *'flowable:resultVariable'* 属性的字面值,从而分配给现有的或新的流程变量。
特定流程变量的任何现有值都将被服务执行的结果值覆盖。
如果使用 *'flowable:useLocalScopeForResultVariable'*,则变量将被分配为本地变量。
当未指定结果变量名时,服务执行的结果值将被忽略。

    <serviceTask id="aMethodExpressionServiceTask"
        flowable:expression="#{myService.doSomething()}"
        flowable:resultVariable="myVar" />

在上面的示例中,服务执行的结果(在名为 *'myService'* 的对象上调用 *'doSomething()'* 方法的返回值,可以是流程变量中的对象,也可以是 Spring bean)在服务执行完成后被设置到名为 *'myVar'* 的流程变量中。

注意:当方法返回 `CompletableFuture<?>` 时,future 的结果将被设置到结果变量中。

#### 可触发

一个常见的模式是通过发送 JMS 消息或进行 HTTP 调用来触发外部服务,并让流程实例进入等待状态。然后在某个时刻,外部服务会返回响应,流程实例继续执行下一个活动。使用默认的 BPMN,你需要建模一个服务任务和一个接收任务。但是这会引入一些竞态条件,因为外部服务响应可能在流程实例被持久化且接收任务处于活动状态之前就返回了。为了解决这个问题,Flowable 在服务任务上支持一个 triggerable 属性,它将单个服务任务转换为一个任务,该任务将执行服务逻辑,然后在继续执行流程定义中的下一个活动之前等待外部触发。如果对可触发的服务任务也设置了 async 属性为 true,则首先会持久化流程实例状态,然后服务任务逻辑将在异步作业中执行。在 BPMN XML 中,异步可触发服务任务的实现方式如下:

    <serviceTask id="aTriggerableServiceTask"
        flowable:expression="#{myService.doSomething()}"
        flowable:triggerable="true"
        flowable:async="true" />

当外部服务想要再次触发等待的流程实例时,可以同步或异步地完成。为了防止乐观锁异常,异步触发是最佳解决方案。默认情况下,异步作业是独占的,这意味着流程实例将被锁定,并且保证流程实例上的其他活动不会干扰触发逻辑。可以使用 RuntimeService 的 triggerAsync 方法以异步方式触发等待的流程实例。当然,也可以使用 RuntimeService 的 trigger 方法以同步方式来完成这个操作。

#### 处理异常

当执行自定义逻辑时,通常需要捕获某些业务异常并在周围的流程中处理它们。Flowable 提供了不同的选项来实现这一点。

##### 抛出 BPMN 错误

可以从服务任务或脚本任务中的用户代码抛出 BPMN 错误。为此,可以在 JavaDelegates、FutureJavaDelegates、脚本、表达式和委托表达式中抛出一个名为 *BpmnError* 的特殊 FlowableException。引擎将捕获此异常并将其转发给适当的错误处理程序,例如边界错误事件或错误事件子流程。

    public class ThrowBpmnErrorDelegate implements JavaDelegate {

      public void execute(DelegateExecution execution) throws Exception {
        try {
          executeBusinessLogic();
        } catch (BusinessException e) {
          throw new BpmnError("BusinessExceptionOccurred");
        }
      }

    }

构造函数参数是一个错误代码,它将用于确定负责处理该错误的错误处理程序。有关如何捕获 BPMN 错误的信息,请参见[边界错误事件](bpmn/ch07b-BPMN-Constructs.md#error-boundary-event)。

此机制**仅应用于**将由流程定义中建模的边界错误事件或错误事件子流程处理的**业务故障**。技术错误应该由其他异常类型表示,通常不在流程内部处理。

##### 异常映射

也可以使用 mapException 扩展直接将 Java 异常映射到业务异常。单一映射是最简单的形式:

    <serviceTask id="servicetask1" name="Service Task" flowable:class="...">
      <extensionElements>
        <flowable:mapException
              errorCode="myErrorCode1">org.flowable.SomeException</flowable:mapException>
      </extensionElements>
    </serviceTask>

在上面的代码中,如果在服务任务中抛出了 org.flowable.SomeException 的实例,它将被捕获并转换为具有给定 errorCode 的 BPMN 异常。从这一点开始,它将被完全按照普通的 BPMN 异常来处理。
任何其他异常都将被视为没有映射,它将被传播给 API 调用者。

可以使用 includeChildExceptions 属性在一行中映射某个异常的所有子异常。

    <serviceTask id="servicetask1" name="Service Task" flowable:class="...">
      <extensionElements>
        <flowable:mapException errorCode="myErrorCode1"
               includeChildExceptions="true">org.flowable.SomeException</flowable:mapException>
      </extensionElements>
    </serviceTask>

上面的代码将使 Flowable 将 SomeException 的任何直接或间接后代转换为具有给定错误代码的 BPMN 错误。
如果未给出 includeChildExceptions,则将其视为 "false"。

最通用的映射是默认映射,即没有类的映射。它将匹配任何 Java 异常:

    <serviceTask id="servicetask1" name="Service Task" flowable:class="...">
      <extensionElements>
        <flowable:mapException errorCode="myErrorCode1"/>
      </extensionElements>
    </serviceTask>

映射按从上到下的顺序检查,并遵循找到的第一个匹配项,但默认映射除外。只有在所有映射都检查失败后才会选择默认映射。
只有第一个没有类的映射才会被视为默认映射。在默认映射中会忽略 includeChildExceptions。

##### 异常顺序流

[\[INTERNAL: 非公开实现类\]](internal)

另一个选项是在发生某些异常时通过不同的路径来路由流程执行。以下示例展示了如何实现这一点。

    <serviceTask id="javaService"
      name="Java service invocation"
      flowable:class="org.flowable.ThrowsExceptionBehavior">
    </serviceTask>

    <sequenceFlow id="no-exception" sourceRef="javaService" targetRef="theEnd" />
    <sequenceFlow id="exception" sourceRef="javaService" targetRef="fixException" />

这里,服务任务有两个输出顺序流,分别命名为 exception 和 no-exception。如果发生异常,将使用顺序流 ID 来指导流程流向:

    public class ThrowsExceptionBehavior implements ActivityBehavior {

      public void execute(DelegateExecution execution) {
        String var = (String) execution.getVariable("var");

        String sequenceFlowToTake = null;
        try {
          executeLogic(var);
          sequenceFlowToTake = "no-exception";
        } catch (Exception e) {
          sequenceFlowToTake = "exception";
        }
        DelegateHelper.leaveDelegate(execution, sequenceFlowToTake);
      }

    }

#### 在 JavaDelegate 中使用 Flowable 服务

在某些用例中,可能需要在 Java 服务任务中使用 Flowable 服务(例如,如果 callActivity 不适合您的需求,则通过 RuntimeService 启动流程实例)。

    public class StartProcessInstanceTestDelegate implements JavaDelegate {

      public void execute(DelegateExecution execution) throws Exception {
        RuntimeService runtimeService = Context.getProcessEngineConfiguration().getRuntimeService();
        runtimeService.startProcessInstanceByKey("myProcess");
      }

    }

所有的 Flowable 服务 API 都可以通过这个接口使用。

使用这些 API 调用而产生的所有数据更改都将作为当前事务的一部分。这在具有依赖注入的环境中也可以工作,比如带有或不带有 JTA 启用数据源的 Spring 和 CDI。例如,下面的代码片段将执行与上面的片段相同的操作,但现在 RuntimeService 是通过依赖注入获得的,而不是通过 *org.flowable.engine.EngineServices* 接口获取。

    @Component("startProcessInstanceDelegate")
    public class StartProcessInstanceTestDelegateWithInjection {

        @Autowired
        private RuntimeService runtimeService;

        public void startProcess() {
          runtimeService.startProcessInstanceByKey("oneTaskProcess");
        }

    }

**重要技术说明:** 由于服务调用是作为当前事务的一部分执行的,因此在服务任务执行之*前*产生或修改的任何数据都还没有刷新到数据库中。所有的 API 调用都是基于数据库数据工作的,这意味着这些未提交的更改在服务任务的 API 调用中是"不可见"的。

### Web 服务任务

#### 描述

Web 服务任务用于同步调用外部 Web 服务。

#### 图形表示法

Web 服务任务的可视化方式与 Java 服务任务相同。

![bpmn.web.service.task](assets/bpmn/bpmn.web.service.task.png)

#### XML 表示

要使用 Web 服务,我们需要导入其操作和复杂类型。这可以通过使用指向 Web 服务的 WSDL 的 import 标签自动完成:

    <import importType="http://schemas.xmlsoap.org/wsdl/"
        location="http://localhost:63081/counter?wsdl"
        namespace="http://webservice.flowable.org/" />

上述声明告诉 Flowable 导入定义,但它不会为你创建项目定义和消息。假设我们要调用一个名为 'prettyPrint' 的特定方法,因此我们需要为请求和响应消息创建相应的消息和项目定义:

    <message id="prettyPrintCountRequestMessage" itemRef="tns:prettyPrintCountRequestItem" />
    <message id="prettyPrintCountResponseMessage" itemRef="tns:prettyPrintCountResponseItem" />

    <itemDefinition id="prettyPrintCountRequestItem" structureRef="counter:prettyPrintCount" />
    <itemDefinition id="prettyPrintCountResponseItem" structureRef="counter:prettyPrintCountResponse" />

在声明服务任务之前,我们必须定义实际引用 Web 服务的 BPMN 接口和操作。基本上,我们定义"接口"和所需的"操作"。对于每个操作,我们重用之前定义的消息作为"输入"和"输出"。例如,以下声明定义了"counter"接口和"prettyPrintCountOperation"操作:

    <interface name="Counter Interface" implementationRef="counter:Counter">
        <operation id="prettyPrintCountOperation" name="prettyPrintCount Operation"
                implementationRef="counter:prettyPrintCount">
            <inMessageRef>tns:prettyPrintCountRequestMessage</inMessageRef>
            <outMessageRef>tns:prettyPrintCountResponseMessage</outMessageRef>
        </operation>
    </interface>

然后我们可以通过使用 \#\#WebService 实现和对 Web 服务操作的引用来声明一个 Web 服务任务。

    <serviceTask id="webService"
        name="Web service invocation"
        implementation="##WebService"
        operationRef="tns:prettyPrintCountOperation">

#### Web 服务任务 IO 规范

除非我们使用简化方法来处理数据输入和输出关联(见下文),否则每个 Web 服务任务都需要声明一个 IO 规范来指定任务的输入和输出。这种方法非常直接且符合 BPMN 2.0 规范,对于我们的 prettyPrint 示例,我们根据之前声明的项目定义来定义输入和输出集:

    <ioSpecification>
        <dataInput itemSubjectRef="tns:prettyPrintCountRequestItem" id="dataInputOfServiceTask" />
        <dataOutput itemSubjectRef="tns:prettyPrintCountResponseItem" id="dataOutputOfServiceTask" />
        <inputSet>
            <dataInputRefs>dataInputOfServiceTask</dataInputRefs>
        </inputSet>
        <outputSet>
            <dataOutputRefs>dataOutputOfServiceTask</dataOutputRefs>
        </outputSet>
    </ioSpecification>

#### Web 服务任务数据输入关联

有两种指定数据输入关联的方式:

- 使用表达式

- 使用简化方法

要使用表达式指定数据输入关联,我们需要定义源项和目标项,并指定每个项的字段之间的相应赋值。在下面的示例中,我们为这些项分配前缀和后缀字段:

    <dataInputAssociation>
        <sourceRef>dataInputOfProcess</sourceRef>
        <targetRef>dataInputOfServiceTask</targetRef>
        <assignment>
            <from>${dataInputOfProcess.prefix}</from>
            <to>${dataInputOfServiceTask.prefix}</to>
        </assignment>
        <assignment>
            <from>${dataInputOfProcess.suffix}</from>
            <to>${dataInputOfServiceTask.suffix}</to>
        </assignment>
    </dataInputAssociation>

另一方面,我们可以使用简化方法,这种方法更加直接。'sourceRef' 元素是一个 Flowable 变量名,而 'targetRef' 元素是项目定义的一个属性。在下面的示例中,我们将变量 'PrefixVariable' 的值分配给 'prefix' 字段,将变量 'SuffixVariable' 的值分配给 'suffix' 字段。

    <dataInputAssociation>
        <sourceRef>PrefixVariable</sourceRef>
        <targetRef>prefix</targetRef>
    </dataInputAssociation>
    <dataInputAssociation>
        <sourceRef>SuffixVariable</sourceRef>
        <targetRef>suffix</targetRef>
    </dataInputAssociation>

#### Web 服务任务数据输出关联

有两种指定数据输出关联的方式:

- 使用表达式

- 使用简化方法

要使用表达式指定数据输出关联,我们需要定义目标变量和源表达式。这种方法非常直接,与数据输入关联类似:

    <dataOutputAssociation>
        <targetRef>dataOutputOfProcess</targetRef>
        <transformation>${dataOutputOfServiceTask.prettyPrint}</transformation>
    </dataOutputAssociation>

另外,我们也可以使用简化方法,这种方法更加直接。'sourceRef' 元素是项目定义的一个属性,而 'targetRef' 元素是一个 Flowable 变量名。这种方法非常简单,与数据输入关联类似:

    <dataOutputAssociation>
        <sourceRef>prettyPrint</sourceRef>
        <targetRef>OutputVariable</targetRef>
    </dataOutputAssociation>

### 业务规则任务

#### 描述

业务规则任务用于同步执行一个或多个规则。Flowable 使用 Drools Expert(Drools 规则引擎)来执行业务规则。目前,包含业务规则的 .drl 文件必须与定义了业务规则任务的流程定义一起部署。这意味着流程中使用的所有 .drl 文件都必须打包在流程 BAR 文件中,就像任务表单等一样。有关创建 Drools Expert 业务规则的更多信息,请参阅 [JBoss Drools](http://www.jboss.org/drools/documentation) 文档。

如果你想插入自己的规则任务实现(例如,因为你想以不同方式使用 Drools 或者想使用完全不同的规则引擎),那么你可以在 BusinessRuleTask 上使用 class 或 expression 属性,它的行为将与 [服务任务](bpmn/ch07b-BPMN-Constructs.md#java-service-task) 完全相同。

#### 图形表示法

业务规则任务使用表格图标进行可视化表示。

![bpmn.business.rule.task](assets/bpmn/bpmn.business.rule.task.png)

#### XML 表示

要执行与流程定义部署在同一个 BAR 文件中的一个或多个业务规则,我们需要定义输入和结果变量。对于输入变量定义,可以定义一个以逗号分隔的流程变量列表。输出变量定义只能包含一个变量名,该变量名将用于在流程变量中存储已执行业务规则的输出对象。请注意,结果变量将包含一个对象列表。如果默认情况下未指定结果变量名,将使用 org.flowable.engine.rules.OUTPUT。

以下业务规则任务执行随流程定义一起部署的所有业务规则:

    <process id="simpleBusinessRuleProcess">

      <startEvent id="theStart" />
      <sequenceFlow sourceRef="theStart" targetRef="businessRuleTask" />

      <businessRuleTask id="businessRuleTask" flowable:ruleVariablesInput="${order}"
          flowable:resultVariable="rulesOutput" />

      <sequenceFlow sourceRef="businessRuleTask" targetRef="theEnd" />

      <endEvent id="theEnd" />

    </process>

业务规则任务也可以配置为只执行已部署的 .drl 文件中的特定规则集。必须为此指定以逗号分隔的规则名称列表。

    <businessRuleTask id="businessRuleTask" flowable:ruleVariablesInput="${order}"
          flowable:rules="rule1, rule2" />

在这种情况下,只执行 rule1 和 rule2。

你也可以定义一个应该从执行中排除的规则列表。

    <businessRuleTask id="businessRuleTask" flowable:ruleVariablesInput="${order}"
          flowable:rules="rule1, rule2" exclude="true" />

在这种情况下,将执行与流程定义部署在同一个 BAR 文件中的所有规则,但 rule1 和 rule2 除外。

如前所述,另一个选项是自己实现 BusinessRuleTask:

    <businessRuleTask id="businessRuleTask" flowable:class="${MyRuleServiceDelegate}" />

现在 BusinessRuleTask 的行为与 ServiceTask 完全相同,但仍保留 BusinessRuleTask 图标以显示我们正在进行业务规则处理。

### Email 任务

Flowable 允许你通过自动邮件服务任务来增强业务流程,这些任务可以向一个或多个收件人发送电子邮件,包括支持抄送、密送、HTML 内容等功能。请注意,邮件任务**不是** BPMN 2.0 规范中的"官方"任务(因此也没有专门的图标)。因此,在 Flowable 中,邮件任务是作为一个专用的服务任务来实现的。

#### 邮件服务器配置

Flowable 引擎通过具有 SMTP 功能的外部邮件服务器发送电子邮件。要实际发送电子邮件,引擎需要知道如何连接邮件服务器。以下属性可以在 *flowable.cfg.xml* 配置文件中设置:

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>属性</th>
<th>是否必需?</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>mailServerHost</p></td>
<td><p>否</p></td>
<td><p>邮件服务器的主机名(例如,mail.mycorp.com)。默认值为 localhost</p></td>
</tr>
<tr class="even">
<td><p>mailServerPort</p></td>
<td><p>如果不使用默认端口则必需</p></td>
<td><p>邮件服务器上的 SMTP 通信端口。默认值为 <em>25</em></p></td>
</tr>
<tr class="odd">
<td><p>mailServerForceTo</p></td>
<td><p>否</p></td>
<td><p>如果设置,在发送邮件时将用作邮件任务中配置的收件人、抄送和/或密送的替代值。</p></td>
</tr>
<tr class="even">
<td><p>mailServerDefaultFrom</p></td>
<td><p>否</p></td>
<td><p>当用户未提供时使用的默认发件人电子邮件地址。默认值为 <em>flowable@localhost</em></p></td>
</tr>
<tr class="odd">
<td><p>mailServerUsername</p></td>
<td><p>如果服务器需要则必需</p></td>
<td><p>某些邮件服务器需要凭据才能发送电子邮件。默认不设置。</p></td>
</tr>
<tr class="even">
<td><p>mailServerPassword</p></td>
<td><p>如果服务器需要则必需</p></td>
<td><p>某些邮件服务器需要凭据才能发送电子邮件。默认不设置。</p></td>
</tr>
<tr class="odd">
<td><p>mailServerUseSSL</p></td>
<td><p>如果服务器需要则必需</p></td>
<td><p>某些邮件服务器需要 SSL 通信。默认设置为 false。</p></td>
</tr>
<tr class="even">
<td><p>mailServerUseTLS</p></td>
<td><p>如果服务器需要则必需</p></td>
<td><p>某些邮件服务器(例如 gmail)需要 TLS 通信。默认设置为 false。</p></td>
</tr>
</tbody>
</table>

#### 定义邮件任务

邮件任务是作为一个专用的[服务任务](bpmn/ch07b-BPMN-Constructs.md#java-service-task)来实现的,通过将服务任务的 *type* 设置为 *'mail'* 来定义。

    <serviceTask id="sendMail" flowable:type="mail">

邮件任务通过[字段注入](bpmn/ch07b-BPMN-Constructs.md#field-injection)进行配置。这些属性的所有值都可以包含 EL 表达式,这些表达式在流程执行期间的运行时进行解析。可以设置以下属性:

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>属性</th>
<th>是否必需?</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>to</p></td>
<td><p>是</p></td>
<td><p>电子邮件的收件人。多个收件人以逗号分隔的列表形式定义</p></td>
</tr>
<tr class="even">
<td><p>from</p></td>
<td><p>否</p></td>
<td><p>发件人电子邮件地址。如果未提供,则使用<a href="#bpmnEmailTaskServerConfiguration">默认配置的</a>发件人地址。</p></td>
</tr>
<tr class="odd">
<td><p>subject</p></td>
<td><p>否</p></td>
<td><p>电子邮件的主题。</p></td>
</tr>
<tr class="even">
<td><p>cc</p></td>
<td><p>否</p></td>
<td><p>电子邮件的抄送人。多个收件人以逗号分隔的列表形式定义</p></td>
</tr>
<tr class="odd">
<td><p>bcc</p></td>
<td><p>否</p></td>
<td><p>电子邮件的密送人。多个收件人以逗号分隔的列表形式定义</p></td>
</tr>
<tr class="even">
<td><p>charset</p></td>
<td><p>否</p></td>
<td><p>允许指定电子邮件的字符集,这对许多非英语语言来说是必需的。</p></td>
</tr>
<tr class="odd">
<td><p>html</p></td>
<td><p>否</p></td>
<td><p>作为电子邮件内容的 HTML 片段。</p></td>
</tr>
<tr class="even">
<td><p>text</p></td>
<td><p>否</p></td>
<td><p>电子邮件的内容,用于需要发送纯文本、非富文本的电子邮件。可以与 <em>html</em> 结合使用,用于不支持富文本内容的电子邮件客户端。这种情况下电子邮件客户端可以回退使用这个纯文本替代内容。</p></td>
</tr>
</tbody>
</table>

#### 使用示例

以下 XML 片段展示了使用邮件任务的示例。

    <serviceTask id="sendMail" flowable:type="mail">
      <extensionElements>
        <flowable:field name="from" stringValue="order-shipping@thecompany.com" />
        <flowable:field name="to" expression="${recipient}" />
        <flowable:field name="subject" expression="Your order ${orderId} has been shipped" />
        <flowable:field name="html">
          <flowable:expression>
            <![CDATA[
              <html>
                <body>
                  Hello ${male ? 'Mr.' : 'Mrs.' } ${recipientName},<br/><br/>

                  As of ${now}, your order has been <b>processed and shipped</b>.<br/><br/>

                  Kind regards,<br/>

                  TheCompany.
                </body>
              </html>
            ]]>
          </flowable:expression>
        </flowable:field>
      </extensionElements>
    </serviceTask>

### Http 任务

Http 任务允许发送 HTTP 请求,增强了 Flowable 的集成功能。请注意,Http 任务**不是** BPMN 2.0 规范中的"官方"任务(因此也没有专门的图标)。因此,在 Flowable 中,Http 任务是作为一个专用的服务任务来实现的。

#### Http 客户端配置

Flowable 引擎通过可配置的 Http 客户端发送 Http 请求。如果未设置,将使用默认设置。

配置示例:

      <bean id="processEngineConfiguration"
            class="org.flowable.engine.impl.cfg.StandaloneProcessEngineConfiguration">
        <!-- http client configurations -->
        <property name="httpClientConfig" ref="httpClientConfig"/>
      </bean>

      <bean id="httpClientConfig" class="org.flowable.engine.cfg.HttpClientConfig">
        <property name="connectTimeout" value="5000"/>
        <property name="socketTimeout" value="5000"/>
        <property name="connectionRequestTimeout" value="5000"/>
        <property name="requestRetryLimit" value="5"/>
      </bean>

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>属性</th>
<th>是否必需?</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>connectTimeout</p></td>
<td><p>否</p></td>
<td><p>连接超时时间(毫秒)。<br />
默认设置为 5000。</p></td>
</tr>
<tr class="even">
<td><p>socketTimeout</p></td>
<td><p>否</p></td>
<td><p>Socket 超时时间(毫秒)。<br />
默认设置为 5000。</p></td>
</tr>
<tr class="odd">
<td><p>connectionRequestTimeout</p></td>
<td><p>否</p></td>
<td><p>连接请求超时时间(毫秒)。<br />
默认设置为 5000。</p></td>
</tr>
<tr class="even">
<td><p>requestRetryLimit</p></td>
<td><p>否</p></td>
<td><p>请求重试次数限制('0' 表示不重试)。<br />
默认设置为 3。</p></td>
</tr>
<tr class="odd">
<td><p>disableCertVerify</p></td>
<td><p>否</p></td>
<td><p>禁用 SSL 证书验证的标志。<br />
默认设置为 false。</p></td>
</tr>
</tbody>
</table>

#### 定义 Http 任务

Http 任务是作为一个专用的[服务任务](bpmn/ch07b-BPMN-Constructs.md#java-service-task)来实现的,通过将服务任务的 *type* 设置为 *'http'* 来定义。

    <serviceTask id="httpGet" flowable:type="http">

可以通过提供自定义实现来覆盖默认的 Http 任务行为。
自定义实现应该继承 org.flowable.engine.impl.bpmn.http.DefaultBpmnHttpActivityDelegate 并重写你需要的方法。

字段 'httpActivityBehaviorClass' 应该在任务定义中设置(此字段的默认值是 'org.flowable.engine.impl.bpmn.http.DefaultBpmnHttpActivityDelegate')。

http 客户端通过 `FlowableHttpClient` 进行抽象。当使用 `flowable-http` 依赖时,默认实现基于 Apache Http Client。
由于 Apache Http Client 可以通过多种方式进行自定义,因此并非所有可能的选项都在 Http Client 配置中使用。
还有一个基于 Spring WebClient 的实现,当 Apache Http Client 不在类路径上时将使用该实现。

要创建自定义客户端,请参考 [Http Client builder](http://hc.apache.org/httpcomponents-client-ga/httpclient/apidocs/org/apache/http/impl/client/HttpClientBuilder.html)

    <serviceTask id="httpGet" flowable:type="http">
      <extensionElements>
        <flowable:field name="httpActivityBehaviorClass">
            <flowable:string>
              <![CDATA[org.example.flowable.HttpActivityBehaviorCustomImpl]]>
            </flowable:string>
        </flowable:field>
      </extensionElements>
    </serviceTask>

#### Http 任务配置

Http 任务通过[字段注入](bpmn/ch07b-BPMN-Constructs.md#field-injection)进行配置。这些属性的所有值都可以包含 EL 表达式,这些表达式在流程执行期间的运行时进行解析。可以设置以下属性:

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>属性</th>
<th>是否必需?</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>requestMethod</p></td>
<td><p>是</p></td>
<td><p>请求方法<br />
(GET,POST,PUT,DELETE)。</p></td>
</tr>
<tr class="even">
<td><p>requestUrl</p></td>
<td><p>是</p></td>
<td><p>请求 URL<br />
(示例 - <a href="http://flowable.org">http://flowable.org</a>)。</p></td>
</tr>
<tr class="odd">
<td><p>requestHeaders</p></td>
<td><p>否</p></td>
<td><p>按行分隔的 Http 请求头。<br />
示例 -<br />
Content-Type: application/json<br />
Authorization: Basic aGFRlc3Q=</p></td>
</tr>
<tr class="even">
<td><p>requestBody</p></td>
<td><p>否</p></td>
<td><p>请求体<br />
示例 - ${sampleBody}</p></td>
</tr>
<tr class="odd">
<td><p>requestTimeout</p></td>
<td><p>否</p></td>
<td><p>请求超时时间(毫秒)<br />
(示例 - 5000)。<br />
默认值为 '0',表示无超时。<br />
有关连接相关的超时,请参考 <a href="#bpmnHttpTaskClientConfiguration">Http 客户端配置</a>。</p></td>
</tr>
<tr class="even">
<td><p>disallowRedirects</p></td>
<td><p>否</p></td>
<td><p>禁止 Http 重定向的标志。<br />
默认为 false。<br />
(示例 - true)。</p></td>
</tr>
<tr class="odd">
<td><p>failStatusCodes</p></td>
<td><p>否</p></td>
<td><p>使请求失败并抛出 FlowableException 的 Http 响应状态码列表,以逗号分隔。<br />
示例: 400, 404, 500, 503<br />
示例: 400, 5XX</p></td>
</tr>
<tr class="odd">
<td><p>ignoreException</p></td>
<td><p>否</p></td>
<td><p>忽略异常的标志。异常会被捕获并存储为名为 '&lt;taskId&gt;ErrorMessage' 的变量。</p></td>
</tr>
<tr class="even">
<td><p>saveRequestVariables</p></td>
<td><p>否</p></td>
<td><p>保存请求变量的标志。<br />
默认情况下,只有响应相关的变量会被存储为变量。</p></td>
</tr>
<tr class="odd">
<td><p>saveResponseParameters</p></td>
<td><p>否</p></td>
<td><p>保存所有响应变量(包括 HTTP 状态、头信息等)的标志。<br />
默认情况下,只有响应体会被存储为变量。</p></td>
</tr>
<tr class="even">
<td><p>resultVariablePrefix</p></td>
<td><p>否</p></td>
<td><p>执行变量名称的前缀。<br />
如果未设置前缀,变量将以 '&lt;taskId&gt;FieldName' 的形式保存。<br />
例如,对于 id 为 'task7' 的任务,requestUrl 保存为 'task7RequestUrl'。</p></td>
</tr>
<tr class="odd">
<td><p>saveResponseParametersTransient</p></td>
<td><p>否</p></td>
<td><p>如果设置为 true,响应体变量(以及响应头、状态等如果设置为存储)将作为瞬时变量存储。</p></td>
</tr>
<tr class="even">
<td><p>saveResponseVariableAsJson</p></td>
<td><p>否</p></td>
<td><p>如果设置为 true,响应体值将作为 JSON 变量而不是字符串存储。当 HTTP 服务返回 JSON 且你想要使用点号表示法引用字段时(例如 <em>myResponse.user.name</em>)这很有用。</p></td>
</tr>
<tr class="odd">
<td><p>parallelInSameTransaction</p></td>
<td><p>-</p></td>
<td><p>如果设置为 true,HTTP 调用将在不同的线程上执行,从而可以并行执行多个 HTTP 任务。当使用并行网关且在并行流中有多个 HTTP 任务时,这很有用。</p></td>
</tr>
<tr class="even">
<td><p>httpActivityBehaviorClass</p></td>
<td><p>否</p></td>
<td><p>org.flowable.engine.impl.bpmn.http.DefaultBpmnHttpActivityDelegate 的自定义扩展的完整类名。</p></td>
</tr>
</tbody>
</table>

除了上述字段外,根据 'saveResponseParameters' 标志的设置,以下内容将在成功执行时被设置为变量。

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>变量</th>
<th>是否可选?</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>responseProtocol</p></td>
<td><p>是</p></td>
<td><p>Http 版本</p></td>
</tr>
<tr class="even">
<td><p>responseReason</p></td>
<td><p>是</p></td>
<td><p>Http 响应原因短语</p></td>
</tr>
<tr class="odd">
<td><p>responseStatusCode</p></td>
<td><p>是</p></td>
<td><p>Http 响应状态码(示例 - 200)</p></td>
</tr>
<tr class="even">
<td><p>responseHeaders</p></td>
<td><p>是</p></td>
<td><p>按行分隔的 Http 响应头<br />
示例 -<br />
Content-Type: application/json<br />
Content-Length: 777</p></td>
</tr>
<tr class="odd">
<td><p>responseBody</p></td>
<td><p>是</p></td>
<td><p>响应体字符串(如果有)</p></td>
</tr>
<tr class="even">
<td><p>errorMessage</p></td>
<td><p>是</p></td>
<td><p>被忽略的错误消息(如果有)</p></td>
</tr>
</tbody>
</table>

#### 结果变量

请记住,上述所有执行变量名都会以 'resultVariablePrefix' 的求值结果作为前缀。
例如,响应状态码可以在另一个活动中通过 'task7ResponseStatusCode' 访问。
这里的 'task7' 是服务任务的 'id'。要覆盖此行为,请根据需要设置 'resultVariablePrefix'。

#### 使用示例

以下 XML 片段展示了使用 Http 任务的示例。

    <serviceTask id="httpGet" flowable:type="http">
      <extensionElements>
        <flowable:field name="requestMethod" stringValue="GET" />
        <flowable:field name="requestUrl" stringValue="http://flowable.org" />
        <flowable:field name="requestHeaders">
          <flowable:expression>
            <![CDATA[
              Accept: text/html
              Cache-Control: no-cache
            ]]>
          </flowable:expression>
        </flowable:field>
        <flowable:field name="requestTimeout">
          <flowable:expression>
            <![CDATA[
              ${requestTimeout}
            ]]>
          </flowable:expression>
        </flowable:field>
        <flowable:field name="resultVariablePrefix">
          <flowable:string>task7</flowable:string>
        </flowable:field>
      </extensionElements>
    </serviceTask>

#### 错误处理

默认情况下,当发生连接、IO 或任何未处理的异常时,Http 任务会抛出 FlowableException。
默认情况下,任何重定向/客户端/服务器错误的 http 状态码都不会被处理。

可以通过设置 'failStatusCodes' 和/或 'handleStatusCodes' 字段来配置 Http 任务以处理异常和 http 状态。请参考 [Http 任务配置](bpmn/ch07b-BPMN-Constructs.md#-http-task-configuration)。

由 'handleStatusCodes' 抛出的 BpmnError 应该像普通的 BPMN 异常一样处理,即通过相应的边界错误事件来处理。
以下是 http 任务异常处理和重试的一些示例。

##### 对 '400' 和 5XX 失败,异步 http 任务以及使用 failedJobRetryTimeCycle 重试

    <serviceTask id="failGet" name="Fail test" flowable:async="true" flowable:type="http">
      <extensionElements>
        <flowable:field name="requestMethod">
          <flowable:string><![CDATA[GET]]></flowable:string>
        </flowable:field>
        <flowable:field name="requestUrl">
          <flowable:string><![CDATA[http://localhost:9798/api/fail]]></flowable:string>
        </flowable:field>
        <flowable:field name="failStatusCodes">
          <flowable:string><![CDATA[400, 5XX]]></flowable:string>
        </flowable:field>
        <flowable:failedJobRetryTimeCycle>R3/PT5S</flowable:failedJobRetryTimeCycle>
      </extensionElements>
    </serviceTask>

##### 将 '400' 作为 BpmnError 处理

    <serviceTask id="handleGet" name="HTTP Task" flowable:type="http">
      <extensionElements>
        <flowable:field name="requestMethod">
          <flowable:string><![CDATA[GET]]></flowable:string>
        </flowable:field>
        <flowable:field name="requestUrl">
          <flowable:string><![CDATA[http://localhost:9798/api/fail]]></flowable:string>
        </flowable:field>
        <flowable:field name="handleStatusCodes">
          <flowable:string><![CDATA[4XX]]></flowable:string>
        </flowable:field>
      </extensionElements>
    </serviceTask>
    <boundaryEvent id="catch400" attachedToRef="handleGet">
      <errorEventDefinition errorRef="HTTP400"></errorEventDefinition>
    </boundaryEvent>

##### 忽略异常

    <serviceTask id="ignoreTask" name="Fail test" flowable:type="http">
      <extensionElements>
        <flowable:field name="requestMethod">
          <flowable:string><![CDATA[GET]]></flowable:string>
        </flowable:field>
        <flowable:field name="requestUrl">
          <flowable:string><![CDATA[http://nohost:9798/api]]></flowable:string>
        </flowable:field>
        <flowable:field name="ignoreException">
          <flowable:string><![CDATA[true]]></flowable:string>
        </flowable:field>
      </extensionElements>
    </serviceTask>

##### 异常映射

参考[异常映射](bpmn/ch07b-BPMN-Constructs.md#exception-mapping)

### Camel 任务

Camel 任务允许你向 Camel 发送消息并从中接收消息,从而增强了 Flowable 的集成功能。请注意,Camel 任务**不是** BPMN 2.0 规范中的"官方"任务(因此也没有专门的图标)。因此,在 Flowable 中,Camel 任务是作为一个专用的服务任务来实现的。另外还要注意,你必须在项目中包含 Flowable Camel 模块才能使用 Camel 任务功能。

#### 定义 Camel 任务

Camel 任务是作为一个专用的[服务任务](bpmn/ch07b-BPMN-Constructs.md#java-service-task)来实现的,通过将服务任务的 *type* 设置为 *'camel'* 来定义。

    <serviceTask id="sendCamel" flowable:type="camel">

流程定义本身除了在服务任务上定义 camel 类型外不需要其他内容。所有集成逻辑都委托给 Camel 容器。默认情况下,Flowable 引擎会在 Spring 容器中查找 camelContext bean。camelContext bean 定义了将由 Camel 容器加载的 Camel 路由。在下面的示例中,路由是从特定的 Java 包中加载的,但你也可以直接在 Spring 配置中定义路由。

    <camelContext id="camelContext" xmlns="http://camel.apache.org/schema/spring">
      <packageScan>
        <package>org.flowable.camel.route</package>
      </packageScan>
    </camelContext>

有关 Camel 路由的更多文档,你可以查看 [Camel 网站](http://camel.apache.org/)。基本概念通过以下几个小示例进行演示。在第一个示例中,我们将从 Flowable 工作流中进行最简单形式的 Camel 调用。让我们称之为 SimpleCamelCall。

如果你想定义多个 Camel 上下文 bean 或想使用不同的 bean 名称,可以在 Camel 任务定义中像这样覆盖它:

    <serviceTask id="serviceTask1" flowable:type="camel">
      <extensionElements>
        <flowable:field name="camelContext" stringValue="customCamelContext" />
      </extensionElements>
    </serviceTask>

#### 简单 Camel 调用示例

与此示例相关的所有文件都可以在 flowable-camel 模块的 org.flowable.camel.examples.simpleCamelCall 包中找到。该目标只是激活一个特定的 Camel 路由。首先,我们需要一个包含前面提到的路由介绍的 Spring 上下文。以下内容满足了这个目的:

    <camelContext id="camelContext" xmlns="http://camel.apache.org/schema/spring">
      <packageScan>
        <package>org.flowable.camel.examples.simpleCamelCall</package>
      </packageScan>
    </camelContext>

    public class SimpleCamelCallRoute extends RouteBuilder {

      @Override
      public void configure() throws Exception {
        from("flowable:SimpleCamelCallProcess:simpleCall").to("log:org.flowable.camel.examples.SimpleCamelCall");
      }
    }

该路由仅记录消息体,没有其他操作。注意 from 端点的格式。它由三部分组成:

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>端点 URL 部分</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>flowable</p></td>
<td><p>指向引擎端点</p></td>
</tr>
<tr class="even">
<td><p>SimpleCamelCallProcess</p></td>
<td><p>流程的名称</p></td>
</tr>
<tr class="odd">
<td><p>simpleCall</p></td>
<td><p>流程中 Camel 服务的名称</p></td>
</tr>
</tbody>
</table>

好了,我们的路由现在已经正确配置并可以被 Camel 访问了。接下来是工作流部分。工作流看起来像这样:

    <process id="SimpleCamelCallProcess">
      <startEvent id="start"/>
      <sequenceFlow id="flow1" sourceRef="start" targetRef="simpleCall"/>

      <serviceTask id="simpleCall" flowable:type="camel"/>

      <sequenceFlow id="flow2" sourceRef="simpleCall" targetRef="end"/>
      <endEvent id="end"/>
    </process>

#### Ping Pong 示例

我们的示例虽然可以工作,但 Camel 和 Flowable 之间实际上并没有传输任何数据,所以这个示例并没有太大价值。在这个示例中,我们尝试向 Camel 发送数据并从中接收数据。我们发送一个字符串,Camel 将其与其他内容连接并返回结果。发送部分很简单,我们以变量的形式向 Camel 任务发送消息。以下是我们的调用代码:

    @Deployment
    public void testPingPong() {
      Map<String, Object> variables = new HashMap<String, Object>();

      variables.put("input", "Hello");
      Map<String, String> outputMap = new HashMap<String, String>();
      variables.put("outputMap", outputMap);

      runtimeService.startProcessInstanceByKey("PingPongProcess", variables);
      assertEquals(1, outputMap.size());
      assertNotNull(outputMap.get("outputValue"));
      assertEquals("Hello World", outputMap.get("outputValue"));
    }

变量 "input" 实际上是 Camel 路由的输入,而 outputMap 用于捕获从 Camel 返回的结果。流程可能如下所示:

    <process id="PingPongProcess">
      <startEvent id="start"/>
      <sequenceFlow id="flow1" sourceRef="start" targetRef="ping"/>
      <serviceTask id="ping" flowable:type="camel"/>
      <sequenceFlow id="flow2" sourceRef="ping" targetRef="saveOutput"/>
      <serviceTask id="saveOutput" flowable:class="org.flowable.camel.examples.pingPong.SaveOutput" />
      <sequenceFlow id="flow3" sourceRef="saveOutput" targetRef="end"/>
      <endEvent id="end"/>
    </process>

请注意,SaveOutput 服务任务会将上下文中的 "Output" 变量的值存储到前面提到的 OutputMap 中。现在我们需要了解变量是如何发送到 Camel 并返回的。这就涉及到了 Camel 行为的概念。变量与 Camel 的通信方式可以通过 CamelBehavior 进行配置。在我们的示例中使用了默认行为,稍后会简要介绍其他行为。你可以使用类似的代码来配置所需的 Camel 行为:

    <serviceTask id="serviceTask1" flowable:type="camel">
      <extensionElements>
        <flowable:field name="camelBehaviorClass" stringValue="org.flowable.camel.impl.CamelBehaviorCamelBodyImpl" />
      </extensionElements>
    </serviceTask>

如果你没有指定特定的行为,则会设置 org.flowable.camel.impl.CamelBehaviorDefaultImpl。这个行为会将变量复制为相同名称的 Camel 属性。作为返回,无论选择什么行为,如果 Camel 消息体是一个 map,那么它的每个元素都会被复制为一个变量,否则整个对象会被复制到一个名为 "camelBody" 的特定变量中。知道了这一点,这个 Camel 路由就完成了我们的第二个示例:

    @Override
    public void configure() throws Exception {
      from("flowable:PingPongProcess:ping").transform().simple("${exchangeProperty.input} World");
    }

在这个路由中,字符串 "world" 被连接到名为 "input" 的属性的末尾,结果将被设置在消息体中。可以通过检查 Java 服务任务中的 "camelBody" 变量来访问它,并复制到 "outputMap" 中。现在默认行为的示例已经可以工作了,让我们看看其他可能性。在启动每个 Camel 路由时,流程实例 ID 将被复制到一个特定名称为 "PROCESS\_ID\_PROPERTY" 的 Camel 属性中。它后续用于关联流程实例和 Camel 路由。此外,它也可以在 Camel 路由中被利用。

Flowable 中已经内置了三种不同的行为。这些行为可以通过路由 URL 中的特定短语来覆盖。以下是在 URL 中覆盖已定义行为的示例:

    from("flowable:asyncCamelProcess:serviceTaskAsync2?copyVariablesToProperties=true").

下表概述了三种可用的 Camel 行为:

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>行为</th>
<th>在 URL 中</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>CamelBehaviorDefaultImpl</p></td>
<td><p>copyVariablesToProperties</p></td>
<td><p>将 Flowable 变量复制为 Camel 属性</p></td>
</tr>
<tr class="even">
<td><p>CamelBehaviorCamelBodyImpl</p></td>
<td><p>copyCamelBodyToBody</p></td>
<td><p>仅将名为 "camelBody" 的 Flowable 变量复制为 Camel 消息体</p></td>
</tr>
<tr class="odd">
<td><p>CamelBehaviorBodyAsMapImpl</p></td>
<td><p>copyVariablesToBodyAsMap</p></td>
<td><p>将所有 Flowable 变量以 map 形式复制为 Camel 消息体</p></td>
</tr>
</tbody>
</table>

上表描述了 Flowable 变量如何传输到 Camel。下表描述了 Camel 变量如何返回到 Flowable。这只能在路由 URL 中配置。

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>URL</th>
<th>描述</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>Default</p></td>
<td><p>如果 Camel 消息体是一个 map,则将每个元素复制为 Flowable 变量,否则将整个 Camel 消息体复制为名为 "camelBody" 的 Flowable 变量</p></td>
</tr>
<tr class="even">
<td><p>copyVariablesFromProperties</p></td>
<td><p>将 Camel 属性复制为相同名称的 Flowable 变量</p></td>
</tr>
<tr class="odd">
<td><p>copyCamelBodyToBodyAsString</p></td>
<td><p>与默认行为相同,但如果 camelBody 不是 map,则先将其转换为字符串,然后复制到 "camelBody" 中</p></td>
</tr>
<tr class="even">
<td><p>copyVariablesFromHeader</p></td>
<td><p>额外将 Camel 头信息复制为相同名称的 Flowable 变量</p></td>
</tr>
</tbody>
</table>

#### 变量返回

上面提到的关于传递变量的内容仅适用于变量传输的发起方,无论你是从 Camel 到 Flowable 还是从 Flowable 到 Camel。
需要注意的是,由于 Flowable 的特殊非阻塞行为,变量不会自动从 Flowable 返回到 Camel。
为了实现这一点,可以使用一个特殊的语法。在 Camel 路由 URL 中可以有一个或多个参数,其格式为 var.return.someVariableName。
所有名称等于这些参数之一(不包括 var.return 部分)的变量都将被视为输出变量,并以相同的名称复制回 Camel 属性。
例如在这样的路由中:

    from("direct:start").to("flowable:process?var.return.exampleVar").to("mock:result");

名为 exampleVar 的 Flowable 变量将被视为输出变量,并以相同的名称复制回 Camel 中的属性。

#### 异步 Ping Pong 示例

前面的所有示例都是同步的。流程实例会等待 Camel 路由完成并返回。在某些情况下,我们可能需要 Flowable 流程实例继续执行。对于这种情况,Camel 服务任务的异步功能就很有用了。你可以通过将 Camel 服务任务的 *async* 属性设置为 true 来使用此功能。

    <serviceTask id="serviceAsyncPing" flowable:type="camel" flowable:async="true"/>

通过设置此功能,指定的 Camel 路由将由 Flowable 作业执行器异步激活。当你在 Camel 路由中定义队列时,Flowable 流程实例将继续执行流程定义中 Camel 服务任务之后定义的活动。Camel 路由将完全异步于流程执行。如果你想在流程定义中的某个地方等待 Camel 服务任务的响应,可以使用接收任务。

    <receiveTask id="receiveAsyncPing" name="Wait State" />

流程实例将等待接收信号,例如来自 Camel 的信号。在 Camel 中,你可以通过向适当的 Flowable 端点发送消息来向流程实例发送信号。

     from("flowable:asyncPingProcess:serviceAsyncPing").to("flowable:asyncPingProcess:receiveAsyncPing");

- 常量字符串 "flowable"

- 流程名称

- 接收任务名称

#### 从 Camel 路由实例化工作流

在前面的所有示例中,都是先启动 Flowable 流程实例,然后从流程实例启动 Camel 路由。反过来也是可以的,即从已经启动的 Camel 路由中启动或调用流程实例。这与发送信号到接收任务很相似。下面是一个示例路由:

    from("direct:start").to("flowable:camelProcess");

如你所见,URL 有两个部分:第一部分是常量字符串 "flowable",第二部分是流程定义的名称。显然,流程定义必须已经部署到 Flowable 引擎中。

还可以将流程实例的发起者设置为 Camel 头信息中提供的某个已认证的用户 ID。要实现这一点,首先必须在流程定义中指定一个发起者变量:

    <startEvent id="start" flowable:initiator="initiator" />

然后,假设用户 ID 包含在名为 *CamelProcessInitiatorHeader* 的 Camel 头信息中,Camel 路由可以定义如下:

    from("direct:startWithInitiatorHeader")
        .setHeader("CamelProcessInitiatorHeader", constant("kermit"))
        .to("flowable:InitiatorCamelCallProcess?processInitiatorHeaderName=CamelProcessInitiatorHeader");

### 手动任务

#### 描述

*手动任务*定义了一个 BPM 引擎外部的任务。它用于对某人完成的工作进行建模,引擎不需要知道这些工作的细节,也不需要系统或用户界面。对于引擎来说,手动任务被作为一个**直通活动**来处理,当流程执行到达该任务时会自动继续执行流程。

#### 图形表示法

手动任务被可视化为一个圆角矩形,在左上角有一个小"手"图标

![bpmn.manual.task](assets/bpmn/bpmn.manual.task.png)

#### XML 表示

    <manualTask id="myManualTask" name="Call client for more information" />

### Java 接收任务

#### 描述

接收任务是一个简单的任务,它等待某个特定消息的到达。目前,我们只为该任务实现了 Java 语义。当流程执行到达接收任务时,流程状态会被提交到持久化存储中。这意味着流程将保持在这个等待状态,直到引擎接收到特定消息,从而触发流程继续执行通过接收任务。

#### 图形表示法

接收任务被可视化为一个任务(圆角矩形),在左上角有一个消息图标。这个消息图标是白色的(黑色的消息图标表示发送语义)

![bpmn.receive.task](assets/bpmn/bpmn.receive.task.png)

#### XML 表示

    <receiveTask id="waitState" name="wait" />

要继续当前正在接收任务处等待的流程实例,必须使用到达接收任务的执行 ID 来调用 *runtimeService.trigger(executionId)*。以下代码片段展示了这在实践中如何工作:

    ProcessInstance pi = runtimeService.startProcessInstanceByKey("receiveTask");
    Execution execution = runtimeService.createExecutionQuery()
      .processInstanceId(pi.getId())
      .activityId("waitState")
      .singleResult();
    assertNotNull(execution);

    runtimeService.trigger(execution.getId());

### Shell 任务

#### 描述

Shell 任务允许你运行 shell 脚本和命令。请注意,Shell 任务**不是** BPMN 2.0 规范中的"官方"任务(因此也没有专门的图标)。

#### 定义 Shell 任务

Shell 任务是作为一个专用的[服务任务](bpmn/ch07b-BPMN-Constructs.md#java-service-task)来实现的,通过将服务任务的 *type* 设置为 *'shell'* 来定义。

    <serviceTask id="shellEcho" flowable:type="shell">

Shell 任务通过[字段注入](bpmn/ch07b-BPMN-Constructs.md#field-injection)进行配置。这些属性的所有值都可以包含 EL 表达式,这些表达式在流程执行期间的运行时进行解析。可以设置以下属性:

<table>
<colgroup>
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 20%" />
</colgroup>
<thead>
<tr class="header">
<th>属性</th>
<th>是否必需?</th>
<th>类型</th>
<th>描述</th>
<th>默认值</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><p>command</p></td>
<td><p>是</p></td>
<td><p>String</p></td>
<td><p>要执行的 Shell 命令</p></td>
<td></td>
</tr>
<tr class="even">
<td><p>arg1-5</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>参数 1 到参数 5</p></td>
<td></td>
</tr>
<tr class="odd">
<td><p>wait</p></td>
<td><p>否</p></td>
<td><p>true/false</p></td>
<td><p>如有必要,等待直到 shell 进程终止</p></td>
<td><p>true</p></td>
</tr>
<tr class="even">
<td><p>redirectError</p></td>
<td><p>否</p></td>
<td><p>true/false</p></td>
<td><p>将标准错误与标准输出合并</p></td>
<td><p>false</p></td>
</tr>
<tr class="odd">
<td><p>cleanEnv</p></td>
<td><p>否</p></td>
<td><p>true/false</p></td>
<td><p>Shell 进程不继承当前环境</p></td>
<td><p>false</p></td>
</tr>
<tr class="even">
<td><p>outputVariable</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>用于保存输出的变量名称</p></td>
<td><p>不记录输出</p></td>
</tr>
<tr class="odd">
<td><p>errorCodeVariable</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>用于保存任何结果错误代码的变量名称</p></td>
<td><p>不记录错误级别</p></td>
</tr>
<tr class="even">
<td><p>directory</p></td>
<td><p>否</p></td>
<td><p>String</p></td>
<td><p>shell 进程的默认目录</p></td>
<td><p>当前目录</p></td>
</tr>
</tbody>
</table>

#### 使用示例

以下 XML 片段展示了使用 Shell 任务的示例。它运行 shell 脚本 "cmd /c echo EchoTest",等待其终止并将结果存储在 *resultVar* 中:

    <serviceTask id="shellEcho" flowable:type="shell" >
      <extensionElements>
        <flowable:field name="command" stringValue="cmd" />
        <flowable:field name="arg1" stringValue="/c" />
        <flowable:field name="arg2" stringValue="echo" />
        <flowable:field name="arg3" stringValue="EchoTest" />
        <flowable:field name="wait" stringValue="true" />
        <flowable:field name="outputVariable" stringValue="resultVar" />
      </extensionElements>
    </serviceTask>

### 外部工作者任务

#### 描述

外部工作者任务允许你创建可以被外部工作者获取和执行的作业。
外部工作者可以通过 Java API 或 REST API 获取作业。
这类似于异步服务任务。
不同之处在于,不是由 Flowable 执行逻辑,
而是由可以用任何语言实现的外部工作者查询 Flowable 获取作业,执行它们并将结果发送回 Flowable。
请注意,外部工作者任务**不是** BPMN 2.0 规范中的"官方"任务(因此也没有专门的图标)。

#### 定义外部工作者任务

外部工作者任务是作为一个专用的[服务任务](bpmn/ch07b-BPMN-Constructs.md#java-service-task)来实现的,通过将服务任务的 *type* 设置为 *'external-worker'* 来定义。

```xml
<serviceTask id="externalWorkerOrder" flowable:type="external-worker">
```

外部工作者任务通过设置 `topic` (可以是 EL 表达式)来配置,外部工作者使用该主题来查询要执行的作业。

#### 使用示例

以下 XML 片段展示了使用外部工作者任务的示例。
外部工作者是一个等待状态。
当执行到达该任务时,它会创建一个可以被外部工作者获取的外部工作者作业。
一旦外部工作者完成作业并通知 Flowable 完成情况,流程执行将继续进行。


```xml
<serviceTask id="externalWorkerOrder" flowable:type="external-worker" flowable:topic="orderService" />
```

#### 获取外部工作者作业

外部工作者作业通过使用 `ExternalWorkerJobAcquireBuilder` 来调用 `ManagementService#createExternalWorkerJobAcquireBuilder` 获取。

```java
List<AcquiredExternalWorkerJob> acquiredJobs = managementService.createExternalWorkerJobAcquireBuilder()
                .topic("orderService", Duration.ofMinutes(30))
                .acquireAndLock(5, "orderWorker-1");
```

通过使用上面的 Java 代码片段可以获取外部工作者作业。
使用该代码片段我们完成了以下操作:

* 使用主题 *orderService* 查询外部工作者作业。
* 获取并锁定作业 30 分钟,等待外部工作者的完成信号。
* 最多获取 5 个作业
* 作业的所有者是 ID 为 *orderWorker-1* 的工作者

`AcquiredExternalWorkerJob` 也可以访问流程变量。
当外部工作者任务是独占的时,获取作业将锁定流程实例。

#### 完成外部工作者作业

外部工作者作业通过使用 `ExternalWorkerCompletionBuilder` 来调用 `ManagementService#createExternalWorkerCompletionBuilder(String, String)` 完成。

```java
managementService.createExternalWorkerCompletionBuilder(acquiredJob.getId(), "orderWorker-1")
                .variable("orderStatus", "COMPLETED")
                .complete();
```

作业只能由获取它的工作者完成。否则将抛出 `FlowableIllegalArgumentException` 异常。

使用上面的代码片段,任务将被完成且流程执行将继续。
执行的继续是在新事务中异步完成的。
这意味着完成外部工作者任务只会创建一个异步(新的)作业来执行完成操作(并且当前线程在此之后返回)。
模型中在外部工作者任务之后的任何步骤都将在该事务中执行,类似于常规的异步服务任务。


#### 外部工作者作业的错误处理

处理外部工作者作业错误有两种方式:

* 通过使用 `ExternalWorkerCompletionBuilder` 调用 `ManagementService#createExternalWorkerCompletionBuilder(String, String)` 处理业务错误


```java
managementService.createExternalWorkerCompletionBuilder(acquiredJob.getId(), "orderWorker-1")
                .variable("orderStatus", "FAILED")
                .bpmnError("orderFailed");
```

使用此代码片段,*orderStatus* 变量将被设置到流程中,并且将抛出代码为 *orderFailed* 的 BPMN 错误。
BPMN 错误只能由获取作业的工作者抛出。

* 通过使用 `ExternalWorkerJobFailureBuilder` 调用 `ManagementService#createExternalWorkerJobFailureBuilder(String, String)` 处理技术错误


```java
managementService.createExternalWorkerJobFailureBuilder(acquiredJob.getId(), "orderWorker-1")
                .errorMessage("Failed to run job. Database not accessible")
                .errorDetails("Some complex and long error details")
                .retries(4)
                .retryTimeout(Duration.ofHours(1))
                .fail();
```

使用此代码片段将执行以下操作:

* 错误消息和错误详情将被设置到作业中
* 作业的重试次数将被设置为 4
* 作业将在 1 小时后可以被再次获取

作业只能由获取它的工作者标记为失败。
如果没有设置重试次数,flowable 将自动将作业的重试次数减 1。
当重试次数为 0 时,作业将被移动到死信表(DeadLetter table)中,并且不能再被获取。

#### 查询外部工作者作业

外部工作者作业通过使用 `ExternalWorkerJobQuery` 来调用 `ManagementService#createExternalWorkerJobQuery` 进行查询。


### 执行监听器

执行监听器允许你在流程执行期间发生某些事件时执行外部 Java 代码或计算表达式。可以捕获的事件包括:

- 流程实例的启动和结束。

- 流程流转。

- 活动的启动和结束。

- 网关的启动和结束。

- 中间事件的启动和结束。

- 开始事件的结束和结束事件的启动。

以下流程定义包含 3 个执行监听器:

    <process id="executionListenersProcess">

      <extensionElements>
        <flowable:executionListener
          class="org.flowable.examples.bpmn.executionlistener.ExampleExecutionListenerOne"
          event="start" />
      </extensionElements>

      <startEvent id="theStart" />
      <sequenceFlow sourceRef="theStart" targetRef="firstTask" />

      <userTask id="firstTask" />
      <sequenceFlow sourceRef="firstTask" targetRef="secondTask">
        <extensionElements>
          <flowable:executionListener
            class="org.flowable.examples.bpmn.executionListener.ExampleExecutionListenerTwo" />
        </extensionElements>
      </sequenceFlow>

      <userTask id="secondTask" >
        <extensionElements>
          <flowable:executionListener
            expression="${myPojo.myMethod(execution.event)}"
            event="end" />
        </extensionElements>
      </userTask>
      <sequenceFlow sourceRef="secondTask" targetRef="thirdTask" />

      <userTask id="thirdTask" />
      <sequenceFlow sourceRef="thirdTask" targetRef="theEnd" />

      <endEvent id="theEnd" />

    </process>

当流程启动时会通知第一个执行监听器。该监听器是一个外部 Java 类(ExampleExecutionListenerOne),它必须实现 org.flowable.engine.delegate.ExecutionListener 接口。当事件发生时(在本例中是结束事件),会调用 notify(ExecutionListenerExecution execution) 方法。

    public class ExampleExecutionListenerOne implements ExecutionListener {

      public void notify(ExecutionListenerExecution execution) throws Exception {
        execution.setVariable("variableSetInExecutionListener", "firstValue");
        execution.setVariable("eventReceived", execution.getEventName());
      }
    }

也可以使用实现了 org.flowable.engine.delegate.JavaDelegate 接口的委托类。这些委托类可以在其他构件中重用,例如用作服务任务的委托。

当流程流转发生时会调用第二个执行监听器。注意,监听器元素没有定义事件,因为在流转时只会触发 take 事件。**当在流转上定义监听器时,event 属性中的值会被忽略。**

当活动 secondTask 结束时会调用最后一个执行监听器。这里没有在监听器声明中使用类,而是定义了一个表达式,该表达式会在事件触发时被计算/调用。

    <flowable:executionListener expression="${myPojo.myMethod(execution.eventName)}" event="end" />

与其他表达式一样,执行变量可以被解析和使用。由于执行实现对象有一个暴露事件名称的属性,因此可以使用 execution.eventName 将事件名称传递给你的方法。

执行监听器也支持使用委托表达式,[类似于服务任务](bpmn/ch07b-BPMN-Constructs.md#xml-representation)。

    <flowable:executionListener event="start" delegateExpression="${myExecutionListenerBean}" />

不久前,我们还引入了一种新的执行监听器类型 org.flowable.engine.impl.bpmn.listener.ScriptExecutionListener。这个脚本执行监听器允许你为执行监听器事件执行一段脚本逻辑。

    <flowable:executionListener event="start"
        class="org.flowable.engine.impl.bpmn.listener.ScriptExecutionListener">
      <flowable:field name="script">
        <flowable:string>
          def bar = "BAR";  // 局部变量
          foo = "FOO"; // 将变量推送到执行上下文
          execution.setVariable("var1", "test"); // 测试访问执行实例
          bar // 隐式返回值
        </flowable:string>
      </flowable:field>
      <flowable:field name="language" stringValue="groovy" />
      <flowable:field name="resultVariable" stringValue="myVar" />

    </flowable:executionListener>

可脚本化的执行监听器通过使用更紧凑的语法成为一等公民,避免了硬编码类名:

    <flowable:executionListener event="start" type="script">
      <flowable:script language="groovy">
        <![CDATA[
          def bar = "BAR";  // 局部变量
          execution.setVariable("var1", "test"); // 测试访问执行实例
        ]]>
        </flowable:script>
    </flowable:executionListener>

#### 执行监听器的字段注入

当使用配置了 class 属性的执行监听器时,可以应用字段注入。这与[服务任务字段注入](bpmn/ch07b-BPMN-Constructs.md#field-injection)使用的机制完全相同,其中包含了字段注入提供的可能性的概述。

下面的片段展示了一个带有字段注入的执行监听器的简单流程示例。

    <process id="executionListenersProcess">
      <extensionElements>
        <flowable:executionListener
            class="org.flowable.examples.bpmn.executionListener.ExampleFieldInjectedExecutionListener"
            event="start">

          <flowable:field name="fixedValue" stringValue="Yes, I am " />
          <flowable:field name="dynamicValue" expression="${myVar}" />

        </flowable:executionListener>
      </extensionElements>

      <startEvent id="theStart" />
      <sequenceFlow sourceRef="theStart" targetRef="firstTask" />

      <userTask id="firstTask" />
      <sequenceFlow sourceRef="firstTask" targetRef="theEnd" />

      <endEvent id="theEnd" />
    </process>

    public class ExampleFieldInjectedExecutionListener implements ExecutionListener {

      private Expression fixedValue;

      private Expression dynamicValue;

      public void notify(ExecutionListenerExecution execution) throws Exception {
        execution.setVariable("var", fixedValue.getValue(execution).toString() +
            dynamicValue.getValue(execution).toString());
      }
    }

ExampleFieldInjectedExecutionListener 类将两个注入的字段(一个固定的和一个动态的)连接起来,并将其存储在流程变量 'var' 中。

    @Deployment(resources = {
      "org/flowable/examples/bpmn/executionListener/ExecutionListenersFieldInjectionProcess.bpmn20.xml"})
    public void testExecutionListenerFieldInjection() {
      Map<String, Object> variables = new HashMap<String, Object>();
      variables.put("myVar", "listening!");

      ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
          "executionListenersProcess", variables);

      Object varSetByListener = runtimeService.getVariable(processInstance.getId(), "var");
      assertNotNull(varSetByListener);
      assertTrue(varSetByListener instanceof String);

      // 结果是固定注入字段和注入表达式的连接
      assertEquals("Yes, I am listening!", varSetByListener);
    }

注意,与线程安全相关的规则同样适用于服务任务。更多信息请参阅[相关章节](bpmn/ch07b-BPMN-Constructs.md#field-injection-and-thread-safety)。

#### 在执行监听器中抛出 BPMN 错误
可以从执行监听器代码中抛出 BPMN 错误,这些错误可以被模型中匹配的[错误边界事件](bpmn/ch07b-BPMN-Constructs.md#error-boundary-event)或[错误开始事件](bpmn/ch07b-BPMN-Constructs.md#error-start-event)捕获。
这可以通过使用 Flowable 的 `org.flowable.engine.delegate.BpmnError` 类来实现。有关示例和更多描述,请参见[抛出 BPMN 错误](bpmn/ch07b-BPMN-Constructs.md#throwing-bpmn-errors)章节。

需要注意的是,在执行监听器中抛出的 BPMN 错误只能被父作用域的错误边界事件捕获,而不能被活动本身的边界事件捕获。

下图说明了这一点:
![bpmn.executionlistener.bpmnerror](assets/bpmn/bpmn.executionlistener.bpmnerror.png)

假设 _A Task_ 定义了一个执行监听器,该监听器在某个时刻抛出 BpmnError:
只有当 _Subprocess_ 上的错误边界事件(图中的红色部分)匹配时,错误才会被捕获。
在这种情况下,_A Task_ 上的错误边界事件会被忽略。
无论如何,这是一个推荐的做法。

原因是:当调用执行监听器时,活动要么尚未完全初始化(对于 _start_ 监听器),要么作用域已经被销毁(对于 _end_ 监听器)。

### 任务监听器

*任务监听器*用于在发生某个任务相关事件时执行自定义的 Java 逻辑或表达式。

任务监听器只能在流程定义中作为[用户任务](bpmn/ch07b-BPMN-Constructs.md#user-task)的子元素添加。注意,由于任务监听器是 Flowable 特有的构件,因此它必须作为 *BPMN 2.0 extensionElements* 的子元素并使用 *flowable* 命名空间。

    <userTask id="myTask" name="My Task" >
      <extensionElements>
        <flowable:taskListener event="create" class="org.flowable.MyTaskCreateListener" />
      </extensionElements>
    </userTask>

*任务监听器*支持以下属性:

-   **event** (必需): 触发任务监听器的任务事件类型。可能的事件包括:

    -   **create**: 当任务被创建且**所有任务属性都已设置**时触发。

    -   **assignment**: 当任务被分配给某人时触发。注意:当流程执行到达用户任务时,首先会触发 *assignment* 事件,然后**才会**触发 *create* 事件。这种顺序看起来不太自然,但这样做是出于实用性考虑:当接收到 *create* 事件时,我们通常想要检查任务的所有属性,包括受理人。

    -   **complete**: 当任务完成且在从运行时数据中删除之前触发。

    -   **delete**: 在任务即将被删除时触发。注意,当任务通过 completeTask 正常完成时也会执行此事件。

-   **class**: 必须调用的委托类。此类必须实现 org.flowable.task.service.delegate.TaskListener 接口。

<!-- -->

    public class MyTaskCreateListener implements TaskListener {

      public void notify(DelegateTask delegateTask) {
        // Custom logic goes here
      }
    }

也可以使用[字段注入](bpmn/ch07b-BPMN-Constructs.md#field-injection)来将流程变量或执行传递给委托类。注意,委托类的实例是在流程部署时创建的(与 Flowable 中的任何类委托一样),这意味着该实例在所有流程实例执行之间共享。

-   **expression**: (不能与 *class* 属性一起使用): 指定在事件发生时将执行的表达式。可以将 DelegateTask 对象和事件名称(使用 task.eventName)作为参数传递给被调用的对象。

<!-- -->

    <flowable:taskListener event="create" expression="${myObject.callMethod(task, task.eventName)}" />

-   **delegateExpression** 允许你指定一个表达式,该表达式解析为实现了 TaskListener 接口的对象,[类似于服务任务](bpmn/ch07b-BPMN-Constructs.md#xml-representation)。

<!-- -->

    <flowable:taskListener event="create" delegateExpression="${myTaskListenerBean}" />

-   不久前,我们还引入了一种新的任务监听器类型 org.flowable.engine.impl.bpmn.listener.ScriptTaskListener。这个脚本任务监听器允许你为任务监听器事件执行一段脚本逻辑。

<!-- -->

     <flowable:taskListener event="complete" class="org.flowable.engine.impl.bpmn.listener.ScriptTaskListener" >
      <flowable:field name="script">
        <flowable:string>
          def bar = "BAR";  // 局部变量
          foo = "FOO"; // 将变量推送到执行上下文
          task.setOwner("kermit"); // 测试访问任务实例
          bar // 隐式返回值
        </flowable:string>
      </flowable:field>
      <flowable:field name="language" stringValue="groovy" />
      <flowable:field name="resultVariable" stringValue="myVar" />
    </flowable:taskListener>

- 可脚本化的任务监听器通过使用更紧凑的语法成为一等公民,避免了硬编码类名:

<!-- -->

    <flowable:taskListener event="complete" type="script">
      <flowable:script language="groovy" resultVariable="myVar">
        <![CDATA[
          def bar = "BAR";  // 局部变量
          task.setOwner("kermit"); // 测试访问任务实例
          bar // 隐式返回值
        ]]>
      </flowable:script>
    </flowable:taskListener>

#### 在任务监听器中抛出 BPMN 错误

跳转到[在执行监听器中抛出 BPMN 错误](bpmn/ch07b-BPMN-Constructs.md#throwing-bpmn-error-in-execution-listeners)章节,因为任务监听器适用相同的规则。

### 多实例(循环)

#### 描述

*多实例活动*是一种为业务流程中的某个步骤定义重复执行的方式。在编程概念中,多实例相当于 **for each** 结构:它允许你对给定集合中的每个项目执行某个步骤,甚至是完整的子流程,可以**顺序执行或并行执行**。

*多实例*是一个具有额外属性(称为*"多实例特性"*)的常规活动,这些属性会导致该活动在运行时被多次执行。以下活动可以成为*多实例活动*:

-   [用户任务](bpmn/ch07b-BPMN-Constructs.md#user-task)

-   [脚本任务](bpmn/ch07b-BPMN-Constructs.md#script-Task)

-   [Java 服务任务](bpmn/ch07b-BPMN-Constructs.md#java-service-task)

-   [Web 服务任务](bpmn/ch07b-BPMN-Constructs.md#web-service-task)

-   [业务规则任务](bpmn/ch07b-BPMN-Constructs.md#business-rule-task)

-   [邮件任务](bpmn/ch07b-BPMN-Constructs.md#email-task)

-   [手工任务](bpmn/ch07b-BPMN-Constructs.md#manual-task)

-   [接收任务](bpmn/ch07b-BPMN-Constructs.md#java-receive-task)

-   [(嵌入式)子流程](bpmn/ch07b-BPMN-Constructs.md#aocess)

-   [调用活动](bpmn/ch07b-BPMN-Constructs.md#call-activity-(sub-process))

[网关](bpmn/ch07b-BPMN-Constructs.md#gateways)或[事件](bpmn/ch07b-BPMN-Constructs.md#events)**不能**成为多实例。

根据 BPMN 2.0 规范的要求,为每个实例创建的执行的父执行将具有以下变量:

-   **nrOfInstances**: 实例总数

-   **nrOfActiveInstances**: 当前活动(尚未完成)的实例数。对于顺序多实例,这将始终为 1。

-   **nrOfCompletedInstances**: 已完成的实例数。

这些值可以通过调用 execution.getVariable(x) 方法获取。

此外,每个创建的执行都将有一个执行本地变量(对其他执行不可见,且不存储在流程实例级别):

-   **loopCounter**: 表示该特定实例在 for-each 循环中的*索引*。loopCounter 变量可以使用 Flowable 的 **elementIndexVariable** 属性重命名。

#### 图形表示法

如果一个活动是多实例的,这将通过活动底部的三条短线来表示。三条*垂直*线表示实例将并行执行,而三条*水平*线表示顺序执行。

![bpmn.multi.instance](assets/bpmn/bpmn.multi.instance.png)

#### XML 表示

要使活动成为多实例,活动的 XML 元素必须有一个 multiInstanceLoopCharacteristics 子元素。

    <multiInstanceLoopCharacteristics isSequential="false|true">
     ...
    </multiInstanceLoopCharacteristics>

**isSequential** 属性指示该活动的实例是顺序执行还是并行执行。

实例数量在**进入活动时计算一次**。有几种配置方法。一种方法是使用 **loopCardinality** 子元素直接指定一个数字。

    <multiInstanceLoopCharacteristics isSequential="false|true">
      <loopCardinality>5</loopCardinality>
    </multiInstanceLoopCharacteristics>

也允许使用解析为正数的表达式:

    <multiInstanceLoopCharacteristics isSequential="false|true">
      <loopCardinality>${nrOfOrders-nrOfCancellations}</loopCardinality>
    </multiInstanceLoopCharacteristics>

定义实例数量的另一种方法是使用 loopDataInputRef 子元素指定作为集合的流程变量名称。对于集合中的每个项目,都会创建一个实例。可以选择使用 inputDataItem 子元素为实例设置集合中的特定项目。这在以下 XML 示例中展示:

    <userTask id="miTasks" name="My Task ${loopCounter}" flowable:assignee="${assignee}">
      <multiInstanceLoopCharacteristics isSequential="false">
        <loopDataInputRef>assigneeList</loopDataInputRef>
        <inputDataItem name="assignee" />
      </multiInstanceLoopCharacteristics>
    </userTask>

假设变量 assigneeList 包含值 \\\[kermit, gonzo, fozzie\\\]。在上面的代码片段中,将并行创建三个用户任务。每个执行都将有一个名为 assignee 的流程变量,其中包含集合中的一个值,在本例中用于分配用户任务。

loopDataInputRef 和 inputDataItem 的缺点是这些名称很难记住,而且由于 BPMN 2.0 模式限制,它们不能包含表达式。Flowable 通过在 multiInstanceCharacteristics 上提供 **collection** 和 **elementVariable** 属性来解决这个问题:

    <userTask id="miTasks" name="My Task" flowable:assignee="${assignee}">
      <multiInstanceLoopCharacteristics isSequential="true"
         flowable:collection="${myService.resolveUsersForTask()}" flowable:elementVariable="assignee" >
      </multiInstanceLoopCharacteristics>
    </userTask>

注意,collection 属性将被解析为表达式。当表达式解析为字符串而不是集合时(无论是因为它是静态字符串值还是表达式本身解析为字符串),结果值将被用作获取集合流程变量的变量名。

例如,在以下代码片段中,假定集合存储在 assigneeList 流程变量中:

    <userTask id="miTasks" name="My Task" flowable:assignee="${assignee}">
      <multiInstanceLoopCharacteristics isSequential="true"
         flowable:collection="assigneeList" flowable:elementVariable="assignee" >
      </multiInstanceLoopCharacteristics>
    </userTask>

例如,假设 myService.getCollectionVariableName() 返回一个字符串值,该值将被用作变量名来获取存储为流程变量的集合。

    <userTask id="miTasks" name="My Task" flowable:assignee="${assignee}">
      <multiInstanceLoopCharacteristics isSequential="true"
         flowable:collection="${myService.getCollectionVariableName()}" flowable:elementVariable="assignee" >
      </multiInstanceLoopCharacteristics>
    </userTask>

当所有实例都完成时,多实例活动就会结束。但是,可以指定一个表达式,该表达式在每个实例结束时都会被评估。当此表达式计算结果为 true 时,所有剩余的实例都会被销毁,多实例活动结束,流程继续执行。这样的表达式必须在 **completionCondition** 子元素中定义。

    <userTask id="miTasks" name="My Task" flowable:assignee="${assignee}">
      <multiInstanceLoopCharacteristics isSequential="false"
         flowable:collection="assigneeList" flowable:elementVariable="assignee" >
        <completionCondition>${nrOfCompletedInstances/nrOfInstances >= 0.6 }</completionCondition>
      </multiInstanceLoopCharacteristics>
    </userTask>

在这个例子中,将为 assigneeList 集合的每个元素创建并行实例。但是,当 60% 的任务完成时,其他任务会被删除,流程继续执行。

#### 边界事件和多实例

由于多实例是一个常规活动,因此可以在其边界上定义[边界事件](bpmn/ch07b-BPMN-Constructs.md#boundary-events)。在中断边界事件的情况下,当事件被捕获时,所有仍处于活动状态的**实例**都将被销毁。例如,以下多实例子流程:

![bpmn.multi.instance.boundary.event](assets/bpmn/bpmn.multi.instance.boundary.event.png)

在这里,当定时器触发时,子流程的所有实例都将被销毁,无论有多少个实例或哪些内部活动尚未完成。

#### 多实例和执行监听器

在将执行监听器与多实例结合使用时需要注意一点。例如,以下 BPMN 2.0 XML 片段,它与 *multiInstanceLoopCharacteristics* XML 元素定义在同一级别:

    <extensionElements>
        <flowable:executionListener event="start" class="org.flowable.MyStartListener"/>
        <flowable:executionListener event="end" class="org.flowable.MyEndListener"/>
    </extensionElements>

对于普通的 BPMN 活动,这些监听器会在活动开始和结束时被调用。

但是,当活动是多实例时,行为是不同的:

-   当进入多实例活动时,在执行任何*内部*活动之前,会抛出一个开始事件。此时 *loopCounter* 变量尚未设置(为 null)。

-   对于访问的每个实际活动,都会抛出一个开始事件。此时 *loopCounter* 变量已设置。

同样的逻辑也适用于结束事件:

-   离开实际活动后,会抛出一个结束事件。此时 *loopCounter* 变量已设置。

-   当多实例活动作为一个整体完成时,会抛出一个结束事件。此时 *loopCounter* 变量未设置。

例如:

    <subProcess id="subprocess1" name="Sub Process">
      <extensionElements>
        <flowable:executionListener event="start" class="org.flowable.MyStartListener"/>
        <flowable:executionListener event="end" class="org.flowable.MyEndListener"/>
      </extensionElements>
      <multiInstanceLoopCharacteristics isSequential="false">
        <loopDataInputRef>assignees</loopDataInputRef>
        <inputDataItem name="assignee"></inputDataItem>
      </multiInstanceLoopCharacteristics>
      <startEvent id="startevent2" name="Start"></startEvent>
      <endEvent id="endevent2" name="End"></endEvent>
      <sequenceFlow id="flow3" name="" sourceRef="startevent2" targetRef="endevent2"></sequenceFlow>
    </subProcess>

在这个例子中,假设 *assignees* 列表有三个项目。在运行时会发生以下情况:

-   会为整个多实例抛出一个开始事件。此时会调用 *start* 执行监听器。*loopCounter* 和 *assignee* 变量尚未设置(它们为 null)。

-   对于每个活动实例都会抛出一个开始事件。*start* 执行监听器会被调用三次。此时 *loopCounter* 和 *assignee* 变量已设置(不为 null)。

-   因此,总的来说,start 执行监听器会被调用四次。

注意,当 *multiInstanceLoopCharacteristics* 定义在子流程之外的其他元素上时,也适用相同的规则。例如,如果上面的例子是一个简单的用户任务,相同的推理仍然适用。

### 补偿处理器

#### 描述

如果一个活动用于补偿另一个活动的影响,它可以被声明为*补偿处理器*。补偿处理器在正常流程中不存在,只有在抛出补偿事件时才会执行。

补偿处理器不能有传入或传出的顺序流。

补偿处理器必须通过定向关联与补偿边界事件相关联。

#### 图形表示法

如果一个活动是补偿处理器,补偿事件图标会显示在底部中心区域。以下流程图片段显示了一个带有附加补偿边界事件的服务任务,该事件与补偿处理器相关联。注意"取消酒店预订"服务任务底部中心区域的补偿处理器图标。

![bpmn.boundary.compensation.event](assets/bpmn/bpmn.boundary.compensation.event.png)

#### XML 表示

要将活动声明为补偿处理器,我们需要将 isForCompensation 属性设置为 true:

    <serviceTask id="undoBookHotel" isForCompensation="true" flowable:class="...">
    </serviceTask>

## 子流程和调用活动

### 子流程

#### 描述

*子流程*是一个包含其他活动、网关、事件等的活动,它本身构成了更大流程的一部分。*子流程*完全定义在父流程内部(这就是为什么它通常被称为*嵌入式*子流程)。

子流程有两个主要用例:

-   子流程允许**层次化建模**。许多建模工具允许子流程被*折叠*,隐藏子流程的所有细节,从而提供业务流程的高层端到端概览。

-   子流程为事件创建新的**作用域**。在子流程执行期间抛出的事件可以被子流程边界上的[边界事件](bpmn/ch07b-BPMN-Constructs.md#boundary-events)捕获,为该事件创建一个仅限于子流程的作用域。

使用子流程会带来一些约束:

-   子流程只能有**一个'空开始事件'**,不允许其他类型的开始事件。子流程**必须至少有一个'结束事件'**。注意,虽然 BPMN 2.0 规范允许在子流程中省略开始和结束事件,但当前的 Flowable 实现不支持这一点。

-   **顺序流不能跨越子流程边界。**

#### 图形表示法

子流程被可视化为一个典型的活动(圆角矩形)。如果子流程是*折叠的*,则只显示名称和一个加号,提供流程的高层概览:

![bpmn.collapsed.subprocess](assets/bpmn/bpmn.collapsed.subprocess.png)

如果子流程是*展开的*,则子流程的步骤会显示在子流程边界内:

![bpmn.expanded.subprocess](assets/bpmn/bpmn.expanded.subprocess.png)

使用子流程的主要原因之一是为某个事件定义作用域。下面的流程模型展示了这一点:*调查软件/调查硬件*任务需要并行完成,但这两个任务都需要在特定时间内完成,然后才能咨询*二级支持*。在这里,定时器的作用域(活动必须按时完成)受子流程约束。

![bpmn.subprocess.with.boundary.timer](assets/bpmn/bpmn.subprocess.with.boundary.timer.png)

#### XML 表示

子流程由 *subProcess* 元素定义。所有属于子流程的活动、网关、事件等都需要包含在这个元素内。

    <subProcess id="subProcess">

      <startEvent id="subProcessStart" />

      ... 其他子流程元素 ...

      <endEvent id="subProcessEnd" />

     </subProcess>

### 事件子流程

#### 描述

事件子流程是 BPMN 2.0 中的新特性。事件子流程是由事件触发的子流程。事件子流程可以添加在流程级别或任何子流程级别。用于触发事件子流程的事件通过开始事件进行配置。因此,"空开始事件"不支持用于事件子流程。事件子流程可以使用各种事件触发,如消息事件、错误事件、信号事件、定时器事件或补偿事件。当创建托管事件子流程的作用域(流程实例或子流程)时,会创建对开始事件的订阅。当作用域被销毁时,订阅也会被移除。

事件子流程可以是中断的或非中断的。中断子流程会取消当前作用域中的所有执行。非中断事件子流程会产生一个新的并发执行。虽然中断事件子流程对于托管它的作用域的每次激活只能触发一次,但非中断事件子流程可以触发多次。子流程是否中断是通过触发事件子流程的开始事件来配置的。

事件子流程不能有任何传入或传出的顺序流。由于事件子流程是由事件触发的,所以传入的顺序流没有意义。当事件子流程结束时,要么当前作用域结束(如果是中断事件子流程),要么为非中断子流程产生的并发执行结束。

**当前限制:**

-   Flowable 支持使用错误、定时器、信号和消息开始事件触发的事件子流程。

#### 图形表示法

事件子流程可以被可视化为带有虚线轮廓的[嵌入式子流程](bpmn/ch07b-BPMN-Constructs.md#graphical-notation)。

![bpmn.subprocess.eventSubprocess](assets/bpmn/bpmn.subprocess.eventSubprocess.png)

#### XML 表示

事件子流程在 XML 中的表示方式与嵌入式子流程相同。此外,属性 triggeredByEvent 必须设置为 true:

    <subProcess id="eventSubProcess" triggeredByEvent="true">
        ...
    </subProcess>

#### 示例

以下是一个使用错误开始事件触发的事件子流程示例。该事件子流程位于"流程级别",换句话说,其作用域是流程实例:

![bpmn.subprocess.eventSubprocess.example.1](assets/bpmn/bpmn.subprocess.eventSubprocess.example.1.png)

事件子流程在 XML 中的表示如下:

    <subProcess id="eventSubProcess" triggeredByEvent="true">
        <startEvent id="catchError">
            <errorEventDefinition errorRef="error" />
        </startEvent>
        <sequenceFlow id="flow2" sourceRef="catchError" targetRef="taskAfterErrorCatch" />
        <userTask id="taskAfterErrorCatch" name="Provide additional data" />
    </subProcess>

如前所述,事件子流程也可以添加到嵌入式子流程中。如果将其添加到嵌入式子流程中,它就成为边界事件的一种替代方案。考虑以下两个流程图。在这两种情况下,嵌入式子流程都会抛出错误事件。这两次错误都通过用户任务来捕获和处理。

![bpmn.subprocess.eventSubprocess.example.2a](assets/bpmn/bpmn.subprocess.eventSubprocess.example.2a.png)

相对于:

![bpmn.subprocess.eventSubprocess.example.2b](assets/bpmn/bpmn.subprocess.eventSubprocess.example.2b.png)

在这两种情况下执行的任务是相同的。但是,这两种建模方案之间存在差异:

-   嵌入式子流程使用托管它的作用域所执行的相同执行来执行。这意味着嵌入式子流程可以访问其作用域的局部变量。当使用边界事件时,为执行嵌入式子流程而创建的执行会被离开边界事件的顺序流删除。这意味着嵌入式子流程创建的变量不再可用。

-   当使用事件子流程时,事件完全由添加它的子流程处理。当使用边界事件时,事件由父流程处理。

这两个差异可以帮助你决定边界事件还是嵌入式子流程更适合解决特定的流程建模或实现问题。

### 事务子流程

#### 描述

事务子流程是一个嵌入式子流程,可用于将多个活动组合成一个事务。事务是一个逻辑工作单元,允许将一组独立的活动组合在一起,使它们要么全部成功,要么全部失败。

**事务的可能结果:** 事务可以有三种不同的结果:

-   如果事务既没有被取消也没有被危险终止,则事务*成功*。如果事务子流程成功,它将使用传出顺序流离开。如果在流程后期抛出补偿事件,成功的事务可能会被补偿。*注意:* 就像"普通的"嵌入式子流程一样,事务可以在成功完成后使用中间抛出补偿事件进行补偿。

-   如果执行到达取消结束事件,则事务被*取消*。在这种情况下,所有执行都会被终止和移除。然后将单个剩余执行设置到取消边界事件,这会触发补偿。补偿完成后,事务子流程通过取消边界事件的传出顺序流离开。

-   如果抛出的错误事件未在事务子流程范围内被捕获,则事务由*危险*结束。如果错误在事务子流程的边界被捕获,这种情况也适用。在这些情况下,不会执行补偿。

下图说明了三种不同的结果:

![bpmn.transaction.subprocess.example.1](assets/bpmn/bpmn.transaction.subprocess.example.1.png)

**与 ACID 事务的关系:** 重要的是不要将 BPMN 事务子流程与技术性的(ACID)事务混淆。BPMN 事务子流程不是用来限定技术事务范围的方式。要了解 Flowable 中的事务管理,请阅读[并发和事务](bpmn/ch07b-BPMN-Constructs.md#transactions-and-concurrency)章节。BPMN 事务与技术事务有以下几点不同:

-   虽然 ACID 事务通常是短期的,但 BPMN 事务可能需要数小时、数天甚至数月才能完成。考虑这样一种情况:事务中的某个活动是用户任务,通常人的响应时间比应用程序要长。或者在另一种情况下,BPMN 事务可能需要等待某个业务事件的发生,比如特定订单已经完成。这类操作通常比更新数据库记录或使用事务队列存储消息要花费更长的时间。

-   由于无法将技术事务的范围限定在业务活动的持续时间内,BPMN 事务通常会跨越多个 ACID 事务。

-   由于 BPMN 事务跨越多个 ACID 事务,我们失去了 ACID 属性。例如,考虑上面给出的例子。假设"预订酒店"和"信用卡收费"操作是在单独的 ACID 事务中执行的。我们还假设"预订酒店"活动成功了。现在我们有了一个中间不一致的状态,因为我们已经完成了酒店预订,但还没有收取信用卡费用。在 ACID 事务中,我们也会按顺序执行不同的操作,因此也会有中间不一致的状态。这里不同的是,不一致的状态在事务范围之外是可见的。例如,如果预订是通过外部预订服务进行的,使用相同预订服务的其他方可能已经看到酒店被预订了。这意味着在实现业务事务时,我们完全失去了隔离性(诚然,我们在使用 ACID 事务时通常也会放宽隔离性以允许更高级别的并发,但在那里我们有细粒度的控制,且中间不一致状态仅在很短的时间内存在)。

-   BPMN 业务事务不能以传统意义上进行回滚。由于它跨越多个 ACID 事务,在 BPMN 事务被取消时,其中一些 ACID 事务可能已经提交。在这一点上,它们不能再被回滚了。

由于 BPMN 事务本质上是长期运行的,因此需要以不同的方式处理隔离性和回滚机制的缺失。在实践中,通常没有比采用特定领域的方式来处理这些问题更好的解决方案:

-   回滚是通过补偿来执行的。如果在事务范围内抛出取消事件,所有已成功执行且具有补偿处理器的活动的影响都会被补偿。

-   隔离性的缺失通常也是通过特定领域的解决方案来处理。例如,在上面的例子中,在我们确认第一位客户是否能够付款之前,酒店房间可能已经被第二位客户预订了。从业务角度来看,这可能是不可取的,因此预订服务可能会选择允许一定程度的超额预订。

-   此外,由于事务可能会因危险而中止,预订服务必须处理这样的情况:酒店房间已被预订,但由于事务被中止而从未尝试付款。在这种情况下,预订服务可能会选择这样的策略:为酒店房间设置最长预留时间,如果在此期间未收到付款,预订将被取消。

总而言之:虽然 ACID 事务为此类问题提供了通用解决方案(回滚、隔离级别和启发式结果),但在实现业务事务时,我们需要找到特定领域的解决方案来处理这些问题。

**当前限制:**

-   BPMN 规范要求流程引擎对底层事务协议发出的事件作出反应,例如,当底层协议中发生取消事件时,事务会被取消。作为一个可嵌入的引擎,Flowable 目前不支持这一点。关于这方面的一些影响,请参见下面关于一致性的段落。

**基于 ACID 事务和乐观并发的一致性:** BPMN 事务保证一致性,意味着要么所有活动都成功完成,要么如果某个活动无法执行,所有其他成功活动的影响都会被补偿。所以无论如何,我们最终都会达到一个一致的状态。然而,重要的是要认识到,在 Flowable 中,BPMN 事务的一致性模型是建立在流程执行的一致性模型之上的。Flowable 以事务方式执行流程。并发是通过乐观锁定来处理的。在 Flowable 中,BPMN 错误、取消和补偿事件都是建立在相同的 ACID 事务和乐观锁定之上的。例如,取消结束事件只有在实际到达时才能触发补偿。如果服务任务之前抛出了未声明的异常,则不会到达该事件。或者,如果底层 ACID 事务中的其他参与者将事务设置为仅回滚状态,则补偿处理器的效果无法提交。或者,当两个并发执行到达取消结束事件时,补偿可能会被触发两次并因乐观锁定异常而失败。所有这些都表明,在 Flowable 中实现 BPMN 事务时,适用与实现"普通"流程和子流程相同的规则。因此,为了有效地保证一致性,重要的是要以考虑乐观的事务执行模型的方式来实现流程。

#### 图形表示法

事务子流程可视化为带有双轮廓的[嵌入式子流程](bpmn/ch07b-BPMN-Constructs.md#graphical-notation)。

![bpmn.transaction.subprocess](assets/bpmn/bpmn.transaction.subprocess.png)

#### XML 表示

事务子流程在 XML 中使用 transaction 标签表示:

    <transaction id="myTransaction" >
        ...
    </transaction>

#### 示例

以下是一个事务子流程的示例:

![bpmn.transaction.subprocess.example.2](assets/bpmn/bpmn.transaction.subprocess.example.2.png)

### 调用活动(子流程)

#### 描述

BPMN 2.0 区分了常规的*[子流程](bpmn/ch07b-BPMN-Constructs.md#aocess)*（通常也称为*嵌入式子流程*）和看起来非常相似的调用活动。从概念上讲,当流程执行到达该活动时,两者都会调用子流程。

不同之处在于调用活动引用的是外部于流程定义的流程,而*[子流程](bpmn/ch07b-BPMN-Constructs.md#aocess)*则嵌入在原始流程定义中。调用活动的主要用例是拥有一个可重用的流程定义,该定义可以从多个其他流程定义中调用。

当流程执行到达*调用活动*时,会创建一个新的执行,它是到达调用活动的执行的子执行。然后使用这个子执行来执行子流程,可能会像在常规流程中一样创建并行的子执行。超级执行会等待子流程完全结束,然后继续执行原始流程。

#### 图形表示法

调用活动的可视化方式与[子流程](bpmn/ch07b-BPMN-Constructs.md#graphical-notation)相同,但带有粗边框(折叠和展开)。根据建模工具的不同,调用活动也可以展开,但默认的可视化是折叠的子流程表示。

![bpmn.collapsed.call.activity](assets/bpmn/bpmn.collapsed.call.activity.png)

#### XML 表示

调用活动是一个常规活动,它需要一个 *calledElement* 通过其**键**引用流程定义。实际上,这意味着在 *calledElement* 中使用的是**流程的 ID**。

    <callActivity id="callCheckCreditProcess" name="Check credit" calledElement="checkCreditProcess" />

注意,子流程的流程定义是在**运行时解析**的。这意味着如果需要,子流程可以独立于调用流程进行部署。

#### 传递变量

你可以将流程变量传递给子流程,反之亦然。当子流程启动时,数据会被复制到子流程中,当子流程结束时,数据会被复制回主流程。

    <callActivity id="callSubProcess" calledElement="checkCreditProcess">
        <extensionElements>
            <flowable:in source="someVariableInMainProcess"
                target="nameOfVariableInSubProcess" />
            <flowable:out source="someVariableInSubProcess"
                target="nameOfVariableInMainProcess" />
        </extensionElements>
    </callActivity>

通过将选项 inheritVariables 设置为 true,你可以将所有流程变量传递给子流程。

    <callActivity id="callSubProcess" calledElement="checkCreditProcess" flowable:inheritVariables="true"/>

我们提供了一个 Flowable 扩展作为 BPMN 标准元素的快捷方式,名为 *dataInputAssociation* 和 *dataOutputAssociation*,这些元素仅在你按照 BPMN 2.0 标准方式声明流程变量时才有效。

这里也可以使用表达式:

    <callActivity id="callSubProcess" calledElement="checkCreditProcess" >
        <extensionElements>
            <flowable:in sourceExpression="${x+5}" target="y" />
            <flowable:out source="${y+5}" target="z" />
        </extensionElements>
    </callActivity>

所以,最终 z = y+5 = x+5+5。

callActivity 元素还支持使用自定义 Flowable 属性扩展在子流程实例上设置业务键。'businessKey' 属性可用于在子流程实例上设置自定义业务键值。

    <callActivity id="callSubProcess" calledElement="checkCreditProcess" flowable:businessKey="${myVariable}">
    ...
    </callActivity>

将 'inheritBusinessKey' 属性的值设置为 true 会将子流程的业务键值设置为调用流程中定义的业务键值。

    <callActivity id="callSubProcess" calledElement="checkCreditProcess" flowable:inheritBusinessKey="true">
    ...
    </callActivity>

#### 引用来自同一部署的流程

默认行为是使用最新部署的流程定义来启动被引用的流程。在某些用例中,你可能希望从与主流程相同的部署中部署被引用的流程,以使用部署时被引用流程的相同状态。这要求你将主流程和被引用的流程部署在同一个部署单元中,这样流程定义就会有相同的部署引用。

要使用来自同一部署的被引用流程,你可以在 `callActivity` 元素上将 `sameDeployment` 属性设置为 `true`,如下例所示:

    <callActivity id="callSubProcess" calledElement="checkCreditProcess" flowable:sameDeployment="true">
    ...
    </callActivity>

默认情况下,`sameDeployment` 属性设置为 false。

当在当前租户中通过键找不到流程定义时,callActivity 元素提供了回退选项。当 fallbackToDefaultTenant 属性设置为 true 时,callActivity 会在没有租户的定义中通过键搜索流程定义。

    <callActivity id="callSubProcess" calledElement="checkCreditProcess" flowable:fallbackToDefaultTenant="true" >
    ...
    </callActivity>

默认值为 `false`。

#### 通过 ID 引用流程定义

默认行为是通过键获取最新部署的流程定义来启动被引用的流程。在某些用例中,你可能希望通过 ID 引用确切的流程定义。

要通过 ID 使用被引用的流程定义,请使用值为 `id` 的 `flowable:calledElementType`。允许的值是 `key` 和 `id`。

    <callActivity id="callSubProcess" calledElement="UNIQUE-PROCESS_DEFINITION-ID" flowable:calledElementType="id">
    ...
    </callActivity>

默认情况下,`flowable:calledElementType` 属性设置为 `key`。

#### 示例

下面的流程图展示了一个简单的订单处理流程。由于检查客户信用可能是许多其他流程都需要的通用步骤,因此这里将*检查信用步骤*建模为一个调用活动。

![bpmn.call.activity.super.process](assets/bpmn/bpmn.call.activity.super.process.png)

流程如下所示:

    <startEvent id="theStart" />
    <sequenceFlow id="flow1" sourceRef="theStart" targetRef="receiveOrder" />

    <manualTask id="receiveOrder" name="Receive Order" />
    <sequenceFlow id="flow2" sourceRef="receiveOrder" targetRef="callCheckCreditProcess" />

    <callActivity id="callCheckCreditProcess" name="Check credit" calledElement="checkCreditProcess" />
    <sequenceFlow id="flow3" sourceRef="callCheckCreditProcess" targetRef="prepareAndShipTask" />

    <userTask id="prepareAndShipTask" name="Prepare and Ship" />
    <sequenceFlow id="flow4" sourceRef="prepareAndShipTask" targetRef="end" />

    <endEvent id="end" />

子流程如下所示:

![bpmn.call.activity.sub.process](assets/bpmn/bpmn.call.activity.sub.process.png)

子流程的流程定义没有什么特别之处。它也可以在不被其他流程调用的情况下单独使用。

#### 异步完成

在某些特殊用例中,需要将调用活动的完成设置为异步(且独占)。

考虑以下流程定义。假设被调用的流程定义*仅包含被标记为异步和独占的服务任务*。
这些子流程实例的所有步骤都将异步执行。当最后一个异步服务任务执行完成时,将访问结束事件。
此时,控制权将返回给父流程实例。

![bpmn.call.activity.async.complete](assets/bpmn/bpmn.call.activity.async.complete.png)

问题在于异步锁定发生在流程实例级别。在这些情况下,当访问最后一个服务任务和事件时,子流程实例将被锁定。
这意味着当控制权返回给父流程实例时,即当调用活动*完成*时,父流程实例未被锁定。当使用多实例时,这意味着 x 个实例尝试完成调用活动。即使在所有步骤上都使用独占,这仍然意味着每个子流程实例都会并发地尝试更新父流程实例,由于为独占锁使用了"错误的"流程实例,可能会导致 *FlowableOptimisticLockingExceptions*。

解决这个问题的方法是为调用活动标记 *async complete* 标志。当设置为 *true* 时,将使用父流程实例创建一个新的异步作业。
当创建独占锁时,它将为父流程实例保持,并且调用活动的多实例完成将为每个子执行单独独占处理。

## 事务和并发

### 异步延续

Flowable 以可配置的事务方式执行流程。让我们先来看看 Flowable 通常如何处理事务范围。当你触发 Flowable(启动流程、完成任务、发送信号)时,Flowable 会在流程中前进,直到在每个活动执行路径上到达等待状态。具体来说,它会对流程图执行深度优先搜索,并在到达每个分支的等待状态时返回。等待状态是一个"稍后"执行的任务,这意味着 Flowable 会保存当前执行并等待再次触发。触发可以来自外部源(例如,如果我们有用户任务或接收消息任务),也可以来自 Flowable 本身(如果我们有定时器事件)。下图说明了这一点:

![async.example.no.async](assets/bpmn/async.example.no.async.PNG)

我们看到一个 BPMN 流程片段,其中包含一个用户任务、一个服务任务和一个定时器事件。完成用户任务和验证地址是同一工作单元的一部分,因此它们应该原子性地成功或失败。这意味着如果服务任务抛出异常,我们希望回滚当前事务,使执行回退到用户任务,并且用户任务仍然存在于数据库中。这也是 Flowable 的默认行为。在(1)中,应用程序或客户端线程完成任务。在同一个线程中,Flowable 现在执行服务并前进,直到到达等待状态,在本例中是定时器事件(2)。然后它将控制权返回给调用者(3),可能会提交事务(如果是由 Flowable 启动的)。

在某些情况下,这不是我们想要的。有时我们需要对流程中的事务边界进行自定义控制,以便能够划分逻辑工作单元。这就是异步延续发挥作用的地方。考虑以下流程(片段):

![async.example.async](assets/bpmn/async.example.async.PNG)

这次我们要完成用户任务,生成发票,然后将发票发送给客户。这次生成发票不是同一工作单元的一部分,所以如果生成发票失败,我们不希望回滚用户任务的完成。我们希望 Flowable 完成用户任务(1),提交事务并将控制权返回给调用应用程序。然后我们希望在后台线程中异步生成发票。这个后台线程是 Flowable 作业执行器(实际上是一个线程池),它会定期轮询数据库中的作业。在后台,当我们到达"生成发票"任务时,我们会创建一个作业"消息",让 Flowable 稍后继续处理流程,并将其持久化到数据库中。然后这个作业会被作业执行器获取并执行。我们还会给本地作业执行器一个提示,告诉它有一个新作业,以提高性能。

要使用此功能,我们可以使用 *flowable:async="true"* 扩展。例如,服务任务会像这样:

    <serviceTask id="service1" name="Generate Invoice"
        flowable:class="my.custom.Delegate"
        flowable:async="true" />

*flowable:async* 可以在以下 BPMN 任务类型上指定:task、serviceTask、scriptTask、businessRuleTask、sendTask、receiveTask、userTask、subProcess、callActivity

在 userTask、receiveTask 或其他等待状态上,异步延续允许我们在单独的线程/事务中执行开始执行监听器。

### 失败重试

在默认配置下,如果作业执行出现任何异常,Flowable 会重新运行作业三次。这对异步作业也适用。在某些情况下需要更多的灵活性,可以配置两个额外的参数:

- 重试次数

- 重试之间的延迟

这些参数可以通过 flowable:failedJobRetryTimeCycle 元素配置。以下是一个示例用法:

    <serviceTask id="failingServiceTask" flowable:async="true"
        flowable:class="org.flowable.engine.test.jobexecutor.RetryFailingDelegate">

        <extensionElements>
            <flowable:failedJobRetryTimeCycle>R5/PT7M</flowable:failedJobRetryTimeCycle>
        </extensionElements>
    </serviceTask>

时间周期表达式遵循 ISO 8601 标准,就像定时器事件表达式一样。上面的示例使作业执行器重试作业 5 次,每次重试之间等待 7 分钟。

### 独占作业

在最近的版本中,作业执行器确保来自单个流程实例的作业永远不会并发执行。为什么要这样做呢?

#### 为什么需要独占作业?

考虑以下流程定义:

![bpmn.why.exclusive.jobs](assets/bpmn/bpmn.why.exclusive.jobs.png)

我们有一个并行网关,后面跟着三个都执行异步延续的服务任务。因此,三个作业被添加到数据库中。一旦这样的作业出现在数据库中,就可以由作业执行器处理。作业执行器获取这些作业并将它们委托给实际处理作业的工作线程池。这意味着通过使用异步延续,你可以将工作分配给这个线程池(在集群场景中甚至可以分配给集群中的多个线程池)。这通常是件好事。然而,它也有一个固有的问题:一致性。考虑服务任务之后的并行合并。当服务任务执行完成时,我们到达并行合并点,需要决定是等待其他执行还是可以继续前进。这意味着,对于到达并行合并点的每个分支,我们需要决定是否可以继续,或者是否需要等待其他分支上的一个或多个其他执行。

为什么这是个问题呢?由于服务任务是使用异步延续配置的,所以相应的作业可能会同时被获取,并由作业执行器委托给不同的工作线程。结果是,执行服务的事务以及三个独立执行到达并行合并点的事务可能会重叠。如果发生这种情况,每个独立事务都不会"看到"另一个事务正在同时到达相同的并行合并点,因此会认为它必须等待其他事务。然而,如果每个事务都假设它必须等待其他事务,那么在并行合并之后就没有一个会继续处理流程,流程实例将永远保持在该状态。

Flowable 如何解决这个问题? Flowable 执行乐观锁定。每当我们基于可能不是最新的数据做出决定时(因为在我们提交之前另一个事务可能会修改它),我们会确保在两个事务中都增加相同数据库行的版本。这样,先提交的事务会成功,而其他事务会因乐观锁定异常而失败。这解决了上述流程中的问题:如果多个执行同时到达并行合并点,它们都会假设必须等待,增加其父执行(流程实例)的版本,然后尝试提交。最先执行的将能够提交,而其他的将因乐观锁定异常而失败。由于这些执行是由作业触发的,Flowable 将在等待一定时间后重试执行相同的作业,希望这次能通过同步网关。

这是一个好的解决方案吗? 正如我们所见,乐观锁定允许 Flowable 防止不一致。它确保我们不会"卡在合并网关",这意味着:要么所有执行都已通过网关,要么数据库中有作业确保我们重试通过它。然而,虽然从持久性和一致性的角度来看这是一个完美的解决方案,但在更高层面上这可能并不总是理想的行为:

- Flowable 只会重试同一个作业固定的最大次数(默认配置中为"3"次)。之后,作业仍然存在于数据库中,但不会再主动重试。这意味着需要外部操作员手动触发作业。

- 如果作业有非事务性的副作用,这些副作用不会被失败的事务回滚。例如,如果"预订音乐会门票"服务不与 Flowable 共享相同的事务,我们可能会在重试作业时预订多张门票。

#### 什么是独占作业?

独占作业不能与来自同一流程实例的另一个独占作业同时执行。考虑上面显示的流程:如果我们将服务任务声明为独占的,作业执行器将确保相应的作业不会并发执行。相反,它会确保每当它从某个流程实例获取一个独占作业时,它会获取同一流程实例的所有其他独占作业,并将它们委托给同一个工作线程。这确保了作业的顺序执行。

如何启用此功能? 在最近的版本中,独占作业是默认配置。所有异步延续和定时器事件默认都是独占的。此外,如果你希望作业是非独占的,可以使用 flowable:exclusive="false" 进行配置。例如,以下服务任务是异步的但非独占的。

    <serviceTask id="service" flowable:expression="${myService.performBooking(hotel, dates)}"
        flowable:async="true" flowable:exclusive="false" />

这是一个好的解决方案吗? 有人问过我们这是否是一个好的解决方案。他们担心这会阻止你"并行执行任务",从而导致性能问题。再次强调,需要考虑两点:

- 如果你是专家并且知道自己在做什么(而且理解了"为什么需要独占作业?"这一节),可以将其关闭。除此之外,对大多数用户来说,如果异步延续和定时器能够正常工作会更直观。

- 这实际上不是性能问题。性能问题只在高负载下才会出现。高负载意味着作业执行器的所有工作线程一直都很忙。使用独占作业时,Flowable 只是以不同方式分配负载。独占作业意味着来自单个流程实例的作业由同一个线程按顺序执行。但是要考虑到:你有不止一个流程实例。来自其他流程实例的作业会被委托给其他线程并发执行。这意味着使用独占作业时,Flowable 不会并发执行来自同一流程实例的作业,但仍然会并发执行多个实例。从整体吞吐量的角度来看,这在大多数场景下是可取的,因为它通常会使单个实例更快完成。此外,执行同一流程实例的后续作业所需的数据已经在执行集群节点的缓存中。如果作业没有这种节点亲和性,可能需要再次从数据库获取这些数据。

## 流程启动授权

默认情况下,所有人都可以启动已部署流程定义的新流程实例。流程启动授权功能允许你定义用户和组,以便 web 客户端可以选择性地限制哪些用户可以启动新的流程实例。注意,Flowable 引擎不会以任何方式验证授权定义。此功能仅用于帮助开发人员在 web 客户端中更轻松地实现授权规则。语法与用户任务的用户分配语法类似。可以使用 &lt;flowable:potentialStarter&gt; 标签将用户或组指定为流程的潜在启动者。以下是一个示例:

    <process id="potentialStarter">
      <extensionElements>
        <flowable:potentialStarter>
           <resourceAssignmentExpression>
             <formalExpression>group2, group(group3), user(user3)</formalExpression>
           </resourceAssignmentExpression>
        </flowable:potentialStarter>
      </extensionElements>

      <startEvent id="theStart"/>
      ...

在上面的 XML 片段中,'user(user3)' 直接指向用户 'user3','group(group3)' 指向组 'group3'。没有指示符的情况下将默认为组类型。也可以使用 &lt;process&gt; 标签的属性,即 &lt;flowable:candidateStarterUsers&gt; 和 &lt;flowable:candidateStarterGroups&gt;。以下是一个示例:

    <process id="potentialStarter" flowable:candidateStarterUsers="user1, user2"
        flowable:candidateStarterGroups="group1">
        ...

可以同时使用这两个属性。

定义流程启动授权后,开发人员可以使用以下方法检索授权定义。
此代码检索给定用户可以启动的流程定义列表:

    processDefinitions = repositoryService.createProcessDefinitionQuery().startableByUser("userxxx").list();

也可以检索为特定流程定义定义的所有潜在启动者身份链接

    identityLinks = repositoryService.getIdentityLinksForProcessDefinition("processDefinitionId");

以下示例展示了如何获取可以启动给定流程的用户列表:

    List<User> authorizedUsers = identityService().createUserQuery()
        .potentialStarter("processDefinitionId")
        .list();

同样的方式,也可以检索配置为给定流程定义潜在启动者的组列表:

    List<Group> authorizedGroups = identityService().createGroupQuery()
        .potentialStarter("processDefinitionId")
        .list();

同样的方式,也可以检索配置为给定流程定义潜在启动者的组列表:

    List<Group> authorizedGroups = identityService().createGroupQuery()
        .potentialStarter("processDefinitionId")
        .list();

## 数据对象

BPMN 提供了在流程或子流程元素中定义数据对象的可能性。根据 BPMN 规范,可以包含可能从 XSD 定义导入的复杂 XML 结构。作为在 Flowable 中支持数据对象的第一步,支持以下 XSD 类型:

    <dataObject id="dObj1" name="StringTest" itemSubjectRef="xsd:string"/>
    <dataObject id="dObj2" name="BooleanTest" itemSubjectRef="xsd:boolean"/>
    <dataObject id="dObj3" name="DateTest" itemSubjectRef="xsd:datetime"/>
    <dataObject id="dObj4" name="DoubleTest" itemSubjectRef="xsd:double"/>
    <dataObject id="dObj5" name="IntegerTest" itemSubjectRef="xsd:int"/>
    <dataObject id="dObj6" name="LongTest" itemSubjectRef="xsd:long"/>

数据对象定义将使用 'name' 属性值作为新变量的名称自动转换为流程变量。除了数据对象的定义外,Flowable 还提供了一个扩展元素来为变量分配默认值。以下 BPMN 片段提供了一个示例:

    <process id="dataObjectScope" name="Data Object Scope" isExecutable="true">
      <dataObject id="dObj123" name="StringTest123" itemSubjectRef="xsd:string">
        <extensionElements>
          <flowable:value>Testing123</flowable:value>
        </extensionElements>
      </dataObject>
      ...
