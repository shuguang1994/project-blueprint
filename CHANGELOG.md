# Changelog

All notable changes to this project will be documented in this file.

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
