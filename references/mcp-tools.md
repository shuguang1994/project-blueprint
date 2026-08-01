# MCP 工具知识库

> Skill `project-blueprint` Step 3.4 参考。按探测到的技术栈维度推荐 MCP 工具。每个工具含 适用场景 / 安装方式 / 推荐组合 三段。v1.5
>
> **建库期联网验证（必需）**：条目编写/维护时，工具名与安装命令必须 WebSearch 核对当前版本（`"{tool}" MCP server install {currentYear}`）。MCP 生态更新快，禁止凭记忆写命令。

---

## 一、维度 → 工具匹配（第 2 层启发式）

> 第 1 层精确匹配在下方各维度章节中；此处为按探测维度/依赖/目录关键词快速定位工具的启发规则。

| 探测到（维度/依赖/目录/配置） | 推荐工具 | 推断逻辑 |
|------------------------------|---------|---------|
| uni-app / React Native / Flutter / `android/` / `adb` / 移动端业务类型 | Android ADB MCP | 移动端真机/模拟器自动化 |
| `@playwright/*` / `e2e` / `cypress` / `*.spec.ts` | Playwright MCP | E2E 测试依赖 |
| Vue / React / Svelte / `vite.config.*` / `pages/` + `components/` | Playwright MCP + Chrome DevTools MCP | Web 前端页面验证 |
| Figma 链接 / `design/` / `figma` 依赖 | Figma MCP | 设计稿 → 代码 |
| `photoshop` / `psd` / 设计素材目录 | Photoshop MCP | 设计素材处理 |
| NestJS / Express / FastAPI / Spring Boot 等后端框架 | Fetch MCP + 数据库 MCP | 接口调试 + 数据直查 |
| `mysql*` 依赖 / `.env` 含 `DB_HOST` | MySQL MCP | 数据库直查 |
| `postgres*` 依赖 | PostgreSQL MCP | 数据库直查 |
| `sqlite` 依赖 | SQLite MCP | 本地库直查 |
| `mongodb` / `mongoose` 依赖 | MongoDB MCP | 数据库直查 |
| `docker-compose*` / `Dockerfile` | Docker MCP | 容器编排管理 |
| `pm2` / `nginx` / `ecosystem.config.js` / 部署需求 | SSH MCP | 远程服务器运维 |
| GitHub / Gitee / `git remote -v` | GitHub MCP + Git MCP | 版本管理 |
| 静态站点 / 文档站点（vitepress/docusaurus） | Playwright MCP | 页面预览验证 |

> 任何维度都未命中 → 进入第 3 层联网搜索：`WebSearch "{framework} MCP server {currentYear}"`。

---

## 二、工具条目

### Playwright MCP（浏览器自动化）
**适用场景**: Web 前端 E2E 验证、页面回归、表单自动化、H5 页面测试。命中条件：Vue/React 前端、E2E 测试依赖、Web 业务类型。
**安装方式**:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```
**推荐组合**: 设计+前端组合（+ Chrome DevTools MCP）；全栈组合（+ Fetch MCP + 数据库 MCP）。

### Chrome DevTools MCP（浏览器调试）
**适用场景**: 前端页面调试、Console/Network 分析、DOM 检查。命中条件：Web 前端项目、复杂前端调试需求。
**安装方式**:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```
**推荐组合**: 设计+前端组合（+ Playwright MCP）。

### Android ADB MCP（移动端自动化）
**适用场景**: 移动端 APP 真机/模拟器自动化冒烟、UI 回归、截图取证。命中条件：uni-app / React Native / Flutter / `android/` 目录。
**安装方式**: 无统一 npm 包，常见为自建（参考 `ssh-mcp-server` 模式）或 IDE 内置（如 Trae 内置 android-mcp）。安装前 `WebSearch "android mcp server install {currentYear}"` 核对。
**推荐组合**: 移动端组合（+ Playwright MCP 测 H5 + 视觉理解 MCP 验 UI）。

### Figma MCP（设计稿 → 代码）
**适用场景**: 从 Figma 设计稿提取布局/颜色/组件信息，辅助 UI 还原。命中条件：Figma 链接、`design/` 目录、前端设计需求。
**安装方式**:
```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": { "FIGMA_API_KEY": "<your-figma-api-key>" }
    }
  }
}
```
**推荐组合**: 设计+前端组合（+ Photoshop MCP + Playwright MCP）。

### Photoshop MCP（设计素材处理）
**适用场景**: PSD 文档操作、文字/纯色图层、素材导出。命中条件：`photoshop` / `psd` 依赖、设计素材目录、重度设计资产需求。
**安装方式**: 常见为 IDE 内置（如 Trae 内置 photoshop-mcp）或按官方文档配置。安装前联网核对。
**推荐组合**: 设计+前端组合（+ Figma MCP）；与 RunningHub 图像 MCP 功能部分重叠，按需启用。

### 视觉理解 MCP（图像分析）
**适用场景**: UI 截图分析、设计稿还原比对、BUG 复现图识别、视觉回归。命中条件：移动端/Web 项目、UI 验收需求。
**安装方式**: 常见为 IDE 内置（如 Trae 内置 doubao-vision，需 `DOUBAO_MODEL` 环境变量）或自建。安装前联网核对。
**推荐组合**: 移动端组合（+ Android ADB MCP）；设计+前端组合（+ Figma MCP）。

### 图像生成 MCP（AI 生图）
**适用场景**: 占位图、营销素材、产品配图。命中条件：前端/APP 有配图需求。
**安装方式**: 常见为 IDE 内置（如 Trae 内置 runninghub-image）或 API 型自建。安装前联网核对。
**推荐组合**: 设计+前端组合；移动端组合（APP 素材）。

### MySQL MCP（数据库直查）
**适用场景**: MySQL 数据库 schema 查看、SQL 查询、数据问题排查。命中条件：`mysql*` 依赖、`.env` 含 `DB_HOST`、后端有数据库。
**安装方式**:
```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["-y", "@benborla29/mcp-server-mysql"],
      "env": {
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "<user>",
        "MYSQL_PASS": "<password>",
        "MYSQL_DB": "<database>"
      }
    }
  }
}
```
> 默认只读（仅 SELECT），写操作需显式开启 `ALLOW_INSERT/UPDATE/DELETE_OPERATION` 环境变量。
**推荐组合**: 全栈组合（+ Fetch MCP）；数据驱动组合。

### PostgreSQL MCP（数据库直查）
**适用场景**: PostgreSQL schema 查看、SQL 查询、数据问题排查。命中条件：`postgres*` 依赖、后端有数据库。
**安装方式**:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@henkey/postgres-mcp"],
      "env": { "POSTGRES_CONNECTION_STRING": "postgresql://<user>:<pass>@127.0.0.1:5432/<db>" }
    }
  }
}
```
**推荐组合**: 全栈组合（+ Fetch MCP）；数据驱动组合。

### SQLite MCP（数据库直查）
**适用场景**: 本地 SQLite 数据库查看与查询。命中条件：`sqlite` 依赖、本地数据存储。
**安装方式**:
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "<path/to/db>"]
    }
  }
}
```
**推荐组合**: 数据驱动组合（+ Fetch MCP）。

### MongoDB MCP（数据库直查）
**适用场景**: MongoDB 集合查看、查询、索引排查。命中条件：`mongodb` / `mongoose` 依赖。
**安装方式**:
```json
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": ["-y", "@mongodb-js/mongodb-mcp-server"],
      "env": { "MONGODB_CONNECTION_STRING": "mongodb://<user>:<pass>@127.0.0.1:27017" }
    }
  }
}
```
**推荐组合**: 全栈组合（+ Fetch MCP）；数据驱动组合。

### Fetch MCP（HTTP/API 调试）
**适用场景**: 后端接口开发与联调、API 返回验证、第三方接口探查。命中条件：任何后端框架（NestJS/Express/FastAPI/Spring Boot 等）、REST API 需求。
**安装方式**:
```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```
**推荐组合**: 全栈组合（+ 数据库 MCP + Playwright MCP）。

### SSH MCP（远程服务器运维）
**适用场景**: 远程执行命令、日志排查、Nginx 部署、Python 脚本远程执行、服务状态检查。命中条件：`pm2` / `nginx` / 部署需求、服务器管理需求。
**安装方式**: 无统一 npm 包，常见为自建（如 Trae 内置 ssh-mcp-server，含 execute-command/upload/download）或按官方文档配置。安装前联网核对。
**推荐组合**: 部署运维组合（+ Docker MCP）；全栈组合（上线阶段）。

### Docker MCP（容器管理）
**适用场景**: Docker 容器/镜像/Compose 编排管理、环境一致性排查。命中条件：`docker-compose*` / `Dockerfile`、容器化部署。
**安装方式**:
```json
{
  "mcpServers": {
    "docker": {
      "command": "npx",
      "args": ["-y", "docker-mcp-server"]
    }
  }
}
```
**推荐组合**: 部署运维组合（+ SSH MCP）。

### GitHub MCP（版本管理）
**适用场景**: 提 PR、查 Issue、仓库信息、GitHub Actions 管理。命中条件：远程仓库为 GitHub。
**安装方式**:
```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"]
    }
  }
}
```
**推荐组合**: 版本管理组合（+ Git MCP）。

### Git MCP（本地版本管理）
**适用场景**: 本地 git 操作（status/diff/commit/log），与仓库交互。命中条件：任何有 git 的项目。
**安装方式**:
```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "git-mcp"]
    }
  }
}
```
**推荐组合**: 版本管理组合（+ GitHub MCP）。

### Brave Search MCP（联网搜索）
**适用场景**: 实时信息检索、第三方库用法查证（与内置 WebSearch 冗余时可选）。命中条件：Agent 无内置搜索或需高频查证。
**安装方式**:
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "<your-api-key>" }
    }
  }
}
```
**推荐组合**: 通用增强（+ 任一组）。

### Tavily MCP（联网搜索）
**适用场景**: 同 Brave Search，搜索质量更高（需 API Key）。命中条件：同上。
**安装方式**:
```json
{
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@latest"],
      "env": { "TAVILY_API_KEY": "<your-api-key>" }
    }
  }
}
```
**推荐组合**: 通用增强（+ 任一组）。

---

## 三、推荐组合矩阵

| 组合 | 适用业务类型 | 工具列表 | 等级 |
|------|-------------|---------|------|
| **全栈组合** | 全栈项目（前后端分离） | MySQL/PostgreSQL MCP + Fetch MCP + Playwright MCP + SSH MCP | 必装 |
| **移动端组合** | 移动端 APP（uni-app 等） | Android ADB MCP + Playwright MCP（H5）+ 视觉理解 MCP | 必装 |
| **设计+前端组合** | 前端/设计驱动项目 | Figma MCP + Photoshop MCP + Chrome DevTools MCP + Playwright MCP | 推荐 |
| **部署运维组合** | 有服务器/容器部署 | SSH MCP + Docker MCP | 必装 |
| **数据驱动组合** | 数据库密集型后端 | 对应数据库 MCP + Fetch MCP | 推荐 |
| **版本管理组合** | 任何 Git 项目 | Git MCP + GitHub MCP | 可选 |

> 等级含义：**必装** = 项目主场景直接依赖；**推荐** = 提升开发效率明显；**可选** = 按需/增强。

---

## 四、通用安装提示

- `.mcp.json` 为项目级 MCP 配置（MCP 开放规范），多数 IDE（Trae/Cursor/VSCode/Cline）支持；部分 IDE 用 `.cursor/mcp.json` 或用户级配置，路径按 IDE 文档调整
- 所有工具安装前 `WebSearch "{tool} MCP server install {currentYear}"` 核对最新版本与配置方式，本文档可能滞后
- 数据库/API Key 类凭据一律放入 `env` 或环境变量，禁止写入仓库与文档
- 未收录的新工具 → 联网获取安装方式后按三段格式补充为本文件新条目
