---
name: project-blueprint
description: 为新项目快速建立完整 AI 编程规范体系（AGENTS.md、文档目录、CI/CD、Git规范、测试框架）。自适应探测 7 语言 14 框架 61 组件，未知栈联网回退。Establish AI coding conventions for new projects — adaptive tech stack detection, AGENTS.md generation, CI/CD setup, testing infrastructure. Use when user says "init project" "setup conventions" "bootstrap project" "AGENTS.md template".
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

## Step 1：自适应探测引擎

### 1.1 多文件并行探测

读取以下所有存在的文件（不存在则跳过）：

| 文件 | 提取信息 | 推断规则 |
|------|---------|---------|
| `package.json` | dependencies/devDependencies/scripts | 按 dep key 匹配框架/ORM/CSS/测试 |
| `tsconfig.json` | strict / paths / target | strictMode, pathAliases |
| `go.mod` | module / go version / require | Go 版本 + 框架(gin/echo/fiber/chi) |
| `requirements.txt` / `pyproject.toml` | 依赖列表 | fastapi/flask/django/sqlalchemy |
| `pom.xml` / `build.gradle` | dependencies | spring-boot/jpa/lombok |
| `Cargo.toml` | [dependencies] | actix-web/rocket/tokio |
| `Gemfile` | gem 列表 | rails/sinatra |
| `docker-compose.yml` | services | 数据库/缓存/消息队列 |
| `git remote -v` | remote url | github.com / gitee.com |
| `.eslintrc*` / `.prettierrc*` | lint 配置 | ESLint/Prettier/Biome 存在性 |

### 1.2 依赖 → 组件推断规则表

从 package.json 的 dependencies + devDependencies 中匹配：

| 关键词 | 推断组件 | 维度 |
|--------|---------|------|
| `next` | Next.js | framework |
| `react` | React | framework |
| `vue` | Vue 3 | framework |
| `@nestjs/core` | NestJS | framework |
| `express` | Express | framework |
| `fastify` | Fastify | framework |
| `svelte` | SvelteKit | framework |
| `nuxt` | Nuxt 3 | framework |
| `@prisma/client` | Prisma | orm |
| `typeorm` | TypeORM | orm |
| `drizzle-orm` | Drizzle | orm |
| `sequelize` | Sequelize | orm |
| `tailwindcss` | Tailwind CSS | css |
| `styled-components` | styled-components | css |
| `sass` / `node-sass` | SCSS | css |
| `jest` | Jest | testing |
| `vitest` | Vitest | testing |
| `@playwright/test` | Playwright | testing |
| `eslint` | ESLint | lint |
| `prettier` | Prettier | lint |
| `@biomejs/biome` | Biome | lint |
| `pinia` | Pinia | state |
| `zustand` | Zustand | state |
| `@tanstack/react-query` | TanStack Query | state |

> Go/Python/Java 框架按 go.mod/requirements.txt/pom.xml 中的依赖名直接匹配。

### 1.3 输出结构化探测结果

```
探测结果：
- 语言: TypeScript
- 运行时: Node.js 20
- 框架: Next.js 14
- ORM: Prisma
- CSS: Tailwind CSS
- 测试: Vitest
- Lint: ESLint + Prettier
- 状态管理: Zustand
- 包管理器: pnpm
- 远程仓库: GitHub
- strictMode: true
- 数据库: PostgreSQL（从 docker-compose.yml 或 prisma schema 推断）
```

### 1.4 混合项目处理

若同时存在 `package.json` + `go.mod`（前后端分离）：
- 分两块输出: `frontend: { ... }` + `backend: { ... }`
- 优先为后端生成完整规范，前端标记为"待补充"

---

## Step 2：规则引擎拼接

### 2.0 读取知识库

**首先读取** `references/knowledge-base.md` 全文，理解其组件条目的格式：
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
对每个组件（framework/orm/css/testing/lint/state）:
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

**触发条件**: knowledge-base.md 中无对应组件条目时。

**搜索策略**（`{currentYear}` 必须取系统当前真实年份，禁止硬编码）:

| 未知维度 | 搜索模板 |
|----------|---------|
| 未知框架 | `"{framework}" AGENTS.md commands conventions best practices {currentYear}` |
| 未知 ORM | `"{orm}" setup migration naming conventions {currentYear}` |
| 未知测试框架 | `"{testing}" test commands CI GitHub Actions {currentYear}` |
| 未知构建工具 | `"{tool}" build dev commands CI pipeline {currentYear}` |

**提取规则**: 从搜索结果中提取 dev/build/test 命令写入 Commands，规范要点写入 Conventions。

**兜底**: 所有探测和联网均失败时，使用 `references/agents-md-template.md` 生成最小化 AGENTS.md。

### 2.3 禁止做的事
- ❌ 不写本项目特定信息（IP、人名、公司名）— 用占位符
- ❌ AGENTS.md 不超过 200 行 — 超限拆分到 docs/
- ❌ 不使用任何固定预设 — 始终从 knowledge-base 实时拼接

---

## Step 3：建立 docs/ 目录骨架 + .trae/specs/

### 3.1 docs/ 目录结构
```
docs/
├── A/  (项目基准文档)
│   ├── A-01-PRD.md              "产品需求文档 / PRD（待填写）"
│   ├── A-02-技术架构.md          "技术架构说明 / Architecture（待填写）"
│   ├── A-03-数据库设计.md         "数据库设计 / Database Design（待填写）"
│   └── A-04-API接口.md          "API 接口文档 / API Docs（待填写）"
├── B/  (开发运维文档)
│   ├── B-01-开发规范.md          "开发规范 / Dev Standards（AGENTS.md 为权威源）"
│   ├── B-02-部署指南.md          "部署操作指南 / Deployment Guide"
│   ├── B-03-测试指南.md          "测试策略与命令 / Testing Guide"
│   └── B-04-BUG知识库.md        "Bug 记录与修复 / Bug Knowledge Base"
├── C/  (知识沉淀文档)
│   ├── C-01-CodeWiki首页.md     "代码层知识库 / Code Wiki"
│   ├── C-02-后端架构详解.md      "后端架构 / Backend Architecture"
│   └── C-03-项目长期记忆.md      "项目长期记忆 / Project Memory"
├── D/  (方案设计文档)
│   └── D-01-系统运维方案.md      "运维方案 / Operations Plan"
├── E/  (分析优化文档)
│   └── E-01-代码耦合度分析.md    "代码质量分析 / Code Quality Analysis"
├── archive/                      "已归档 / Archived"
└── dev/                          "开发中 / In Development"
```

### 3.2 .trae/specs/ 目录（Spec-Driven 开发基础设施）
```
.trae/specs/
└── README.md   # 说明 spec.md + tasks.md + checklist.md 三件套格式
```

> 如果使用的 IDE 是 Cursor，创建 `.cursor/specs/` 目录替代 `.trae/specs/`。
> 如果 IDE 不支持 specs 目录，跳过此步。

### 生成规则
- 每个占位 .md 文件只有一行标题 + "(待填写 / TBD)" 占位
- 分类目录下放 README.md 说明用途
- 如果 docs/ 已存在 → 只补充缺失的目录
- 文件名保持中英双语标注，方便国际化项目

### 详细参考
见 `references/docs-skeleton.md`

---

## Step 4：配置 Git 规范

### .gitignore（如果没有则创建）
参考 `references/gitignore-template.md`，按语言选择对应规则。

### 初始化 Git
```bash
git init  # 如果还没初始化
git add -A
git commit -m "chore: 初始化项目规范体系 — AGENTS.md + docs/ + CI"
git checkout -b develop
```

---

## Step 5：配置 CI/CD

### 从知识库获取 CI job

按探测到的语言，从 `references/knowledge-base.md` 中提取对应**语言层**和**测试层**的 CI job 片段，合并为完整 workflow 文件。

参考模板见 `references/ci-template.yml`（含 TS/Go/Python/Vue 四种完整 workflow）。

### 规则
- 不依赖外部服务（DB/Redis/MQ）
- 如果远程仓库是 Gitee → 创建 `.gitee-ci.yml`
- 如果远程仓库是 GitHub → 创建 `.github/workflows/ci.yml`
- 如果 CI 目录/文件已存在 → 跳过，不覆盖

---

## Step 6：建立测试基础设施

### 安装测试框架（仅当 package.json 中无测试依赖时）

- TypeScript/NestJS: `npm install --save-dev jest ts-jest @types/jest @nestjs/testing`
- Vue/React: `npm install --save-dev vitest @vue/test-utils` / `@testing-library/react`
- Go: 无需安装（内置 testing）
- Python: `pip install pytest`

### 创建示例测试

在 `src/` 或 `__tests__/` 中创建一个简单测试：
```typescript
describe('Initial test', () => {
  it('项目测试基础设施已就绪', () => {
    expect(true).toBe(true);
  });
});
```

### 在 AGENTS.md 中添加测试命令
```bash
npm run test              # 运行所有测试
npm run test -- path.ts   # 单文件测试
npm run test:cov          # 覆盖率
```

### 配置 pre-commit hook（需用户确认后执行）

前提：项目根已有 `package.json`。若无，先 `npm init -y`。
```bash
npm install --save-dev husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

在 `package.json` 中添加:
```json
"lint-staged": {
  "*.{ts,js}": ["npx prettier --check"]
}
```

---

## 输出验收清单

所有步骤完成后，向用户报告：

```
✅ 项目规范体系搭建完成，生成文件：
- AGENTS.md (xxx 行)
- docs/ (A/B/C/D/E 5 个分类目录 + archive + dev)
- .trae/specs/ (spec-driven 开发基础设施)
- .github/workflows/ci.yml (或 .gitee-ci.yml)
- .gitignore (如果之前没有)
- __tests__/example.spec.ts (示例测试)
- CLAUDE.md / .cursor/rules/project.mdc (vendor breadcrumbs)
- .husky/pre-commit (如果安装同意)

下一步建议：
1. 填写 docs/A/A-01-PRD.md 项目需求
2. 根据实际项目完善 AGENTS.md 中的项目身份信息
3. 运行 npm run test 验证测试基础设施
4. git push origin develop 推送初始框架
```
