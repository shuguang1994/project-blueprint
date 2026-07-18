# 组件知识库

> 规则引擎拼接 AGENTS.md 时的参考源。每个组件含 Commands / Conventions / CI 三段。
> 从 presets/ 目录提取关键信息 + 通用最佳实践扩展。v1.0 | 2026-07-18

---

## 语言层

### TypeScript / JavaScript
**Commands**: `npx tsc --noEmit` / `node --experimental-strip-types src/index.ts`
**Conventions**: ✅ 显式类型 / ✅ const 默认 / ❌ any（需 `// @ts-expect-error` + 注释） / ❌ var
**CI job**: `setup-node@v4` node-version 20 + `npm ci` + `npx tsc --noEmit`

### Go
**Commands**: `go build ./...` / `go run ./cmd/server` / `go test ./...`
**Conventions**: ✅ error 永不忽略 / ✅ context.Context 贯穿 IO / ❌ panic（除 init/main） / ❌ 全局变量
**CI job**: `setup-go@v5` go-version '1.21' + `go vet ./...` + `go build ./...`

### Python
**Commands**: `python -m py_compile src/**/*.py` / `uvicorn main:app --reload` / `python -m pytest`
**Conventions**: ✅ type hints 公开函数 / ✅ logging 替代 print / ❌ `from module import *` / ❌ 可变默认参数
**CI job**: `setup-python@v5` python-version '3.12' + `pip install -r requirements.txt` + `ruff check .` + `mypy src/`

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
**Conventions**: ✅ @Controller('prefix') / ✅ JwtAuthGuard on protected routes / ✅ dataSource.transaction for multi-step writes / ✅ 跨模块走 Service 接口 / ❌ Controller 注入 Repository / ❌ console.log → Logger
**CI job**: `setup-node@v4` + `npm ci` + `npm run test` + `npm run build`

### Next.js (App Router)
**Commands**: `pnpm dev` / `pnpm build` / `pnpm start` / `pnpm db:push` / `pnpm lint` / `npm run test -- path.spec.ts`
**Conventions**: ✅ Server Components 优先 / ✅ 'use client' 仅交互组件 / ✅ loading.tsx + error.tsx 每路由段 / ❌ Pages Router / ❌ Client Component 中 import prisma
**CI job**: `pnpm/action-setup@v2` + `setup-node@v4` + `pnpm install --frozen-lockfile` + `pnpm lint` + `pnpm test -- --passWithNoTests` + `pnpm build`

### Vue 3 + Vite
**Commands**: `pnpm dev` / `pnpm build` / `pnpm preview` / `pnpm lint` / `pnpm test:unit` / `pnpm typecheck`
**Conventions**: ✅ `<script setup lang="ts">` / ✅ defineProps + defineEmits 显式类型 / ✅ composables 放 composables/ / ❌ Options API / ❌ class 组件
**CI job**: `pnpm/action-setup@v2` + `setup-node@v4` + `pnpm install --frozen-lockfile` + `pnpm typecheck` + `pnpm lint` + `pnpm test:unit -- --passWithNoTests`

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

---

## ORM 层

### Prisma
**Commands**: `npx prisma generate` / `npx prisma db push` / `npx prisma studio` / `npx prisma migrate dev`
**Conventions**: ✅ schema.prisma 为单一真相源 / ✅ relation 字段双向定义 / ❌ db push --force-reset --accept-data-loss / ❌ 手动改迁移 SQL
**CI job**: `setup-node@v4` + `npm ci` + `npx prisma generate` + `npm test`

### TypeORM
**Commands**: `npx typeorm migration:generate` / `npx typeorm migration:run` / `npx ts-node src/migration-runner.ts`
**Conventions**: ✅ Entity 字段 camelCase → column snake_case / ✅ dataSource.transaction 多步写 / ❌ `.from('table_name')` 裸表名 / ❌ forFeature 注册其他模块 Entity
**CI job**: `setup-node@v4` + `npm ci` + `npx tsc --noEmit` + `npm run migration:run -- --dry-run`

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

## 测试层

### Vitest
**Commands**: `npx vitest` / `npx vitest --coverage` / `npx vitest --ui`
**Conventions**: ✅ describe / it 语义化 / ✅ `vi.fn()` / `vi.spyOn()` mock / ❌ 测试间共享可变状态 / ❌ setTimeout 不 await
**CI job**: `setup-node@v4` + `npm ci` + `npx vitest run --coverage --passWithNoTests`

### Jest
**Commands**: `npx jest` / `npx jest --coverage` / `npx jest --watch`
**Conventions**: ✅ `jest.mock()` 模块级别 / ✅ `beforeEach` 重置状态 / ❌ 异步测试无 `await expect().rejects` / ❌ 测试代码依赖执行顺序
**CI job**: `setup-node@v4` + `npm ci` + `npx jest --coverage --passWithNoTests`

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

### Prettier
**Commands**: `npx prettier --check .` / `npx prettier --write .`
**Conventions**: ✅ `.prettierrc` 单一配置 / ✅ CI 中 `--check` 模式 / ❌ ESLint + Prettier 冲突规则 → eslint-config-prettier
**CI job**: `setup-node@v4` + `npm ci` + `npx prettier --check .`

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
**Commands**: `mysql -u root -p` / `mysqldump -u root app_db > backup.sql` / `mysql -u root app_db < backup.sql`
**Conventions**: ✅ InnoDB 引擎 / ✅ utf8mb4 编码 / ✅ snake_case 表名 / ❌ root 账号裸连 → 应用专用账号
**CI job**: `mirromutth/mysql-action@v1.1` 服务容器 `mysql:8.0` + health check

### PostgreSQL
**Commands**: `psql -U postgres` / `pg_dump dbname > backup.sql` / `psql dbname < backup.sql`
**Conventions**: ✅ snake_case 表名 / ✅ TIMESTAMPTZ / ❌ VARCHAR without limit (= TEXT) / ❌ SERIAL → GENERATED AS IDENTITY
**CI job**: `postgres:16-alpine` services container + health check `pg_isready`

---

## 通用段落

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
✅ 分支: master(生产) / develop(日常) / feat/xxx / fix/xxx
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

语言特定:
  TS/JS: tsc --noEmit 通过? / 无 any?
  Go:    go vet 通过? / err 都已处理?
  Python: mypy 通过? / ruff 通过?
  Java:  checkstyle 通过? / @Transactional 正确?
  Rust:  clippy -D warnings 通过? / 无 unwrap()?
```
