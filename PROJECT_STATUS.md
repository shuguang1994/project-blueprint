# Project Blueprint — 项目开发状态与独立抽离指南

> 生成日期: 2026-08-01 | 版本: v1.5.0 | 作者: 曙光 (shuguang1994)

---

## 一、项目简介

**Project Blueprint** 是一个开源的 AI Agent 技能包，用于为新项目一键建立完整的 AI 编程规范体系。它不是静态模板——是**自主发现引擎**：扫描项目文件，智能推断技术栈，从 70+ 组件知识库动态拼装定制化的 AGENTS.md、文档骨架、CI/CD 流水线和测试制度。

## 二、当前状态

| 维度 | 状态 |
|------|:---:|
| 版本 | v1.6.1 |
| 开发完成度 | ✅ 核心功能完整，7 Step 流程闭环 |
| 内部测试 | ✅ 已在真实全栈项目实战验证 |
| 文档 | ✅ 中文 README 完善，英文 README 同步 |
| 开源协议 | MIT |
| GitHub | https://github.com/shuguang1994/project-blueprint |
| Gitee 镜像 | https://gitee.com/shuguang1994/project-blueprint |

### 版本演进

| 版本 | 核心变化 |
|------|---------|
| v1.0 | 初始 6 步流程 |
| v1.1 | 6 技术栈预设 + vendor breadcrumbs |
| v1.2 | 自适应探测 + 61 组件知识库 + 联网回退 |
| v1.3 | 模块速查表联网 + 10 维回退 + 测试制度 + UI 维度 |
| **v1.4** | **自主发现引擎（扫描→分类→推断）+ 三层依赖分类 + 两层业务类型推断** |
| **v1.4.1** | **通用规范新增「第三方库先查官方文档」规则 + 一致性修复（7 步流程/分支自适应/数字核对）** |
| **v1.5.0** | **MCP 工具推荐（Step 3.4 + references/mcp-tools.md 知识库 + docs/B/B-05 生成）** |
| **v1.6.0** | **DSH (DeepSeek Harness) 插件支持（dsh-plugin/ 自包含插件包，零构建复用官方 skill-filesystem 提供方，Agent Plugins v1.0.0 便携清单 + 同步脚本，Cordis 运行时实测通过）+ GitHub 14 个 Topics 标签 + README 徽章** |
| **v1.6.1** | **DSH 插件 GitHub 安装路径修复（仓库根目录新增 package.json，声明 dsh.bundle 指向 dsh-plugin/cordis.patch.yml，社区 `dsh plugin add github:...` 命令可用）** |

### 本地 DSH 运行环境记录（2026-08-14）

- 本机已部署 `dsh`（v0.1.0-rc.5，npm 包 `@deepseek-ai/dsh`），用于 dsh-plugin 本地联调验证
- 安装方式（国内镜像 + 全局安装，绕过 npx 锁超时问题）：
  ```bash
  npm install -g @deepseek-ai/dsh --registry=https://registry.npmmirror.com
  dsh web   # Web UI 默认 http://127.0.0.1:3080
  ```
- 踩坑记录：`npx @deepseek-ai/dsh web` 因依赖过大触发 npm 11 `ECOMPROMISED (Lock compromised)` 锁超时中断；全局安装无此限制，后续安装用 `npm install -g` 而非 npx
- 插件加载示例：`dsh plugin --profile web add 'github:shuguang1994/project-blueprint'`
- **已验证（2026-08-14）**：本地从 `dsh-plugin/` 目录安装成功并激活
  ```bash
  dsh plugin --profile web add "file:D:/open-source/project-blueprint/dsh-plugin"
  ```
  验证：`dsh --profile web --dump-config` 可见 `# == project-blueprint` bundle 层；重启 `dsh web` 后 UI 正常、日志无错误
- **已修复（v1.6.1，2026-08-14）**：`github:shuguang1994/project-blueprint` 此前安装的是**仓库根目录**（纯 Markdown，无 package.json），dsh 提示 `declares no dsh.bundle`，无法激活。已在仓库根目录新增 `package.json`（`dsh.bundle.patch: ./dsh-plugin/cordis.patch.yml`）并推送双远程，社区安装命令 `dsh plugin --profile web add 'github:shuguang1994/project-blueprint'` 现已直接可用

## 三、文件清单

```
project-blueprint/
├── AGENTS.md                         # 项目开发规范 (AI Agent 强制规范，v1.0，2026-08-01 建立)
├── SKILL.md                          # 核心逻辑 (706行，7 Step 完整流程，Step 3.4 MCP 工具推荐)
├── README.md                         # 英文文档
├── README_CN.md                      # 中文文档
├── CHANGELOG.md                      # 版本记录 (v1.0 ~ v1.6.1)
├── LICENSE                           # MIT 协议
├── .gitignore
├── PROJECT_STATUS.md                 # 本文件
├── package.json                      # DSH 插件 GitHub 安装入口 (v1.6.1，dsh.bundle 指向 dsh-plugin/cordis.patch.yml)
├── dsh-plugin/                       # DSH (DeepSeek Harness) 插件包 (v1.6.0)
│   ├── package.json                  # npm 包元数据 + dsh.bundle.patch
│   ├── cordis.patch.yml              # profile 挂载配置
│   ├── plugin.json                   # Agent Plugins v1.0.0 便携清单（跨宿主）
│   ├── lib/                          # 零构建 ESM 插件（复用 dsh-skill-filesystem）
│   ├── skills/project-blueprint/     # 打包的技能内容（由 sync-skill.mjs 从根目录同步）
│   └── scripts/sync-skill.mjs        # 同步脚本（发版前运行）
└── references/
    ├── knowledge-base.md             # 70+ 组件知识库 (7层: 语言/框架/ORM/CSS/UI库/测试/Lint/部署/数据库/通用)
    ├── mcp-tools.md                  # MCP 工具知识库 (10 维度 18 条目: 适用场景/安装方式/推荐组合)
    ├── agents-md-template.md         # AGENTS.md 兜底模板 (自动探测+联网均失败时使用)
    ├── ci-template.yml               # CI 模板 (TS/Go/Python/Vue 四种完整 workflow)
    ├── docs-skeleton.md              # 文档骨架指南 (A/B/C/D/E 五级分类)
    ├── gitignore-template.md         # Git 忽略规则 (按语言选择)
    └── project-sync-guide.md         # Agent 文档同步操作指南 (Step 7 参考)
```

**总计**: 30 个文件，无外部依赖（dsh-plugin/ 新增 15 个，其中 `skills/` 下 7 个为根 `references/` 的同步副本；根 `package.json` 为 v1.6.1 新增）。

## 三点五、AGENTS.md 建立记录（2026-08-01）

- 依据本 Skill 自身的规范体系（SKILL.md 7 Step 流程）为本仓库建立 `AGENTS.md`（v1.0，163 行）
- 内容覆盖：项目身份、常用命令、Boundaries、强制规范（文档/SKILL.md 编写/知识库条目/版本发布/架构原则）、模块速查表、关键架构决策、Git 规范（双远程）、代码审查清单、上下文管理
- 后续对项目文件的任何变更需同步维护 AGENTS.md（见其「上下文管理」章节）

## 四、技术架构

### 7 Step 流程

```
Step 1: 自主发现引擎 (扫描→分类→推断)
Step 2: 规则引擎拼接 (70+ 知识库 + 联网回退)
Step 3: 自适应文档体系 (13 种业务类型动态生成 + 3.4 MCP 工具推荐 B-05)
Step 4: Git 规范配置
Step 5: CI/CD 配置
Step 6: 测试制度建立
Step 7: 持续自适应机制
```

### 核心创新点

1. **零固定表** — 文件发现、依赖分类、业务推断均为自主推断
2. **三层递进** — 知识库精确 → 命名模式启发 → 联网搜索
3. **增量友好** — 已有项目只补缺失，不覆盖
4. **全栈覆盖** — AGENTS.md + docs + CI + testing + Git
5. **MCP 工具自动推荐** — 从探测技术栈自动匹配 MCP 工具组合（必装/推荐/可选），生成可执行安装文档；双层联网（建库期核对 + 推荐期兜底）防命令过时，全网验证无同类实现

## 五、已知局限

1. React 生态 UI 库（MUI/shadcn/ui）未列入知识库，依赖联网回退
2. Gitee 项目已有 GitHub Actions 时不会主动建议 `.gitee-ci.yml`
3. 3 层以上多子项目需手动再触发一次
4. 知识库缺少 Fastify/Actix-web 框架条目
5. `npx skills add` 安装方式依赖 skills.sh 平台

## 六、下一步计划

- [ ] 收集开源社区反馈和使用案例
- [ ] 扩展知识库覆盖更多框架和组件
- [ ] 提交到 skills.sh 官方目录
- [ ] 撰写博客/文章推广
- [x] MCP 工具推荐能力（Step 3.4 + mcp-tools.md + B-05 文档，v1.5.0）
- [x] 发布 v1.5.0（GitHub + Gitee 双远程均已推送 main + tag v1.5.0）
- [ ] 双平台元数据更新（需 PAT / Gitee 私人令牌）：GitHub description/topics 同步至最新口径 + Gitee description 修正 7 语言 + Gitee 补设 MIT License（建议文本见会话记录）
