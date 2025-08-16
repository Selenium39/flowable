---
id: ch06-EventRegistry-Introduction
title: 事件注册表介绍
description: Flowable事件注册表介绍文档详细解析了如何使用事件注册表引擎从JMS、Kafka、RabbitMQ等来源接收和发送事件，并在BPMN/CMMN模型中触发流程实例或边界事件，包含事件定义和通道定义的配置方法及JSON示例。
keywords: Flowable,事件注册表,BPMN,CMMN,JMS,Kafka,RabbitMQ,事件定义,通道定义
---

## 什么是事件注册表？

事件注册表引擎允许从任何来源发送和接收事件（内置支持JMS、Kafka、RabbitMQ和通过HTTP接收事件），并在CMMN和BPMN模型中使用这些事件。例如，可以从JMS队列接收事件并启动一个新的流程实例，该流程定义中有一个监听此事件类型的开始事件。或者从Kafka主题接收事件，并触发特定流程实例中与传入事件的关联定义相匹配的边界事件。CMMN也有相同的功能，当接收到特定事件类型时可以启动新的案例实例，或触发特定案例实例的事件注册表监听器。需要配置两种类型的定义：事件定义和通道定义。

## 什么是事件定义？

事件定义除了用于标识事件类型的默认key和name属性外，还定义了传入或传出事件的事件载荷。事件载荷通过一个由名称和类型对象组成的数组来定义，支持字符串、整数、双精度浮点数和布尔类型。事件定义的另一部分是关联参数属性，可以为其定义一个包含名称和类型的参数对象数组。这些关联参数值用于将传入事件与案例或流程实例的事件订阅相匹配。以下是一个事件定义的JSON示例：

    {
      "key": "myEvent",
      "name": "我的事件",
      "correlationParameters": [
          {
            "name": "customerId",
            "type": "string"
          }
      ],
      "payload": [
          {
            "name": "customerName",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "integer"
          }
      ]
    }

## 什么是通道定义？

通道定义除了用于标识通道类型的默认key和name属性外，还定义了传入或传出事件的目标。目标名称与指定要使用的适配器类型的type值一起定义。系统内置支持JMS、Kafka和RabbitMQ适配器类型，但也可以添加其他适配器。对于通道定义，通道类型可以是入站（传入事件）或出站（传出事件）。

对于入站通道定义，需要定义事件key检测，它配置如何确定传入事件的事件key。这可以是固定的事件类型值，或者可以基于JSON字段值或JSON指针表达式来确定事件key。类似地，可以为多租户Flowable环境定义租户ID检测。这里也可以定义静态租户ID值，或使用JSON字段值或JSON指针表达式。入站通道定义的另一个可配置部分是传入事件的反序列化方式。默认情况下，系统内置支持JSON和XML反序列化选项。

对于出站通道定义，可以定义序列化器类型，支持JSON和XML值。以下是一个入站通道的JSON定义示例：

    {
      "key": "testChannel",
      "category": "channel",
      "name": "测试通道",
      "channelType": "inbound",
      "type": "jms",
      "destination": "test-customer",
      "deserializerType": "json",
      "channelEventKeyDetection": {
          "jsonField": "eventKeyValue"
      }
    }

这个入站通道定义示例连接到名为**test-customer**的JMS队列，传入事件将被反序列化为JSON格式的事件载荷，事件key将基于传入事件载荷中的**eventKeyValue** JSON属性来确定。

以下是一个出站通道的JSON定义示例：

    {
      "key": "outboundCustomer",
      "category": "channel",
      "name": "测试通道",
      "channelType": "outbound",
      "type": "jms",
      "destination": "outbound-customer",
      "serializerType": "json"
    }
    
这个出站通道定义示例连接到名为**outbound-customer**的JMS队列，传出事件将被序列化为JSON格式的事件载荷。