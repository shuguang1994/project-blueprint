# 基础代码规范知识库（Code Conventions）

> Skill `project-blueprint` Step 2 参考。项目初始化时用于**实际写入基础代码规范**的种子知识库。提供确定性规范类别框架与高频规则（保证下限），大模型自身知识负责展开细化、联网搜索负责补充未知技术栈（保证上限）。v1.7
>
> **引用方式（Step 2 三层递进拼接）**：
> ① 命中类别 → 直接引用对应 `## 类别` 条目的 Conventions，拼接进 AGENTS.md「基础代码规范」章节；
> ② 细化规则 → 大模型按本文件类别框架 + 自身知识展开；
> ③ 未知技术栈 / 惯例存疑 → 使用该类别 `**搜索模板**`（`{currentYear}` 占位符）联网搜索后展开。
>
> **建库期联网验证（必需）**：条目编写/维护时，各语言/框架规范细节必须 WebSearch 核对当前版本（`"{language} {topic} best practices {currentYear}"`）。规范生态更新快，禁止凭记忆写规则。

---

## 1. 命名规范（Naming Conventions）

> 按语言区分 camelCase / snake_case / PascalCase / kebab-case；覆盖文件、目录、变量、函数、类、组件、常量、数据库表与字段。

**Conventions**（通用）:
- ❌ 拼音缩写命名（`getSj`）或无语义命名（`data2`、`temp`、`flag`）
- ❌ 缩写词大小写混乱（`userID`、`getAPIUrl` → `userId`、`getApiUrl`）
- ❌ 单字符变量滥用（循环计数器 `i`/`j` 除外）
- ✅ 命名表意：动词+名词（`fetchUserList`、`getUserById`），布尔用 `is/has/can` 前缀
- ✅ 常量全大写 + 下划线（`SCREAMING_SNAKE_CASE`），或遵循语言惯例
- ✅ 同一代码库风格一致，配置 Lint 规则强制（eslint / golangci-lint / ruff / checkstyle）

### TypeScript / JavaScript
**Conventions**:
- ❌ `var`；❌ 无类型 `any` + 含糊变量名
- ❌ 文件名与导出名不一致（文件 `user-card.tsx` 导出 `Card`）
- ✅ 变量/函数/方法 camelCase；类/接口/类型/组件 PascalCase；枚举成员按团队惯例（PascalCase 或 UPPER_SNAKE_CASE）
- ✅ 组件文件名：Vue 生态 kebab-case（`user-card.vue`），React 生态 PascalCase（`UserCard.tsx`），与框架社区惯例一致
- ✅ 类型名加语义后缀（`User`、`UserDTO`、`UserEntity`）

### Go
**Conventions**:
- ❌ 下划线命名（`user_name` → `userName`）；❌ 包名复数（`utils` → `util`）
- ❌ 未导出却大写 / 导出却小写（跨包不可见）
- ✅ 导出标识符大写开头，未导出小写驼峰；包名小写单词
- ✅ 接口名惯例 `er` 结尾（`Reader`、`Writer`）；错误变量以 `err`/`Err` 开头
- ✅ 常量枚举用 `iota`；文件/目录名 snake_case（`user_service.go`）

### Python
**Conventions**:
- ❌ 类名 snake_case / 函数 camelCase（违反 PEP 8）；❌ 变量用 `l`/`O`/`I`
- ✅ 模块/包/函数/变量 snake_case；类名 PascalCase；常量 UPPER_SNAKE_CASE
- ✅ 私有成员前缀 `_`（`_helper`）；`__x` 双下划线仅用于名称改写场景
- ✅ 公开函数签名标注类型注解（mypy 可检查）

### Java
**Conventions**:
- ❌ 包名含大写（`Com.Example.App`）；❌ 静态常量非全大写
- ✅ 包名全小写反向域名（`com.example.app`）；类/接口 PascalCase
- ✅ 常量 `static final` 用 UPPER_SNAKE_CASE；变量/方法 camelCase；boolean 用 `is/has/can`
- ✅ 接口与实现命名二选一并固定：`UserService` → `UserServiceImpl` 或 `DefaultUserService`

### 数据库（表 / 字段）
**Conventions**:
- ❌ 表名驼峰、含空格或保留字；❌ 字段语义含糊（`time` 分不清 created/updated）
- ✅ 表名复数 snake_case（`users`、`order_items`）；字段 snake_case（`user_id`、`created_at`）
- ✅ 主键 `id`；外键 `<entity>_id`；时间 `created_at` / `updated_at`；布尔 `is_*`/`has_*`
- ✅ 索引命名可识别：普通索引 `idx_<table>_<column>`、唯一索引 `uk_<table>_<column>`

**搜索模板**: `"{language} naming conventions best practices {currentYear}"`

---

## 2. 目录结构规范（Directory Structure）

> 按职责分层、模块化、避免深层嵌套。**不硬编码固定目录清单（零固定表）**——目录结构由 Step 1 探测结果决定，本条目仅提供分层原则、高频模式与各语言惯例作为框架。

**Conventions**（通用）:
- ❌ 深层嵌套（超过 4 层）或单目录堆积数百文件
- ❌ 功能相近代码散落多处、公共代码在各模块重复 copy
- ❌ 跨模块深层相对引用（`../../../../utils`）
- ✅ 按职责分层：接入层 / 业务层 / 数据层分离（具体目录名按框架惯例 + 探测结果确定）
- ✅ 业务模块自包含：同一模块的控制器/服务/数据访问/测试同目录聚合
- ✅ 公共代码抽离共享层（`utils/` / `common/` / `pkg/`），模块间只通过公共层或接口协作
- ✅ 源码与构建产物隔离（`src/` vs `dist/`、`build/`），生成物不入版本库

### 前端（TypeScript 生态）
**Conventions**:
- ❌ 组件、页面、工具函数混放同一目录
- ✅ 按功能分块（`components/`、`pages|views/`、`hooks|composables/`、`services|api/`、`stores/`、`utils/`），目录名 kebab-case
- ✅ 页面与路由同构（`pages/` 下路径即路由）；页面私有组件就近下沉（页面目录下 `components/`）

### Go
**Conventions**:
- ❌ 业务逻辑堆在 `main` / 单一 handler 包
- ✅ 标准布局：`cmd/`（可执行入口）+ `internal/`（私有代码）+ `pkg/`（可复用公共库）
- ✅ 业务按领域分包（`internal/user/`、`internal/order/`），包内按文件分职责而非目录套目录

### Python
**Conventions**:
- ❌ 单文件堆积所有逻辑（除非脚本型工具）
- ✅ 包内 `__init__.py` 收敛对外接口；按模块职责分文件（`models.py` / `schemas.py` / `services/`）
- ✅ 大型项目按应用/领域拆包（Django app、FastAPI routers/），`tests/` 与源码同构

### Java
**Conventions**:
- ❌ 全部类堆在根包下
- ✅ Maven/Gradle 标准结构 `src/main/java` + `src/test/java`，包路径即分层（`controller/`、`service/`、`repository/`、`dto/`）
- ✅ 按业务域分组（`user/`、`order/`）优先于纯技术分层；依赖方向单向：controller → service → repository，禁止循环依赖

**搜索模板**: `"{language} project directory structure best practices {currentYear}"`

---

## 3. 错误处理规范（Error Handling）

**Conventions**（通用）:
- ❌ 吞错误（`catch (e) {}` / `except: pass` / 忽略 err 返回值）——禁止静默失败
- ❌ 用返回 `null` / `-1` / `0` 表示业务错误（丢失类型与上下文）
- ❌ 把框架/系统原始异常直接抛给前端（泄露内部细节与堆栈）
- ✅ 统一错误模型与错误码（类别 + 码 + 消息 + 上下文），前端可识别并映射提示
- ✅ 业务异常与系统异常分离：系统异常统一兜底，业务异常携带用户可读信息
- ✅ 错误边界：后端全局异常处理器（@ControllerAdvice / FastAPI handler / Nest 异常过滤器）；前端 ErrorBoundary 兜底渲染
- ✅ 前端请求四态齐全：Loading / Success / Error / Empty，Error 态提供重试

### 统一错误码与错误模型
**Conventions**:
- ❌ 错误码与 HTTP 状态码混为一谈（同码不同义）
- ✅ 错误码分级：类别（参数/权限/资源/系统/依赖）+ 序号，如 `<系统>_<类别>_<序号>`（占位符，按项目定）
- ✅ 错误码字典集中维护并文档化；新增错误码需评审，禁止随用随造

### 后端全局异常处理
**Conventions**:
- ✅ 全局拦截：未知异常转 500 + 日志（含 stack + trace_id）；业务异常转对应状态码（400/401/403/404/409）
- ✅ 校验失败返回字段级错误（`field: message` 列表）
- ✅ 外部依赖（DB / Redis / 第三方 API）异常包装为可识别类型，超时/熔断有兜底
- ✅ 写操作与错误处理联动：事务中出错必须回滚（事务注解 / 手动 rollback）

### 前端错误边界与请求四态
**Conventions**:
- ✅ 路由/页面级 ErrorBoundary（React）/ 组件级错误捕获（Vue errorHandler）
- ✅ 请求封装统一处理错误：HTTP 错误码 → 用户提示；网络错误 → 重试/降级
- ✅ 空数据给 Empty 态（非报错），与 Error 态严格区分

### 各语言要点（TypeScript / Go / Python / Java）
**Conventions**:
- TS: ❌ `catch` 后无日志无 rethrow / ✅ 自定义 `Error` 子类 + `cause` 链
- Go: ❌ `panic`（除 init/main） / ✅ `fmt.Errorf("...: %w", err)` 包装 + `errors.Is/As` 判定
- Python: ❌ `except Exception` 无操作 / ✅ `raise` 自定义异常（继承 `Exception`），`raise ... from e` 保留链路
- Java: ❌ 受检异常滥用（仅在可恢复场景使用） / ✅ 业务异常继承 `RuntimeException` 统一走全局处理器

**搜索模板**: `"{language} error handling best practices {currentYear}"`

---

## 4. 日志规范（Logging）

**Conventions**（通用）:
- ❌ 生产代码 `console.log` / `print()`（调试日志必须移除或换正式日志库）
- ❌ 记录敏感信息（密码、Token、密钥、手机号、身份证明文）
- ❌ 无级别区分（全 info / 全 error）、无上下文（裸消息无法定位）
- ✅ 结构化日志：JSON 字段 `timestamp / level / message / service / trace_id / context`
- ✅ 级别使用：debug 调试细节 / info 关键业务事件 / warn 可恢复异常 / error 未处理异常（fatal 仅启动失败）
- ✅ 关键节点打日志：请求入口/出口、外部依赖调用、异常、异步任务
- ✅ 敏感字段脱敏（掩码规则统一，如 `138****1234`），禁止输出请求体原文
- ✅ 链路追踪：请求 ID / trace ID 贯穿日志（中间件生成并透传）

### 结构化日志格式
**Conventions**:
- ❌ 多行/自由文本格式（日志采集与检索困难）
- ✅ JSON 单行输出（便于采集），示例：
```json
{"ts":"2026-01-01T00:00:00.000Z","level":"info","msg":"user login","service":"user-api","trace_id":"<id>","user_id":"<id>"}
```

### 日志级别与上下文
**Conventions**:
- ❌ 循环内高频日志打点（全链路日志需采样）
- ✅ 业务关键事件用 info（登录、下单、配置变更）；warn 记录可自动恢复问题（如重试成功）
- ✅ 错误日志带上下文（脱敏后的请求参数、trace_id、耗时），禁止裸 `Error: xxx`

### 敏感信息脱敏
**Conventions**:
- ✅ 统一脱敏工具：手机号/邮箱/身份证/银行卡掩码；Token 只留前后 4 位
- ✅ 日志与响应共用同一套脱敏规则；❌ 明文打印请求/响应 body

### 各语言要点（TypeScript / Go / Python / Java）
**Conventions**:
- TS: ❌ console.log / ✅ pino / winston / nest-winston
- Go: ❌ `log.Print` 无结构化 / ✅ `log/slog` / zap
- Python: ❌ `print()` / ✅ `logging` 标准库 + dictConfig，或 structlog
- Java: ❌ 字符串拼接日志（`"id=" + id`） / ✅ SLF4J + Logback（占位符 `{}` 惰性拼接）

**搜索模板**: `"{language} structured logging best practices {currentYear}"`

---

## 5. 安全规范（Security）

**Conventions**（通用）:
- ❌ 密钥硬编码进代码/仓库（`.env` 不入库，`.gitignore` 必须覆盖）
- ❌ 字符串拼接 SQL / 裸拼查询条件（注入风险）
- ❌ 明文存储密码或可逆加密存储密码
- ❌ 仅靠前端隐藏入口当鉴权（接口必须后端校验）
- ✅ 输入校验：白名单 + 类型 + 长度 + 边界，**服务端必须二次校验**
- ✅ 密钥管理：环境变量 / 密钥管理服务（KMS / Secret Manager），禁止提交到版本库
- ✅ 鉴权与授权分离：认证（你是谁）→ 授权（能做什么，RBAC/ABAC/资源属主校验）
- ✅ 注入防护：参数化查询 / ORM；输出编码防 XSS；命令执行禁止拼接
- ✅ 数据隔离：多租户/多用户查询强制带属主条件，防水平越权（IDOR）

### 密钥与配置管理
**Conventions**:
- ✅ `.env` 提交模板（`.env.example`），真实值仅存环境变量或密钥服务
- ✅ 密钥轮换与访问控制；❌ 日志/报错/响应中泄露密钥
- ✅ 框架读取配置统一封装（config 模块），禁止散落裸读环境变量

### 输入校验与注入防护
**Conventions**:
- ✅ 服务端校验框架：Zod（TS）/ validator（Go）/ Pydantic（Python）/ Bean Validation（Java）
- ✅ 参数化查询或 ORM 占位符；文件名、URL、命令行参数走白名单校验
- ✅ HTML 输出转义（前端框架默认 + 富文本白名单过滤）

### 鉴权与授权
**Conventions**:
- ✅ 登录态用 HttpOnly + Secure Cookie 或短期 Token；敏感操作二次校验
- ✅ 接口级鉴权中间件/守卫 + 资源级属主校验（查询条件强制带当前用户标识）
- ✅ 会话/Token 失效机制；❌ 硬编码管理员账号

### 数据隔离与依赖安全
**Conventions**:
- ✅ 密码哈希（bcrypt/argon2），禁止 MD5/SHA 裸存；敏感字段加密存储
- ✅ 依赖漏洞扫描：`npm audit` / `govulncheck` / `pip-audit` / OWASP Dependency-Check
- ✅ 安全响应头（CSP、X-Frame-Options 等由框架默认开启）

**搜索模板**: `"{language} security best practices OWASP {currentYear}"`

---

## 6. 性能规范（Performance）

**Conventions**（通用）:
- ❌ N+1 查询（循环内查库）——用预加载 / join / 批量查询
- ❌ 全表扫描 / 无索引查询（大表必须 `EXPLAIN` 验证）
- ❌ 循环内发网络请求 / 串行同步等待
- ✅ 批量操作替代逐条（batch insert / bulkWrite / executemany）
- ✅ 大数据集分页：offset 深翻页换游标分页（cursor / keyset）
- ✅ 缓存热点数据（多级缓存 + TTL 失效 + 一致性保障）
- ✅ 懒加载 / 按需加载：前端路由级代码分割、图片懒加载；后端延迟初始化重资源
- ✅ 资源池化与超时：连接池、超时、重试、限流/熔断

### 查询优化（N+1 / 索引）
**Conventions**:
- ❌ 索引冗余 / 无效索引（重复前缀索引）；❌ 无索引外键
- ✅ 预加载：Prisma `include`、GORM `Preload`、SQLAlchemy `selectinload`、Django `select_related/prefetch_related`
- ✅ 索引：高频查询条件列建索引，复合索引遵循最左前缀，覆盖索引减少回表

### 批量与分页
**Conventions**:
- ❌ 逐条 insert + 逐次提交（千行级数据）
- ✅ 批量写用单条批量语句 + 事务（千行级）
- ✅ 列表接口强制分页上限（默认页大小 + 最大上限），禁止全量返回
- ✅ 深分页用游标：`WHERE id > ? ORDER BY id LIMIT ?`

### 缓存策略
**Conventions**:
- ❌ 缓存无过期无限增长；❌ 缓存与数据源强一致假设（用 TTL/失效保证最终一致）
- ✅ 读多写少热点数据缓存（Redis/内存），设置 TTL 防脏读
- ✅ 缓存失效：主动删除 / 双删 / 版本号，保证最终一致
- ✅ 缓存穿透 / 击穿 / 雪崩防护：空值缓存、互斥重建、随机 TTL

### 前端性能与并发资源
**Conventions**:
- ❌ 首屏全量打包（未做代码分割）
- ✅ 路由级 code splitting + 组件懒加载；图片懒加载 + 尺寸/格式优化（webp/avif）
- ✅ 并发受限：数据库连接池、HTTP 客户端连接复用、并发度控制；❌ 无限制 goroutine/线程/连接

**搜索模板**: `"{language or framework} performance best practices {currentYear}"`
