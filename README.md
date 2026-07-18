# Project Blueprint 🏗️

> **One command to make any project AI-agent-ready.**
> 一键为新项目建立完整 AI 编程规范体系。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![skills.sh](https://img.shields.io/badge/skills.sh-project--blueprint-orange)](https://skills.sh)
[中文文档](README_CN.md)

---

## What is this?

Project Blueprint is a reusable AI agent skill that automatically sets up a complete development standards system for any new project. It's like a project architect that creates your AGENTS.md, documentation skeleton, CI/CD pipeline, and testing infrastructure — all in one shot.

Just say: **"Initialize this project's development standards"** and the agent does the rest.

## Quick Install

```bash
npx skills add shuguang1994/project-blueprint
```

Supported agents: Claude Code, Cursor, GitHub Copilot, Codex, Windsurf, Trae, OpenCode, and 20+ more.

## Why

**The problem**: Every new project starts from zero. You spend the first day setting up AGENTS.md, CI/CD, testing framework, gitignore, docs structure — the boilerplate that every AI-ready project needs but no one wants to write by hand. Existing tools give you a static template. They don't adapt to your tech stack, don't cover CI, don't set up testing, and don't speak your language.

**Our approach**: Project Blueprint reads your actual project files, detects the stack, and assembles a custom AGENTS.md from a 61-component knowledge base. It's not a template — it's a rules engine. Unknown stacks get web-searched in real-time. And it's the only tool that generates a full docs/ skeleton (A/B/C/D/E classification), CI pipeline, and testing infrastructure — all from a single sentence.

项目面临的现实问题：每个新项目第一天都在搭规范体系 —— AGENTS.md、CI/CD、测试框架、文档目录。现有工具只给静态模板，不关注具体技术栈、不覆盖 CI、不设测试、不支持中文。

Project Blueprint 在做的事：读真实的项目文件，探测技术栈，从 61 组件的知识库中实时拼装一套 AGENTS.md。不是模板，是规则引擎。未知栈联网搜索。唯一能一句话生成完整文档骨架 + CI + 测试基础设施的工具。

## What It Generates

| Output | Description |
|--------|-------------|
| `AGENTS.md` | Project conventions (150-200 lines, Commands + Boundaries + Code Style + Review Checklist) |
| `docs/` | A/B/C/D/E classified documentation skeleton |
| `.github/workflows/ci.yml` | CI pipeline (auto-adapts to your tech stack) |
| `.gitignore` | Curated gitignore rules |
| `.husky/pre-commit` | Pre-commit lint hook |
| `CLAUDE.md` | Claude Code vendor breadcrumb |
| `.cursor/rules/project.mdc` | Cursor vendor breadcrumb |
| `__tests__/example.spec.ts` | Sample unit test |

## Adaptive Tech Stack Detection

Project Blueprint reads your project files to automatically detect the tech stack:

| File | What it detects |
|------|----------------|
| `package.json` | Language, framework, ORM, CSS framework, testing library, lint tools, state management, package manager |
| `go.mod` | Go version, framework (gin/echo/fiber/chi) |
| `requirements.txt` | Python framework (FastAPI/Flask/Django) |
| `pom.xml` / `build.gradle` | Java framework (Spring Boot) |
| `Cargo.toml` | Rust dependencies |
| `docker-compose.yml` | Database, cache, message queue services |
| `tsconfig.json` | Strict mode, path aliases |
| `.eslintrc` / `.prettierrc` | Lint configuration |
| `git remote -v` | Repository platform (GitHub/Gitee) |

## Built-in Knowledge Base

61 components across 10 categories:

| Category | Components |
|----------|-----------|
| **Languages** | TypeScript, JavaScript, Go, Python, Java, Rust, Ruby, PHP |
| **Frameworks** | Next.js, NestJS, Vue 3, React, Express, Fastify, FastAPI, Flask, Django, Gin, Spring Boot, Actix-web, SvelteKit, Nuxt 3 |
| **ORMs** | Prisma, TypeORM, Drizzle, Sequelize, GORM, SQLAlchemy, JPA/Hibernate |
| **CSS** | Tailwind CSS, CSS Modules, Scoped CSS, Styled Components, SCSS |
| **Testing** | Vitest, Jest, Pytest, Go testing, JUnit 5, Playwright |
| **Linting** | ESLint, Prettier, Biome, Ruff, golangci-lint |
| **Package Managers** | pnpm, npm/yarn, Poetry, Gradle/Maven, go mod |
| **Deployment** | PM2, Docker, Vercel, Docker Compose, GitHub Pages |

## Web Search Fallback

When encountering an unknown tech stack, Project Blueprint automatically triggers a web search for the latest best practices. Example:

```
Unknown: Bun JavaScript runtime
→ WebSearch: "Bun runtime AGENTS.md commands CI best practices 2026"
→ Extracts: dev/build/test commands, CI config, conventions
→ Writes into AGENTS.md
```

All search queries use the **current system year** (not hardcoded) to ensure up-to-date results.

## What Makes It Different

- **Adaptive, not template-based** — reads your actual project files instead of forcing a preset
- **Web search fallback** — unknown stacks get real-time best-practice lookup
- **Full-stack coverage** — AGENTS.md + docs/ skeleton (A/B/C/D/E) + CI/CD + testing + pre-commit, all from one command
- **Multi-language support** — 7 languages, 14 frameworks, 61 components, with Chinese as a first-class language

## How It Works

```
User says: "Initialize this project"
    ↓
Step 1: Auto-detect tech stack (10 file types)
    ↓
Step 2: Rule engine assembles AGENTS.md from 61-component knowledge base
    ↓ (unknown stack → WebSearch fallback)
Step 3: Create docs/ skeleton (A/B/C/D/E)
    ↓
Step 4: Configure Git (.gitignore + branch strategy)
    ↓
Step 5: Configure CI/CD (language-aware pipeline)
    ↓
Step 6: Set up testing infrastructure
    ↓
Done: 15+ files generated, project is AI-ready
```

## Requirements

- Any AI coding agent that supports SKILL.md format
- Node.js (for `npx skills add` installation)

## Contributing

Contributions welcome! Areas to help:

- Add more components to `references/knowledge-base.md`
- Improve tech stack detection rules
- Add CI templates for more CI platforms (GitLab CI, Jenkins)
- Translate to more languages

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Author: 曙光 (shuguang1994)**

**Made with ❤️ in China | 始于实战，开源共享**
