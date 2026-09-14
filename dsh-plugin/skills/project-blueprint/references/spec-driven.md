# 规范驱动开发（Spec-Driven Development）

> Skill `project-blueprint` 参考。定义 `.trae/specs/`（Cursor 下为 `.cursor/specs/`）的落地规则：一次变更如何从想法走到可验收（六阶段）。
> 引用方：`references/step-3-docs.md` 3.3（生成目录与三件套）
> 关联：`references/ai-work-protocol.md`（7 步任务生命周期 / 门禁生长 6 步 / 证据标准）、`references/gates-templates.md`（`gates.json` 唯一事实源与统一入口）
> 版本: v1.0

---

## 一、定位与边界

- **`ai-work-protocol.md` 管「一次任务怎么做得可验证」**：读规范 → 查先例 → 定契约 → 列计划 → 实施 → 跑门禁 → 回写文档，7 步不可跳步。
- **本文档管「一次变更怎么从想法走到可验收」**：① specify → ② plan → ③ tasks → ④ checklist → ⑤ implement → ⑥ verify。
- 两者在 **verify 阶段交汇**：跑门禁（协议第 6 步）+ 回写文档（协议第 7 步）。
- 本文档**不替代**协议，也**不重新定义**门禁字段、门禁流程与统一入口（一律引用 `references/gates-templates.md` 与 `references/ai-work-protocol.md` 第七章）。

---

## 二、六阶段流程

| 阶段 | 目的 | 产物 | 准入门槛（未过不得进入下一阶段） |
|------|------|------|--------------------------------|
| ① specify | 说清为什么改 / 改什么 / 影响谁 | `spec.md` 的 Why + What Changes + Impact 三节 | Why 至少 2 句且含事实依据（现象 / 报错 / 指标 / `文件:行号`）；What Changes 逐条列全且无「待定」；Impact 列出受影响文件、受影响契约与「不做（与原因）」 |
| ② plan | 技术方案与影响面，明确不改什么 | `spec.md` 的 Requirements（ADDED / MODIFIED / REMOVED）+ 方案说明 | 每条 Requirement 用 `SHALL` 句式且可判定；每条至少含 1 个 `#### Scenario:`（WHEN / THEN）；明确列出「不改动项 + 原因」；无未决技术选项 |
| ③ tasks | 可验证的工作项拆解 | `tasks.md` | 每个 Task 至少含 1 条验收标准，形如「命令 + 期望输出」；标注任务依赖与并行波次；单 Task 粒度不超过一次提交 |
| ④ checklist | 逐条可核对的验收点 | `checklist.md` | 每条为 `- [ ]` 且尽量可机检（命令 / 断言）；不可机检的写明人工判定方法；覆盖 spec 全部 Requirement |
| ⑤ implement | 实施并留证 | 代码 / 文档改动 + `tasks.md` 勾选 + 证据 | 每完成一项先回填证据（`文件:行号` / 命令 + 实际输出）**再**勾选；禁止先勾选后补证 |
| ⑥ verify | 跑门禁 + 逐条核 checklist + 显式标注未闭环 | checklist 全勾 + 门禁真实输出 + 未闭环清单 | `scripts/verify.*` 实跑并粘贴真实输出；checklist 逐条核对不得整段跳过；未闭环项显式标注「未验证 + 原因 + 风险」 |

> 阶段顺序不可跳步；⑥ 暴露的未闭环项即下一轮门禁生长的触发源（见 `references/ai-work-protocol.md` 第七章、`references/step-7-adaptive.md` 门禁生长机制）。

---

## 三、产物与目录约定

```
.trae/specs/                     # Cursor 下为 .cursor/specs/
├── README.md                    # 说明六阶段流程 / 三件套用途 / change-id 命名规则
├── <change-id>/
│   ├── spec.md
│   ├── tasks.md
│   └── checklist.md
└── archive/
    └── <change-id>/             # 验收完成后整体归档，三件套不拆散
```

- **`<change-id>` 命名**：**动词开头 + kebab-case**，一个 id 只描述一个变更单元，如 `add-payment-module`、`fix-coupon-oversell`、`refactor-auth-guard`。
- **按需创建（零固定表）**：初始化只建 `README.md` 与 `archive/`，具体 `<change-id>/` 在每次变更启动时创建，不预设变更清单。
- **同一 change-id 未完成时继续追加**：补 spec → 加 tasks → 重跑 verify，**不新建第二个 id**；若中途发现是两件互不相关的变更 → 拆分为多个 id 并在 `tasks.md` 的 Task Dependencies 标明依赖。
- **归档**：⑥ verify 通过后整体移动到 `.trae/specs/archive/<change-id>/`，保持相对结构不变。归档不是删除——历史留痕用于审计、门禁溯源。
- **IDE 不支持 specs**（项目无 `.trae/` / `.cursor/` 约定）→ 跳过本流程，回落到 `references/ai-work-protocol.md` 的 7 步（spec 要点改写进任务计划即可）。

---

## 四、三件套模板

### 4.1 `spec.md`

```markdown
# <change-id>: <一句话标题>

> 状态: 草稿 | 已定稿 | 已归档 ｜ 更新: <YYYY-MM-DD>

## Why
<为什么改：现象 / 数据 / 影响，至少 2 句，含事实依据（`文件:行号` / 报错原文 / 指标）>

## What Changes
- <逐条列出本变更要做的改动：能力 / 行为 / 接口 / 文件>

## Impact
- 受影响文件: <路径列表>
- 受影响契约: <DTO / schema / 导出物 / 配置>
- 不做（与原因）: <明确划掉的范围 + 为什么不在此次做>

## ADDED Requirements

### Requirement: <新增能力名>
<系统> SHALL <可判定的行为描述>。

#### Scenario: <场景名>
- **WHEN** <前置条件 / 触发动作>
- **THEN** <可观察、可断言的结果>

## MODIFIED Requirements

### Requirement: <已有能力名>
<新行为> SHALL <可判定的行为描述>（原: <旧行为>）。

#### Scenario: <场景名>
- **WHEN** ...
- **THEN** ...

## REMOVED Requirements

### Requirement: <被移除能力名>
<移除原因 + 迁移方式（替代方案 / 兼容期）>
```

### 4.2 `tasks.md`

```markdown
# <change-id> — 任务清单

> 依赖 Task 未完成时不得开始下游 Task ｜ 同一文件同波次只允许一个执行者

## Task 1: <任务名>
- [ ] 1.1 <子任务>
- [ ] 1.2 <子任务>
- 验收标准: `<命令>` → <期望输出>
- 证据: <`文件:行号` / 命令实际输出>（完成后回填，见 `references/ai-work-protocol.md` 第四章）

## Task 2: <任务名>
- [ ] 2.1 <子任务>
- 验收标准: `<命令>` → <期望输出>
- 证据: <完成后回填>

# Task Dependencies
- Task 2 依赖 Task 1（<依赖的具体产物>）
- Task 3 与 Task 2 无依赖，可并行

# 并行波次（可选，无并行需求可省略）
| 波次 | 可并行 Task | 共享文件 | 纪律 |
|------|------------|---------|------|
| 1 | Task 1 | - | - |
| 2 | Task 2 / Task 3 | 各自独占文件（无共享） | **同一文件同波次只允许一个执行者** |
```

> 并行纪律来源：同一文件的并发写入会互相覆盖（后写覆盖先写），故「同一文件同波次只允许一个执行者」；如确实需要同波次改同一文件，须降级为串行（详见本技能仓库 `CHANGELOG.md` v1.7.1 记录的并发编辑竞态）。

### 4.3 `checklist.md`

```markdown
# <change-id> — 验收清单

> 每条尽量可机检；不可机检的须写清人工判定方法。⑥ verify 阶段逐条核对，不得整段跳过。

## 一、功能
- [ ] `<命令>` → <期望输出>（覆盖 Requirement: <能力名>）
- [ ] <观察项>：人工判定方法 = 在 <环境> 执行 <步骤>，应看到 <结果>

## 二、契约 / 兼容
- [ ] <导出物 / schema 未漂移>：`<命令>` → <期望输出>

## 三、文档回写
- [ ] AGENTS.md / `docs/B/B-04-BUG知识库.md` / 索引已按改动类型回写（`<检查命令>`）

## 四、门禁
- [ ] `scripts/verify.*` 全部 blocking 通过（粘贴真实输出，退出码 0）
```

---

## 五、checklist 转门禁

### 5.1 登记规则

- 可机检的 checklist 项可转为门禁，写进目标项目的 `scripts/gates.json`，`source` 记为 **`spec#<change-id>`**（例：`spec#add-payment-module`）。
- 字段沿用 `references/gates-templates.md` §一 的既有字段（`id` / `source` / `level` / `stage` / `run` / `cwd` / `why`），**不新增字段、不另建清单**——`gates.json` 始终是唯一事实源。
- 适合转门禁的 checklist 须同时满足**准入门槛四问**：可机检？零新依赖（只用项目已装工具）？真发生过或有明确证据？误报率可控？（四问原文与展开见 `references/ai-work-protocol.md` 第七章，此处不重复展开）。缺一 → 保留为 checklist 人工核对项，并在 BUG 知识库标注 `[无门禁]` + 写明原因。

**示例条目**（引自 §一 字段口径，`source` 换成 spec 来源）：

```json
[
  {
    "id": "dto-export-drift",
    "source": "spec#add-payment-module",
    "level": "blocking",
    "stage": ["pre-push", "ci"],
    "run": "node scripts/checks/dto-export-drift.mjs",
    "cwd": ".",
    "why": "spec 约定 DTO 导出物为契约唯一源；实测一次改动漏提交导出物导致前后端字段不一致"
  }
]
```

### 5.2 门禁生命周期与 spec 归档

| 情形 | 处理 |
|------|------|
| spec 验收并归档 | 门禁**保留**，`source` 保持 `spec#<change-id>` 不变（供审计溯源），不回改归档文件 |
| 仅需调整 `level` / `stage` | 按 `references/gates-templates.md` §六 门禁治理规则调整 `gates.json`，不触碰归档 spec |
| checklist 项作废（需求被移除 / 判定不可机检） | 门禁**一并下线**，并从 `scripts/gates.json` 移除该条目，避免僵尸门禁（`check-constitution.*` 会就 `source` 定位不到报 warning） |
| spec 未完成期间 | 门禁可先以 `warn` 级登记，验收后按四问与负向验证结果升为 `blocking` |

---

## 六、与 7 步任务生命周期的映射

| SDD 阶段 | 对应 `ai-work-protocol.md` 7 步 | 产物 |
|---------|-------------------------------|------|
| ① specify | 1 读规范 + 2 查先例 | `spec.md` Why / What Changes / Impact |
| ② plan | 3 定契约 | `spec.md` Requirements（`SHALL` + `#### Scenario:`） |
| ③ tasks | 4 列计划 | `tasks.md`（含可机检验收标准） |
| ④ checklist | 4 列计划（验收面展开） | `checklist.md` |
| ⑤ implement | 5 实施 | 代码 / 文档改动 + 证据回填 |
| ⑥ verify | 6 跑门禁 + 7 回写文档 | 门禁输出 + checklist 全勾 + 文档回写 |

> **三件套是 7 步的产物载体，不替代 7 步**：步骤 1 / 2 / 3（读规范、查先例、定契约）仍不可跳步，只是把结论落到 `spec.md` 里；协议第一章豁免的**一次性只读分析**（可跳过步骤 4~6）同样无需产出三件套，但仍须遵守协议第四章证据标准（结论给出 `文件:行号`）。

---

## 七、常见反模式

| ❌ 反模式 | ✅ 正确做法 |
|----------|-----------|
| 先写代码再补 spec（spec 沦为事后说明） | spec 定稿前不动代码；只读调研、探测、读先例是允许的 |
| checklist 写成主观描述（如「功能正常」「体验良好」） | 写成「命令 + 期望输出」；不可机检的写明人工判定方法（环境 + 步骤 + 预期观察） |
| 一个 change-id 塞多个不相关变更 | 拆成多个 change-id，并在 Task Dependencies 标明依赖关系 |
| 勾选 tasks 后才找证据 / 用「应该没问题」代替输出 | 先回填证据（`文件:行号` / 命令实际输出）再勾选（协议第四章禁止的表述清单） |
| 未闭环项沉默跳过（checklist 留空直接交付） | 显式标注「未验证 + 原因 + 风险」，并列入下一轮门禁生长的触发源 |
| spec 归档时顺手删掉 spec 与门禁 | spec 归档留痕、门禁保留（`source` 不变）；仅当 checklist 作废才下线门禁 |
