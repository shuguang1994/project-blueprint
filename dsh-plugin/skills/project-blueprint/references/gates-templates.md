# 门禁清单与校验脚本模板集

> 生成到目标项目 `scripts/`：`gates.json`（门禁唯一事实源）+ `verify.*`（统一入口）+ `check-constitution.*`（宪法自校验）+ `drift-check.*`（漂移门，见第八章）的模板与宿主翻译说明。
> 引用方：SKILL.md Step 3（生成脚本）/ Step 5.5（门禁装配）/ Step 7（门禁生长）
> 版本: v1.0

---

## 一、门禁清单 `scripts/gates.json`（唯一事实源）

门禁清单一律以 `scripts/gates.json` 为唯一事实源；`verify.*`、`check-constitution.*`、AGENTS.md 均引用它，禁止另建第二份清单。

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识，kebab-case（如 `docs-consistency`） |
| `source` | string | 是 | 来源红线条目，格式 `AGENTS#<章节名>`，供宪法自校验双向比对 |
| `level` | string | 是 | `blocking`（必过）｜`warn`（提示） |
| `stage` | string[] | 是 | 取值 `pre-commit` ｜ `pre-push` ｜ `ci`，可多选 |
| `run` | string | 是 | 可执行命令（只用项目已装工具，不得引入新依赖） |
| `cwd` | string | 否 | 执行目录，默认 `.`，相对仓库根 |
| `why` | string | 是 | 为什么加这条门禁，须写真实依据（如"存量项目实测多篇文档缺状态头"） |

**示例**（至少覆盖文档一致性 / 调试残留 / 类型检查三类）：

```json
[
  {
    "id": "docs-consistency",
    "source": "AGENTS#文档契约",
    "level": "blocking",
    "stage": ["pre-push", "ci"],
    "run": "node scripts/docs-check.mjs",
    "cwd": ".",
    "why": "文档漂移无人发现（存量项目实测多篇文档缺状态头）"
  },
  {
    "id": "debug-residue",
    "source": "AGENTS#代码红线",
    "level": "blocking",
    "stage": ["pre-commit", "ci"],
    "run": "node scripts/checks/debug-residue.mjs",
    "cwd": ".",
    "why": "AI 常遗留 console.log / debugger / 断点语句，实测多次发生"
  },
  {
    "id": "type-check",
    "source": "AGENTS#强制规范",
    "level": "warn",
    "stage": ["ci"],
    "run": "npm run typecheck",
    "cwd": ".",
    "why": "项目已配 tsc，类型漂移应在 CI 暴露（存量项目默认先 warn）"
  }
]
```

---

## 二、统一入口 `scripts/verify.*`

**设计约束**：

- 遍历 `gates.json` 全量清单；
- 支持 `--stage=<name>` 参数，按 `stage` 过滤（含更早阶段）；
- 逐条执行，**失败即退出非 0**（`blocking` 失败才阻断，`warn` 失败仅提示）；
- 输出**耗时汇总表**；
- **零外部依赖**，只用运行时标准库。

无 Node 时移植到 Python / shell，见第五章。

**Node 版参考实现（`scripts/verify.mjs`）**：

```javascript
#!/usr/bin/env node
// scripts/verify.mjs — 门禁统一入口（零外部依赖）
// 用法：
//   node scripts/verify.mjs                 # 跑全部门禁
//   node scripts/verify.mjs --stage=pre-push
//   node scripts/verify.mjs --stage=ci
// 退出码：0 = 无 blocking 失败；1 = 存在 blocking 失败
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const GATES_FILE = resolve(process.cwd(), 'scripts/gates.json');
const STAGE_ORDER = ['pre-commit', 'pre-push', 'ci'];

// 解析 --stage=xxx（默认全量）
const stageArg = process.argv.find((a) => a.startsWith('--stage='));
const stage = stageArg ? stageArg.split('=')[1] : null;

if (!existsSync(GATES_FILE)) {
  console.error(`[verify] 未找到门禁清单：${GATES_FILE}（跳过，退出 0）`);
  process.exit(0);
}

const gates = JSON.parse(readFileSync(GATES_FILE, 'utf8'));

// 分级执行：不传 stage 跑全量；传 stage 时连同更早阶段一起跑
const selected = gates.filter((g) => {
  if (!stage) return true;
  const idx = STAGE_ORDER.indexOf(stage);
  return g.stage.some((s) => STAGE_ORDER.indexOf(s) <= idx);
});

const rows = [];
let failed = 0;
for (const gate of selected) {
  const cwd = resolve(process.cwd(), gate.cwd || '.');
  const started = Date.now();
  let ok = true;
  try {
    execSync(gate.run, { cwd, stdio: 'inherit' });
  } catch (err) {
    ok = false;
  }
  const cost = Date.now() - started;
  rows.push({ gate, ok, cost });
  console.log(`[verify] ${ok ? 'PASS' : 'FAIL'} ${gate.id} (${cost}ms) [${gate.level}]`);
  if (!ok && gate.level === 'blocking') failed += 1;
}

console.log('\n=== 门禁耗时汇总 ===');
for (const { gate, ok, cost } of rows) {
  console.log(`${ok ? '✅' : '❌'} ${gate.id.padEnd(24)} ${String(cost).padStart(6)}ms  [${gate.level}]`);
}
console.log(`\n共 ${rows.length} 条，blocking 失败 ${failed} 条`);
process.exit(failed > 0 ? 1 : 0);
```

---

## 三、宪法一致性校验 `scripts/check-constitution.*`

校验 `AGENTS.md`（宪法）与 `scripts/gates.json`（门禁清单）的双向一致性，防止"写了红线却无门禁"或"门禁成僵尸"。

**判定规则与级别**：

| 规则 | 级别 |
|------|------|
| AGENTS.md 中标 `[门禁:<id>]` 或位于"阻断级红线"章节的条目 → `gates.json` 必须有对应 `source` | error |
| 标了 `[无门禁]` 但未写明原因 | error |
| `gate.run` 引用的脚本 / 文件不存在 | error |
| 反向：`gates.json` 每条 `source` 必须在 AGENTS.md 中可定位（防僵尸门禁） | warning |
| `gates.json` 条目数超阈值且 `warn` 级占比 > 50%（门禁只增不收敛） | info |

输出分级 `error` / `warning` / `info`，**仅 error 时退出非 0**。

**Node 版参考实现（`scripts/check-constitution.mjs`）**：

```javascript
#!/usr/bin/env node
// scripts/check-constitution.mjs — 宪法一致性校验（AGENTS.md ↔ gates.json，零外部依赖）
// 用法：node scripts/check-constitution.mjs
// 退出码：0 = 无 error（warning / info 不阻断）；1 = 存在 error
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const AGENTS_FILE = resolve(ROOT, 'AGENTS.md');
const GATES_FILE = resolve(ROOT, 'scripts/gates.json');
const GATE_THRESHOLD = 30; // 门禁数量阈值，超过则提示收敛

const errors = [];
const warnings = [];
const infos = [];

if (!existsSync(AGENTS_FILE)) {
  console.log('[constitution] 未找到 AGENTS.md，跳过校验');
  process.exit(0);
}
const agents = readFileSync(AGENTS_FILE, 'utf8');

let gates = [];
if (existsSync(GATES_FILE)) {
  gates = JSON.parse(readFileSync(GATES_FILE, 'utf8'));
} else {
  infos.push('未找到 scripts/gates.json，仅校验 AGENTS.md');
}

// —— 规则 1 / 2：扫描 AGENTS.md 中的红线标注 ——
const declaredGateIds = new Set();
agents.split(/\r?\n/).forEach((line, i) => {
  for (const m of line.matchAll(/\[门禁:([^\]]+)\]/g)) {
    declaredGateIds.add(m[1].trim());
  }
  if (line.includes('[无门禁]') && !/原因|理由|因为|Reason/i.test(line)) {
    errors.push(`AGENTS.md:${i + 1} 标了 [无门禁] 但未写明原因`);
  }
});

// 规则 1：声明了 [门禁:<id>] 的，gates.json 中必须有对应条目
const gateIds = new Set(gates.map((g) => g.id));
for (const id of declaredGateIds) {
  if (!gateIds.has(id)) {
    errors.push(`AGENTS.md 声明了 [门禁:${id}]，但 gates.json 中无对应条目`);
  }
}

// 规则 3：gate.run 引用的脚本 / 文件必须存在
const fileRe = /[\w./-]+\.(mjs|cjs|js|ts|py|sh|ps1|yml|yaml|json)/g;
for (const gate of gates) {
  const refs = String(gate.run || '').match(fileRe) || [];
  for (const ref of refs) {
    if (!existsSync(resolve(ROOT, gate.cwd || '.', ref))) {
      errors.push(`门禁 ${gate.id} 引用的文件不存在：${ref}`);
    }
  }
}

// 规则 4：反向——每条 source 须在 AGENTS.md 中可定位（防僵尸门禁）
for (const gate of gates) {
  const section = String(gate.source || '').split('#')[1] || gate.source || '';
  if (section && !agents.includes(section)) {
    warnings.push(`门禁 ${gate.id} 的 source「${gate.source}」在 AGENTS.md 中定位不到（疑似僵尸门禁）`);
  }
}

// 规则 5：门禁只增不收敛提示
if (gates.length > GATE_THRESHOLD) {
  const warnCount = gates.filter((g) => g.level === 'warn').length;
  if (warnCount / gates.length > 0.5) {
    infos.push(`门禁 ${gates.length} 条，warn 级占比 ${Math.round((warnCount / gates.length) * 100)}%，长期只增不收敛`);
  }
}

// —— 输出 ——
console.log('=== check-constitution ===');
console.log(`ℹ️ info (${infos.length})`);
infos.forEach((s) => console.log(`  - ${s}`));
console.log(`⚠️ warning (${warnings.length})`);
warnings.forEach((s) => console.log(`  - ${s}`));
console.log(`❌ error (${errors.length})`);
errors.forEach((s) => console.log(`  - ${s}`));
console.log(`\n结果：${errors.length} error / ${warnings.length} warning / ${infos.length} info`);
process.exit(errors.length > 0 ? 1 : 0);
```

---

## 四、宿主与装配点选择

**宿主优先级**（自上而下，命中即用）：

1. 项目**已有任务入口**（`npm run` / `make` / `tox` / `./gradlew` / `just`）→ 复用，不新增入口；
2. 有 Node → `scripts/verify.mjs`（三平台通吃）；
3. 无 Node 有 Python → `scripts/verify.py`；
4. 都没有（编译型语言通常有 make）→ `Makefile` 目标 `verify:`；
5. 兜底 → `verify.sh` + `verify.ps1` 双份（成本最高，最后选）。

**装配点**：

| 语言 | 装配点 |
|------|--------|
| JS / TS | husky `pre-commit`（跑快检查）+ `pre-push`（跑全量） |
| Python | `pre-commit` 框架 |
| Go / Java / Rust | `Makefile` / lefthook / CI 为主 |
| 全语言 | CI job 复用**同一** verify 入口（本地与 CI 同语义） |

**分级执行表**：

| 触发点 | 执行范围 |
|--------|----------|
| pre-commit | 只跑 `stage` 含 `pre-commit` 的门禁 |
| pre-push | 跑 `pre-commit` + `pre-push` |
| CI | 跑全量 |

---

## 五、宿主翻译要点

Node / Python / shell 三版为**等价实现**，差异与注意事项：

- **Python 版**：`subprocess.run` + `json` + `pathlib`；`--stage` 用 `argparse`；失败以 `returncode != 0` 判定。
- **shell 版**：`jq` 解析 `gates.json`（若项目无 `jq`，改用"清单文件即命令列表"的简化格式 `gates.txt`，逐行执行）；失败以 `$?` 判定；耗时用 `SECONDS` 或 `date +%s`。
- **共同点**：**零外部依赖**（只用标准库 / 系统自带工具）、失败即非 0、输出耗时汇总。

**硬约束**：**门禁只允许使用项目已安装的工具，不得要求用户新装依赖**。新依赖会让用户直接绕过门禁。

---

## 六、门禁分级与豁免治理

- `blocking`（必过）：阻断提交 / 合入；`warn`（提示）：仅输出告警，不阻断。
- **存量项目默认全部 `warn`**，随存量债清理逐步升 `blocking`。
- **豁免必须登记理由 + 设收敛目标**（目标是零豁免）；豁免项应在 BUG 知识库 / 门禁文档留痕。
- `check-constitution` 的 `info` 级提示用于发现"门禁只增不收敛"，提醒合并同类 / 清理僵尸门禁。

---

## 七、生成后自测（必做）

1. 生成门禁后**必须本地实跑一次**；
2. 跑不通的降级为 `warn` 或移入"建议清单"，**不得作为 blocking 门禁交付**；
3. 新登记 `blocking` 门禁必须做**负向验证**：故意制造一次违规 → 确认门禁能拦住（拦不住则不得登记为 `blocking`）。

---

## 八、漂移门（`spec-drift`）

### 8.1 定位

把「**代码 / 依赖 ↔ 规范**」的不一致做成**可机检事件**。规范文档（`AGENTS.md`）与实现长期分头演进，靠人同步必然漂移（行业实证：agent 配置文件 58% 只有单次提交历史、修订率 0.4 commits/月）。漂移门对应 `references/knowledge-base.md`「跨语言门禁配方表」的 **3 条漂移配方**：

| 配方 | 检查什么 | 跨语言等价物来源 |
|------|----------|------------------|
| 依赖清单 ↔ 规范漂移 | 新增依赖但 `AGENTS.md`「技术栈」行未同步 | JS/TS `package.json`；Go `go.mod`；Python `pyproject.toml` / `requirements*.txt` |
| 模块速查表 ↔ 实际目录漂移 | 源码目录新增 / 改名但模块速查表未同步 | Node `src/`；Go `internal/` + `cmd/`；Python 包目录；Java `src/main/java/**` |
| spec ↔ 代码漂移 | spec 声明的字段与代码导出产物不一致（与「契约漂移」分工：契约漂移管「源码 ↔ 导出物」，本行管「spec ↔ 代码」） | 语言无关（spec 归档于 `.trae/specs/` 或等价目录） |

### 8.2 检查脚本要点

参考实现见 `references/drift-check.mjs`，生成到目标项目 `scripts/drift-check.mjs`（或 `scripts/checks/spec-drift.*`）。**零外部依赖**，只用运行时标准库；输出分级与退出码与 `docs-check` **完全一致**：

- **检查 A｜依赖 ↔ 规范**：解析仓库根依赖清单，抽取依赖名（**去 scope 与版本约束**），逐个在 `AGENTS.md` 全文中查找；**未被提及 → `warning`**（提示可能漏同步「技术栈」行）。构建 / 工具类噪音依赖列入脚本内可编辑的 `IGNORE` 常量；「未提及」按数量汇总，最多列出前 10 个。
- **检查 B｜模块速查表 ↔ 实际目录**：探测源码根（`src/` `app/` `internal/` `cmd/` `packages/` `apps/` 取**首个存在**），列其一级子目录（跳过 `.` 开头与 `node_modules`），与 `AGENTS.md`「模块速查表」中**职责列之前的列**做集合比对：目录存在但表里没有 → `warning`；表里写了但路径不存在 → `warning`。按「**新项目 blocking / 存量项目 warn**」原则，**默认输出 `warning`** 并给出差异清单。源码根都不存在时输出 `info` 跳过。
- **检查 C｜门禁有效性**：若存在 `scripts/gates.json`，逐条检查其 `run` 字段引用的脚本路径是否真实存在；**不存在 → `error`**（僵尸门禁，指向已删除的脚本）。与 `check-constitution` 的「`gate.run` 引用的文件必须存在」同源，此处作为独立兜底。

**统一判定**：输出 `error` / `warning` / `info` 三级并汇总；退出码 `0` = 无 error / `1` = 存在 error。**任何文件缺失 / 解析失败都输出 `info` 或 `warning` 后跳过，不抛未捕获异常。**

### 8.3 门禁种子清单（初始化时播种两条）

初始化**至少播种 2 条**门禁，`level` 一律按存量情况定：**新项目 `blocking`，已有存量（文档 / 规范债）的项目 `warn`**；`source` 统一写作 `AGENTS#<章节名>`，供 `check-constitution` 双向比对。

| `id` | `source` | 作用 | 参考实现 |
|------|----------|------|----------|
| `docs-consistency` | `AGENTS#文档契约` | 文档一致性（编号 / 状态头 / 索引 / 归档冲突 + 体积） | `references/docs-check.mjs` |
| `spec-drift` | `AGENTS#技术栈` | 规范漂移（依赖 ↔ 技术栈行 / 模块速查表 ↔ 目录 / 门禁有效性） | `references/drift-check.mjs` |

> **小项目只播种这两条**：不生成 `scripts/checks/` 目录（该目录留给领域门禁按需生长），只生成 `scripts/gates.json` + 统一入口 `scripts/verify.*` + 这两个检查脚本。

**`gates.json` 条目示例**（严格沿用第一章的 7 字段，不新增字段）：

```json
{
  "id": "spec-drift",
  "source": "AGENTS#技术栈",
  "level": "warn",
  "stage": ["pre-push", "ci"],
  "run": "node scripts/drift-check.mjs",
  "cwd": ".",
  "why": "规范漂移无人发现，存量项目实测存在依赖已加但技术栈行未同步"
}
```

`why` 必须写**真实依据**，不得留空或写套话——这是判断该门禁是否"值得存在"的唯一凭据。

### 8.4 装配点建议

- **pre-push + CI**，**不进 pre-commit**：漂移检查要遍历依赖清单与整棵目录树，放进提交钩子会拖慢每次提交；
- CI 中作为**独立 job**，`level: warn` 时**非阻断**（只输出报告），存量债清理完再升 `blocking`；
- 装配后按第七章「生成后自测」实跑一次；若登记为 `blocking`，须做负向验证（故意改错模块速查表 / 加一个未同步的依赖 → 确认能报出 `warning`）。
