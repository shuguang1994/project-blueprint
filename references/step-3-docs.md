# Step 3：建立自适应文档体系

> `SKILL.md` Step 3 的完整实现细节，由 SKILL.md 的「Step 索引与按需加载」表按需加载。
> 关联：references/code-conventions.md、references/ai-common-mistakes.md、references/knowledge-base.md、references/mcp-tools.md、references/gates-templates.md、references/docs-check.mjs、references/ai-work-protocol.md、references/docs-skeleton.md、references/spec-driven.md、references/step-5-ci-and-gates.md

> 不使用固定目录结构。根据项目实际框架、技术栈、业务类型动态生成。

### 3.0 推断项目业务类型

> **不预设固定类型**。从项目结构+依赖+README 描述启发式推断，无法确定时联网搜索。

**三层推断流程**：
```
Step 1 探测结果 + README.md 描述 + 目录结构
    ↓
第 1 层 — 结构特征匹配（精确）
  按下方「特征 → 业务类型」表匹配
    ↓
第 2 层 — 依赖/配置启发推断
  结构不明确时，按 package.json/go.mod 中的特定字段推断
  见下方「配置特征 → 业务类型」表
    ↓
第 3 层 — 联网搜索
  仍无法确定 → WebSearch 推断
```

**第 1 层：结构特征 → 业务类型**

| 特征 | 推断类型 | 文档侧重点 |
|------|---------|----------|
| 存在 `src/controllers/` / `src/modules/` / `src/services/` 且无 pages/app | 后端 API 服务 | API 文档、数据库设计、部署运维 |
| 探测到 NestJS/Express/FastAPI/Gin/Django/Spring Boot 等后端框架 | 同上 | 同上 |
| 存在 ORM 配置 + Model/Entity 定义 | 同上 | 同上 |
| 存在 `pages/` / `app/` + `components/` | 前端应用 | UI 规范、组件库、路由设计 |
| 存在 `docker-compose.yml` + 3+ 服务 | 微服务架构 | 服务间通信、服务注册、配置管理 |
| `package.json` description 含 `后台/管理/admin` | 管理后台 | 权限、数据看板、批量操作 |
| 存在 `mobile/` / `ios/` / `android/` / `uni-app` | 移动端应用 | 蓝牙、推送、离线、多端适配 |
| 同时匹配后端 + 前端特征 | 全栈项目 | 前后端分块 + 全栈部署文档 |

**第 2 层：配置特征 → 业务类型**（结构不明确时使用）

| 配置特征 | 推断类型 | 判断依据 |
|---------|---------|---------|
| `package.json` 有 `"bin"` 字段 | CLI 工具 | 可执行命令入口 |
| `package.json` 有 `"main"`/`"module"` 且无 `"scripts"."dev"` | 库/SDK | 发布入口 + 无开发服务器 |
| `go.mod` 的 module 路径无 `/cmd/` 子目录 | Go 库 | 纯库，无可执行入口 |
| `pyproject.toml` 有 `[project.scripts]` | Python CLI | 命令行入口点 |
| `Cargo.toml` 含 `[lib]` 无 `[[bin]]` | Rust 库 | 纯库项目 |
| `electron`/`tauri`/`nwjs` 在依赖中 | 桌面应用 | 桌面壳框架 |
| `package.json` 含 `"@tauri-apps/cli"` | 桌面应用 (Tauri) | Tauri 构建工具 |
| `astro`/`vitepress`/`docusaurus`/`docsify` 在依赖中 | 静态文档站点 | 文档生成器 |
| `hugo`/`jekyll`/`hexo` 配置 | 静态内容站点 | 静态站点生成器 |
| 以上都不匹配 | 通用项目 | → 第 3 层联网搜索 |

**第 3 层：联网搜索**
```
WebSearch "{项目名或README首句} project type classification best practices {currentYear}"
→ 从搜索结果提取最接近的业务类型
→ 仍无法确定 → 标记为"通用项目"，询问用户
```

> **多类型匹配时**（如既是后端又是 CLI）：优先选择更具体的类型。优先级：全栈 > 微服务 > 桌面 > 移动端 > 管理后台 > CLI > 后端 > 前端 > 库 > 静态站点 > 通用。

### 3.1 自适应 docs/ 结构

按业务类型生成对应文档（A/B/C/D/E 分类框架保留，内部文件按需增减）：

```
docs/
├── A/  (项目基准 — 按业务类型选文件)
│   ├── [必选] A-01-PRD.md              "产品需求文档 / PRD"
│   ├── [按需] A-02-技术架构.md          "后端服务 / API 服务 / 微服务架构"
│   ├── [按需] A-03-数据库设计.md         "有数据库时创建"
│   ├── [按需] A-04-前端架构.md           "前端项目时创建"
│   └── [按需] A-05-移动端架构.md         "移动端项目时创建"
├── B/  (开发运维 — 全量 + 按需)
│   ├── [必写] B-01-开发规范.md        "初始化时实写 8 章（见下方模板），非占位符"
│   ├── B-02-部署指南.md / B-03-测试指南.md / B-04-BUG知识库.md
│   ├── [按需] B-05-MCP工具清单.md   "有 MCP 工具需求时创建（见 3.4）"
├── C/  (知识沉淀 — 始终全量)
│   ├── C-01-CodeWiki首页.md / C-02-架构详解.md / C-03-项目长期记忆.md
├── D/  (方案设计 — 按需)
│   └── D-01-系统运维方案.md              "有后端/部署需求时创建"
├── E/  (分析优化 — 按需)
│   └── E-01-代码耦合度分析.md            "多模块项目时创建"
├── archive/ / dev/
```

**B-01-开发规范.md 实写模板**（初始化时实写，非占位符；文件头声明权威源与反哺源）：

```markdown
# 开发规范

> 本文件为项目代码规范详细版。**权威源为 AGENTS.md「强制规范」章节**（核心规则）；**B-04-BUG知识库.md 为反哺源**（修复 Bug 后反哺本文件）。
> 技术栈: {Step 1 探测结果摘要} | 更新: {date}

## 一、命名规范
（从 code-conventions.md「1. 命名规范」提取：各语言命名约定 + 数据库表/字段命名；核心规则已入 AGENTS.md，此处展开细节）

## 二、目录结构规范
（从 code-conventions.md「2. 目录结构规范」提取：分层原则 + 本项目实际目录约定）

## 三、错误处理规范
（从 code-conventions.md「3. 错误处理规范」提取）

## 四、日志规范
（从 code-conventions.md「4. 日志规范」提取：日志分级 / 字段 / 敏感信息脱敏）

## 五、安全规范
（从 code-conventions.md「5. 安全规范」提取）

## 六、性能规范
（从 code-conventions.md「6. 性能规范」提取）

## 七、技术栈特定规范
（从 knowledge-base.md 各组件条目的 Conventions 段展开：Commands / ✅❌ 规则 / CI）

## 八、AI 高频错误防犯清单
（从 ai-common-mistakes.md 按探测技术栈裁剪：AI 易错点 + ✅ 做法 + 出现次数标记）

## 九、规范维护
- AGENTS.md 为权威源：新增 ✅/❌ 规则先入 AGENTS.md，再展开到本文件
- B-04 反哺：修复 Bug 根因是规范缺失时，按 B-04「规范反哺」字段补充对应章节规则
```

> 一~六章内容从 code-conventions.md 提取（核心规则进 AGENTS.md，详细进本文件）；七章从 knowledge-base.md 组件 Conventions 展开；八章从 ai-common-mistakes.md 按技术栈裁剪。

**B-04-BUG知识库.md 模板结构**（修复典型 Bug 时记录，含「是否规范缺失」与「规范反哺」字段）：

```markdown
# BUG 知识库

> 典型 Bug 记录与规范反哺闭环。每条 Bug 记录后检查是否暴露规范缺失。更新: {date}

## {BUG 编号} | {标题}
- 现象 / 根因 / 修复方案
- 是否规范缺失: 是 / 否
- 规范反哺: {若是 → 补充 B-01-开发规范.md 第X章规则 + AGENTS.md 强制规范新增一条 ✅/❌ 防复发}
- 关联: {组件知识库 / ai-common-mistakes 条目 / 出现次数}
```

### 3.2 自适应模块速查表（含联网回退）

生成 AGENTS.md 模块表时，**读取实际目录结构**而非使用固定模板。对每个无法确定的模块，启动联网搜索。

**推断流程（按优先级）**：
```
Step 1: 列出 src/ 或 app/ 下的一级子目录
    ↓
Step 2: 对每个子目录，读取内部文件列表（前 10 个文件）
    ↓
Step 3: 按目录名 + 文件名模式推断模块职责
    匹配已知模式（controller/service/model → API模块；handlers/verifiers → 策略模块等）
    见 references/knowledge-base.md § 模块速查表生成规则
    ↓
Step 4: 无法匹配已知模式 → 联网搜索
    WebSearch "{directory_name} module in {framework} project typical responsibilities {currentYear}"
    从搜索结果提取职责描述
    ↓
Step 5: 联网也无法确定 → 标记 "待补充，建议：{搜索结果摘要}"
    提示用户完善
    ↓
写入 AGENTS.md 模块速查表
```

**联网搜索模板（按场景）**：

| 场景 | 搜索模板 |
|------|---------|
| 陌生目录名 | `"{dirName}" module responsibility in {framework} project` |
| 陌生文件模式 | `"{filePattern}" pattern in {language} {framework} project best practices` |
| 多模块架构 | `"{framework}" project module organization best practices {currentYear}` |
| 业务术语目录 | `"{dirName}" in "{businessDomain}" software architecture` |

> 示例：探测到 `src/cqrs/` 目录，knowledge-base 无匹配 → WebSearch `"cqrs module NestJS project typical responsibilities {currentYear}"` → 提取到 "命令查询职责分离，含 commands/ queries/ handlers/" → 写入模块表 "cqrs | CQRS 命令查询分离"

### 3.3 .trae/specs/ 目录（规范驱动开发六阶段）

> 完整流程（六阶段准入门槛 / 三件套模板 / checklist 转门禁规则）见 `references/spec-driven.md`，**此处只列生成动作，不复制其正文**。

**生成动作**：
```
mkdir -p .trae/specs/archive
.trae/specs/
├── README.md          # 说明六阶段流程 / 三件套用途 / change-id 命名规则
└── archive/           # 已验收的 <change-id>/ 整体归档
```

- **三件套模板**（`spec.md` / `tasks.md` / `checklist.md`）取自 `references/spec-driven.md` 第四章，本文件不复制模板正文
- **零固定表**：初始化只建 `README.md` 与 `archive/`，具体 `<change-id>/` 在变更启动时按需创建，不预设变更清单、不预建空目录
- `<change-id>` 命名：动词开头 + kebab-case（如 `add-payment-module`）；同一 change-id 未完成时继续追加，**不新建**
- 归档位置：验收通过后整体移动到 `.trae/specs/archive/<change-id>/`，保持相对结构不变
- checklist 中可机检的验收点按 `references/spec-driven.md` 第五章转为门禁（`source` 记 `spec#<change-id>`，装配沿用 3.5 的门禁层）

> 如果 IDE 是 Cursor → `.cursor/specs/`。不支持 specs 则跳过（回落到 `references/ai-work-protocol.md` 的 7 步）。

### 3.4 MCP 工具推荐（生成 docs/B/B-05-MCP工具清单.md）

> 基于 Step 1 探测结果推荐 MCP 工具清单与组合，生成后期可执行的安装文档（仅 MD，不写入 `.mcp.json` 文件，最小侵入）。

**输入**: Step 1 探测结果（语言/框架/ORM/数据库/部署/UI/移动端等维度）+ Step 3.0 业务类型。

**三层递进匹配**（与 1.2/2.2 同模式）：
```
Step 1 探测结果
    ↓
第 1 层 — references/mcp-tools.md 工具条目精确匹配
  按各工具条目「适用场景」命中条件匹配（如 uni-app → Android ADB MCP）
  命中 → 提取 适用场景/安装方式/推荐组合（快速通道）
    ↓
第 2 层 — 维度匹配表启发
  未命中 → 按 mcp-tools.md「一、维度 → 工具匹配」表，以依赖名/目录/配置关键词推断
  （如 docker-compose → Docker MCP、e2e 依赖 → Playwright MCP）
    ↓
第 3 层 — 联网搜索
  仍无 → WebSearch "{framework} MCP server {currentYear}"
  搜索结果同时用于判断是否补充 mcp-tools.md 新条目
    ↓
输出: { 工具 → 维度, 等级: 必装|推荐|可选 }
```

**组合推荐**: 按业务类型从 mcp-tools.md「三、推荐组合矩阵」选取（全栈/移动端/设计+前端/部署运维/数据驱动/版本管理），每个工具标注等级。

**生成文档** `docs/B/B-05-MCP工具清单.md`：
```
# MCP 工具清单

> 基于本项目技术栈（{技术栈摘要}）推荐的 MCP 工具配置清单。
> 更新: {date} | 技术栈: {Step 1 探测结果摘要}

## 一、推荐工具
| 工具 | 适用维度 | 等级 | 安装命令 |

## 二、推荐组合
| 组合 | 适用场景 | 工具列表 |

## 三、安装指引
（每个推荐工具的 npx 安装命令 + .mcp.json 配置片段，供后期直接复制安装）
> 安装前如遇命令失效或版本不匹配，先 WebSearch 核对官方最新安装方式（MCP 生态更新快，本文档可能滞后）。

## 四、维护
新增/移除 MCP 工具时更新本文件，并同步 AGENTS.md 技术栈行。
```

### 3.5 门禁层与协议文档生成（gates.json + 统一入口 + 宪法自校验 + 文档校验）

> 门禁是「宪法」的可执行投影：AGENTS.md 写红线，`scripts/gates.json` 记落地检查，`scripts/verify.*` 统一执行。生成物与模板对应关系如下。

**A. 生成物清单**

| 文件 | 说明 | 触发条件 | 模板来源 |
|---|---|---|---|
| `scripts/gates.json` | 门禁清单（唯一事实源） | 始终（至少 2 条种子门禁） | `references/gates-templates.md` §一 / §八 |
| `scripts/verify.{mjs\|py\|sh}` | 统一门禁入口（从清单读取执行） | 始终 | `references/gates-templates.md` §二 |
| `scripts/check-constitution.{mjs\|py}` | 宪法自校验（红线 ↔ 门禁双向比对） | 生成 AGENTS.md 后始终 | `references/gates-templates.md` §三 |
| `scripts/docs-check.{mjs\|py}` | 文档一致性校验（种子门禁 `docs-consistency`） | 生成 docs/ 后始终 | `references/docs-check.mjs` / `references/gates-templates.md` §八 |
| `scripts/drift-check.{mjs\|py}` | 规范漂移校验（种子门禁 `spec-drift`：依赖↔规范 / 模块速查表↔目录 / 门禁有效性） | 生成 AGENTS.md 后始终 | `references/gates-templates.md` §八 / 参考实现 `references/drift-check.mjs` |
| `scripts/checks/<id>.*` | 具体检查脚本 | 按需（生长出来的领域门禁） | 按 `references/gates-templates.md` §五翻译 |
| `docs/B/B-06-门禁与工作协议.md` | AI 编程工作协议 + 门禁生长细则 | **中大型项目**（按规模阈值） | `references/ai-work-protocol.md` |
| `docs/B/B-04-BUG知识库.md` | 缺陷模式库（编号唯一 + 症状速查表 + 预防措施绑定门禁） | 始终 | 本文件 Step 3.1 现有模板（需按其升级后的要素生成） |

**B. 门禁种子规则**

初始化时**至少播种 2 条种子门禁**：`docs-consistency`（文档一致性，`source`: `AGENTS#文档契约`）+ `spec-drift`（规范漂移，`source`: `AGENTS#技术栈`）。`level` 按项目存量情况定：**新项目 `blocking`，已有存量（文档 / 规范债）的项目 `warn`**。小项目只播种这两条，**不生成 `scripts/checks/` 目录**。完整清单、`source` 取值与 `gates.json` 条目示例见 `references/gates-templates.md` §八（**以该文件为准**）。

**C. 宿主选择**

脚本宿主（`{mjs|py|sh}` / Makefile）按 **`references/step-5-ci-and-gates.md` 的 Step 5.5 宿主选择规则**确定，此处只说明"生成物扩展名取决于宿主"。

**D. 生成内容时必须同时写入**

- 状态头契约（`> 版本: … | 更新: … | 状态: …`）与规模阈值（AGENTS.md ≤ 300 行 / 单篇 ≤ 600 行）写入 AGENTS.md「上下文管理」（见 `references/step-2-assembly.md` 的 Step 2.1 注入 C）
- 在 `docs/README.md` 索引中登记新增文档

**E. 生成后必做**

进入 `references/step-5-ci-and-gates.md` 的 Step 5.5 做装配与实跑自测（不得跳过）。

### 生成规则
- 占位文件只一行标题 + "(待填写 / TBD)"
- 每个分类目录下创建 README.md 维护指令：
  - `docs/A/README.md`: "基准文档。架构变更时同步更新。"
  - `docs/B/README.md`: "运维文档。流程变更时同步，每次部署后检查。"
  - `docs/C/README.md`: "知识沉淀。每次重大决策或修复典型 Bug 后更新。"
  - `docs/D/README.md`: "方案设计。新方案确定后补充。"
  - `docs/E/README.md`: "分析优化。定期审计时更新。"
- docs/ 已存在 → 只补缺失
- 文件名中英双语
- **按规模阈值触发（避免过度工程）**：判定项目规模（源码文件数 / 是否多人协作 / 是否已有测试与 CI）。**低于阈值的项目**只生成两条种子门禁（`docs-consistency` + `spec-drift`）及对应检查脚本 + 统一入口 `scripts/verify.*`，**不生成** `scripts/checks/` 目录与 `docs/B/B-06-门禁与工作协议.md`；**达到阈值的项目**全量生成门禁层与协议文档。阈值默认：源码文件 ≥ 30 个 或 已存在 CI 配置 或 已发生 ≥ 3 次回归缺陷

### 详细参考
见 `references/docs-skeleton.md`
