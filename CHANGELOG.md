# Changelog

All notable changes to this project will be documented in this file.

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
