# Agent 文档同步操作指南

> Skill `project-blueprint` Step 7 参考。Agent 如何在项目开发过程中持续维护文档。

---

## 何时同步

Agent 在完成以下操作后，应检查并同步相关文档：

| 触发场景 | 检查方法 | 同步动作 | 目标文件 |
|---------|---------|---------|---------|
| 新增模块 | `ls src/modules/` 对比 AGENTS.md 模块表 | 追加行：`\| new_module \| dir/ \| 职责 \|` | AGENTS.md 模块速查表 |
| 移除/重命名模块 | 同上对比 | 更新/删除对应行 | AGENTS.md |
| 新增 npm/pip/go 依赖 | 对比 package.json dependencies vs AGENTS.md 技术栈行 | 追加新工具到技术栈行 | AGENTS.md 项目身份 |
| 新增架构模式 | 发现使用了新的事件/策略/管道模式 | 追加到关键架构决策表 | AGENTS.md |
| 发现新代码规范 | 在 review 中反复出现同样的纠正 | 追加到强制规范章节 | AGENTS.md |
| 修复典型 Bug | Bug 有通用参考价值 | 写入根因+方案+预防 | docs/B/B-04-BUG知识库.md |
| 做出架构决策 | 涉及技术选型/模块拆分/性能优化 | 写入决策+理由+日期 | docs/C/C-03-项目长期记忆.md |
| 文档膨胀/模块超职责 | Service 承担多个职责域 | 按架构原则拆分：高内聚低耦合 / 单一职责 | 更新模块表和 docs 引用 |
| CI 流程变更 | `.github/workflows/ci.yml` 有变更 | 更新 docs 中 CI 描述 | docs/B/B-02-部署指南.md |
| 新增/删除测试框架 | package.json devDependencies 测试库变更 | 更新测试命令 | AGENTS.md Commands |
| 新增/移除 MCP 工具 | 检查 `docs/B/B-05-MCP工具清单.md` 是否存在 | 追加/移除工具条目（含安装命令），同步技术栈行 | docs/B/B-05-MCP工具清单.md + AGENTS.md |

---

## 同步原则

- **主动而非被动**：完成操作后主动检查，不要等用户提醒
- **增量而非覆盖**：追加新内容，保留历史（除非明确过时）
- **精简而非膨胀**：每个更新控制在 1-3 行，避免文档膨胀
- **先确认再修改**：如果变更影响较大（如删除模块），先告知用户再更新

---

## 同步示例

### 示例 1: 新增 payment 模块

```
Agent 完成了 src/modules/payment/ 的创建
    ↓
读取 AGENTS.md 模块速查表 → 发现无 payment 行
    ↓
追加: | payment | payment/ | 支付处理：微信/支付宝集成 |
    ↓
输出: "已将 payment 模块添加到 AGENTS.md 模块速查表"
```

### 示例 2: 修复了 coupon 超发 Bug

```
Agent 修复了 coupon.claim 的悲观锁超发问题
    ↓
判断：此 Bug 有通用参考价值（事务+锁模式）
    ↓
追加到 docs/B/B-04-BUG知识库.md:
  ## coupon.claim 超发
  **根因**: claim 未加悲观锁，并发请求同时通过库存校验
  **修复**: 添加 pessimistic_write 锁
  **模式**: 库存扣减类操作一律加悲观锁
```

### 示例 3: 引入 Redis 依赖

```
Agent 在 package.json 中新增了 ioredis 依赖
    ↓
检查 AGENTS.md 技术栈行 → 无 Redis
    ↓
更新: 技术栈: NestJS + TypeORM + MySQL + Redis + ...
```
