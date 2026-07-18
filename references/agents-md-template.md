# AGENTS.md 兜底模板

> ⚠️ 兜底模板：仅在所有自动探测和联网回退都失败时使用。
> 正常情况应由规则引擎从 knowledge-base.md 按组件拼接生成。

---

```markdown
# [项目名] 项目开发规范 (AGENTS.md)

> AI 编程助手的强制开发规范。v1.0 | [YYYY-MM-DD]
> AI 工具: [IDE名称] | 加载: always_applied

***

## 一、项目身份

- **项目**: [项目简介，一句话]
- **技术栈**: [语言] + [框架] + [数据库] + [部署方式]
- **数据库**: `[库名]`，命名约定: [snake_case/camelCase]
- **部署**: [地址/域名/端口]

## 二、常用命令

```bash
# 编译检查
[编译命令]                       # 单文件: [单文件编译命令]

# 本地启动
[启动命令]

# 测试
[测试命令]                       # 单文件: [单文件测试命令]
[覆盖率命令]
[E2E测试命令]

# 构建
[构建命令]

# 部署
[部署命令]

# NEVER run
git push --force / git reset --hard / DELETE FROM 不带 WHERE
```

## 三、Boundaries

**Allowed**: `src/`、`[项目源码目录]`、`docs/`

**Ask First**: 数据库迁移、依赖变更（package.json / go.mod）、基础设施配置

**Never Touch**: `node_modules/`、`dist/`、`build/`、`.env` 文件、证书/密钥、vendor/ 目录

## 四、强制规范

### 4.1 模块封装 + 数据一致性

```
❌ 跨模块直接操作其他模块的 Entity / Repository / Model
❌ 多步写操作无事务
✅ 跨模块数据访问 → 目标模块的 Service 接口
✅ 多步写操作 → 事务包裹
```
> Reason: 跨模块操作导致强耦合，迁移时全项目爆炸。无事务中途失败产生孤儿记录。

### 4.2 安全 + 性能

```
❌ 硬编码密码/Token/API Key → 一律环境变量注入
❌ 数据库默认密码
❌ 逐条 await for → Promise.allSettled / 批量操作
❌ 全量查内存分页 → 数据库 LIMIT/OFFSET
❌ N+1 查询 → JOIN 或批量查询
✅ JWT_SECRET 生产必须更换
✅ 所有数据查询强制隔离（storeId / tenantId / userId）
✅ 全局限流（200次/分钟）
```
> Reason: 硬编码密码提交到 Git 后无法安全清除。逐条 await = N 次 DB 往返，并行 = 1 次。

### 4.3 日志规范

```
✅ 使用框架 Logger，禁止 console.log
✅ 关键业务节点 info 日志（如"操作成功 xxxId=123"）
✅ 异常含完整堆栈
❌ 禁止打印完整请求体（可能含密码）
❌ 禁止循环中逐条打日志
❌ 禁止打印 SQL 全量查询结果
```

## 五、模块速查（按项目实际模块填写）

| 模块 | 目录 | 核心职责 |
|------|------|---------|
| [模块1] | `[目录]` | [职责] |
| [模块2] | `[目录]` | [职责] |

## 六、关键架构决策

| 决策 | 说明 |
|------|------|
| [决策1] | [说明] |
| [决策2] | [说明] |

## 七、Git 规范

- **平台**: [Gitee/GitHub/GitLab]
- **分支**: `master`(生产) / `develop`(日常) / `feat/xxx`(功能) / `fix/xxx`(修复)
- **提交格式**: `<type>(<scope>): <description>`
  - type: `feat`/`fix`/`refactor`/`docs`/`test`/`chore`/`perf`
- **禁止提交**: `.env` / `node_modules/` / `dist/` / 证书/密钥
- **部署前必须 commit**，线上问题 `git revert` 回滚

## 八、代码审查检查清单

- [ ] 新接口有认证/授权？
- [ ] 多步写操作有事务？
- [ ] 跨模块走 Service 接口？
- [ ] 数据已按隔离键过滤？
- [ ] 无 console.log（用 Logger）？
- [ ] 无硬编码密码/Token？
- [ ] 新表结构有迁移脚本？
- [ ] 关键节点有 info 日志？
- [ ] 测试通过？（如果有测试）

## 上下文管理

- **Agent 主动维护本文件** — 每次完成以下操作时同步更新：
  | 操作 | 更新内容 |
  |------|---------|
  | 新增模块/服务 | 更新模块速查表 |
  | 新增依赖/工具 | 更新技术栈行 |
  | 发现新的代码规范 | 追加到强制规范章节 |
  | 做出架构决策 | 追加到关键架构决策表 |
  | 修复典型 Bug | 写入 docs/B/B-04-BUG知识库.md |
  | CI 流程变更 | 同步更新 docs 中 CI 描述 |
- **架构原则控制文档规模** — 高内聚低耦合 / 模块职责单一 / 组合优于继承 / 避免全局状态 / 纯函数优先。当 AGENTS.md 容纳不下时，按职责域拆分到 docs/ 引用。
- 项目记忆: project_memory.md 季度清理
- 会话记忆: 自动过期保留最近 7 天
```

## 模板填充规则

| 占位符 | 来源 |
|--------|------|
| `[项目名]` | package.json name 或询问用户 |
| `[IDE名称]` | 当前使用的 IDE（TRAE/Cursor/VS Code） |
| `[语言]` | 探测结果 |
| `[框架]` | 探测结果 |
| `[数据库]` | package.json dependencies 或询问用户 |
| `[编译命令]` | 按语言: tsc --noEmit / go build / python -m py_compile |
| `[测试命令]` | 按语言: jest / vitest / go test / pytest |
| `[Gitee/GitHub/GitLab]` | git remote -v 探测结果 |
| `[模块列表]` | 询问用户或从 src/ 目录推断 |
