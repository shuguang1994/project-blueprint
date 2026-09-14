# 组件知识库

> 规则引擎拼接 AGENTS.md 时的参考源。基础条目为三段（**Commands / Conventions / CI job**）；高频组件附加第 4 段 **Gate**（可机检红线 → 检查方式），新增条目一律四段齐全。**Gate 段写「可机检红线 → 检查方式（命令 / 脚本要点 / 适用条件）」，供 Step 5.5 门禁装配与 Step 7 门禁生长使用**。v1.7

---

## 语言层

### TypeScript / JavaScript
**Commands**: `npx tsc --noEmit` / `node --experimental-strip-types src/index.ts`
**Conventions**: ✅ 显式类型 / ✅ const 默认 / ❌ any（需 `// @ts-expect-error` + 注释） / ❌ var
**CI job**: `setup-node@v4` node-version 20 + `npm ci` + `npx tsc --noEmit`
**Gate**: 类型错误 → npx tsc --noEmit / any 滥用 → eslint @typescript-eslint/no-explicit-any / 调试残留 → eslint no-console

### Go
**Commands**: `go build ./...` / `go run ./cmd/server` / `go test ./...`
**Conventions**: ✅ error 永不忽略 / ✅ context.Context 贯穿 IO / ❌ panic（除 init/main） / ❌ 全局变量
**CI job**: `setup-go@v5` go-version '1.21' + `go vet ./...` + `go build ./...`
**Gate**: 静态问题 → go vet ./... / 未处理 error → errcheck（若已装） / 格式 → gofmt -l

### Python
**Commands**: `python -m py_compile src/**/*.py` / `uvicorn main:app --reload` / `python -m pytest`
**Conventions**: ✅ type hints 公开函数 / ✅ logging 替代 print / ❌ `from module import *` / ❌ 可变默认参数
**CI job**: `setup-python@v5` python-version '3.12' + `pip install -r requirements.txt` + `ruff check .` + `mypy src/`
**Gate**: 类型 → mypy src/ / lint → ruff check . / 格式 → ruff format --check / 调试残留 → ruff 规则 T201 (print)

### Java
**Commands**: `./gradlew build` / `mvn verify` / `./gradlew test`
**Conventions**: ✅ Record / @Data for DTO / ✅ constructor injection / ✅ Optional for nullable / ❌ field injection / ❌ static mutable state
**CI job**: `setup-java@v4` java-version '17' distribution 'temurin' + `./gradlew test` + `./gradlew checkstyleMain`

### Rust
**Commands**: `cargo build` / `cargo test` / `cargo clippy -- -D warnings` / `cargo fmt -- --check`
**Conventions**: ✅ Result / Option 替代 null / ✅ &str over String for params / ❌ unsafe 需 audit / ❌ unwrap() in prod
**CI job**: `rust-toolchain@v1` toolchain stable + `cargo test` + `cargo clippy -- -D warnings`

### Ruby
**Commands**: `ruby -c path/to/file.rb` / `bundle exec rake test` / `bundle exec rubocop`
**Conventions**: ✅ frozen_string_literal: true / ✅ &. safe navigation / ❌ eval / ❌ monkey-patch core classes
**CI job**: `ruby/setup-ruby@v1` ruby-version '3.3' + `bundle install` + `bundle exec rubocop` + `bundle exec rake test`

### PHP
**Commands**: `php -l src/` / `composer test` / `composer phpstan` / `composer pint`
**Conventions**: ✅ typed properties PHP 8+ / ✅ strict_types=1 / ❌ `mysql_*` / ❌ `@` error suppression
**CI job**: `setup-php@v2` php-version '8.3' + `composer install` + `composer phpstan` + `composer test`

---

## 框架层

### NestJS
**Commands**: `npm run start:dev` / `npm run test -- path.spec.ts` / `npm run build` / `npm run test:cov`
**Conventions**: ✅ @Controller('prefix') / ✅ JwtAuthGuard on protected routes / ✅ dataSource.transaction for multi-step writes / ✅ 跨模块走 Service 接口 / ✅ @nestjs/swagger API 文档 / ✅ @nestjs/schedule 定时任务 / ✅ @nestjs/event-emitter 事件解耦 / ✅ winston/nest-winston 结构化日志 / ❌ Controller 注入 Repository / ❌ console.log → Logger
**CI job**: `setup-node@v4` + `npm ci` + `npm run test` + `npm run build`
**Gate**: 未加守卫的路由 → 自写检查脚本（扫描 Controller 方法装饰器，缺 @UseGuards 且不在公开白名单即报错） / Controller 注入 Repository → 自写检查（扫描 constructor 参数） / console.log → eslint no-console

### Next.js (App Router)
**Commands**: `pnpm dev` / `pnpm build` / `pnpm start` / `pnpm db:push` / `pnpm lint` / `npm run test -- path.spec.ts`
**Conventions**: ✅ Server Components 优先 / ✅ 'use client' 仅交互组件 / ✅ loading.tsx + error.tsx 每路由段 / ❌ Pages Router / ❌ Client Component 中 import prisma
**CI job**: `pnpm/action-setup@v2` + `setup-node@v4` + `pnpm install --frozen-lockfile` + `pnpm lint` + `pnpm test -- --passWithNoTests` + `pnpm build`

### Vue 3 + Vite
**Commands**: `pnpm dev` / `pnpm build` / `pnpm preview` / `pnpm lint` / `pnpm test:unit` / `pnpm typecheck`
**Conventions**: ✅ `<script setup lang="ts">` / ✅ defineProps + defineEmits 显式类型 / ✅ composables 放 composables/ / ❌ Options API / ❌ class 组件
**CI job**: `pnpm/action-setup@v2` + `setup-node@v4` + `pnpm install --frozen-lockfile` + `pnpm typecheck` + `pnpm lint` + `pnpm test:unit -- --passWithNoTests`
**Gate**: 类型错误 → pnpm typecheck (vue-tsc --noEmit) / lint 错误 → pnpm lint / 调试残留 → eslint no-console

### React + Vite
**Commands**: `pnpm dev` / `pnpm build` / `pnpm preview` / `pnpm lint` / `pnpm test` / `pnpm typecheck`
**Conventions**: ✅ 函数组件 + Hooks / ✅ Props interface（非 type） / ✅ Zustand 跨组件状态 / ❌ class 组件 / ❌ React.FC / ❌ default export
**CI job**: `pnpm/action-setup@v2` + `setup-node@v4` + `pnpm install --frozen-lockfile` + `pnpm typecheck` + `pnpm lint` + `pnpm test -- --passWithNoTests`

### Go + Gin
**Commands**: `go run ./cmd/server` / `go build ./...` / `go test ./...` / `go vet ./...` / `golangci-lint run`
**Conventions**: ✅ handler 薄层 / ✅ 依赖注入通过构造函数 / ✅ context.Context 贯穿 IO / ✅ GORM AutoMigrate 开发环境 / ❌ panic / ❌ 全局变量
**CI job**: `setup-go@v5` go-version '1.21' + `go vet ./...` + `go test ./...` + `go build ./...`

### Python + FastAPI
**Commands**: `uvicorn main:app --reload` / `python -m pytest` / `ruff check .` / `mypy src/` / `black .`
**Conventions**: ✅ Pydantic v2 model_validate / ✅ async/await for DB / ✅ Depends 依赖注入 / ✅ HTTPException with detail / ❌ print() → logging / ❌ `from module import *`
**CI job**: `setup-python@v5` python-version '3.12' + `pip install -r requirements.txt` + `ruff check .` + `mypy src/` + `python -m pytest --passWithNoTests`

### Spring Boot
**Commands**: `./gradlew bootRun` / `./gradlew test` / `./gradlew build` / `mvn spring-boot:run` / `mvn test` / `mvn verify`
**Conventions**: ✅ Record / @Data for DTO / ✅ @Transactional on service / ✅ constructor injection / ✅ @ControllerAdvice 全局异常 / ✅ Bean Validation on DTO / ❌ Controller 写业务
**CI job**: `setup-java@v4` java-version '17' distribution 'temurin' + `./gradlew test` + `./gradlew checkstyleMain`

### Express.js
**Commands**: `npm run dev` / `npm test` / `npm run build` / `npm run lint`
**Conventions**: ✅ 中间件模式 / ✅ express-async-errors wrap / ✅ 结构化错误码 / ❌ 同步代码中 throw（需 next(err)） / ❌ req.body 无校验
**CI job**: `setup-node@v4` + `npm ci` + `npm run lint` + `npm test`

### Django
**Commands**: `python manage.py runserver` / `python manage.py test` / `python manage.py makemigrations` / `python manage.py migrate`
**Conventions**: ✅ class-based views / ✅ ModelForm for validation / ✅ select_related / prefetch_related 防 N+1 / ❌ raw SQL unless necessary / ❌ business logic in views
**CI job**: `setup-python@v5` python-version '3.12' + `pip install -r requirements.txt` + `python manage.py test --passWithNoTests`

### Flask
**Commands**: `flask run --debug` / `python -m pytest` / `ruff check .`
**Conventions**: ✅ Blueprint 模块化 / ✅ app factory 模式 / ✅ marshmallow / Pydantic 校验 / ❌ Flask-Script → Click / ❌ global request in service
**CI job**: `setup-python@v5` + `pip install -r requirements.txt` + `ruff check .` + `python -m pytest --passWithNoTests`

### Nuxt 3
**Commands**: `pnpm dev` / `pnpm build` / `pnpm preview` / `pnpm lint` / `pnpm test`
**Conventions**: ✅ `<script setup lang="ts">` / ✅ useFetch / useAsyncData 数据获取 / ✅ composables/ 复用逻辑 / ❌ Options API / ❌ 直接修改 props
**CI job**: `pnpm/action-setup@v2` + `setup-node@v4` + `pnpm install --frozen-lockfile` + `pnpm lint` + `pnpm test` + `pnpm build`

### SvelteKit
**Commands**: `pnpm dev` / `pnpm build` / `pnpm preview` / `pnpm lint` / `pnpm test`
**Conventions**: ✅ +page.server.ts 服务端加载 / ✅ $derived / $state runes v5 / ❌ onMount 写数据获取 / ❌ `export let data` → `$props()`
**CI job**: `pnpm/action-setup@v2` + `setup-node@v4` + `pnpm install --frozen-lockfile` + `pnpm check` + `pnpm lint` + `pnpm test`

### Laravel
**Commands**: `php artisan serve` / `php artisan test` / `composer pint` / `php artisan migrate`
**Conventions**: ✅ Eloquent relationships over raw joins / ✅ Form Request validation / ✅ Queues for heavy async / ❌ N+1 → `with()` eager load / ❌ business logic in blade
**CI job**: `setup-php@v2` php-version '8.3' + `composer install` + `composer pint -- --test` + `php artisan test --passWithNoTests`

### Hono
**Commands**: `pnpm dev` / `pnpm build` / `pnpm test`
**Conventions**: ✅ zValidator middlware 输入校验 / ✅ RPC mode type-safe client / ❌ Cloudflare Workers 不支持 Node API 需 check env
**CI job**: `pnpm/action-setup@v2` + `setup-node@v4` + `pnpm install --frozen-lockfile` + `pnpm test`

### uni-app (Vue 3)
**Commands**: `npm run dev:mp-weixin` / `npm run build:mp-weixin` / `npm run dev:h5`
**Conventions**: ✅ `<script setup>` / ✅ `uni.$emit` kebab-case / ✅ API 走 `api/` 封装 / ✅ 页面四态 Loading/Empty/Error/Success / ❌ Options API / ❌ 直接调 uni.request（走 api/ 封装） / ❌ import 超 3 层 `../`
**CI job**: `setup-node@v4` + `npm ci` + `npm run build:h5`

---

## ORM 层

### Prisma
**Commands**: `npx prisma generate` / `npx prisma db push` / `npx prisma studio` / `npx prisma migrate dev`
**Conventions**: ✅ schema.prisma 为单一真相源 / ✅ relation 字段双向定义 / ❌ db push --force-reset --accept-data-loss / ❌ 手动改迁移 SQL
**CI job**: `setup-node@v4` + `npm ci` + `npx prisma generate` + `npm test`
**Gate**: schema 与迁移漂移 → npx prisma migrate diff --exit-code / 客户端未生成 → npx prisma generate 后 git diff --exit-code

### TypeORM
**Commands**: `npx typeorm migration:generate` / `npx typeorm migration:run` / `npx ts-node src/migration-runner.ts`
**Conventions**: ✅ Entity 字段 camelCase → column snake_case / ✅ dataSource.transaction 多步写 / ❌ `.from('table_name')` 裸表名 / ❌ forFeature 注册其他模块 Entity
**CI job**: `setup-node@v4` + `npm ci` + `npx tsc --noEmit` + `npm run migration:run -- --dry-run`
**Gate**: 迁移与实体不一致 → 自写检查（比对 migrations 目录与 entity 定义） / 裸表名查询 → 自写检查（扫描 .from('…')）

### GORM
**Commands**: 无 CLI，使用 `db.AutoMigrate(&Model{})` 或 migration 文件
**Conventions**: ✅ AutoMigrate 开发环境 / ✅ 生产用 migration 文件 / ✅ Repository 接口定义在 service 层 / ❌ Raw SQL unless complex join
**CI job**: 无专门 ORM 步骤，含在 `go test ./...` 中

### SQLAlchemy
**Commands**: `alembic revision --autogenerate` / `alembic upgrade head` / `alembic downgrade -1`
**Conventions**: ✅ Declarative Base / ✅ async session factory / ✅ relationship lazy='selectin' 防 N+1 / ❌ execute() 裸 SQL unless raw
**CI job**: `setup-python@v5` + `pip install -r requirements.txt` + `alembic check` (if configured)

### JPA / Hibernate
**Commands**: 无 CLI，repository 集成 Spring Data JPA；`./gradlew test` 验证 mapping
**Conventions**: ✅ @Entity + @Table / ✅ FetchType.LAZY 默认 / ✅ @Transactional readOnly=true for queries / ❌ EAGER fetch → N+1
**CI job**: 含在 `./gradlew test` 中（in-memory H2 或 Testcontainers）

### Drizzle ORM
**Commands**: `npx drizzle-kit push` / `npx drizzle-kit generate` / `npx drizzle-kit studio`
**Conventions**: ✅ schema 定义即类型 / ✅ relational queries 替代 join 拼接 / ❌ 混合 drizzle-orm 和 raw SQL / ❌ 跳过 migration generate 直接 push 生产
**CI job**: `setup-node@v4` + `npm ci` + `npx tsx src/db/check.ts`

---

## CSS 层

### Tailwind CSS
**Commands**: 无单独命令，集成在 `pnpm dev` / `pnpm build`
**Conventions**: ✅ utility-first / ✅ 复杂样式 → @layer components + @apply / ❌ !important / ❌ inline style 可被 tailwind class 替代
**CI job**: 含在 build step 中（无独立步骤）

### CSS Modules
**Commands**: 无单独命令，Vite / Next.js 内置
**Conventions**: ✅ `*.module.css` 命名 / ✅ `composes:` 复用 / ❌ 全局选择器 / ❌ `:global()` 仅在必要时
**CI job**: 无独立步骤

### Scoped CSS (Vue)
**Commands**: 无单独命令，Vue SFC `<style scoped>` 自动
**Conventions**: ✅ `scoped` attribute / ✅ `:deep()` 穿透子组件 / ❌ 非 scoped 全局样式污染 / ❌ !important 覆盖第三方
**CI job**: 无独立步骤

### Styled Components
**Commands**: `pnpm build` 触发编译
**Conventions**: ✅ tagged template literals / ✅ ThemeProvider 全局主题 / ❌ 动态生成过多 styled 变体 / ❌ render 内创建 styled component
**CI job**: 无独立步骤

### Sass / SCSS
**Commands**: 无单独命令，Vite / Webpack loader 自动
**Conventions**: ✅ 变量 `$primary` + mixin 复用 / ✅ `@use` 替代 `@import` / ❌ 深层嵌套 > 3 层 / ❌ `@extend` 跨选择器
**CI job**: 无独立步骤

---

## UI 组件库层

> 补充 CSS 层之外的前端 UI 组件库规范。

### Ant Design Vue
**Commands**: 无单独命令，Vite 集成
**Conventions**: ✅ `a-` 前缀组件 / ✅ ConfigProvider 全局配置 / ✅ Form model + rules 校验 / ❌ 直接修改组件内部样式（用 `:deep()` 穿透）
**CI job**: 无独立步骤

### Element Plus
**Commands**: 无单独命令，Vite 集成
**Conventions**: ✅ `el-` 前缀组件 / ✅ `v-model` 双向绑定 / ✅ ElMessage 全局提示 / ❌ 覆盖组件样式用 `:deep()`
**CI job**: 无独立步骤

### Naive UI
**Commands**: 无单独命令，Vite 集成
**Conventions**: ✅ `n-` 前缀组件 / ✅ `useMessage()` / `useDialog()` composable / ✅ 主题定制用 `NConfigProvider` / ❌ 全局样式污染
**CI job**: 无独立步骤

### Vant
**Commands**: 无单独命令，uni-app / Vue CLI 集成
**Conventions**: ✅ `van-` 前缀组件 / ✅ 移动端适配 rem/vw / ❌ PC 端组件混入移动端
**CI job**: 无独立步骤

---

## 测试层

### Vitest
**Commands**: `npx vitest` / `npx vitest --coverage` / `npx vitest --ui`
**Conventions**: ✅ describe / it 语义化 / ✅ `vi.fn()` / `vi.spyOn()` mock / ❌ 测试间共享可变状态 / ❌ setTimeout 不 await
**CI job**: `setup-node@v4` + `npm ci` + `npx vitest run --coverage --passWithNoTests`
**Gate**: 测试失败 → npx vitest run / 覆盖率阈值 → test:cov 配置 threshold 后据此退出非 0

### Jest
**Commands**: `npx jest` / `npx jest --coverage` / `npx jest --watch`
**Conventions**: ✅ `jest.mock()` 模块级别 / ✅ `beforeEach` 重置状态 / ❌ 异步测试无 `await expect().rejects` / ❌ 测试代码依赖执行顺序
**CI job**: `setup-node@v4` + `npm ci` + `npx jest --coverage --passWithNoTests`
**Gate**: 测试失败 → npx jest --runInBand / 覆盖率阈值 → test:cov 配置 threshold 后据此退出非 0

### pytest
**Commands**: `python -m pytest` / `python -m pytest --cov` / `python -m pytest -k "pattern"`
**Conventions**: ✅ `fixture` 复用 setup / ✅ `parametrize` 多 case / ✅ `conftest.py` 共享 fixtures / ❌ `assert` 用于库代码 / ❌ 测试间共享可变 fixture state
**CI job**: `setup-python@v5` + `pip install -r requirements.txt` + `python -m pytest --cov --passWithNoTests`

### JUnit 5
**Commands**: `./gradlew test` / `mvn test`
**Conventions**: ✅ @Test / @BeforeEach / @AfterEach / ✅ @ParameterizedTest 多输入 / ❌ test method 中 assert 多个独立 case / ❌ Thread.sleep()
**CI job**: 含在 `./gradlew test` 中，配合 `setup-java@v4`

### Go testing
**Commands**: `go test ./...` / `go test -cover ./...` / `go test -race ./...`
**Conventions**: ✅ table-driven tests / ✅ `t.Parallel()` 并行 / ✅ `testify/assert` 或标准 errors.Is / ❌ 测试间共享全局状态 / ❌ `os.Exit()` in test
**CI job**: `setup-go@v5` + `go test -race -cover ./...`

### Playwright
**Commands**: `npx playwright test` / `npx playwright test --ui` / `npx playwright codegen`
**Conventions**: ✅ `page.locator()` with data-testid / ✅ `expect().toBeVisible()` wait / ❌ `page.waitForTimeout()` / ❌ CSS selector 硬编码 DOM 结构
**CI job**: `setup-node@v4` + `npm ci` + `npx playwright install --with-deps chromium` + `npx playwright test`

---

## Lint / 格式化层

### ESLint
**Commands**: `npx eslint .` / `npx eslint . --fix` / `npm run lint`
**Conventions**: ✅ flat config (eslint.config.mjs) v9+ / ✅ extends 最少规则 / ❌ `// eslint-disable` 不加理由注释 / ❌ 全局 disable 规则在非项目范围
**CI job**: 含在 `pnpm lint` / `npm run lint`
**Gate**: lint 错误 → npx eslint .

### Prettier
**Commands**: `npx prettier --check .` / `npx prettier --write .`
**Conventions**: ✅ `.prettierrc` 单一配置 / ✅ CI 中 `--check` 模式 / ❌ ESLint + Prettier 冲突规则 → eslint-config-prettier
**CI job**: `setup-node@v4` + `npm ci` + `npx prettier --check .`
**Gate**: 格式不一致 → npx prettier --check .

### ruff
**Commands**: `ruff check .` / `ruff check --fix .` / `ruff format --check .`
**Conventions**: ✅ pyproject.toml [tool.ruff] / ✅ extends 推荐规则集 / ❌ `# noqa` 不加理由
**CI job**: `setup-python@v5` + `pip install ruff` + `ruff check .` + `ruff format --check .`

### golangci-lint
**Commands**: `golangci-lint run` / `golangci-lint run --fix`
**Conventions**: ✅ `.golangci.yml` presets / ✅ enable errcheck, govet, ineffassign / ❌ 全局 `//nolint` / ❌ fast: false 在大型项目
**CI job**: `setup-go@v5` + `go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest` + `golangci-lint run`

### Biome
**Commands**: `npx biome check .` / `npx biome check --write .` / `npx biome ci .`
**Conventions**: ✅ 替代 ESLint + Prettier / ✅ biome.json 单一配置 / ❌ 与 ESLint 同时使用
**CI job**: `setup-node@v4` + `npm ci` + `npx biome ci .`

---

## 包管理层

### pnpm
**Commands**: `pnpm install` / `pnpm install --frozen-lockfile` / `pnpm update` / `pnpm why <pkg>`
**Conventions**: ✅ workspace monorepo / ✅ `pnpm.overrides` for security patches / ❌ npm / yarn 混用
**CI job**: `pnpm/action-setup@v2` version 9 + `pnpm install --frozen-lockfile`
**Gate**: 锁文件不一致 → pnpm install --frozen-lockfile

### npm / yarn
**Commands**: `npm ci` / `npm test` / `npm run build` / `yarn --frozen-lockfile`
**Conventions**: ✅ `npm ci` in CI / ✅ package-lock.json 提交 / ❌ 混用 npm + yarn / ❌ `npm install` in CI
**CI job**: `setup-node@v4` cache 'npm' + `npm ci`

### Poetry
**Commands**: `poetry install` / `poetry add <pkg>` / `poetry run pytest` / `poetry lock`
**Conventions**: ✅ pyproject.toml 单文件 / ✅ poetry.lock 提交 / ❌ pip install 裸跑 / ❌ requirements.txt (if poetry managed)
**CI job**: `setup-python@v5` + `pip install poetry` + `poetry install --no-interaction`

### Gradle / Maven
**Commands**: `./gradlew build` / `./gradlew dependencies` / `mvn verify` / `mvn dependency:tree`
**Conventions**: ✅ wrapper jar 提交 / ✅ dependency locking / ❌ `implementation` vs `api` 混用 / ❌ 无版本号 range
**CI job**: `setup-java@v4` + cache 'gradle' / 'maven' + `./gradlew build`

### go mod
**Commands**: `go mod tidy` / `go mod download` / `go mod verify` / `go get <pkg>@<version>`
**Conventions**: ✅ go.sum 提交 / ✅ 精确版本号（非 @latest） / ❌ `replace` to local path in prod
**CI job**: `setup-go@v5` + cache-dependency-path '**/go.sum' + `go mod download`

---

## 部署 / 运行时

### PM2
**Commands**: `pm2 start dist/main.js --name api` / `pm2 restart api` / `pm2 logs api` / `pm2 save` / `pm2 startup`
**Conventions**: ✅ ecosystem.config.js 定义 app / ✅ `pm2 save` after deploy / ❌ `pm2 kill` on prod / ❌ 无 `max_restarts` + `max_memory_restart` 配置
**CI job**: 无 CI（部署步骤，非 test pipeline）

### Docker
**Commands**: `docker build -t app .` / `docker run -p 3000:3000 app` / `docker compose up -d`
**Conventions**: ✅ multi-stage build / ✅ `.dockerignore` / ✅ 非 root 用户 / ❌ `latest` tag in prod / ❌ secrets in image
**CI job**: `docker/login-action@v3` + `docker/build-push-action@v5`

### Vercel
**Commands**: `vercel` / `vercel --prod` / `vercel deploy` / `vercel logs`
**Conventions**: ✅ framework auto-detected / ✅ `vercel.json` 路由配置 / ❌ 环境变量在代码中硬编码 / ❌ Serverless 函数超大 bundle
**CI job**: `actions/checkout@v4` + `vercel --prod --token=${{ secrets.VERCEL_TOKEN }}`

### Docker Compose
**Commands**: `docker compose up -d` / `docker compose down` / `docker compose ps` / `docker compose logs -f`
**Conventions**: ✅ `depends_on: condition: service_healthy` / ✅ healthcheck on DB / ❌ hardcoded ports / ❌ `network_mode: host` unless necessary
**CI job**: 无标准 CI（集成测试可 `docker compose up -d db` 后 run tests）

### GitHub Pages
**Commands**: 无 CLI，push 触发 Actions
**Conventions**: ✅ actions/deploy-pages@v4 / ✅ `base: '/repo-name/'` in Vite config / ❌ SPA 无 404.html 重定向
**CI job**: `actions/configure-pages@v4` + `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`

---

## 状态管理

### Pinia
**Commands**: 无单独命令，集成在 `pnpm dev` / `pnpm build`
**Conventions**: ✅ `defineStore` Options API / Setup Store / ✅ 仅跨组件共享数据 / ✅ 页面私有 → ref/reactive / ❌ Store 中直接操作 DOM
**CI job**: 含在 `pnpm test:unit`

### Zustand
**Commands**: 无单独命令，集成在 `pnpm dev` / `pnpm build`
**Conventions**: ✅ `create((set, get) => ({...}))` / ✅ 跨组件共享状态 / ✅ combine with TanStack Query / ❌ Redux style action types unless complex
**CI job**: 含在 `pnpm test`

### TanStack Query (React Query)
**Commands**: 无单独命令，集成在 `pnpm dev`
**Conventions**: ✅ `useQuery` for GET / `useMutation` for writes / ✅ `staleTime` / `gcTime` 显式设置 / ❌ useEffect 内 fetch（用 query 替代）
**CI job**: 含在 `pnpm test`

---

## 数据库

### MySQL
**Commands**: `mysql -u root -p` / `mysqldump -u root <db_name> > backup.sql` / `mysql -u root <db_name> < backup.sql`
**Conventions**: ✅ InnoDB 引擎 / ✅ utf8mb4 编码 / ✅ snake_case 表名 / ❌ root 账号裸连 → 应用专用账号
**CI job**: `mirromutth/mysql-action@v1.1` 服务容器 `mysql:8.0` + health check

### PostgreSQL
**Commands**: `psql -U postgres` / `pg_dump <db_name> > backup.sql` / `psql <db_name> < backup.sql`
**Conventions**: ✅ snake_case 表名 / ✅ TIMESTAMPTZ / ❌ VARCHAR without limit (= TEXT) / ❌ SERIAL → GENERATED AS IDENTITY
**CI job**: `postgres:16-alpine` services container + health check `pg_isready`

---

## AI/LLM 栈

### LangChain / LangGraph
**Commands**: `pip install -U langchain langgraph`（Python ≥3.10）/ `pip install langgraph-cli` + `langgraph dev`（本地 Agent Server，默认 2024 端口）/ JS: `npm i langchain @langchain/langgraph @langchain/core` + `npx @langchain/langgraph-cli dev`
**Conventions**:
```
✅ 模型调用统一走 provider 抽象层，业务代码不直连各家 SDK
✅ 提示词模板与图/链定义外置（prompts/ 或配置），与业务逻辑分离
✅ 调用参数（model / temperature）走配置，可环境变量覆盖
❌ 硬编码 API Key / base_url / 模型名
❌ 在循环中逐条同步调用 LLM（应并发或批量）
```
**CI job**:
```yaml
- uses: actions/setup-python@v5
  with: { python-version: '3.12' }
- run: pip install -r requirements.txt
- run: pytest -q   # LLM 调用必须 mock，不得打真实 API
```
**Gate**: 硬编码密钥 → 密钥扫描（见门禁配方表「硬编码密钥 / Token」） / 依赖清单漂移 → 比对 `pyproject.toml` / `package.json` 与 AGENTS.md 技术栈行（见「依赖清单 ↔ 规范漂移」） / 依赖未锁 → `pip install --require-hashes`

### LlamaIndex
**Commands**: `pip install llama-index`（starter bundle：core + llms-openai + readers-file）/ 按需装集成：`pip install llama-index-core llama-index-llms-ollama llama-index-embeddings-huggingface` / TS: `npm i llamaindex @llamaindex/openai @llamaindex/workflow`
**Conventions**:
```
✅ 只装用到的集成（llama-index-* 命名空间包），不整包引入
✅ 默认 LLM / embedding 模型显式配置，不依赖库内置默认值
✅ 索引与存储落盘位置显式指定（`LLAMA_INDEX_CACHE_DIR` 可覆盖）
✅ 检索参数（top_k / similarity_cutoff）走配置
❌ 硬编码 `OPENAI_API_KEY` 等凭据（一律环境变量）
❌ 把离线缓存目录提交进仓库
```
**CI job**:
```yaml
- uses: actions/setup-python@v5
  with: { python-version: '3.12' }
- run: pip install -r requirements.txt
- run: python -m pytest --passWithNoTests   # 用假 embedding 测索引/检索
```
**Gate**: 硬编码密钥 → 密钥扫描（见「硬编码密钥 / Token」） / 缓存目录入库 → `.gitignore` 含缓存目录 + `git ls-files` 断言无命中 / 依赖清单漂移 → 比对 `requirements*.txt` / `pyproject.toml` 与 AGENTS.md 技术栈行（见「依赖清单 ↔ 规范漂移」）

### pgvector
**Commands**: 库内启用 `CREATE EXTENSION IF NOT EXISTS vector;` / 升级扩展 `ALTER EXTENSION vector UPDATE;` / 校验已装 `SELECT * FROM pg_extension WHERE extname = 'vector';`（扩展版本以官方发布为准）
**Conventions**:
```
✅ 向量维度与 embedding 模型输出严格一致（如 `vector(1536)`）
✅ 建 HNSW / IVFFlat 索引加速近邻查询，不只靠顺序扫描
✅ 向量列与业务元数据同表存放，减少额外 join
✅ 扩展在迁移脚本中声明，不依赖运维手工执行
❌ 在应用代码里执行 `CREATE EXTENSION`（属迁移 / DDL 职责）
❌ 向量维度写死成与模型输出不符的值
```
**CI job**:
```yaml
services:
  db:
    image: pgvector/pgvector   # 标签按项目 PG 版本固定，勿用 latest
- run: psql "$DATABASE_URL" -c 'CREATE EXTENSION IF NOT EXISTS vector;'
- run: psql "$DATABASE_URL" -f db/migrations/*.sql
```
**Gate**: 扩展未启用 → CI 连库断言 `pg_extension` 含 `vector` / 维度不一致 → 比对模型输出维度与迁移中的 `vector(n)` / 迁移与模型定义漂移 → 比对 `migrations/` 与 schema 定义（见门禁配方表「迁移与模型定义不一致」）

### Ollama / vLLM（本地推理服务）
**Commands**: `ollama serve`（默认监听 11434）/ `ollama pull <model>` + `ollama run <model>` / `ollama ls` / `ollama ps` / `ollama create -f Modelfile` / vLLM: `pip install vllm` + `vllm serve <model> --port 8000`
**Conventions**:
```
✅ 服务地址（`OLLAMA_HOST` / `--host`）走环境变量，不写死 IP
✅ 模型名与量化/权重版本显式声明，不用隐式默认
✅ 上下文长度（`OLLAMA_CONTEXT_LENGTH` / `--max-model-len`）按业务显式设置
✅ 自定义模型用 Modelfile 纳入版本管理
❌ 生产沿用默认单并发配置（需评估并发与显存）
❌ 在代码里硬编码对外暴露地址（如 `0.0.0.0:11434`）
```
**CI job**:
```yaml
# 本地推理服务一般不进单元测试；集成测试用容器起服务做冒烟
- run: docker run -d -p 11434:11434 ollama/ollama
- run: curl -fsS http://localhost:11434/api/tags   # 健康检查，超时即失败
```
**Gate**: 端点硬编码 → grep 检查（源码禁止出现 `localhost:11434` / `127.0.0.1:11434` 字面量，须读 `OLLAMA_HOST`） / 服务健康 → `curl -f $OLLAMA_HOST/api/tags` / 版本漂移 → 镜像与依赖 tag 固定（禁 `latest`，对应「锁文件与清单不一致」思路）

---

## IaC 与云原生

### Terraform
**Commands**: `terraform init -backend=false` / `terraform fmt -check -recursive` / `terraform validate` / `terraform plan -detailed-exitcode`（0 无变更 / 1 出错 / 2 有变更）/ `terraform test`（`.tftest.hcl`）
**Conventions**:
```
✅ provider 与 `required_version` 显式固定版本约束
✅ 变量含 type + description，敏感变量标 `sensitive = true`
✅ 状态存远端后端（S3 / GCS / Terraform Cloud），本地 state 不入库
✅ 模块名用 `terraform-<PROVIDER>-<NAME>`，嵌套保持浅层
❌ 提交 `.terraform/` / `*.tfstate` / 含明文凭据的 `*.tfvars`
❌ 资源名重复资源类型（`aws_instance.web_server` 而非 `webserver_instance`）
```
**CI job**:
```yaml
- uses: hashicorp/setup-terraform@v3
- run: terraform fmt -check -recursive
- run: terraform init -backend=false && terraform validate
- run: terraform test
```
**Gate**: 格式 → `terraform fmt -check -recursive` / 语法与内部一致性 → `terraform validate` / IaC 安全 → trivy / tfsec / checkov（明文密钥、公网暴露） / 状态文件入库 → `git ls-files '*.tfstate*'` 须为空

### Helm
**Commands**: `helm lint <chart>` / `helm template <release> <chart> --debug` / `helm install <release> <chart> --dry-run=server` / `helm dependency build` / `helm test <release>`
**Conventions**:
```
✅ `Chart.yaml` 用 `apiVersion: v2`（Helm 3+），name 与目录名一致
✅ 可配置项全部进 `values.yaml` 并带注释，模板内不写死
✅ 依赖版本用 `~X.Y.Z` 锁定，变更后跑 `helm dependency update`
✅ 标准标签（`app.kubernetes.io/*`）经 `_helpers.tpl` 统一注入
❌ 模板中硬编码镜像 tag / 域名 / storageClass
❌ `Chart.yaml` 依赖与 `Chart.lock` 不一致
```
**CI job**:
```yaml
- run: helm lint deploy/chart
- run: helm template ci deploy/chart > /tmp/rendered.yaml
- run: helm dependency build deploy/chart
```
**Gate**: chart 规范 → `helm lint` / 模板可渲染 → `helm template ... --debug` 非零即报 / 依赖锁一致 → `helm dependency build` 后 `git diff --exit-code`（对应门禁配方表「锁文件与清单不一致」） / 渲染后清单校验 → kubeconform / trivy config

### Kubernetes manifest（kubectl / kustomize）
**Commands**: `kubectl kustomize <dir>` / `kubectl apply -k <dir>` / `kubectl diff -k <dir>`（部署前预检）/ `kubectl apply --dry-run=server -f <dir>` / 独立 CLI: `kustomize build <dir>`
**Conventions**:
```
✅ 环境差异用 overlay 表达（base + `overlays/<env>`），不整份复制清单
✅ 所有资源显式声明 namespace 与 `resources.requests/limits`
✅ 镜像 tag 用不可变版本（digest 或精确 tag），禁 `latest`
✅ 敏感值走 Secret / 外部密钥管理，清单内不出现明文
❌ 在 base 中写环境专属值（副本数 / 域名 / 存储类）
❌ 用 `kubectl edit` 直接改线上资源而不回写清单
```
**CI job**:
```yaml
- run: kubectl kustomize overlays/${{ matrix.env }} > /tmp/manifest.yaml
- run: kubectl apply -f /tmp/manifest.yaml --dry-run=server
- run: kubeconform -strict /tmp/manifest.yaml
```
**Gate**: 渲染可构建 → `kubectl kustomize` 非零即报 / 清单 schema → kubeconform `-strict`（拒绝未知字段）/ 清单与集群漂移 → `kubectl diff -k` 输出非空即报（部署前预检）/ 明文密钥 → 密钥扫描

---

## 可观测性

### OpenTelemetry
**Commands**: 以环境变量配置：`OTEL_EXPORTER_OTLP_ENDPOINT`（gRPC 默认 `http://localhost:4317`，HTTP 默认 `http://localhost:4318`）/ `OTEL_SERVICE_NAME` / `OTEL_EXPORTER_OTLP_HEADERS` / 零代码接入：Java Agent、`opentelemetry-instrument`
**Conventions**:
```
✅ endpoint / headers 一律读环境变量，源码内不写死 collector 地址
✅ 每个服务显式设置 `service.name`（与部署名一致）
✅ span 属性按语义约定（semantic conventions）命名
✅ 采样率按环境配置（生产不默认全采）
❌ 硬编码 exporter endpoint / auth header / token
❌ 上报时 service.name 缺失默认值（无法按服务聚合）
```
**CI job**:
```yaml
- run: grep -rn "OTEL_EXPORTER_OTLP_ENDPOINT" src/   # 断言只出现在配置读取处
- run: ./scripts/otel-selftest.sh   # 起本地 collector，断言能收到 span
```
**Gate**: 端点硬编码 → grep 检查（源码禁止出现 `http://localhost:4317` / `:4318` 字面量，必须经环境变量）/ 服务名缺失 → 检查初始化处含 `OTEL_SERVICE_NAME` 或 resource `service.name` / 密钥进入代码 → 密钥扫描

### Sentry
**Commands**: `npx @sentry/wizard@latest -i sourcemaps`（自动接入）/ `sentry-cli sourcemaps inject <dir>` 后 `sentry-cli sourcemaps upload <dir>` / 发布：`sentry-cli releases new <name>`
**Conventions**:
```
✅ DSN 与 auth token 一律环境变量（`SENTRY_DSN` / `SENTRY_AUTH_TOKEN`）
✅ release 名与构建版本一致，source map 仅在生产构建上传
✅ environment 与 tracesSampleRate 显式配置
✅ 上报前剥离 PII（用户标识哈希化）
❌ 前端 bundle 暴露 `SENTRY_AUTH_TOKEN`
❌ 开发构建上传 source map（污染 release）
```
**CI job**:
```yaml
- run: npx @sentry/cli sourcemaps inject ./dist
- run: npx @sentry/cli sourcemaps upload ./dist
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```
**Gate**: token 未走环境变量 → 密钥扫描（见「硬编码密钥 / Token」）/ source map 未注入 → 构建产物 grep `debugId` 注释缺失即报 / 依赖清单漂移 → 比对 `package.json` 与 AGENTS.md 技术栈行（见「依赖清单 ↔ 规范漂移」）

### Prometheus + Grafana
**Commands**: `promtool check config prometheus.yml` / `promtool check rules rules/*.yml` / `promtool test rules tests/*.yml` / 指标名规范：`cat metrics.prom | promtool check metrics` / Grafana 用 provisioning 目录（datasources/ + dashboards/）声明式管理
**Conventions**:
```
✅ 采集配置与告警/记录规则进版本库，禁止 UI 手改
✅ 告警规则带 `for` 持续时间与 `severity` 标签
✅ 仪表盘以 JSON / provisioning 声明，纳入 Git
✅ 指标命名遵循约定（`_total` / `_seconds` 等后缀）
❌ 高基数标签（user_id / request_id）进指标维度
❌ 在代码中硬编码 Grafana / Alertmanager 凭据
```
**CI job**:
```yaml
- run: promtool check config deploy/prometheus/prometheus.yml
- run: promtool check rules deploy/prometheus/rules/*.yml
- run: promtool test rules deploy/prometheus/tests/*.yml
```
**Gate**: 配置合法 → `promtool check config` / 规则合法与重复 → `promtool check rules --lint=all` / 规则单测 → `promtool test rules` 非零即报 / 凭据硬编码 → 密钥扫描

---

## 数据工程

### dbt
**Commands**: `dbt deps` / `dbt build --select state:modified+`（Slim CI：跑变更模型及下游并带测试）/ `dbt test` / `dbt compile` / `dbt clone --select state:modified+,config.materialized:incremental,state:old`
**Conventions**:
```
✅ 模型分层（staging / intermediate / marts），目录即分层
✅ 每个模型在 YAML 声明 description 与 tests（unique / not_null 起步）
✅ 增量模型显式设 `unique_key` 与 `on_schema_change`
✅ 源表用 `source()`、跨模型用 `ref()`，禁硬编码库表名
❌ 提交 `target/` 产物；`--state` 与 `--target-path` 指向同一路径
❌ 用 `dbt run` 替代 `dbt build`（会漏掉测试）
```
**CI job**:
```yaml
- run: dbt deps
- run: dbt build --select state:modified+ --defer --state ./state
  env:
    DBT_PROFILES_DIR: ./ci
```
**Gate**: 模型/测试未通过 → `dbt build` 非零即报 / 改了模型未同步测试 → `dbt build --select state:modified+` 须覆盖对应 test 节点 / 契约漂移 → 比对模型 YAML 声明的 contract 与导出 schema（见门禁配方表「契约漂移」）

### Airflow
**Commands**: `airflow db migrate`（升级元数据库）/ `airflow dags test <DAG_ID> -f <path>` / `airflow tasks test <dag_id> <task_id>` / `airflow dags list` / `airflow connections test <conn_id>`（Airflow 3.x，`--subdir` 已移除）
**Conventions**:
```
✅ DAG 幂等可重跑，任务显式设 retries + retry_delay
✅ 连接/变量走 Airflow Connections / Variables，不在 DAG 写死凭据
✅ `catchup=False` + 显式 schedule，避免历史补跑风暴
✅ DAG 文件统一放 `dags/`（对应 `dags_folder` 配置），模块化拆分
❌ 任务代码 import 数据库 session 直连元数据库（Airflow 3 已禁止）
❌ 在 DAG 顶层做重 IO（拖慢 DAG 解析与调度器）
```
**CI job**:
```yaml
- uses: actions/setup-python@v5
  with: { python-version: '3.12' }
- run: pip install -r requirements.txt
- run: airflow dags list   # DAG 导入/解析失败即非零退出
```
**Gate**: DAG 可解析 → `airflow dags list`（导入报错即失败）/ 单任务可跑 → `airflow tasks test` / 元数据库与代码版本一致 → `airflow db migrate --show-sql-only` 检视后执行（对应「迁移与模型定义不一致」思路）/ 凭据硬编码 → 密钥扫描

---

## 原生移动

### Flutter
**Commands**: `flutter pub get` / `flutter analyze` / `dart format --set-exit-if-changed .` / `flutter test` / 集成测试 `flutter test integration_test/app_test.dart` / 构建 `flutter build apk --release`
**Conventions**:
```
✅ 状态管理选型统一（Riverpod / Bloc / Provider 择一），不混用
✅ widget 拆小，业务逻辑放 service / repository 层
✅ `analysis_options.yaml` 启用 `flutter_lints` 规则集
✅ 本地化资源经 `flutter gen-l10n` 生成，不手写 arb 映射
❌ 业务代码用 `print`（用 `debugPrint` 或日志库）
❌ 提交 `build/` / `.dart_tool/`
```
**CI job**:
```yaml
- uses: subosito/flutter-action@v2
  with: { channel: stable }
- run: flutter pub get
- run: flutter analyze && flutter test
```
**Gate**: 静态分析 → `flutter analyze`（warning 视为失败）/ 格式化 → `dart format --set-exit-if-changed .` / 单元与 widget 测试 → `flutter test` / 调试残留 → `flutter analyze` 的 `avoid_print` 规则 / 锁文件一致 → `flutter pub get` 后 `git diff --exit-code`（`pubspec.lock`）

### SwiftUI（Swift）
**Commands**: SPM: `swift build` / `swift test` / `swift package resolve` / Xcode 工程: `xcodebuild -scheme <App> -destination 'platform=iOS Simulator,name=iPhone 16' build|test` / lint: `swiftformat --lint .` + `swiftlint`
**Conventions**:
```
✅ View 保持无副作用，业务逻辑放 @Observable / ViewModel
✅ 依赖走 SPM，提交 `Package.resolved` 锁文件
✅ Swift 并发用 async/await + actor，避免跨线程共享可变状态
✅ 测试用 Swift Testing（@Test / #expect）或 XCTest，全项目统一
❌ 在 View body 内做重计算 / 网络请求
❌ 提交 `DerivedData/` / `build/` / `*.xcuserstate`
```
**CI job**:
```yaml
- uses: swift-actions/setup-swift@v2
  with: { swift-version: '6.0' }   # 版本按 setup-swift 支持列表固定
- run: swift build
- run: swift test
```
**Gate**: 构建 → `swift build` / 单测 → `swift test` / 格式 → `swiftformat --lint .` / 静态检查 → `swiftlint --strict`（warning 即失败）/ 锁文件一致 → `swift package resolve` 后 `git diff --exit-code`

### Jetpack Compose（Kotlin）
**Commands**: `./gradlew assembleDebug` / `./gradlew test` / `./gradlew lint` / 设备测试 `./gradlew connectedAndroidTest` / Compose 编译器插件（Kotlin 2.0+ 必须）：`org.jetbrains.kotlin.plugin.compose`
**Conventions**:
```
✅ Compose 编译器用 `org.jetbrains.kotlin.plugin.compose`，不再手写 composeOptions
✅ 插件与依赖版本经 Gradle version catalog（`libs.versions.toml`）统一
✅ `@Composable` 保持无副作用，状态用 remember / ViewModel 提升
✅ 每个 `@Preview` 覆盖明暗主题与关键状态
❌ Composable 中直接发起网络 / 数据库 IO（放 ViewModel / Repository）
❌ 只在部分模块接入 Compose 导致 UI 与状态层割裂
```
**CI job**:
```yaml
- uses: actions/setup-java@v4
  with: { distribution: temurin, java-version: '17' }
- run: ./gradlew lint test
```
**Gate**: 编译 → `./gradlew assembleDebug` / 静态检查 → `./gradlew lint` / 单测 → `./gradlew test` / 编译器插件缺失 → 断言使用 Compose 的模块均 apply `org.jetbrains.kotlin.plugin.compose`

---

## 通用段落

### 核心开发原则
**Conventions**:
```
✅ 高内聚低耦合 — 模块只做一件事，跨模块走 Service 接口
✅ 模块职责单一 — Service 承担多个职责域时拆分
✅ 组合优于继承 — Decorator/Guard/Interceptor 管道组合，避免深层继承链
✅ 避免全局状态 — Injectable 默认单例，禁止存请求级可变状态
✅ 纯函数优先 — utils/ DTO transform 无副作用，输入确定输出确定
✅ 复用已有代码避免重复造轮子 — 先查 utils/ 和现有模块，优先引用成熟开源组件
✅ 第三方库 API/版本/配置不确定时 → 先 WebSearch/WebFetch 查官方文档，确认当前版本用法后再写代码
✅ 升级依赖后 → 核对官方 changelog / 迁移指南中的破坏性变更
❌ 凭旧记忆写第三方库 API（TypeORM 0.2→0.3、BullMQ v4→v5、Vant 2→4 等版本差异大）
❌ 重复编写已有工具函数
❌ 不用项目中已封装的 api/ 模块而直接调底层 HTTP
❌ 引入能由已有依赖覆盖的新依赖包
❌ 只走 happy path — 每个分支都写异常/错误路径
❌ 吞掉错误 — catch 后空处理 / 忽略 err（含异步 Promise reject）
❌ 硬编码密钥/Token — 一律环境变量注入
✅ 写代码前先读现有代码（已有 utils/ 封装/相似模块先复用），不理解先问
```

### Boundaries 通用规范
```
**Allowed**: src/ / app/ / pages/ / components/ / modules/ / docs/ / tests/
**Ask First**: 依赖变更 (package.json / go.mod / pyproject.toml / Cargo.toml) / 数据库 schema 变更 / 基础设施配置变更
**Never Touch**: node_modules/ / dist/ / build/ / target/ / .venv/ / __pycache__/ / vendor/ / .env / .env.* / 证书 / 密钥 / .next/
```

### Git 规范
**Commands**: `git add <files>` / `git commit -m "<type>(<scope>): <description>"` / `git push` / `git revert <commit>`
**Conventions**: 
```
✅ 分支: main(唯一常驻，tag 发布) 或 master(生产)/develop(日常) 双分支 — 按项目已有分支写入
✅ 提交: <type>(<scope>): <description>  — type: feat/fix/refactor/docs/test/chore/perf
✅ 部署前必须 commit，线上问题 git revert 回滚
❌ git push --force / git reset --hard
❌ 提交 .env / node_modules / dist / 证书
```

### 代码审查清单
```
通用检查项:
✅ 新文件有配套测试?
✅ 错误路径已处理?
✅ 无硬编码密码 / Token / API Key?
✅ 无 console.log / print() (除非调试且会删除)?
✅ 关键节点有日志?
✅ 无 N+1 查询?
✅ API 响应格式一致?
✅ 第三方库用法已核对当前版本文档?
✅ 无吞错误 / 无只走 happy path — catch 无空处理、无忽略 err，每分支含异常路径?
✅ 无逐条 await 循环 — 批量请求用 Promise.all 并发?
✅ 未绕过项目已封装的 api/ 模块直调底层 HTTP?
✅ 密钥/Token 仅经环境变量注入（无硬编码）?
✅ 已对照 AI 高频错误清单（references/ai-common-mistakes.md）自查?

语言特定:
  TS/JS: tsc --noEmit 通过? / 无 any?
  Go:    go vet 通过? / err 都已处理?
  Python: mypy 通过? / ruff 通过?
  Java:  checkstyle 通过? / @Transactional 正确?
  Rust:  clippy -D warnings 通过? / 无 unwrap()?
```

### 跨语言门禁配方表

> 这张表用于"为新项目自适应生成门禁"——按探测到的技术栈取对应行的等价检查；门禁只允许使用项目已安装的工具，不得要求用户新装依赖。

| 通用红线 | 检查方式 | 跨语言等价 |
|---|---|---|
| 契约漂移（接口 schema 与代码不一致） | 从源码导出 schema，再 `git diff --exit-code` 卡住未重导 | JS/TS: `npm run openapi:export`；Go: `swag init`；Python: FastAPI 导出 `app.openapi()`；Java: springdoc；通用: OpenAPI / JSON Schema / protobuf / GraphQL SDL |
| 硬编码密钥 / Token | 密钥扫描 | gitleaks / trufflehog / 自写正则（`sk-`、`BEGIN PRIVATE KEY`、`password=`） |
| 锁文件与清单不一致 | 冻结安装 | `npm ci` / `pnpm i --frozen-lockfile` / `pip install --require-hashes` / `go mod verify` / `cargo build --locked` |
| 调试残留输出 | 禁用输出语句 | ESLint `no-console` / `grep -rn "print("` / `go vet` / checkstyle / `clippy` |
| 静态检查 / 类型错误 | 编译器或类型检查器 | `tsc --noEmit` / `go vet ./...` / `mypy src/` / `./gradlew check` / `cargo clippy -- -D warnings` |
| 格式不一致 | `--check` 模式 | `prettier --check` / `gofmt -l` / `black --check` / `ktlint` / `ruff format --check` |
| 测试未达标 | 跑测试 + 覆盖率阈值 | jest / vitest / `pytest --cov` / `go test -cover` / jacoco |
| 迁移与模型定义不一致 | 比对迁移目录与 schema 定义（数量/命名） | 按项目迁移方案（`migrations/` 目录 vs ORM schema/Entity） |
| 文档漂移（编号/状态头/索引缺失） | 文档一致性脚本（语言无关） | `node scripts/docs-check.mjs`（或等价的 Python / shell 实现） |
| 依赖清单 ↔ 规范漂移（新增依赖但 AGENTS.md 技术栈行未同步） | 解析依赖清单并与 AGENTS.md 技术栈描述比对，差异即报 | JS/TS: `package.json`；Go: `go.mod`；Python: `pyproject.toml` / `requirements*.txt`；Java: `pom.xml` / `build.gradle*`；Rust: `Cargo.toml` |
| 模块速查表 ↔ 实际目录漂移（源码目录新增/改名但模块速查表未同步） | 比对源码一级子目录集合与模块速查表首列，集合不一致即报 | Node: `src/`；Go: `internal/` + `cmd/`；Python: 包目录（含 `__init__.py`）；Java: `src/main/java/**` |
| spec ↔ 代码漂移（spec 描述与实现不一致） | spec 与代码不一致时同样以导出物 / 契约方式卡住：比对 spec 声明的字段与代码导出产物 | 语言无关（与「契约漂移」分工：契约漂移管「源码 ↔ 导出物」，本行管「spec ↔ 代码」；spec 归档于 `.trae/specs/` 或等价目录） |
| 单文件过大（可维护性下降） | 行数校验 | 语言无关（AGENTS.md 与 docs 单篇行数上限） |

> 不可机检的红线不建门禁，只写规范并标注 `[无门禁]`——真实工程中约 1/4 的缺陷模式最终会固化为门禁。

> 漂移类配方（依赖清单 / 模块速查表 / spec ↔ 代码）的参考实现见 `references/drift-check.mjs`，经 `scripts/verify.*` 统一入口装配。

---

## 业务类型文档模式

> Step 3 推断业务类型后的文档生成指南。**不使用固定目录**，按业务类型 + WebSearch 动态生成。

### 后端 API 服务
**标识**: src/controllers/ / src/modules/ / src/services/ / 后端框架(NestJS/Express/FastAPI/Gin/Django/Spring Boot) / ORM 配置(prisma/typeorm/gorm/sqlalchemy)
**文档侧重**: `A-02-技术架构.md` / `A-03-数据库设计.md` / `D-01-系统运维方案.md`
**联网搜索**: `"{framework} API service documentation structure best practices {currentYear}"`

### 全栈项目
**标识**: 同时匹配后端 + 前端特征
**文档侧重**: 前后端分块 + 全栈部署文档
**联网搜索**: `"full-stack project documentation structure {currentYear}"`

### 前端应用
**标识**: pages/ / app/ + components/ / src/components/
**文档侧重**: `A-04-前端架构.md` / 组件库文档 / 路由设计
**联网搜索**: `"{framework} frontend project documentation structure {currentYear}"`

### 微服务架构
**标识**: docker-compose.yml + 3+ services
**文档侧重**: `A-02-技术架构.md`(服务拓扑) / 服务间通信规范 / 配置管理
**联网搜索**: `"microservices documentation structure service topology {currentYear}"`

### 管理后台
**标识**: package.json description 含 `后台/管理/admin`
**文档侧重**: 权限模型文档 / 数据看板说明 / 批量操作规范
**联网搜索**: `"admin dashboard documentation structure {currentYear}"`

### 移动端应用
**标识**: mobile/ / ios/ / android/ / uni-app / React Native / Flutter
**文档侧重**: `A-05-移动端架构.md` / 蓝牙协议 / 推送通知 / 离线策略
**联网搜索**: `"mobile app technical documentation structure {currentYear}"`

### CLI 工具
**标识**: package.json 有 `"bin"` 字段 / pyproject.toml `[project.scripts]` / go.mod + cmd/ 目录
**文档侧重**: 命令参考 / 安装指南 / 配置说明
**联网搜索**: `"CLI tool documentation structure best practices {currentYear}"`

### 库/SDK
**标识**: package.json 有 `"main"`/`"module"` 无 dev server / Cargo.toml `[lib]` 无 `[[bin]]`
**文档侧重**: API 参考 / 快速开始 / 示例代码
**联网搜索**: `"library SDK documentation structure best practices {currentYear}"`

### 桌面应用
**标识**: electron/tauri/nwjs 在依赖中
**文档侧重**: `A-05-移动端架构.md`(改为桌面) / 安装打包 / 系统集成
**联网搜索**: `"desktop app documentation structure best practices {currentYear}"`

### 静态站点
**标识**: astro/vitepress/docusaurus/hugo/jekyll/hexo 配置
**文档侧重**: 内容组织 / 部署发布
**联网搜索**: `"static site documentation structure {currentYear}"`

### 未知类型
**联网搜索**: `"{project description or framework} project documentation best practices {currentYear}"`

### 模块速查表生成规则（含联网回退）

> 先按文件模式推断，无法匹配时联网搜索，最后才标记待补充。

#### 已知文件模式 → 模块职责映射

| 内部文件模式（任一匹配） | 推断模块类型 | 职责描述关键词 |
|--------------------------|-------------|-------------|
| `*.controller.ts` / `*Controller.java` / `*_controller.py` | API 路由模块 | 请求路由、参数校验、响应封装 |
| `*.service.ts` / `*Service.java` / `*.service.py` | 业务逻辑层 | 核心业务、事务管理、跨模块调用 |
| `*.repository.ts` / `*Repository.java` / `*_repository.py` | 数据访问层 | 数据库查询、ORM 操作 |
| `*.entity.ts` / `*.model.ts` / `models.py` / `@Entity` | 数据模型 | 表结构定义、字段映射 |
| `*.module.ts` / `*.guard.ts` / `*.interceptor.ts` | NestJS 基础设施 | 模块注册、守卫、拦截器 |
| `handler*.ts` / `strategy*.ts` / `verifier*.ts` | 策略/处理器模块 | 多态行为、可扩展业务规则 |
| `*.dto.ts` / `*Dto.java` / `schemas.py` | DTO/校验层 | 数据传输对象、输入校验 |
| `*.gateway.ts` / `ws*` / `websocket*` | WebSocket 模块 | 实时通信、推送 |
| `*.spec.ts` / `*Test.java` / `test_*.py` / `__tests__/` | 测试 | （不列入模块表，仅用于识别） |
| `*.job.ts` / `*.cron.ts` / `*Scheduler.java` / `tasks.py` | 定时任务 | 周期调度、批处理 |
| `*.middleware.ts` / `middleware/` / `middlewares.py` | 中间件 | 请求拦截、日志、认证前置 |
| `migrations/` / `alembic/` / `flyway/` | 数据库迁移 | Schema 版本管理 |
| `utils/` / `helpers/` / `lib/` / `common/` | 工具/公共层 | 通用函数、常量、类型定义 |

#### 文件模式推断流程

```
列出 src/ 或 app/ 下的一级子目录
    ↓
对每个子目录，读取内部文件列表（限前 10 个）
    ↓
匹配上表已知模式 → 推断模块类型和职责
    ↓
无法匹配 → 联网搜索:
  WebSearch "{dirName} directory in {framework} project typical purpose {currentYear}"
  WebSearch "{fileList_sample} pattern in {language} {framework} architecture"
    ↓
联网有结果 → 提取职责关键词，写入模块表（标注 "推断，待确认"）
联网无结果 → 标记 "待补充，建议检查：{dirName}（{文件列表摘要}）"
    ↓
写入 AGENTS.md 模块速查表（不包含测试目录）
```

#### 联网搜索模板

| 场景 | 搜索模板 | 提取目标 |
|------|---------|---------|
| 陌生目录名 | `"{dirName}" directory purpose in {framework} project` | 目录职责、常见子文件 |
| 陌生文件后缀 | `".{ext}" file in {language} project what is it` | 文件用途、生态位置 |
| 架构模式关键词 | `"{pattern}" architecture pattern in {framework} example` | 模块职责描述 |
| 英文业务术语 | `"{term}" in software "{domain}" module responsibility` | 业务含义 + 技术实现 |

#### 示例

```
探测: src/notification/
内部文件: [email.service.ts, sms.service.ts, push.service.ts, notification.module.ts]
模式匹配: *.service.ts + *.module.ts → "业务逻辑层"
补充推断: 目录名 "notification" → "通知模块"
联网搜索: 无需（模式已匹配）
输出: notification | 通知模块 | 邮件/短信/推送多渠道通知
```

```
探测: src/sagas/
内部文件: [order.saga.ts, payment.saga.ts, index.ts]
模式匹配: 无已知模式 *.saga.ts
联网搜索: "sagas directory NestJS project typical purpose {currentYear}"
搜索结果: "Saga pattern for distributed transaction orchestration..."
输出: sagas | 分布式事务编排 (Saga模式) | 推断，待确认
```

```
❌ 不使用固定模板的占位符模块名（如 "模块1/模块2/模块3"）
❌ 不跳过无法推断的模块 — 必须联网搜索
❌ 不在模块表中包含测试目录 (__tests__/specs/tests)
```
