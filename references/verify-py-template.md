# 门禁统一入口参考实现（Python 宿主 `scripts/verify.py`）

> 生成到目标项目 `scripts/`（Python 宿主）。**语义等价判据**：同一份 `gates.json`，Node / Python 两个宿主对同一 `--stage` 过滤出同一批门禁、给出同一退出码。
> 引用方：`references/gates-templates.md` §五 ｜ 触发条件：项目**无 Node 运行时、有 Python**（宿主优先级 3）。
> 版本: v2.0 | 更新: 2026-10-14

```python
#!/usr/bin/env python3
# scripts/verify.py — 门禁统一入口（零外部依赖，Python 宿主）
#
# 与 references/gates-templates.md §二 的 Node 版 verify.mjs **语义等价**：
#   读取唯一事实源 scripts/gates.json → 按 --stage 过滤（含更早阶段）→ 逐条执行 run → 输出耗时汇总。
#   任一 blocking 门禁失败 → 退出码 1；warn 失败仅提示不阻断。
#
# 用法：
#   python scripts/verify.py                  # 跑全部门禁
#   python scripts/verify.py --stage=pre-push
#   python scripts/verify.py --stage=ci
#
# 零外部依赖：只用 Python 标准库（json / subprocess / pathlib / time / argparse / shutil）。

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

# Windows 控制台默认 GBK，无法输出 ▶ / ✅ 等符号 —— 强制 UTF-8，避免宿主因编码崩溃而误判门禁失败
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

ROOT = Path(__file__).resolve().parent.parent
GATES_FILE = Path("scripts") / "gates.json"
STAGE_ORDER = ["pre-commit", "pre-push", "ci"]  # 由早到晚


def main() -> int:
    parser = argparse.ArgumentParser(description="门禁统一入口（从 gates.json 读取执行）")
    parser.add_argument("--stage", choices=STAGE_ORDER, default=None, help="按阶段过滤（含更早阶段）")
    args = parser.parse_args()

    print("=== verify ===")

    gates_abs = ROOT / GATES_FILE
    if not gates_abs.exists():
        print("ℹ️ info (1)")
        print(f"  - 未找到门禁清单 {GATES_FILE}，跳过（退出 0）")
        print("\n结果：0 error / 0 warning / 1 info（未发现门禁清单）")
        return 0

    try:
        gates = json.loads(gates_abs.read_text(encoding="utf-8"))
        if not isinstance(gates, list):
            raise ValueError("顶层结构不是数组")
    except Exception as exc:  # noqa: BLE001 —— 清单不可解析必须阻断
        print(f"❌ 解析门禁清单 {GATES_FILE} 失败：{exc}")
        return 1

    # 阶段过滤：传 stage 时连同更早阶段一起跑；未声明 stage 的条目视为全阶段
    stage_idx = STAGE_ORDER.index(args.stage) if args.stage else -1
    if args.stage:
        selected = [
            g for g in gates
            if not g.get("stage")
            or any(s in STAGE_ORDER and STAGE_ORDER.index(s) <= stage_idx for s in g["stage"])
        ]
    else:
        selected = list(gates)

    infos, warnings, errors = [], [], []
    infos.append(f"门禁清单 {GATES_FILE}，共 {len(gates)} 条")
    if args.stage:
        earlier = " / ".join(STAGE_ORDER[:stage_idx]) or "无"
        infos.append(f"阶段过滤 {args.stage}（含更早阶段 {earlier}），命中 {len(selected)} 条")
    else:
        infos.append(f"未指定阶段，执行全部 {len(selected)} 条")

    rows, blocking_fails, warn_fails = [], 0, 0

    for i, gate in enumerate(selected, start=1):
        gate_id = gate.get("id") or f"(未命名门禁-{i})"
        level = "blocking" if gate.get("level") == "blocking" else "warn"
        run = gate.get("run")
        if not isinstance(run, str) or not run.strip():
            warnings.append(f"门禁 {gate_id} 缺少 run 字段，已跳过")
            continue
        cwd = (ROOT / gate.get("cwd", ".")).resolve()

        print(f"\n——— ▶️ {gate_id} [{level}] {run} ———")
        started = time.time()
        completed = subprocess.run(
            run, shell=True, cwd=str(cwd), capture_output=True, text=True, encoding="utf-8", errors="replace"
        )
        ok = completed.returncode == 0
        output = f"{completed.stdout or ''}{completed.stderr or ''}"
        if output.strip():
            print(output.rstrip())
        cost = int((time.time() - started) * 1000)
        detail = f"退出码 {completed.returncode}"
        print(f"✅ {gate_id} 通过（{cost}ms）" if ok else f"❌ {gate_id} 失败（{cost}ms，{detail}）")

        rows.append({"id": gate_id, "level": level, "ok": ok, "cost": cost, "source": gate.get("source", "-")})
        if not ok and level == "blocking":
            blocking_fails += 1
            errors.append(f"门禁 {gate_id} 失败（blocking 级，已阻断）：{detail}")
        elif not ok:
            warn_fails += 1
            warnings.append(f"门禁 {gate_id} 失败（warn 级，不阻断）：{detail}")

    if not rows:
        infos.append("当前阶段无命中门禁")

    print("\n=== 门禁分级结果 ===")
    print(f"ℹ️ info ({len(infos)})")
    for s in infos:
        print(f"  - {s}")
    print(f"⚠️ warning ({len(warnings)})")
    for s in warnings:
        print(f"  - {s}")
    print(f"❌ error ({len(errors)})")
    for s in errors:
        print(f"  - {s}")

    print("\n=== 门禁耗时汇总 ===")
    if not rows:
        print("  （无）")
    else:
        width = max(max(len(r["id"]) for r in rows), 12)
        for r in rows:
            mark = "✅" if r["ok"] else "❌"
            print(f"{mark} {r['id']:<{width}}  {r['cost']:>6}ms  [{r['level']}]  {r['source']}")

    total_ms = sum(r["cost"] for r in rows)
    print(f"\n结果：共 {len(rows)} 条门禁（blocking 失败 {blocking_fails} 条 / warn 失败 {warn_fails} 条），耗时合计 {total_ms}ms")
    print("❌ 存在 blocking 失败，已阻断" if blocking_fails else "✅ 无 blocking 失败")
    return 1 if blocking_fails else 0


if __name__ == "__main__":
    sys.exit(main())
```
