# Project Blueprint 🏗️

> **一句话让任何项目具备 AI 开发能力。**
> One command to make any project AI-agent-ready.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![skills.sh](https://img.shields.io/badge/skills.sh-project--blueprint-orange)](https://skills.sh)

***

## 这是什么？

Project Blueprint 是一个可复用的 AI Agent 技能包，为新项目一键建立完整的开发规范体系。自动生成 AGENTS.md、文档目录骨架、CI/CD 流水线、测试基础设施 — 一句话搞定。

只需说：**"初始化这个项目的开发规范体系"**，Agent 自动执行后续一切。

## 快速安装

```bash
npx skills add shuguang1994/project-blueprint
```

支持的 Agent：Claude Code、Cursor、GitHub Copilot、Codex、Windsurf、Trae、OpenCode 等 27+ 工具。

## 为什么做这个

**痛点**：每个新项目第一天都在搭规范体系 —— AGENTS.md、CI/CD、测试框架、文档目录。全是重复劳动，但没有现成工具能一次性搞定。现有的项目初始化工具只给静态模板，不关注你的具体技术栈、不覆盖 CI、不搭建测试、不支持中文。

**我们的做法**：Project Blueprint 读取你真实的项目文件，自动探测技术栈，从 61 个组件的知识库中实时拼装一套定制化的 AGENTS.md。不是模板，是规则引擎。遇到知识库里没有的技术栈，自动联网搜索最新最佳实践。而且是唯一能一句话生成完整文档骨架（A/B/C/D/E 五级分类）+ CI 流水线 + 测试基础设施的工具。

## 生成内容一览

| 产物                          | 说明                                                          |
| --------------------------- | ----------------------------------------------------------- |
| `AGENTS.md` | 项目规范（架构原则约束：高内聚低耦合 / 组合优于继承 / 避免全局状态 / 纯函数优先 / 复用开源组件避免重复造轮子） |
| `docs/`                     | A/B/C/D/E 五级分类文档骨架                                          |
| `.github/workflows/ci.yml`  | CI 流水线（自动适配技术栈）                                             |
| `.gitignore`                | 精选 gitignore 规则                                             |
| `.husky/pre-commit`         | 提交前 lint 检查                                                 |
| `CLAUDE.md`                 | Claude Code 指向文件                                            |
| `.cursor/rules/project.mdc` | Cursor 指向文件                                                 |
| `__tests__/example.spec.ts` | 示例单元测试                                                      |

## 自适应探测引擎

Project Blueprint 读取你的项目文件自动推断技术栈：

| 文件                          | 推断内容                                   |
| --------------------------- | -------------------------------------- |
| `package.json`              | 语言、框架、ORM、CSS 框架、测试库、Lint 工具、状态管理、包管理器 |
| `go.mod`                    | Go 版本、框架（gin/echo/fiber/chi）           |
| `requirements.txt`          | Python 框架（FastAPI/Flask/Django）        |
| `pom.xml` / `build.gradle`  | Java 框架（Spring Boot）                   |
| `Cargo.toml`                | Rust 依赖                                |
| `docker-compose.yml`        | 数据库、缓存、消息队列                            |
| `tsconfig.json`             | Strict 模式、路径别名                         |
| `.eslintrc` / `.prettierrc` | Lint 配置                                |
| `git remote -v`             | 仓库平台（GitHub/Gitee）                     |

## 61 组件知识库

覆盖 10 层、61 个组件：

| 层级       | 组件                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| **语言**   | TypeScript, JavaScript, Go, Python, Java, Rust, Ruby, PHP                                                               |
| **框架**   | Next.js, NestJS, Vue 3, React, Express, Fastify, FastAPI, Flask, Django, Gin, Spring Boot, Actix-web, SvelteKit, Nuxt 3 |
| **ORM**  | Prisma, TypeORM, Drizzle, Sequelize, GORM, SQLAlchemy, JPA/Hibernate                                                    |
| **CSS**  | Tailwind CSS, CSS Modules, Scoped CSS, Styled Components, SCSS                                                          |
| **测试**   | Vitest, Jest, Pytest, Go testing, JUnit 5, Playwright                                                                   |
| **Lint** | ESLint, Prettier, Biome, Ruff, golangci-lint                                                                            |
| **包管理**  | pnpm, npm/yarn, Poetry, Gradle/Maven, go mod                                                                            |
| **部署**   | PM2, Docker, Vercel, Docker Compose, GitHub Pages                                                                       |

## 联网搜索回退

遇到知识库中没有的技术栈时，自动触发联网搜索获取最新最佳实践：

```
探测到未知栈：Bun JavaScript 运行时
→ 联网搜索："Bun runtime AGENTS.md commands CI best practices 2026"
→ 提取：dev/build/test 命令、CI 配置、代码规范
→ 写入 AGENTS.md
```

所有搜索使用**系统当前年份**（非硬编码），确保结果始终与时俱进。

## 与众不同之处

- **自适应，而非模板** — 读取真实项目文件，不强制套用固定预设
- **联网搜索回退** — 遇到知识库未覆盖的技术栈，实时搜索最新最佳实践
- **全栈覆盖** — AGENTS.md + 文档骨架（A/B/C/D/E）+ CI/CD + 测试 + pre-commit，一句话全搞定
- **原生中文 **— 7 种语言、14 个框架、61 个组件知识库，中文为第一语言

## 工作流程

```
你说："初始化这个项目的开发规范"
    ↓
Step 1: 自动探测技术栈（10 种文件类型）
    ↓
Step 2: 规则引擎从 61 组件知识库拼装 AGENTS.md
    ↓ （未知栈 → WebSearch 回退）
Step 3: 创建 docs/ 文档骨架（A/B/C/D/E 五级分类）
    ↓
Step 4: 配置 Git（.gitignore + 分支策略）
    ↓
Step 5: 配置 CI/CD（语言自适应流水线）
    ↓
Step 6: 搭建测试基础设施
    ↓
完成：15+ 文件生成，项目即刻 AI-Ready
```

## 环境要求

- 支持 SKILL.md 格式的任意 AI 编程 Agent
- Node.js（用于 `npx skills add` 安装方式）

## 贡献

欢迎贡献！可参与的方向：

- 向 `references/knowledge-base.md` 添加更多组件
- 完善技术栈探测规则
- 添加更多 CI 平台模板（GitLab CI、Jenkins 等）
- 翻译到更多语言

## License

MIT — 详见 [LICENSE](LICENSE)。

***

**Author: 曙光 (shuguang1994)**

**Made with ❤️ in China | 始于实战，开源共享**
