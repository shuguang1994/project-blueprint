# Project Blueprint 🏗️

> **一句话让任何项目具备 AI 开发能力。**
> One command to make any project AI-agent-ready.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![skills.sh](https://img.shields.io/badge/skills.sh-project--blueprint-orange)](https://skills.sh)

**标签 (Topics)** ·
[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-blue)](https://github.com/topics/dsh-plugin)
[![deepseek-harness](https://img.shields.io/badge/deepseek--harness-1f6feb)](https://github.com/topics/deepseek-harness)
[![agent-skills](https://img.shields.io/badge/agent--skills-8A2BE2)](https://github.com/topics/agent-skills)
[![claude-code](https://img.shields.io/badge/claude--code-D97757)](https://github.com/topics/claude-code)
[![cursor](https://img.shields.io/badge/cursor-00A67E)](https://github.com/topics/cursor)
[![codex](https://img.shields.io/badge/codex-18181B)](https://github.com/topics/codex)

[English](README.md)

***

## 这是什么？

Project Blueprint 是一个 **AI Agent 技能包**，为新项目一键建立完整的开发规范体系。它不是一个静态模板——它是一个**自主发现引擎**：扫描你的项目文件，智能推断技术栈，从 70+ 组件知识库实时拼装定制化的 AGENTS.md、文档骨架、CI/CD 和测试制度。

只需说：**"初始化这个项目的开发规范体系"**。

## 快速安装

```bash
# 国际（GitHub）
npx skills add shuguang1994/project-blueprint

# 国内（Gitee，无需代理）
npx skills add https://gitee.com/shuguang1994/project-blueprint.git

# 后续更新
npx skills update project-blueprint
```

**DeepSeek Harness (dsh) 插件安装**：

```bash
dsh plugin --profile web add 'github:shuguang1994/project-blueprint'
```

支持的 Agent：Claude Code、Cursor、GitHub Copilot、Codex、Windsurf、Trae、OpenCode、DeepSeek Harness 等 28+ 工具。

## 为什么做这个

**2026 年 AGENTS.md 已成为行业标准**——已有 60,000+ 开源仓库使用，被 OpenAI、Google、Anthropic、Microsoft 联合推动。76% 的开发者使用 AI 编码助手，但没有 AGENTS.md 的 AI 像一个"没有入职手册的新同事"——写出的代码风格飘忽、架构混乱、CI 频繁失败。

**行业数据**：Anthropic 内部基准测试显示，有 AGENTS.md 的项目可减少 **40-60%** 的"错误模式重写"。但手工编写一份高质量 AGENTS.md 需要半天到一天——每个新项目都要重复一遍。

**Project Blueprint 的解法**：不预设模板。自主扫描→智能分类→动态拼装。你看到的 AGENTS.md 是基于你项目的真实技术栈生成的，不是换了个名字的通用模板。而且它是唯一能一句话搞定 AGENTS.md + 文档体系 + CI + 测试制度 + Git 规范的工具。

## 核心能力

| 能力               | 说明                                                                |
| ---------------- | ----------------------------------------------------------------- |
| **自主文件发现**       | 扫描项目，按 30+ 文件名模式自动分类，不预设"有哪些文件"                                   |
| **项目结构识别**       | 自动识别单项目/monorepo/前后端分离（2-3层）等项目组织方式                               |
| **智能依赖分类**       | 三层递进：知识库精确匹配 → 29 种命名模式启发推断 → 联网搜索                                |
| **业务类型推断**       | 两层启发式（结构特征 + 配置特征），覆盖 13 种业务类型                                    |
| **动态 AGENTS.md** | 从 70+ 组件知识库实时拼装，非固定模板                                             |
| **模块速查表生成**      | 读取实际源码目录，按文件模式推断模块职责，无法确定时联网搜索                                    |
| **文档体系**         | A/B/C/D/E 五级分类，按业务类型按需生成                                          |
| **测试制度**         | 按项目阶段的分层测试策略，非强行写示例文件                                             |
| **多 IDE 适配**     | 自动生成 CLAUDE.md / .cursor/rules / copilot-instructions 等指向文件       |
| **增量模式**         | 已有项目只补缺失，不覆盖已有配置                                                  |
| **MCP 工具推荐**     | 按探测技术栈推荐 MCP 工具清单与组合，生成 `docs/B/B-05-MCP工具清单.md`（含安装命令，仅 MD 最小侵入） |
| **持续自适应**        | 生成的 AGENTS.md 内含 Agent 主动维护指令，随项目进展自动更新                           |
| **基础代码规范实写**    | 初始化即写入基础代码规范（命名/目录结构/错误处理/日志/安全/性能 6 类），B-01 实写 8 章，非占位符 |
| **AI 高频错误防犯**    | 内置 7 大类 27 条 AI 高频错误知识库，初始化优先注入防犯规则，BUG 反哺持续迭代 |

## 生成内容一览

| 产物                          | 说明                                            |
| --------------------------- | --------------------------------------------- |
| `AGENTS.md`                 | 项目规范（架构原则约束：高内聚低耦合 / 组合优于继承 / 避免全局状态 / 纯函数优先） |
| `docs/`                     | A/B/C/D/E 五级分类文档骨架 + 分类 README 维护指令（含 B-01-开发规范，实写 8 章）           |
| `.github/workflows/ci.yml`  | CI 流水线（语言自适应，支持 GitHub/Gitee/其他）              |
| `.gitignore`                | 按语言选择的精选规则                                    |
| `.husky/pre-commit`         | JS/TS 项目提交前 lint 检查（非 JS 项目跳过）                |
| `CLAUDE.md`                 | Claude Code 指向文件                              |
| `.cursor/rules/project.mdc` | Cursor 指向文件                                   |
| `docs/B/B-03-测试指南.md`       | 测试制度（分层策略、编写时机、框架特定模式）                        |
| `docs/B/B-05-MCP工具清单.md`    | MCP 工具清单 + 组合建议 + 安装命令（按需生成）                  |

## 自主发现引擎

Project Blueprint 不预设"检查哪些文件"。它扫描你的项目，自主发现所有构建/配置/清单文件，然后分类推断。

### 依赖分类：三层递进

```
扫描到的所有依赖
    ↓
第 1 层：知识库精确匹配 (exact)
  在 70+ 组件知识库中直接命中 → instant
    ↓
第 2 层：命名模式启发推断 (heuristic)
  29 种模式覆盖 100+ 关键词 → 自动分类
  例: winston → logging, antdv-next → ui, mysql2 → database
    ↓
第 3 层：联网搜索 (web)
  真正未知的依赖 → 实时搜索最新信息
```

### 技术栈覆盖

| 层级                                                       | 组件                                                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **语言** (7)                                               | TypeScript/JavaScript, Go, Python, Java, Rust, Ruby, PHP                                                                    |
| **框架** (15)                                              | NestJS, Next.js, Vue 3, React, Express, FastAPI, Flask, Django, Gin, Spring Boot, SvelteKit, Nuxt 3, Laravel, Hono, uni-app |
| **ORM** (6)                                              | Prisma, TypeORM, Drizzle, GORM, SQLAlchemy, JPA/Hibernate                                                                   |
| **CSS** (5)                                              | Tailwind CSS, CSS Modules, Scoped CSS, Styled Components, SCSS                                                              |
| **UI 库** (4)                                             | Ant Design Vue, Element Plus, Naive UI, Vant                                                                                |
| **测试** (6)                                               | Vitest, Jest, Pytest, Go testing, JUnit 5, Playwright                                                                       |
| **Lint** (5)                                             | ESLint, Prettier, Biome, Ruff, golangci-lint                                                                                |
| **部署** (5)                                               | PM2, Docker, Vercel, Docker Compose, GitHub Pages                                                                           |
| **数据库** (2)                                              | MySQL, PostgreSQL                                                                                                           |
| + 状态管理(3) + 包管理(5) + 通用规范(4) + 业务类型文档模式(12) = **70+ 组件** |  |                                                                                                                     |

## 联网搜索回退

每个维度都有联网搜索兜底——不只是语言和框架，CSS/Lint/包管理/部署/UI库/数据库/状态管理全覆盖：

```
未知依赖: @shadcn/ui 不在知识库中
→ 启发式: 含 "shadcn" + "ui" → 维度: ui
→ WebSearch: "shadcn/ui component library conventions 2026"
→ 提取: 组件注册方式、主题定制、与 Tailwind 配合使用
→ 写入 AGENTS.md 强制规范章节
```

> 联网回退覆盖两阶段：**生成期**（探测未知依赖/模块时联网搜索）+ **编码期**（生成的 AGENTS.md 要求 Agent 写第三方库代码前先查官方文档，核对当前版本用法）。

## 独创特性

> 以下特性经全网搜索验证，在现有 AGENTS.md 生成工具中**无同类产品实现**。

| 独创特性              | 说明                                                              | 竞品现状                                            |
| ----------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| **全生命周期一站式生成**    | 一句话产出 AGENTS.md + 文档体系 + CI/CD + 测试制度 + Git 规范                  | 竞品仅生成 AGENTS.md 单个文件                            |
| **自主发现引擎**        | 三层递进分类（精确匹配→模式推断→联网搜索），非简单读取 package.json                       | 竞品使用固定模板或简单文件扫描                                 |
| **持续进化机制**        | 生成的 AGENTS.md 内含 Agent 主动维护规则，随项目成长自动更新                         | 竞品生成静态文件，无自我维护能力                                |
| **业务类型感知**        | 13 种业务类型推断，驱动不同的文档结构生成                                          | 无竞品推断项目类型                                       |
| **增量质量检测**        | 自动评估已有 AGENTS.md 质量，分级处理（完善→跳过/缺失→补充/无→全量）                      | 竞品全部覆盖或从头生成                                     |
| **多 IDE 生态适配**    | 自动生成 CLAUDE.md / .cursor/rules / copilot-instructions 等指向文件     | 无竞品提供                                           |
| **模块速查表自动生成**     | 读取实际源码目录，按文件模式推断职责，无法确定时联网搜索                                    | 无竞品提供                                           |
| **MCP 工具自动推荐**    | **按**探测技术栈三层递进自动匹配 MCP 工具，输出组合建议（必装/推荐/可选）+ 可执行安装文档；双层联网保障命令不过时 | 竞品仅预设固定 MCP 配置（如 Project Genesis Phase 9），无自主推荐 |
| **7 语言 15 框架知识库** | 70+ 组件含 Commands + Conventions + CI，中文为第一语言                     | 竞品最多覆盖 JS/TS 生态                                 |

## 与众不同之处

- **自主发现，不预设** — 扫描项目实际有什么，不从固定列表猜测
- **三层递进分类** — 精确匹配→模式推断→联网搜索，越用越准
- **全栈覆盖** — AGENTS.md + 文档体系 + CI/CD + 测试制度 + Git 规范，一句话搞定
- **增量友好** — 已有项目自动识别，不覆盖不改写
- **持续进化** — 生成的规范不是死文件，AGENTS.md 内含 Agent 主动维护指令：新增模块自动更新速查表、新依赖自动补技术栈、架构决策自动记录
- **MCP 工具自动推荐** — 从探测技术栈自动匹配 MCP 工具组合并生成可安装文档，双层联网杜绝过时命令
- **防 AI 高频错误 + 规范反哺闭环** — 内置 7 大类 27 条 AI 高频错误知识库，初始化优先注入防犯规则；规范缺失型 Bug 自动反哺更新 AGENTS.md 与 B-01，规范随实战持续迭代
- **原生中文** — 7 语言 15 框架 70+ 组件，中文为第一语言

## 工作流程

```
你说："初始化这个项目的开发规范"
    ↓
Step 1: 自主扫描→文件分类→依赖推断（三层递进）
    ↓
Step 2: 规则引擎从 70+ 组件知识库拼装 AGENTS.md
    ↓ （未知栈 → 联网搜索回退）
Step 3: 按业务类型动态创建文档骨架（13 种类型）+ MCP 工具推荐（B-05）
    ↓
Step 4: 配置 Git（.gitignore + 分支策略）
    ↓
Step 5: 配置 CI/CD（语言 + 平台自适应）
    ↓
Step 6: 建立测试制度（按阶段策略，非强制示例）
    ↓
Step 7: 注入持续自适应维护指令
    ↓
完成：15+ 文件生成，项目即刻 AI-Ready
```

## 环境要求

- 支持 SKILL.md 格式的任意 AI 编程 Agent
- Node.js（用于 `npx skills add` 安装方式）

## 贡献

欢迎贡献！可参与的方向：

- **知识库扩展**：向 `references/knowledge-base.md` 添加更多语言/框架/ORM/UI 库组件
- **MCP 工具库**：向 `references/mcp-tools.md` 添加 MCP 工具条目（适用场景/安装方式/推荐组合），扩展维度覆盖
- **基础规范库**：向 `references/code-conventions.md` 添加/完善基础代码规范规则（命名/目录/错误处理/日志/安全/性能，含搜索模板）
- **AI 易错点库**：向 `references/ai-common-mistakes.md` 添加 AI 高频错误条目（易错点/后果/❌示范/✅做法/关联条目/搜索模板），扩展防犯覆盖
- **启发规则**：扩展 `SKILL.md` Step 1.2 命名模式推断规则，覆盖更多依赖关键词
- **文件发现**：扩展 Step 1.1 文件名模式映射表，支持更多构建工具/语言生态
- **业务类型**：扩展 Step 3.0 配置特征推断规则，覆盖更多项目类型
- **CI 平台**：添加更多 CI 平台模板（GitLab CI、Jenkins、CircleCI 等）
- **实战反馈**：提供真实项目的使用案例与改进建议，帮助框架持续进化
- **翻译**：将 README 翻译为日语、韩语等其他语言

## License

MIT — 详见 [LICENSE](LICENSE)。

***

**Author: 曙光 (shuguang1994)**

**Made with ❤️ in China | 始于实战，开源共享**
