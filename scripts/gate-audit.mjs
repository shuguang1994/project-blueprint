#!/usr/bin/env node
// scripts/gate-audit.mjs — 门禁装配体检 + 门禁效果回溯（零外部依赖）
//
// 用法：
//   node scripts/gate-audit.mjs                          # 审计当前仓库
//   node scripts/gate-audit.mjs --repo=D:\path\to\proj   # 审计指定仓库
//   node scripts/gate-audit.mjs --repo=... --json        # 机器可读输出
//   node scripts/gate-audit.mjs --repo=... --bug-file=docs/B/B-13-BUG知识库.md
//
// 产出两份报告：
//   ① 装配体检 —— 门禁脚本三态：
//        L1 存在（磁盘） / L2 落盘（git 跟踪） / L3 接线（被入口或 CI 调用）
//        落盘率 = L2 / L1 ；生效率 = (L3 且 L2) / L1
//        并单列「被入口引用但未落盘」——这类脚本在 CI / 其他克隆上必然失效
//   ② 门禁效果回溯（ITS 口径）—— 解析 BUG 知识库（默认 docs/B/B-13-*.md）：
//        对每条缺陷模式，只从该模式的「**门禁**」字段提取配套门禁（不扫全文，
//        避免把正文提及/建议新增的脚本误计为真门禁），与门禁首次提交日 T0 比对：
//          门禁前复发 = 门禁补对了位置
//          门禁后复发 = 门禁有效性反例（需回答"为何已有门禁仍复发"）
//        统计单位为「模式」，不是「门禁 × 日期」笛卡尔积，避免重复计数。
//
// 口径声明：
//   - 「建议但未实现的门禁」单列，不计入配套门禁
//   - 门禁未落盘 → 无 T0 → 该模式的复发无法判定（单列，不混入前/后）
//   - 解析覆盖率一并输出，未覆盖条目不参与比率
//
// 说明：只读脚本，不修改目标仓库。退出码 0（分析工具，不阻断）。

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, join, basename, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ————— 参数 —————
const argOf = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3).trim() : null;
};
const REPO = resolve(argOf('repo') || SELF_ROOT);
const AS_JSON = process.argv.includes('--json');

// ————— 门禁脚本识别 —————
// 前缀命中即算门禁脚本（注意 `contract-check.mjs` / `docs-check.mjs` 前缀后直接接扩展名）
const GATE_RE = /^(check-|contract-check|docs-check|drift-check|check-constitution)[\w-]*\.(mjs|js|cjs|ts|ps1|sh)$/i;
const ANY_GATE_TOKEN_RE = /([A-Za-z0-9_.-]*check[A-Za-z0-9_.-]*\.mjs)/g; // 从文本中抓取门禁脚本名
const ENTRY_RE = /^verify\.(mjs|js|cjs|py|ps1|sh)$/i;
// 扫描目录：本类框架按约定把 skill 侧参考实现放在 references/（不复制到 scripts/），故一并扫描
const SCAN_DIRS = ['scripts', 'tools', 'ci', 'references'];

// 装配点文件（相对仓库根）
const ENTRY_CANDIDATES = [
  'scripts/gates.json',
  'package.json',
  'Makefile',
  '.gitee-ci.yml',
  '.gitlab-ci.yml',
  'lint-staged.config.mjs',
  'lint-staged.config.js',
  '.lintstagedrc',
  '.lintstagedrc.json',
  'lefthook.yml',
  'lefthook.yaml',
];
const ENTRY_GLOBS = [
  ['.github/workflows', /\.ya?ml$/i],
  ['.workflow', /\.ya?ml$/i],
  ['.husky', /^[^.]/],
  ['scripts/ci', ENTRY_RE],
];

const readIf = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const git = (args) => {
  try {
    return execSync(`git -C "${REPO}" ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
};
const tokenToName = (s) => basename(s.replace(/\\/g, '/'));

// ————— ① 装配体检 —————
const gateScripts = [];
for (const dir of SCAN_DIRS) {
  const abs = join(REPO, dir);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) continue;
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (e.isFile() && GATE_RE.test(e.name)) gateScripts.push({ name: e.name, path: `${dir}/${e.name}` });
  }
}
const onDisk = new Set(gateScripts.map((g) => g.name));
const tracked = new Set(git('ls-files').split(/\r?\n/).filter(Boolean).map((p) => p.replace(/\\/g, '/')));

const entryTexts = [];
for (const rel of ENTRY_CANDIDATES) entryTexts.push([rel, readIf(join(REPO, rel))]);
for (const [dir, re] of ENTRY_GLOBS) {
  const abs = join(REPO, dir);
  if (!existsSync(abs)) continue;
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    if (e.isFile() && re.test(e.name)) entryTexts.push([`${dir}/${e.name}`, readIf(join(abs, e.name))]);
  }
}
const allEntryText = entryTexts.map(([, t]) => t).join('\n');
const isWired = (name) =>
  new RegExp(`(^|[^\\w.-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w.-]|$)`, 'm').test(allEntryText);

const L1 = gateScripts.length;
const notTracked = gateScripts.filter((g) => !tracked.has(g.path));
const L2 = L1 - notTracked.length;
const wiredList = gateScripts.filter((g) => isWired(g.name));
const notWired = gateScripts.filter((g) => !isWired(g.name));
const effective = wiredList.filter((g) => tracked.has(g.path));

// 入口引用的门禁名（用于找「引用了但不存在 / 未落盘」）
const refTokens = new Set();
for (const m of allEntryText.matchAll(ANY_GATE_TOKEN_RE)) refTokens.add(tokenToName(m[1]));
const refMissing = [...refTokens].filter((n) => !onDisk.has(n)).sort();
const refNotTracked = [...refTokens]
  .filter((n) => onDisk.has(n))
  .filter((n) => !tracked.has(gateScripts.find((g) => g.name === n).path))
  .sort();

// ————— ② 门禁效果回溯 —————
const findBugFile = () => {
  const explicit = argOf('bug-file');
  if (explicit) return join(REPO, explicit);
  for (const cand of ['docs/B/B-13-BUG知识库.md', 'docs/B/B-04-BUG知识库.md']) {
    if (existsSync(join(REPO, cand))) return join(REPO, cand);
  }
  const dir = join(REPO, 'docs/B');
  if (existsSync(dir)) {
    const hit = readdirSync(dir).find((f) => /BUG/i.test(f) && f.endsWith('.md'));
    if (hit) return join(dir, hit);
  }
  return null;
};

const DATE_RE = /20\d{2}-\d{2}-\d{2}/g;
const t0Cache = new Map();
const gateT0 = (name) => {
  if (t0Cache.has(name)) return t0Cache.get(name);
  const g = gateScripts.find((x) => x.name === name);
  let t0 = null;
  if (g && tracked.has(g.path)) {
    const out = git(`log --diff-filter=A --format=%ad --date=short -- "${g.path}"`);
    const dates = out.split(/\r?\n/).map((s) => s.trim()).filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)).sort();
    t0 = dates[0] || null;
  }
  t0Cache.set(name, t0);
  return t0;
};

let bug = null;
const bugFile = findBugFile();
if (bugFile) {
  const lines = readFileSync(bugFile, 'utf8').split(/\r?\n/);
  const modes = [];
  let cur = null;
  const schemaSeen = new Set();
  for (const line of lines) {
    const trimmed = line.trim();
    // 文档末尾的版本变更日志（如 `v1.68.0 | 最后更新: …`）不是缺陷条目的一部分，遇到即终止当前模式，
    // 否则最后一条模式会吞掉整段变更日志，把日志里提到的门禁误算成该模式的配套门禁。
    if (/^v\d+\.\d+\.\d+\s*\|/.test(trimmed)) { if (cur) { modes.push(cur); cur = null; } continue; }
    // schema A：`### 2.113 模式 DI：标题`（数字编号 + 模式字母）
    const h3 = /^###\s*(\d+\.\d+)\s*(?:模式\s*([A-Z]{1,3}))?\s*[：: ]\s*(.*)$/.exec(trimmed);
    // schema B：`## BUG-014 | 标题`（BUG 序号；要求带 BUG- 前缀，避开「记录模板」等非条目小节）
    const h2bug = /^##\s*BUG-(\d+)\s*[|｜]\s*(.*)$/.exec(trimmed);
    if (h3) {
      if (cur) modes.push(cur);
      schemaSeen.add('A：### 序号.序号 模式 X：标题');
      cur = { id: h3[1], letter: h3[2] || '', title: h3[3] || '', body: [], parsed: true };
      continue;
    }
    if (h2bug) {
      if (cur) modes.push(cur);
      schemaSeen.add('B：## BUG-NNN | 标题');
      cur = { id: `BUG-${h2bug[1]}`, letter: '', title: h2bug[2] || '', body: [], parsed: true };
      continue;
    }
    if (/^#{1,3}\s/.test(trimmed)) { if (cur) { modes.push(cur); cur = null; } continue; }
    if (cur) cur.body.push(line);
  }
  if (cur) modes.push(cur);

  const headings = lines.filter((l) => /^#{1,3}\s/.test(l.trim())).length;

  const analysed = modes.filter((m) => m.parsed).map((m) => {
    const body = m.body.join('\n');
    const bodyLines = m.body;
    // 复发：标题或正文出现「复发」
    const recurLines = [m.title, ...bodyLines].filter((l) => l.includes('复发'));
    const recurDates = [...new Set(recurLines.flatMap((l) => l.match(DATE_RE) || []))].sort();

    // 配套门禁：只取「**门禁**」或「**预防**」字段行（早期条目常用「预防」字段名），
    // 不扫全文 —— 避免把正文提及、关联引用、建议新增的脚本误计为真门禁
    const gateFieldLines = bodyLines.filter((l) => /\*\*[^*\n]*(门禁|预防)[^*\n]*\*\*/.test(l));
    const declared = new Set();
    const suggested = new Set();
    for (const l of gateFieldLines) {
      const isSuggestion = /建议(新增|补)|待补|暂无/.test(l);
      for (const mm of l.matchAll(ANY_GATE_TOKEN_RE)) {
        const n = tokenToName(mm[1]);
        if (isSuggestion && !onDisk.has(n)) suggested.add(n);
        else declared.add(n);
      }
    }
    // 已落盘且有 T0 的才算"真配套门禁"
    const realGates = [...declared].filter((n) => onDisk.has(n));
    const t0s = realGates.map((n) => gateT0(n)).filter(Boolean).sort();
    const t0 = t0s[0] || null;

    let verdict = 'n/a';
    if (declared.size === 0 && suggested.size > 0) verdict = 'suggested-only';
    else if (declared.size === 0) verdict = 'no-gate';
    else if (!t0) verdict = 'gate-not-landed';
    else if (recurDates.length === 0) verdict = recurLines.length ? 'recur-no-date' : 'ok';
    else verdict = recurDates[recurDates.length - 1] > t0 ? 'recur-after-gate' : 'recur-before-gate';

    return {
      id: m.id,
      letter: m.letter,
      title: m.title.slice(0, 70),
      recurLines: recurLines.length,
      recurDates,
      realGates,
      suggested: [...suggested],
      t0,
      verdict,
    };
  });

  const byVerdict = {};
  for (const a of analysed) byVerdict[a.verdict] = (byVerdict[a.verdict] || 0) + 1;

  const allSuggested = new Set(analysed.flatMap((a) => a.suggested));
  const perGate = [...new Set(analysed.flatMap((a) => a.realGates))].sort().map((g) => {
    const rel = analysed.filter((a) => a.realGates.includes(g));
    return {
      gate: g,
      t0: gateT0(g),
      modes: rel.length,
      recurBefore: rel.filter((a) => a.verdict === 'recur-before-gate' && a.t0 === gateT0(g)).length,
      recurAfter: rel.filter((a) => a.verdict === 'recur-after-gate' && a.realGates.includes(g)).length,
    };
  });

  bug = {
    file: relative(REPO, bugFile).replace(/\\/g, '/'),
    headings,
    schema: [...schemaSeen],
    parsedModes: analysed.length,
    unparsedHeadings: headings - analysed.length,
    withGateDeclared: analysed.filter((a) => a.realGates.length > 0 || a.suggested.length > 0).length,
    byVerdict,
    suggestedNotImplemented: [...allSuggested].sort(),
    recurAfterDetail: analysed.filter((a) => a.verdict === 'recur-after-gate'),
    recurModes: analysed.filter((a) => a.recurLines > 0).length,
    perGate,
  };
}

// ————— 输出 —————
const pct = (a, b) => (b === 0 ? 'n/a' : `${((a / b) * 100).toFixed(1)}%`);
const report = {
  repo: REPO,
  装配体检: {
    L1_磁盘存在: L1,
    L2_已落盘: L2,
    L3_已接线: wiredList.length,
    L3且L2_已生效: effective.length,
    落盘率: pct(L2, L1),
    生效率: pct(effective.length, L1),
    未落盘: notTracked.map((g) => g.path),
    未接线: notWired.map((g) => g.path),
    入口引用但未落盘: refNotTracked,
    入口引用但不存在: refMissing,
  },
  门禁效果: bug,
};

if (AS_JSON) { console.log(JSON.stringify(report, null, 2)); process.exit(0); }

const line = (s = '') => console.log(s);
line('=== gate-audit ===');
line(`目标仓库：${REPO}`);
line('');
line('——— ① 装配体检 ———');
line(`L1 磁盘存在：${L1}`);
line(`L2 已落盘（git 跟踪）：${L2}　→ 落盘率 ${pct(L2, L1)}`);
line(`L3 已接线（被入口/CI 调用）：${wiredList.length}`);
line(`L3 且 L2（真正生效）：${effective.length}　→ 生效率 ${pct(effective.length, L1)}`);
const block = (title, arr, fmt = (x) => x) => {
  if (!arr.length) return;
  line('');
  line(`${title}（${arr.length}）`);
  arr.forEach((x) => line(`   - ${fmt(x)}`));
};
block('⚠️ 未落盘（磁盘有、git 无 → CI/他人克隆上不存在）', notTracked, (g) => g.path);
block('🔴 被入口引用但未落盘（在 CI 上必然失效）', refNotTracked);
block('🔴 被入口引用但磁盘不存在', refMissing, (n) => n);
block('ℹ️ 未接线（存在但无任何入口/CI 调用）', notWired, (g) => g.path);

line('');
line('——— ② 门禁效果回溯 ———');
if (!bug) {
  line('未找到 BUG 知识库（docs/B/B-13-*.md 或 B-04-*.md），跳过');
} else {
  line(`数据源：${bug.file}　标题 schema：${bug.schema.join(' / ') || '未识别'}`);
  line(`标题总数 ${bug.headings}　解析为缺陷条目 ${bug.parsedModes}（未解析 ${bug.unparsedHeadings}）　有门禁字段 ${bug.withGateDeclared}　含「复发」 ${bug.recurModes}`);
  line('');
  line('模式判定分布（单位＝模式，非事件）：');
  const label = {
    'recur-after-gate': '🔴 门禁后复发（门禁有效性反例）',
    'recur-before-gate': '✅ 门禁前复发（门禁补对位置）',
    'recur-no-date': '⚠️ 有复发但无日期（无法定位）',
    'gate-not-landed': '⚠️ 门禁存在但未落盘（无 T0，无法判定）',
    'suggested-only': '⚠️ 仅"建议新增"门禁，未实现',
    'no-gate': '➖ 无门禁字段',
    ok: '✅ 有门禁且无复发记录',
  };
  for (const [k, v] of Object.entries(bug.byVerdict).sort((a, b) => b[1] - a[1])) {
    line(`   ${(label[k] || k).padEnd(38)} ${String(v).padStart(3)} 个模式`);
  }
  if (bug.suggestedNotImplemented.length) {
    line('');
    line(`建议但未实现的门禁（${bug.suggestedNotImplemented.length}）：${bug.suggestedNotImplemented.join(', ')}`);
  }
  if (bug.recurAfterDetail.length) {
    line('');
    line('门禁后复发明细：');
    for (const a of bug.recurAfterDetail) {
      line(`   - §${a.id} 模式 ${a.letter}｜配套门禁 ${a.realGates.join('/')}（T0=${a.t0}）｜复发日 ${a.recurDates.join(', ')}｜${a.title}`);
    }
  }
  if (bug.perGate.length) {
    line('');
    line('按门禁分组（T0 / 关联模式数 / 该门禁成立前复发 / 后复发）：');
    for (const g of bug.perGate) {
      line(`   - ${g.gate.padEnd(34)} T0=${(g.t0 || '—').padEnd(10)} 模式 ${String(g.modes).padStart(2)}　前 ${g.recurBefore}　后 ${g.recurAfter}`);
    }
  }
}
line('');
line('说明：只读分析；未解析条目与无日期复发不参与前/后判定，避免以偏概全。');
process.exit(0);
