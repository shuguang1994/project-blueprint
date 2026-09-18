# Project Blueprint 项目开发规范 (AGENTS.md)

> AI 编程助手的强制开发规范。v1.9.0 | 更新: 2026-09-14（建立 2026-08-01）
> AI 工具: Trae | 加载: always_applied

***

## 一、项目身份

- **项目**: Project Blueprint — 为新项目一键建立完整 AI 编程规范体系（AGENTS.md + 文档骨架 + CI/CD + 测试制度 + Git 规范）的开源 AI Agent 技能包。
- **形态**: 纯 Markdown 项目，无代码、无构建、无测试、无运行依赖。核心逻辑为 `SKILL.md`（113 行索引层 + `references/step-*.md` 7 个 Step 细节），配套 `references/` 知识库与 `scripts/` 门禁层。
- **技术栈**: Markdown (SKILL.md 格式) + 95 组件条目知识库（18 个二级章节 / 16 个技术栈维度） + MCP 工具知识库 + 门禁配方库 + 宪法层生长机制 + WebSearch 联网回退
- **版本**: v1.9.0（语义化版本，tag 发布）
- **仓库**: GitHub `origin` = https://github.com/shuguang1994/project-blueprint / Gitee `gitee` = https://gitee.com/shuguang1994/project-blueprint
- **作者**: 曙光 (shuguang1994) | License: MIT
- **安装**: `npx skills add shuguang1994/project-blueprint`（国际）/ `npx skills add https://gitee.com/shuguang1994/project-blueprint.git`（国内）/ `dsh plugin --profile web add 'github:shuguang1994/project-blueprint'`（DeepSeek Harness）

## 二、常用命令

```bash
# 本仓库无编译/测试命令，常用操作为 Git 双远程推送：
git add <files>                                # 暂存（按文件逐一添加，勿 git add -A）
git commit -m "<type>(<scope>): <description>" # 提交
git push origin main                           # 推送 GitHub
git push gitee main --tags                     # 推送 Gitee 镜像 + 版本标签
git fetch origin && git fetch gitee            # 同步双远程
git revert <commit>                            # 线上问题回滚

# 本仓库门禁层（scripts/）实跑：
npm run verify                                 # 统一入口（= node scripts/verify.mjs）
npm run verify:ci                              # 全量（= --stage=ci，CI 用同一入口）
node scripts/verify.mjs --stage=pre-push       # 按阶段过滤
node scripts/check-constitution.mjs            # 宪法自校验（AGENTS.md 红线 ↔ 门禁清单）

# 门禁装配点（见 4.6）：
#   CI      → .github/workflows/verify.yml（push / PR 自动跑 --stage=ci）✅ 已装配
#   pre-push → 未装配（单行启用：git config core.hooksPath .githooks，见 4.6）⚠️

# 技能安装/更新（验证对外文档描述一致性时参考）：
npx skills update project-blueprint

# DSH 插件包同步（修改根 SKILL.md / references/ 后，发版前运行）：
node dsh-plugin/scripts/sync-skill.mjs
```

## 三、Boundaries

**Allowed**: `SKILL.md`、`references/`、`README.md`、`README_CN.md`、`CHANGELOG.md`、`PROJECT_STATUS.md`、`AGENTS.md`、`docs/`（仅对外内容）、`internal-docs/`（本地内部文档，受 `.gitignore` 约束不发布）、`scripts/`、`.github/workflows/`（门禁装配点）、`.trae/specs/`（spec 驱动开发三件套）、`.gitignore`、`dsh-plugin/`（不含 `dsh-plugin/skills/`，由同步脚本生成）

**Ask First**:
- 版本号升级（vX.Y.Z）或破坏性变更（如 Step 流程重构、文件重命名）
- 修改 `SKILL.md` 中的流程步骤、触发条件、输出格式约定
- 新增/删除 `references/` 下的参考文件
- 双远程仓库的 git 操作（push/force/tag）

**Never Touch**: `.git/`、`LICENSE`（协议条款）、证书/密钥、任何 `.env` 文件、`node_modules/`

## 四、强制规范

### 4.1 文档规范

```
✅ README.md 与 README_CN.md 内容保持同步（中英对照，同一特性两处都要更新）
✅ 新增特性同时更新：README / README_CN / CHANGELOG / PROJECT_STATUS
✅ 初始化项目时生成 CHANGELOG.md（[Unreleased] 占位，首次发版后转版本号记录）
✅ 文件名中英双语标注，按 A/B/C/D/E 五级分类存放
✅ 代码块必须闭合（开闭围栏语言标记一致），防止后续章节被误渲染
✅ 对外数字口径唯一源：同一指标全仓一致，以知识库实际条目数为准（如组件条目 95 / 技术栈维度 16）
✅ 公开边界：`docs/` 只放面向社区的内容（发布说明）；自审 / 竞品对标 / 评估复核类放 `internal-docs/`（受 `.gitignore` 约束，不随公开仓发布），并在 `docs/README.md` 的「编号预留」表登记编号（否则 `docs-consistency` 报缺号 error）
✅ 新增知识库条目后同步更新 README 技术栈覆盖表
```

### 4.2 SKILL.md 编写规范

```
✅ 执行原则：探测优先 / 最小侵入 / 不确定就问 / 一步一验证
✅ 步骤编号固定：Step 1 自主发现引擎 → Step 7 持续自适应机制
✅ 规模上限：SKILL.md 正文 ≤ 200 行、各 references/step-*.md ≤ 500 行；超限按 Step 拆到 references/
✅ 引用 knowledge-base.md 时按 ### [组件名] 定位，不读全文
✅ 未知组件触发联网回退，且 {currentYear} 用系统真实年份，禁止硬编码
❌ 不在 SKILL.md 中硬编码固定文件列表 / 固定映射表（保持"零固定表"设计）
❌ 不写本项目特定信息（IP、人名、公司名）— 用占位符
```

### 4.3 knowledge-base.md 条目格式

条目基础三段，高频组件附加第 4 段 `Gate`（新增条目一律四段齐全）：

```
### [组件名]
**Commands**: 精确可执行命令
**Conventions**: ❌/✅ 规范要点
**CI job**: GitHub Actions yaml 片段
**Gate**: 可机检红线 → 检查方式（命令 / 脚本要点 / 适用条件）
```

### 4.4 版本与发布规范

```
✅ 语义化版本：major.minor.patch，破坏性变更升 major（如 v1.4.0 自主发现引擎重构）
✅ CHANGELOG.md 按版本号倒序记录，标注 Breaking Change / Added / Changed / Fixed
✅ 每次发版：CHANGELOG 更新 → tag 打版本 → push origin main → push gitee main --tags
✅ PROJECT_STATUS.md 同步更新版本演进表
```

### 4.5 架构原则

```
✅ 高内聚低耦合 — 各 Step 职责单一，Step 间通过探测结果流转
✅ 复用已有代码 — 优先复用 references/ 已有条目，避免重复定义
✅ 增量友好 — 已有项目只补缺失，不覆盖已有配置
✅ 三层递进 — 知识库精确匹配 → 命名模式启发 → 联网搜索
✅ 组合优于继承 / 避免全局状态 / 纯函数优先
```

### 4.6 门禁即规则（本仓库同样适用）

```
✅ 本仓库虽为纯 Markdown 项目，仍适用元规则：新增/修改阻断级规范时必须同步可执行检查
   （本仓库门禁层为 scripts/gates.json + verify.mjs + check-constitution.mjs；
     skill 侧校验参考实现保留在 references/docs-check.mjs 与 references/drift-check.mjs，不复制到 scripts/）
✅ 门禁装配点（本仓库实况——声明必须与装配一致，不得只写不接）：
   CI = .github/workflows/verify.yml（push / PR 自动跑 --stage=ci）已装配；
   pre-push = 未装配（无生效钩子配置），本地按需：git config core.hooksPath .githooks
✅ gates.json 的 stage 是分类字段（供 --stage= 过滤），不等同于「已接线」；未接线的阶段须显式标注
✅ 无法机检的规则须标注 [无门禁] 并写明原因
✅ 三条元规则（无门禁不立规 / 缺陷必闭环 / 契约唯一源）完整原文见 references/ai-work-protocol.md 第八章
✅ 文档契约：docs/ 下文档须有 > 版本: … | 更新: … | 状态: … 状态头
✅ 规模阈值：AGENTS.md ≤ 300 行 / 单篇文档 ≤ 600 行，超限按职责域拆分到 docs/
```

## 五、模块速查表

| 文件 | 职责 |
|------|------|
| `SKILL.md` | 核心逻辑索引层（113 行）：触发条件 / 执行原则 / Step 索引与按需加载表 / 输出验收清单 / 参考文件索引 |
| `references/step-1-discovery.md` ~ `step-7-adaptive.md` | 7 个 Step 实现细节（按需加载；Step 5.5 门禁装配并入 step-5；均 ≤ 500 行） |
| `README.md` / `README_CN.md` | 中英文项目文档：安装、能力、工作流程、贡献指南 |
| `CHANGELOG.md` | 版本记录（v1.0 ~ v1.9.0 + [Unreleased]） |
| `PROJECT_STATUS.md` | 项目状态、版本演进、独立抽离指南、已知局限、下一步计划 |
| `docs/` | **公开**文档：`README.md` 索引（A~E 分类 + 公开边界 + 编号预留登记）+ D 级发布说明 |
| `internal-docs/` | **不发布**的内部文档（自审 / 竞品对标 / 评估复核类），受 `.gitignore` 约束 |
| `package.json` | DSH 插件 GitHub 安装入口（根目录，声明 dsh.bundle 指向 dsh-plugin/cordis.patch.yml，v1.6.1 新增） |
| `scripts/gates.json` / `verify.mjs` / `check-constitution.mjs` | 本仓库门禁层：门禁清单唯一事实源（2 条种子门禁）+ 统一入口 + 宪法自校验 |
| `.github/workflows/verify.yml` | 门禁装配点：push / PR 自动跑 `scripts/verify.mjs --stage=ci`（与本地同入口同语义） |
| `dsh-plugin/` | DSH (DeepSeek Harness) 插件包：package.json + cordis.patch.yml + lib/ 零构建插件 + skills/（同步生成）+ sync-skill.mjs 同步脚本 |
| `references/knowledge-base.md` | 组件知识库（18 个二级章节 = 16 个技术栈维度 + 通用段落 + 业务类型文档模式；95 个组件条目） |
| `references/mcp-tools.md` | MCP 工具知识库（§一 匹配表 14 行 + §二 18 个工具条目 + 组合矩阵，Step 3.4 参考） |
| `references/monorepo-agents.md` | 多子项目 AGENTS.md 装配规则（根 + 包级，closest-file-wins），Step 2.4 参考（v1.9.0 新增） |
| `references/vendor-breadcrumbs.md` | AI 工具入口与私有增强层生成规则（Cursor glob / Claude Code hooks·subagents / Copilot 分层），Step 2.1 参考（v1.9.0 新增） |
| `references/spec-driven.md` | 规范驱动开发六阶段（specify→plan→tasks→checklist→implement→verify，checklist 可转门禁），Step 3.3 参考（v1.9.0 新增） |
| `references/eval-baseline.md` | 量化评估基准（规模 / 闭环指标 + golden case + 已知不覆盖项），Step 7 参考（v1.9.0 新增） |
| `references/code-conventions.md` | 基础代码规范种子知识库（6 大类：命名/目录/错误处理/日志/安全/性能 × 语言适配，含搜索模板，Step 2 参考） |
| `references/ai-common-mistakes.md` | AI 高频错误知识库（7 大类 27 条，六段式，Step 2 优先注入 + B-04 反哺迭代） |
| `references/agents-md-template.md` | AGENTS.md 兜底模板（全部探测+联网失败时使用） |
| `references/ci-template.yml` | CI 模板（TS/Go/Python/Vue 四种完整 workflow） |
| `references/docs-skeleton.md` | docs/ 目录骨架指南（A/B/C/D/E 五级分类） |
| `references/gitignore-template.md` | Git 忽略规则模板（按语言选择） |
| `references/project-sync-guide.md` | Agent 文档同步操作指南（Step 7 参考） |
| `references/ai-work-protocol.md` | AI 编程工作协议（7 步任务生命周期 / 证据标准 / DoD / 违规处理 / 缺陷复盘 / 门禁生长 6 步） |
| `references/gates-templates.md` | 门禁模板集（gates.json 唯一事实源 + verify.* + check-constitution.* + 宿主/装配点选择） |
| `references/docs-check.mjs` | 文档一致性校验参考实现（校验范围自适应：遍历 docs/ 实际存在的子目录；种子门禁之一 docs-consistency） |
| `references/drift-check.mjs` | 规范漂移校验参考实现（依赖↔规范 / 模块速查表↔目录 / 门禁有效性；种子门禁 spec-drift，v1.9.0 新增） |
| `LICENSE` | MIT 协议 |
| `.gitignore` | 仓库忽略规则 |

## 六、关键架构决策

| 决策 | 说明 |
|------|------|
| 零固定表设计 | 文件发现/依赖分类/业务推断均自主推断，不预设文件清单（v1.4.0） |
| 三层递进依赖分类 | 知识库精确 → 命名模式启发（29 模式）→ 联网搜索（v1.4.0） |
| 增量质量检测 | 已有 AGENTS.md 按质量分级：完善→跳过 / 部分→补充 / 无→全量（v1.1+） |
| 多 IDE 适配 | 自动生成 CLAUDE.md / .cursor/rules / copilot-instructions 等 breadcrumbs（v1.1.0） |
| 测试制度替代示例文件 | 按项目阶段的分层测试策略文档，不强制创建示例测试（v1.3.0） |
| MCP 工具推荐 | 基于探测维度三层递进匹配 mcp-tools.md，生成 docs/B/B-05-MCP工具清单.md（仅 MD，不写 .mcp.json，v1.5.0） |
| DSH 插件包装 | dsh-plugin/ 自包含插件包：零构建 ESM 插件复用官方 dsh-skill-filesystem 提供方，skills/ 由 sync-skill.mjs 从根目录同步（单一事实来源）；根目录 package.json 作为 GitHub 安装入口（v1.6.1） |
| 文档规模受架构原则约束 | 以"高内聚低耦合"控制规模，超限拆分到 docs/（v1.2.0 移除硬性行数限制） |
| SKILL 按 Step 拆分 + 按需加载 | SKILL.md 为 ≤ 200 行索引层，Step 细节迁 references/step-*.md 按需读取（渐进式披露，内容零丢失，v1.9.0） |
| Monorepo 嵌套 AGENTS.md | 多子项目（≥2 构建/清单文件）→ 根（全局约束 + 子项目索引）+ 各包级 AGENTS.md，对齐 closest-file-wins；单项目零变化（v1.9.0） |
| 规范漂移门（第二条种子门禁） | references/drift-check.mjs 校验依赖↔技术栈行 / 模块速查表↔目录 / 门禁有效性，登记为 spec-drift；种子门禁 1 → 2 条（v1.9.0） |
| 本仓库自吃狗粮（scripts/ 门禁层） | 本仓库脚本落地 scripts/（gates.json + verify.mjs + check-constitution.mjs）；skill 侧参考实现仍留 references/（避免两份事实源）（v1.9.0） |

## 七、Git 规范

- **平台**: GitHub (origin) + Gitee (gitee) 双远程
- **分支**: `main`（唯一常驻分支，tag 发布版本）
- **提交格式**: `<type>(<scope>): <description>`
  - type: `feat`/`fix`/`refactor`/`docs`/`test`/`chore`/`perf`
  - 示例: `docs: 快速安装支持 Gitee 国内镜像 + 后续更新命令`
- **禁止提交**: `.env` / `node_modules/` / `dist/` / 证书/密钥
- **禁止**: `git push --force` / `git reset --hard`
- **发布流程**: 每次发版同时推双远程 + tag，保持 GitHub/Gitee 一致

## 八、代码审查检查清单

- [ ] README.md 与 README_CN.md 是否同步更新？
- [ ] 新特性是否记录到 CHANGELOG.md？
- [ ] 版本号是否按语义化版本正确更新？
- [ ] 代码块是否闭合（防止文档被误渲染）？
- [ ] knowledge-base.md 新增条目是否含基础三段（Commands / Conventions / CI job）且高频组件补 Gate 第 4 段？
- [ ] mcp-tools.md 新增条目是否含 适用场景 / 安装方式 / 推荐组合 三段？
- [ ] code-conventions.md 新增条目是否含 Conventions（✅/❌）+ 搜索模板（含 {currentYear}）？
- [ ] ai-common-mistakes.md 新增条目是否含六段（易错点/后果/❌示范/✅做法/关联知识库/搜索模板）？
- [ ] SKILL.md 是否保持"零固定表"设计，未硬编码文件列表？规模是否 ≤ 200 行（step 文件 ≤ 500 行）？
- [ ] 文档中的数字（框架数/组件数）是否与知识库实际一致（唯一口径源）？
- [ ] 是否使用了占位符而非写死项目特定信息（IP/人名）？
- [ ] 中文文档与英文文档是否同时更新？
- [ ] 修改根 `SKILL.md` / `references/` 后，`dsh-plugin/skills/` 是否已用 `node dsh-plugin/scripts/sync-skill.mjs` 同步？

## 上下文管理

- **Agent 主动维护本文件** — 每次完成以下操作时同步更新：
  | 操作 | 更新内容 |
  |------|---------|
  | 新增 reference 文件 | 更新模块速查表 |
  | 变更 Step 流程/规范 | 更新强制规范或关键架构决策表 |
  | 版本发布 | 更新版本号、CHANGELOG、PROJECT_STATUS |
  | 扩展知识库/组件 | 更新技术栈行、README 覆盖表 |
  | 修复典型 Bug | 写入 docs/B/B-04-BUG知识库.md |
- **架构原则控制文档规模** — 高内聚低耦合 / 模块职责单一 / 组合优于继承 / 避免全局状态 / 纯函数优先 / 复用已有代码避免重复造轮子。AGENTS.md 超 300 行时按职责域拆分到 docs/ 引用。
- spec 三件套（spec.md / tasks.md / checklist.md）位于 `.trae/specs/<change-id>/`，完成后归档到 `.trae/specs/archive/`
- 项目记忆: project_memory.md 季度清理
- 会话记忆: 自动过期保留最近 7 天
