# Project Blueprint 🏗️

> **One command to make any project AI-agent-ready.**
> 一键为新项目建立完整 AI 编程规范体系。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![skills.sh](https://img.shields.io/badge/skills.sh-project--blueprint-orange)](https://skills.sh)
[中文文档](README_CN.md)

---

## What is this?

Project Blueprint is a reusable AI agent skill that transforms any new project into an AI-ready codebase in one sentence. It's not a static template — it's an **autonomous discovery engine**: scan your project files, intelligently classify dependencies, and dynamically assemble a customized AGENTS.md, documentation skeleton, CI/CD pipeline, and testing policy from a 70+ component knowledge base.

Just say: **"Initialize this project's development standards"** and the agent does the rest.

## Quick Install

```bash
# Global (GitHub)
npx skills add shuguang1994/project-blueprint

# China (Gitee mirror, no proxy needed)
npx skills add https://gitee.com/shuguang1994/project-blueprint.git

# Update later
npx skills update project-blueprint
```

Supported agents: Claude Code, Cursor, GitHub Copilot, Codex, Windsurf, Trae, OpenCode, and 27+ more.

## Why

**AGENTS.md is now an industry standard in 2026** — used by 60,000+ open-source repos, co-promoted by OpenAI, Google, Anthropic, and Microsoft. 76% of developers use AI coding assistants (Stack Overflow 2025), but without AGENTS.md, AI agents are like "new hires with no onboarding" — producing inconsistent code styles, broken architecture, and failing CI.

**Industry data**: Anthropic benchmarks show AGENTS.md reduces wrong-pattern rewrites by **40-60%**. But writing a quality AGENTS.md by hand takes half a day to a full day — repeated for every new project.

**Project Blueprint's approach**: No preset templates. Autonomous scanning → intelligent classification → dynamic assembly. The AGENTS.md you get reflects your project's actual tech stack. And it's the only tool that generates AGENTS.md + docs skeleton + CI pipeline + testing policy + Git conventions — all from one sentence.

## Core Capabilities

| Capability | Description |
|------------|-------------|
| **Autonomous File Discovery** | Scan and classify 30+ file patterns — no preset file checklist |
| **Project Structure Detection** | Auto-identify monorepo, 2/3-tier frontend-backend, or single project |
| **Intelligent Dep Classification** | 3-tier: knowledge base exact match → 31 heuristic patterns → web search |
| **Business Type Inference** | 2-tier heuristic (structure + config features), 13 business types |
| **Dynamic AGENTS.md** | Assembled from 70+ component knowledge base, not a template |
| **Module Table Generation** | Reads actual source dirs, infers responsibilities via file patterns, web search fallback |
| **Documentation System** | A/B/C/D/E 5-tier classification, generated per business type |
| **Testing Policy** | Phase-appropriate layered strategy, not forced example files |
| **Multi-IDE Support** | Auto-generates CLAUDE.md, .cursor/rules, copilot-instructions, and more |
| **Incremental Mode** | Only fills gaps on existing projects, never overwrites |
| **Self-Evolving** | Generated AGENTS.md includes auto-maintenance rules — updates module table, tech stack, and decisions as the project grows |

## What It Generates

| Output | Description |
|--------|-------------|
| `AGENTS.md` | Project conventions (governed by architecture principles) |
| `docs/` | A/B/C/D/E classified documentation skeleton + README maintenance guides |
| `.github/workflows/ci.yml` | CI pipeline (auto-adapts to language + platform) |
| `.gitignore` | Curated rules per language |
| `.husky/pre-commit` | Pre-commit lint hook (JS/TS only) |
| `CLAUDE.md` | Claude Code vendor breadcrumb |
| `.cursor/rules/project.mdc` | Cursor vendor breadcrumb |
| `docs/B/B-03-测试指南.md` | Testing policy (layers, timing, framework-specific patterns) |

## Autonomous Discovery Engine

Project Blueprint doesn't check a fixed list of files. It scans your project and discovers everything.

### Dependency Classification: 3-Tier

```
All detected dependencies
    ↓
Tier 1: Knowledge Base Exact Match
  Hit in 70+ component KB → instant
    ↓
Tier 2: Name Pattern Heuristic
  31 patterns covering 100+ keywords → auto-classify
  e.g. winston → logging, antdv-next → ui, mysql2 → database
    ↓
Tier 3: Web Search
  Truly unknown → real-time search for latest info
```

### Tech Stack Coverage

| Layer | Components |
|-------|-----------|
| **Languages** (8) | TypeScript, JavaScript, Go, Python, Java, Rust, Ruby, PHP |
| **Frameworks** (15) | NestJS, Next.js, Vue 3, React, Express, FastAPI, Flask, Django, Gin, Spring Boot, SvelteKit, Nuxt 3, Laravel, Hono, uni-app |
| **ORMs** (6) | Prisma, TypeORM, Drizzle, GORM, SQLAlchemy, JPA/Hibernate |
| **CSS** (5) | Tailwind CSS, CSS Modules, Scoped CSS, Styled Components, SCSS |
| **UI Libraries** (4) | Ant Design Vue, Element Plus, Naive UI, Vant |
| **Testing** (6) | Vitest, Jest, Pytest, Go testing, JUnit 5, Playwright |
| **Linting** (5) | ESLint, Prettier, Biome, Ruff, golangci-lint |
| **Deployment** (5) | PM2, Docker, Vercel, Docker Compose, GitHub Pages |
| **Databases** (2) | MySQL, PostgreSQL |
| + State(3) + Package Mgmt(5) + Conventions(6) = **70+** |

## Web Search Fallback

Every dimension has a web search fallback — not just language/framework, but CSS, lint, package manager, deployment, UI libraries, database, and state management:

```
Unknown dep: @shadcn/ui not in knowledge base
→ Heuristic: contains "shadcn" + "ui" → dimension: ui
→ WebSearch: "shadcn/ui component library conventions 2026"
→ Extracts: registration patterns, theming, Tailwind integration
→ Writes into AGENTS.md
```

## Unique Innovations

> Verified via web search — no existing AGENTS.md generation tool implements these.

| Innovation | Description | Competitor Status |
|------------|-------------|-------------------|
| **Full-Lifecycle Generation** | One sentence → AGENTS.md + docs + CI/CD + testing policy + Git conventions | Competitors only generate AGENTS.md |
| **Autonomous Discovery Engine** | 3-tier classification (exact→heuristic→web search), not just reading package.json | Competitors use fixed templates or basic scanning |
| **Self-Evolving Mechanism** | Generated AGENTS.md includes auto-maintenance rules, grows with the project | Competitors produce static files |
| **Business Type Awareness** | 13 business type inferences drive different documentation structures | No competitor infers project type |
| **Incremental Quality Detection** | Auto-evaluates existing AGENTS.md quality, tiered handling (complete→skip / partial→supplement / none→full) | Competitors overwrite or start fresh |
| **Multi-IDE Ecosystem** | Auto-generates CLAUDE.md, .cursor/rules, copilot-instructions, and more | No competitor provides this |
| **Module Table Auto-Generation** | Reads actual source directories, infers responsibilities via file patterns, web search fallback | No competitor provides this |
| **8-Language 15-Framework KB** | 70+ components with Commands + Conventions + CI, Chinese-first | Competitors cover JS/TS ecosystem at most |

## What Makes It Different

- **Autonomous discovery, not preset** — scans what your project actually has
- **3-tier classification** — exact match → pattern heuristic → web search
- **Full-stack coverage** — AGENTS.md + docs + CI + testing policy + Git, one sentence
- **Incremental-friendly** — auto-detects existing projects, adds only what's missing
- **Self-evolving** — generated AGENTS.md is not a dead file; it teaches the AI to maintain itself as the project grows
- **Chinese-first** — 8 languages, 15 frameworks, 70+ components natively in Chinese

## How It Works

```
User says: "Initialize this project"
    ↓
Step 1: Autonomous scan → file classification → dep inference (3-tier)
    ↓
Step 2: Rule engine assembles AGENTS.md from 70+ component KB
    ↓ (unknown stack → WebSearch fallback)
Step 3: Dynamic docs skeleton by business type (13 types)
    ↓
Step 4: Configure Git (.gitignore + branch strategy)
    ↓
Step 5: Configure CI/CD (language + platform adaptive)
    ↓
Step 6: Establish testing policy (phase-appropriate, not forced)
    ↓
Step 7: Inject continuous self-maintenance instructions
    ↓
Done: 15+ files generated, project is AI-ready
```

## Requirements

- Any AI coding agent that supports SKILL.md format
- Node.js (for `npx skills add` installation)

## Contributing

Contributions welcome! Areas to help:

- **Knowledge base**: Add more language/framework/ORM/UI library entries to `references/knowledge-base.md`
- **Heuristic rules**: Expand Step 1.2 name pattern classification, covering more dependency keywords
- **File discovery**: Extend Step 1.1 file pattern mapping for more build tools and language ecosystems
- **Business types**: Expand Step 3.0 config feature inference for more project types
- **CI platforms**: Add templates for more CI platforms (GitLab CI, Jenkins, CircleCI, etc.)
- **Real-world feedback**: Share use cases and improvement suggestions from real projects to help the framework evolve
- **Translations**: README to Japanese, Korean, and other languages

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Author: 曙光 (shuguang1994)**

**Made with ❤️ in China | 始于实战，开源共享**
