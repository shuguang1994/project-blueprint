# Step 1：自主发现引擎

> `SKILL.md` Step 1 的完整实现细节，由 SKILL.md 的「Step 索引与按需加载」表按需加载。
> 关联：references/knowledge-base.md

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
| `*.tf` / `*.tfvars` | Terraform 配置 | provider / backend 声明, resource 类型, variables → IaC 推断 |
| `Chart.yaml` / `values.yaml`（含 `templates/`） | Helm Chart | chart 元信息, 依赖列表, 可配置 values → K8s 部署方式 |
| `kustomization.yaml` / `deployment.yaml` | Kubernetes manifest | 资源类型, 镜像, namespace / overlay 结构 |
| `pubspec.yaml` | Flutter(Dart) 项目清单 | dependencies, flutter 段, Dart SDK 约束 → 移动端框架确认 |
| `*.xcodeproj` / `Package.swift` | Swift / SwiftUI 项目 | Swift 版本, SPM 依赖, target 平台 |
| `build.gradle.kts`（含 `org.jetbrains.kotlin.plugin.compose`）/ `settings.gradle.kts` | Kotlin / Compose 项目 | Compose 编译器插件, Kotlin 版本, 模块划分 |
| `dbt_project.yml` | dbt 项目 | profile, models 目录, materialization 默认值 |
| `airflow.cfg` / `dags/` | Airflow | executor, `dags_folder`, 调度配置 |

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
| `docker` / `pm2` / `nginx` / `caddy` / `k8s` / `kubernetes` / `helm` / `kustomize` | deploy | 部署/运维（含 Helm / K8s manifest 装配） |
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
| `langchain` / `llamaindex` / `llama-index` / `openai` / `anthropic` / `transformers` / `ollama` / `vllm` | ai | AI/LLM 栈（编排 / 模型 / 本地推理服务） |
| `pgvector` / `milvus` / `qdrant` / `chroma` / `weaviate` | ai | 向量数据库（归入 ai 维度，对应知识库章节「AI/LLM 栈」） |
| `terraform` / `pulumi` / `cdk` | iac | 基础设施即代码（对应知识库章节「IaC 与云原生」） |
| `opentelemetry` / `otel` / `sentry` / `prometheus` / `grafana` | observability | 可观测性：追踪 / 错误 / 指标（对应知识库章节「可观测性」） |
| `dbt` / `airflow` / `spark` / `flink` | data | 数据工程与工作流调度（对应知识库章节「数据工程」） |
| `flutter` / `dart` / `swiftui` / `compose` / `kotlin` | mobile | 原生 / 跨端移动端（对应知识库章节「原生移动」） |

> **任何模式都不匹配**：直接进入第 3 层联网搜索。搜索结果同时用于判断是否需要将新条目补充到 knowledge-base.md。

> **维度命名说明**：本表维度名为**推断维度**（分类标签，粒度较细，如 `build` / `deploy` / `logging`）。落库检索时映射到 `references/knowledge-base.md` 的 `##` 维度章节（16 个，如 `deploy` → `deployment`）；对照表见 `references/step-2-assembly.md` 2.1「维度命名说明」。

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

### 1.4 多子项目（混合项目）处理

若同时存在多种语言的构建文件或多子项目结构，探测阶段**只产出「子项目清单」，不决定写几份 AGENTS.md**。清单每个条目含三项字段：

- **子项目路径**：该包所在目录（如 `<子项目名>/`）
- **构建/清单文件**：该包内的构建/清单文件（Step 1.1 识别到的构建/清单类，如 `package.json` / `go.mod`）
- **该包技术栈**：该包各自跑一遍 1.2 三层分类的结果

规则：
- **每个子项目独立探测**：各自的 package.json/go.mod 分别跑一遍 1.2 三层分类
- 共享组件（如根目录的 .eslintrc、docker-compose.yml）提升到顶层
- **写 1 份还是「1 + N」份 AGENTS.md 由 Step 2 决定**：Step 2 按 `references/monorepo-agents.md` 的判定条件装配（子项目清单 ≥2 个 → 根 + N 包嵌套模式；仅 1 个 → 走单文件路径）
- 单项目（仅 1 个构建/清单文件）**不启用嵌套模式**，行为与 v1.8.0 一致
