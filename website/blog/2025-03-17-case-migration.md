---
title: Flowable 案例迁移
description: 本文详细介绍Flowable案例迁移功能，包括API使用方法和迁移文档配置，帮助用户实现案例定义版本间的平滑迁移，提升业务流程管理效率。
keywords: Flowable,案例迁移,业务流程管理,迁移API,迁移文档,CMMN迁移,CMMN案例,Flowable博客
authors: Flowable中文文档
authorURL: http://flowable.me
---

在业务流程管理系统中，案例定义（Case Definition）的版本更新是一个常见的需求。Flowable提供了强大的案例迁移(Case Migration)功能，允许您将案例实例从一个定义版本迁移到另一个版本。本文将详细介绍这个功能的使用方法。

## 迁移API概览

Flowable提供了多个层级的迁移API：

1. 单个案例实例迁移
2. 从特定案例定义迁移所有案例实例
3. 批量迁移特定案例定义的所有案例实例

除了上述API外，Flowable还支持历史案例实例的迁移，这对于使用案例重新激活功能特别有用。需要注意的是，在迁移历史案例实例时，不能指定迁移映射和表达式，因为案例仍然处于关闭状态。

## 迁移文档简单示例

迁移过程的核心是迁移文档（Migration Document），这是一个JSON格式的配置文件。让我们通过一个具体的例子来说明：

假设我们要将以下testMigrationCase案例（包含两个人工任务，通过sentry连接）：

![CMMN案例迁移前](/img/blog/cmmn-migration-before.png)

迁移到新版本（包含一个人工任务和一个服务任务，通过sentry连接）：

![CMMN案例迁移后](/img/blog/cmmn-migration-after.png)

迁移文档的JSON结构如下：

```json
{
  "toCaseDefinitionKey": "testMigrationCase",
  "toCaseDefinitionVersion": 2,
  "terminatePlanItemDefinitions": [
    {
      "planItemDefinitionId": "humanTask2"
    }
  ],
  "moveToAvailablePlanItemDefinitions": [
    {
      "planItemDefinitionId": "serviceTask1"
    }
  ]
}
```

## 迁移文档的主要配置项

### 1. 目标定义配置

- `toCaseDefinitionId`：目标案例定义的唯一ID
- `toCaseDefinitionKey`：目标案例定义的键值
- `toCaseDefinitionVersion`：目标案例定义的版本号
- `toCaseDefinitionTenantId`：多租户环境下的租户ID

### 2. 状态变更配置

迁移文档支持多种状态变更操作：

1. **激活计划项（Activate Plan Items）**
   - 用于激活新的计划项
   - 可设置新负责人和本地变量

2. **移动到可用状态（Move to Available）**
   - 适用于由sentry控制的新计划项
   - 可设置本地变量

3. **终止计划项（Terminate Plan Items）**
   - 用于移除或停止计划项
   - 仅对活动项生效

4. **重复等待状态管理**
   - `waitingForRepetitionPlanItemDefinitions`：添加重复等待
   - `removeWaitingForRepetitionPlanItemDefinitions`：移除重复等待

### 3. 高级配置

- **预升级和后升级表达式**：用于执行迁移前后的自定义逻辑
- **案例实例变量**：设置案例级别的变量
- **计划项ID变更**：处理计划项ID发生变化的情况

## CMMN迁移服务接口

Flowable提供了`CmmnMigrationService`接口来管理案例实例的迁移。以下是主要的接口方法：

### 迁移构建器创建方法
```java
// 创建案例实例迁移构建器
CaseInstanceMigrationBuilder createCaseInstanceMigrationBuilder();

// 从迁移文档创建案例实例迁移构建器
CaseInstanceMigrationBuilder createCaseInstanceMigrationBuilderFromCaseInstanceMigrationDocument(CaseInstanceMigrationDocument document);

// 创建历史案例实例迁移构建器
HistoricCaseInstanceMigrationBuilder createHistoricCaseInstanceMigrationBuilder();

// 从迁移文档创建历史案例实例迁移构建器
HistoricCaseInstanceMigrationBuilder createHistoricCaseInstanceMigrationBuilderFromHistoricCaseInstanceMigrationDocument(HistoricCaseInstanceMigrationDocument document);
```

### 迁移验证方法
```java
// 验证单个案例实例的迁移
CaseInstanceMigrationValidationResult validateMigrationForCaseInstance(String caseInstanceId, CaseInstanceMigrationDocument document);

// 验证案例定义下所有案例实例的迁移
CaseInstanceMigrationValidationResult validateMigrationForCaseInstancesOfCaseDefinition(String caseDefinitionId, CaseInstanceMigrationDocument document);

// 验证指定版本案例定义下所有案例实例的迁移
CaseInstanceMigrationValidationResult validateMigrationForCaseInstancesOfCaseDefinition(String caseDefinitionKey, int caseDefinitionVersion, String caseDefinitionTenantId, CaseInstanceMigrationDocument document);
```

### 迁移执行方法
```java
// 迁移单个案例实例
void migrateCaseInstance(String caseInstanceId, CaseInstanceMigrationDocument document);

// 迁移单个历史案例实例
void migrateHistoricCaseInstance(String caseInstanceId, HistoricCaseInstanceMigrationDocument document);

// 迁移案例定义下的所有案例实例
void migrateCaseInstancesOfCaseDefinition(String caseDefinitionId, CaseInstanceMigrationDocument document);

// 迁移案例定义下的所有历史案例实例
void migrateHistoricCaseInstancesOfCaseDefinition(String caseDefinitionId, HistoricCaseInstanceMigrationDocument document);

// 迁移指定版本案例定义下的所有案例实例
void migrateCaseInstancesOfCaseDefinition(String caseDefinitionKey, int caseDefinitionVersion, String caseDefinitionTenantId, CaseInstanceMigrationDocument document);

// 迁移指定版本案例定义下的所有历史案例实例
void migrateHistoricCaseInstancesOfCaseDefinition(String caseDefinitionKey, int caseDefinitionVersion, String caseDefinitionTenantId, HistoricCaseInstanceMigrationDocument document);
```

### 批量迁移方法
```java
// 批量迁移案例定义下的所有案例实例
Batch batchMigrateCaseInstancesOfCaseDefinition(String caseDefinitionId, CaseInstanceMigrationDocument document);

// 批量迁移案例定义下的所有历史案例实例
Batch batchMigrateHistoricCaseInstancesOfCaseDefinition(String caseDefinitionId, HistoricCaseInstanceMigrationDocument document);

// 批量迁移指定版本案例定义下的所有案例实例
Batch batchMigrateCaseInstancesOfCaseDefinition(String caseDefinitionKey, int caseDefinitionVersion, String caseDefinitionTenantId, CaseInstanceMigrationDocument document);

// 批量迁移指定版本案例定义下的所有历史案例实例
Batch batchMigrateHistoricCaseInstancesOfCaseDefinition(String caseDefinitionKey, int caseDefinitionVersion, String caseDefinitionTenantId, HistoricCaseInstanceMigrationDocument document);

// 获取批量迁移的结果
CaseInstanceBatchMigrationResult getResultsOfBatchCaseInstanceMigration(String migrationBatchId);
```

## 实际应用场景

假设您有一个"项目案例"的CMMN模型，当前版本包含以下阶段和计划项：

1. 项目准备阶段
   - 项目章程创建（人工任务）
   - 项目团队组建（人工任务）
   - 项目计划制定（人工任务）

2. 项目执行阶段
   - 需求分析（人工任务）
   - 设计开发（人工任务）
   - 测试验证（人工任务）

现在需要升级到新版本，增加以下改进：
1. 在项目准备阶段增加风险评估计划项
2. 将项目计划制定改为自动服务任务
3. 在项目执行阶段增加代码审查计划项

迁移文档示例：
```json
{
  "toCaseDefinitionKey": "projectCase",
  "toCaseDefinitionVersion": 2,
  "terminatePlanItemDefinitions": [
    {
      "planItemDefinitionId": "projectPlanTask"
    }
  ],
  "moveToAvailablePlanItemDefinitions": [
    {
      "planItemDefinitionId": "riskAssessmentPlan",
      "localVariables": {
        "riskAssessmentType": "comprehensive"
      }
    },
    {
      "planItemDefinitionId": "codeReviewTask"
    }
  ],
  "activatePlanItemDefinitions": [
    {
      "planItemDefinitionId": "autoProjectPlan",
      "localVariables": {
        "planTemplate": "standard"
      }
    }
  ]
}
```

## 使用建议

1. 在进行迁移前，建议先备份相关数据
2. 仔细规划迁移策略，确保所有必要的状态转换都被正确处理
3. 使用条件表达式（condition）来控制迁移行为
4. 在测试环境中先进行迁移测试
5. 记录迁移过程中的关键操作和结果

## 总结

Flowable的Case Migration功能提供了灵活且强大的案例版本迁移能力。通过合理使用迁移文档中的各种配置项，您可以安全地将案例实例从一个版本迁移到另一个版本，同时保持业务流程的连续性和完整性。