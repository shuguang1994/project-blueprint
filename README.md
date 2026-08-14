# Project Blueprint 🏗️

> **One command to make any project AI-agent-ready.**
> 一键为新项目建立完整 AI 编程规范体系。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![skills.sh](https://img.shields.io/badge/skills.sh-project--blueprint-orange)](https://skills.sh)

**Topics** ·
[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-blue)](https://github.com/topics/dsh-plugin)
[![deepseek-harness](https://img.shields.io/badge/deepseek--harness-1f6feb)](https://github.com/topics/deepseek-harness)
[![agent-skills](https://img.shields.io/badge/agent--skills-8A2BE2)](https://github.com/topics/agent-skills)
[![claude-code](https://img.shields.io/badge/claude--code-D97757)](https://github.com/topics/claude-code)
[![cursor](https://img.shields.io/badge/cursor-00A67E)](https://github.com/topics/cursor)
[![codex](https://img.shields.io/badge/codex-18181B)](https://github.com/topics/codex)

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

**DeepSeek Harness (dsh) plugin**:

```bash
dsh plugin --profile web add 'github:shuguang1994/project-blueprint'
```

Supported agents: Claude Code, Cursor, GitHub Copilot, Codex, Windsurf, Trae, OpenCode, DeepSeek Harness, and 28+ more.

## Why

**AGENTS.md is now an industry standard in 2026** — used by 60,000+ open-source repos, co-promoted by OpenAI, Google, Anthropic, and Microsoft. 76% of developers use AI coding assistants (Stack Overflow 2025), but without AGENTS.md, AI agents are like "new hires with no onboarding" — producing inconsistent code styles, broken architecture, and failing CI.

**Industry data**: Anthropic benchmarks show AGENTS.md reduces wrong-pattern rewrites by **40-60%**. But writing a quality AGENTS.md by hand takes half a day to a full day — repeated for every new project.

**Project Blueprint's approach**: No preset templates. Autonomous scanning → intelligent classification → dynamic assembly. The AGENTS.md you get reflects your project's actual tech stack. And it's the only tool that generates AGENTS.md + docs skeleton + CI pipeline + testing policy + Git conventions — all from one sentence.

## Core Capabilities

| Capability | Description |
|------------|-------------|
| **Autonomous File Discovery** | Scan and classify 30+ file patterns — no preset file checklist |
| **Project Structure Detection** | Auto-identify monorepo, 2/3-tier frontend-backend, or single project |
| **Intelligent Dep Classification** | 3-tier: knowledge base exact match → 29 heuristic patterns → web search |
| **Business Type Inference** | 2-tier heuristic (structure + config features), 13 business types |
| **Dynamic AGENTS.md** | Assembled from 70+ component knowledge base, not a template |
| **Module Table Generation** | Reads actual source dirs, infers responsibilities via file patterns, web search fallback |
| **Documentation System** | A/B/C/D/E 5-tier classification, generated per business type |
| **Testing Policy** | Phase-appropriate layered strategy, not forced example files |
| **Multi-IDE Support** | Auto-generates CLAUDE.md, .cursor/rules, copilot-instructions, and more |
| **Incremental Mode** | Only fills gaps on existing projects, never overwrites |
| **MCP Tool Recommendation** | Recommends MCP tool list + combinations from detected stack, generates `docs/B/B-05-MCP工具清单.md` with install commands (MD only, minimal intrusion) |
| **Self-Evolving** | Generated AGENTS.md includes auto-maintenance rules — updates module table, tech stack, and decisions as the project grows |
| **Real Coding Conventions** | Writes base coding conventions at init (naming/structure/error handling/logging/security/performance 6 categories), B-01 as real 8-chapter doc, not a placeholder |
| **AI Mistake Prevention** | Built-in 7-category 27-item AI common-mistakes KB, injected into core rules at init, iterated via BUG feedback loop |

## What It Generates

| Output | Description |
|--------|-------------|
| `AGENTS.md` | Project conventions (governed by architecture principles) |
| `docs/` | A/B/C/D/E classified documentation skeleton + README maintenance guides (incl. B-01-开发规范, real 8-chapter conventions) |
| `.github/workflows/ci.yml` | CI pipeline (auto-adapts to language + platform) |
| `.gitignore` | Curated rules per language |
| `.husky/pre-commit` | Pre-commit lint hook (JS/TS only) |
| `CLAUDE.md` | Claude Code vendor breadcrumb |
| `.cursor/rules/project.mdc` | Cursor vendor breadcrumb |
| `docs/B/B-03-测试指南.md` | Testing policy (layers, timing, framework-specific patterns) |
| `docs/B/B-05-MCP工具清单.md` | MCP tool list + combination suggestions + install commands (on demand) |

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
  29 patterns covering 100+ keywords → auto-classify
  e.g. winston → logging, antdv-next → ui, mysql2 → database
    ↓
Tier 3: Web Search
  Truly unknown → real-time search for latest info
```

### Tech Stack Coverage

| Layer | Components |
|-------|-----------|
| **Languages** (7) | TypeScript/JavaScript, Go, Python, Java, Rust, Ruby, PHP |
| **Frameworks** (15) | NestJS, Next.js, Vue 3, React, Express, FastAPI, Flask, Django, Gin, Spring Boot, SvelteKit, Nuxt 3, Laravel, Hono, uni-app |
| **ORMs** (6) | Prisma, TypeORM, Drizzle, GORM, SQLAlchemy, JPA/Hibernate |
| **CSS** (5) | Tailwind CSS, CSS Modules, Scoped CSS, Styled Components, SCSS |
| **UI Libraries** (4) | Ant Design Vue, Element Plus, Naive UI, Vant |
| **Testing** (6) | Vitest, Jest, Pytest, Go testing, JUnit 5, Playwright |
| **Linting** (5) | ESLint, Prettier, Biome, Ruff, golangci-lint |
| **Deployment** (5) | PM2, Docker, Vercel, Docker Compose, GitHub Pages |
| **Databases** (2) | MySQL, PostgreSQL |
| + State(3) + Package Mgmt(5) + Conventions(4) + Doc Patterns(12) = **70+** |

## Web Search Fallback

Every dimension has a web search fallback — not just language/framework, but CSS, lint, package manager, deployment, UI libraries, database, and state management:

```
Unknown dep: @shadcn/ui not in knowledge base
→ Heuristic: contains "shadcn" + "ui" → dimension: ui
→ WebSearch: "shadcn/ui component library conventions 2026"
→ Extracts: registration patterns, theming, Tailwind integration
→ Writes into AGENTS.md
```

> Web fallback covers two phases: **generation** (web search for unknown deps/modules) + **coding** (the generated AGENTS.md requires verifying third-party library APIs/versions against official docs before writing code).

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
| **MCP Tool Auto-Recommendation** | Auto-matches MCP tools from detected stack via 3-tier matching, outputs combo suggestions (must/recommended/optional) + an installable MD doc; dual-layer web search keeps commands fresh | Competitors (e.g. Project Genesis Phase 9) only wire preset MCP config — no autonomous recommendation from tech stack |
| **7-Language 15-Framework KB** | 70+ components with Commands + Conventions + CI, Chinese-first | Competitors cover JS/TS ecosystem at most |

## What Makes It Different

- **Autonomous discovery, not preset** — scans what your project actually has
- **3-tier classification** — exact match → pattern heuristic → web search
- **Full-stack coverage** — AGENTS.md + docs + CI + testing policy + Git, one sentence
- **Incremental-friendly** — auto-detects existing projects, adds only what's missing
- **Self-evolving** — generated AGENTS.md is not a dead file; it teaches the AI to maintain itself as the project grows
- **MCP-ready tooling** — auto-recommends MCP tools + combos from your stack, with an installable doc that never ships outdated commands
- **AI mistake prevention + BUG→conventions feedback loop** — built-in 7-category 27-item AI common-mistakes KB injected at init; conventions-deficiency bugs auto-feed back into AGENTS.md and B-01, so conventions evolve with real practice
- **Chinese-first** — 7 languages, 15 frameworks, 70+ components natively in Chinese

## How It Works

```
User says: "Initialize this project"
    ↓
Step 1: Autonomous scan → file classification → dep inference (3-tier)
    ↓
Step 2: Rule engine assembles AGENTS.md from 70+ component KB
    ↓ (unknown stack → WebSearch fallback)
Step 3: Dynamic docs skeleton by business type (13 types) + MCP tool recommendation (B-05)
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
- **MCP tools**: Add MCP tool entries (usage/install/combination) to `references/mcp-tools.md`, expanding dimension coverage
- **Code conventions**: Add/refine base coding convention rules (naming/directory/error handling/logging/security/performance, with search templates) in `references/code-conventions.md`
- **AI mistakes**: Add AI common-mistake entries (mistake/consequence/❌example/✅fix/KB link/search template) to `references/ai-common-mistakes.md`, expanding anti-pattern coverage
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
