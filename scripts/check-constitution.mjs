#!/usr/bin/env node
// scripts/check-constitution.mjs — 宪法一致性校验（AGENTS.md ↔ scripts/gates.json，零外部依赖）
//
// 判定规则（可判定、低误报；无法判定的情形降级为 info，不误报 error）：
//   A｜僵尸门禁源：gates.json 每条 source 形如 `AGENTS#<章节名>`，<章节名> 须能在 AGENTS.md 的
//      `##` / `###` 标题文字中找到（包含匹配）；找不到 → error。
//      source 指向非 AGENTS 文件（如 spec 驱动的 `spec#<change-id>`）→ info 跳过规则 A。
//   B｜未登记门禁：扫描 AGENTS.md 中「门禁清单与装配」类章节（标题含「门禁」）里出现的门禁 id
//      （kebab-case 反引号包裹，或与 gates.json 已有 id 同形），该 id 不在 gates.json 中 → warning。
//      未找到此类章节 / 章节内未出现任何 id → info 跳过。
//   C｜僵尸门禁脚本：gates.json 每条 run 中引用的脚本文件（结合 cwd 解析）必须存在 → 不存在则 error。
//   D｜无门禁标注：AGENTS.md 中 `[无门禁]` 标记所在段落内须有原因说明（含「原因 / 理由 / 因为 / Reason」
//      或括号说明），否则 → warning；全文无该标记 → info 跳过。
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

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;         // Markdown 标题
const GATE_SECTION_RE = /门禁/;                      // 「门禁清单与装配」类章节标题关键字
const GATE_ID_RE = /`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`/g; // 反引号包裹的 kebab-case 门禁 id
const FILE_REF_RE = /[\w./\\-]+\.(?:mjs|cjs|js|ts|py|sh|ps1|json|ya?ml)/g; // run 中引用的文件
const NO_GATE_MARK = '[无门禁]';
const REASON_RE = /原因|理由|因为|Reason/i;

// ————— 结果收集 —————
const infos = [];
const warnings = [];
const errors = [];

console.log('=== check-constitution ===');

const agentsAbs = resolve(ROOT, AGENTS_FILE);
if (!existsSync(agentsAbs)) {
  infos.push(`未找到 ${AGENTS_FILE}，跳过宪法一致性校验`);
  console.log(`ℹ️ info (${infos.length})`);
  infos.forEach((s) => console.log(`  - ${s}`));
  console.log('\n结果：0 error / 0 warning / 1 info（未发现 AGENTS.md）');
  process.exit(0);
}
const agents = readFileSync(agentsAbs, 'utf8');
const agentsLines = agents.split(/\r?\n/);

// `##` / `###` 标题文字（规则 A 定位用）
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
    gates = JSON.parse(readFileSync(resolve(ROOT, GATES_FILE), 'utf8'));
    if (!Array.isArray(gates)) throw new Error('顶层结构不是数组');
  } catch (err) {
    gates = [];
    errors.push(`解析 ${GATES_FILE} 失败：${err.message}`);
  }
}
const gateIds = new Set(gates.map((g) => String(g.id || '')).filter(Boolean));

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
    warnings.push(`门禁 ${gate.id} 的 source「${source}」不是 AGENTS#<章节名> 格式，无法比对`);
    continue;
  }
  const filePart = m[1].trim();
  const section = m[2].trim();
  if (!/^AGENTS(\.md)?$/i.test(filePart)) {
    infos.push(`门禁 ${gate.id} 的 source 指向非 AGENTS 文件（${filePart}），跳过规则 A`);
    continue;
  }
  checkedSource += 1;
  if (!headings.some((h) => h.text.includes(section))) {
    errors.push(
      `门禁 ${gate.id} 的 source「${source}」在 ${AGENTS_FILE} 的标题中定位不到（疑似僵尸门禁源）`
    );
  }
}
if (checkedSource === 0 && gates.length > 0) {
  infos.push(`规则 A：${gates.length} 条门禁的 source 均未指向 ${AGENTS_FILE}，无可校验项`);
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
// 段落切分：以空行为界
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

// ————— 输出 —————
console.log(`ℹ️ info (${infos.length})`);
infos.forEach((s) => console.log(`  - ${s}`));
console.log(`⚠️ warning (${warnings.length})`);
warnings.forEach((s) => console.log(`  - ${s}`));
console.log(`❌ error (${errors.length})`);
errors.forEach((s) => console.log(`  - ${s}`));
console.log(`\n结果：${errors.length} error / ${warnings.length} warning / ${infos.length} info`);

process.exit(errors.length > 0 ? 1 : 0);
