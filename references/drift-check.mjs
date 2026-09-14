#!/usr/bin/env node
// scripts/drift-check.mjs — 规范漂移检查（spec-drift 门禁的参考实现，零外部依赖）
//
// 用途：把「代码 / 依赖 ↔ 规范」的不一致做成可机检事件，覆盖知识库「跨语言门禁配方表」
//       中的 3 条漂移配方：依赖清单 ↔ 规范漂移 / 模块速查表 ↔ 实际目录漂移 / 门禁有效性漂移。
//
// 校验项：
//   A｜依赖 ↔ 规范漂移：解析仓库根依赖清单（package.json 的 dependencies + devDependencies、
//      go.mod 的 require、requirements*.txt、pyproject.toml），抽取依赖名（去 scope 与版本约束），
//      逐个在 AGENTS.md 全文中查找；未被提及 → warning（提示可能漏同步「技术栈」行）。
//      为控制噪音，构建/工具类噪音依赖列入下方 IGNORE 常量；「未提及」按数量汇总，最多列出前 10 个。
//   B｜模块速查表 ↔ 实际目录漂移：探测源码根（src/ app/ internal/ cmd/ packages/ apps/ 取首个存在），
//      列其一级子目录，与 AGENTS.md「模块速查表」的首批列（职责列之前的列）做集合比对：
//      目录存在但表里没有 → warning；表里写了但路径不存在 → warning。
//   C｜门禁有效性漂移：若存在 scripts/gates.json，逐条检查其 run 字段引用的脚本路径是否真实存在；
//      不存在 → error（僵尸门禁，指向已删除的脚本）。
//
// 用法：node scripts/drift-check.mjs
// 退出码：0 = 无 error（warning 不阻断）；1 = 存在 error
//
// 分级与退出码约定与 references/docs-check.mjs（docs-consistency 门禁）完全一致。
// 零外部依赖：只用 Node 内置模块（node:fs / node:path / node:url / node:process），可直接运行。
//
// 说明：本脚本是**参考实现**，会被复制到结构各异的项目 scripts/ 下，目标项目可按自身技术栈裁剪
//       （如增删 IGNORE、调整源码根候选、关闭某一类检查）；文件 / 目录缺失、解析失败一律输出 info
//       或 warning 并正常退出，不抛出未捕获异常。

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ————— 配置项（移植时集中修改，其余逻辑无需改动）—————
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS_FILE = 'AGENTS.md';
const GATES_FILE = 'scripts/gates.json';
const SOURCE_ROOTS = ['src', 'app', 'internal', 'cmd', 'packages', 'apps']; // 源码根候选，取首个存在
const MODULE_SECTION_RE = /模块速查表/;   // AGENTS.md 中模块速查表的章节标题关键字
const DUTY_HEADER_RE = /职责|说明|描述/;   // 表格末列若为该表头，则视为「职责列」不参与路径比对
const MAX_LISTED = 10;                    // 「未提及依赖」最多列出的条数（其余按数量汇总）

// 已知噪音依赖忽略清单：构建 / 工具类依赖通常不会逐项写进 AGENTS.md 的「技术栈」行，
// 逐个报警会淹没真正的问题。**用户可自行增删本清单**（命中规则：全等，或以其为前缀且后接 `/`）。
const IGNORE = [
  // JS/TS 构建与工具链
  'typescript', 'eslint', 'prettier', 'rimraf', 'cross-env', 'nodemon',
  'concurrently', 'husky', 'lint-staged', 'tsx', 'ts-node', 'dotenv',
  'npm-run-all', 'serve', 'http-server', 'node-fetch',
  // Python 打包与工具链
  'setuptools', 'wheel', 'build', 'twine', 'pip', 'pytest-cov',
  // Go 工具链
  'golang.org/x/tools',
];
// 忽略清单前缀 / 正则规则（作用域包等），同样可按项目增删。
const IGNORE_RE = [
  /^@types\//, /^@babel\//, /^@eslint\//, /^@typescript-eslint\//,
  /^eslint-/, /^prettier-/, /^rollup-plugin-/, /^@trivago\//,
];

// ————— 结果收集 —————
const infos = [];
const warnings = [];
const errors = [];

const readText = (absPath) => readFileSync(absPath, 'utf8');
const readLines = (absPath) => readText(absPath).split(/\r?\n/);
const isIgnored = (name) =>
  IGNORE.some((i) => name === i || name.startsWith(`${i}/`)) || IGNORE_RE.some((re) => re.test(name));
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ————— 依赖名抽取（A 检查用）—————
// npm：去掉 scope（`@scope/pkg` → `pkg`）
const stripNpmScope = (name) => String(name).replace(/^@[^/]+\//, '').trim();
// Go：模块路径取最后一段（`github.com/gin-gonic/gin` → `gin`）
const shortenGo = (mod) => {
  const segs = String(mod).split('/').filter(Boolean);
  return (segs[segs.length - 1] || mod).trim();
};
// Python：去掉 extras、环境标记、直接引用 URL 与版本约束
const stripPySpec = (raw) => {
  let s = String(raw).trim().split(';')[0];
  s = s.replace(/\[[^\]]*\]/g, '');
  s = s.split('@')[0];
  s = s.split(/[<>=!~]/)[0];
  return s.trim();
};

const parsePackageJson = (text) => {
  const pkg = JSON.parse(text);
  const out = [];
  for (const key of ['dependencies', 'devDependencies']) {
    for (const name of Object.keys(pkg[key] || {})) out.push(stripNpmScope(name));
  }
  return out;
};

const parseGoMod = (text) => {
  const out = [];
  let inBlock = false;
  for (const line of text.split(/\r?\n/)) {
    const s = line.trim();
    if (/^require\s*\($/.test(s)) { inBlock = true; continue; }
    if (inBlock && s === ')') { inBlock = false; continue; }
    if (/\/\/\s*indirect/.test(s)) continue; // 间接依赖不算显式技术栈选择
    let target = null;
    if (inBlock) target = s;
    else if (s.startsWith('require ')) target = s.slice('require '.length).trim();
    if (!target) continue;
    const m = /^([^\s]+)\s+v?\d/.exec(target);
    if (m) out.push(shortenGo(m[1]));
  }
  return out;
};

const parseRequirementsTxt = (text) =>
  text
    .split(/\r?\n/)
    .map((l) => l.split('#')[0].trim())
    .filter((l) => l && !l.startsWith('-')) // 跳过 -r / -e / --index-url 等选项行
    .map(stripPySpec)
    .filter(Boolean);

const parsePyproject = (text) => {
  const out = [];
  // PEP 621：dependencies = [ "fastapi>=0.1", ... ]
  const block = /dependencies\s*=\s*\[([\s\S]*?)\]/.exec(text);
  if (block) {
    for (const m of block[1].matchAll(/["']([^"']+)["']/g)) out.push(stripPySpec(m[1]));
  }
  // Poetry：[tool.poetry.dependencies] 下的 `name = "..."` 行
  const idx = text.indexOf('[tool.poetry.dependencies]');
  if (idx !== -1) {
    const section = text.slice(idx).split(/\r?\n(?=\[)/)[0];
    for (const line of section.split(/\r?\n/)) {
      const m = /^\s*([A-Za-z0-9_.-]+)\s*=/.exec(line);
      if (m && m[1] !== 'python') out.push(m[1]);
    }
  }
  return out;
};

// ————— A｜依赖 ↔ 规范漂移 —————
let agentsText = null;
const agentsAbs = resolve(ROOT, AGENTS_FILE);
if (!existsSync(agentsAbs)) {
  infos.push(`未找到 ${AGENTS_FILE}，跳过全部检查`);
} else {
  try {
    agentsText = readText(agentsAbs);
  } catch (err) {
    infos.push(`读取 ${AGENTS_FILE} 失败（${err.message}），跳过全部检查`);
  }
}

// 在 AGENTS.md 全文中查找依赖名（带词边界，避免 `gin` 命中 `engine` 这类子串误判）
const mentionedInAgents = (name) =>
  new RegExp(`(?<![\\w-])${escapeRegExp(name)}(?![\\w-])`, 'i').test(agentsText || '');

if (agentsText !== null) {
  const sources = [
    ['package.json', resolve(ROOT, 'package.json'), parsePackageJson, 'json'],
    ['go.mod', resolve(ROOT, 'go.mod'), parseGoMod, 'text'],
    ['pyproject.toml', resolve(ROOT, 'pyproject.toml'), parsePyproject, 'text'],
  ];
  // requirements*.txt（可能多份）
  try {
    for (const f of readdirSync(ROOT)) {
      if (/^requirements.*\.txt$/i.test(f)) {
        sources.push([f, resolve(ROOT, f), parseRequirementsTxt, 'text']);
      }
    }
  } catch (err) {
    infos.push(`列举依赖清单失败（${err.message}），检查 A 可能不完整`);
  }

  const deps = new Set();
  const foundSources = [];
  for (const [label, abs, parser, kind] of sources) {
    if (!existsSync(abs)) continue;
    try {
      for (const name of parser(readText(abs))) if (name) deps.add(name);
      foundSources.push(label);
    } catch (err) {
      warnings.push(`解析依赖清单 ${label} 失败：${err.message}（该清单已跳过）`);
    }
  }

  if (foundSources.length === 0) {
    infos.push('未找到可解析的依赖清单（package.json / go.mod / requirements*.txt / pyproject.toml），跳过检查 A');
  } else {
    const scanned = [...deps];
    const ignored = scanned.filter(isIgnored);
    const unmentioned = scanned.filter((n) => !isIgnored(n) && !mentionedInAgents(n));
    if (scanned.length === 0) {
      infos.push(`检查 A：${foundSources.join(' / ')} 未发现 dependencies / devDependencies / require 依赖，无可校验项`);
    } else if (unmentioned.length === 0) {
      infos.push(`检查 A：${foundSources.join(' / ')} 共 ${scanned.length} 个依赖，均已在 AGENTS.md 中提及或被忽略清单覆盖`);
    } else {
      const shown = unmentioned.slice(0, MAX_LISTED).join('、');
      const more = unmentioned.length > MAX_LISTED ? ` 等 ${unmentioned.length} 个` : '';
      warnings.push(
        `检查 A：AGENTS.md 未提及 ${unmentioned.length} 个依赖（可能漏同步「技术栈」行）：${shown}${more}`
      );
      infos.push(
        `检查 A：来源 ${foundSources.join(' / ')}，依赖总数 ${scanned.length}，其中忽略清单命中 ${ignored.length} 个、未提及 ${unmentioned.length} 个`
      );
    }
  }
}

// ————— B｜模块速查表 ↔ 实际目录漂移 —————
if (agentsText !== null) {
  try {
    const srcRoot = SOURCE_ROOTS.find((d) => {
      const abs = resolve(ROOT, d);
      return existsSync(abs) && statSync(abs).isDirectory();
    });
    if (!srcRoot) {
      infos.push(`未找到源码根（候选 ${SOURCE_ROOTS.join(' / ')}），跳过检查 B`);
    } else {
      // 源码根的一级子目录
      const subdirs = readdirSync(resolve(ROOT, srcRoot), { withFileTypes: true })
        .filter((e) => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
        .map((e) => e.name);

      // 定位「模块速查表」章节：标题行起，至下一个标题或分隔线止
      const lines = agentsText.split(/\r?\n/);
      const start = lines.findIndex((l) => /^#{1,6}\s/.test(l) && MODULE_SECTION_RE.test(l));
      let tableTokens = null;
      if (start === -1) {
        infos.push('AGENTS.md 未找到「模块速查表」章节，跳过检查 B');
      } else {
        const body = [];
        for (let i = start + 1; i < lines.length; i += 1) {
          if (/^#{1,6}\s/.test(lines[i]) || /^-{3,}\s*$/.test(lines[i])) break;
          body.push(lines[i]);
        }
        const rows = body.filter((l) => l.trim().startsWith('|'));
        const cells = rows
          .map((l) => l.split('|').slice(1, -1).map((c) => c.replace(/`/g, '').trim()))
          .filter((c) => c.some(Boolean));
        // 丢弃表头分隔行（|---|---|）
        const dataRows = cells.filter((c) => !c.every((x) => /^:?-{2,}:?$/.test(x)));
        if (dataRows.length < 2) {
          infos.push('「模块速查表」未识别到表格数据行，跳过检查 B');
        } else {
          const header = dataRows[0];
          const leading = DUTY_HEADER_RE.test(header[header.length - 1] || '')
            ? header.length - 1
            : header.length;
          tableTokens = [];
          for (const row of dataRows.slice(1)) {
            for (const cellText of row.slice(0, leading)) {
              for (const token of cellText.split(/[、,]/).map((t) => t.trim().replace(/\/+$/, '').replace(/^\.\//, ''))) {
                if (token) tableTokens.push(token);
              }
            }
          }
        }
      }

      if (tableTokens) {
        // 方向一：目录存在但表里没有 → warning
        const missing = subdirs.filter(
          (d) => !tableTokens.some((t) => t === d || t.endsWith(`/${d}`) || t === `${srcRoot}/${d}`)
        );
        for (const d of missing) {
          warnings.push(`检查 B：目录 ${srcRoot}/${d} 存在，但 AGENTS.md 模块速查表未收录（怀疑漏同步）`);
        }
        // 方向二：表里写了但路径不存在 → warning
        for (const t of [...new Set(tableTokens)]) {
          if (t !== srcRoot && !t.startsWith(`${srcRoot}/`)) continue;
          if (!existsSync(resolve(ROOT, t))) {
            warnings.push(`检查 B：模块速查表写了 ${t}，但该路径不存在（怀疑目录已改名 / 删除）`);
          }
        }
        if (missing.length === 0 && subdirs.length > 0) {
          infos.push(`检查 B：${srcRoot}/ 下 ${subdirs.length} 个一级子目录与模块速查表一致`);
        }
      }
    }
  } catch (err) {
    infos.push(`检查 B 执行失败（${err.message}），已跳过`);
  }
}

// ————— C｜门禁有效性漂移 —————
try {
  const gatesAbs = resolve(ROOT, GATES_FILE);
  if (!existsSync(gatesAbs)) {
    infos.push(`未找到 ${GATES_FILE}，跳过检查 C`);
  } else {
    let gates = [];
    let parsed = true;
    try {
      gates = JSON.parse(readText(gatesAbs));
      if (!Array.isArray(gates)) { parsed = false; }
    } catch (err) {
      parsed = false;
      warnings.push(`解析 ${GATES_FILE} 失败：${err.message}（跳过检查 C）`);
    }
    if (parsed) {
      const fileRe = /[\w./\\-]+\.(?:mjs|cjs|js|ts|py|sh|ps1|json|ya?ml)/g;
      let refCount = 0;
      for (const gate of gates) {
        const refs = String(gate.run || '').match(fileRe) || [];
        for (const ref of refs) {
          refCount += 1;
          if (!existsSync(resolve(ROOT, gate.cwd || '.', ref))) {
            errors.push(`检查 C：门禁 ${gate.id} 引用的脚本不存在：${ref}（僵尸门禁，指向已删除的脚本）`);
          }
        }
      }
      if (refCount === 0) {
        infos.push(`检查 C：${gates.length} 条门禁的 run 字段未引用脚本文件，无可校验项`);
      }
    }
  }
} catch (err) {
  infos.push(`检查 C 执行失败（${err.message}），已跳过`);
}

// ————— 输出（格式与 docs-check.mjs 一致）—————
console.log('=== drift-check ===');
console.log(`ℹ️ info (${infos.length})`);
infos.forEach((s) => console.log(`  - ${s}`));
console.log(`⚠️ warning (${warnings.length})`);
warnings.forEach((s) => console.log(`  - ${s}`));
console.log(`❌ error (${errors.length})`);
errors.forEach((s) => console.log(`  - ${s}`));
console.log(`\n结果：${errors.length} error / ${warnings.length} warning / ${infos.length} info`);

process.exit(errors.length > 0 ? 1 : 0);
