# Step 2：规则引擎拼接

> `SKILL.md` Step 2 的完整实现细节，由 SKILL.md 的「Step 索引与按需加载」表按需加载。
> 关联：references/knowledge-base.md、references/code-conventions.md、references/ai-common-mistakes.md、references/agents-md-template.md、references/ai-work-protocol.md

### 2.0 读取知识库

**按探测到的组件名**在 `references/knowledge-base.md` 中搜索对应条目（不读全文，按 `### [组件名]` 定位；`##` 为维度章节，`###` 才是组件条目）:
```
### [组件名]
**Commands**: 精确可执行命令
**Conventions**: ❌/✅ 规范要点
**CI job**: GitHub Actions yaml 片段
```

之后的拼接步骤全部基于此知识库。

> 另按探测到的语言/框架，从 `references/code-conventions.md`（基础规范种子）与 `references/ai-common-mistakes.md`（AI 高频错误）提取基础规范与 AI 易错点。

### 2.1 主流程

```
Step 1 探测结果
    ↓
对每个组件（knowledge-base.md 的 16 个维度章节：language/framework/orm/css/ui/testing/lint/state/package_manager/deployment/database/ai/iac/observability/data/mobile）:
    ↓
在 references/knowledge-base.md 中查找对应组件条目
    ↓
  找到 → 提取 Commands / Conventions / CI job 段落
  未找到 → 触发联网回退（见 2.2）
    ↓
按 AGENTS.md 骨架拼接:
  [项目身份] ← 探测结果
  [Commands] ← 从各组件的 Commands 段合并去重
  [Boundaries] ← knowledge-base 通用段落
  [强制规范] ← 从各组件的 Conventions 段拼接
  [基础代码规范] ← 从 code-conventions.md 按语言/框架提取 6 大类核心规则，每类 ≤4 条、总计 ≤20 条（优先选取 AI 高频错误对应规则），详细规则落入 docs/B/B-01
  [AI 易错点] ← 从 ai-common-mistakes.md 按探测技术栈提取，未覆盖的易错点触发联网回退
  [CI 模板] ← 从各组件的 CI job 段合并
  [Git 规范] ← knowledge-base 通用段落
  [代码审查清单] ← knowledge-base 通用段落
    ↓
生成 vendor breadcrumbs 与工具私有增强层（按探测到的远程仓库和 IDE 生态自适应）:
  CLAUDE.md → @AGENTS.md
  .cursor/rules/project.mdc → alwaysApply: true + @AGENTS.md
  若远程为 GitHub → .github/copilot-instructions.md
  若存在 .gemini/ 目录 → .gemini/GEMINI.md → @AGENTS.md
  若存在 .windsurfrules → 追加 "See AGENTS.md for project conventions"
  工具私有增强层（Cursor glob 分层 / Claude Code hooks·subagents / Copilot instructions 分层等）→ 按 references/vendor-breadcrumbs.md 生成
```

> **维度命名说明（step-1 ↔ step-2）**：2.1 的 16 个维度名 = `references/knowledge-base.md` 的 `##` 章节维度（检索键）。Step 1.2「命名模式 → 维度推断」用的是**推断维度名**（分类标签，粒度更细），二者用途不同、不矛盾：**推断维度用于分类依赖，维度章节名用于落库检索**。同名维度直接对应；异名按下表换算——

| Step 1.2 推断维度 | 2.1 维度章节名 | 说明 |
|---|---|---|
| `build` | （无独立章节） | 构建工具并入框架/包管理通用段落 |
| `deploy` | `deployment` | 知识库「部署 / 运行时」章节 |
| `logging` / `auth` / `http` / `email` / `media` / `docs` / `api` / `queue` / `i18n` | （无独立章节） | 归入框架通用段落或 `code-conventions.md`（日志/安全等类别） |
| `ai` / `iac` / `observability` / `data` / `mobile` | 同名 | 与知识库新增章节一致 |
| 其余（`language`/`framework`/`orm`/`css`/`ui`/`testing`/`lint`/`state`/`package_manager`/`database`） | 同名 | 直接对应 |

**在 AGENTS.md 强制规范章节末尾注入「代码规范体系」三层引用模板**（AGENTS.md 核心 → B-01 详细 → B-04 反哺）：

```markdown
### 代码规范体系（三层引用）
- 核心规则 → 本文件 AGENTS.md「强制规范」（基础代码规范 ≤20 条、每类 ≤4 条 + AI 易错点防犯）
- 详细规则 → docs/B/B-01-开发规范.md（8 章实写，权威源为本文件）
- 反哺闭环 → docs/B/B-04-BUG知识库.md（修复 Bug 根因是规范缺失时，反哺 B-01 与本文件）
```

**注入 A：门禁即规则（元规则）** — 放入生成的 AGENTS.md 作为独立顶层章节（位于「代码审查检查清单」之后、「上下文管理」之前），原文逐字如下（与 `references/ai-work-protocol.md` 第八章、`references/agents-md-template.md` 第九章保持一致）：

```markdown
## 门禁即规则（元规则，优先级最高）

1. **无门禁不立规** — 新增"阻断级"红线时，必须同时提交可执行检查并登记入
   `scripts/gates.json`；确实无法机检的红线，标注 `[无门禁]` 并写明原因。
2. **缺陷必闭环** — 每修复一个缺陷，必须判定"是否可机检"：可机检 → 新建或扩展门禁；
   不可机检 → 归入 `docs/B/B-04-BUG知识库.md` 模式。禁止只改代码不沉淀。
3. **契约唯一源** — 跨端字段以 DTO / schema 导出物为唯一事实源，导出物变更须随代码
   一同提交（CI 校验漂移）。

> **门禁清单唯一事实源**：`scripts/gates.json` ｜ **统一入口**：`scripts/verify.*`
> ｜ **宪法一致性校验**：`scripts/check-constitution.*`
> **开工前置**：读取 `scripts/gates.json`，了解本仓库现有门禁（避免重复踩坑）。
```

**注入 B：门禁清单与装配** — 作为下一个顶层章节插入，原文：

```markdown
## 门禁清单与装配

> 门禁只允许使用项目已安装的工具，不得要求新装依赖。新增门禁 = 写检查 + 清单加一条，装配自动生效。

| 项 | 路径 / 说明 |
|------|------|
| 门禁清单（唯一事实源） | `scripts/gates.json`（字段：id / source / level / stage / run / cwd / why） |
| 统一入口 | `scripts/verify.*`（从清单读取执行，支持 `--stage=` 过滤） |
| 宪法自校验 | `scripts/check-constitution.*`（校验本文件红线 ↔ 清单双向一致） |
| 装配点 | pre-commit（快检查）/ pre-push（全量）/ CI（全量 + 重检查） |
| 分级 | `blocking`（必过）｜ `warn`（提示）；存量项目默认全 warn，逐步升 blocking |
```

**注入 C：上下文管理新增条目** — 「上下文管理」章节须新增：

- **规模硬阈值**：AGENTS.md ≤ 300 行 / `docs/` 单篇 ≤ 600 行，超出须拆分并在索引登记；硬阈值由文档校验脚本检查，warning 级不阻断
- **文档契约**：`docs/B`、`docs/C` 头部须有 `> 版本: … | 更新: … | 状态: …`；编号唯一，缺号须有归档或在索引标注预留；索引须覆盖全部非归档文档；校验命令 `node scripts/docs-check.mjs`，仅 error 阻断

### 2.2 联网回退

**触发条件**: knowledge-base.md 中无对应组件条目时（覆盖全部 16 个维度，与 2.1 的维度清单一致）。

**搜索策略**（`{currentYear}` 必须取系统当前真实年份，禁止硬编码）:

| 未知维度 | 搜索模板 |
|----------|---------|
| 未知语言 | `"{language}" coding conventions best practices {currentYear}` |
| 未知框架 | `"{framework}" project commands conventions best practices {currentYear}` |
| 未知 ORM | `"{orm}" setup migration naming conventions {currentYear}` |
| 未知 CSS 方案 | `"{css}" styling conventions component patterns {currentYear}` |
| 未知 UI 组件库 | `"{ui}" component library conventions best practices {currentYear}` |
| 未知测试框架 | `"{testing}" test commands CI GitHub Actions {currentYear}` |
| 未知 Lint 工具 | `"{lint}" configuration rules conventions {currentYear}` |
| 未知包管理器 | `"{pm}" install lockfile CI commands {currentYear}` |
| 未知状态管理 | `"{state}" state management patterns conventions {currentYear}` |
| 未知部署方式 | `"{deploy}" deployment best practices CI pipeline {currentYear}` |
| 未知数据库 | `"{db}" database conventions naming schema design {currentYear}` |
| 未知 AI/LLM 栈 | `"{ai}" LLM framework orchestration best practices {currentYear}` |
| 未知 IaC 工具 | `"{iac}" infrastructure as code project conventions {currentYear}` |
| 未知可观测性方案 | `"{observability}" observability tracing metrics conventions {currentYear}` |
| 未知数据工程工具 | `"{data}" data pipeline orchestration best practices {currentYear}` |
| 未知移动端框架 | `"{mobile}" mobile project conventions CI {currentYear}` |
| 未知规范惯例 | `"{language}" coding conventions best practices {currentYear}`（或 `"{framework}" code style guide {currentYear}`） |
| 未知 AI 易错点 | `"{language}/{framework}" common mistakes anti-patterns {currentYear}` |

**提取规则**: 从搜索结果中提取 dev/build/test 命令写入 Commands，规范要点（✅/❌）写入 Conventions，CI 配置片段写入 CI job。

**兜底**: 所有探测和联网均失败时，使用 `references/agents-md-template.md` 生成最小化 AGENTS.md。

### 2.3 禁止做的事
- ❌ 不写本项目特定信息（IP、人名、公司名）— 用占位符
- ❌ 不使用任何固定预设 — 始终从 knowledge-base 实时拼接
- ❌ 不得为项目写入"无门禁的阻断级红线" — 无法机检的红线须标注 `[无门禁]` 并写明原因（见参考文献 `ai-work-protocol.md` 第七章准入门槛四问）
- ✅ AGENTS.md 遵循架构原则控制规模：**高内聚低耦合** / 模块职责单一 / 组合优于继承 / 避免全局状态 / 纯函数优先 / 复用已有代码避免重复造轮子

### 2.4 多子项目 AGENTS.md 装配

**判定**（依据 Step 1.4 输出的「子项目清单」条数）:
- 子项目清单 **≥2 个** → 走**嵌套模式**：根 `AGENTS.md` + 各包级 `AGENTS.md`
- 子项目清单 **仅 1 个**（单项目）→ 走**原单文件路径**，行为与 v1.8.0 一致

**装配顺序**:
1. 先装配**根文件**：全局约束（项目身份 + 子项目索引表 / Boundaries / Git 规范 / 门禁即规则 / 发布规范 / 上下文管理）
2. 再逐包**装配包级文件**：用该包各自的探测结果（Step 1.2 三层分类）填充包身份 / 技术栈 / 常用命令 / 强制规范 / 模块速查表

**规则与模板来源**：`references/monorepo-agents.md`（判定条件 / 根与子职责边界 / 根索引表模板 / 子项目骨架模板 / 增量合并策略）——**本处不复制其模板正文**。

**增量友好**：子项目已存在 `AGENTS.md` 时**只补缺失、不覆盖**；已有完善根文件时只补缺失的包级文件。
