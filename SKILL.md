---
name: project-blueprint
description: 为新项目快速建立完整 AI 编程规范体系（AGENTS.md、文档目录、CI/CD、Git规范、测试制度）。自主发现引擎：扫描项目→分类文件→推断技术栈，覆盖 8 语言 15 框架 70+ 组件，未知栈三层递进联网回退。Establish AI coding conventions for new projects — autonomous discovery engine with heuristic dep classification, 8 languages 15 frameworks 70+ components, web search fallback for unknowns.
author: 曙光 (shuguang1994)
license: MIT
---

# Project Blueprint — AI 编程规范体系搭建 Skill

> 跨项目可复用的 6 步规范体系搭建流程。新项目一句话触发，15+ 文件自动生成。

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

## Step 1：自主发现引擎

> 不预设"有哪些文件要检查"。扫描项目实际有什么，从中自主推断技术栈。

### 1.0 读取已有项目文档（增量模式）

**首先检查**项目是否已有文档，从中提取信息而非从零猜测：

| 已有文件 | 提取内容 | 用途 |
|---------|---------|------|
| `README.md` | 项目描述、技术栈关键词 | 填充 AGENTS.md 项目身份 |
| `CONTRIBUTING.md` / `B-01-开发规范.md` | 已有编码规范 | 合并到 AGENTS.md 规范章节 |
| 已有 `AGENTS.md` / `CLAUDE.md` | 全部已有规则 | **保留→补充缺失**（不覆盖） |
| `docs/` 已有文件 | 已完成文档列表 | 跳过已有，只补充缺失 |
| `git log --oneline -20` | commit 风格（conventional / 自由格式） | 推断提交格式 |

> 原则：已有项目接入时做**增量补充**，不推翻重来。
> 
> **质量判断标准**：AGENTS.md 包含以下 4 个核心章节视为"质量良好"→ 仅做缺失检查，不覆盖：
> - 项目身份（技术栈/部署信息）
> - 常用命令
> - 强制规范（模块封装/安全/性能/日志）
> - Git 规范
> 
> **质量良好时**：输出 `AGENTS.md 已完善，跳过生成。检查到以下可补充项：{缺失列表}`，让用户决定是否补充。
> **仅 1-3 个章节缺失时**：补充缺失部分，保留已有内容。
> **完全没有或质量差时**：完整生成。

### 1.1 自主文件发现（扫描 → 分类 → 推断）

> **不预设文件列表**。扫描项目根目录和一级子目录，发现所有构建/配置/清单文件后按类别推断技术栈。

**发现策略**：
```
Step A: 扫描项目根目录 + 一级子目录的所有文件（跳过 node_modules/dist/.git）
Step B: 按文件名模式分类
Step C: 对分类结果逐项提取信息
```

**文件名模式 → 类别映射**（用于分类，不用于限制扫描范围）：

| 文件名模式 | 类别 | 提取什么 |
|-----------|------|---------|
| `package.json` | JS/TS 项目清单 | dependencies, devDependencies, scripts → 转入 1.2 依赖分类 |
| `*/package.json`（子目录） | 子项目清单 | 同上，标记为多子项目结构 |
| `go.mod` | Go 项目清单 | module 名, Go 版本, require 列表 |
| `requirements*.txt` | Python 依赖 | 依赖名列表 |
| `pyproject.toml` | Python 项目配置 | [project] dependencies, [tool.*] |
| `pom.xml` / `build.gradle*` | Java 项目清单 | dependencies, plugins |
| `Cargo.toml` | Rust 项目清单 | [dependencies] |
| `Gemfile` | Ruby 项目清单 | gem 列表 |
| `composer.json` | PHP 项目清单 | require, require-dev |
| `*.csproj` / `*.fsproj` | .NET 项目清单 | PackageReference |
| `tsconfig.json` / `jsconfig.json` | TS/JS 编译配置 | strict, paths, target |
| `vite.config.*` | Vite 构建配置 | 插件列表 → 框架推断 |
| `next.config.*` | Next.js 配置 | 框架确认 |
| `nuxt.config.*` | Nuxt 配置 | 框架确认 |
| `svelte.config.*` | Svelte 配置 | 框架确认 |
| `webpack.config.*` | Webpack 配置 | 构建工具 |
| `tailwind.config.*` | Tailwind 配置 | CSS 框架确认 |
| `.eslintrc*` / `eslint.config.*` | ESLint 配置 | Lint 工具 |
| `.prettierrc*` | Prettier 配置 | 格式化工具 |
| `biome.json` | Biome 配置 | Lint+格式 |
| `manifest.json` + `pages.json` | uni-app 项目 | 跨端框架确认 |
| `app.json` / `project.config.json` | 微信小程序/Taro | 小程序框架 |
| `docker-compose.yml` / `docker-compose.yaml` | Docker 编排 | services(数据库/缓存/MQ) |
| `Dockerfile` | Docker 镜像 | 基础镜像 → 运行时推断 |
| `ecosystem.config.js` / `pm2.json` | PM2 配置 | 进程守护部署 |
| `.env.example` / `.env.template` | 环境变量模板 | 所需服务（DB_HOST/REDIS_URL 等） |
| `Makefile` / `justfile` | 任务脚本 | 常用命令 |
| `.github/workflows/*.yml` | GitHub Actions | CI 流程 → 语言/框架确认 |
| `.gitlab-ci.yml` | GitLab CI | CI 流程 |
| `nginx.conf` / `nginx/` | Nginx 配置 | 反向代理/静态部署 |

> **不在上表中的文件**：按扩展名和内容关键词推断用途。仍无法确定 → 记录文件名，报告中列出"未识别文件"供用户确认。

**项目结构推断**（按子目录模式）：
```
检测到多个 */package.json / */go.mod 等构建文件在子目录中
  ↓
server/ + admin/ + client/ → 前后端分离（3 层）
server/ + web/              → 前后端分离（2 层）
packages/*/ + pnpm-workspace.yaml → monorepo
apps/*/ + packages/*/       → turborepo/nx monorepo
src/ 单个                    → 单项目
```

### 1.2 智能依赖分类（三层递进）

> **不使用固定映射表**。从实际依赖出发，逐层推断类别和组件身份。

**三层分类流程**：
```
扫描到的所有依赖（来自 package.json/go.mod/requirements.txt 等）
    ↓
第 1 层 — 知识库精确匹配
  在 references/knowledge-base.md 中搜索依赖名
  命中 → 提取 Commands/Conventions/CI（快速通道）
    ↓
第 2 层 — 命名模式启发推断
  未命中 → 按依赖名关键词推断类别和用途
  见下方「命名模式 → 维度推断」规则
    ↓
第 3 层 — 联网搜索
  仍无法分类 → WebSearch "{depName} npm package what is it"（JS）
          或 WebSearch "{depName} {language} package purpose"
  从搜索结果提取：类别、用途、是否有对应知识库条目可补充
    ↓
输出: { depName → 维度: 组件名, 置信度: exact|heuristic|web }
```

**命名模式 → 维度推断规则**（第 2 层启发式）：

| 依赖名包含 | 推断维度 | 推断逻辑 |
|-----------|---------|---------|
| `react` / `vue` / `angular` / `svelte` / `solid` | framework | 前端框架 |
| `next` / `nuxt` / `sveltekit` / `remix` / `astro` | framework | 元框架 |
| `express` / `koa` / `fastify` / `hono` / `nestjs` | framework | Node 服务端框架 |
| `gin` / `echo` / `fiber` / `chi` / `beego` | framework | Go Web 框架 |
| `prisma` / `typeorm` / `sequelize` / `drizzle` / `knex` / `mikro` | orm | ORM |
| `gorm` / `sqlx` / `sqlc` / `ent` | orm | Go ORM/数据访问 |
| `sqlalchemy` / `peewee` / `tortoise` | orm | Python ORM |
| `tailwind` / `unocss` / `windicss` | css | 原子化 CSS |
| `sass` / `less` / `stylus` | css | CSS 预处理器 |
| `styled` / `emotion` / `panda` / `vanilla-extract` | css | CSS-in-JS |
| `-ui` / `-vue` / `design` / `antd` / `element` / `naive` / `arco` / `tdesign` / `vant` / `mui` / `shadcn` / `radix` / `chakra` / `mantine` | ui | UI 组件库 |
| `jest` / `vitest` / `mocha` / `pytest` / `junit` / `testng` | testing | 测试框架 |
| `playwright` / `cypress` / `selenium` / `puppeteer` | testing | E2E 测试 |
| `eslint` / `prettier` / `biome` / `oxlint` / `dprint` | lint | Lint/格式化 |
| `pinia` / `zustand` / `redux` / `mobx` / `jotai` / `recoil` / `valtio` | state | 状态管理 |
| `tanstack` / `react-query` / `swr` / `apollo` | state | 数据获取/缓存 |
| `webpack` / `vite` / `rollup` / `esbuild` / `turbopack` / `rsbuild` | build | 构建工具 |
| `docker` / `pm2` / `nginx` / `caddy` / `k8s` / `helm` | deploy | 部署/运维 |
| `mysql` / `postgres` / `mongodb` / `redis` / `sqlite` | database | 数据库 |
| `winston` / `pino` / `bunyan` / `log4js` / `zap` / `logrus` | logging | 日志库 |
| `passport` / `jwt` / `oauth` / `auth` / `keycloak` / `clerk` / `auth0` | auth | 认证 |
| `swagger` / `openapi` | docs | API 文档 |
| `graphql` / `apollo` | api | GraphQL |
| `grpc` / `protobuf` | api | gRPC |
| `bull` / `bee` / `kafka` / `rabbitmq` / `amqp` | queue | 消息队列 |
| `i18n` / `intl` / `locale` / `lingui` | i18n | 国际化 |
| `axios` / `fetch` / `got` / `ky` / `undici` | http | HTTP 客户端 |
| `sharp` / `jimp` / `gm` / `imagemagick` | media | 图像处理 |
| `nodemailer` / `sendgrid` / `mailgun` | email | 邮件 |

> **任何模式都不匹配**：直接进入第 3 层联网搜索。搜索结果同时用于判断是否需要将新条目补充到 knowledge-base.md。

**输出格式**：
```
依赖分类结果：
  @nestjs/core     → framework: NestJS        (exact match)
  typeorm           → orm: TypeORM             (exact match)
  ant-design-vue    → ui: Ant Design Vue       (exact match)
  winston           → logging                  (heuristic)
  @vben/request     → http                     (heuristic)
  better-sqlite3    → database: SQLite         (heuristic)
  mammoth           → media: docx parser       (web search)
  @shadcn/ui        → ui: shadcn/ui            (heuristic)
```

### 1.3 输出结构化探测结果

```
=== 项目结构 ===
类型: 前后端分离（3 层: server + admin + client）| monorepo | 单项目
远程仓库: GitHub | Gitee | GitLab

=== 各子项目技术栈 ===
[server]:
  语言: TypeScript
  运行时: Node.js 20
  框架: NestJS
  ORM: TypeORM
  数据库: MySQL
  测试: Jest
  Lint: ESLint + Prettier
  包管理: pnpm
  部署: PM2 + Docker

[admin]:
  语言: TypeScript
  框架: Vue 3 + Vite
  UI 库: Ant Design Vue
  状态管理: Pinia
  包管理: pnpm

[client/app]:
  框架: uni-app (Vue 3)
  状态管理: Pinia
  包管理: pnpm

=== 分类置信度 ===
  exact: 12   (知识库精确匹配)
  heuristic: 8  (命名模式推断)
  web: 1      (联网搜索确认)
```

### 1.4 混合项目处理

若同时存在多种语言的构建文件或多子项目结构：
- 分块输出: `server: { ... }` + `admin: { ... }` + `client: { ... }`
- **每个子项目独立探测**：各自的 package.json/go.mod 分别跑一遍 1.2 三层分类
- 共享组件（如根目录的 .eslintrc、docker-compose.yml）提升到顶层

---

## Step 2：规则引擎拼接

### 2.0 读取知识库

**按探测到的组件名**在 `references/knowledge-base.md` 中搜索对应条目（不读全文，按 `## [组件名]` 定位）:
```
## [组件名]
**Commands**: 精确可执行命令
**Conventions**: ❌/✅ 规范要点
**CI job**: GitHub Actions yaml 片段
```

之后的拼接步骤全部基于此知识库。

### 2.1 主流程

```
Step 1 探测结果
    ↓
对每个组件（language/framework/orm/css/ui/testing/lint/state/package_manager/deployment/database）:
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
  [CI 模板] ← 从各组件的 CI job 段合并
  [Git 规范] ← knowledge-base 通用段落
  [代码审查清单] ← knowledge-base 通用段落
    ↓
生成 vendor breadcrumbs（按探测到的远程仓库和 IDE 生态自适应）:
  CLAUDE.md → @AGENTS.md
  .cursor/rules/project.mdc → alwaysApply: true + @AGENTS.md
  若远程为 GitHub → .github/copilot-instructions.md
  若存在 .gemini/ 目录 → .gemini/GEMINI.md → @AGENTS.md
  若存在 .windsurfrules → 追加 "See AGENTS.md for project conventions"
```

### 2.2 联网回退

**触发条件**: knowledge-base.md 中无对应组件条目时（覆盖全部 10 个维度）。

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

**提取规则**: 从搜索结果中提取 dev/build/test 命令写入 Commands，规范要点（✅/❌）写入 Conventions，CI 配置片段写入 CI job。

**兜底**: 所有探测和联网均失败时，使用 `references/agents-md-template.md` 生成最小化 AGENTS.md。

### 2.3 禁止做的事
- ❌ 不写本项目特定信息（IP、人名、公司名）— 用占位符
- ❌ 不使用任何固定预设 — 始终从 knowledge-base 实时拼接
- ✅ AGENTS.md 遵循架构原则控制规模：**高内聚低耦合** / 模块职责单一 / 组合优于继承 / 避免全局状态 / 纯函数优先 / 复用已有代码避免重复造轮子

---

## Step 3：建立自适应文档体系

> 不使用固定目录结构。根据项目实际框架、技术栈、业务类型动态生成。

### 3.0 推断项目业务类型

> **不预设固定类型**。从项目结构+依赖+README 描述启发式推断，无法确定时联网搜索。

**三层推断流程**：
```
Step 1 探测结果 + README.md 描述 + 目录结构
    ↓
第 1 层 — 结构特征匹配（精确）
  按下方「特征 → 业务类型」表匹配
    ↓
第 2 层 — 依赖/配置启发推断
  结构不明确时，按 package.json/go.mod 中的特定字段推断
  见下方「配置特征 → 业务类型」表
    ↓
第 3 层 — 联网搜索
  仍无法确定 → WebSearch 推断
```

**第 1 层：结构特征 → 业务类型**

| 特征 | 推断类型 | 文档侧重点 |
|------|---------|----------|
| 存在 `src/controllers/` / `src/modules/` / `src/services/` 且无 pages/app | 后端 API 服务 | API 文档、数据库设计、部署运维 |
| 探测到 NestJS/Express/FastAPI/Gin/Django/Spring Boot 等后端框架 | 同上 | 同上 |
| 存在 ORM 配置 + Model/Entity 定义 | 同上 | 同上 |
| 存在 `pages/` / `app/` + `components/` | 前端应用 | UI 规范、组件库、路由设计 |
| 存在 `docker-compose.yml` + 3+ 服务 | 微服务架构 | 服务间通信、服务注册、配置管理 |
| `package.json` description 含 `后台/管理/admin` | 管理后台 | 权限、数据看板、批量操作 |
| 存在 `mobile/` / `ios/` / `android/` / `uni-app` | 移动端应用 | 蓝牙、推送、离线、多端适配 |
| 同时匹配后端 + 前端特征 | 全栈项目 | 前后端分块 + 全栈部署文档 |

**第 2 层：配置特征 → 业务类型**（结构不明确时使用）

| 配置特征 | 推断类型 | 判断依据 |
|---------|---------|---------|
| `package.json` 有 `"bin"` 字段 | CLI 工具 | 可执行命令入口 |
| `package.json` 有 `"main"`/`"module"` 且无 `"scripts"."dev"` | 库/SDK | 发布入口 + 无开发服务器 |
| `go.mod` 的 module 路径无 `/cmd/` 子目录 | Go 库 | 纯库，无可执行入口 |
| `pyproject.toml` 有 `[project.scripts]` | Python CLI | 命令行入口点 |
| `Cargo.toml` 含 `[lib]` 无 `[[bin]]` | Rust 库 | 纯库项目 |
| `electron`/`tauri`/`nwjs` 在依赖中 | 桌面应用 | 桌面壳框架 |
| `package.json` 含 `"@tauri-apps/cli"` | 桌面应用 (Tauri) | Tauri 构建工具 |
| `astro`/`vitepress`/`docusaurus`/`docsify` 在依赖中 | 静态文档站点 | 文档生成器 |
| `hugo`/`jekyll`/`hexo` 配置 | 静态内容站点 | 静态站点生成器 |
| 以上都不匹配 | 通用项目 | → 第 3 层联网搜索 |

**第 3 层：联网搜索**
```
WebSearch "{项目名或README首句} project type classification best practices {currentYear}"
→ 从搜索结果提取最接近的业务类型
→ 仍无法确定 → 标记为"通用项目"，询问用户
```

> **多类型匹配时**（如既是后端又是 CLI）：优先选择更具体的类型。优先级：全栈 > 微服务 > 桌面 > 移动端 > 管理后台 > CLI > 后端 > 前端 > 库 > 静态站点 > 通用。

### 3.1 自适应 docs/ 结构

按业务类型生成对应文档（A/B/C/D/E 分类框架保留，内部文件按需增减）：

```
docs/
├── A/  (项目基准 — 按业务类型选文件)
│   ├── [必选] A-01-PRD.md              "产品需求文档 / PRD"
│   ├── [按需] A-02-技术架构.md          "后端服务 / API 服务 / 微服务架构"
│   ├── [按需] A-03-数据库设计.md         "有数据库时创建"
│   ├── [按需] A-04-前端架构.md           "前端项目时创建"
│   └── [按需] A-05-移动端架构.md         "移动端项目时创建"
├── B/  (开发运维 — 始终全量)
│   ├── B-01-开发规范.md / B-02-部署指南.md / B-03-测试指南.md / B-04-BUG知识库.md
├── C/  (知识沉淀 — 始终全量)
│   ├── C-01-CodeWiki首页.md / C-02-架构详解.md / C-03-项目长期记忆.md
├── D/  (方案设计 — 按需)
│   └── D-01-系统运维方案.md              "有后端/部署需求时创建"
├── E/  (分析优化 — 按需)
│   └── E-01-代码耦合度分析.md            "多模块项目时创建"
├── archive/ / dev/
```

### 3.2 自适应模块速查表（含联网回退）

生成 AGENTS.md 模块表时，**读取实际目录结构**而非使用固定模板。对每个无法确定的模块，启动联网搜索。

**推断流程（按优先级）**：
```
Step 1: 列出 src/ 或 app/ 下的一级子目录
    ↓
Step 2: 对每个子目录，读取内部文件列表（前 10 个文件）
    ↓
Step 3: 按目录名 + 文件名模式推断模块职责
    匹配已知模式（controller/service/model → API模块；handlers/verifiers → 策略模块等）
    见 references/knowledge-base.md § 模块速查表生成规则
    ↓
Step 4: 无法匹配已知模式 → 联网搜索
    WebSearch "{directory_name} module in {framework} project typical responsibilities {currentYear}"
    从搜索结果提取职责描述
    ↓
Step 5: 联网也无法确定 → 标记 "待补充，建议：{搜索结果摘要}"
    提示用户完善
    ↓
写入 AGENTS.md 模块速查表
```

**联网搜索模板（按场景）**：

| 场景 | 搜索模板 |
|------|---------|
| 陌生目录名 | `"{dirName}" module responsibility in {framework} project` |
| 陌生文件模式 | `"{filePattern}" pattern in {language} {framework} project best practices` |
| 多模块架构 | `"{framework}" project module organization best practices {currentYear}` |
| 业务术语目录 | `"{dirName}" in "{businessDomain}" software architecture` |

> 示例：探测到 `src/cqrs/` 目录，knowledge-base 无匹配 → WebSearch `"cqrs module NestJS project typical responsibilities 2026"` → 提取到 "命令查询职责分离，含 commands/ queries/ handlers/" → 写入模块表 "cqrs | CQRS 命令查询分离"

### 3.3 .trae/specs/ 目录（同前）
```
mkdir -p .trae/specs/
.trae/specs/
└── README.md   # 说明 spec.md + tasks.md + checklist.md 三件套格式
```
> 如果 IDE 是 Cursor → `.cursor/specs/`。不支持 specs 则跳过。

### 生成规则
- 占位文件只一行标题 + "(待填写 / TBD)"
- 每个分类目录下创建 README.md 维护指令：
  - `docs/A/README.md`: "基准文档。架构变更时同步更新。"
  - `docs/B/README.md`: "运维文档。流程变更时同步，每次部署后检查。"
  - `docs/C/README.md`: "知识沉淀。每次重大决策或修复典型 Bug 后更新。"
  - `docs/D/README.md`: "方案设计。新方案确定后补充。"
  - `docs/E/README.md`: "分析优化。定期审计时更新。"
- docs/ 已存在 → 只补缺失
- 文件名中英双语

### 详细参考
见 `references/docs-skeleton.md`

---

## Step 4：配置 Git 规范

### .gitignore（如果没有则创建）
参考 `references/gitignore-template.md`，按语言选择对应规则。

### 初始化 Git
```bash
git init  # 如果还没初始化
git add .  # 受 .gitignore 保护，不会添加敏感文件
git diff --cached --quiet || git commit -m "chore: 初始化项目规范体系 — AGENTS.md + docs/ + CI"
git checkout -b develop 2>/dev/null || git checkout develop  # 已有 develop 分支则直接切换
```

### 分支策略文档

在 AGENTS.md 中添加：
```
分支: master(生产) / develop(日常) / feat/xxx(功能) / fix/xxx(修复)
提交格式: <type>(<scope>): <description>
type: feat/fix/refactor/docs/test/chore/perf
```

---

## Step 5：配置 CI/CD

### 从知识库获取 CI job

按探测到的语言，从 `references/knowledge-base.md` 中提取对应**语言层**和**测试层**的 CI job 片段，合并为完整 workflow 文件。

参考模板见 `references/ci-template.yml`（含 TS/Go/Python/Vue 四种完整 workflow）。

### 规则
- 不依赖外部服务（DB/Redis/MQ）
- 如果远程仓库是 Gitee → 创建 `.gitee-ci.yml`（语法与 GitHub Actions 不同，参考 [Gitee Go 文档](https://gitee.com/help/articles/4280)）
- 如果远程仓库是 GitHub → 创建 `.github/workflows/ci.yml`
- **其他平台**（GitLab/Bitbucket/Codeberg 等）→ WebSearch `"{platform}" CI pipeline {language} {framework} setup {currentYear}"` 获取对应配置格式
- 如果 CI 目录/文件已存在 → 跳过，不覆盖

---

## Step 6：建立测试制度与基础设施

> 项目初期不强制创建测试文件。先建立测试制度，随着开发推进逐步编写测试。

### 6.1 安装测试框架（仅当项目无测试依赖时）

按探测到的语言和框架安装：

- TypeScript/NestJS: `npm install --save-dev jest ts-jest @types/jest @nestjs/testing`
- Vue/React: `npm install --save-dev vitest @vue/test-utils` / `@testing-library/react`
- Go: 无需安装（内置 testing）
- Python: `pip install pytest`
- Java: 内置（JUnit 5，若未引入则 `./gradlew test`）
- Rust: 内置（`cargo test`）
- Ruby: `gem install rspec`

### 6.2 创建测试制度文档 `docs/B/B-03-测试指南.md`

> 不是示例测试文件，是测试制度。内容按技术栈自适应生成，结构如下：

```markdown
# 测试指南

> 项目测试策略与规范。测试随项目成长逐步完善，不接受一次性全覆盖。
> 测试框架: {从 knowledge-base 测试层提取} | 更新: {date}

## 一、测试分层

| 层级 | 范围 | 工具 | 何时编写 |
|------|------|------|---------|
| 单元测试 | 单个函数/方法 | {测试框架名} | 核心业务逻辑稳定后（utils/services） |
| 集成测试 | 模块间交互 | {测试框架名} + {supertest/testcontainers等} | API 端点完成后 |
| E2E 测试 | 完整用户流程 | {Playwright/Cypress等} | 核心用户路径确定后 |

## 二、编写时机（按项目阶段）

| 阶段 | 测试重点 | 不写的 |
|------|---------|--------|
| 原型/MVP | 不强制写测试 | 快速迭代优先 |
| 核心功能稳定 | 关键 Service 单元测试 + API 集成测试 | 工具函数、DTO |
| 用户验收前 | 核心路径 E2E | 边缘场景 |
| 持续迭代 | 修改处补测试、回归测试 | 纯 CRUD 可跳过 |

## 三、{框架名} 测试规范

> 从 `references/knowledge-base.md` 测试层 + 框架层提取。

**命令**:
{从 knowledge-base Commands 段提取}

**规范**:
{从 knowledge-base Conventions 段提取 ✅/❌ 规则}

## 四、测试示例（按需参考，非强制创建）

> 以下为框架特定的测试模式，在需要编写测试时参考。

{按框架类型选择示例模板}
```

### 6.3 框架特定测试示例（自主获取，不创建文件）

> **不预设框架列表**。根据探测到的框架，按以下优先级获取测试模式：

**获取策略**：
```
探测到的框架名
    ↓
第 1 优先: 下方快速参考中有匹配 → 直接使用
第 2 优先: knowledge-base.md 中该框架有测试相关 Conventions → 提取
第 3 优先: WebSearch "{framework} unit test example pattern best practices {currentYear}"
    ↓
将获取的测试模式写入 B-03-测试指南.md「四、测试示例」章节
```

**快速参考**（常见框架，命中即用，不命中走第 2/3 优先）:

- **NestJS**: Service 单元测试（Test.createTestingModule + mock Repository）
- **Next.js / React**: 组件测试（@testing-library/react render + screen）
- **Vue 3**: 组件测试（@vue/test-utils mount + wrapper）
- **Go Gin**: Handler 测试（httptest.NewRequest + gin.CreateTestContext）
- **Python FastAPI**: Endpoint 测试（TestClient + assert status_code）
- **Spring Boot**: Service 测试（@ExtendWith MockitoExtension + @Mock + @InjectMocks）
- **Django**: View 测试（Client + assertContains）
- **Flask**: Route 测试（app.test_client() + assert status_code）
- **Express**: Middleware 测试（supertest + request(app)）
- **Laravel**: Feature 测试（php artisan make:test + assertStatus）
- **Rust (Actix)**: Handler 测试（test::init_service + App::new().route()）
- **Ruby on Rails**: Controller 测试（get :index + assert_response :success）

> 框架不在上述列表：走第 2/3 优先流程。从 knowledge-base 框架层提取测试命令 + 联网获取具体示例代码。

### 6.4 在 AGENTS.md 中添加测试命令

从 knowledge-base 中提取对应**测试层**组件的 Commands，写入 AGENTS.md 二、常用命令。

### 6.5 配置 pre-commit hook（需用户确认后执行，仅 JS/TS 项目）

前提：项目根已有 `package.json`。若无且语言非 JS/TS，跳过此步骤。

```bash
npm install --save-dev husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

在 `package.json` 中添加（按项目语言调整 glob）:
```json
"lint-staged": {
  "*.{ts,js}": ["npx prettier --check"]
}
```

> Go 项目跳过，使用 `golangci-lint`。Python 项目使用 `pre-commit` 框架。

---

## 输出验收清单

所有步骤完成后，向用户报告：

```
✅ 项目规范体系搭建完成，生成文件：
- AGENTS.md (xxx 行)
- docs/ (A/B/C/D/E 5 个分类目录 + archive + dev)，含 B-03-测试指南（测试制度）
- .trae/specs/ (spec-driven 开发基础设施)
- .github/workflows/ci.yml (或 .gitee-ci.yml)
- .gitignore (如果之前没有)
- CLAUDE.md / .cursor/rules/project.mdc (vendor breadcrumbs)
- .husky/pre-commit (如果安装同意)

下一步建议：
1. 填写 docs/A/A-01-PRD.md 项目需求
2. 根据实际项目完善 AGENTS.md 中的项目身份信息
3. 阅读 docs/B/B-03-测试指南.md，核心功能稳定后按制度编写首批测试
4. git push origin develop 推送初始框架
```

---

## Step 7：持续自适应机制

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
- 项目记忆 (project_memory.md) 季度清理
```

### Agent 同步操作指南

详见 `references/project-sync-guide.md`。
