---
name: project-blueprint
description: 为新项目快速建立完整 AI 编程规范体系（AGENTS.md、文档目录、CI/CD、Git规范、测试制度）。自主发现引擎：扫描项目→分类文件→推断技术栈，覆盖 7 语言 15 框架 70+ 组件，未知栈三层递进联网回退。Establish AI coding conventions for new projects — autonomous discovery engine with heuristic dep classification, 7 languages 15 frameworks 70+ components, web search fallback for unknowns.
author: 曙光 (shuguang1994)
license: MIT
---

# Project Blueprint — AI 编程规范体系搭建 Skill

> 跨项目可复用的 7 步规范体系搭建流程。新项目一句话触发，15+ 文件自动生成。

## 触发条件

当用户说以下关键词时自动加载（中英双语）：
- 初始化新项目 / 建立开发规范 / 搭建项目体系 / 项目脚手架
- init project / setup conventions / bootstrap / new project / AGENTS.md template

## 执行原则

- **探测优先**：先读取项目文件（package.json / go.mod / requirements.txt），不凭空猜测
- **最小侵入**：只补充缺失的文件，不覆盖已有配置
- **不确定就问**：技术栈/远程仓库类型不确定时，主动向用户确认
- **一步一验证**：每步完成后报告生成了哪些文件

---

## Step 索引与按需加载

| Step | 做什么 | 细节文件 | 何时读 |
|------|--------|---------|--------|
| Step 1 | 自主发现引擎：扫描项目文件 → 分类 → 三层递进推断技术栈 | `references/step-1-discovery.md` | 接入新项目、需要探测文件与技术栈时 |
| Step 2 | 规则引擎拼接：按组件名从知识库提取 Commands/Conventions/CI，拼装 AGENTS.md | `references/step-2-assembly.md` | 生成/更新 AGENTS.md 前 |
| Step 3 | 建立自适应文档体系：推断业务类型 → 生成 docs/ 骨架 + B-01/B-04/B-05 + 门禁层 | `references/step-3-docs.md` | 生成 docs/ 与门禁层时 |
| Step 4 | 配置 Git 规范：.gitignore / CHANGELOG.md / 分支策略 | `references/step-4-git.md` | 配置 Git 与版本记录时 |
| Step 5 | 配置 CI/CD：合并 CI job 片段 → 生成 workflow + 门禁统一入口 job | `references/step-5-ci-and-gates.md` | 项目有 CI/CD 需求时 |
| Step 5.5 | 门禁装配：宿主选择 → 装配点 → 实跑自测（与 Step 5 同文件） | `references/step-5-ci-and-gates.md` | 生成门禁后装配到提交与 CI 时 |
| Step 6 | 建立测试制度：安装测试框架 + B-03 测试指南 + git hooks | `references/step-6-testing.md` | 建立测试制度与 hooks 时 |
| Step 7 | 持续自适应：上下文管理注入 + 门禁生长 + 文档健康检查 | `references/step-7-adaptive.md` | 项目推进中维护 AGENTS.md / docs 时 |

> 索引层只给流程骨架，实现细节一律按需读取对应 step 文件，避免一次性载入全部细节（按章节标题定位，不读全文）。

---

## 输出验收清单

所有步骤完成后，向用户报告：

```
✅ 项目规范体系搭建完成，生成文件：
- AGENTS.md (xxx 行)
- docs/ (A/B/C/D/E 5 个分类目录 + archive + dev)，含 B-01-开发规范（实写 8 章，非占位符）、B-03-测试指南（测试制度）、B-04-BUG知识库（缺陷模式库）
- docs/B/B-05-MCP工具清单.md (MCP 工具推荐，含安装命令与组合建议，按需生成)
- docs/B/B-06-门禁与工作协议.md (AI 编程工作协议 + 门禁生长细则，中大型项目)
- scripts/gates.json (门禁清单，唯一事实源)
- scripts/verify.* (门禁统一入口)
- scripts/check-constitution.* (宪法自校验)
- scripts/docs-check.* / scripts/drift-check.* (两条种子门禁：docs-consistency + spec-drift)
- .trae/specs/ (spec-driven 开发基础设施)
- .github/workflows/ci.yml (或 .gitee-ci.yml，含门禁统一入口 job)
- .gitignore (如果之前没有)
- CHANGELOG.md (版本记录，[Unreleased] 初始化占位，发版按 AGENTS.md 发布规范更新)
- CLAUDE.md / .cursor/rules/project.mdc (vendor breadcrumbs)
- .husky/pre-commit / pre-push (如果安装同意)

下一步建议：
1. 填写 docs/A/A-01-PRD.md 项目需求
2. 根据实际项目完善 AGENTS.md 中的项目身份信息
3. 阅读 docs/B/B-03-测试指南.md，核心功能稳定后按制度编写首批测试
4. git push origin <主分支> 推送初始框架（按分支策略：main 或 develop）
```

**门禁验收**（与上表并列的报告项）：

- [ ] `scripts/verify.*` 本地实跑通过（或全部为 warn 级）
- [ ] `scripts/check-constitution.*` 输出 0 error
- [ ] `scripts/gates.json` 条目 ≥ 2
- [ ] 新登记的 blocking 门禁已完成负向验证（留证）

> 任一项不满足时，在报告中显式标注"未闭环 + 原因 + 风险"，不得静默跳过（见 `references/ai-work-protocol.md` 第四章证据标准）。

---

## 参考文件索引

> 本索引是 **skill 包自身文件索引**（非目标项目文件清单，不违反「零固定表」设计），指向 `references/` 目录下的知识库与实现细节文件。**本索引随 `references/` 扩充同步维护**。

| 文件 | 职责 |
|------|------|
| `references/knowledge-base.md` | 70+ 组件知识库（16 个维度章节：语言/框架/ORM/CSS/UI/测试/Lint/包管理/部署/状态管理/数据库/AI/IaC/可观测性/数据/移动 + 通用段落），Step 2 拼接来源 |
| `references/code-conventions.md` | 基础代码规范种子知识库（命名/目录/错误处理/日志/安全/性能 6 大类 + 搜索模板），Step 2 参考 |
| `references/ai-common-mistakes.md` | AI 高频错误知识库（7 大类 27 条，六段式），Step 2 优先注入 + B-04 反哺迭代 |
| `references/mcp-tools.md` | MCP 工具知识库（维度匹配表 14 行 + 18 个工具条目 + 推荐组合矩阵，含适用场景/安装方式/推荐组合），Step 3.4 参考 |
| `references/agents-md-template.md` | AGENTS.md 兜底模板（全部探测+联网失败时使用） |
| `references/monorepo-agents.md` | 多子项目 AGENTS.md 装配规则（判定条件/根与子职责边界/骨架模板/增量合并），Step 2.4 参考 |
| `references/vendor-breadcrumbs.md` | AI 工具入口文件与私有增强层生成规则（CLAUDE.md / Cursor / Copilot / Gemini 等），Step 2.1 参考 |
| `references/ci-template.yml` | CI 模板（TS/Go/Python/Vue 四种完整 workflow），Step 5 参考 |
| `references/docs-skeleton.md` | docs/ 目录骨架指南（A/B/C/D/E 五级分类），Step 3 详细参考 |
| `references/gitignore-template.md` | Git 忽略规则模板（按语言选择），Step 4 参考 |
| `references/project-sync-guide.md` | Agent 文档同步操作指南（Step 7 参考） |
| `references/ai-work-protocol.md` | AI 编程工作协议（任务生命周期/证据标准/DoD/缺陷复盘/门禁生长 6 步），Step 3.5 生成 B-06 |
| `references/spec-driven.md` | 规范驱动开发六阶段（准入门槛/三件套模板/checklist 转门禁），Step 3.3 参考 |
| `references/gates-templates.md` | 门禁模板集（gates.json 唯一事实源 + verify.* + check-constitution.* + 宿主/装配点选择 + 漂移门与种子门禁清单），Step 3.5 / 5.5 参考 |
| `references/docs-check.mjs` | 文档一致性校验脚本参考实现（**校验范围自适应**：遍历 docs/ 实际存在的子目录；校验编号连续性/状态头/索引覆盖/归档冲突 + 单文件体积） |
| `references/drift-check.mjs` | 规范漂移校验脚本参考实现（依赖↔规范 / 模块速查表↔目录 / 门禁有效性），spec-drift 门禁参考 |
| `references/eval-baseline.md` | 体系质量评估基准（Skill 生成物 + Skill 自身：规模指标 / 闭环指标 / 发布前核对），Step 7 参考 |
| `references/step-1-discovery.md` | Step 1 自主发现引擎完整实现细节 |
| `references/step-2-assembly.md` | Step 2 规则引擎拼接完整实现细节 |
| `references/step-3-docs.md` | Step 3 建立自适应文档体系完整实现细节 |
| `references/step-4-git.md` | Step 4 配置 Git 规范完整实现细节 |
| `references/step-5-ci-and-gates.md` | Step 5 配置 CI/CD 与 Step 5.5 门禁装配完整实现细节 |
| `references/step-6-testing.md` | Step 6 建立测试制度与基础设施完整实现细节 |
| `references/step-7-adaptive.md` | Step 7 持续自适应机制完整实现细节 |
