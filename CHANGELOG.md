# Changelog

All notable changes to this project will be documented in this file.

## [1.9.0] - 2026-09-14

> 主题：跨栈通用性与规范不漂移 —— SKILL.md 按 Step 拆分瘦身、Monorepo 嵌套 AGENTS.md、规范漂移门（第二条种子门禁）+ 仓库自吃狗粮
> 差距来源见 [D-05-行业对标与体系完备性评估报告.md](docs/D/D-05-行业对标与体系完备性评估报告.md)（P0-1 / P0-2 / P0-3 / P1-4 / P1-5 / P1-6 / P2-8 / P2-9 / P2-10）

### Added
- **Monorepo 嵌套 AGENTS.md**：多子项目（≥2 个构建/清单文件）由「根单文件分块写入」升级为「根 `AGENTS.md`（全局约束 + 子项目索引表）+ 各子项目包级 `AGENTS.md`（包级规范）」，对齐 AGENTS.md 官方「就近原则 closest-file-wins」；单项目行为与 v1.8.0 一致（零变化）。新增参考文件 `references/monorepo-agents.md`
- **规范漂移门（第二条种子门禁）**：新增零依赖参考实现 `references/drift-check.mjs`（依赖 ↔ AGENTS.md 技术栈行 / 模块速查表 ↔ 实际目录 / 门禁有效性），并登记为种子门禁 `spec-drift`；种子门禁由 1 条（`docs-consistency`）升级为 **2 条**（`docs-consistency` + `spec-drift`）
- **知识库 5 域扩展（15 个组件条目）**：`references/knowledge-base.md` 新增 5 个维度章节并补齐 15 个组件条目（每条四段：Commands / Conventions / CI job / Gate）
  - AI/LLM 栈（4）：LangChain / LangGraph、LlamaIndex、pgvector、Ollama / vLLM（本地推理服务）
  - IaC 与云原生（3）：Terraform、Helm、Kubernetes manifest（kubectl / kustomize）
  - 可观测性（3）：OpenTelemetry、Sentry、Prometheus + Grafana
  - 数据工程（2）：dbt、Airflow
  - 原生移动（3）：Flutter、SwiftUI（Swift）、Jetpack Compose（Kotlin）
  - 现状：`knowledge-base.md` 917 行 / 18 个二级章节（16 个技术栈维度 + 通用段落 + 业务类型文档模式）/ 95 个组件条目（`### [组件名]`）
- **规范驱动开发六阶段**：新增 `references/spec-driven.md`（specify → plan → tasks → checklist → implement → verify，每阶段有产物与准入门槛；三件套模板；`checklist` 可转门禁，标注 `source: spec#<change-id>`）；`references/step-3-docs.md` 3.3 由「仅说明三件套格式」升级为六阶段流程；`references/docs-skeleton.md` / `references/project-sync-guide.md` 同步
- **工具私有增强层**：新增 `references/vendor-breadcrumbs.md`（工具能力矩阵 + Cursor `.mdc` glob 分层 / Claude Code hooks·subagents / Copilot instructions 分层模板 + 增量与防漂移条款）；Step 2 的 breadcrumbs 由「仅指向文件」升级为「基线 + 私有增强层」
- **量化评估基准**：新增 `references/eval-baseline.md`（规模指标 / 闭环指标 / 3 类 golden case 期望产物 / 已知不覆盖项）
- **本仓库自吃狗粮（scripts/ 门禁层）**：新增 `scripts/gates.json`（2 条门禁）+ `scripts/verify.mjs`（统一入口，支持 `--stage=`）+ `scripts/check-constitution.mjs`（宪法自校验 A~D 规则）

### Changed
- `SKILL.md` 按 Step 拆分：正文由 1012 行压缩为 **113 行索引层**（触发条件 / 执行原则 / Step 索引与按需加载表 / 输出验收清单 / 参考文件索引）；7 个 Step 细节迁至 `references/step-1-discovery.md` ~ `step-7-adaptive.md`（Step 5.5 门禁装配并入 step-5）；内容零丢失（原 78 个 `##`/`###` 标题 100% 可定位）
- `references/docs-check.mjs` 校验范围改为**自适应**：遍历 `docs/` 实际存在的子目录（排除 archive / dev / node_modules），缺失目录不再整块跳过；本仓库 `docs/D` 已被真实校验（不再是「5 条检查全部跳过」）
- 口径唯一化：索引 24/24 对齐、技术栈维度清单 11 → 16、组件条目层级统一 `### [组件名]`、`knowledge-base.md` 头注由「每个组件四段」改为准确表述（95 个组件条目中 27 个含 `**Gate**` 段）
- README / README_CN：核心能力表 +5 行（Monorepo 嵌套 AGENTS.md / 工具私有增强层 / 按需加载 / 规范驱动开发六阶段 / 规范漂移门）；生成内容一览 +`scripts/drift-check.*`、+「多子项目时各子项目目录下的 `AGENTS.md`」，更新 `scripts/docs-check.*`（校验范围自适应）与 `scripts/gates.json`（默认播种 2 条种子门禁）；技术栈覆盖表新增 5 个域行、汇总行更新为「18 个二级章节（16 个技术栈维度）+ 95 个组件条目」；工作流程补「Step 细节按需加载」与「多子项目 → 根 + 包级 AGENTS.md」分支，「15+ 文件」表述改为「多子项目时另生成各包级 AGENTS.md」；「与众不同之处」+3 条（规范不漂移 / Monorepo 就近覆盖 / 渐进式披露）
- `AGENTS.md`：模块速查表补 `scripts/` 门禁层与 4 个新参考文件 + 7 个 step 文件（合并一行）；强制规范补「`SKILL.md` ≤ 200 行 / `references/step-*.md` ≤ 500 行」与「对外数字口径唯一源」；关键架构决策表 +4 条；版本/日期更新为 v1.9.0 / 2026-09-14

### Fixed
- `AGENTS.md` 知识库条目层级表述错误：`## [组件名]` 更正为 `### [组件名]`（知识库实际为 `##` 维度章节 + `###` 组件条目）
- `references/docs-check.mjs` 文件头注释「首个门禁种子」更正为「种子门禁之一（docs-consistency）」（仅注释，逻辑未变）
- 新建 `docs/README.md` 文档索引（A~E 分类约定 + 维护规则 + D 级 5 条编号 / 7 篇文档登记），消除 `docs-consistency` 的最后 1 条 warning（「`docs/` 有文档但缺索引」）；索引内的相对链接可被门禁校验
- `docs/D/` 存量 4 篇文档补状态头（`D-01-代码规范闭环增强方案.md` / `D-02-v1.7.0-功能发布说明.md` / `D-02-v1.7.0-Release-Notes-EN.md` / `D-04-v1.8.0-Release-Notes-EN.md`），仅追加一行状态头，未改动既有内容；`docs-check` 存量 warning 由 5 条降至 1 条

### BREAKING
- **SKILL.md 文件结构重构**：正文由单文件拆分为 113 行索引层 + 7 个 `references/step-*.md` 细节文件（`references/` 文件数 12 → 24）。外部若有文档/脚本**按章节定位 `SKILL.md` 正文**，需改为指向对应 `references/step-*.md`（章节标题保持可定位，便于迁移）
- **多子项目场景生成物结构变化**：多子项目（≥2 个构建/清单文件）生成的根 `AGENTS.md` 由「包含各子项目规范分块」改为「**全局约束 + 子项目索引**」，各子项目规范改生成到各自目录下的 `AGENTS.md`（包级）
- 以上两项均为 **增量补充、不覆盖已有内容**；单项目场景行为与 v1.8.0 完全一致（零变化）

### 验证
- **规模校验**（真实执行）：`SKILL.md` = **113 行**（≤ 200）；step 文件行数：step-1-discovery 230 / step-2-assembly 159 / step-3-docs 293 / step-4-git 61 / step-5-ci-and-gates 68 / step-6-testing 131 / step-7-adaptive 89（均 ≤ 500）
- **文档一致性门禁**（真实执行，补状态头 + 补索引后）：
  ```bash
  node references/docs-check.mjs
  结果：0 error / 0 warning / 4 info   （exit 0）
  ```
  存量 warning 收敛过程（真实执行）：补状态头前 `0 error / 5 warning / 4 info`（4 篇 docs/D 缺状态头 + 缺 `docs/README.md` 索引）→ 补状态头后 `0 error / 1 warning / 4 info` → **新建 `docs/README.md` 索引后 `0 error / 0 warning / 4 info`**（索引覆盖关系已可校验：D 系列 5 条编号 7 篇文档全部被索引覆盖，索引内相对链接全部指向存在文件）
- **规范漂移门**（真实执行）：
  ```bash
  node references/drift-check.mjs
  结果：0 error / 0 warning / 2 info   （exit 0）
  ```
  （本仓库无依赖清单、无源码根，检查 A/B 输出 info；检查 C 门禁有效性在 `scripts/gates.json` 登记后生效）
- **门禁统一入口**（真实执行）：
  ```bash
  node scripts/verify.mjs
  结果：共 2 条门禁（blocking 失败 0 条 / warn 失败 0 条），耗时合计 298ms   （exit 0）
  ```
- **宪法自校验**（真实执行）：
  ```bash
  node scripts/check-constitution.mjs
  结果：0 error / 0 warning / 3 info   （exit 0）
  ```
- **负向验证**（真实执行并已还原）：临时创建 `docs/D/D-05-临时重复.md` → `docs-check` 报 `1 error`（编号冲突）exit 1；删除后恢复 `0 error` exit 0
- **代码围栏闭合校验**（真实执行）：`SKILL.md` 与全部 `references/*.md` 的行首三反引号计数均为偶数（无未闭合围栏）
- **同步副本校验**（真实执行）：`node dsh-plugin/scripts/sync-skill.mjs` 后，根 `SKILL.md` 与 `dsh-plugin/skills/project-blueprint/SKILL.md` SHA256 一致；`references/` 与插件副本的文件名集合一致（各 24 个）

- **发版**（真实执行）：commit `d90ded9` — `feat: v1.9.0 体系差距全量补齐 + v1.8.0 宪法层与门禁生长机制`（64 files changed, 8914 insertions(+), 1611 deletions(-)）；tag `v1.9.0`（`d655187`）。双远程推送状态见「未闭环」

### 未闭环
- ~~本次改动未执行 `git commit` / `git push` / `git tag`~~ → **已发版（2026-09-14）**：commit `d90ded9` + tag `v1.9.0`；**Gitee 已推送**（`main` → `d90ded9`，tag `v1.9.0`）；**GitHub `main` 已推送**（`f227ce5..d90ded9` 直连成功）
- **GitHub tag `v1.9.0` 待补推**：本机代理（`http.https://github.com.proxy` = `127.0.0.1:9674`）当前未运行，直连推送 tag 连续两次 21s 超时；补推命令：`git push origin v1.9.0`（代理启动后）或 `git -c http.https://github.com.proxy= push origin v1.9.0`（直连）
- ~~`docs-check` 仍有 1 条存量 warning（缺 `docs/README.md` 索引）~~ → **已闭环**：新建 `docs/README.md` 索引后复跑 `node references/docs-check.mjs` → `0 error / 0 warning / 4 info` exit 0（保留此行作为闭环记录）

## [1.8.0] - 2026-09-13

> 主题：宪法层与门禁生长机制 —— 把门禁从"初始化一次性产物"升级为"宪法驱动的生长物"
> 详细发布说明见 [D-04-v1.8.0-功能发布说明.md](docs/D/D-04-v1.8.0-功能发布说明.md)（中文）/ [D-04-v1.8.0-Release-Notes-EN.md](docs/D/D-04-v1.8.0-Release-Notes-EN.md)（English） | 评估报告见 [D-03-真实项目文档体系优化引入评估报告.md](docs/D/D-03-真实项目文档体系优化引入评估报告.md)

### Added
- **宪法层元规则（写入 AGENTS.md）**：3 条元规则（无门禁不立规 / 缺陷必闭环 / 契约唯一源）+ 开工前置（读取 `scripts/gates.json`，新会话先了解本仓库现有门禁）；并配套三件套：门禁清单唯一事实源 `scripts/gates.json`、统一入口 `scripts/verify.*`、宪法自校验 `scripts/check-constitution.*`。元规则章节控制在 ≤ 15 行，细则一律外链，防宪法膨胀
- **门禁生长流程（6 步）**：① 触发 → ② 判定（准入门槛四问：可机检？零新依赖？真发生过？误报可控？）→ ③ 生成（三层递进取配方：跨语言门禁配方表 → 组件 `Gate` 段 → 联网搜索）→ ④ 注册（写具体检查 `scripts/checks/<id>.*` + `gates.json` 追加一条）→ ⑤ 验证（负向验证：故意制造违规确认门禁能拦住）→ ⑥ 登记（BUG 知识库 + 协议文档 + CHANGELOG）
- **门禁模板集 `references/gates-templates.md`**：`gates.json` 结构 / `verify.*` 统一入口 / `check-constitution.*` 宪法自校验 / 宿主与装配点选择 / 三版翻译要点
- **跨语言门禁配方表（10 条）+ 组件 `Gate` 第 4 段**：`references/knowledge-base.md` 通用段落新增 10 条语言无关门禁配方（契约漂移 / 硬编码密钥 / 锁文件一致 / 调试残留 / 静态检查 / 格式化 / 测试覆盖率 / 迁移与模型一致 / 文档一致性等）；组件条目格式由 3 段升级为 4 段（新增 `**Gate**`），12 个高频组件补齐 Gate 段
- **文档契约 + `docs-check` 校验脚本**：文档状态头（`> 版本: … | 更新: … | 状态: …`）/ 编号连续性 / 索引覆盖 / 归档冲突 + 单文件体积校验；输出分级 `error`（阻断）/ `warning`（不阻断）/ `info`（提示）；新增 `references/docs-check.mjs` 参考实现，作为首个门禁种子
- **AI 编程工作协议 `references/ai-work-protocol.md`**：7 步任务生命周期（读规范 → 查先例 → 定契约 → 列计划 → 实施 → 跑门禁 → 回写文档）/ 证据标准（改动给 `文件:行号`、验证给命令实际输出，禁止"应该没问题"）/ DoD 完成定义 8 条 / 违规处理表 / 缺陷复盘模板
- **SKILL.md 新增 Step 5.5「门禁装配」**：宿主选择（优先复用项目已有入口 → Node → Python → make → shell 兜底）+ 装配点（pre-commit / pre-push / CI）+ 生成后实跑自测 + `blocking` / `warn` 分级
- **按规模阈值触发**：小型项目只生成单条门禁（docs-check）+ 统一入口，不生成完整门禁层与协议文档，避免过度工程
- **仓库首次启用 spec 驱动开发**：`.trae/specs/implement-gate-constitution/`（spec.md / tasks.md / checklist.md 三件套）
- **新增 `docs/D/` v1.8.0 发布说明**（中文 [D-04-v1.8.0-功能发布说明.md](docs/D/D-04-v1.8.0-功能发布说明.md) + 英文 [D-04-v1.8.0-Release-Notes-EN.md](docs/D/D-04-v1.8.0-Release-Notes-EN.md)，中英互链，面向社区：为什么做 / 核心更新 / 差异速览 / BREAKING 与迁移 / 验证与未闭环）

### Changed
- `SKILL.md` 流程改造：新增 Step 5.5「门禁装配」；Step 2 新增宪法层注入（元规则 / 门禁清单与装配 / 规模硬阈值 / 文档契约）；Step 3 新增 3.5「门禁层与协议文档生成」+ 按规模阈值触发；Step 4 CHANGELOG 模板升级（「验证」/「未闭环」双节）；Step 5 新增门禁统一入口 job 与分级；Step 6.5 hooks 按语言选择；Step 7 新增门禁生长机制；输出验收清单同步更新
- `references/knowledge-base.md`：通用段落新增「跨语言门禁配方表」10 条；组件条目格式由 3 段升级为 4 段（新增 `**Gate**`）；12 个高频组件补 Gate 段
- `references/agents-md-template.md`：新增「九、门禁即规则（元规则）」「十、门禁清单与装配」；上下文管理新增规模硬阈值 / 文档契约 / 门禁生长登记；补齐缺失的 `> Reason:`
- `references/docs-skeleton.md`：新增 `B-06-门禁与工作协议.md`、`docs/issues/`、archive 归档登记表、文档契约章节；B-04 描述升级
- `references/project-sync-guide.md`：新增「门禁生长登记流程」「BUG 知识库升级要点」；何时同步表 +2 行；同步原则 +1 条
- `references/ci-template.yml`：新增「门禁统一入口 job」章节（Node/TS 完整示例 + Vue/Go/Python 等价写法）
- `docs/D/D-03-真实项目文档体系优化引入评估报告.md` v1.3：**源项目本机绝对路径脱敏**——33 处 `file:///d:/…` 链接前缀与 1 处头部路径统一替换为 `<源项目>` / `源项目/` 占位符，本仓库自身绝对路径改为相对链接；满足公开仓库不含本机路径的要求

### Fixed
- `references/knowledge-base.md` 数据库条目示例库名统一为占位符 `<db_name>`：MySQL 原写死 `app_db`、PostgreSQL 原用裸词 `dbname`，两者不一致且易被当作真实库名照抄；统一后与仓库既有占位符风格（`<pkg>` / `<entity>_id`）一致，符合「不写死项目特定信息」规范
  ```bash
  node dsh-plugin/scripts/sync-skill.mjs
  [sync-skill] synced SKILL.md + references/ -> dsh-plugin/skills/project-blueprint/
  ```
  校验：全仓 `grep -E "app_db|dbname"` → 0 匹配（根 `references/` 与 `dsh-plugin/skills/` 同步副本均已生效）

### BREAKING
- **SKILL.md 流程结构变更**：新增 Step 5.5「门禁装配」，Step 2 / 3 / 4 / 5 / 6.5 / 7 均有调整。既有用户重新初始化时，AGENTS.md 与 `docs/` 会多出章节与文件（**增量补充，不覆盖已有内容**）

### 验证
- **DSH 插件包技能内容同步**（真实执行）：
  ```bash
  node dsh-plugin/scripts/sync-skill.mjs
  [sync-skill] synced SKILL.md + references/ -> dsh-plugin/skills/project-blueprint/ (<repo>/dsh-plugin/skills/project-blueprint)
  ```
- **同步结果校验**（真实执行）：`dsh-plugin/skills/project-blueprint/references/` 文件数 = 12（含新增的 `ai-work-protocol.md` / `gates-templates.md` / `docs-check.mjs`）；根 `SKILL.md` 与 `dsh-plugin/skills/project-blueprint/SKILL.md` 均为 **50203 字节 / 1012 行**（内容行数，`newlines` 计数），SHA256 一致（`D0705F09…2B1482`）
- **SKILL.md 校验修复**（Task 7）：① 一处示例的硬编码年份改为 `{currentYear}` 占位符（符合「禁止硬编码年份」规范）；② 删除「注入 A」代码块中与协议/模板重复的一行，使元规则正文**三方（协议 / AGENTS 模板 / SKILL.md 注入块）逐字一致**；最终 50203 字节 / 1012 行
- **门禁脚本实跑**（真实执行）：`node --check references/docs-check.mjs` → exit 0；`node references/docs-check.mjs` → `结果：0 error / 0 warning / 5 info` + exit 0（本仓库无 `docs/B` 等目录时输出 info 并正常退出，不崩溃）
- **规格校验**（独立只读校验，分两轮）：发现的问题（元规则文本三方一致性、CHANGELOG 字节数过时、生长流程单边缺失、`references/` 硬编码年份残留、文件树口径遗漏）**已全部修复并复核通过**（详见 `.trae/specs/implement-gate-constitution/` 三件套；该目录为本地目录，受 `.gitignore` 约束，不随仓库发布）
- **发布前一致性审查**（2026-09-14，真实执行）：版本号三处一致（根 `package.json` / `dsh-plugin/package.json` / `dsh-plugin/plugin.json` 均为 1.8.0）；`SKILL.md` 与 `dsh-plugin/skills/` 副本逐字节一致（SHA256 `D0705F09…2B1482`）；`references/` 两侧各 12 个文件一致；全仓 Markdown 代码块闭合校验通过（无未闭合围栏）；相对链接可解析校验通过；`node references/docs-check.mjs` → `0 error / 0 warning / 5 info` + exit 0。**本轮修复 3 项**：① `docs/D/D-03` 状态头由"方案定案（尚未动手）"更正为"已实施"并补 §六「实施结果」实际范围；② `docs/D/D-03` §9.4 `gates.json` 示例由 `{version, gates}` 对象结构更正为**顶层数组**（与 `references/gates-templates.md` §一 实现口径一致）；③ 本文件「验证」段 `sync-skill` 输出中的本机绝对路径改为 `<repo>/` 占位符

### 未闭环
- 本次改动未执行 `git commit` / `git push` / `git tag`，未发布到 GitHub / Gitee 双远程

## [1.7.1] - 2026-08-26

### Added
- **初始化流程生成 CHANGELOG.md**：SKILL.md Step 4 新增「CHANGELOG.md（如果没有则创建）」小节（[Unreleased] 初始化占位模板 + 增量跳过规则），输出验收清单补充 CHANGELOG.md 产物。修复「AGENTS.md 发布规范要求发版更新 CHANGELOG，但 skill 初始化不生成该文件」的不一致缺口

### Fixed
- **PROJECT_STATUS.md 版本演进表 v1.7.1 行丢失**（并发编辑竞态：后写覆盖先写，同 v1.7.0 记录过的 README 竞态问题）：已重补并逐行核对落盘。**对策**：同一文件的多个修改改为串行执行，每次修改后 Read/Grep 验证实际落盘

### Verified
- **DSH 0.1.1-rc.2 兼容性验证（2026-08-22）**：dsh 升级含破坏性变更（v0.1.0-rc.8 SQLite 会话存储格式不兼容、Session Projection API 迁移），实测 dsh-plugin **无需适配**——`ctx.skills.registerProvider` / `FileSystemSkillProvider` / `ctx.effect` 签名未变，`dsh.bundle.patch` 安装机制原样保留，隔离环境运行时验证通过（provider 成功发现 `project-blueprint` 技能）。详见 `dsh-plugin/README.md`「兼容性」

## [1.7.0] - 2026-08-14

> 详细发布说明见 [D-02-v1.7.0-功能发布说明.md](docs/D/D-02-v1.7.0-功能发布说明.md) | 方案见 [D-01-代码规范闭环增强方案.md](docs/D/D-01-代码规范闭环增强方案.md)

### Added
- **代码规范闭环增强**：初始化即实际写入基础代码规范（B-01 从占位符改为实写 8 章），AGENTS.md 强制规范含基础规范核心规则（≤20 条）
  - 新增 `references/code-conventions.md`：基础规范种子知识库（6 大类 × 语言适配，含搜索模板）
  - 新增 `references/ai-common-mistakes.md`：AI 高频错误知识库（7 大类 27 条，每条六段：AI 易错点/后果/❌示范/✅做法/关联知识库/搜索模板）
- **AI 高频错误防犯专项（最高优先级）**：Step 2 按技术栈优先注入 AI 易错点防犯规则；B-01 新增「AI 高频错误防犯清单」章节；代码审查清单新增 AI 高频检查项
- **BUG→规范反哺闭环**：B-04 模板新增「是否规范缺失/规范反哺」字段；修复规范缺失型 Bug 自动反哺更新 B-01 与 AGENTS.md；AI 犯错型 Bug 迭代 ai-common-mistakes 清单
- **项目进度与文档健康检查**：Step 7 注入按里程碑（功能完成/重构/上线/季度）检查文档滞后并提醒用户维护的机制
- SKILL.md Step 2 注入「代码规范体系」三层引用（AGENTS.md 核心 → B-01 详细 → B-04 反哺）
- `references/knowledge-base.md`：通用段落新增 AI 高频错误防犯原则 4 条（只走 happy path / 吞错误 / 硬编码密钥 / 写代码前先读现有代码），代码审查清单新增 AI 高频检查项 5 条（含"已对照 ai-common-mistakes.md 自查"）
- `references/docs-skeleton.md`：B-01 描述更新为实写 8 章（声明 AGENTS.md 为权威源、B-04 为反哺源），B-04 描述加入「规范反哺」字段说明
- agents-md-template.md 兜底模板新增 4.5 节（代码规范体系 + AI 高频错误防犯）
- README / README_CN：核心能力表 +2 行（基础代码规范实写 / AI 高频错误防犯）、生成内容补 B-01 实写说明、与众不同之处 +1 行、贡献指南 +2 行（基础规范库 / AI 易错点库）
- 新增 `docs/D/` v1.7.0 发布说明（中文 [D-02-v1.7.0-功能发布说明.md](docs/D/D-02-v1.7.0-功能发布说明.md) + 英文 [D-02-v1.7.0-Release-Notes-EN.md](docs/D/D-02-v1.7.0-Release-Notes-EN.md)，中英互链，面向社区）

### Fixed
- 初始化后 `docs/B/B-01-开发规范.md` 仅为占位符的问题（改为实写 8 章）
- README 双语文档并发编辑竞态导致新增能力行丢失（能力表 2 行 / 生成内容 B-01 说明 / 与众不同之处 1 行），已补齐并逐一复核
  - **原因**：同一文件多个并行写入互相覆盖（子代理内部并发 Edit 同一区域，后写覆盖先写）
  - **对策**：对同一文件的修改改为串行执行；每处修改完成后用 Grep/Read 验证实际落盘，不依赖子代理自报

## [1.6.1] - 2026-08-14

### Fixed
- **DSH 插件 GitHub 安装路径修复**：仓库根目录新增 `package.json`（声明 `dsh.bundle.patch: ./dsh-plugin/cordis.patch.yml` + `main: ./dsh-plugin/lib/index.js`），`dsh plugin --profile web add 'github:shuguang1994/project-blueprint'` 此前因根目录无 package.json 被 dsh 判定为普通依赖（`declares no dsh.bundle`）而无法激活；修复后 bundle 正确合成进 profile，社区安装命令直接可用
- 本地实测通过：以根目录包装形式安装 → `dsh --profile web --dump-config` 出现 `# == project-blueprint` bundle 层 → 重启 `dsh web` 运行正常
- `dsh-plugin/package.json` 版本 1.5.0 → 1.6.0（与项目版本一致）

## [1.6.0] - 2026-08-14

### Added
- **DSH (DeepSeek Harness) 插件支持**：新增 `dsh-plugin/` 自包含插件包，可将 Project Blueprint 一键安装到 DeepSeek Harness（2026-08-13 开源的 "一切皆插件" Agent 框架）
  - `package.json` + `cordis.patch.yml`：`dsh plugin --profile web add 'github:shuguang1994/project-blueprint'` 安装，复用官方 `@deepseek-ai/dsh-skill-filesystem` 提供方，零构建、零运行依赖、纯 Markdown 技能内容
  - `lib/index.js`：极简 ESM 插件（`import.meta.url` 定位包内 skills 目录，注册 custom skill 根，rank 300），无 TS 构建链
  - `plugin.json`：Agent Plugins v1.0.0 便携清单（跨宿主分发，同一份技能资源可被 Claude Code / Cursor / Codex 等客户端复用）
  - `scripts/sync-skill.mjs`：根目录 `SKILL.md` + `references/` 同步到插件包（单一事实来源 = 仓库根）
  - 本地实测通过：在 Cordis 运行时中挂载真实插件代码，`ctx.skills.list()` 发现 `project-blueprint`（provider=custom），`ctx.skills.get()` 完整加载 SKILL.md 正文
- README / README_CN 新增 dsh 安装方式；支持的 Agent 数量 27+ → 28+（新增 DeepSeek Harness）
- GitHub 仓库打 14 个 Topics 标签（dsh-plugin / dsh / deepseek-harness / agent-skills / skills / spec-driven / harness-engineering / coding-conventions / scaffolding / ai-coding / claude-code / cursor / codex / opencode）；README / README_CN 顶部新增 Topics 徽章行（点击跳转 GitHub 话题页）

## [1.5.0] - 2026-08-01

### Added
- **MCP 工具推荐能力**：Step 3 新增 3.4 子步骤，基于探测技术栈三层递进匹配 MCP 工具，生成 `docs/B/B-05-MCP工具清单.md`（推荐清单 + 组合矩阵 + 安装命令），供后期按文档安装
  - 新增 `references/mcp-tools.md`：MCP 工具知识库（10 维度 18 条目，三段式 适用场景/安装方式/推荐组合 + 维度匹配表 + 组合矩阵）
  - 双层联网保障：建库期条目安装命令必须 WebSearch 核对当前版本；推荐期第 3 层联网兜底未知工具；B-05 文档提示安装前联网核对
  - 仅生成 MD 文档，不写入项目级 `.mcp.json`（最小侵入）
  - docs-skeleton B/ 新增 B-05 行；project-sync-guide 同步操作表新增「新增/移除 MCP 工具」触发行
  - AGENTS.md 代码审查清单新增 mcp-tools.md 三段式检查项

### Fixed
- SKILL.md Step 3.4 三层递进第 1/2 层与 mcp-tools.md 分层标注对齐（第 1 层 = 工具条目「适用场景」精确匹配，第 2 层 = 「维度 → 工具匹配」表启发）
- README_CN「与众不同之处」语言数 8 → 7 统一（知识库实际 7 个语言条目，TS/JS 合并）
- README_CN 技术栈覆盖表末行 `<br />` 残留清理
- .gitignore 追加 `.trae/`（IDE 本地目录，避免误提交）
- PROJECT_STATUS 移除内部项目引用与本机绝对路径（开源仓库不暴露其他项目信息）

## [1.4.1] - 2026-08-01

### Added
- 通用规范新增「第三方库使用」规则：涉及第三方库（NestJS/TypeORM/BullMQ/Vant 等）的 API/版本/配置时，先查官方文档确认当前版本用法再写代码
  - knowledge-base 核心开发原则新增该约定（含升级依赖后核对破坏性变更）
  - agents-md-template 强制规范新增 4.4 节
  - 代码审查清单（knowledge-base + agents-md-template）新增「第三方库用法已核对当前版本文档？」检查项

### Fixed
- SKILL.md 流程描述「6 步」修正为「7 步」（实际为 Step 1~7）
- Step 4 分支策略改为按已有分支自适应（支持 main + tag 发布），不再强制新建 develop
- README/README_CN 数字核对：语言 8→7、通用规范 6→4，覆盖表总数按实际条目核算（79 组件）
- ci-template.yml / knowledge-base Git 规范 / agents-md-template 分支策略同步支持 main

## [1.4.0] - 2026-07-18

### Changed — BREAKING: Step 1 自主发现引擎重构

**Step 1.1 自主文件发现**：从「固定 12 种文件检查」改为「扫描→分类→推断」模式
- 新增文件发现策略：扫描项目所有文件，按 30+ 种文件名模式自动分类
- 新增项目结构推断：自动识别前后端分离（2/3 层）、monorepo、单项目
- 扩展文件覆盖：.csproj、composer.json、vite/next/nuxt/svelte/webpack/tailwind 配置、.env.example、Makefile、nginx.conf 等

**Step 1.2 智能依赖分类**：从「~35 条固定映射表」改为「三层递进分类引擎」
- 第 1 层：知识库精确匹配（快速通道，置信度 exact）
- 第 2 层：命名模式启发推断（29 种模式覆盖 100+ 依赖关键词，置信度 heuristic）
- 第 3 层：联网搜索（真正未知的依赖，置信度 web）
- 分类结果附带置信度标记，便于后续审查

**Step 1.3-1.4**：输出格式改为分项目块 + 置信度统计；多子项目独立探测

**Step 3.0 业务类型推断**：从「固定 8 类」改为「三层推断」
- 第 1 层：结构特征匹配（8 类）
- 第 2 层：配置特征启发推断（新增 CLI/库/SDK/桌面/静态站点 5 类）
- 第 3 层：联网搜索 + 类型优先级规则

**Step 6.3 测试示例**：从「固定 5 框架代码块」改为「3 级自主获取策略」
- 第 1 优先：快速参考表（12 框架，命中即用）
- 第 2 优先：knowledge-base 提取
- 第 3 优先：WebSearch 联网获取

## [1.3.0] - 2026-07-18

### Added
- 模块速查表联网回退：陌生目录/文件模式自动 WebSearch 推断职责，不再简单标记"待补充"
- Step 1.2 未知依赖标记 + 联网流向指引：不在映射表的 dep key 自动进入 Step 2.2 搜索
- 13 种文件模式 → 模块职责映射表（controller/service/repository/entity/handler/dto/gateway/job/middleware 等）
- 4 种模块推断联网搜索模板（陌生目录名/陌生文件后缀/架构模式关键词/英文业务术语）
- 全栈项目业务类型识别规则
- NestJS/React/Go Gin/FastAPI/Spring Boot 框架自适应测试模式（写入测试指南，非创建文件）

### Changed
- Step 2.2 联网回退扩展：从 4 维度（框架/ORM/测试/构建工具）扩展为 10 维度全覆盖（语言/CSS/Lint/包管理/状态管理/部署/数据库）
- Step 3.2 模块速查表改为 5 级推断流程（文件列表→模式匹配→联网搜索→标记待补充→写入）
- Step 3.0 后端检测覆盖非 Prisma 项目（controllers/modules/services 目录 + 后端框架 + ORM 配置）
- Step 4 git add -A 改为 git add . + 提交前检查有无变更
- Step 6 pre-commit hook 仅 JS/TS 项目执行，其他语言跳过
- README 框架列表与 knowledge-base 对齐（Fastify→Laravel+Hono；Actix-web 待补）
- README/README_CN 代理支持数量统一为 27+
- **Step 6 重设计**：不再强制创建 `assert true` 示例测试文件，改为生成 `docs/B/B-03-测试指南.md` 测试制度文档（含分层策略、按阶段的编写时机、框架自适应的测试模式示例）
- **Step 1 探测增强**：新增 `manifest.json`/`pages.json`（uni-app）、`ecosystem.config.js`（PM2）文件检测
- **Step 1.2 新增 UI 组件库维度**：Ant Design Vue / Element Plus / Naive UI / Arco Design / TDesign / Vant
- **knowledge-base 扩展**：uni-app 框架、UI 组件库层（4 条目）、NestJS 生态增强（swagger/schedule/event-emitter/winston）
- **Step 1.0 增量模式细化**：按 AGENTS.md 质量分 3 级处理（完善→检查缺失 / 部分缺失→补充 / 无→全量生成）

### Fixed
- **BUG**: knowledge-base.md 代码审查清单代码块未闭合，导致「业务类型文档模式」「模块速查表生成规则」两个完整章节被当作代码渲染
- **BUG**: SKILL.md Step 2.1 组件循环遗漏 包管理/部署/数据库 3 个维度，导致对应知识库条目不会被查找
- **BUG**: docs-skeleton.md 文件数量/名称与 SKILL.md Step 3.1 不一致（A:7→5, B:5→4, C:4→3, E:2→1）

## [1.2.0] - 2026-07-18

### Added
- 自适应探测引擎：10 种项目文件并行探测（package.json / go.mod / requirements.txt / pom.xml / Cargo.toml / Gemfile / tsconfig.json / docker-compose.yml / .eslintrc / .prettierrc）
- 61 组件知识库 `references/knowledge-base.md`（7 语言 / 14 框架 / 6 ORM / 5 CSS / 6 测试 / 15 Lint+包管理+部署 + 通用段落）
- 规则引擎拼接 AGENTS.md（按探测的组件从知识库动态拼接）
- 联网回退：未知技术栈自动触发 WebSearch 获取最新最佳实践

### Removed
- **BREAKING**: 删除固定预设目录 `references/presets/`（7 个语言预设），改为动态组件拼接

## [1.1.0] - 2026-07-18

### Added
- 6 技术栈预设：Next.js / Vue 3 + Vite / React + Vite / Go + Gin / Python + FastAPI / Java + Spring Boot
- Vendor breadcrumbs：自动生成 CLAUDE.md、.cursor/rules/project.mdc、.github/copilot-instructions.md
- CI 模板多语言支持（GitHub Actions / Gitee Go）

## [1.0.0] - 2026-07-18

### Added
- 初始版本：6 步规范体系搭建流程
- AGENTS.md 自动生成（150-200 行，4 核心章节）
- docs/ 文档骨架（A/B/C/D/E 五分类）
- Git 配置（.gitignore + 分支策略 + 首次 commit）
- CI/CD 配置（GitHub Actions 最小化 tsc 检查）
- 测试基础设施（框架安装 + 示例测试 + husky pre-commit hook）
