---
title: Flowable 数据库表结构详解
description: 本文详细解析Flowable工作流引擎的数据库表结构，包括通用命名规则和核心功能模块表设计，帮助开发者深入理解Flowable内部工作机制，优化工作流应用开发。
keywords: Flowable,数据库表结构,工作流引擎,ACT_RE表,ACT_RU表,流程定义,运行时数据
authors: Flowable中文文档
authorURL: http://flowable.me
---

在Flowable工作流引擎中，数据库表结构是整个系统的基础。本文将详细介绍Flowable中最重要的几类表结构，帮助大家更好地理解Flowable的内部工作机制。

![Flowable表结构概览](/img/blog/flowable-table-overview.svg)

## 1. 通用命名规则

Flowable的表名都遵循特定的命名规则，主要包括以下前缀：

- ACT_RE_*：'RE'表示repository，这些表包含流程定义和流程静态资源
- ACT_RU_*：'RU'表示runtime，这些表存储流程运行时的数据
- ACT_HI_*：'HI'表示history，这些表存储历史数据
- ACT_ID_*：'ID'表示identity，这些表存储身份信息
- ACT_GE_*：'GE'表示general，这些表存储通用数据
- ACT_APP_*：'APP'表示application，这些表存储应用级别的信息
- ACT_CMMN_*：'CMMN'表示Case Management，这些表存储案例管理相关数据
- ACT_DMN_*：'DMN'表示Decision Management，这些表存储决策管理相关数据
- FLW_*：'FLW'表示Flowable特定的扩展表

## 2. 核心功能模块表结构

### 2.1 流程定义相关表（Repository）

- **ACT_RE_DEPLOYMENT**：流程部署表
  - 主要字段：
    - ID_：部署ID，主键
    - NAME_：部署名称
    - CATEGORY_：部署类别
    - DEPLOY_TIME_：部署时间
    - TENANT_ID_：租户ID，用于多租户
  - 使用场景：每次部署流程定义文件时会产生记录

- **ACT_RE_PROCDEF**：流程定义表
  - 主要字段：
    - ID_：主键
    - KEY_：流程定义的标识
    - VERSION_：版本号
    - NAME_：流程定义名称
    - RESOURCE_NAME_：资源文件名称
    - DGRM_RESOURCE_NAME_：流程图资源名称
    - SUSPENSION_STATE_：暂停状态
  - 使用场景：存储流程定义的元数据，支持流程定义的版本控制

### 2.2 运行时数据表（Runtime）

- **ACT_RU_EXECUTION**：运行时流程执行实例表
  - 主要字段：
    - ID_：执行实例ID
    - PROC_INST_ID_：流程实例ID
    - BUSINESS_KEY_：业务标识
    - PARENT_ID_：父执行流ID
    - PROC_DEF_ID_：流程定义ID
    - SUPER_EXEC_：父流程实例ID（用于子流程）
  - 常用查询示例：
    ```sql
    -- 查询某个业务关联的流程实例
    SELECT * FROM ACT_RU_EXECUTION 
    WHERE BUSINESS_KEY_ = '业务ID';
    
    -- 查询所有活动的子流程
    SELECT * FROM ACT_RU_EXECUTION 
    WHERE SUPER_EXEC_ IS NOT NULL;
    ```

- **ACT_RU_TASK**：运行时任务表
  - 主要字段：
    - ID_：任务ID
    - NAME_：任务名称
    - ASSIGNEE_：受理人
    - CREATE_TIME_：创建时间
    - DUE_DATE_：到期时间
    - PRIORITY_：优先级
    - CATEGORY_：任务类别
  - 性能优化建议：
    - 建议为ASSIGNEE_字段创建索引
    - 对于到期时间的查询，建议增加DUE_DATE_的索引

- **ACT_RU_VARIABLE**：运行时变量表
  - 主要字段：
    - ID_：变量ID
    - TYPE_：变量类型
    - NAME_：变量名称
    - EXECUTION_ID_：所属执行实例ID
    - PROC_INST_ID_：所属流程实例ID
    - TASK_ID_：所属任务ID
    - BYTEARRAY_ID_：字节数组ID（用于存储序列化的变量）
  - 变量类型说明：
    - string：字符串类型
    - integer：整数类型
    - boolean：布尔类型
    - date：日期类型
    - serializable：序列化对象

### 2.3 历史数据表（History）

- **ACT_HI_PROCINST**：历史流程实例表
  - 主要字段：
    - ID_：流程实例ID
    - START_TIME_：开始时间
    - END_TIME_：结束时间
    - DURATION_：持续时间
    - START_USER_ID_：启动用户
    - SUPER_PROCESS_INSTANCE_ID_：父流程实例ID
  - 数据清理建议：
    ```sql
    -- 删除30天前的已完成流程
    DELETE FROM ACT_HI_PROCINST 
    WHERE END_TIME_ < DATE_SUB(NOW(), INTERVAL 30 DAY);
    ```

- **ACT_HI_TASKINST**：历史任务实例表
  - 主要字段：
    - ID_：任务实例ID
    - PROC_DEF_ID_：流程定义ID
    - TASK_DEF_KEY_：任务定义的ID
    - START_TIME_：开始时间
    - END_TIME_：结束时间
    - ASSIGNEE_：受理人
  - 常用统计查询：
    ```sql
    -- 统计用户任务处理时长
    SELECT 
      ASSIGNEE_,
      AVG(TIMESTAMPDIFF(MINUTE, START_TIME_, END_TIME_)) as avg_duration
    FROM ACT_HI_TASKINST
    WHERE END_TIME_ IS NOT NULL
    GROUP BY ASSIGNEE_;
    ```

### 2.4 身份数据表（Identity）

- **ACT_ID_USER**：用户表
  - 主要字段：
    - ID_：用户ID
    - FIRST_：名
    - LAST_：姓
    - EMAIL_：邮箱
    - PWD_：密码
  - 安全建议：
    - 密码字段建议使用加密存储
    - 建议使用外部认证系统集成

- **ACT_ID_GROUP**：用户组表
  - 主要字段：
    - ID_：组ID
    - NAME_：组名称
    - TYPE_：组类型
  - 应用场景：
    - 部门管理
    - 角色管理
    - 权限分组

### 2.5 作业和事件相关表
- **ACT_RU_JOB**：运行时作业表
  - 主要字段：
    - ID_：作业ID
    - TYPE_：作业类型
    - DUEDATE_：到期时间
    - REPEAT_：重复规则
  - 相关作业表：
    - ACT_RU_TIMER_JOB：定时作业表
    - ACT_RU_SUSPENDED_JOB：暂停的作业表
    - ACT_RU_DEADLETTER_JOB：无法执行的作业表
    - ACT_RU_EXTERNAL_JOB：外部作业表
    - ACT_RU_HISTORY_JOB：历史作业表

- **事件相关表**：
  - ACT_RU_EVENT_SUBSCR：事件订阅表
  - ACT_EVT_LOG：事件日志表
  - FLW_EVENT_DEFINITION：事件定义表
  - FLW_CHANNEL_DEFINITION：通道定义表

### 2.6 通用支持表
- **ACT_GE_BYTEARRAY**：二进制数据存储表
  - 存储流程定义文件、表单文件等
  - 主要字段：
    - ID_：主键
    - NAME_：文件名
    - BYTES_：二进制内容
    - DEPLOYMENT_ID_：部署ID

- **ACT_GE_PROPERTY**：属性表
  - 存储系统级别的属性信息
  - 主要字段：
    - NAME_：属性名
    - VALUE_：属性值
    - REV_：版本号

## 3. 扩展功能模块表结构

### 3.1 CMMN（案例管理）相关表
- **部署相关表**：
  - ACT_CMMN_DEPLOYMENT：CMMN部署表
  - ACT_CMMN_CASEDEF：案例定义表

- **运行时表**：
  - ACT_CMMN_RU_CASE_INST：运行时案例实例表
  - ACT_CMMN_RU_PLAN_ITEM_INST：计划项实例表

- **历史表**：
  - ACT_CMMN_HI_CASE_INST：历史案例实例表

### 3.2 DMN（决策管理）相关表
- **部署相关表**：
  - ACT_DMN_DEPLOYMENT：DMN部署表
  - ACT_DMN_DECISION：决策表定义表

- **历史表**：
  - ACT_DMN_HI_DECISION_EXECUTION：决策执行历史表

## 4. 表关系与性能优化

### 4.1 核心表关系
```
流程引擎核心表关系：
ACT_RE_DEPLOYMENT ←──┐
      ↓              │
ACT_RE_PROCDEF ←─┐   │
      ↓          │   │
ACT_RU_EXECUTION │   │
      ↓          │   │
ACT_RU_TASK      │   │
      ↓          │   │
ACT_HI_PROCINST ─┘   │
      ↓              │
ACT_HI_TASKINST ────┘
```

### 4.2 性能优化建议
1. 索引优化：
   ```sql
   CREATE INDEX idx_task_assignee ON ACT_RU_TASK(ASSIGNEE_);
   CREATE INDEX idx_hi_proc_inst_end ON ACT_HI_PROCINST(END_TIME_);
   CREATE INDEX idx_ru_execution_proc ON ACT_RU_EXECUTION(PROC_DEF_ID_);
   ```

2. 数据清理策略：
   - 按年月分表存储历史数据
   - 定期归档历史数据
   - 及时清理过期数据

3. 查询优化：
   - 优先使用API而非直接SQL查询
   - 合理使用分页查询
   - 避免全表扫描

## 5. 最佳实践与应用场景

### 5.1 常见应用场景

#### 5.1.1 请假审批流程示例
让我们通过一个具体的请假审批流程来看数据是如何在各个表中流转的：

![请假流程数据流转示意图](/img/blog/flowable-leave-process.svg)

1. **流程定义部署阶段**
```sql
-- ACT_RE_DEPLOYMENT 新增一条部署记录
INSERT INTO ACT_RE_DEPLOYMENT(ID_, NAME_, DEPLOY_TIME_) 
VALUES ('1', '请假流程-V1', '2025-03-13 10:00:00');

-- ACT_RE_PROCDEF 新增一条流程定义记录
INSERT INTO ACT_RE_PROCDEF(ID_, NAME_, KEY_, VERSION_, DEPLOYMENT_ID_)
VALUES ('leave:1:1', '请假申请', 'leave', 1, '1');
```

2. **发起请假申请**
```sql
-- ACT_RU_EXECUTION 新增流程实例
INSERT INTO ACT_RU_EXECUTION(ID_, PROC_INST_ID_, BUSINESS_KEY_, PROC_DEF_ID_)
VALUES ('2001', '2001', 'LEAVE-2025-001', 'leave:1:1');

-- ACT_RU_TASK 新增员工填写任务
INSERT INTO ACT_RU_TASK(ID_, EXECUTION_ID_, PROC_INST_ID_, TASK_DEF_KEY_, NAME_)
VALUES ('2002', '2001', '2001', 'fillForm', '填写请假申请');

-- ACT_RU_VARIABLE 保存表单数据
INSERT INTO ACT_RU_VARIABLE(ID_, EXECUTION_ID_, NAME_, TYPE_, TEXT_)
VALUES 
('2003', '2001', 'days', 'integer', '3'),
('2004', '2001', 'reason', 'string', '年假');
```

3. **直接主管审批**
```sql
-- ACT_RU_TASK 更新前一个任务状态，新增审批任务
UPDATE ACT_RU_TASK SET END_TIME_ = NOW() WHERE ID_ = '2002';
INSERT INTO ACT_RU_TASK(ID_, EXECUTION_ID_, PROC_INST_ID_, TASK_DEF_KEY_, NAME_, ASSIGNEE_)
VALUES ('2005', '2001', '2001', 'leaderApprove', '直接主管审批', 'leader1');

-- ACT_HI_TASKINST 记录任务历史
INSERT INTO ACT_HI_TASKINST(ID_, PROC_INST_ID_, TASK_DEF_KEY_, NAME_, START_TIME_, END_TIME_)
VALUES ('2002', '2001', 'fillForm', '填写请假申请', '2025-03-13 10:05:00', '2025-03-13 10:10:00');
```

4. **人事审批**
```sql
-- ACT_RU_TASK 更新主管审批任务，新增人事审批任务
UPDATE ACT_RU_TASK SET END_TIME_ = NOW() WHERE ID_ = '2005';
INSERT INTO ACT_RU_TASK(ID_, EXECUTION_ID_, PROC_INST_ID_, TASK_DEF_KEY_, NAME_, ASSIGNEE_)
VALUES ('2006', '2001', '2001', 'hrApprove', '人事审批', 'hr1');

-- ACT_HI_TASKINST 记录主管审批历史
INSERT INTO ACT_HI_TASKINST(ID_, PROC_INST_ID_, TASK_DEF_KEY_, NAME_, START_TIME_, END_TIME_)
VALUES ('2005', '2001', 'leaderApprove', '直接主管审批', '2025-03-13 10:10:00', '2025-03-13 11:00:00');
```

5. **流程结束**
```sql
-- ACT_RU_TASK 删除最后一个任务
DELETE FROM ACT_RU_TASK WHERE ID_ = '2006';

-- ACT_RU_EXECUTION 删除执行实例
DELETE FROM ACT_RU_EXECUTION WHERE PROC_INST_ID_ = '2001';

-- ACT_HI_PROCINST 更新流程实例历史
UPDATE ACT_HI_PROCINST 
SET END_TIME_ = NOW(), 
    DURATION_ = TIMESTAMPDIFF(SECOND, START_TIME_, NOW())
WHERE PROC_INST_ID_ = '2001';

-- ACT_HI_TASKINST 记录最后一个任务历史
INSERT INTO ACT_HI_TASKINST(ID_, PROC_INST_ID_, TASK_DEF_KEY_, NAME_, START_TIME_, END_TIME_)
VALUES ('2006', '2001', 'hrApprove', '人事审批', '2025-03-13 11:00:00', '2025-03-13 11:30:00');
```

**数据流转说明**：
1. 部署阶段：
   - 流程定义文件存储在 `ACT_GE_BYTEARRAY`
   - 部署信息记录在 `ACT_RE_DEPLOYMENT`
   - 流程定义信息记录在 `ACT_RE_PROCDEF`

2. 运行时阶段：
   - 流程实例数据在 `ACT_RU_EXECUTION`
   - 当前任务数据在 `ACT_RU_TASK`
   - 流程变量在 `ACT_RU_VARIABLE`

3. 历史记录：
   - 流程实例历史在 `ACT_HI_PROCINST`
   - 任务历史在 `ACT_HI_TASKINST`
   - 变量历史在 `ACT_HI_VARINST`

### 5.2 多引擎集成建议
1. 流程引擎与CMMN集成：
   - 使用统一的事务管理
   - 共享用户数据
   - 统一历史数据管理

2. DMN决策表使用：
   - 在流程中调用决策表
   - 在案例中使用决策节点

### 5.3 最佳实践清单
1. 数据管理：
   - 定期清理历史数据
   - 实施合理的归档策略
   - 监控表数据量增长

2. 性能优化：
   - 合理使用索引
   - 优化查询方式
   - 定期维护数据库

3. 安全建议：
   - 注意多租户数据隔离
   - 加密敏感信息
   - 控制数据访问权限

## 总结

了解Flowable的表结构设计对于以下方面很有帮助：
- 理解Flowable的工作原理
- 进行流程调试和问题排查
- 优化系统性能
- 实现复杂业务场景
- 多引擎协同工作

希望本文能帮助大家更好地理解Flowable的数据库设计，为后续的开发和维护工作提供参考。 