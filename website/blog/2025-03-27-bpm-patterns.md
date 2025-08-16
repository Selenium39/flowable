---
title: Flowable中的四种核心流程控制模式：会签、或签、分支与并行
description: 本文详细介绍Flowable中的四种核心流程控制模式：会签、或签、分支与并行，包含基础概念、实现方法和代码示例，帮助开发者掌握复杂业务流程的实现技巧。
keywords: Flowable,流程控制模式,会签流程,或签流程,分支流程,并行流程,BPMN,业务流程管理
authors: Flowable中文文档
authorURL: http://flowable.me
---

在业务流程管理(BPM)领域，合理选择和应用流程模式对于满足复杂业务需求至关重要。Flowable作为一个灵活的BPM引擎，支持多种流程控制模式的实现。本文将重点介绍四种常用的流程模式：会签流程、或签流程、分支流程和并行流程，并结合Flowable展示其具体实现方法。

## 流程模式基础概念

在深入了解各种流程模式之前，先简单介绍一下BPMN基本概念：

- **流程定义(Process Definition)**：业务流程的静态模型
- **流程实例(Process Instance)**：流程定义的运行时执行实例
- **任务(Task)**：流程中的工作单元，通常需要人工处理
- **网关(Gateway)**：控制流程执行路径的节点
- **流程变量(Process Variable)**：存储和传递流程数据的容器

## 会签流程模式

会签流程（也称为"全部审批"模式）要求多个参与者必须全部同意才能继续流程。这常用于重要决策审批、合同审核等场景。

![会签流程模式](/img/blog/countersign-flow.svg)

### 会签流程的特点

- 多人必须全部完成任务才能继续流程
- 可设置驳回机制，任一人拒绝即可终止流程
- 可配置顺序执行或并行执行

### Flowable中的会签实现

在Flowable中，会签流程主要通过多实例用户任务(Multi-Instance User Task)实现，配合条件表达式控制流程走向。

```xml
<userTask id="approvalTask" name="部门经理审批" flowable:assignee="${assignee}">
  <multiInstanceLoopCharacteristics isSequential="false">
    <loopCardinality>${nrOfApprovers}</loopCardinality>
    <completionCondition>${nrOfCompletedInstances == nrOfInstances}</completionCondition>
  </multiInstanceLoopCharacteristics>
</userTask>
```

上面的示例中：
- `isSequential="false"` 表示所有审批任务会并行创建
- `completionCondition` 设置为只有当所有实例都完成时才继续流程

### 会签流程的核心API使用

```java
// 设置审批人列表
List<String> approverList = Arrays.asList("manager1", "manager2", "manager3");
Map<String, Object> variables = new HashMap<>();
variables.put("approverList", approverList);
variables.put("nrOfApprovers", approverList.size());

// 启动会签流程
ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
    "contractApprovalProcess", 
    "CONTRACT-2025-001", 
    variables
);

// 查询当前待办任务
List<Task> tasks = taskService.createTaskQuery()
    .processInstanceId(processInstance.getId())
    .taskCandidateOrAssigned("manager1")
    .list();
```

### 会签流程的高级应用

在实际应用中，会签流程常常需要处理一些特殊情况：

1. **动态会签人**：根据业务数据动态确定审批人
    ```java
    // 动态构建审批人列表
    List<String> approvers = userService.getDepartmentManagers(departmentId);
    execution.setVariable("approverList", approvers);
    execution.setVariable("nrOfApprovers", approvers.size());
    ```

2. **会签结果汇总**：收集所有审批人的意见
    ```xml
    <multiInstanceLoopCharacteristics isSequential="false">
      <loopCardinality>${nrOfApprovers}</loopCardinality>
      <inputDataItem name="approver" />
      <inputDataItem name="comments" />
      <completionCondition>${nrOfCompletedInstances == nrOfInstances}</completionCondition>
    </multiInstanceLoopCharacteristics>
    ```

## 或签流程模式

或签流程（也称为"任一审批"模式）只需要多个参与者中的任意一个同意即可继续流程。这适用于一般性审批、资源分配等场景。

![或签流程模式](/img/blog/orsign-flow.svg)

### 或签流程的特点

- 任意一人完成任务即可继续流程
- 适合平级审批或并行审批场景
- 提高审批效率，避免流程阻塞

### Flowable中的或签实现

或签流程在Flowable中同样使用多实例用户任务实现，但通过完成条件(completionCondition)控制只需一人完成即可。

```xml
<userTask id="approvalTask" name="部门审批" flowable:assignee="${assignee}">
  <multiInstanceLoopCharacteristics isSequential="false">
    <loopCardinality>${nrOfApprovers}</loopCardinality>
    <completionCondition>${nrOfCompletedInstances >= 1}</completionCondition>
  </multiInstanceLoopCharacteristics>
</userTask>
```

上面的示例中：
- `completionCondition` 设置为只要有一个实例完成即可继续流程

### 候选人方式实现或签

除了多实例方式外，也可以使用候选人(Candidate)机制实现或签：

```xml
<userTask id="approvalTask" name="部门审批">
  <potentialOwner>
    <resourceAssignmentExpression>
      <formalExpression>user1,user2,user3</formalExpression>
    </resourceAssignmentExpression>
  </potentialOwner>
</userTask>
```

配合Java代码：

```java
// 设置候选人
List<String> candidateUsers = Arrays.asList("user1", "user2", "user3");
for (String user : candidateUsers) {
    taskService.addCandidateUser(task.getId(), user);
}

// 认领任务
taskService.claim(taskId, "user1");

// 完成任务
taskService.complete(taskId);
```

## 分支流程模式

分支流程（也称为"条件路由"模式）根据业务条件选择不同的执行路径。这是BPM中最常用的控制流模式之一。


![分支流程模式](/img/blog/branch-flow.svg)

### 分支流程的特点

- 基于条件表达式动态选择流程路径
- 可实现复杂的业务决策逻辑
- 支持默认路径设置

### 排他网关实现分支

在Flowable中，分支流程主要通过排他网关(Exclusive Gateway)实现：

```xml
<exclusiveGateway id="approvalDecision" name="审批决策" />

<sequenceFlow id="flow1" sourceRef="approvalDecision" targetRef="approvedPath">
  <conditionExpression xsi:type="tFormalExpression">${approved == true}</conditionExpression>
</sequenceFlow>

<sequenceFlow id="flow2" sourceRef="approvalDecision" targetRef="rejectedPath">
  <conditionExpression xsi:type="tFormalExpression">${approved == false}</conditionExpression>
</sequenceFlow>
```

### 包容网关实现复杂分支

当需要同时选择多个满足条件的分支时，可以使用包容网关(Inclusive Gateway)：

```xml
<inclusiveGateway id="riskAssessment" name="风险评估" />

<sequenceFlow id="flow1" sourceRef="riskAssessment" targetRef="creditCheck">
  <conditionExpression xsi:type="tFormalExpression">${amount > 10000}</conditionExpression>
</sequenceFlow>

<sequenceFlow id="flow2" sourceRef="riskAssessment" targetRef="identityVerification">
  <conditionExpression xsi:type="tFormalExpression">${customerType == 'new'}</conditionExpression>
</sequenceFlow>

<sequenceFlow id="flow3" sourceRef="riskAssessment" targetRef="basicProcessing">
  <conditionExpression xsi:type="tFormalExpression">${amount <= 10000 && customerType != 'new'}</conditionExpression>
</sequenceFlow>
```

### 动态分支控制

在实际应用中，我们可以通过Java代码动态设置流程变量，进而控制分支流向：

```java
// 设置决策变量
Map<String, Object> variables = new HashMap<>();
variables.put("approved", riskScore > 70);
variables.put("amount", loanRequest.getAmount());
variables.put("customerType", customer.getType());

// 完成任务，触发网关决策
taskService.complete(taskId, variables);
```

## 并行流程模式

并行流程（也称为"同步执行"模式）允许多个活动同时执行，提高流程效率。适用于相互独立的任务处理场景。

![并行流程模式](/img/blog/parallel-flow.svg)

### 并行流程的特点

- 多个任务可同时执行，互不干扰
- 可设置同步点，等待所有分支完成
- 提高流程执行效率，缩短总处理时间

### 并行网关实现

在Flowable中，并行流程通过并行网关(Parallel Gateway)实现：

```xml
<!-- 分叉：开始并行执行 -->
<parallelGateway id="forkProcess" />
<sequenceFlow id="flow1" sourceRef="startEvent" targetRef="forkProcess" />

<sequenceFlow id="flow2" sourceRef="forkProcess" targetRef="documentReview" />
<sequenceFlow id="flow3" sourceRef="forkProcess" targetRef="technicalReview" />
<sequenceFlow id="flow4" sourceRef="forkProcess" targetRef="financialReview" />

<!-- 各并行任务 -->
<userTask id="documentReview" name="文档审查" />
<userTask id="technicalReview" name="技术评估" />
<userTask id="financialReview" name="财务审核" />

<!-- 汇合：等待所有并行分支完成 -->
<sequenceFlow id="flow5" sourceRef="documentReview" targetRef="joinProcess" />
<sequenceFlow id="flow6" sourceRef="technicalReview" targetRef="joinProcess" />
<sequenceFlow id="flow7" sourceRef="financialReview" targetRef="joinProcess" />
<parallelGateway id="joinProcess" />

<sequenceFlow id="flow8" sourceRef="joinProcess" targetRef="finalApproval" />
```

### 并行流与会签结合

并行流和会签可以结合使用，实现更复杂的业务场景：

```xml
<parallelGateway id="forkProcess" />

<sequenceFlow id="flow1" sourceRef="forkProcess" targetRef="hrApproval" />
<sequenceFlow id="flow2" sourceRef="forkProcess" targetRef="financeApproval" />

<!-- HR部门会签 -->
<userTask id="hrApproval" name="HR部门审批" flowable:assignee="${hrApprover}">
  <multiInstanceLoopCharacteristics isSequential="false">
    <loopCardinality>${hrApproverCount}</loopCardinality>
    <completionCondition>${nrOfCompletedInstances == nrOfInstances}</completionCondition>
  </multiInstanceLoopCharacteristics>
</userTask>

<!-- 财务部门会签 -->
<userTask id="financeApproval" name="财务部门审批" flowable:assignee="${financeApprover}">
  <multiInstanceLoopCharacteristics isSequential="false">
    <loopCardinality>${financeApproverCount}</loopCardinality>
    <completionCondition>${nrOfCompletedInstances == nrOfInstances}</completionCondition>
  </multiInstanceLoopCharacteristics>
</userTask>

<parallelGateway id="joinProcess" />
```

## 实际应用场景：采购审批流程

下面是一个结合了上述四种流程模式的采购审批流程示例：

![采购审批流程综合示例](/img/blog/combined-flow.svg)

```xml
<process id="purchaseApprovalProcess" name="采购审批流程">
  <startEvent id="startEvent" />
  <sequenceFlow id="flow1" sourceRef="startEvent" targetRef="initiatePurchase" />
  
  <!-- 初始化采购申请 -->
  <userTask id="initiatePurchase" name="填写采购申请" />
  <sequenceFlow id="flow2" sourceRef="initiatePurchase" targetRef="amountGateway" />
  
  <!-- 分支流：根据金额决定审批路径 -->
  <exclusiveGateway id="amountGateway" />
  <sequenceFlow id="flow3" sourceRef="amountGateway" targetRef="simpleApproval">
    <conditionExpression xsi:type="tFormalExpression">${amount <= 10000}</conditionExpression>
  </sequenceFlow>
  <sequenceFlow id="flow4" sourceRef="amountGateway" targetRef="complexApprovalFork">
    <conditionExpression xsi:type="tFormalExpression">${amount > 10000}</conditionExpression>
  </sequenceFlow>
  
  <!-- 或签流程：小额采购任一经理审批 -->
  <userTask id="simpleApproval" name="经理审批">
    <potentialOwner>
      <resourceAssignmentExpression>
        <formalExpression>manager1,manager2,manager3</formalExpression>
      </resourceAssignmentExpression>
    </potentialOwner>
  </userTask>
  <sequenceFlow id="flow5" sourceRef="simpleApproval" targetRef="endEvent" />
  
  <!-- 并行流程：大额采购需多部门审核 -->
  <parallelGateway id="complexApprovalFork" />
  <sequenceFlow id="flow6" sourceRef="complexApprovalFork" targetRef="departmentApproval" />
  <sequenceFlow id="flow7" sourceRef="complexApprovalFork" targetRef="financeCheck" />
  
  <!-- 会签流程：部门经理全部审批 -->
  <userTask id="departmentApproval" name="部门经理审批" flowable:assignee="${assignee}">
    <multiInstanceLoopCharacteristics isSequential="false">
      <loopCardinality>${nrOfManagers}</loopCardinality>
      <completionCondition>${nrOfCompletedInstances == nrOfInstances}</completionCondition>
    </multiInstanceLoopCharacteristics>
  </userTask>
  
  <!-- 财务审核 -->
  <userTask id="financeCheck" name="财务审核" />
  
  <!-- 汇合所有审批 -->
  <sequenceFlow id="flow8" sourceRef="departmentApproval" targetRef="complexApprovalJoin" />
  <sequenceFlow id="flow9" sourceRef="financeCheck" targetRef="complexApprovalJoin" />
  <parallelGateway id="complexApprovalJoin" />
  
  <!-- 最终CEO审批 -->
  <sequenceFlow id="flow10" sourceRef="complexApprovalJoin" targetRef="ceoApproval" />
  <userTask id="ceoApproval" name="CEO审批" />
  <sequenceFlow id="flow11" sourceRef="ceoApproval" targetRef="endEvent" />
  
  <endEvent id="endEvent" />
</process>
```

使用Java代码启动上述流程：

```java
// 设置流程变量
Map<String, Object> variables = new HashMap<>();
variables.put("amount", 15000);
variables.put("nrOfManagers", 3);
variables.put("assignee1", "manager1");
variables.put("assignee2", "manager2");
variables.put("assignee3", "manager3");

// 启动流程实例
ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
    "purchaseApprovalProcess", 
    "PUR-2025-001", 
    variables
);
```

## 流程模式设计最佳实践

在使用Flowable设计和实现上述流程模式时，以下是一些最佳实践建议：

1. **明确业务需求**：在选择流程模式前，明确业务需要"会签"还是"或签"，是否有分支条件等。

2. **简化流程设计**：流程设计应尽量简洁，避免过度复杂的路由逻辑。

3. **合理使用表达式**：流程条件表达式应清晰、简单，易于维护。

4. **考虑异常处理**：设计流程时，需考虑异常情况，如审批人不在岗、驳回处理等。

5. **预留扩展点**：流程设计应考虑未来可能的变更，预留扩展点。

6. **使用监听器记录关键事件**：
    ```java
    public class ApprovalTaskListener implements TaskListener {
        @Override
        public void notify(DelegateTask delegateTask) {
            if (TaskListener.EVENTNAME_COMPLETE.equals(delegateTask.getEventName())) {
                // 记录任务完成事件
                boolean approved = (boolean) delegateTask.getVariable("approved");
                String comment = (String) delegateTask.getVariable("comment");
                LoggingService.logApproval(delegateTask.getId(), approved, comment);
            }
        }
    }
    ```

## 总结

BPM流程设计中的会签流程、或签流程、分支流程和并行流程是解决复杂业务场景的基础模式。Flowable通过其灵活的BPMN实现和丰富的API，提供了这些模式的完整支持。通过合理组合这些模式，可以构建出满足各种业务需求的复杂工作流，提高业务流程的自动化水平和执行效率。

在实际应用中，应根据具体业务场景选择适当的流程模式，并遵循流程设计的最佳实践，确保流程定义清晰、高效且可维护。Flowable作为一个成熟的BPM引擎，为这些流程模式的落地实施提供了强大的技术支持。 