# AI 工具入口文件与私有增强层生成规则

> 各类 AI 编码工具的「入口文件 + 私有增强层」生成规则，由 `SKILL.md` Step 2 在生成 AGENTS.md 之后调用（见 `references/step-2-assembly.md` 2.1 主流程）。
> 核心原则：**AGENTS.md 为单一事实源**；各工具入口一律「指向」或「分层引用」AGENTS.md，**不复制规范正文**。
> 关联：`references/step-2-assembly.md`（2.1 生成 breadcrumbs）、`references/monorepo-agents.md`（根/包职责边界第三节「工具增强层入口」行）。

## 一、基线 breadcrumbs（v1.8.0 已有能力，触发条件不变）

生成 AGENTS.md 后，按探测到的远程仓库与 IDE 生态自适应生成以下基线指向文件：

| 入口文件 | 触发条件 | 写入内容 |
|----------|----------|----------|
| `CLAUDE.md` | 生成 AGENTS.md 后一律生成 | `@AGENTS.md` |
| `.cursor/rules/project.mdc` | 生成 AGENTS.md 后一律生成 | frontmatter `alwaysApply: true` + `@AGENTS.md` |
| `.github/copilot-instructions.md` | **远程仓库为 GitHub** 时生成 | 指向 AGENTS.md |
| `.gemini/GEMINI.md` | **存在 `.gemini/` 目录**时生成 | `@AGENTS.md` |
| `.windsurfrules` | **已存在 `.windsurfrules`** 时 | 在文件末尾追加一句 `See AGENTS.md for project conventions` |

> 基线只做「指向」，不携带规范正文；触发条件为兼容性契约，**不得擅自更改**。

## 二、工具能力矩阵

| 工具 | 入口文件 | 支持的私有增强能力 | 增强层生成策略 |
|------|----------|--------------------|----------------|
| Claude Code | `CLAUDE.md` | hooks（`.claude/settings.json`）、subagents（`.claude/agents/*.md`）、skills（`.claude/skills/`） | 生成指向根 AGENTS.md 的 `CLAUDE.md`；**探测到 `.claude/` 生态**时追加 hooks 骨架与子代理骨架 |
| Cursor | `.cursor/rules/project.mdc`（总入口）+ `.cursor/rules/*.mdc` | `.mdc` 的 `alwaysApply` 与 `globs:` 自动激活（可按目录分层激活） | 总入口 `alwaysApply: true` 指向 AGENTS.md；按探测到的目录生成 2~3 个 glob 分层规则，每个只写该目录特有约束 |
| GitHub Copilot | `.github/copilot-instructions.md` + `.github/instructions/*.instructions.md` | `.instructions.md` 的 `applyTo` frontmatter 按路径自动激活 | 远程为 GitHub 时生成根指向文件；**探测到多个规则范围**时按主题生成 instructions 分层文件 |
| Gemini CLI | `.gemini/GEMINI.md` | 无 glob 分层，仅能整份入口文件生效 | 仅生成指向根 AGENTS.md 的入口，**不生成增强层** |
| Windsurf | `.windsurfrules` | 无 glob 分层，仅能整份入口文件生效 | 已存在时仅在末尾追加指向句，**不生成增强层** |
| 通用（无私有能力） | 按上表命中的入口（`CLAUDE.md` 等） | 无 | 只生成基线的**纯指向文件**，不制造空增强层 |

## 三、各工具私有增强层模板

> 以下均为**最小可套用骨架**，全部用占位符；实际目录（`<src>` / `<目录A>` 等）以 Step 1 探测结果为准，**不固定清单**。

### 3.1 Cursor：按目录 glob 分层规则

````markdown
# .cursor/rules/project.mdc —— 总入口（整仓生效）
```mdc
---
description: 项目全局规范入口
alwaysApply: true
---
@AGENTS.md
```

# .cursor/rules/<目录A>-rules.mdc —— 仅该目录生效
```mdc
---
description: <目录A> 专属约束
globs: <src>/api/**
---
@AGENTS.md

- <该目录特有的非显而易见约束 1>
- <该目录特有的非显而易见约束 2>
- <该目录特有的非显而易见约束 3>
```

# .cursor/rules/<目录B>-rules.mdc —— 仅该目录生效
```mdc
---
description: <目录B> 专属约束
globs: <src>/components/**
---
@AGENTS.md

- <该目录特有的非显而易见约束 1>
- <该目录特有的非显而易见约束 2>
- <该目录特有的非显而易见约束 3>
```
````

> 分层规则文件**只写「该目录特有的 3~5 条非显而易见约束」+ 一行指向根 AGENTS.md**；通用规范留在 AGENTS.md，不在此重复。

### 3.2 Claude Code：hooks + subagents

入口文件（纯指向）:

```markdown
@AGENTS.md
```

`.claude/settings.json`（调用项目门禁入口的 hooks 骨架）:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "<项目门禁统一入口，如 node scripts/verify.* --stage=pre-commit>"
          }
        ]
      }
    ]
  }
}
```

`.claude/agents/code-reviewer.md`（子代理最小骨架）:

```markdown
---
name: code-reviewer
description: <一句话职责：对改动做代码审查>
---
# 职责
- <审查维度 1>
- <审查维度 2>

# 边界
- 不修改代码，只输出审查结论
- 规范以仓库根 `AGENTS.md` 为准，本文件不复制规范正文

# 证据要求
- 每条问题须给出 文件:行 + 现象 + 依据（指向 AGENTS.md 条款或门禁 id）
```

`.claude/agents/bug-triager.md`（子代理最小骨架）:

```markdown
---
name: bug-triager
description: <一句话职责：对缺陷分级并给出复现/闭环建议>
---
# 职责
- <分级维度：影响面 / 可机检性>
- <建议：可机检 → 门禁；不可机检 → docs/B/B-04 模式>

# 边界
- 不直接改代码
- 规范以仓库根 `AGENTS.md` 为准，本文件不复制规范正文

# 证据要求
- 结论须附 复现步骤 / 日志 / 相关门禁 id
```

> 子代理**只写职责与边界、证据要求，不复制规范正文**；规范统一由根 AGENTS.md 提供。

### 3.3 GitHub Copilot：instructions 分层

`.github/copilot-instructions.md`（纯指向）:

```markdown
See AGENTS.md for project conventions.
```

`.github/instructions/<topic>.instructions.md`（按路径自动激活）:

```markdown
---
applyTo: "<src>/api/**,<src>/services/**"
---
- <该范围特有的非显而易见约束 1>
- <该范围特有的非显而易见约束 2>
- 全局规范见仓库根 `AGENTS.md`
```

> 仅在**远程为 GitHub**时生成；`applyTo` 范围以探测结果为准，无私有分层需求时不生成主题文件。

### 3.4 Gemini CLI / Windsurf：仅基线指向文件

`.gemini/GEMINI.md`（存在 `.gemini/` 目录时）:

```markdown
@AGENTS.md
```

`.windsurfrules`（已存在时，末尾追加）:

```text
See AGENTS.md for project conventions
```

> 两者**无私有增强能力（无 glob 分层）**，一律只做整份入口指向，**避免制造无效文件**。

## 四、生成顺序与增量策略

1. **先探测已有文件**（`CLAUDE.md` / `.cursor/` / `.github/` / `.gemini/` / `.claude/` / `.windsurfrules` 等）
2. **只生成缺失的**入口 / 增强层，不重复创建
3. 已存在时**只在文件末尾追加**「See AGENTS.md」类指向句，**绝不覆盖**已有内容
4. 工具探测不到时，只生成基线命中的文件，**不生成增强层**

> 与 Step 1.0 增量原则一致：已有项目接入只做补充，不推翻重来。

## 五、防漂移条款

```
❌ 增强层复制规范正文（会与 AGENTS.md 形成第二事实源，改一处忘一处）
✅ 增强层只做指向 / 分层引用 + 该范围特有约束
✅ 增强层与 AGENTS.md 冲突时，一律以 AGENTS.md 为准
✅ 增强层文件头部须写明「规范以仓库根 AGENTS.md 为准」的优先级
```

## 六、与多子项目的关系

工具入口文件与私有增强层**统一在仓库根生成，不按子项目分散**（否则每个子项目一套入口 → 多事实源、就近原则下行为随机）。根/包职责划分见 `references/monorepo-agents.md` 第三节职责边界表「工具增强层入口」行。
