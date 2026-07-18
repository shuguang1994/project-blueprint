# Changelog

All notable changes to this project will be documented in this file.

## [1.4.0] - 2026-07-18

### Changed — BREAKING: Step 1 自主发现引擎重构

**Step 1.1 自主文件发现**：从「固定 12 种文件检查」改为「扫描→分类→推断」模式
- 新增文件发现策略：扫描项目所有文件，按 30+ 种文件名模式自动分类
- 新增项目结构推断：自动识别前后端分离（2/3 层）、monorepo、单项目
- 扩展文件覆盖：.csproj、composer.json、vite/next/nuxt/svelte/webpack/tailwind 配置、.env.example、Makefile、nginx.conf 等

**Step 1.2 智能依赖分类**：从「~35 条固定映射表」改为「三层递进分类引擎」
- 第 1 层：知识库精确匹配（快速通道，置信度 exact）
- 第 2 层：命名模式启发推断（31 种模式覆盖 100+ 依赖关键词，置信度 heuristic）
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
