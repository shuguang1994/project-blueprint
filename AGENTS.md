# Project Blueprint 项目开发规范 (AGENTS.md)

> AI 编程助手的强制开发规范。v1.0 | 2026-08-01
> AI 工具: Trae | 加载: always_applied

***

## 一、项目身份

- **项目**: Project Blueprint — 为新项目一键建立完整 AI 编程规范体系（AGENTS.md + 文档骨架 + CI/CD + 测试制度 + Git 规范）的开源 AI Agent 技能包。
- **形态**: 纯 Markdown 项目，无代码、无构建、无测试、无运行依赖。核心逻辑为 `SKILL.md`（7 Step 流程），配套 `references/` 知识库。
- **技术栈**: Markdown (SKILL.md 格式) + 70+ 组件知识库 + MCP 工具知识库 + WebSearch 联网回退
- **版本**: v1.5.0（语义化版本，tag 发布）
- **仓库**: GitHub `origin` = https://github.com/shuguang1994/project-blueprint / Gitee `gitee` = https://gitee.com/shuguang1994/project-blueprint
- **作者**: 曙光 (shuguang1994) | License: MIT
- **安装**: `npx skills add shuguang1994/project-blueprint`（国际）/ `npx skills add https://gitee.com/shuguang1994/project-blueprint.git`（国内）

## 二、常用命令

```bash
# 本仓库无编译/测试命令，常用操作为 Git 双远程推送：
git add <files>                                # 暂存（按文件逐一添加，勿 git add -A）
git commit -m "<type>(<scope>): <description>" # 提交
git push origin main                           # 推送 GitHub
git push gitee main --tags                     # 推送 Gitee 镜像 + 版本标签
git fetch origin && git fetch gitee            # 同步双远程
git revert <commit>                            # 线上问题回滚

# 技能安装/更新（验证对外文档描述一致性时参考）：
npx skills update project-blueprint
```

## 三、Boundaries

**Allowed**: `SKILL.md`、`references/`、`README.md`、`README_CN.md`、`CHANGELOG.md`、`PROJECT_STATUS.md`、`AGENTS.md`、`docs/`、`.gitignore`

**Ask First**:
- 版本号升级（vX.Y.Z）或破坏性变更（如 Step 流程重构、文件重命名）
- 修改 `SKILL.md` 中的流程步骤、触发条件、输出格式约定
- 新增/删除 `references/` 下的参考文件
- 双远程仓库的 git 操作（push/force/tag）

**Never Touch**: `.git/`、`LICENSE`（协议条款）、证书/密钥、任何 `.env` 文件、`node_modules/`

## 四、强制规范

### 4.1 文档规范

```
✅ README.md 与 README_CN.md 内容保持同步（中英对照，同一特性两处都要更新）
✅ 新增特性同时更新：README / README_CN / CHANGELOG / PROJECT_STATUS
✅ 文件名中英双语标注，按 A/B/C/D/E 五级分类存放
✅ 代码块必须闭合（开闭围栏语言标记一致），防止后续章节被误渲染
✅ 对外文档中的数字保持一致（如框架数量 15、组件数量 70+）
✅ 新增知识库条目后同步更新 README 技术栈覆盖表
```

### 4.2 SKILL.md 编写规范

```
✅ 执行原则：探测优先 / 最小侵入 / 不确定就问 / 一步一验证
✅ 步骤编号固定：Step 1 自主发现引擎 → Step 7 持续自适应机制
✅ 引用 knowledge-base.md 时按 ## [组件名] 定位，不读全文
✅ 未知组件触发联网回退，且 {currentYear} 用系统真实年份，禁止硬编码
❌ 不在 SKILL.md 中硬编码固定文件列表 / 固定映射表（保持"零固定表"设计）
❌ 不写本项目特定信息（IP、人名、公司名）— 用占位符
```

### 4.3 knowledge-base.md 条目格式

每个组件条目必须含三段：

```
## [组件名]
**Commands**: 精确可执行命令
**Conventions**: ❌/✅ 规范要点
**CI job**: GitHub Actions yaml 片段
```

### 4.4 版本与发布规范

```
✅ 语义化版本：major.minor.patch，破坏性变更升 major（如 v1.4.0 自主发现引擎重构）
✅ CHANGELOG.md 按版本号倒序记录，标注 Breaking Change / Added / Changed / Fixed
✅ 每次发版：CHANGELOG 更新 → tag 打版本 → push origin main → push gitee main --tags
✅ PROJECT_STATUS.md 同步更新版本演进表
```

### 4.5 架构原则

```
✅ 高内聚低耦合 — 各 Step 职责单一，Step 间通过探测结果流转
✅ 复用已有代码 — 优先复用 references/ 已有条目，避免重复定义
✅ 增量友好 — 已有项目只补缺失，不覆盖已有配置
✅ 三层递进 — 知识库精确匹配 → 命名模式启发 → 联网搜索
✅ 组合优于继承 / 避免全局状态 / 纯函数优先
```

## 五、模块速查表

| 文件 | 职责 |
|------|------|
| `SKILL.md` | 核心逻辑：7 Step 完整流程（探测/拼接/文档/Git/CI/测试/自适应） |
| `README.md` / `README_CN.md` | 中英文项目文档：安装、能力、工作流程、贡献指南 |
| `CHANGELOG.md` | 版本记录（v1.0 ~ v1.5.0） |
| `PROJECT_STATUS.md` | 项目状态、版本演进、独立抽离指南、已知局限、下一步计划 |
| `references/knowledge-base.md` | 70+ 组件知识库（语言/框架/ORM/CSS/UI/测试/Lint/包管理/部署/数据库/通用） |
| `references/mcp-tools.md` | MCP 工具知识库（10 维度 18 条目，含适用场景/安装方式/推荐组合，Step 3.4 参考） |
| `references/agents-md-template.md` | AGENTS.md 兜底模板（全部探测+联网失败时使用） |
| `references/ci-template.yml` | CI 模板（TS/Go/Python/Vue 四种完整 workflow） |
| `references/docs-skeleton.md` | docs/ 目录骨架指南（A/B/C/D/E 五级分类） |
| `references/gitignore-template.md` | Git 忽略规则模板（按语言选择） |
| `references/project-sync-guide.md` | Agent 文档同步操作指南（Step 7 参考） |
| `LICENSE` | MIT 协议 |
| `.gitignore` | 仓库忽略规则 |

## 六、关键架构决策

| 决策 | 说明 |
|------|------|
| 零固定表设计 | 文件发现/依赖分类/业务推断均自主推断，不预设文件清单（v1.4.0） |
| 三层递进依赖分类 | 知识库精确 → 命名模式启发（31 模式）→ 联网搜索（v1.4.0） |
| 增量质量检测 | 已有 AGENTS.md 按质量分级：完善→跳过 / 部分→补充 / 无→全量（v1.1+） |
| 多 IDE 适配 | 自动生成 CLAUDE.md / .cursor/rules / copilot-instructions 等 breadcrumbs（v1.1.0） |
| 测试制度替代示例文件 | 按项目阶段的分层测试策略文档，不强制创建示例测试（v1.3.0） |
| MCP 工具推荐 | 基于探测维度三层递进匹配 mcp-tools.md，生成 docs/B/B-05-MCP工具清单.md（仅 MD，不写 .mcp.json，v1.5.0） |
| 文档规模受架构原则约束 | 以"高内聚低耦合"控制规模，超限拆分到 docs/（v1.2.0 移除硬性行数限制） |

## 七、Git 规范

- **平台**: GitHub (origin) + Gitee (gitee) 双远程
- **分支**: `main`（唯一常驻分支，tag 发布版本）
- **提交格式**: `<type>(<scope>): <description>`
  - type: `feat`/`fix`/`refactor`/`docs`/`test`/`chore`/`perf`
  - 示例: `docs: 快速安装支持 Gitee 国内镜像 + 后续更新命令`
- **禁止提交**: `.env` / `node_modules/` / `dist/` / 证书/密钥
- **禁止**: `git push --force` / `git reset --hard`
- **发布流程**: 每次发版同时推双远程 + tag，保持 GitHub/Gitee 一致

## 八、代码审查检查清单

- [ ] README.md 与 README_CN.md 是否同步更新？
- [ ] 新特性是否记录到 CHANGELOG.md？
- [ ] 版本号是否按语义化版本正确更新？
- [ ] 代码块是否闭合（防止文档被误渲染）？
- [ ] knowledge-base.md 新增条目是否含 Commands / Conventions / CI job 三段？
- [ ] mcp-tools.md 新增条目是否含 适用场景 / 安装方式 / 推荐组合 三段？
- [ ] SKILL.md 是否保持"零固定表"设计，未硬编码文件列表？
- [ ] 文档中的数字（框架数/组件数）是否与知识库实际一致？
- [ ] 是否使用了占位符而非写死项目特定信息（IP/人名）？
- [ ] 中文文档与英文文档是否同时更新？

## 上下文管理

- **Agent 主动维护本文件** — 每次完成以下操作时同步更新：
  | 操作 | 更新内容 |
  |------|---------|
  | 新增 reference 文件 | 更新模块速查表 |
  | 变更 Step 流程/规范 | 更新强制规范或关键架构决策表 |
  | 版本发布 | 更新版本号、CHANGELOG、PROJECT_STATUS |
  | 扩展知识库/组件 | 更新技术栈行、README 覆盖表 |
  | 修复典型 Bug | 写入 docs/B/B-04-BUG知识库.md |
- **架构原则控制文档规模** — 高内聚低耦合 / 模块职责单一 / 组合优于继承 / 避免全局状态 / 纯函数优先 / 复用已有代码避免重复造轮子。AGENTS.md 超 300 行时按职责域拆分到 docs/ 引用。
- 项目记忆: project_memory.md 季度清理
- 会话记忆: 自动过期保留最近 7 天
