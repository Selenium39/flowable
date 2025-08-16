---
id: ch06-DMN-Introduction
title: DMN 1.1 介绍
description: Flowable DMN 1.1介绍文档详细解释了决策模型和标记法(DMN)的标准用法，包括如何创建DMN定义、决策表编辑器的使用以及7种命中策略的解析，适用于需要实现标准化决策流程的开发人员。
keywords: Flowable,DMN 1.1,决策模型,决策表,命中策略,输入输出表达式,开发指南
---

## 什么是DMN？

决策模型和标记法(DMN)是由[对象管理组织](http://www.omg.org/spec/DMN/1.1)发布的标准。它是一种用于描述和建模组织内可重复决策的标准方法，确保决策模型可以在不同组织之间互换。

## 什么是DMN定义

DMN 1.1 schema的根元素是**definitions**元素。在这个元素中可以定义多个决策定义（尽管我们建议在每个文件中只有一个决策定义，因为这样可以简化后期的开发过程）。在每个决策中，可以定义一个表达式。目前在Flowable中，支持**决策表**这种表达式类型。

    <definitions xmlns="http://www.omg.org/spec/DMN/20151101"
      namespace="http://www.flowable.org/dmn"
      name="DetermineDiscount">

      <decision id="DET_DISC_1" name="DetermineDiscount">

        <decisionTable id="determineDiscountTable1" hitPolicy="FIRST">
          ..
        </decisionTable>

      </decision>

    </definitions>

## 创建DMN定义

可以使用纯文本编辑器创建DMN定义，但在本例中，我们将使用Flowable建模器中包含的决策表编辑器。

我们将实现一个非常简单的用例：基于客户类别确定折扣百分比。

首先打开Flowable建模器中的决策表部分。

![决策表 1](assets/dmn/decision_tables_1.png)

然后选择**创建决策表**。

![决策表 2](assets/dmn/decision_tables_2.png)

提供决策表名称和唯一的决策表键，然后选择**创建新决策表**。

![决策表 3](assets/dmn/decision_tables_3.png)

现在您可以开始定义决策表了。让我们描述一下编辑器中显示的内容。

### 命中策略

在左上角，您可以选择**命中策略**。

有7种命中策略可用：

**单一命中**

- **F**IRST（首个）：多个（重叠的）规则可能匹配，具有不同的输出条目。返回按规则顺序的第一个命中（并且评估可以停止）。

- **U**NIQUE（唯一）：不可能有重叠，所有规则都是互斥的。只能匹配一个规则。

- **A**NY（任意）：可能有重叠，但所有匹配规则对每个输出都显示相等的输出条目，因此可以使用任何匹配。如果输出条目不相等，则命中策略不正确，结果将为空并标记为失败。当[严格模式](dmn/ch02-Configuration.md#strict-mode)被禁用时，最后一个有效规则将作为结果。（违规将作为验证消息出现）

- **P**RIORITY（优先级）：多个规则可能匹配，具有不同的输出条目。此策略返回具有最高输出优先级的匹配规则。输出优先级在输出值的有序列表中指定，按优先级降序排列。
  当[严格模式](dmn/ch02-Configuration.md#strict-mode)被禁用且没有定义输出值时，第一个有效规则将作为结果。（违规将作为验证消息出现）

**多重命中**

- **O**UTPUT ORDER（输出顺序）：按输出优先级降序返回所有命中。输出优先级在输出值的有序列表中指定，按优先级降序排列。

- **R**ULE ORDER（规则顺序）：按规则顺序返回所有命中。

- **C**OLLECT（收集）：按任意顺序返回所有命中。可以添加运算符（'+'，'&lt;'，'&gt;'，'\#'）来对输出应用简单函数。如果没有运算符，结果是所有输出条目的列表。

    - \+（求和）：决策表的结果是所有不同输出的总和。
    
    - &lt;（最小值）：决策表的结果是所有输出的最小值。
    
    - &gt;（最大值）：决策表的结果是所有输出的最大值。
    
    - \#（计数）：决策表的结果是输出的数量。

（在DMN规范1.2版本之前，`count`收集命中策略的定义指出只考虑不同的输出。通过在保存决策表时选择`强制DMN 1.1`，您仍然可以强制使用此行为）

### 输入和输出表达式

决策表本身的表头分为两个部分：蓝色和绿色。蓝色部分是**输入表达式**；绿色部分是**输出表达式**。

![决策表 4](assets/dmn/decision_tables_4.png)

在输入表达式中，您可以定义将在规则输入条目的表达式中使用的变量（下面将解释）。通过选择**添加输入**（右键单击选项菜单或单击加号图标），可以定义多个输入表达式。

![决策表 5](assets/dmn/decision_tables_5.png)

在输出表达式中，您可以定义将创建什么变量来形成决策表执行的结果（变量的值将由输出条目表达式确定；下面将解释）。通过选择**添加输出**（右键单击选项菜单或单击加号图标），可以定义多个输出表达式。

### 规则

每个规则由一个或多个输入条目和一个或多个输出条目组成。
输入条目是一个将针对输入变量（该"列"的）评估的表达式。当所有输入条目都评估为真时，规则被认为是真的，并且评估输出条目。

> **注意**
>
> DMN规范定义了一种表达式语言：(S)-FEEL。目前，我们不支持规范的这一部分。在Flowable DMN中，我们使用JUEL作为表达式语言。

![决策表 6](assets/dmn/decision_tables_6.png)

要输入表达式，请双击相应的单元格。
在本例中，输入了表达式 *== BRONZE*。与相应输入表达式（列标题）中定义的变量结合使用，这将在运行时生成完整表达式 *customerCat == "BRONZE"*。

![决策表 7](assets/dmn/decision_tables_7.png)

要输入输出表达式，请双击相应的单元格。
在本例中，输入了表达式 *5*。这实际上更像是一个隐式赋值。当该规则的所有输入条目都评估为真时，值5将被分配给相应输出条目（列）中的变量。

然后我们可以通过添加更多规则（通过选择添加规则）继续完成决策表。

![决策表 8](assets/dmn/decision_tables_8.png)

在我们的示例中，规则4有一个空的输入条目。空输入条目将被引擎评估为真。这意味着如果没有其他规则有效，规则4的结果将是这个决策表的输出。在这种情况下，变量**discountPerc**将具有值**0**。

![决策表 9](assets/dmn/decision_tables_9.png)

现在可以保存决策表了。提供一个唯一的决策表键。

## 在BPMN2.0流程中使用

新创建的决策表可以通过包含**决策任务**并选择**决策表引用**在BPMN2.0流程中使用。

![决策表 10](assets/dmn/decision_tables_10.png)

在上面的流程中，该流程有一个开始表单，它将向流程实例（因此也向决策表）提供**客户类别**。
**显示折扣**用户任务使用表达式表单字段显示决策表的结果，使用表达式：${discountperc}。

## DMN 1.1 XML

上面示例的完整DMN 1.1 XML。

    <definitions xmlns="http://www.omg.org/spec/DMN/20151101" id="definition_78d09dd7-374c-11e8-b5d8-0242ac120005" name="Determine Discount" namespace="http://www.flowable.org/dmn">
      <decision id="DET_DISC_1" name="Determine Discount">
        <decisionTable id="decisionTable_78d09dd7-374c-11e8-b5d8-0242ac120005" hitPolicy="UNIQUE">
          <input label="Customer Category">
            <inputExpression id="inputExpression_1" typeRef="string">
              <text>customerCat</text>
            </inputExpression>
            <inputValues>
              <text>"BRONZE","SILVER","GOLD"</text>
            </inputValues>
          </input>
          <output id="outputExpression_2" label="Discount Percentage" name="discountPerc" typeRef="number">
            <outputValues>
              <text>"0","5","10","20"</text>
            </outputValues>
          </output>
          <rule>
            <inputEntry id="inputEntry_1_1">
              <text><![CDATA[== "BRONZE"]]></text>
            </inputEntry>
            <outputEntry id="outputEntry_2_1">
              <text><![CDATA[5]]></text>
            </outputEntry>
          </rule>
          <rule>
            <inputEntry id="inputEntry_1_2">
              <text><![CDATA[== "SILVER"]]></text>
            </inputEntry>
            <outputEntry id="outputEntry_2_2">
              <text><![CDATA[10]]></text>
            </outputEntry>
          </rule>
          <rule>
            <inputEntry id="inputEntry_1_3">
              <text><![CDATA[== "GOLD"]]></text>
            </inputEntry>
            <outputEntry id="outputEntry_2_3">
              <text><![CDATA[20]]></text>
            </outputEntry>
          </rule>
          <rule>
            <inputEntry id="inputEntry_1_4">
              <text><![CDATA[-]]></text>
            </inputEntry>
            <outputEntry id="outputEntry_2_4">
              <text><![CDATA[0]]></text>
            </outputEntry>
          </rule>
        </decisionTable>
      </decision>
    </definitions>

- 这里需要注意的重要一点是，Flowable中使用的决策表键是DMN XML中的决策ID。\*