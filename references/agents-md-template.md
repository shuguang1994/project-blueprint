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

### 4.4 第三方库使用

```
✅ 涉及第三方库（NestJS/TypeORM/BullMQ/Vant 等）的 API/版本/配置 → 先 WebSearch/WebFetch 查官方文档，确认当前版本用法后再写
✅ 升级依赖后 → 核对官方 changelog / 迁移指南破坏性变更
❌ 凭旧记忆写库的 API（版本差异易踩坑）
```
> Reason: 模型知识有截止时间，旧版本 API 写法易导致编译失败或运行期 Bug。

### 4.5 代码规范体系 + AI 高频错误防犯

三层引用：
- AGENTS.md 强制规范为核心规则（权威源）
- 详细规范见 docs/B/B-01-开发规范.md（8 章编码规范）
- Bug 反哺见 docs/B/B-04-BUG知识库.md（记录典型 Bug 与规范缺失）

```
❌ 凭旧记忆写第三方库 API（先查官方文档）
❌ 只走 happy path（未处理错误分支）
❌ 吞错误（catch 后不处理不记录）
❌ 硬编码密钥（Token/密码/API Key）
❌ 滥用 any / 类型断言绕过检查
❌ 逐条 await 循环（用 Promise.allSettled / 批量操作）
❌ N+1 查询（用 JOIN / 批量查询）
✅ 写代码前先读现有代码，复用已有封装
```
> Reason: AI 高频错误多为模型固有倾向，需显式清单持续防犯；规范缺失类 Bug 反哺 B-01 与 AGENTS.md 防复发。

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
- **分支**: `main`(唯一常驻，tag 发布) 或 `master`(生产) / `develop`(日常) — 按已有分支写入
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
- [ ] 第三方库用法已核对当前版本文档？
- [ ] 无 N+1 查询？
- [ ] 错误路径已处理（非仅 happy path）？
- [ ] 无硬编码密钥？
- [ ] 无滥用 any？
- [ ] 未绕过 api/ 封装（跨模块直接操作数据层）？
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
  | 修复 Bug 且根因是规范缺失 | 补充 B-01 对应章节规则 + 强制规范新增一条 ✅/❌ 防复发 |
  | 按项目进度检查（功能完成/重构/上线/季度） | 检查 AGENTS.md / B-01 / B-04 是否滞后，滞后则提醒用户维护 |
  | CI 流程变更 | 同步更新 docs 中 CI 描述 |
- **架构原则控制文档规模** — 高内聚低耦合 / 模块职责单一 / 组合优于继承 / 避免全局状态 / 纯函数优先 / 复用已有代码避免重复造轮子。当 AGENTS.md 容纳不下时，按职责域拆分到 docs/ 引用。
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
