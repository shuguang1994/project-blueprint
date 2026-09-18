# Project Blueprint — 项目开发状态与独立抽离指南

> 生成日期: 2026-08-14 | 更新: 2026-09-18 | 版本: v1.9.0（+ [Unreleased] 口径收敛与复核） | 作者: 曙光 (shuguang1994)

---

## 一、项目简介

**Project Blueprint** 是一个开源的 AI Agent 技能包，用于为新项目一键建立完整的 AI 编程规范体系。它不是静态模板——是**自主发现引擎**：扫描项目文件，智能推断技术栈，从 95 个组件条目的知识库动态拼装定制化的 AGENTS.md、文档骨架、CI/CD 流水线和测试制度。

## 二、当前状态

| 维度 | 状态 |
|------|:---:|
| 版本 | v1.9.0 |
| 开发完成度 | ✅ 核心功能完整，7 Step 流程闭环 |
| 内部测试 | ✅ 已在真实全栈项目实战验证 |
| 文档 | ✅ 中文 README 完善，英文 README 同步 |
| 开源协议 | MIT |
| GitHub | https://github.com/shuguang1994/project-blueprint |
| Gitee 镜像 | https://gitee.com/shuguang1994/project-blueprint |

### 版本演进

| 版本 | 核心变化 |
|------|---------|
| v1.0 | 初始 6 步流程 |
| v1.1 | 6 技术栈预设 + vendor breadcrumbs |
| v1.2 | 自适应探测 + 61 组件知识库 + 联网回退 |
| v1.3 | 模块速查表联网 + 10 维回退 + 测试制度 + UI 维度 |
| **v1.4** | **自主发现引擎（扫描→分类→推断）+ 三层依赖分类 + 两层业务类型推断** |
| **v1.4.1** | **通用规范新增「第三方库先查官方文档」规则 + 一致性修复（7 步流程/分支自适应/数字核对）** |
| **v1.5.0** | **MCP 工具推荐（Step 3.4 + references/mcp-tools.md 知识库 + docs/B/B-05 生成）** |
| **v1.6.0** | **DSH (DeepSeek Harness) 插件支持（dsh-plugin/ 自包含插件包，零构建复用官方 skill-filesystem 提供方，Agent Plugins v1.0.0 便携清单 + 同步脚本，Cordis 运行时实测通过）+ GitHub 14 个 Topics 标签 + README 徽章** |
| **v1.6.1** | **DSH 插件 GitHub 安装路径修复（仓库根目录新增 package.json，声明 dsh.bundle 指向 dsh-plugin/cordis.patch.yml，社区 `dsh plugin add github:...` 命令可用）** |
| **v1.7.0** | **代码规范闭环增强（2026-08-14）：初始化实写基础代码规范（B-01 8 章）+ 新增 code-conventions.md / ai-common-mistakes.md 两个知识库 + AI 高频错误防犯专项 + BUG→规范反哺闭环 + 项目进度与文档健康检查提醒** |
| **v1.7.0 发布记录** | **（2026-08-14）commit 432756d，双远程均已推送 ✅（GitHub origin + Gitee gitee：main 同步至 432756d，tag v1.7.0 双远程同步）** |
| **v1.7.1** | **初始化流程生成 CHANGELOG.md（2026-08-26）：SKILL.md Step 4 新增生成 CHANGELOG.md 步骤 + 输出验收清单补充；修复「发布规范要求发版更新 CHANGELOG 但 skill 初始化不生成该文件」缺口** |
| **v1.7.1 发布记录** | **（2026-08-26）commit c83a1ae，双远程均已推送 ✅（GitHub origin + Gitee gitee：main 同步至 c83a1ae，tag v1.7.1 双远程同步；GitHub 首次推送因本机代理未运行失败，代理恢复后重试成功）** |
| **v1.8.0** | **宪法层与门禁生长机制（2026-09-13）：把门禁从"初始化一次性产物"升级为"宪法驱动的生长物"——AGENTS.md 写入 3 条元规则 + 6 步生长流程 + `scripts/gates.json` 唯一事实源 + `check-constitution` 宪法自校验；新增跨语言门禁配方表（10 条）+ 组件 `Gate` 第 4 段（12 个高频组件）+ 门禁装配 Step 5.5 + 文档契约与 `docs-check` 校验脚本 + AI 编程工作协议（7 步/证据标准/DoD）；新增 `references/ai-work-protocol.md`、`references/gates-templates.md`、`references/docs-check.mjs`；仓库首次启用 `.trae/specs/` spec 驱动开发** |
| **v1.8.0 发布记录** | **（2026-09-14）已补打 tag `v1.8.0`（`23525ae`）**——v1.8.0 开发完成后未单独提交，其内容随 v1.9.0 一并发布，故该 tag 与 `v1.9.0` 指向**同一 commit `d90ded9`**（首个包含 v1.8.0 内容的提交）；仓库内附 tag 说明消息 |
| **v1.9.0** | **跨栈通用性与规范不漂移（2026-09-14）：三大主线——① SKILL.md 按 Step 拆分瘦身（1012 → 113 行索引层，7 个 `references/step-*.md` 按需加载）；② 跨栈与 Monorepo 通用性（知识库 +5 域 15 条目、Monorepo 嵌套 AGENTS.md、spec 驱动六阶段、工具私有增强层）；③ 规范漂移门与自吃狗粮（新增 `references/drift-check.mjs` + 第二条种子门禁 `spec-drift` + 本仓库 `scripts/` 门禁层 `gates.json`/`verify.mjs`/`check-constitution.mjs`）** |
| **v1.9.0 发布记录** | **（2026-09-14）commit `d90ded9`（64 files changed, 8914 insertions(+), 1611 deletions(-)）+ 发版记录 `8a9a819` + tag `v1.9.0`（`d655187`）；双远程均已推送 ✅（GitHub origin + Gitee gitee：`main` 同步至 `8a9a819`，tag `v1.9.0` / `v1.8.0` 双远程同步）。注：本机 GitHub 直连不稳定，偶发 21s 超时，改用 `git -c http.https://github.com.proxy= push …` 绕过失效的本机代理后成功** |
| **[Unreleased] 口径收敛与复核** | **（2026-09-18）① 外部评估复核：新增 [D-08](docs/D/D-08-外部评估复核报告.md)——对一份外部 AI 项目价值评估逐项复核（实跑 4 门禁 / 核对 20+ 项数字 / 独立复核 4 篇 arXiv 与 3 个站点），判定评估侧 6 项失实、仓库侧 5 项待闭环；② 对外数字口径收敛：组件 `70+` → **95 个组件条目**、业务类型 `13 种` → **12 种**（口径 = knowledge-base「业务类型文档模式」12 条），覆盖 README / README_CN / SKILL / AGENTS / PROJECT_STATUS / `package.json` / `plugin.json` 及 dsh 副本；③ 修复 `docs/README.md` 索引失效链接（速览 HTML 重命名为 `D-06-` 前缀）+ 补登记 D-07 与速览单页；④ CHANGELOG v1.8.0「未闭环」勾销 + 新增 `[Unreleased]` 段** |
| **[Unreleased] 发布记录** | **（2026-09-18）commit `6bee93a`（14 files changed, 997 insertions(+), 37 deletions(-)）——本轮同时补齐此前 GitHub 落后的 2 个 commit（`041b7f7` / `329dcca`），双远程 `main` 均已同步至 `6bee93a` ✅（GitHub 用 `git -c http.https://github.com.proxy= push` 直连成功）。遗留：GitHub 仓库 description 仍为 v1.2.0 口径，见「下一步计划」末条** |

### 本地 DSH 运行环境记录（2026-08-14）

- 本机已部署 `dsh`（v0.1.0-rc.5，npm 包 `@deepseek-ai/dsh`），用于 dsh-plugin 本地联调验证
- 安装方式（国内镜像 + 全局安装，绕过 npx 锁超时问题）：
  ```bash
  npm install -g @deepseek-ai/dsh --registry=https://registry.npmmirror.com
  dsh web   # Web UI 默认 http://127.0.0.1:3080
  ```
- 踩坑记录：`npx @deepseek-ai/dsh web` 因依赖过大触发 npm 11 `ECOMPROMISED (Lock compromised)` 锁超时中断；全局安装无此限制，后续安装用 `npm install -g` 而非 npx
- git 代理记录：本机直连 GitHub 超时，已配置 `git config --global http.https://github.com.proxy http://127.0.0.1:9674`（本机代理软件端口，仅对 GitHub 生效，不影响 Gitee）
- 插件加载示例：`dsh plugin --profile web add 'github:shuguang1994/project-blueprint'`
- **已验证（2026-08-14）**：本地从 `dsh-plugin/` 目录安装成功并激活
  ```bash
  dsh plugin --profile web add "file:<repo>/dsh-plugin"   # <repo> 为仓库根（本机绝对路径已脱敏）
  ```
  验证：`dsh --profile web --dump-config` 可见 `# == project-blueprint` bundle 层；重启 `dsh web` 后 UI 正常、日志无错误
- **已修复（v1.6.1，2026-08-14）**：`github:shuguang1994/project-blueprint` 此前安装的是**仓库根目录**（纯 Markdown，无 package.json），dsh 提示 `declares no dsh.bundle`，无法激活。已在仓库根目录新增 `package.json`（`dsh.bundle.patch: ./dsh-plugin/cordis.patch.yml`）。双远程均已推送 ✅（GitHub + Gitee：main 同步至 f9face0，tag v1.3.0/v1.6.0/v1.6.1）
- **已验证兼容（2026-08-22）**：dsh 更新至 `0.1.1-rc.2`（npm latest/next 均指向该版），本次升级含破坏性变更，实测本插件 **无需适配**
  - 类型层确认：`ctx.skills.registerProvider`（dsh-skill@0.1.1-rc.2）、`FileSystemSkillProvider(ctx, control, {providerName, includeDefaultRoots, customSkillDirs})`（dsh-skill-filesystem@0.1.1-rc.2）、`ctx.effect`（cordis@4.0.1）签名均未变
  - 安装机制确认：`dsh.bundle.patch` 判定与 `dsh.profile.bundles` 合成逻辑在 0.1.1-rc.2 原样保留（dsh 主包 plugin 模块源码核对）
  - 运行时验证：隔离环境以 0.1.1-rc.2 依赖 + 官方 LocalFileSystem 加载插件，registerProvider 注册成功、provider 正常发现 `project-blueprint` 技能 ✅
  - 官方破坏性变更均不触及本插件：rc.8 SQLite 会话存储格式不兼容（仅影响旧会话数据迁移）、Session Projection API 迁移（影响 dsh-billing 等会话统计类插件）
  - 详见 dsh-plugin/README.md「兼容性」

## 三、文件清单

```
project-blueprint/
├── AGENTS.md                         # 项目开发规范 (AI Agent 强制规范，v1.0，2026-08-01 建立；当前 211 行)
├── SKILL.md                          # 核心逻辑索引层 (113 行：触发条件/执行原则/Step 索引与按需加载表/输出验收清单/参考文件索引；Step 细节见 references/step-*.md)
├── README.md                         # 英文文档 (247 行)
├── README_CN.md                      # 中文文档 (247 行，与 README.md 逐条对应)
├── CHANGELOG.md                      # 版本记录 (v1.0 ~ v1.9.0 + [Unreleased])
├── LICENSE                           # MIT 协议
├── .gitignore
├── PROJECT_STATUS.md                 # 本文件
├── package.json                      # DSH 插件 GitHub 安装入口 (dsh.bundle 指向 dsh-plugin/cordis.patch.yml)
├── docs/                             # 项目文档（A/B/C/D/E 五级分类，当前 D 级）
│   ├── README.md                     # 文档索引（A~E 分类约定 + 维护规则 + D 级 8 条编号 / 11 篇登记；docs-check 索引覆盖校验依赖它）
│   └── D/                            # D 级：方案 / 报告 / 发布说明（11 篇 .md 均含状态头 + 1 个分享 HTML）
│       ├── D-01-代码规范闭环增强方案.md
│       ├── D-02-v1.7.0-功能发布说明.md
│       ├── D-02-v1.7.0-Release-Notes-EN.md
│       ├── D-03-真实项目文档体系优化引入评估报告.md
│       ├── D-04-v1.8.0-功能发布说明.md
│       ├── D-04-v1.8.0-Release-Notes-EN.md
│       ├── D-05-行业对标与体系完备性评估报告.md
│       ├── D-06-v1.9.0-功能发布说明.md
│       ├── D-06-v1.9.0-Release-Notes-EN.md
│       ├── D-06-v1.9.0-更新速览.html      # v1.8/v1.9 群分享版单页（单文件、离线可开；不进 docs-check 校验）
│       ├── D-07-DSH监察插件可行性评估与设计报告.md
│       └── D-08-外部评估复核报告.md        # 对一份外部 AI 项目价值评估的逐项复核（评估侧 6 项失实 + 仓库侧 5 项待闭环）
├── scripts/                          # 本仓库自吃狗粮：门禁层（3 个文件）
│   ├── gates.json                    # 门禁清单（唯一事实源，2 条：docs-consistency[blocking] + spec-drift[warn]）
│   ├── verify.mjs                    # 门禁统一入口（支持 --stage=）
│   └── check-constitution.mjs        # 宪法自校验（AGENTS.md 红线 ↔ 门禁清单，A~D 规则）
├── dsh-plugin/                       # DSH (DeepSeek Harness) 插件包（32 个文件，含 skills/ 下 25 个同步副本）
│   ├── package.json                  # npm 包元数据 + dsh.bundle.patch
│   ├── cordis.patch.yml              # profile 挂载配置
│   ├── plugin.json                   # Agent Plugins v1.0.0 便携清单（跨宿主）
│   ├── README.md                     # 插件包说明（安装 / 兼容性）
│   ├── lib/                          # 零构建 ESM 插件（复用 dsh-skill-filesystem）
│   │   ├── index.js
│   │   └── types/index.d.ts
│   ├── skills/project-blueprint/     # 打包的技能内容（由 sync-skill.mjs 从根目录同步，非手改）
│   │   ├── SKILL.md                  #   ← 根 SKILL.md 的同步副本（SHA256 一致）
│   │   └── references/               #   ← 根 references/ 的 24 个文件同步副本
│   └── scripts/sync-skill.mjs        # 同步脚本（发版前运行）
└── references/                       # 知识库与实现细节（24 个文件）
    ├── knowledge-base.md             # 组件知识库 (917 行；18 个二级章节 = 16 个技术栈维度 + 通用段落 + 业务类型文档模式；95 个组件条目)
    ├── mcp-tools.md                  # MCP 工具知识库 (§一 匹配表 14 行 + §二 18 个工具条目 + 组合矩阵)
    ├── agents-md-template.md         # AGENTS.md 兜底模板 (全部探测+联网失败时使用)
    ├── monorepo-agents.md            # 多子项目 AGENTS.md 装配规则 (根 + 包级，closest-file-wins，v1.9.0 新增)
    ├── vendor-breadcrumbs.md         # AI 工具入口与私有增强层生成规则 (Cursor glob / Claude Code hooks·subagents / Copilot 分层，v1.9.0 新增)
    ├── spec-driven.md                # 规范驱动开发六阶段 (specify→plan→tasks→checklist→implement→verify，v1.9.0 新增)
    ├── eval-baseline.md              # 量化评估基准 (规模/闭环指标 + golden case，v1.9.0 新增)
    ├── ci-template.yml               # CI 模板 (TS/Go/Python/Vue 四种完整 workflow)
    ├── docs-skeleton.md              # 文档骨架指南 (A/B/C/D/E 五级分类)
    ├── gitignore-template.md         # Git 忽略规则 (按语言选择)
    ├── code-conventions.md           # 基础代码规范种子知识库 (6 大类 × 语言适配)
    ├── ai-common-mistakes.md         # AI 高频错误知识库 (7 大类 27 条，六段式)
    ├── project-sync-guide.md         # Agent 文档同步操作指南 (Step 7 参考)
    ├── ai-work-protocol.md           # AI 编程工作协议 (7 步任务生命周期/证据标准/DoD/门禁生长 6 步)
    ├── gates-templates.md            # 门禁模板集 (gates.json 唯一事实源 + verify.* + check-constitution.* + 宿主/装配点)
    ├── docs-check.mjs                # 文档一致性校验参考实现 (校验范围自适应：遍历 docs/ 实际存在的子目录，error 阻断)
    ├── drift-check.mjs               # 规范漂移校验参考实现 (依赖↔规范 / 模块速查表↔目录 / 门禁有效性，v1.9.0 新增)
    ├── step-1-discovery.md           # Step 1 自主发现引擎完整实现细节 (230 行)
    ├── step-2-assembly.md            # Step 2 规则引擎拼接完整实现细节 (159 行)
    ├── step-3-docs.md                # Step 3 建立自适应文档体系完整实现细节 (293 行)
    ├── step-4-git.md                 # Step 4 配置 Git 规范完整实现细节 (61 行)
    ├── step-5-ci-and-gates.md        # Step 5 配置 CI/CD + Step 5.5 门禁装配完整实现细节 (68 行)
    ├── step-6-testing.md             # Step 6 建立测试制度与基础设施完整实现细节 (131 行)
    └── step-7-adaptive.md            # Step 7 持续自适应机制完整实现细节 (89 行)
```

**总计**: **81 个文件**（不含 `.trae/`，该目录受 `.gitignore` 约束，不随仓库发布），无外部依赖。口径构成：
- 根目录 **9** 个（AGENTS.md / SKILL.md / README.md / README_CN.md / CHANGELOG.md / LICENSE / .gitignore / PROJECT_STATUS.md / package.json）
- `docs/` **13** 个（`README.md` 文档索引 + D 级 11 篇 .md + 1 个分享 HTML）
- `references/` **24** 个（含 7 个 step 文件 + 4 个 v1.9.0 新增参考文件 monorepo-agents / vendor-breadcrumbs / spec-driven / eval-baseline，以及 docs-check.mjs / drift-check.mjs 两个门禁参考实现）
- `scripts/` **3** 个（gates.json / verify.mjs / check-constitution.mjs，本仓库门禁层）
- `dsh-plugin/` **32** 个（插件包 7 个 + `skills/project-blueprint/` 下 **25** 个同步副本：SKILL.md ×1 + references/ ×24，由 `sync-skill.mjs` 从根目录生成，非手改）

> 说明：根 `references/` 与 `dsh-plugin/skills/project-blueprint/references/` 文件数与文件名集合一致（各 24 个）；根 `SKILL.md` 与插件副本 SHA256 一致。skill 侧的校验脚本（`docs-check.mjs` / `drift-check.mjs`）作为**参考实现**保留在 `references/`，不复制到 `scripts/`（本仓库 `scripts/` 为本仓库门禁层，避免两份事实源）。

**本版 v1.9.0 新增/变化**：`references/` 12 → 24（新增 4 个参考文件 + 7 个 step 文件 + drift-check.mjs）；新增 `scripts/` 3 个门禁层文件；新增 `docs/README.md` 文档索引与 `docs/D/D-06-v1.9.0` 发布说明中英双语（`docs/` 7 → 10）；`docs/D/` 存量 4 篇补状态头；`dsh-plugin/skills/` 同步副本 13 → 25。

## 三点五、AGENTS.md 建立记录（2026-08-01）

- 依据本 Skill 自身的规范体系（SKILL.md 7 Step 流程）为本仓库建立 `AGENTS.md`（v1.0，**建立时 163 行；当前 211 行（2026-09-18）**，仍在 ≤ 300 行上限内）
- 内容覆盖：项目身份、常用命令、Boundaries、强制规范（文档/SKILL.md 编写/知识库条目/版本发布/架构原则）、模块速查表、关键架构决策、Git 规范（双远程）、代码审查清单、上下文管理
- 后续对项目文件的任何变更需同步维护 AGENTS.md（见其「上下文管理」章节）

## 四、技术架构

### 7 Step 流程

```
Step 1: 自主发现引擎 (扫描→分类→推断)
Step 2: 规则引擎拼接 (95 组件条目知识库 + 联网回退)
Step 3: 自适应文档体系 (12 种业务类型动态生成 + 3.4 MCP 工具推荐 B-05)
Step 4: Git 规范配置
Step 5: CI/CD 配置 (+ 5.5 门禁装配)
Step 6: 测试制度建立
Step 7: 持续自适应机制
```

> v1.9.0 起 `SKILL.md` 为索引层（113 行），各 Step 实现细节按需读取 `references/step-1-discovery.md` ~ `step-7-adaptive.md`。

### 核心创新点

1. **零固定表** — 文件发现、依赖分类、业务推断均为自主推断
2. **三层递进** — 知识库精确 → 命名模式启发 → 联网搜索
3. **增量友好** — 已有项目只补缺失，不覆盖
4. **全栈覆盖** — AGENTS.md + docs + CI + testing + Git
5. **MCP 工具自动推荐** — 从探测技术栈自动匹配 MCP 工具组合（必装/推荐/可选），生成可执行安装文档；双层联网（建库期核对 + 推荐期兜底）防命令过时
6. **规范不漂移** — 种子门禁 `drift-check` 校验依赖↔技术栈行、模块速查表↔实际目录、门禁有效性；规范无法与代码静默漂移
7. **按需加载（渐进式披露）** — 技能正文瘦身为索引层，Step 细节按需加载，常驻上下文更小、知识深度不减

## 五、已知局限

1. **`drift-check.mjs` 依赖清单解析仅覆盖 Node 系**：检查 A 只解析 `package.json`，未覆盖 `go.mod` / `requirements.txt` / `pom.xml` / `Cargo.toml` 等；非 Node 项目该检查输出 info 跳过（本次真实暴露）
2. **Monorepo 嵌套模式尚未端到端实跑**：规则已在 `references/monorepo-agents.md` 与 `step-2-assembly.md` 落地，但本次未在真实多子项目仓库上端到端验证生成结果
3. React 生态 UI 库（MUI / shadcn/ui）仍未列入知识库，依赖联网回退（v1.9.0 的 5 域扩展未覆盖此域）
4. 知识库仍缺少 Fastify / Actix-web 框架条目（v1.9.0 未补）
5. Gitee 项目已有 GitHub Actions 时不会主动建议 `.gitee-ci.yml`
6. 3 层以上多子项目嵌套仍可能需手动再触发一次
7. `npx skills add` 安装方式依赖 skills.sh 平台

## 六、下一步计划

- [x] **P0-1 Monorepo 嵌套 AGENTS.md（v1.9.0 已实施）** — 多子项目（≥2 个构建/清单文件）改为「根 AGENTS.md（全局约束 + 子项目索引表）+ 各子项目包级 AGENTS.md」，对齐 closest-file-wins；新增 `references/monorepo-agents.md`；单项目行为零变化。**未闭环**：未在真实多子项目上端到端实跑（见「已知局限」2）
- [x] **P0-2 SKILL.md 拆分与按需加载（v1.9.0 已实施）** — `SKILL.md` 由 1012 行压缩为 113 行索引层（≤ 200），7 个 Step 细节迁至 `references/step-*.md`（均 ≤ 500 行）；内容零丢失（原 78 个 `##`/`###` 标题 100% 可定位）
- [x] **P0-3 规范漂移门（v1.9.0 已实施）** — 新增 `references/drift-check.mjs`（依赖↔AGENTS.md 技术栈行 / 模块速查表↔实际目录 / 门禁有效性），登记为第二条种子门禁 `spec-drift`；种子门禁升级为 2 条
- [x] **P1-4 知识库扩展（v1.9.0 已实施）** — `references/knowledge-base.md` 新增 5 个维度章节 + 15 个组件条目（AI/LLM 4、IaC 与云原生 3、可观测性 3、数据工程 2、原生移动 3）；现状 917 行 / 18 个二级章节 / 95 个组件条目
- [x] **P1-5 spec 驱动命令化（v1.9.0 已实施）** — 新增 `references/spec-driven.md`（specify → plan → tasks → checklist → implement → verify 六阶段 + 准入门槛 + checklist 可注册为门禁 `source: spec#<change-id>`）；`step-3-docs.md` 3.3 升级为六阶段流程
- [x] **P1-6 工具私有增强层（v1.9.0 已实施）** — 新增 `references/vendor-breadcrumbs.md`（Cursor `.mdc` glob 分层 / Claude Code hooks·subagents / Copilot instructions 分层模板）；Step 2 breadcrumbs 升级为「基线 + 私有增强层」
- [x] **P2-7 v1.9.0 发版（2026-09-14 已执行）** — commit `d90ded9`（64 files changed, 8914 insertions(+), 1611 deletions(-)）+ tag `v1.9.0`（`d655187`）；Gitee 已推送（main + tag），GitHub `main` 已推送（`f227ce5..d90ded9`）。**遗留**：GitHub tag `v1.9.0` 待补推（本机代理 `127.0.0.1:9674` 未运行、直连超时；命令见 CHANGELOG「未闭环」）
- [x] **P2-8 自身门禁空转修复（v1.9.0 已实施）** — `references/docs-check.mjs` 校验范围改为自适应（遍历 `docs/` 实际存在的子目录），本仓库 `docs/D` 已被真实校验（编号连续性 / 状态头 / 体积均实际执行）；新增 `scripts/` 门禁层（2 条种子门禁）；**并新建 `docs/README.md` 索引**，使 `docs-consistency` 的存量 warning 由 5 条 → 1 条 → **0 条**（`0 error / 0 warning / 4 info` exit 0）
- [x] **P2-9 口径漂移修正（v1.9.0 已实施）** — MCP 口径统一为「§一 匹配表 14 行 / §二 18 个工具条目」；行数快照更新为实测值（`SKILL.md` 113 行、`AGENTS.md` 211 行）；README 技术栈汇总行更新为「18 个二级章节（16 个技术栈维度）+ 95 个组件条目」
- [x] **P2-10 质量评估基准（v1.9.0 已实施）** — 新增 `references/eval-baseline.md`（规模指标 / 闭环指标 / 3 类 golden case 期望产物 / 已知不覆盖项）
- [x] **P2-12 外部评估复核与对外口径收敛（[Unreleased]，2026-09-18 已实施）** — 新增 [D-08](docs/D/D-08-外部评估复核报告.md)（实跑 4 门禁 / 核对 20+ 项数字 / 独立复核 4 篇 arXiv 与 3 个外部站点；判定评估侧 6 项失实）；组件 `70+` → **95 个组件条目**、业务类型 `13 种` → **12 种**全仓收敛（含 dsh 副本同步）；修复 `docs/README.md` 索引失效链接 + 补登记 D-07 / 速览单页；CHANGELOG v1.8.0「未闭环」勾销。**未闭环**：① GitHub description 仍为 v1.2.0 口径（见末条）；② `docs-check` 索引链接校验仅覆盖 `.md`，`.html` 等非 `.md` 链接属门禁盲区（D-08 §5.6，建议后续补门禁）
- [ ] **P3-11 DSH 监察插件（设计已闭环，未实施）** — 见 [D-07](docs/D/D-07-DSH监察插件可行性评估与设计报告.md)。定位：**旁挂只读监察员**（零配置可跑 + 一键初始化 + 递条子永不写项目）；最小可信版本 = 3 条检查（超大文件 / 重复造轮子 / 门禁有效性）+ 画像 + 豁免 + 误报闭环；差异化在**过程合规**（监控 AI 正在新增的代码）与**规范体系自身健康度**（皆为生态真空）。**前置约束**：引入真实代码将改变本仓库「纯 Markdown、无代码、无构建、无测试」的性质，须先同步修订 `AGENTS.md` 首节身份描述并补测试制度；待定项：插件命名 / 阈值口径 / 重复造轮子相似度算法
- [ ] 收集开源社区反馈和使用案例
- [ ] 扩展知识库覆盖更多框架和组件
- [ ] 提交到 skills.sh 官方目录
- [ ] 撰写博客/文章推广
- [ ] 双平台元数据更新（需 PAT / Gitee 私人令牌）：GitHub description/topics 同步至最新口径 + Gitee description 修正 7 语言 + Gitee 补设 MIT License（建议文本见会话记录）
