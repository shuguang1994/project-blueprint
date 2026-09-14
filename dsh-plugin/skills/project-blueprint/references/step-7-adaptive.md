# Step 7：持续自适应机制

> `SKILL.md` Step 7 的完整实现细节，由 SKILL.md 的「Step 索引与按需加载」表按需加载。
> 关联：references/ai-work-protocol.md、references/project-sync-guide.md、references/ai-common-mistakes.md、references/spec-driven.md、references/step-2-assembly.md

### 在生成的 AGENTS.md 中注入维护指令

AGENTS.md 的「上下文管理」章节必须包含 Agent 主动维护规则（而非被动"每月 review"）：

```markdown
## 上下文管理

- **Agent 主动维护本文件** — 每次完成以下操作时同步更新：
  | 操作 | 更新内容 |
  |------|---------|
  | 新增模块/服务 | 更新模块速查表 |
  | 新增依赖/工具 | 更新项目身份中的技术栈行 |
  | 发现新的代码规范 | 追加到强制规范章节 |
  | 做出架构决策 | 追加到关键架构决策表 |
  | 修复典型 Bug | 写入 docs/B/B-04-BUG知识库.md |
  | CI 流程变更 | 同步更新 docs 中 CI 描述 |
  | 文档膨胀 | 按职责域拆分到 docs/ 引用，保持 AGENTS.md 聚焦核心规则 |
  | 修复 Bug 且根因是规范缺失 | 补充 B-01 对应章节规则 + AGENTS.md 强制规范新增一条 ✅/❌ 防复发 |
  | 修复缺陷 / 发现 AI 重复被纠正 / 新增阻断级红线 | 判定是否可机检 → 可机检则登记 scripts/gates.json 并写检查脚本；不可机检则标注 [无门禁] 并归入 BUG 模式 |
  | 按项目进度检查（功能完成/重构/上线/季度） | 检查 AGENTS.md / B-01 / B-04 是否滞后于进度，滞后则提醒用户维护 |
- 项目记忆 (project_memory.md) 季度清理
```

> AGENTS.md「上下文管理」须同时含**规模硬阈值**与**文档契约**（见 `references/step-2-assembly.md` 的 Step 2.1 注入 C）。

### 门禁生长机制（宪法驱动）

> **门禁是缺陷驱动的生长物，不是初始化产物**——初始化只能播"种子"（通用配方门禁，如 `docs-consistency` + `spec-drift` 两条），领域门禁必须靠宪法在开发过程中长出来（真实工程约 1/4 的缺陷模式最终固化为门禁）。

**触发条件**（任一命中即走生长流程）：

1. 修完一个缺陷
2. 发现 AI 重复被纠正
3. 新增了一条阻断级红线

**六步流程**（与 `references/ai-work-protocol.md` 第七章逐字一致）：

```
① 触发  修完一个缺陷 / 发现 AI 重复被纠正 / 新增了一条阻断级红线
   ↓
② 判定  四问（缺一不进）：可机检？ 零新依赖（只用项目已装工具）？ 真发生过或有明确证据？ 误报率可控？
   ↓ 可机检 → 建门禁        ↓ 不可机检 → 只写规范 + 标 [无门禁] + 归入 BUG 知识库模式
③ 生成  取配方：跨语言门禁配方表 → 组件 Gate 段 → 联网搜索（三层递进，与组件分类同机制）
   ↓
④ 注册  ① 写具体检查（scripts/checks/<id>.*）  ② 往 gates.json 追加一条（含 source / level / stage）
   ↓
⑤ 验证  负向验证：故意制造一次违规 → 确认门禁能拦住（拦不住则不得登记为 blocking）
   ↓
⑥ 登记  BUG 知识库 新增/归类模式 + docs/B/B-06 记录 + CHANGELOG（如发版）
```

> 协议细则见 `docs/B/B-06-门禁与工作协议.md`（中大型项目）；同步操作见 `references/project-sync-guide.md`「门禁生长登记流程」。

**与 SDD 的衔接**（不改变上述 6 步语义）：

- 上面三个触发点（修完缺陷 / 发现 AI 重复被纠正 / 新增阻断级红线）对应规范驱动开发的 **⑥ verify** 阶段：verify 中「逐条核 checklist」暴露出的**未闭环项**，即下一轮生长的触发源（六阶段见 `references/spec-driven.md`）。
- **两条入口共用一套机制**：「缺陷 → 门禁」与「spec checklist → 门禁」都写入同一个 `scripts/gates.json`、走同一套装配点（`references/gates-templates.md`），流程**不重复定义**；区别仅在 `source` 取值——前者为 `AGENTS#<章节名>`，后者为 `spec#<change-id>`（spec 侧细则见 `references/spec-driven.md` 第五章）。

### 项目进度与文档健康检查

Agent 在以下里程碑主动检查文档滞后情况并提醒用户维护：

| 里程碑 | 检查项 |
|--------|--------|
| 新功能完成 | 模块速查表 / 技术栈行 / 代码规范是否需补充 |
| 重构完成 | 架构决策表 / 目录结构 / 耦合度分析 |
| 上线前 | B-02 部署指南 / CI 描述 / 检查清单 |
| 发布前 / 重大流程变更后 | 核对 `references/eval-baseline.md` 的规模指标与闭环指标（SKILL.md ≤ 200 行 / step 文件 ≤ 500 行 / AGENTS.md ≤ 300 行 / 单篇文档 ≤ 600 行 / 门禁覆盖率） |
| 季度末 | 项目记忆清理 / B-04 归档 / 规范体系回顾 |

- 用户说"看下项目进度" → 输出：最近进展 + 文档滞后清单 + 建议维护项

### AI 犯错型 Bug 反哺流程

修复 Bug 且根因是 **AI 犯错**时（区别于编码疏忽）：

1. 检查是否命中 `references/ai-common-mistakes.md` 清单
2. 命中 → 强化对应规则（B-01「八、AI 高频错误防犯清单」标注出现次数）
3. 未命中 → 新增清单条目 + B-01 补规则 + AGENTS.md 强制规范加一条 ✅/❌ 防复发

### Agent 同步操作指南

详见 `references/project-sync-guide.md`。
