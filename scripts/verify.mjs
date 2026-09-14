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
