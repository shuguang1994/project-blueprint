# Project Blueprint — 项目开发状态与独立抽离指南

> 生成日期: 2026-08-01 | 版本: v1.5.0 | 作者: 曙光 (shuguang1994)

---

## 一、项目简介

**Project Blueprint** 是一个开源的 AI Agent 技能包，用于为新项目一键建立完整的 AI 编程规范体系。它不是静态模板——是**自主发现引擎**：扫描项目文件，智能推断技术栈，从 70+ 组件知识库动态拼装定制化的 AGENTS.md、文档骨架、CI/CD 流水线和测试制度。

## 二、当前状态

| 维度 | 状态 |
|------|:---:|
| 版本 | v1.5.0 |
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

## 三、文件清单

```
project-blueprint/
├── AGENTS.md                         # 项目开发规范 (AI Agent 强制规范，v1.0，2026-08-01 建立)
├── SKILL.md                          # 核心逻辑 (706行，7 Step 完整流程，Step 3.4 MCP 工具推荐)
├── README.md                         # 英文文档
├── README_CN.md                      # 中文文档
├── CHANGELOG.md                      # 版本记录 (v1.0 ~ v1.5.0)
├── LICENSE                           # MIT 协议
├── .gitignore
├── PROJECT_STATUS.md                 # 本文件
└── references/
    ├── knowledge-base.md             # 70+ 组件知识库 (7层: 语言/框架/ORM/CSS/UI库/测试/Lint/部署/数据库/通用)
    ├── mcp-tools.md                  # MCP 工具知识库 (10 维度 18 条目: 适用场景/安装方式/推荐组合)
    ├── agents-md-template.md         # AGENTS.md 兜底模板 (自动探测+联网均失败时使用)
    ├── ci-template.yml               # CI 模板 (TS/Go/Python/Vue 四种完整 workflow)
    ├── docs-skeleton.md              # 文档骨架指南 (A/B/C/D/E 五级分类)
    ├── gitignore-template.md         # Git 忽略规则 (按语言选择)
    └── project-sync-guide.md         # Agent 文档同步操作指南 (Step 7 参考)
```

**总计**: 14 个文件，无外部依赖。

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
