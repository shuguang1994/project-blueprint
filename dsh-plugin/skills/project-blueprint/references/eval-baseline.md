# 体系质量评估基准

> 本文件是「体系质量评估基准」：既用于判断 **Skill 生成物**（目标项目的 AGENTS.md / docs/ / 门禁层）是否达标，也用于判断 **Skill 自身**（`SKILL.md` / `references/`）是否达标。
> 引用方：`references/step-7-adaptive.md`（发布前 / 重大流程变更后的健康检查）｜ 关联：`references/ai-work-protocol.md`（证据标准与 DoD）、`references/gates-templates.md`（`gates.json` 字段与门禁分级）、`references/docs-check.mjs`（规模阈值的参考实现）
> 版本: v2.0 | 更新: 2026-10-14

---

## 一、规模指标（可机检）

| 指标 | 阈值 | 检查方式 | 级别 |
|------|------|----------|------|
| `SKILL.md` 正文行数 | ≤ 200 行 | `node -e "const n=require('fs').readFileSync('SKILL.md','utf8').split('\n').length;console.log(n<=200?'PASS':'FAIL',n)"` | warning |
| 各 `references/step-*.md` 行数 | ≤ 500 行 / 文件 | `node -e "const fs=require('fs');fs.readdirSync('references').filter(f=>/^step-\d/.test(f)&&f.endsWith('.md')).forEach(f=>{const n=fs.readFileSync('references/'+f,'utf8').split('\n').length;console.log(n<=500?'PASS':'FAIL',f,n)})"` | warning |
| 目标项目 `AGENTS.md` 行数 | ≤ 300 行 | 门禁 `docs-consistency`：`node scripts/docs-check.mjs`（`MAX_AGENTS_LINES = 300`，超限记 warning） | warning |
| 目标项目单篇 `docs/**/*.md` 行数 | ≤ 600 行 | 同上（`MAX_DOC_LINES = 600`） | warning |
| 知识库单文件行数（`knowledge-base.md` / `code-conventions.md` / `ai-common-mistakes.md` / `mcp-tools.md`） | ≤ 950 行 | `node -e "const fs=require('fs');fs.readdirSync('references').filter(f=>f.endsWith('.md')).forEach(f=>{const n=fs.readFileSync('references/'+f,'utf8').split('\n').length;console.log(n<=950?'PASS':'FAIL',f,n)})"` | warning |
| 代码围栏闭合（行首三反引号计数为偶数） | 计数 % 2 === 0 | `node -e "const fs=require('fs');['SKILL.md','references/eval-baseline.md'].forEach(f=>{const c=fs.readFileSync(f,'utf8').split('\n').filter(l=>l.startsWith(String.fromCharCode(96,96,96))).length;console.log(c%2===0?'PASS':'FAIL',f,c)})"` | error |

**阈值来源**：

- `SKILL.md` 正文 ≤ 200 行：Anthropic 官方对 SKILL.md 正文的建议上限为「< 500 行」，本仓库按「索引层只给流程骨架」的定位收得更紧（细节一律下沉到 `references/step-*.md`）。
- `step-*.md` ≤ 500 行：沿用官方对单文件正文的建议值。
- 目标项目 `AGENTS.md` ≤ 300 行 / 单篇 `docs/` 文档 ≤ 600 行：与既有「规模阈值」及 `references/docs-check.mjs` 的配置项（`MAX_AGENTS_LINES = 300`、`MAX_DOC_LINES = 600`）一致，属既有约定，本基准不另立数值；`references/ai-work-protocol.md` 第十章「文档契约」对此为引用式表述（"见 AGENTS.md 规模阈值"），不重复定义数值。
- 知识库单文件 ≤ 950 行：`references/knowledge-base.md` 为多维度合并文件，超出后按维度（语言 / 框架 / ORM / …）拆分。

**级别语义**（与 `references/gates-templates.md` 第六章一致）：

- `error`：阻断——出现即判定体系不可交付；本表中仅「代码围栏闭合」为 error（未闭合会导致后续章节被误渲染，是结构性损坏，非风格问题）。
- `warning`：不阻断——记录实测值并给出收敛建议，符合 `references/docs-check.mjs`「error 阻断、warning 提示」的输出契约；规模类指标属"提示收敛"，不阻断发布。

---

## 二、闭环指标（可机检，含口径说明）

| 指标 | 定义（口径） | 数据来源 | 计算方式 | 误判风险 |
|------|--------------|----------|----------|----------|
| **缺陷 → 门禁转化率** | 已固化为门禁的缺陷模式数 ÷ 缺陷模式总数 | 分子：`scripts/gates.json` 中 `source` 能追溯到 BUG 知识库条目或 spec 的条目数；分母：`docs/B/B-04-BUG知识库.md` 的条目数（**按 `^## BUG-` 标题计数**——该形态是 schema 唯一源，见 `references/docs-skeleton.md` 的 B-04 行；`### 模式 XX：` 与 `§2.NN 模式 XX` 两套写法**已废止**，按它们计数会得到 0） | 逐条读 `gates.json` 的 `source`，命中 `BUG#<编号>` / `spec#<change-id>` 的计入分子；未被任何门禁引用的 BUG 条目留在分母。**计数时必须排除模板占位行**（`## BUG-<NNN> \| <标题>` 这类示例）与「症状速查表」的表格行 | ① 一个 BUG 条目可能对应多条门禁，需先去重再计数（否则分子虚高）；② `source` 写的是章节名而非编号时无法判定，须人工归类；③ 不可机检的模式天然无法转化，会系统性拉低该比率 |
| **门禁覆盖率** | `gates.json` 条目中「可本地复现」的条数 ÷ 总条数 | `scripts/gates.json` 全量条目 + 逐条实跑 `run` | 可本地复现 = `run` 引用的脚本 / 文件存在（由 `scripts/check-constitution.*` **规则 C** 机检）**且**实跑退出码为 0；**僵尸门禁（条目存在但 `run` 跑不通 / 指向文件已删除）计入分母、不计入分子** | ① 环境差异（缺工具、缺数据）会把可复现门禁误判为不可复现，需在证据中记录失败原因；② `warn` 级门禁实跑失败不应计为"不可复现"，仅记提示；③ 只看 `run` 文件是否存在会高估覆盖率，必须叠加实跑 |

**参考区间（不作为达标线）**：

- `references/ai-work-protocol.md` 第七章的「命中率现实预期」指出：真实工程中约 **1/4** 的缺陷模式最终会固化为门禁——**这是参考区间，不是达标线**。转化率长期显著低于 1/4 时提示"缺陷只记不防"，显著高于 1/4 时应先怀疑第 ② 条误判风险（口径过宽）。
- 门禁覆盖率同理只作健康度参考，不设硬性百分比门槛；僵尸门禁优先清理而非追求覆盖率数字。

---

## 三、golden case 期望产物清单

> **本基准只定义「期望产物」与「校验点」」，明确不要求创建样例项目仓库**——空仓库无法提供真实探测信号，反而引入维护成本与"假 green"。

### 3.0 共同校验点（**对全部 golden case 生效，可机检，逐条留证**）

> 以下 7 条是**交付物级**锚点：无论哪种技术栈 / 形态都必须通过。命令一律在**生成产物目录**下执行；判定一律"命中数 = 0 / 退出码 = 0"，不得用"应该没问题"替代。

| # | 锚点 | 机检命令 / 判据 | 级别 |
|---|------|-----------------|------|
| A1 | 生成物中无假绿开关 | `Select-String -Path . -Include *.yml,*.yaml,*.md -Recurse -Pattern 'passWithNoTests'` → **命中数 0**（该参数只允许出现在文档里"禁止使用"的说明句中） | error |
| A2 | 门禁已接线（不依赖"记得追加"） | 生成的 workflow 文件内容含 `scripts/verify.` → 命中数 ≥ 1 | error |
| A3 | 运行时自证 | 每个 CI job 的首条 `run` 含 `command -v`，且随后打印运行时版本（`node -v` / `go version` / `python3 -V` 等） | error |
| A4 | test 步骤与探测一致 | 探测到测试框架或测试文件 → workflow 含显式测试运行器调用；**未探测到** → workflow **无** test 步骤 **且** `docs/B/B-03-测试指南.md` 含"补 CI test 步骤"契约 | warning |
| A5 | 权威表已生成且双向覆盖 | `docs/B/B-00-红线与门禁映射.md` 存在；`node scripts/check-constitution.*` **0 error**，且输出**不含**「无权威表，已降级」 | error |
| A6 | BUG 库 schema 与计数口径一致 | `docs/B/B-04-BUG知识库.md` 的条目标题匹配 `^## BUG-<数字>`；按该正则计数得到的条数 **> 0** 或为 0（库为空）**但绝不出现** `### 模式 ` 形态；与 `eval-baseline.md` 第二章转化率口径同源 | error |
| A7 | 不静默跳过 | 在"不适用"形态下，`node scripts/drift-check.mjs` 的 info 中**不得出现裸"跳过检查"**——每条不适用/回退必须带 `不适用｜原因：…｜风险：…｜裁定：` 或 `切换为回退模式｜原因：…｜替代判据：…｜残留局限：…` | warning |

**A1/A2/A3/A4 的负向验证要求（新项目同样适用）**：故意制造一次违规（加回 `--passWithNoTests` / 删掉 `scripts/verify.` 调用 / 删掉 `command -v` 行 / 删掉 test 步骤），确认对应锚点能报出问题，才算该锚点有效。

---

### 3.1 TS monorepo

- **输入特征**：根 `package.json` + `pnpm-workspace.yaml` + `turbo.json`；子目录 `server/`、`admin/`、`client/` 各有独立 `package.json`。
- **期望产物**：根 `AGENTS.md`（含子项目索引表）+ 三个子项目目录下各自的 `AGENTS.md`；`docs/` A~E 骨架；`scripts/gates.json` + `scripts/verify.mjs` + `scripts/check-constitution.mjs` + `scripts/docs-check.mjs`；`.github/workflows/ci.yml`（含门禁统一入口 job）；`.gitignore`；`CHANGELOG.md`；`.husky/pre-commit` / `pre-push`（需用户同意）。
- **应跳过**：Go / Python 相关命令与 job；无 Docker 探测证据时不生成 Dockerfile；无测试框架时不写具体测试用例（只出 B-03 测试制度）。

| 校验点 | 判定方法 |
|--------|----------|
| 根 `AGENTS.md` ≤ 300 行且含子项目索引表 ≥ 3 行 | `node scripts/docs-check.mjs` + 人工核对索引表行数 |
| `server/`、`admin/`、`client/` 下均存在 `AGENTS.md` | 逐个 `fs.existsSync` |
| 命令与包管理器一致（`pnpm -r` / `pnpm --filter`，无 npm / yarn 残留） | 全文检索 `npm run` / `yarn` 命中数为 0 |
| `scripts/gates.json` ≥ 2 条且 `verify` 实跑通过 | `node scripts/verify.mjs` 退出码 0 |
| 无固定模板残留占位符 | 检索 `{{` / `<组件名>` / `TODO:` 类未替换占位符命中数为 0 |

### 3.2 Go 后端

- **输入特征**：`go.mod` + `cmd/` + `internal/`；无 `package.json`。
- **期望产物**：`AGENTS.md`（Go 风格命令：`go build ./...` / `go test ./...` / 已装的 lint 工具）；`docs/` A~E 骨架（B-03 测试制度按 Go 惯例）；`scripts/gates.json` 与统一入口（按 `gates-templates.md` 第四章宿主优先级选择）；CI job（Go setup + test）。
- **应跳过**：前端与 Node 专属内容（npm / yarn / husky / `.cursor/rules` 中的前端片段）。

| 校验点 | 判定方法 |
|--------|----------|
| 门禁宿主选择符合 `references/gates-templates.md` 第四章优先级（已有 `make` 则复用 `verify:` 目标，不新增入口） | 人工核对宿主与装配点 |
| `go test ./...` 出现在测试制度文档中，且命令可执行（未编造 flag） | 人工核对 + 本地实跑 |
| CI 语言为 Go（setup-go），无 Node 专属步骤 | 读取生成的 workflow |
| `gates.json` 的 `run` 均在项目已装工具范围内（零新依赖） | 由 `check-constitution` **规则 C** + 人工复核 |

### 3.3 Python 数据管道

- **输入特征**：`pyproject.toml` + `dags/` + `dbt_project.yml`。
- **期望产物**：`AGENTS.md`；业务类型推断为「数据管道 / ETL」并落到 `docs/A/` 架构文档命名与领域模型，而非默认「Web 服务」；B-03 测试指南（pytest + dbt test）；`.pre-commit-config.yaml`（装配点按 Python 惯例选 `pre-commit` 框架）；CI job（lint + pytest + dbt test）。
- **应跳过**：husky 与前端相关 docs；无证据时不生成 Spark / Airflow 专属配置。

| 校验点 | 判定方法 |
|--------|----------|
| 业务类型推断为数据管道（`docs/A/` 文档标题与领域术语命中 ETL / dbt / DAG） | 人工核对生成文档 |
| 门禁装配点为 `pre-commit` 框架（非 husky） | 核对生成文件类型 |
| 联网 / 知识库取来的组件知识含 `{currentYear}` 占位，无硬编码年份 | 全文检索四位年份字面量 |
| `scripts/gates.json` ≥ 2 条且 `verify` 实跑通过 | `node scripts/verify.mjs` 退出码 0 |

### 3.4 Node 项目（**无测试框架**）—— A1 / A4 的关键形态

- **输入特征**：`package.json`（有 `dependencies`，`devDependencies` 无任何测试框架，无 `test` 脚本）+ `src/`，无 `test/` 目录、无 `*.test.*` 文件。
- **期望产物**：`AGENTS.md`；`docs/` A~E 骨架 + `B-00-红线与门禁映射.md` + `B-04-BUG知识库.md`；门禁层（gates.json + verify.mjs + check-constitution.mjs + docs-check + drift-check）；CI workflow **不含 test 步骤**；`docs/B/B-03-测试指南.md` **含"建立测试后由 Agent 补 CI test 步骤"契约（写明插入位置）**。
- **应跳过**：任何测试框架相关的 Commands / CI job 片段；不得为了"让 CI 有 test 步骤"而生成 `--passWithNoTests`。

| 校验点 | 判定方法 |
|--------|----------|
| 无假绿开关 | A1（`passWithNoTests` 命中数 0） |
| CI 无 test 步骤 | 读取生成的 workflow，grep `jest|vitest|pytest|npm test` 命中数 0 |
| `B-03` 有补步骤契约 | grep `B-03-测试指南.md` 命中「补」+「CI」+「test」同类表述 |
| **负向**：人为加回测试框架依赖后，检查 D 必须报 warning | 往 `package.json` 的 `devDependencies` 加 `vitest` → `node scripts/drift-check.mjs` 输出 `检查 D` warning（"建了测试却没接进 CI"） |

### 3.5 纯文档项目（**无源码根、无依赖清单**）—— A5 / A7 的关键形态

- **输入特征**：只有 `README.md` + `docs/**/*.md`；无 `package.json` / `go.mod` / `requirements*.txt` / `pyproject.toml`；无 `src/` `app/` `internal/` `cmd/` `packages/` `apps/` 任一颗源码根。
- **期望产物**：`AGENTS.md`（模块速查表列的是 `docs/` 等顶层目录）；`docs/` A~E 骨架 + `B-00-红线与门禁映射.md` + `B-04-BUG知识库.md`；门禁层；**无 CI 模板匹配**（四种语言模板均不命中）→ 不生成 workflow，并在报告中显式标注「未生成 CI + 原因 + 风险」。
- **应跳过**：全部语言专属 CI / 测试 / 依赖片段。

| 校验点 | 判定方法 |
|--------|----------|
| 权威表已生成且规则 E 生效 | A5；`check-constitution` 输出含 `规则 E：…blocking 档 N 条`，且**不含**「无权威表，已降级」 |
| 依赖检查输出**适用性裁定**而非裸"跳过" | A7；`drift-check` 输出含 `检查 A 不适用｜原因：` 且含 `风险：` |
| 模块速查表切换为回退模式并真的在检 | `drift-check` 输出含 `检查 B 切换为回退模式｜原因：…｜替代判据：…`；且对"表里写了但路径不存在"**确实报 warning** |
| **负向**：权威表删一条 blocking 红线 → 规则 E 必须报 error | 临时移除 `B-00` 中某条 `blocking` 行的对应门禁引用 → `node scripts/check-constitution.mjs` 输出 `存在红线却无门禁` error |

---

## 四、评估执行方式

- **时机**：① 发版前（打 tag 之前必跑一次全量）；② 重大流程变更后（Step 流程调整、`references/` 文件增删、门禁机制变更）；③ 常规开发不需要跑，避免评估成本高于收益。
- **角色**：**Agent 执行 + 人工复核**。Agent 跑命令、收集真实输出、逐项给 PASS / FAIL；人工复核主观项（golden case 的"业务类型推断是否合理"）与口径误判风险（见第二章）。
- **证据留痕**（参照 `references/ai-work-protocol.md` 第四章证据标准）：一律「命令 + 实际输出」，不得用"应该没问题""看起来对"替代；规模指标留行数脚本输出，闭环指标留分子 / 分母与逐条来源清单，golden case 留逐项核对表。
- **未闭环标注**：任一项无法验证时，显式标注「**未验证 + 原因 + 风险**」，不得沉默跳过；评估结论与未闭环项在发版时同步记入 `CHANGELOG.md` / `PROJECT_STATUS.md`。

---

## 五、已知不覆盖项（诚实边界）

| 未覆盖项 | 为什么暂不覆盖 | 若未来要覆盖需先做什么 |
|----------|----------------|------------------------|
| 多 Agent 协作一致性基准 | 本 Skill 为单 Agent 顺序执行的规范生成流程，当前无并发编辑 / 多 Agent 编排契约，无从定义"一致性" | 先定义多 Agent 协作契约（职责边界、写冲突裁决、共享文件锁），再据此设计可复现的评估场景 |
| 跨仓 / 迁移类任务的评估集 | 探测引擎面向单仓初始化；迁移类任务（如包管理器切换、框架升级）牵涉存量债与回滚路径，缺可复现输入 | 先定义「迁移前后契约」与回滚验证点（等价性断言 + 回滚脚本实跑），再补对应 golden case |
| 生成质量的人工主观项（规范可读性 / 规则冗余度） | 缺可稳定复现的代理指标，纯人工评分主观且成本高 | 先定 2~3 条可机检锚点（如"同一规则在两个章节重复出现""❌ 示范缺失"），把主观项降维成可机检项 |
| Node / Go / Python 之外技术栈的 golden case（如 Java / Rust / PHP） | 优先覆盖高频栈；其余栈的知识库组件条目完备度尚未逐一验证 | 先补齐对应栈在 `references/knowledge-base.md` 与 `references/ci-template.yml` 的条目，再补 golden case |
