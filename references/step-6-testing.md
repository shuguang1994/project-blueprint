# Step 6：建立测试制度与基础设施

> `SKILL.md` Step 6 的完整实现细节，由 SKILL.md 的「Step 索引与按需加载」表按需加载。
> 关联：references/knowledge-base.md、references/step-5-ci-and-gates.md

> 项目初期不强制创建测试文件。先建立测试制度，随着开发推进逐步编写测试。

### 6.1 安装测试框架（仅当项目无测试依赖时）

按探测到的语言和框架安装：

- TypeScript/NestJS: `npm install --save-dev jest ts-jest @types/jest @nestjs/testing`
- Vue/React: `npm install --save-dev vitest @vue/test-utils` / `@testing-library/react`
- Go: 无需安装（内置 testing）
- Python: `pip install pytest`
- Java: 内置（JUnit 5，若未引入则 `./gradlew test`）
- Rust: 内置（`cargo test`）
- Ruby: `gem install rspec`

### 6.2 创建测试制度文档 `docs/B/B-03-测试指南.md`

> 不是示例测试文件，是测试制度。内容按技术栈自适应生成，结构如下：

```markdown
# 测试指南

> 项目测试策略与规范。测试随项目成长逐步完善，不接受一次性全覆盖。
> 测试框架: {从 knowledge-base 测试层提取} | 更新: {date}

## 一、测试分层

| 层级 | 范围 | 工具 | 何时编写 |
|------|------|------|---------|
| 单元测试 | 单个函数/方法 | {测试框架名} | 核心业务逻辑稳定后（utils/services） |
| 集成测试 | 模块间交互 | {测试框架名} + {supertest/testcontainers等} | API 端点完成后 |
| E2E 测试 | 完整用户流程 | {Playwright/Cypress等} | 核心用户路径确定后 |

## 二、编写时机（按项目阶段）

| 阶段 | 测试重点 | 不写的 |
|------|---------|--------|
| 原型/MVP | 不强制写测试 | 快速迭代优先 |
| 核心功能稳定 | 关键 Service 单元测试 + API 集成测试 | 工具函数、DTO |
| 用户验收前 | 核心路径 E2E | 边缘场景 |
| 持续迭代 | 修改处补测试、回归测试 | 纯 CRUD 可跳过 |

## 三、{框架名} 测试规范

> 从 `references/knowledge-base.md` 测试层 + 框架层提取。

**命令**:
{从 knowledge-base Commands 段提取}

**规范**:
{从 knowledge-base Conventions 段提取 ✅/❌ 规则}

## 四、测试示例（按需参考，非强制创建）

> 以下为框架特定的测试模式，在需要编写测试时参考。

{按框架类型选择示例模板}
```

### 6.3 框架特定测试示例（自主获取，不创建文件）

> **不预设框架列表**。根据探测到的框架，按以下优先级获取测试模式：

**获取策略**：
```
探测到的框架名
    ↓
第 1 优先: 下方快速参考中有匹配 → 直接使用
第 2 优先: knowledge-base.md 中该框架有测试相关 Conventions → 提取
第 3 优先: WebSearch "{framework} unit test example pattern best practices {currentYear}"
    ↓
将获取的测试模式写入 B-03-测试指南.md「四、测试示例」章节
```

**快速参考**（常见框架，命中即用，不命中走第 2/3 优先）:

- **NestJS**: Service 单元测试（Test.createTestingModule + mock Repository）
- **Next.js / React**: 组件测试（@testing-library/react render + screen）
- **Vue 3**: 组件测试（@vue/test-utils mount + wrapper）
- **Go Gin**: Handler 测试（httptest.NewRequest + gin.CreateTestContext）
- **Python FastAPI**: Endpoint 测试（TestClient + assert status_code）
- **Spring Boot**: Service 测试（@ExtendWith MockitoExtension + @Mock + @InjectMocks）
- **Django**: View 测试（Client + assertContains）
- **Flask**: Route 测试（app.test_client() + assert status_code）
- **Express**: Middleware 测试（supertest + request(app)）
- **Laravel**: Feature 测试（php artisan make:test + assertStatus）
- **Rust (Actix)**: Handler 测试（test::init_service + App::new().route()）
- **Ruby on Rails**: Controller 测试（get :index + assert_response :success）

> 框架不在上述列表：走第 2/3 优先流程。从 knowledge-base 框架层提取测试命令 + 联网获取具体示例代码。

### 6.4 在 AGENTS.md 中添加测试命令

从 knowledge-base 中提取对应**测试层**组件的 Commands，写入 AGENTS.md 二、常用命令。

### 6.5 配置 git hooks（按语言选择，需用户确认后执行）

> 通用原则：**hook 只做"快检查"，全量门禁放 pre-push 与 CI**（避免提交变慢导致被绕过）。hook 统一调用 `references/step-5-ci-and-gates.md` 的 Step 5.5 装配的 `scripts/verify.*`，不重复定义命令。

| 语言 | 方案 | hooks 分工 |
|------|------|-----------|
| JS/TS | husky + lint-staged | `pre-commit` 跑格式化 + 快门禁；`pre-push` 跑 `scripts/verify.*` 全量 |
| Python | `pre-commit` 框架 | `.pre-commit-config.yaml`（含 ruff / 快门禁）；全量门禁放 CI |
| Go / Java / Rust | Makefile 目标 + lefthook（可选） | 不做原生 git hook（不入库），以 CI 为主 |

**JS/TS（husky + lint-staged）**：

```bash
npm install --save-dev husky lint-staged
npx husky init
echo 'npx lint-staged' > .husky/pre-commit          # pre-commit：只跑格式化 + 快检查
echo 'node scripts/verify.mjs' > .husky/pre-push    # pre-push：跑全量门禁
```

在 `package.json` 中添加（按项目语言调整 glob）:
```json
"lint-staged": {
  "*.{ts,js}": ["npx prettier --check"]
}
```

**Python（`pre-commit` 框架）**：`.pre-commit-config.yaml` 配置 ruff 等快检查；全量门禁（`scripts/verify.py --stage=ci`）放 CI 执行。

**Go / Java / Rust**：不做原生 git hook（不易入库、易被绕过），改用 `Makefile` 目标 + lefthook（可选），CI 为主入口。

> hook 是否安装需用户确认；未安装时以 `Makefile` / CI 作为门禁主入口，语义保持一致。
