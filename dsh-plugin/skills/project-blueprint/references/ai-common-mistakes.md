# AI 高频错误知识库

> AI 编程助手易错点清单，按「错误类型 × 技术栈」系统化。Step 2 生成 AGENTS.md 时，按探测到的技术栈提取对应「AI 易错点」并**优先注入**强制规范；工程化中 B-04 反哺闭环会迭代本清单。
> 每条含六段：AI 易错点 / 后果 / ❌ 错误示范 / ✅ 正确做法 / 关联知识库 / 搜索模板（{currentYear} 用系统真实年份）。v1.7

---

## [1. 依赖/API 类]

### 凭旧记忆写第三方库 API
**AI 易错点**: 模型知识有截止时间，训练数据中 TypeORM 0.2 / BullMQ v4 等旧版 API 记忆更牢固，写代码时默认输出旧语法（如 `createConnection()` / `getRepository()`），与项目已装的 0.3+ 版本不兼容。
**后果**: 编译/运行时报错、API 行为与预期不符，浪费调试时间。
**❌ 错误示范**:
```typescript
// TypeORM 0.2 语法（已废弃，0.3 移除 createConnection/getRepository）
import { createConnection, getRepository } from 'typeorm';
await createConnection({ type: 'mysql', host: 'localhost' });
const repo = getRepository(User);
```
**✅ 正确做法**:
```typescript
// TypeORM 0.3：AppDataSource 单例 + dataSource.getRepository
import { AppDataSource } from './data-source';
const repo = AppDataSource.getRepository(User);
```
**关联知识库**: [TypeORM]、[核心开发原则]
**搜索模板**: `"TypeORM 0.3 migration breaking changes {currentYear}"`

### 升级依赖未核对破坏性变更
**AI 易错点**: 修改 package.json 版本后凭印象继续用旧 API，未核对 major 升级的破坏性变更（BullMQ v4→v5 队列选项改名、Vant 2→4 组件 API 重写）。
**后果**: 运行时行为异常、TypeScript 类型不匹配、线上故障。
**❌ 错误示范**:
```json
{
  "dependencies": {
    "bullmq": "^5.0.0"
  }
}
```
```typescript
// 仍按 v4 记忆写队列选项，v5 中 concurrency 已移入 Worker 选项
const queue = new Queue('mail', { defaultJobOptions: { attempts: 3 } });
queue.add('send', data, { backoff: { type: 'exponential' } });
```
**✅ 正确做法**:
```bash
# 升级前先核对官方 changelog / 迁移指南，再改代码
npm view bullmq versions --json
```
```typescript
// 按 v5 官方文档编写（如 Worker 选项结构、事件监听方式）
import { Queue, Worker } from 'bullmq';
const worker = new Worker('mail', processor, { concurrency: 5 });
```
**关联知识库**: [核心开发原则]、[npm / yarn]
**搜索模板**: `"BullMQ v5 migration guide breaking changes {currentYear}"`

### 重复引入已有依赖可覆盖的新包
**AI 易错点**: 不先扫描 package.json 已有依赖，直接安装功能重叠的新包（项目已装 axios 又引入 fetch 封装库、已用 dayjs 又引入 moment）。
**后果**: 依赖膨胀、包体积变大、两套 API 并存增加维护成本。
**❌ 错误示范**:
```bash
npm install moment  # 项目 package.json 已存在 dayjs
```
```typescript
import moment from 'moment'; // 与已有 dayjs 并存，重复造轮子
```
**✅ 正确做法**:
```bash
# 先查已有依赖（grep dayjs package.json / npm why moment）→ 复用已有，不引入新包
npm why dayjs
```
```typescript
import dayjs from 'dayjs'; // 复用项目已有依赖
```
**关联知识库**: [核心开发原则]、[npm / yarn]
**搜索模板**: `"dayjs vs moment bundle size comparison {currentYear}"`

### 绕过项目封装的 api/ 直调底层 HTTP
**AI 易错点**: 未先读项目已有封装（如 uni-app 的 api/ 目录、统一 request 封装），在页面里直接写 fetch / uni.request，导致鉴权头、错误码处理、loading 逻辑全部缺失。
**后果**: 请求无统一鉴权/错误处理、token 失效不跳登录、重复代码。
**❌ 错误示范**:
```typescript
// 绕过 src/api/ 封装，页面内直调
const res = await fetch('/api/orders', { headers: { token: localStorage.getItem('t')! } });
```
**✅ 正确做法**:
```typescript
// 统一走项目 api/ 封装，鉴权/错误处理/loading 由封装层完成
import { getOrderList } from '@/api/order';
const orders = await getOrderList({ page: 1 });
```
**关联知识库**: [uni-app (Vue 3)]、[核心开发原则]
**搜索模板**: `"api wrapper pattern frontend request encapsulation best practices {currentYear}"`

---

## [2. 数据/性能类]

### N+1 查询
**AI 易错点**: 在循环体内直接查库或访问 ORM 关联属性，忘记 ORM 默认懒加载（Django lazy loading、JPA LAZY fetch），写出每循环一次就多一次查询的 N+1 模式。
**后果**: 数据库请求数随数据量线性爆炸，接口从毫秒级劣化到秒级/超时。
**❌ 错误示范**:
```python
# Django：循环内访问关联对象触发 N+1
users = User.objects.all()
for user in users:
    orders = user.orders.all()  # 每个 user 一次额外查询
```
**✅ 正确做法**:
```python
# Django：select_related / prefetch_related 一次性预取
users = User.objects.prefetch_related('orders')
for user in users:
    orders = user.orders.all()  # 复用已预取结果
```
**关联知识库**: [Django]、[SQLAlchemy]、[JPA / Hibernate]
**搜索模板**: `"prevent N+1 queries {currentYear} select_related prefetch_related"`

### 多步写不包事务
**AI 易错点**: 把多个写入操作平铺直写，未意识到中间步骤失败会导致数据不一致，缺少事务边界。
**后果**: 部分成功部分失败，产生脏数据；扣款成功但订单未创建等资损级 Bug。
**❌ 错误示范**:
```typescript
// NestJS + TypeORM：两步写无事务
async transfer(fromId: number, toId: number, amount: number) {
  await repo.decrement({ id: fromId }, 'balance', amount);
  await repo.increment({ id: toId }, 'balance', amount); // 第二步失败则钱丢失
}
```
**✅ 正确做法**:
```typescript
// 用 dataSource.transaction 包住多步写
async transfer(fromId: number, toId: number, amount: number) {
  await this.dataSource.transaction(async (manager) => {
    await manager.decrement(User, { id: fromId }, 'balance', amount);
    await manager.increment(User, { id: toId }, 'balance', amount);
  });
}
```
**关联知识库**: [NestJS]、[TypeORM]、[Spring Boot]
**搜索模板**: `"TypeORM dataSource.transaction multi-step write example {currentYear}"`

### 大表查询字段无索引
**AI 易错点**: 建表/加字段时只关注业务字段，忽略高频查询条件需要索引；或新增查询条件后未补索引。
**后果**: 大表全表扫描，慢查询拖垮数据库，接口超时。
**❌ 错误示范**:
```sql
-- 百万行订单表，按 user_id + status 高频查询，但无索引
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL
);
-- 查询走全表扫描
SELECT * FROM orders WHERE user_id = 42 AND status = 'paid';
```
**✅ 正确做法**:
```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL,
  INDEX idx_user_status (user_id, status)  -- 复合索引命中高频查询
);
```
**关联知识库**: [MySQL]、[PostgreSQL]
**搜索模板**: `"postgresql index best practices composite index order {currentYear}"`

### 全量查询后在内存分页/筛选
**AI 易错点**: 直接 `SELECT * FROM table` 再在代码里 filter/slice 分页，忽略数据量增长；或深翻页用 `OFFSET` 导致数据库扫描大量行。
**后果**: 内存占用随数据量线性增长，深分页时接口越来越慢直至超时。
**❌ 错误示范**:
```go
// Go + GORM：全量加载到内存再筛选
var all []Order
db.Find(&all)
var page []Order
for _, o := range all { // 百万行全进内存
  if o.UserID == 42 { page = append(page, o) }
}
```
**✅ 正确做法**:
```go
// 数据库层完成分页过滤
var page []Order
db.Where("user_id = ?", 42).
  Order("id DESC").
  Limit(20).Offset(40). // 或游标分页 WHERE id < lastID
  Find(&page)
```
**关联知识库**: [GORM]、[PostgreSQL]
**搜索模板**: `"cursor pagination vs offset pagination performance {currentYear}"`

---

## [3. 错误处理类]

### 只走 happy path
**AI 易错点**: 按"输入合法、系统正常"的理想路径写代码，未覆盖参数缺失、资源不存在、下游失败等异常分支。
**后果**: 线上异常路径全部裸奔：空指针/未定义、500、前端白屏无提示。
**❌ 错误示范**:
```javascript
// Express：无错误分支
app.get('/user/:id', (req, res) => {
  const user = db.get(req.params.id);
  res.json(user.name); // id 不存在时 user 为 undefined → TypeError
});
```
**✅ 正确做法**:
```javascript
app.get('/user/:id', (req, res, next) => {
  const user = db.get(req.params.id);
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND' });
  res.json(user);
});
```
**关联知识库**: [Express.js]、[核心开发原则]
**搜索模板**: `"express error handling best practices 404 {currentYear}"`

### catch 后吞错误
**AI 易错点**: 为让程序"不报错"在 catch 里留空或只打日志继续执行；Go 中用 `_ =` 忽略 error 返回值。
**后果**: 错误静默丢失、故障难排查；数据写入失败但业务继续推进，产生脏状态。
**❌ 错误示范**:
```go
// Go：忽略错误
func (s *Service) UpdateUser(id int64) {
  _ = s.repo.Update(id) // 失败无感知，调用方以为已更新
}
```
**✅ 正确做法**:
```go
// 包装上下文向上抛，由上层统一处理
func (s *Service) UpdateUser(ctx context.Context, id int64) error {
  if err := s.repo.Update(ctx, id); err != nil {
    return fmt.Errorf("update user %d: %w", id, err)
  }
  return nil
}
```
**关联知识库**: [Go]、[核心开发原则]
**搜索模板**: `"go error handling wrap fmt.Errorf %w best practices {currentYear}"`

### 无统一错误码与响应格式
**AI 易错点**: 在 Controller 里随手 return 各种形状的对象，或把底层异常直接抛给前端，没有统一 `{ code, message, data }` 响应结构。
**后果**: 前端无法统一处理错误、联调成本高；堆栈信息泄漏给客户端。
**❌ 错误示范**:
```java
// Spring Boot：Controller 直接抛异常，无全局处理
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id) {
  return service.findById(id).orElseThrow(() -> new RuntimeException("not found"));
}
```
**✅ 正确做法**:
```java
// @ControllerAdvice 统一异常 → 统一响应格式
@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(OrderNotFoundException.class)
  public ResponseEntity<ApiResult<Void>> handle(OrderNotFoundException e) {
    return ResponseEntity.status(404)
        .body(ApiResult.error("ORDER_NOT_FOUND", e.getMessage()));
  }
}
```
**关联知识库**: [Spring Boot]、[NestJS]
**搜索模板**: `"spring boot controller advice unified error response {currentYear}"`

### 空值未处理
**AI 易错点**: 直接对可空返回值做链式访问/强制解包，假设"一定有值"；Java 中直接 `.get()` 而不是 Optional 处理。
**后果**: NullPointerException / TypeError，生产环境 500。
**❌ 错误示范**:
```java
// Java：Optional 直接 get()，为空即炸
User user = userRepository.findById(userId).get(); // 无记录 → NoSuchElementException
String name = user.getName().toUpperCase();        // name 为空 → NPE
```
**✅ 正确做法**:
```java
User user = userRepository.findById(userId)
    .orElseThrow(() -> new UserNotFoundException(userId));
String name = Optional.ofNullable(user.getName())
    .map(String::toUpperCase).orElse("");
```
**关联知识库**: [Java]、[JPA / Hibernate]
**搜索模板**: `"java optional best practices avoid null pointer {currentYear}"`

---

## [4. 安全类]

### 硬编码密钥/Token
**AI 易错点**: 为让功能"能跑通"直接把 JWT_SECRET、数据库密码、API Key 写进代码，或写进会随代码提交的文件。
**后果**: 密钥随代码进入仓库/镜像，任何拿到代码的人可伪造 Token、直连数据库；git 历史永久留存泄露记录。
**❌ 错误示范**:
```typescript
// 硬编码 JWT 密钥
export const JWT_SECRET = 'my-super-secret-key-123456';
sign(payload, JWT_SECRET, { expiresIn: '7d' });
```
**✅ 正确做法**:
```typescript
// 从环境变量读取，密钥仅存在部署环境 / 密钥管理服务
export const JWT_SECRET = process.env.JWT_SECRET!; // 缺失时启动即报错
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');
```
**关联知识库**: [Docker]、[Vercel]、[Git 规范]
**搜索模板**: `"dotenv secrets management best practices {currentYear} env not commit"`

### 输入未校验直接信任（注入/XSS）
**AI 易错点**: 直接使用 `req.body` / 查询参数拼接 SQL 或渲染 HTML，未做参数化查询或输出编码，默认"输入可信"。
**后果**: SQL 注入、XSS 漏洞；用户可删库、窃取 Cookie，安全事件。
**❌ 错误示范**:
```javascript
// Express：字符串拼接 SQL
app.get('/search', (req, res) => {
  const kw = req.query.q;
  db.query(`SELECT * FROM products WHERE name LIKE '%${kw}%'`); // SQL 注入
});
```
**✅ 正确做法**:
```javascript
// 参数化查询 + 输入校验（zod/joi/class-validator）
const schema = z.object({ q: z.string().max(50) });
const { q } = schema.parse(req.query);
db.query('SELECT * FROM products WHERE name LIKE ?', [`%${q}%`]);
```
**关联知识库**: [Express.js]、[NestJS]、[Hono]
**搜索模板**: `"prevent sql injection parameterized queries node mysql2 {currentYear}"`

### 日志输出敏感信息
**AI 易错点**: 在日志里打印整个请求体/响应体（含密码、手机号、Token），或直接 log 数据库行对象。
**后果**: 敏感数据落入日志系统，日志一旦泄露即数据泄露；违反合规（等保/GDPR）。
**❌ 错误示范**:
```python
# Python + FastAPI：日志打印全量请求体
logger.info("register request: %s", body)  # 包含 password 明文
```
**✅ 正确做法**:
```python
# 只记录脱敏后的关键字段
logger.info(
    "register user: %s, email: %s",
    body.get("username"),
    mask_email(body.get("email")),  # a***@example.com
)
```
**关联知识库**: [Python + FastAPI]、[核心开发原则]
**搜索模板**: `"logging sensitive data masking best practices {currentYear}"`

### 越权未校验数据隔离（IDOR）
**AI 易错点**: 只按资源 ID 查询返回，未校验"当前用户是否有权访问该资源"，或前端传 ownerId 直接信任。
**后果**: 水平越权——任意用户可读取/修改他人数据，重大数据泄露漏洞。
**❌ 错误示范**:
```java
// Spring Boot：仅按 id 查，未校验归属
@GetMapping("/orders/{orderId}")
public Order getOrder(@PathVariable Long orderId) {
  return orderRepository.findById(orderId).orElseThrow(); // 用户 A 可看用户 B 的订单
}
```
**✅ 正确做法**:
```java
// 查询条件带上当前用户，天然数据隔离
@GetMapping("/orders/{orderId}")
public Order getOrder(@AuthenticationPrincipal User current, @PathVariable Long orderId) {
  return orderRepository.findByIdAndOwnerId(orderId, current.getId())
      .orElseThrow(() -> new NotFoundException("order not found"));
}
```
**关联知识库**: [Spring Boot]、[NestJS]
**搜索模板**: `"prevent IDOR horizontal privilege escalation best practices {currentYear}"`

---

## [5. 类型/语言类]

### 滥用 / 隐式 any
**AI 易错点**: 给参数、返回值随手标 `any` 或依赖 TS 隐式 any，绕过类型检查，把 TS 当 JS 写。
**后果**: 类型保护失效，重构无提示，运行时 TypeError 上移；违背项目显式类型规范。
**❌ 错误示范**:
```typescript
// 隐式 any + 显式 any
export function getById(id) {      // 参数隐式 any
  return db.query(`SELECT * FROM t WHERE id = ${id}`);
}
const user: any = getUser();        // 结果 any，后续访问无检查
```
**✅ 正确做法**:
```typescript
export function getById(id: number): Promise<User | null> {
  return repo.findByPk(id);
}
const user = await getById(1);      // 类型推断 User | null，需判空
```
**关联知识库**: [TypeScript / JavaScript]
**搜索模板**: `"typescript noImplicitAny strict mode best practices {currentYear}"`

### 忘记 await
**AI 易错点**: 函数声明 async 但调用处漏写 `await`，拿到 Promise 当值用；Python 中同款漏 await。
**后果**: 数据未就绪就继续执行 → undefined / pending Promise、竞态、时序 Bug，极难排查。
**❌ 错误示范**:
```typescript
async function load() {
  const users = getUsers();    // 漏 await，users 是 Promise
  return users.length;         // undefined.length → 报错或 NaN
}
```
**✅ 正确做法**:
```typescript
async function load() {
  const users = await getUsers(); // await 后才是真实数组
  return users.length;
}
```
**关联知识库**: [TypeScript / JavaScript]、[Python + FastAPI]
**搜索模板**: `"typescript missing await common mistakes eslint no-misused-promises {currentYear}"`

### 竞态条件 / 可变全局状态
**AI 易错点**: 用全局变量存请求级数据（缓存用户信息、请求上下文），高并发下互相覆盖；或发起请求后不处理过期响应（快速切换 tab 旧响应覆盖新响应）。
**后果**: 用户数据串号、响应错乱、数据不一致；服务端全局状态导致并发写覆盖。
**❌ 错误示范**:
```go
// Go：包级全局变量存请求上下文（并发下互相覆盖）
var currentUser *User
func (h *Handler) Serve(w http.ResponseWriter, r *http.Request) {
  currentUser = h.loadUser(r.Context()) // 并发请求互相覆盖
  h.doBusiness(w)
}
```
**✅ 正确做法**:
```go
// 状态走 context / 局部变量，依赖注入
func (h *Handler) Serve(w http.ResponseWriter, r *http.Request) {
  user := h.loadUser(r.Context()) // 局部变量，每次请求独立
  h.doBusiness(w, user)
}
```
**关联知识库**: [Go]、[Pinia]
**搜索模板**: `"go race condition avoid global mutable state best practices {currentYear}"`

### 未处理 undefined/null 链式访问
**AI 易错点**: 对可能为空的返回值直接链式 `.a.b.c` 或滥用 `!` 非空断言，把运行时风险推给线上。
**后果**: TypeError: Cannot read properties of undefined，前端白屏。
**❌ 错误示范**:
```typescript
// API 可能返回 null，直接深度访问
const city = user.address.city;           // address 为 null → TypeError
const list = resp.data.items.map(...)     // data 可能为 null
```
**✅ 正确做法**:
```typescript
// 可选链 + 空值兜底
const city = user?.address?.city ?? '未知';
const list = (resp?.data?.items ?? []).map(...);
```
**关联知识库**: [TypeScript / JavaScript]
**搜索模板**: `"typescript optional chaining nullish coalescing best practices {currentYear}"`

---

## [6. 工程规范类]

### Controller 写业务绕过分层
**AI 易错点**: 图省事在 Controller/路由回调里直接写数据库操作和业务逻辑，跳过 Service 层，破坏分层架构。
**后果**: 逻辑不可复用、无事务/校验边界、Controller 膨胀；违反项目"Controller 薄层"规范。
**❌ 错误示范**:
```java
// Spring Boot：Controller 直接操作 Repository
@RestController
public class UserController {
  @Autowired private UserRepository repo;  // 绕过分层 + field injection
  @GetMapping("/users")
  public List<User> list() {
    return repo.findAll();                  // 业务直接写在 Controller
  }
}
```
**✅ 正确做法**:
```java
@RestController
public class UserController {
  private final UserService service;        // constructor injection
  public UserController(UserService service) { this.service = service; }
  @GetMapping("/users")
  public List<UserDto> list() { return service.listUsers(); }
}
```
**关联知识库**: [Spring Boot]、[NestJS]、[Django]
**搜索模板**: `"spring boot controller service repository layering best practices {currentYear}"`

### 命名随意 / 不读现有代码直接改
**AI 易错点**: 拿到任务直接按自己习惯新建文件/命名变量（`temp`、`data`、`handle1`），或不去读现有模块就直接写风格迥异的代码。
**后果**: 命名无意义难维护、重复实现已有功能、风格与代码库不一致，代码审查返工。
**❌ 错误示范**:
```typescript
// 不读现有 utils，自造同功能函数 + 无意义命名
function ff(a: any): any { return JSON.parse(a); }  // 已有 jsonParse 工具
const temp = await ff(resp);
```
**✅ 正确做法**:
```typescript
// 先搜索现有代码：复用 src/utils 已有封装，命名遵循项目约定（动词短语）
import { parseJson } from '@/utils/json';
const data = parseJson<User>(resp);
```
**关联知识库**: [核心开发原则]
**搜索模板**: `"code review naming conventions consistency best practices {currentYear}"`

### console.log 遗留
**AI 易错点**: 开发中到处 console.log 调试，交付时未清理；Python 中 print() 同理。
**后果**: 生产日志被调试噪音淹没，关键日志被掩盖；性能（console 阻塞）与信息泄露风险。
**❌ 错误示范**:
```typescript
// 生产代码遗留 console.log
async function pay(orderId: string) {
  console.log('pay order', orderId);    // 开发调试残留
  console.log('token', getToken());     // 甚至打印敏感信息
  const res = await payService.pay(orderId);
  console.log('result', res);
}
```
**✅ 正确做法**:
```typescript
// 用项目日志框架（winston/Logger），带级别与上下文
import { Logger } from '@nestjs/common';
private readonly logger = new Logger(PayService.name);
this.logger.debug(`pay order ${orderId}`); // 按级别输出，可统一关闭
```
**关联知识库**: [NestJS]、[Python]、[代码审查清单]
**搜索模板**: `"replace console.log with structured logging best practices {currentYear}"`

### 过度设计 / 过度抽象
**AI 易错点**: 对简单需求引入不必要的抽象层（接口、工厂、策略模式、自定义框架），或把 10 行逻辑拆成 8 个文件。
**后果**: 代码复杂度上升、阅读成本高、改动牵一发动全身；违背"最小侵入/组合优于继承"。
**❌ 错误示范**:
```typescript
// 一个 if 就解决的问题，建了抽象工厂
interface OrderHandler { handle(o: Order): void }
class NormalOrderHandler implements OrderHandler { ... }
class VipOrderHandler implements OrderHandler { ... }
class OrderHandlerFactory { static create(u: User): OrderHandler { ... } }
```
**✅ 正确做法**:
```typescript
// 按实际复杂度：先写直白实现，出现第二个分支再抽象
function handleOrder(order: Order, isVip: boolean) {
  if (isVip) return applyVipDiscount(order);
  return order;
}
```
**关联知识库**: [核心开发原则]
**搜索模板**: `"overengineering vs simplicity software design principles {currentYear}"`

---

## [7. Git 类]

### push --force / reset --hard
**AI 易错点**: 在冲突/误提交时直接 `git push --force` 或 `git reset --hard` 覆盖历史，不先确认是否影响他人。
**后果**: 覆盖远端他人提交、历史丢失不可恢复；共享分支被强推导致团队混乱。
**❌ 错误示范**:
```bash
git push --force origin main       # 覆盖远端 main，他人提交丢失
git reset --hard HEAD~5            # 丢弃 5 个提交且不可找回
```
**✅ 正确做法**:
```bash
# 用安全方式回滚/同步：revert 保留历史；冲突先 stash/rebase 再正常 push
git revert <commit>                # 线上问题回滚，保留历史
git pull --rebase origin main      # 同步远端变更再推送
git push origin main
```
**关联知识库**: [Git 规范]
**搜索模板**: `"git revert vs reset when to use force push {currentYear}"`

### 提交敏感文件
**AI 易错点**: 用 `git add -A` / `git add .` 一把梭，把 .env、密钥、dist/、node_modules 一起提交。
**后果**: 凭据进入 git 历史永久留存，即使删除也需重写历史；镜像/下游消费者全部受影响。
**❌ 错误示范**:
```bash
git add -A
# 结果把 .env 提交了：
git status
#  modified: .env        ← 数据库密码/Token 入库
git commit -m "chore: update config"
```
**✅ 正确做法**:
```bash
# 按文件逐一 add + 确认 .gitignore 覆盖 .env
git add src/ .gitignore package.json
git status      # 提交前核对无敏感文件
git commit -m "feat: add user module"
# 验证：git ls-files | grep -i env 应为空
```
**关联知识库**: [Git 规范]、[Docker]
**搜索模板**: `"remove secrets from git history bfg filter-repo {currentYear}"`

### 无意义提交信息
**AI 易错点**: 提交信息写 "fix bug" / "update" / "aaa"，无法表达变更意图与影响面。
**后果**: 无法回溯变更原因、无法生成 changelog、git blame 失效，团队协作成本高。
**❌ 错误示范**:
```bash
git commit -m "fix"          # 不知道修了什么、为什么修
git commit -m "update code"  # 空泛无信息
```
**✅ 正确做法**:
```bash
# <type>(<scope>): <description> — feat/fix/refactor/docs/test/chore/perf
git commit -m "fix(user): 校验手机号格式，防止非法输入入库"
git commit -m "refactor(order): 抽取事务逻辑到 OrderService"
```
**关联知识库**: [Git 规范]
**搜索模板**: `"conventional commits format guidelines {currentYear}"`
