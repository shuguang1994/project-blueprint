# 门禁清单与校验脚本模板集

> 生成到目标项目 `scripts/`：`gates.json`（门禁唯一事实源）+ `verify.*`（统一入口）+ `check-constitution.*`（宪法自校验）+ `drift-check.*`（漂移门，见第八章）的模板与宿主翻译说明。
> 引用方：SKILL.md Step 3（生成脚本）/ Step 5.5（门禁装配）/ Step 7（门禁生长）
> 版本: v2.0 | 更新: 2026-10-14
> v2.0 变更：① `source` 由「章节名」改为「稳定红线 ID + 章节名提示」`AGENTS#<ID>[@<章节名>]`（G3）；② 新增**红线权威表**（§一之二）为唯一引用源，AGENTS.md 只做索引；③ `check-constitution` 换用本仓已验证实现并新增**规则 E**「blocking 红线必须有门禁」（G6）；④ `drift-check` 新增**检查 D**「测试框架 ↔ CI test 步骤」（G1 配套）；⑤ §八 补 `spec-drift` 的宿主与 CI 装配要求

---

## 一、门禁清单 `scripts/gates.json`（唯一事实源）

门禁清单一律以 `scripts/gates.json` 为唯一事实源；`verify.*`、`check-constitution.*`、AGENTS.md 均引用它，禁止另建第二份清单。

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识，kebab-case（如 `docs-consistency`） |
| `source` | string | 是 | 来源红线，格式 `AGENTS#<红线 ID>[@<章节名提示>]`（如 `AGENTS#RL-01@文档契约`）。**`<红线 ID>` 是权威引用**，须能在红线权威表（§一之二）中定位；`@<章节名提示>` 仅供人读，改章节名不影响判定。旧形态 `AGENTS#<章节名>` 仍可解析但记 `warning`（章节改名即静默断链） |
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
    "source": "AGENTS#RL-01@文档契约",
    "level": "blocking",
    "stage": ["pre-push", "ci"],
    "run": "node scripts/docs-check.mjs",
    "cwd": ".",
    "why": "文档漂移无人发现（存量项目实测多篇文档缺状态头）"
  },
  {
    "id": "debug-residue",
    "source": "AGENTS#RL-10@代码红线",
    "level": "blocking",
    "stage": ["pre-commit", "ci"],
    "run": "node scripts/checks/debug-residue.mjs",
    "cwd": ".",
    "why": "AI 常遗留 console.log / debugger / 断点语句，实测多次发生"
  },
  {
    "id": "type-check",
    "source": "AGENTS#RL-20@强制规范",
    "level": "warn",
    "stage": ["ci"],
    "run": "npm run typecheck",
    "cwd": ".",
    "why": "项目已配 tsc，类型漂移应在 CI 暴露（存量项目默认先 warn）"
  }
]
```

> `RL-10` / `RL-20` 是示意编号——**实际编号由生成时向权威表追加分配**（见 §一之二），不得手写未登记的 ID（规则 A 会报 error）。

---

## 一之二、红线权威表 `docs/B/B-00-红线与门禁映射.md`（`source` 的唯一引用源）

**为什么需要它**：`gates.json` 的 `source` 必须指向某条红线，但**红线清单不能放在 `AGENTS.md` 里**——AGENTS.md 是索引层（≤ 300 行），把清单塞进去会导致「AGENTS 一份 + gates.json 一份」的**双份维护**，改名 / 增删时必然漂移（违反「契约唯一源」元规则）。因此红线的唯一权威源是这张表，`AGENTS.md` 只做索引。

**表结构（生成时创建，编号 append-only、不复用）**：

```markdown
# 红线与门禁映射

> 版本: v1.0 | 更新: {date} | 状态: 生效
> **本表是红线的唯一事实源**：`scripts/gates.json` 的 `source` 引用本表 ID；`scripts/check-constitution.*` 做双向覆盖校验。

| ID | 档位 | 红线内容 | 对应门禁 | 检查方式 | 无门禁原因 |
|----|------|----------|----------|----------|------------|
| RL-01 | blocking | docs/ 文档须有状态头 / 编号唯一 / 索引覆盖 | `docs-consistency` | `node scripts/docs-check.mjs` | — |
| RL-02 | blocking | 依赖与源码目录变更须同步 AGENTS.md 技术栈行 / 模块速查表 | `spec-drift` | `node scripts/drift-check.mjs` | — |
```

**填写规则（三条硬约束）**：

1. **`ID`**：`<前缀>-<两位序号>`（`RL` / `SEC` / `PERF` 等），**append-only、不复用**；作废不删行，改档位为 `retired`。
2. **`档位`**：取值 `blocking` / `warn` / `pre-commit` / `ci-only` / `retired`。含 `blocking` 的行 **必须**有 ≥1 条门禁引用，否则 `check-constitution` 规则 E 报 `error`。
3. **`无门禁原因`**：该红线确实无法机检时填原因，并把档位写为 `blocking` + 在「检查方式」列标 `[无门禁]`——规则 E 会降级为 `warning` 而不是 `error`；**留空视为未处理**。

**编号分配规则**：初始化时分配 `RL-01` / `RL-02`（对应两条种子门禁）；后续新增阻断级红线时**追加**下一号，同时把 `gates.json` 新条目的 `source` 指向它。**禁止**先写 `gates.json` 再补权威表（规则 A 会立刻报"引用了不存在的 ID"——这正是"先红后绿"的正确顺序）。

---

## 二、统一入口 `scripts/verify.*`（Node 宿主：`scripts/verify.mjs`）

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
//
// 读取唯一事实源 scripts/gates.json，按 stage 过滤后逐条执行 run（在 cwd 目录下执行），
// 输出每条门禁的执行结果与耗时汇总表。本地与 CI 共用同一入口，保证语义一致。
//
// 用法：
//   node scripts/verify.mjs                  # 跑全部门禁
//   node scripts/verify.mjs --stage=pre-commit
//   node scripts/verify.mjs --stage=pre-push # 跑 pre-commit + pre-push（含更早阶段）
//   node scripts/verify.mjs --stage=ci       # 跑全量
//
// 失败语义：blocking 失败 → 阻断（退出码 1）；warn 失败 → 仅提示，不影响退出码；全部通过 → 0。
// 退出码：0 = 无 blocking 失败；1 = 存在 blocking 失败或门禁清单不可解析。
//
// 说明：本仓库的检查脚本位于 references/（skill 侧参考实现，不复制到 scripts/ 以免两份事实源），
//       故 gates.json 的 run 指向 references/*.mjs；按 references/gates-templates.md 生成到目标项目时，
//       脚本位于 scripts/，run 相应指向 scripts/*。零外部依赖：只用 Node 内置模块。

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GATES_FILE = join('scripts', 'gates.json');
const STAGE_ORDER = ['pre-commit', 'pre-push', 'ci']; // 由早到晚

// ————— 结果收集 —————
const infos = [];
const warnings = [];
const errors = [];

// ————— 参数解析 —————
const stageArg = process.argv.find((a) => a.startsWith('--stage='));
let stage = stageArg ? stageArg.slice('--stage='.length).trim() : null;
if (stage && !STAGE_ORDER.includes(stage)) {
  warnings.push(`未知阶段「${stage}」（可选 ${STAGE_ORDER.join(' / ')}），按全量执行`);
  stage = null;
}

console.log('=== verify ===');

const gatesAbs = resolve(ROOT, GATES_FILE);
if (!existsSync(gatesAbs)) {
  infos.push(`未找到门禁清单 ${GATES_FILE}，跳过（退出 0）`);
  console.log(`ℹ️ info (${infos.length})`);
  infos.forEach((s) => console.log(`  - ${s}`));
  console.log('\n结果：0 error / 0 warning / 1 info（未发现门禁清单）');
  process.exit(0);
}

let gates = [];
try {
  gates = JSON.parse(readFileSync(gatesAbs, 'utf8'));
  if (!Array.isArray(gates)) throw new Error('顶层结构不是数组');
} catch (err) {
  console.error(`❌ 解析门禁清单 ${GATES_FILE} 失败：${err.message}`);
  process.exit(1);
}

// ————— 阶段过滤：不传 stage 跑全量；传 stage 时连同更早阶段一起跑 —————
const stageIdx = stage ? STAGE_ORDER.indexOf(stage) : -1;
const selected = gates.filter((gate) => {
  if (!stage) return true;
  if (!Array.isArray(gate.stage) || gate.stage.length === 0) return true; // 未声明阶段 → 视为全阶段
  return gate.stage.some((s) => STAGE_ORDER.indexOf(s) !== -1 && STAGE_ORDER.indexOf(s) <= stageIdx);
});

infos.push(`门禁清单 ${GATES_FILE}，共 ${gates.length} 条`);
infos.push(
  stage
    ? `阶段过滤 ${stage}（含更早阶段 ${STAGE_ORDER.slice(0, stageIdx).join(' / ') || '无'}），命中 ${selected.length} 条`
    : `未指定阶段，执行全部 ${selected.length} 条`
);

// ————— 逐条执行 —————
const rows = [];
let blockingFails = 0;
let warnFails = 0;

for (const [i, gate] of selected.entries()) {
  const id = gate.id || `(未命名门禁-${i + 1})`;
  const level = gate.level === 'blocking' ? 'blocking' : 'warn';
  if (typeof gate.run !== 'string' || gate.run.trim() === '') {
    warnings.push(`门禁 ${id} 缺少 run 字段，已跳过`);
    continue;
  }
  const cwd = resolve(ROOT, gate.cwd || '.');

  console.log(`\n——— ▶️ ${id} [${level}] ${gate.run} ———`);
  const started = Date.now();
  let ok = true;
  let output = '';
  let detail = '';
  try {
    output = execSync(gate.run, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    ok = false;
    output = `${err.stdout || ''}${err.stderr || ''}`;
    detail = err.status === undefined ? `启动失败：${err.message}` : `退出码 ${err.status}`;
  }
  const cost = Date.now() - started;
  if (output.trim()) console.log(output.replace(/\s+$/, ''));
  console.log(ok ? `✅ ${id} 通过（${cost}ms）` : `❌ ${id} 失败（${cost}ms，${detail}）`);

  rows.push({ id, level, ok, cost, source: gate.source || '-' });
  if (!ok && level === 'blocking') {
    blockingFails += 1;
    errors.push(`门禁 ${id} 失败（blocking 级，已阻断）：${detail}`);
  } else if (!ok) {
    warnFails += 1;
    warnings.push(`门禁 ${id} 失败（warn 级，不阻断）：${detail}`);
  }
}

if (rows.length === 0) {
  infos.push('当前阶段无命中门禁');
}

// ————— 输出：分级结果 + 耗时汇总表 + 末尾汇总行 —————
console.log('\n=== 门禁分级结果 ===');
console.log(`ℹ️ info (${infos.length})`);
infos.forEach((s) => console.log(`  - ${s}`));
console.log(`⚠️ warning (${warnings.length})`);
warnings.forEach((s) => console.log(`  - ${s}`));
console.log(`❌ error (${errors.length})`);
errors.forEach((s) => console.log(`  - ${s}`));

console.log('\n=== 门禁耗时汇总 ===');
if (rows.length === 0) {
  console.log('  （无）');
} else {
  const width = Math.max(...rows.map((r) => r.id.length), 12);
  for (const r of rows) {
    console.log(
      `${r.ok ? '✅' : '❌'} ${r.id.padEnd(width)}  ${String(r.cost).padStart(6)}ms  [${r.level}]  ${r.source}`
    );
  }
}

const totalMs = rows.reduce((sum, r) => sum + r.cost, 0);
console.log(
  `\n结果：共 ${rows.length} 条门禁（blocking 失败 ${blockingFails} 条 / warn 失败 ${warnFails} 条），耗时合计 ${totalMs}ms`
);
console.log(`${blockingFails > 0 ? '❌ 存在 blocking 失败，已阻断' : '✅ 无 blocking 失败'}`);

process.exit(blockingFails > 0 ? 1 : 0);
```

---

## 三、宪法一致性校验 `scripts/check-constitution.*`

校验 `AGENTS.md`（宪法）与 `scripts/gates.json`（门禁清单）的双向一致性，防止"写了红线却无门禁"或"门禁成僵尸"。

**判定规则与级别**（v2.0：红线权威表为唯一引用源，AGENTS.md 只做索引）：

| 规则 | 内容 | 级别 |
|------|------|------|
| A | `source` 形如 `AGENTS#<红线 ID>[@<章节名提示>]`，<红线 ID> 必须能在**权威表**中定位到 | error |
| A' | `source` 用旧形态 `AGENTS#<章节名>`（无 ID）→ 提示迁移（章节改名即静默断链） | warning |
| B | AGENTS.md 门禁章节里出现的门禁 id 不在 `gates.json` 中（未登记） | warning |
| C | `gate.run` 引用的脚本 / 文件不存在（僵尸门禁） | error |
| D | 标了 `[无门禁]` 但未写明原因 | warning |
| **E** | **权威表中档位为 `blocking` 的红线，`gates.json` 中必须 ≥1 条门禁引用它**（"有红线无门禁"方向） | **error** |
| — | `gates.json` 条目数超阈值且 `warn` 级占比 > 50%（门禁只增不收敛） | info |

**降级策略（不得静默通过）**：权威表不存在时，规则 A 退回「章节名兜底匹配」、规则 E **不执行**，并输出两条 info：① 已降级的事实；② **未覆盖的风险**（"无法检出存在阻断级红线但没有任何门禁"）。禁止在无权威表时静默给出"0 error"。

**Node 版参考实现（`scripts/check-constitution.mjs`，规则 A / A' / B / C / D / E）**：

```javascript
#!/usr/bin/env node
// scripts/check-constitution.mjs — 宪法一致性校验（红线权威表 ↔ gates.json，零外部依赖）
//
// 为什么不是「AGENTS.md ↔ gates.json」直接比对：AGENTS.md 只做**索引**（保持 ≤ 300 行、不持有红线清单），
// 红线的唯一权威源是 `docs/B/B-XX-红线与门禁映射.md` 的映射表。把清单一并写进 AGENTS.md 会造成
// 「AGENTS 一份 + gates.json 一份」的双份维护，改名 / 增删时必然漂移（= 契约唯一源元规则）。
//
// 判定规则（可判定、低误报；无法判定的情形降级为 info，不误报 error）：
//   A｜僵尸门禁源：gates.json 每条 source 须为 `AGENTS#<REDLINE-ID>[@<章节名提示>]` 形态，
//      <REDLINE-ID> 必须能在权威表中定位到 → 找不到 → error。
//      旧形态 `AGENTS#<章节名>`（无 ID）→ warning（章节改名即静默断链，提示迁移）。
//      source 指向非 AGENTS 文件（如 spec 驱动的 `spec#<change-id>`）→ info 跳过规则 A。
//      无权威表时：规则 A 降级为「章节名 ↔ 标题」兜底匹配，且**定位失败由 error 降为 warning**
//      （不因"尚未建权威表"让新项目第一天就红），同时输出降级事实与未覆盖风险两条 info。
//   B｜未登记门禁：扫描 AGENTS.md 中「门禁清单与装配」类章节（标题含「门禁」）里出现的门禁 id
//      （kebab-case 反引号包裹，或与 gates.json 已有 id 同形），该 id 不在 gates.json 中 → warning。
//   C｜僵尸门禁脚本：gates.json 每条 run 中引用的脚本文件（结合 cwd 解析）必须存在 → 不存在则 error。
//   D｜无门禁标注：AGENTS.md 中 `[无门禁]` 标记所在段落内须有原因说明（含「原因 / 理由 / 因为 / Reason」
//      或括号说明），否则 → warning；全文无该标记 → info 跳过。
//   E｜红线无门禁（**本条是"违宪审查"的另一半**）：权威表中档位为 blocking 的红线，
//      gates.json 中必须有 ≥1 条 gate 的 source 引用其 ID → 缺失 → error。
//      权威表不存在 → 规则 A/E 降级为 info，并显式声明**未覆盖的风险**（不得静默通过）。
//
// 用法：node scripts/check-constitution.mjs
// 退出码：0 = 无 error（warning / info 不阻断）；1 = 存在 error
//
// 零外部依赖：只用 Node 内置模块。

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS_FILE = 'AGENTS.md';
const GATES_FILE = join('scripts', 'gates.json');

// 红线权威表：按候选顺序取首个存在（生成侧默认落在 docs/B/，项目可自行增删候选）
const REDLINE_FILE_CANDIDATES = [
  'docs/B/B-00-红线与门禁映射.md',
  'docs/B/B-01-红线与门禁映射.md',
  'docs/REDLINES.md',
];

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;               // Markdown 标题
const GATE_SECTION_RE = /门禁/;                            // 「门禁清单与装配」类章节标题关键字
const GATE_ID_RE = /`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`/g;   // 反引号包裹的 kebab-case 门禁 id
const FILE_REF_RE = /[\w./\\-]+\.(?:mjs|cjs|js|ts|py|sh|ps1|json|ya?ml)/g; // run 中引用的文件
const NO_GATE_MARK = '[无门禁]';
const REASON_RE = /原因|理由|因为|Reason/i;
const REDLINE_ID_RE = /\b([A-Z]{2,5}-\d{1,4}[a-z]?)\b/g;   // 稳定 ID 形态：RL-01 / RL-47a / SEC-12
const BLOCKING_TIER_RE = /blocking|阻断/i;                  // 档位列中的"阻断"语义

// ————— 结果收集 —————
const infos = [];
const warnings = [];
const errors = [];

const readText = (abs) => readFileSync(abs, 'utf8');

console.log('=== check-constitution ===');

const agentsAbs = resolve(ROOT, AGENTS_FILE);
if (!existsSync(agentsAbs)) {
  infos.push(`未找到 ${AGENTS_FILE}，跳过宪法一致性校验`);
  console.log(`ℹ️ info (${infos.length})`);
  infos.forEach((s) => console.log(`  - ${s}`));
  console.log('\n结果：0 error / 0 warning / 1 info（未发现 AGENTS.md）');
  process.exit(0);
}
const agents = readText(agentsAbs);
const agentsLines = agents.split(/\r?\n/);

// `##` / `###` 标题文字（旧形态 source 的兜底定位用）
const headings = [];
agentsLines.forEach((line, i) => {
  const m = HEADING_RE.exec(line.trim());
  if (m) headings.push({ level: m[1].length, text: m[2], line: i + 1 });
});

// ————— 读取门禁清单 —————
let gates = [];
if (!existsSync(resolve(ROOT, GATES_FILE))) {
  infos.push(`未找到 ${GATES_FILE}，仅校验 ${AGENTS_FILE} 侧标注`);
} else {
  try {
    gates = JSON.parse(readText(resolve(ROOT, GATES_FILE)));
    if (!Array.isArray(gates)) throw new Error('顶层结构不是数组');
  } catch (err) {
    gates = [];
    errors.push(`解析 ${GATES_FILE} 失败：${err.message}`);
  }
}
const gateIds = new Set(gates.map((g) => String(g.id || '')).filter(Boolean));

// ————— 读取红线权威表 —————
const redlineFile = REDLINE_FILE_CANDIDATES.find((f) => existsSync(resolve(ROOT, f))) || null;
const redlineEntries = new Map(); // ID → { tier, line, id }
if (redlineFile) {
  const abs = resolve(ROOT, redlineFile);
  readText(abs).split(/\r?\n/).forEach((line, i) => {
    const s = line.trim();
    if (!s.startsWith('|')) return;
    if (/^\|[\s:|-]+\|$/.test(s)) return;                 // 表头分隔行
    const cells = s.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) return;
    const idMatch = /^([A-Z]{2,5}-\d{1,4}[a-z]?)$/.exec(cells[0].replace(/`/g, ''));
    if (!idMatch) return;
    if (/编号|ID/i.test(cells[0])) return;                 // 表头行（如 | ID | 档位 | …）
    redlineEntries.set(idMatch[1], { tier: cells[1] || '', line: i + 1, id: idMatch[1] });
  });
}
const redlineIds = new Set(redlineEntries.keys());

if (!redlineFile) {
  infos.push(
    `未找到红线权威表（候选 ${REDLINE_FILE_CANDIDATES.join(' / ')}），规则 A 降级为章节名兜底匹配、规则 E 不执行`
  );
  infos.push(
    `⚠️ 未覆盖的风险：无法检出「存在阻断级红线但没有任何门禁」——这是"违宪审查"的另一半，本仓当前只查得出僵尸门禁`
  );
} else {
  infos.push(`红线权威表：${redlineFile}，共解析 ${redlineEntries.size} 条红线`);
}

// ————— 规则 A｜僵尸门禁源 —————
let checkedSource = 0;
for (const gate of gates) {
  const source = String(gate.source || '').trim();
  if (!source) {
    warnings.push(`门禁 ${gate.id} 缺少 source 字段，无法做双向比对`);
    continue;
  }
  const m = /^([^#]+)#(.+)$/.exec(source);
  if (!m) {
    warnings.push(`门禁 ${gate.id} 的 source「${source}」不是 AGENTS#<ID>[@<章节名>] 格式，无法比对`);
    continue;
  }
  const filePart = m[1].trim();
  let refPart = m[2].trim();
  if (!/^AGENTS(\.md)?$/i.test(filePart)) {
    infos.push(`门禁 ${gate.id} 的 source 指向非 AGENTS 文件（${filePart}），跳过规则 A`);
    continue;
  }
  checkedSource += 1;

  const at = refPart.indexOf('@');
  const idPart = (at === -1 ? refPart : refPart.slice(0, at)).trim();
  const hintPart = at === -1 ? '' : refPart.slice(at + 1).trim();
  refPart = at === -1 ? refPart : idPart;

  const looksLikeId = /^[A-Z]{2,5}-\d{1,4}[a-z]?$/.test(idPart);
  if (looksLikeId) {
    if (redlineFile && !redlineIds.has(idPart)) {
      errors.push(
        `门禁 ${gate.id} 的 source 引用了红线 ID「${idPart}」，但权威表（${redlineFile}）中无该 ID（疑似僵尸门禁源）`
      );
    }
  } else {
    // 旧形态：章节名引用 → 降级 warning（改名即静默断链）
    if (redlineFile) {
      warnings.push(
        `门禁 ${gate.id} 的 source「${source}」使用章节名引用（旧形态），章节改名即静默断链，建议迁移为 AGENTS#<红线 ID>@${refPart}`
      );
    }
    if (headings.length && !headings.some((h) => h.text.includes(refPart))) {
      const msg =
        `门禁 ${gate.id} 的 source「${source}」在 ${AGENTS_FILE} 的标题中定位不到（疑似僵尸门禁源）`;
      // 无权威表时降级为 warning：旧形态的兜底判定本就不可靠（章节名可能写在正文而非标题），
      // 不应因"尚未建权威表"就让新项目第一天就红。降级事实与未覆盖风险已在规则 A/E 的 info 中声明。
      if (redlineFile) errors.push(msg);
      else warnings.push(`${msg}（无权威表，已降级为 warning；建表后本项升为 error）`);
    }
  }
  if (hintPart && headings.length && !headings.some((h) => h.text.includes(hintPart))) {
    infos.push(`门禁 ${gate.id} 的 source 章节名提示「${hintPart}」在 ${AGENTS_FILE} 中已不存在（不影响判定，仅提示同步）`);
  }
}
if (checkedSource === 0 && gates.length > 0) {
  infos.push(`规则 A：${gates.length} 条门禁的 source 均未指向 ${AGENTS_FILE}，无可校验项`);
} else if (!redlineFile && checkedSource > 0) {
  infos.push(
    `规则 A：无权威表，已降级为「章节名 ↔ 标题」兜底匹配（覆盖 ${checkedSource} 条门禁）—— 只能发现"章节名在标题中消失"，发现不了"ID 被写错"`
  );
}

// ————— 规则 B｜未登记门禁 —————
const gateSections = headings.filter((h) => GATE_SECTION_RE.test(h.text));
if (gateSections.length === 0) {
  infos.push(`规则 B：${AGENTS_FILE} 中未找到标题含「门禁」的清单 / 装配章节，跳过未登记门禁扫描`);
} else {
  const candidates = new Set();
  for (const s of gateSections) {
    const body = [];
    for (let i = s.line; i < agentsLines.length; i += 1) {
      const m = HEADING_RE.exec(agentsLines[i].trim());
      if (m && m[1].length <= s.level) break;
      body.push(agentsLines[i]);
    }
    const text = body.join('\n');
    for (const m of text.matchAll(GATE_ID_RE)) candidates.add(m[1]);
    for (const id of gateIds) {
      if (id && new RegExp(`(?<![\\w-])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(text)) {
        candidates.add(id);
      }
    }
  }
  const unregistered = [...candidates].filter((id) => !gateIds.has(id));
  for (const id of unregistered) {
    warnings.push(`${AGENTS_FILE} 门禁章节标了门禁 id「${id}」，但 ${GATES_FILE} 中无对应条目（未登记）`);
  }
  if (candidates.size === 0) {
    infos.push(
      `规则 B：扫描 ${gateSections.length} 个门禁章节（${gateSections.map((s) => `L${s.line}`).join(' / ')}），未出现门禁 id 标注`
    );
  } else {
    infos.push(
      `规则 B：扫描 ${gateSections.length} 个门禁章节，命中门禁 id ${candidates.size} 个，其中未登记 ${unregistered.length} 个`
    );
  }
}

// ————— 规则 C｜僵尸门禁脚本 —————
let refCount = 0;
for (const gate of gates) {
  const refs = String(gate.run || '').match(FILE_REF_RE) || [];
  for (const ref of refs) {
    refCount += 1;
    if (!existsSync(resolve(ROOT, gate.cwd || '.', ref))) {
      errors.push(`门禁 ${gate.id} 引用的文件不存在：${ref}（僵尸门禁，指向已删除的脚本）`);
    }
  }
}
if (gates.length > 0 && refCount === 0) {
  infos.push(`规则 C：${gates.length} 条门禁的 run 字段未引用脚本文件，无可校验项`);
} else if (gates.length > 0) {
  infos.push(`规则 C：${gates.length} 条门禁共引用 ${refCount} 个文件，均已存在`);
}

// ————— 规则 D｜无门禁标注 —————
const paragraphs = [];
let cur = { line: 1, text: [] };
agentsLines.forEach((line, i) => {
  if (line.trim() === '') {
    if (cur.text.length) paragraphs.push(cur);
    cur = { line: i + 2, text: [] };
  } else {
    cur.text.push(line);
  }
});
if (cur.text.length) paragraphs.push(cur);

const markedParas = paragraphs.filter((p) => p.text.join('\n').includes(NO_GATE_MARK));
if (markedParas.length === 0) {
  infos.push(`规则 D：${AGENTS_FILE} 中未出现 ${NO_GATE_MARK} 标记，跳过该项`);
} else {
  let okCount = 0;
  for (const p of markedParas) {
    const text = p.text.join('\n');
    const hasReason = REASON_RE.test(text) || /[（(][^）)]{2,}[）)]/.test(text);
    if (hasReason) okCount += 1;
    else warnings.push(`${AGENTS_FILE}:${p.line} 段落标了 ${NO_GATE_MARK} 但未写明原因`);
  }
  infos.push(`规则 D：${markedParas.length} 处 ${NO_GATE_MARK} 标记，其中 ${okCount} 处已写明原因`);
}

// ————— 规则 E｜红线无门禁（违宪审查的另一半）—————
if (!redlineFile) {
  infos.push('规则 E：无权威表，未执行「阻断级红线必须有门禁」校验');
} else {
  // 每条 gate 的 source 引用的红线 ID
  const gatedIds = new Set();
  for (const gate of gates) {
    const m = /^([^#]+)#(.+)$/.exec(String(gate.source || '').trim());
    if (!m) continue;
    const idPart = String(m[2]).split('@')[0].trim();
    if (/^[A-Z]{2,5}-\d{1,4}[a-z]?$/.test(idPart)) gatedIds.add(idPart);
  }

  let blockingCount = 0;
  let uncovered = 0;
  for (const { id, tier, line } of redlineEntries.values()) {
    if (!BLOCKING_TIER_RE.test(tier)) continue;
    if (/retired|作废/i.test(tier)) continue;   // 已作废红线不要求门禁
    blockingCount += 1;
    if (gatedIds.has(id)) continue;
    uncovered += 1;
    const hasNoGateReason = /无门禁/.test(tier);
    if (hasNoGateReason) {
      warnings.push(`红线 ${id}（${redlineFile}:${line}）档位为 blocking 但无门禁，且未说明原因`);
    } else {
      errors.push(
        `红线 ${id}（${redlineFile}:${line}）档位为 blocking，但 ${GATES_FILE} 中无任何门禁引用它 —— 存在红线却无门禁`
      );
    }
  }
  infos.push(
    `规则 E：权威表 ${redlineEntries.size} 条红线，其中 blocking 档 ${blockingCount} 条，已被门禁覆盖 ${blockingCount - uncovered} 条`
  );
}

// ————— 输出 —————
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

## 五、宿主翻译要点（Python / shell / Makefile）

宿主选择见第四章。**关键约束**：模板引用哪个宿主，生成侧就必须产出那个宿主——`ci-template.yml` 的门禁 job 会调用它，**引用了不存在的宿主等于 CI 从未跑过门禁**（本 Skill 已记录过该真实缺陷）。

**等价性的唯一判据**：同一份 `gates.json`，Node / Python 两个宿主对同一 `--stage` 过滤出同一批门禁、给出同一退出码。

### 5.1 三版共同约束

- **零外部依赖**（只用标准库 / 系统自带工具）；
- 失败即非 0：`blocking` 失败 → 退出码 1；`warn` 失败仅提示；
- 输出**耗时汇总表**与末尾汇总行；
- `--stage=<name>` 按 `pre-commit → pre-push → ci` 累积过滤（传 `ci` 即跑全量）；
- **清单缺失不得静默通过**：`gates.json` 不存在时要么非 0 退出，要么输出显式声明（"未找到门禁清单，跳过"），不得给一个看起来正常的绿色汇总。

### 5.2 Python 版宿主（优先级 3 时生成到 `scripts/`）

| 生成物 | 参考实现 |
|--------|----------|
| `scripts/verify.py` | `references/verify-py-template.py` |
| `scripts/check-constitution.py` | `references/check-constitution-py-template.py` |

两份参考实现都是**可运行完整实现**（含规则 A / A' / B / C / D / E 与规则表解析），不是伪码。生成时**复制并按项目技术栈裁剪**（如增删权威表候选路径、调整 `cwd` 处理），**不要重写**——重写必然与 Node 版产生语义差。

### 5.3 Makefile 目标（优先级 4，编译型语言且无 Node / Python 时）

```makefile
# Makefile（门禁入口：make verify / make verify-stage STAGE=pre-push）
.PHONY: verify verify-stage

verify:
	@if [ -f scripts/verify.mjs ]; then node scripts/verify.mjs --stage=ci; \
	elif [ -f scripts/verify.py ]; then python3 scripts/verify.py --stage=ci; \
	else echo "❌ 未找到 scripts/verify.*（门禁入口缺失，拒绝静默通过）"; exit 1; fi

verify-stage:
	@if [ -z "$(STAGE)" ]; then echo "用法：make verify-stage STAGE=pre-push"; exit 2; fi
	@if [ -f scripts/verify.mjs ]; then node scripts/verify.mjs --stage=$(STAGE); \
	elif [ -f scripts/verify.py ]; then python3 scripts/verify.py --stage=$(STAGE); \
	else echo "❌ 未找到 scripts/verify.*"; exit 1; fi
```

> **注意**：`verify` 目标在找不到宿主时**必须 `exit 1`**——不能因为"脚本没生成"就静默 `exit 0`（那正是假绿的另一种形态）。Makefile 只是转译层，真正的过滤 / 汇总逻辑仍由 `verify.mjs` / `verify.py` 承担；**若两者都不可用，优先补 Python 版而不是手写 shell 版**。

### 5.4 shell 版（优先级 5，兜底）

`jq` 解析 `gates.json`（若项目无 `jq`，改用"清单文件即命令列表"的简化格式 `gates.txt`，逐行执行）；失败以 `$?` 判定；耗时用 `SECONDS` 或 `date +%s`；同样必须支持阶段过滤，且**无清单时不得静默退出 0**。维护成本最高（一平台一份），**最后选**。

### 5.5 硬约束与生成后自测

- **硬约束**：门禁只允许使用项目**已安装**的工具，不得要求用户新装依赖。新依赖会让用户直接绕过门禁。
- **生成后自测（不可跳过）**：宿主生成后必须**实跑一次**并贴出真实输出（命令 + 实际输出）；未实跑就写进 CI 的，视为 `blocking` 门禁未完成负向验证。

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
- **检查 B｜模块速查表 ↔ 实际目录**：探测源码根（`src/` `app/` `internal/` `cmd/` `packages/` `apps/` 取**首个存在**），列其一级子目录（跳过 `.` 开头与 `node_modules`），与 `AGENTS.md`「模块速查表」中**职责列之前的列**做集合比对：目录存在但表里没有 → `warning`；表里写了但路径不存在 → `warning`。按「**新项目 blocking / 存量项目 warn**」原则，**默认输出 `warning`** 并给出差异清单。
- **检查 C｜门禁有效性**：若存在 `scripts/gates.json`，逐条检查其 `run` 字段引用的脚本路径是否真实存在；**不存在 → `error`**（僵尸门禁，指向已删除的脚本）。与 `check-constitution` 的「`gate.run` 引用的文件必须存在」同源，此处作为独立兜底。
- **检查 D｜测试框架 ↔ CI test 步骤**（v2.0 新增，G1 的配套机检）：探测测试资产（Node：`dependencies`/`devDependencies` 中的测试框架、`package.json` 的 test 脚本、`test|tests|__tests__|spec|e2e` 目录下的测试文件；Python：`pyproject.toml`/`requirements*.txt` 中的 pytest 等），再检查仓库根 CI 配置（`.github/workflows/*.yml`、`.workflow/*.yml`、`.gitee-ci.yml` 等）中是否存在跑测试的步骤；**有测试资产但 CI 无任何 test 步骤 → `warning`**（"建了测试却没接进 CI"）。存在的意义：防止"为了不复现假绿开关而干脆删掉 test 步骤"演变成新的静默缺陷。

> **适用性裁定（v2.0 新增，不得静默跳过）**：检查 A / B / C 在仓库形态不适用时（无依赖清单 / 无源码根 / 无模块速查表 / 无门禁清单），**必须**输出形如
> `检查 X 不适用｜原因：…｜风险：…｜裁定：本仓形态不适用`
> 的 `info`，**不得只输出"跳过"**。理由（真实项目实证）：静默跳过会让"看起来绿、实际没检"的门禁被误读为"体系在守护"（某真实项目 41 条门禁的活性证据 40 条为空，门禁却以绿色输出报告了这件事）。

**统一判定**：输出 `error` / `warning` / `info` 三级并汇总；退出码 `0` = 无 error / `1` = 存在 error。**任何文件缺失 / 解析失败都输出 `info` 或 `warning` 后退出，不抛未捕获异常。**

### 8.3 门禁种子清单（初始化时播种两条）

初始化**至少播种 2 条**门禁，`level` 一律按存量情况定：**新项目 `blocking`，已有存量（文档 / 规范债）的项目 `warn`**；`source` 统一写作 `AGENTS#<红线 ID>@<章节名>`，`<红线 ID>` 同时写入**红线权威表**（§一之二），供 `check-constitution` 双向比对。

| `id` | `source` | 权威表条目（同时生成） | 作用 | 参考实现 |
|------|----------|------------------------|------|----------|
| `docs-consistency` | `AGENTS#RL-01@文档契约` | `RL-01` / blocking / 文档契约（状态头·编号唯一·索引覆盖·体积） | 文档一致性（编号 / 状态头 / 索引 / 归档冲突 + 体积） | `references/docs-check.mjs` |
| `spec-drift` | `AGENTS#RL-02@技术栈` | `RL-02` / blocking / 依赖与目录变更须同步 AGENTS.md | 规范漂移（依赖 ↔ 技术栈行 / 模块速查表 ↔ 目录 / 门禁有效性 / 测试框架 ↔ CI test 步骤） | `references/drift-check.mjs` |

> **权威表与 `gates.json` 必须同时生成**：只生成 `gates.json` 而不生成权威表，会让 `check-constitution` 的规则 A/E 双双降级（只查僵尸门禁、查不出"红线无门禁"），新项目从第一天起就是"半装"的违宪审查。
> **小项目只播种这两条**：不生成 `scripts/checks/` 目录（该目录留给领域门禁按需生长），只生成 `scripts/gates.json` + `docs/B/B-00-红线与门禁映射.md` + 统一入口 `scripts/verify.*` + 这两个检查脚本 + 各脚本对应的宿主（**宿主未被生成时，不得在 CI 里引用它**）。

**`gates.json` 条目示例**（严格沿用第一章的 7 字段，不新增字段）：

```json
{
  "id": "spec-drift",
  "source": "AGENTS#RL-02@技术栈",
  "level": "warn",
  "stage": ["pre-push", "ci"],
  "run": "node scripts/drift-check.mjs",
  "cwd": ".",
  "why": "规范漂移无人发现，存量项目实测存在依赖已加但技术栈行未同步"
}
```

`why` 必须写**真实依据**，不得留空或写套话——这是判断该门禁是否"值得存在"的唯一凭据。

> **本仓库（BP 自身）的例外与迁移说明**：本仓 `scripts/gates.json` 的 `source` 仍是旧形态 `AGENTS#<章节名>`（因本仓 AGENTS.md 章节名恰好稳定，且尚无 `docs/B/B-02` 权威表）。这不影响交付物——**交付给新项目的一律是新形态**；本仓自身迁移到权威表属后续动作，迁移前的 `check-constitution` 会输出 `warning` 提示（A' 规则），不会误报 error。

### 8.4 装配点建议

- **pre-push + CI**，**不进 pre-commit**：漂移检查要遍历依赖清单与整棵目录树，放进提交钩子会拖慢每次提交；
- CI 中作为**独立 job**，`level: warn` 时**非阻断**（只输出报告），存量债清理完再升 `blocking`；
- **`spec-drift` 与 `docs-consistency` 共用同一个门禁 job**（`node scripts/verify.mjs`），因为 `verify` 会按 `gates.json` 逐条跑——**不要为每条门禁单开 workflow**，否则又会退化成"CI 里只有一部分门禁"（真实项目实证：40 条门禁只 5 条进 CI）；
- 装配后按第七章「生成后自测」实跑一次；若登记为 `blocking`，须做负向验证（故意改错模块速查表 / 加一个未同步的依赖 / 删掉 CI 的 test 步骤 → 确认能报出 `warning` 或 `error`）。
