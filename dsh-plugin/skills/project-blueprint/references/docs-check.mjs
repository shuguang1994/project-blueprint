#!/usr/bin/env node
// scripts/docs-check.mjs — 文档体系一致性校验（种子门禁之一 docs-consistency，零外部依赖）
//
// 校验范围自适应：遍历 docs/ 下实际存在的子目录，缺失目录不再整块跳过
// （排除 archive / dev / node_modules）；docs/B、docs/C 存在时行为与改造前一致，
// 同一份脚本同时服务本仓库与生成到目标项目的 scripts/。
//
// 校验项：
//   ① 编号连续性：各 docs/<系列>/ 下 `<系列>-<n>-*.md` 的编号不从 1 到最大值跳号；
//      缺号须在 docs/archive/ 有同号归档，或在索引文件中出现该编号（视为标注预留）。
//      同一编号被多个「非语言变体」文件占用 → 编号冲突（error）；
//      带语言变体后缀（如 `-EN.md`）的文件视为同一编号的变体，不计入冲突
//   ② 状态头：各系列目录每篇前 12 行须含状态头（`> 版本: ...`），缺失记 warning（存量债不阻断）
//   ③ 索引覆盖：索引文件不存在但 docs/ 下存在文档 → warning（索引无法覆盖校验）；
//      索引存在时，其表格须覆盖该系列已收录的全部文档（`| B-nn |`），
//      且索引中的相对链接须指向存在的文件
//   ④ 归档冲突：docs/archive/<系列>-*.md 的编号不得与主目录重复
//      （带字母后缀如 B-16a 视为独立编号，跳过判定）；archive 目录不存在时输出 info
//   ⑤ 单文件体积：AGENTS.md 与 docs/ 下单篇超阈值记 warning
//
// 用法：node scripts/docs-check.mjs
// 退出码：0 = 无 error（warning 不阻断）；1 = 存在 error
//
// 说明：本脚本会被复制到结构各异的项目，目录 / 索引文件缺失或文件不可解析时输出 info / warning
//       并正常退出，不抛出未捕获异常。

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ————— 配置项（移植时集中修改，其余逻辑无需改动）—————
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_DIR = 'docs';
const EXCLUDE_DIRS = new Set(['archive', 'dev', 'node_modules']); // 不参与编号 / 状态头校验的 docs/ 子目录
const ARCHIVE_DIR = join(DOCS_DIR, 'archive');   // 归档目录（单独做冲突校验）
const INDEX_FILE = join(DOCS_DIR, 'README.md');  // 索引文件（相对仓库根）
const STATUS_HEADER_RE = /^>\s*版本[:：]/;        // 状态头正则：匹配 `> 版本: ...`
const VARIANT_RE = /(?:^|-)EN$/i;                 // 语言变体后缀（`xxx-EN.md`），同一编号的变体不计冲突
const MAX_AGENTS_LINES = 300;                    // AGENTS.md 行数上限
const MAX_DOC_LINES = 600;                       // docs/ 单篇 .md 行数上限
const STATUS_HEAD_LINES = 12;                    // 状态头检查范围（文件前 N 行）

// ————— 结果收集 —————
const infos = [];
const warnings = [];
const errors = [];

const readLines = (absPath) => readFileSync(absPath, 'utf8').split(/\r?\n/);
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 列出目录下的 .md 文件，目录不存在返回 null
const listMd = (dir) => {
  const abs = resolve(ROOT, dir);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) return null;
  return readdirSync(abs)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ name: f, path: join(dir, f) }));
};

// 列出 docs/ 下实际存在的系列目录（排除 archive / dev / node_modules 与点开头目录）
// docs/ 本身不存在时返回 null
const listSeriesDirs = () => {
  const abs = resolve(ROOT, DOCS_DIR);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) return null;
  return readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !EXCLUDE_DIRS.has(e.name))
    .map((e) => e.name);
};

// 递归收集目录下全部 .md（相对路径）
const walkMd = (dir) => {
  const abs = resolve(ROOT, dir);
  if (!existsSync(abs) || !statSync(abs).isDirectory()) return [];
  const out = [];
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const rel = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMd(rel));
    else if (entry.name.endsWith('.md')) out.push(rel);
  }
  return out;
};

// 从文件名解析编号：`B-12-xxx.md` → { series:'B', num:12, suffix:'', raw:'B-12' }
// `B-16a-xxx.md` → { series:'B', num:16, suffix:'a', raw:'B-16a' }
const parseNumber = (name) => {
  const m = /^([A-Z])-(\d+)([a-z]?)-/.exec(name);
  if (!m) return null;
  return { series: m[1], num: Number(m[2]), suffix: m[3], raw: `${m[1]}-${m[2]}${m[3]}` };
};

const pad2 = (n) => String(n).padStart(2, '0');

// 是否语言变体文件（同一编号的英文版等），用于编号冲突判定
const isVariant = (name) => VARIANT_RE.test(name.replace(/\.md$/, ''));

const seriesDirs = listSeriesDirs();
const indexAbs = resolve(ROOT, INDEX_FILE);
const indexText = existsSync(indexAbs) ? readFileSync(indexAbs, 'utf8') : '';

// ①② 编号连续性 + 编号冲突 + 状态头（遍历 docs/ 下实际存在的系列目录）
if (seriesDirs === null) {
  infos.push(`未找到 ${DOCS_DIR}/ 目录，跳过编号连续性 / 状态头校验`);
} else if (seriesDirs.length === 0) {
  infos.push(
    `${DOCS_DIR}/ 下无待校验子目录（已排除 ${[...EXCLUDE_DIRS].join(' / ')}），跳过编号连续性 / 状态头校验`
  );
} else {
  const errBefore = errors.length;
  const warnBefore = warnings.length;
  let statusChecked = 0;
  const archiveNums = new Set(
    (listMd(ARCHIVE_DIR) || []).map((d) => parseNumber(d.name)).filter(Boolean).map((p) => p.num)
  );

  for (const series of seriesDirs) {
    const docs = listMd(join(DOCS_DIR, series)) || [];
    const present = new Set();
    const groups = new Map(); // raw（含字母后缀）→ 占用该编号的文件名
    for (const doc of docs) {
      const parsed = parseNumber(doc.name);
      if (!parsed) continue;
      present.add(parsed.num);
      if (!groups.has(parsed.raw)) groups.set(parsed.raw, []);
      groups.get(parsed.raw).push(doc.name);
    }

    // ① 编号连续性（缺号须在 archive 或索引标注预留）
    const maxNum = present.size ? Math.max(...present) : 0;
    for (let n = 1; n <= maxNum; n += 1) {
      if (present.has(n)) continue;
      const label = pad2(n);
      const inArchive = archiveNums.has(n);
      const inIndex = new RegExp(`${escapeRegExp(series)}-${label}\\b`).test(indexText);
      if (!inArchive && !inIndex) {
        errors.push(`${join(DOCS_DIR, series)} 编号 ${series}-${label} 缺失，且 archive/索引中未标注预留`);
      }
    }

    // ① 编号冲突（同一编号被多个非变体文件占用）
    for (const [raw, names] of groups) {
      const owners = names.filter((name) => !isVariant(name));
      if (owners.length > 1) {
        errors.push(
          `${join(DOCS_DIR, series)} 编号 ${raw} 被多个文件重复占用（编号冲突）：${owners.join('、')}`
        );
      }
    }

    // ② 状态头（缺失记 warning，存量债不阻断）
    for (const doc of docs) {
      statusChecked += 1;
      const head = readLines(resolve(ROOT, doc.path)).slice(0, STATUS_HEAD_LINES);
      if (!head.some((line) => STATUS_HEADER_RE.test(line))) {
        warnings.push(`${doc.path} 前 ${STATUS_HEAD_LINES} 行缺少状态头（> 版本: ...）`);
      }
    }
  }

  // 执行留痕：即使全部通过也输出 info，避免"看起来没跑"
  const numberingIssues = errors.length - errBefore;
  const statusMissing = warnings.length - warnBefore;
  infos.push(
    numberingIssues === 0
      ? `编号连续性 / 编号冲突：已校验 ${seriesDirs.length} 个系列目录（${seriesDirs.join(' / ')}），未发现缺号或编号冲突`
      : `编号连续性 / 编号冲突：已校验 ${seriesDirs.length} 个系列目录，发现 ${numberingIssues} 处问题（见 error）`
  );
  infos.push(
    statusMissing === 0
      ? `状态头：已校验 ${statusChecked} 篇文档，状态头齐全`
      : `状态头：已校验 ${statusChecked} 篇文档，${statusMissing} 篇缺状态头（warning，不阻断）`
  );
}

// ③ 索引覆盖 + 索引链接有效性
if (!existsSync(indexAbs)) {
  const hasAnyDoc =
    seriesDirs !== null &&
    seriesDirs.some((s) => (listMd(join(DOCS_DIR, s)) || []).length > 0);
  if (hasAnyDoc) {
    warnings.push(
      `${DOCS_DIR}/ 下存在文档，但缺少索引 ${INDEX_FILE}，索引覆盖关系无法校验（建议补建索引）`
    );
  } else {
    infos.push(`未找到索引文件 ${INDEX_FILE}，且 ${DOCS_DIR}/ 下无文档，跳过索引覆盖校验`);
  }
} else {
  // 索引中已收录的系列前缀（如 `| B-01 |` → B）：索引未收录的系列不做逐篇覆盖判定，只提示一次，
  // 避免对未纳入索引体系的系列产生误报（向后兼容 docs/C 等系列）
  const covered = new Set();
  for (const m of indexText.matchAll(/\|\s*([A-Z])-\d{2}/g)) covered.add(m[1]);

  for (const series of seriesDirs || []) {
    const docs = listMd(join(DOCS_DIR, series)) || [];
    if (docs.length === 0) continue;
    if (!covered.has(series)) {
      warnings.push(`索引 ${INDEX_FILE} 未收录 ${series} 系列任何条目，跳过 ${join(DOCS_DIR, series)} 的逐篇覆盖校验`);
      continue;
    }
    for (const doc of docs) {
      const parsed = parseNumber(doc.name);
      if (!parsed) continue;
      const rowRe = new RegExp(`\\|\\s*${parsed.series}-${pad2(parsed.num)}([a-z]?)\\b`);
      if (!rowRe.test(indexText)) {
        errors.push(`索引 ${INDEX_FILE} 未覆盖文档 ${doc.name}`);
      }
    }
  }
  // 索引中的相对链接须指向存在的文件
  for (const m of indexText.matchAll(/\]\(\.\/([^)]+\.md)\)/g)) {
    if (!existsSync(resolve(ROOT, DOCS_DIR, m[1]))) {
      errors.push(`索引 ${INDEX_FILE} 的链接指向不存在的文件：${m[1]}`);
    }
  }
}

// ④ 归档冲突（编号重复记 warning；带字母后缀视为独立编号，跳过）
const archiveDocs = listMd(ARCHIVE_DIR);
if (!archiveDocs) {
  infos.push(`未找到 ${ARCHIVE_DIR} 目录，跳过归档冲突校验`);
} else {
  const mainNums = new Set();
  for (const series of seriesDirs || []) {
    for (const doc of listMd(join(DOCS_DIR, series)) || []) {
      const parsed = parseNumber(doc.name);
      if (parsed && !parsed.suffix) mainNums.add(`${parsed.series}-${parsed.num}`);
    }
  }
  for (const doc of archiveDocs) {
    const parsed = parseNumber(doc.name);
    if (!parsed || parsed.suffix) continue;
    if (mainNums.has(`${parsed.series}-${parsed.num}`)) {
      warnings.push(`归档文件 ${doc.path} 的编号与主目录重复`);
    }
  }
}

// ⑤ 单文件体积（超限记 warning）
const agentsAbs = resolve(ROOT, 'AGENTS.md');
const sizeWarnBefore = warnings.length;
const docFiles = walkMd(DOCS_DIR);
if (existsSync(agentsAbs)) {
  const lines = readLines(agentsAbs).length;
  if (lines > MAX_AGENTS_LINES) {
    warnings.push(`AGENTS.md 共 ${lines} 行，超过上限 ${MAX_AGENTS_LINES} 行，建议拆分到 docs/`);
  }
}
for (const file of docFiles) {
  const lines = readLines(resolve(ROOT, file)).length;
  if (lines > MAX_DOC_LINES) {
    warnings.push(`${file} 共 ${lines} 行，超过单篇上限 ${MAX_DOC_LINES} 行，建议拆分`);
  }
}
const sizeChecked = docFiles.length + (existsSync(agentsAbs) ? 1 : 0);
const sizeIssues = warnings.length - sizeWarnBefore;
infos.push(
  sizeIssues === 0
    ? `单文件体积：已校验 ${sizeChecked} 个文件，均未超阈值（AGENTS.md ≤ ${MAX_AGENTS_LINES} 行 / 单篇 ≤ ${MAX_DOC_LINES} 行）`
    : `单文件体积：已校验 ${sizeChecked} 个文件，${sizeIssues} 个超限（warning，不阻断）`
);

// ————— 输出 —————
console.log('=== docs-check ===');
console.log(`ℹ️ info (${infos.length})`);
infos.forEach((s) => console.log(`  - ${s}`));
console.log(`⚠️ warning (${warnings.length})`);
warnings.forEach((s) => console.log(`  - ${s}`));
console.log(`❌ error (${errors.length})`);
errors.forEach((s) => console.log(`  - ${s}`));
console.log(`\n结果：${errors.length} error / ${warnings.length} warning / ${infos.length} info`);

process.exit(errors.length > 0 ? 1 : 0);
