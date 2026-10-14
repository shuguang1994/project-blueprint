# 宪法一致性校验参考实现（Python 宿主 `scripts/check-constitution.py`）

> 生成到目标项目 `scripts/`（Python 宿主）。**语义等价判据**：同一份 `gates.json`，Node / Python 两个宿主对同一 `--stage` 过滤出同一批门禁、给出同一退出码。
> 引用方：`references/gates-templates.md` §五 ｜ 触发条件：项目**无 Node 运行时、有 Python**（宿主优先级 3）。
> 版本: v2.0 | 更新: 2026-10-14

```python
#!/usr/bin/env python3
# scripts/check-constitution.py — 宪法一致性校验（红线权威表 ↔ gates.json，零外部依赖，Python 宿主）
#
# 与 references/gates-templates.md §三 的 Node 版 check-constitution.mjs **语义等价**：
#   A｜僵尸门禁源   source 形如 AGENTS#<红线 ID>[@<章节名提示>]，ID 须在权威表中可定位 → 否则 error
#   A'            source 用旧形态 AGENTS#<章节名>（无 ID）→ warning（章节改名即静默断链）
#   B｜未登记门禁   AGENTS.md 门禁章节出现的门禁 id 不在 gates.json 中 → warning
#   C｜僵尸门禁脚本 gate.run 引用的文件不存在 → error
#   D｜无门禁标注   标了 [无门禁] 但未写明原因 → warning
#   E｜红线无门禁   权威表中档位为 blocking 的红线须有 ≥1 条门禁引用 → 否则 error
#
# 降级策略：权威表不存在时，规则 A 退回章节名兜底匹配、规则 E 不执行，并输出「已降级」+「未覆盖风险」两条 info。
# 退出码：0 = 无 error；1 = 存在 error。
#
# 零外部依赖：只用 Python 标准库（json / re / sys / pathlib）。

import json
import re
import sys
from pathlib import Path

# Windows 控制台默认 GBK，无法输出 ✅ / ⚠️ / ❌ 等符号 —— 强制 UTF-8，避免宿主因编码崩溃而误判门禁失败
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent
AGENTS_FILE = "AGENTS.md"
GATES_FILE = Path("scripts") / "gates.json"

REDLINE_FILE_CANDIDATES = [
    Path("docs/B/B-00-红线与门禁映射.md"),
    Path("docs/B/B-01-红线与门禁映射.md"),
    Path("docs/REDLINES.md"),
]

HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
GATE_SECTION_RE = re.compile(r"门禁")
GATE_ID_RE = re.compile(r"`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`")
FILE_REF_RE = re.compile(r"[\w./\\-]+\.(?:mjs|cjs|js|ts|py|sh|ps1|json|ya?ml)")
NO_GATE_MARK = "[无门禁]"
REASON_RE = re.compile(r"原因|理由|因为|Reason", re.I)
REDLINE_ID_RE = re.compile(r"^[A-Z]{2,5}-\d{1,4}[a-z]?$")
BLOCKING_TIER_RE = re.compile(r"blocking|阻断", re.I)
RETIRED_TIER_RE = re.compile(r"retired|作废", re.I)

infos, warnings, errors = [], [], []


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def main() -> int:
    print("=== check-constitution ===")

    agents_abs = ROOT / AGENTS_FILE
    if not agents_abs.exists():
        infos.append(f"未找到 {AGENTS_FILE}，跳过宪法一致性校验")
        print(f"ℹ️ info ({len(infos)})")
        for s in infos:
            print(f"  - {s}")
        print(f"\n结果：0 error / 0 warning / {len(infos)} info（未发现 AGENTS.md）")
        return 0

    agents = read_text(agents_abs)
    agents_lines = agents.splitlines()

    headings = []
    for i, line in enumerate(agents_lines, start=1):
        m = HEADING_RE.match(line.strip())
        if m:
            headings.append({"level": len(m.group(1)), "text": m.group(2), "line": i})

    # ————— 读取门禁清单 —————
    gates = []
    gates_abs = ROOT / GATES_FILE
    if not gates_abs.exists():
        infos.append(f"未找到 {GATES_FILE}，仅校验 {AGENTS_FILE} 侧标注")
    else:
        try:
            gates = json.loads(read_text(gates_abs))
            if not isinstance(gates, list):
                raise ValueError("顶层结构不是数组")
        except Exception as exc:  # noqa: BLE001
            gates = []
            errors.append(f"解析 {GATES_FILE} 失败：{exc}")
    gate_ids = {str(g.get("id", "")) for g in gates if g.get("id")}

    # ————— 读取红线权威表 —————
    redline_file = next((f for f in REDLINE_FILE_CANDIDATES if (ROOT / f).exists()), None)
    redline_entries = {}
    if redline_file:
        for i, line in enumerate(read_text(ROOT / redline_file).splitlines(), start=1):
            s = line.strip()
            if not s.startswith("|") or re.match(r"^\|[\s:|-]+\|$", s):
                continue
            cells = [c.strip() for c in s.split("|")[1:-1]]
            if len(cells) < 2:
                continue
            first = cells[0].replace("`", "")
            if re.search(r"编号|ID", first, re.I):
                continue  # 表头行
            if not REDLINE_ID_RE.match(first):
                continue
            redline_entries[first] = {"tier": cells[1], "line": i, "id": first}

    if not redline_file:
        infos.append(
            "未找到红线权威表（候选 "
            + " / ".join(str(f).replace("\\", "/") for f in REDLINE_FILE_CANDIDATES)
            + "），规则 A 降级为章节名兜底匹配、规则 E 不执行"
        )
        infos.append(
            "⚠️ 未覆盖的风险：无法检出「存在阻断级红线但没有任何门禁」——这是\"违宪审查\"的另一半，本仓当前只查得出僵尸门禁"
        )
    else:
        infos.append(f"红线权威表：{str(redline_file).replace(chr(92), '/')}，共解析 {len(redline_entries)} 条红线")

    # ————— 规则 A｜僵尸门禁源 —————
    checked_source = 0
    for gate in gates:
        gate_id = gate.get("id")
        source = str(gate.get("source", "")).strip()
        if not source:
            warnings.append(f"门禁 {gate_id} 缺少 source 字段，无法做双向比对")
            continue
        m = re.match(r"^([^#]+)#(.+)$", source)
        if not m:
            warnings.append(f"门禁 {gate_id} 的 source「{source}」不是 AGENTS#<ID>[@<章节名>] 格式，无法比对")
            continue
        file_part, ref_part = m.group(1).strip(), m.group(2).strip()
        if not re.match(r"^AGENTS(\.md)?$", file_part, re.I):
            infos.append(f"门禁 {gate_id} 的 source 指向非 AGENTS 文件（{file_part}），跳过规则 A")
            continue
        checked_source += 1

        id_part, _, hint_part = ref_part.partition("@")
        id_part, hint_part = id_part.strip(), hint_part.strip()

        if REDLINE_ID_RE.match(id_part):
            if redline_file and id_part not in redline_entries:
                errors.append(
                    f"门禁 {gate_id} 的 source 引用了红线 ID「{id_part}」，"
                    f"但权威表（{redline_file}）中无该 ID（疑似僵尸门禁源）"
                )
        else:
            if redline_file:
                warnings.append(
                    f"门禁 {gate_id} 的 source「{source}」使用章节名引用（旧形态），"
                    f"章节改名即静默断链，建议迁移为 AGENTS#<红线 ID>@{id_part}"
                )
            if headings and not any(id_part in h["text"] for h in headings):
                msg = f"门禁 {gate_id} 的 source「{source}」在 {AGENTS_FILE} 的标题中定位不到（疑似僵尸门禁源）"
                # 无权威表时降级为 warning（与 Node 版一致）
                if redline_file:
                    errors.append(msg)
                else:
                    warnings.append(f"{msg}（无权威表，已降级为 warning；建表后本项升为 error）")

        if hint_part and headings and not any(hint_part in h["text"] for h in headings):
            infos.append(f"门禁 {gate_id} 的 source 章节名提示「{hint_part}」在 {AGENTS_FILE} 中已不存在（不影响判定，仅提示同步）")

    if checked_source == 0 and gates:
        infos.append(f"规则 A：{len(gates)} 条门禁的 source 均未指向 {AGENTS_FILE}，无可校验项")
    elif not redline_file and checked_source > 0:
        infos.append(
            f"规则 A：无权威表，已降级为「章节名 ↔ 标题」兜底匹配（覆盖 {checked_source} 条门禁）"
            "—— 只能发现\"章节名在标题中消失\"，发现不了\"ID 被写错\""
        )

    # ————— 规则 B｜未登记门禁 —————
    gate_sections = [h for h in headings if GATE_SECTION_RE.search(h["text"])]
    if not gate_sections:
        infos.append(f"规则 B：{AGENTS_FILE} 中未找到标题含「门禁」的清单 / 装配章节，跳过未登记门禁扫描")
    else:
        candidates = set()
        for s in gate_sections:
            body = []
            for line in agents_lines[s["line"]:]:
                m = HEADING_RE.match(line.strip())
                if m and len(m.group(1)) <= s["level"]:
                    break
                body.append(line)
            text = "\n".join(body)
            candidates.update(GATE_ID_RE.findall(text))
            for gid in gate_ids:
                if re.search(rf"(?<![\w-]){re.escape(gid)}(?![\w-])", text):
                    candidates.add(gid)
        unregistered = sorted(c for c in candidates if c not in gate_ids)
        for gid in unregistered:
            warnings.append(f"{AGENTS_FILE} 门禁章节标了门禁 id「{gid}」，但 {GATES_FILE} 中无对应条目（未登记）")
        if not candidates:
            lines = " / ".join(f"L{s['line']}" for s in gate_sections)
            infos.append(f"规则 B：扫描 {len(gate_sections)} 个门禁章节（{lines}），未出现门禁 id 标注")
        else:
            infos.append(
                f"规则 B：扫描 {len(gate_sections)} 个门禁章节，命中门禁 id {len(candidates)} 个，其中未登记 {len(unregistered)} 个"
            )

    # ————— 规则 C｜僵尸门禁脚本 —————
    ref_count = 0
    for gate in gates:
        cwd = ROOT / gate.get("cwd", ".")
        for ref in FILE_REF_RE.findall(str(gate.get("run", ""))):
            ref_count += 1
            if not (cwd / ref).exists():
                errors.append(f"门禁 {gate.get('id')} 引用的文件不存在：{ref}（僵尸门禁，指向已删除的脚本）")
    if gates and ref_count == 0:
        infos.append(f"规则 C：{len(gates)} 条门禁的 run 字段未引用脚本文件，无可校验项")
    elif gates:
        infos.append(f"规则 C：{len(gates)} 条门禁共引用 {ref_count} 个文件，均已存在")

    # ————— 规则 D｜无门禁标注 —————
    paragraphs, cur = [], {"line": 1, "text": []}
    for i, line in enumerate(agents_lines, start=1):
        if line.strip() == "":
            if cur["text"]:
                paragraphs.append(cur)
            cur = {"line": i + 1, "text": []}
        else:
            cur["text"].append(line)
    if cur["text"]:
        paragraphs.append(cur)

    marked = [p for p in paragraphs if NO_GATE_MARK in "\n".join(p["text"])]
    if not marked:
        infos.append(f"规则 D：{AGENTS_FILE} 中未出现 {NO_GATE_MARK} 标记，跳过该项")
    else:
        ok_count = 0
        for p in marked:
            text = "\n".join(p["text"])
            if REASON_RE.search(text) or re.search(r"[（(][^）)]{2,}[）)]", text):
                ok_count += 1
            else:
                warnings.append(f"{AGENTS_FILE}:{p['line']} 段落标了 {NO_GATE_MARK} 但未写明原因")
        infos.append(f"规则 D：{len(marked)} 处 {NO_GATE_MARK} 标记，其中 {ok_count} 处已写明原因")

    # ————— 规则 E｜红线无门禁 —————
    if not redline_file:
        infos.append("规则 E：无权威表，未执行「阻断级红线必须有门禁」校验")
    else:
        gated_ids = set()
        for gate in gates:
            m = re.match(r"^([^#]+)#(.+)$", str(gate.get("source", "")).strip())
            if not m:
                continue
            id_part = m.group(2).split("@")[0].strip()
            if REDLINE_ID_RE.match(id_part):
                gated_ids.add(id_part)

        blocking_count, uncovered = 0, 0
        for entry in redline_entries.values():
            tier = entry["tier"]
            if not BLOCKING_TIER_RE.search(tier) or RETIRED_TIER_RE.search(tier):
                continue
            blocking_count += 1
            if entry["id"] in gated_ids:
                continue
            uncovered += 1
            if NO_GATE_MARK in tier:
                warnings.append(f"红线 {entry['id']}（{redline_file}:{entry['line']}）档位为 blocking 但无门禁，且未说明原因")
            else:
                errors.append(
                    f"红线 {entry['id']}（{redline_file}:{entry['line']}）档位为 blocking，"
                    f"但 {GATES_FILE} 中无任何门禁引用它 —— 存在红线却无门禁"
                )
        infos.append(
            f"规则 E：权威表 {len(redline_entries)} 条红线，其中 blocking 档 {blocking_count} 条，"
            f"已被门禁覆盖 {blocking_count - uncovered} 条"
        )

    # ————— 输出 —————
    print(f"ℹ️ info ({len(infos)})")
    for s in infos:
        print(f"  - {s}")
    print(f"⚠️ warning ({len(warnings)})")
    for s in warnings:
        print(f"  - {s}")
    print(f"❌ error ({len(errors)})")
    for s in errors:
        print(f"  - {s}")
    print(f"\n结果：{len(errors)} error / {len(warnings)} warning / {len(infos)} info")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
```
