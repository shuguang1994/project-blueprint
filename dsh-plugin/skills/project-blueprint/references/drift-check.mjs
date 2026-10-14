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
//   D｜测试框架 ↔ CI test 步骤漂移：探测到测试框架 / 测试脚本 / 测试文件（Node、Python），
//      或 gates.json 含 test 门禁，但仓库根的 CI 配置（.github/workflows/*.yml、.gitee-ci.yml、
//      .workflow/*.yml）中找不到任何跑测试的步骤 → warning（"建了测试但没接进 CI"）。
//      —— 这是 G1「假绿开关」的配套机检，防止"删掉 test 步骤"变成新的静默缺陷。
//
// 适用性裁定（**重要**）：检查 A / B 在仓库形态不适用时（无依赖清单 / 无源码根）**不得静默跳过**，
//      一律输出形如「检查 X 不适用｜原因：…｜风险：…｜裁定：本仓形态不适用」的 info。
//      理由：静默跳过会让"看起来绿、实际没检"的门禁被误读为"体系在守护"（真实项目实证缺陷）。
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

// 检查 D 用：测试框架与测试文件探测规则（移植时按项目技术栈增删）
const TEST_FRAMEWORK_RE = /^(jest|vitest|mocha|ava|tap|jasmine|karma|@jest\/|pytest|nose|tox|hypothesis|unittest)/i;
const TEST_SCRIPT_RE = /^(test|test:unit|test:cov|test:e2e|test:all|jest|vitest|pytest)$/;
const TEST_DIRS = ['test', 'tests', '__tests__', 'spec', 'e2e'];  // 测试目录候选
const TEST_FILE_RE = /(^|[._-])(test|spec)\.[cm]?[jt]sx?$|^test_.*\.py$|_test\.py$/i;  // 测试文件命名
const CI_GLOBS = ['.github/workflows', '.workflow'];  // CI 配置目录候选
const CI_FILES = ['.gitee-ci.yml', '.gitlab-ci.yml', 'azure-pipelines.yml'];  // 单文件 CI 配置候选
// 判定"CI 里确实跑测试"的正则：只认**显式测试运行器**，不把门禁 job（scripts/verify.*）算作 test 步骤
// —— 否则任何含门禁 job 的 CI 都会让本检查恒绿（本仓实测踩到过该误判）。
const CI_TEST_STEP_RE = /(npx\s+|pnpm\s+|yarn\s+|bunx\s+)?(jest|vitest|mocha|ava|tap|jasmine|karma)\b|(npm|pnpm|yarn|bun)\s+(run\s+)?(test|test:[\w-]+)\b|pytest|python\s+-m\s+(pytest|unittest)|manage\.py\s+test|artisan\s+test|go\s+test\b|gradlew\s+test\b|mvn\s+test\b|cargo\s+test\b|dotnet\s+test\b|rspec|phpunit|tox\b/;

// 检查 B 回退模式：无源码根时改用「仓库顶层目录 ↔ 模块速查表」比对。
// 顶层噪音目录排除清单（**用户可自行增删**）——只影响"目录存在但表里没有"方向的噪音，
// 不影响"表里写了但路径不存在"方向（该方向零误报，始终输出 warning）。
const TOPLEVEL_IGNORE_DIRS = [
  'node_modules', 'dist', 'build', 'out', 'coverage', 'vendor', 'target',
  'docs', 'internal-docs', 'scripts', 'tools', 'assets', 'public', 'static',
  'test', 'tests', '__tests__', 'e2e', 'migrations', 'deploy', 'temp', 'tmp',
];
const TOPLEVEL_IGNORE_RE = [/^\./, /^archive$/i, /^_/, /backup/i, /^temp_/i];
const TOPLEVEL_MAX_NOISE = 8;             // 回退模式下「目录存在但表里没有」最多列出的条数


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

// ————— 适用性裁定（不静默跳过）—————
// 统一格式，便于机检：`检查 X 不适用｜原因：…｜风险：…｜裁定：本仓形态不适用`
const notApplicable = (check, reason, risk) =>
  infos.push(`检查 ${check} 不适用｜原因：${reason}｜风险：${risk}｜裁定：本仓形态不适用`);

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
  infos.push(`未找到 ${AGENTS_FILE}，全部检查不适用（原因：缺宪法文件，无可比对对象）`);
} else {
  try {
    agentsText = readText(agentsAbs);
  } catch (err) {
    infos.push(`读取 ${AGENTS_FILE} 失败（${err.message}），全部检查不适用`);
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
    notApplicable(
      'A',
      '未找到可解析的依赖清单（package.json / go.mod / requirements*.txt / pyproject.toml）',
      '依赖清单与 AGENTS.md「技术栈」行之间的漂移在本仓无门禁覆盖'
    );
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
      infos.push(
        `检查 B 切换为回退模式｜原因：未找到源码根（候选 ${SOURCE_ROOTS.join(' / ')}）`
          + `｜替代判据：改用仓库顶层目录 ↔ 模块速查表比对（已排除噪音目录）`
          + `｜残留局限：「目录存在但表里没有」方向降为 info（顶层目录含工具 / 文档目录，不必然属于「模块」）`
      );
    }

    {
      // 目录集合：有源码根 → 其一级子目录；无源码根 → **回退**到仓库顶层目录（纯文档 / 纯前端 / 小项目）
      const fallbackMode = !srcRoot;
      const subdirs = fallbackMode
        ? readdirSync(ROOT, { withFileTypes: true })
            .filter(
              (e) =>
                e.isDirectory() &&
                !TOPLEVEL_IGNORE_DIRS.includes(e.name) &&
                !TOPLEVEL_IGNORE_RE.some((re) => re.test(e.name))
            )
            .map((e) => e.name)
        : readdirSync(resolve(ROOT, srcRoot), { withFileTypes: true })
            .filter((e) => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
            .map((e) => e.name);

      // 定位「模块速查表」章节：标题行起，至下一个标题或分隔线止
      const lines = agentsText.split(/\r?\n/);
      const start = lines.findIndex((l) => /^#{1,6}\s/.test(l) && MODULE_SECTION_RE.test(l));
      let tableTokens = null;
      // 回退模式用：表格单元格散文里"被斜杠切碎"的片段（如 `a/b.md` 切出的 `b.md`）。
      // 这些片段不能当作顶层目录名，否则会在"目录存在但表里没有"方向刷屏。
      let cellFragments = new Set();
      if (start === -1) {
        notApplicable(
          'B',
          `AGENTS.md 未找到「模块速查表」章节（${MODULE_SECTION_RE.source}）`,
          '没有模块速查表可比对，目录 ↔ 速查表的漂移无门禁覆盖'
        );
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
          notApplicable(
            'B',
            `「模块速查表」章节存在但未识别到表格数据行（解析到 ${dataRows.length} 行）`,
            '速查表可能是散文式描述而非表格，目录漂移无门禁覆盖；如需覆盖请改为表格'
          );
        } else {
          const header = dataRows[0];
          const leading = DUTY_HEADER_RE.test(header[header.length - 1] || '')
            ? header.length - 1
            : header.length;
          tableTokens = [];
          for (const row of dataRows.slice(1)) {
            for (const cellText of row.slice(0, leading)) {
              // 分隔符含 `、` `,` `/` `~` `|`：速查表单元格常写成 `` `a.md` / `b.md` `` 或 `` `step-1.md` ~ `step-7.md` ``
              for (const token of cellText
                .split(/[、,/~|]/)
                .map((t) => t.trim().replace(/\/+$/, '').replace(/^\.\//, ''))) {
                if (token) tableTokens.push(token);
              }
            }
          }
          // 回退模式用：表格单元格散文里"路径的组成部分"（`.github` / `workflows` / `verify.yml`）
          // 都不是顶层目录名候选——在**原始单元格**上抽完整路径，再取其中间段与末段。
          // （不可先 split 再判断：split 后片段已不含 `/`，中间段会漏掉。）
          cellFragments = new Set();
          for (const row of dataRows.slice(1)) {
            for (const cellText of row.slice(0, leading)) {
              for (const m of cellText.matchAll(/[\w.@-]+(?:\/[\w.@-]+)+/g)) {
                cellFragments.add(m[0]);                                  // 完整路径
                const segs = m[0].split('/').filter(Boolean);
                if (segs.length) cellFragments.add(segs[segs.length - 1]); // 末段
                for (let i = 1; i < segs.length; i += 1) cellFragments.add(segs[i - 1]); // 中间段
              }
            }
          }
        }
      }

      if (!tableTokens) {
        infos.push('检查 B：模块速查表未解析出可比对的路径 token，仅完成了目录枚举');
      } else {
        const listed = [...new Set(tableTokens)];

        if (fallbackMode) {
          // 回退模式：方向二（表里写了但顶层路径不存在）→ warning；方向一 → info（不刷屏）。
          // 候选判据（三条并集，宁少报不误报）：
          //   ① 含 `/` 的完整路径 token；② 真实存在的顶层目录名；③ **纯标识符形态的裸名**（`src` / `lib`
          //   这类目录名，不含 `.` / 空格 / 中文）且非散文切片。
          // 散文式裸文件名片段（`a/b.md` 切出的 `b.md`、`verify.mjs`、`README.md`）一律不报，避免误报。
          const isBareName = (t) => /^[A-Za-z][\w-]*$/.test(t);
          const pathTokens = listed.filter(
            (t) => t.includes('/') || subdirs.includes(t.replace(/\/+$/, '')) || (isBareName(t) && !cellFragments.has(t))
          );
          for (const t of pathTokens) {
            if (TOPLEVEL_IGNORE_RE.some((re) => re.test(t))) continue;
            const bare = t.replace(/\/+$/, '');
            if (bare && subdirs.includes(bare)) continue;       // 是真实存在的顶层目录
            if (existsSync(resolve(ROOT, t))) continue;
            warnings.push(`检查 B：模块速查表写了 ${t}，但该路径不存在（怀疑目录已改名 / 删除）`);
          }
          const skipped = listed.length - pathTokens.length;
          const uncovered = subdirs.filter(
            (d) => !cellFragments.has(d) && !listed.some((t) => t === d || t.endsWith(`/${d}`))
          );
          if (uncovered.length > 0) {
            const shown = uncovered.slice(0, TOPLEVEL_MAX_NOISE).join('、');
            const more = uncovered.length > TOPLEVEL_MAX_NOISE ? ` 等 ${uncovered.length} 个` : '';
            infos.push(
              `检查 B（回退到仓库顶层目录）：${uncovered.length} 个顶层目录未在模块速查表中收录（${shown}${more}）—— `
                + '该方向在回退模式下仅提示不报警（顶层目录常为工具 / 文档目录，不必然属于「模块」）'
            );
          }
          infos.push(
            `检查 B（回退模式）：已校验 ${pathTokens.length} 个路径形态 token`
              + `（跳过 ${skipped} 个散文式裸文件名片段，避免误报；已排除 ${TOPLEVEL_IGNORE_DIRS.length} 个噪音目录名 + 前缀规则）`
          );
        } else {
          // 方向一：目录存在但表里没有 → warning
          const missing = subdirs.filter(
            (d) => !listed.some((t) => t === d || t.endsWith(`/${d}`) || t === `${srcRoot}/${d}`)
          );
          for (const d of missing) {
            warnings.push(`检查 B：目录 ${srcRoot}/${d} 存在，但 AGENTS.md 模块速查表未收录（怀疑漏同步）`);
          }
          // 方向二：表里写了但路径不存在 → warning
          for (const t of listed) {
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
    }
  } catch (err) {
    infos.push(`检查 B 执行失败（${err.message}），已跳过`);
  }
}

// ————— C｜门禁有效性漂移 —————
try {
  const gatesAbs = resolve(ROOT, GATES_FILE);
  if (!existsSync(gatesAbs)) {
    notApplicable(
      'C',
      `未找到 ${GATES_FILE}`,
      '没有门禁清单可比对，"门禁 run 指向已删除脚本"这类僵尸门禁无门禁覆盖'
    );
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

// ————— D｜测试框架 ↔ CI test 步骤漂移（G1 配套机检）—————
// 目的：防止"为了不复现假绿而不生成 test 步骤"演变成新的静默缺陷——建了测试却没人接进 CI。
try {
  // D-1 探测测试资产：依赖清单里的测试框架 / package.json 的 test 脚本 / 测试文件
  const evidence = [];
  const pkgAbs = resolve(ROOT, 'package.json');
  if (existsSync(pkgAbs)) {
    try {
      const pkg = JSON.parse(readText(pkgAbs));
      for (const key of ['dependencies', 'devDependencies']) {
        for (const name of Object.keys(pkg[key] || {})) {
          if (TEST_FRAMEWORK_RE.test(name)) evidence.push(`依赖 ${name}`);
        }
      }
      for (const name of Object.keys(pkg.scripts || {})) {
        if (TEST_SCRIPT_RE.test(name)) evidence.push(`脚本 npm run ${name}`);
      }
    } catch (err) {
      infos.push(`检查 D：解析 package.json 失败（${err.message}），已按无测试资产处理`);
    }
  }
  const pyManifests = ['pyproject.toml', 'setup.py', 'setup.cfg'];
  for (const f of pyManifests) {
    const abs = resolve(ROOT, f);
    if (existsSync(abs) && TEST_FRAMEWORK_RE.test(readText(abs))) evidence.push(`${f} 含测试框架`);
  }
  try {
    for (const f of readdirSync(ROOT)) {
      if (/^requirements.*\.txt$/i.test(f) && TEST_FRAMEWORK_RE.test(readText(resolve(ROOT, f)))) {
        evidence.push(`${f} 含测试框架`);
      }
    }
  } catch (err) { /* 顶层目录不可读时忽略，不阻断 */ }
  for (const dir of TEST_DIRS) {
    const abs = resolve(ROOT, dir);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) continue;
    const hit = readdirSync(abs, { withFileTypes: true }).find(
      (e) => e.isFile() && TEST_FILE_RE.test(e.name)
    );
    if (hit) evidence.push(`测试文件 ${dir}/${hit.name}`);
  }

  // D-2 探测 CI 配置里是否存在"跑测试"的步骤
  const ciTexts = [];
  for (const dir of CI_GLOBS) {
    const abs = resolve(ROOT, dir);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) continue;
    for (const f of readdirSync(abs)) {
      if (!/\.ya?ml$/i.test(f)) continue;
      ciTexts.push([`${dir}/${f}`, readText(resolve(ROOT, dir, f))]);
    }
  }
  for (const f of CI_FILES) {
    const abs = resolve(ROOT, f);
    if (existsSync(abs)) ciTexts.push([f, readText(abs)]);
  }

  if (evidence.length === 0) {
    infos.push('检查 D：未探测到测试框架 / 测试脚本 / 测试文件，无需校验 CI test 步骤');
  } else if (ciTexts.length === 0) {
    notApplicable(
      'D',
      `探测到测试资产（${evidence.slice(0, 3).join('、')}）但未找到 CI 配置（候选 ${[...CI_GLOBS, ...CI_FILES].join(' / ')}）`,
      '测试未接入任何 CI，回归不会被自动发现——本项目尚无 CI，属预期缺口，建立 CI 时须补 test 步骤'
    );
  } else {
    const withTest = ciTexts.filter(([, t]) => CI_TEST_STEP_RE.test(t)).map(([f]) => f);
    if (withTest.length === 0) {
      warnings.push(
        `检查 D：探测到测试资产（${evidence.slice(0, 3).join('、')}${
          evidence.length > 3 ? ` 等 ${evidence.length} 项` : ''
        }），但 CI 配置（${ciTexts.map(([f]) => f).join(' / ')}）中未找到任何跑测试的步骤 —— 建了测试却没接进 CI`
      );
    } else {
      infos.push(`检查 D：测试资产 ${evidence.length} 项，已在 ${withTest.join(' / ')} 中接入 CI`);
    }
  }
} catch (err) {
  infos.push(`检查 D 执行失败（${err.message}），已跳过`);
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
