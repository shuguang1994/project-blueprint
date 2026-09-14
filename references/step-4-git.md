# Step 4：配置 Git 规范

> `SKILL.md` Step 4 的完整实现细节，由 SKILL.md 的「Step 索引与按需加载」表按需加载。
> 关联：references/gitignore-template.md

### .gitignore（如果没有则创建）
参考 `references/gitignore-template.md`，按语言选择对应规则。

### CHANGELOG.md（如果没有则创建）

初始化时创建版本记录文件，与生成的 AGENTS.md「版本发布规范」（每次发版：CHANGELOG 更新 → tag 打版本）配套：

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- 项目初始化：AI 编程规范体系（AGENTS.md + docs/ + 门禁层 + Git 规范 + 测试制度）

<!-- 发版条目模板（每条版本必须含以下三部分）：
## [x.y.z] - YYYY-MM-DD

### Added / Changed / Fixed / BREAKING
- <变更说明>（破坏性变更单独成段，标注 **BREAKING**）

### 验证
- <命令 + 实际输出>（例：`npx tsc --noEmit` → exit 0；`npx jest` → 12 套件 / 88 用例全绿）
- <发版 commit 号>

### 未闭环
- <未验证项 + 原因 + 风险>（例：真机未验证——本机无出包环境）
-->
```

> 发版条目不接受空泛描述：**「验证」节禁止写"应该没问题"，必须给命令与实际输出；「未闭环」节无内容时写"无"。**
> 后续发版按 AGENTS.md 发布规范更新：版本号倒序记录，标注 Breaking Change / Added / Changed / Fixed。
> 已有 CHANGELOG.md → 跳过，不覆盖（增量友好）。

### 初始化 Git
```bash
git init  # 如果还没初始化
git add .  # 受 .gitignore 保护，不会添加敏感文件
git diff --cached --quiet || git commit -m "chore: 初始化项目规范体系 — AGENTS.md + docs/ + CI"
# 不强行新建分支，按已有分支自适应（见下方分支策略）
```

### 分支策略（按已有分支自适应，不预设）

探测已有分支，按结果在 AGENTS.md 中写入对应策略：

| 已有分支 | 写入策略 |
|---------|---------|
| `main` | `main`(唯一常驻，tag 发布) / `feat/xxx`(功能) / `fix/xxx`(修复) |
| `master` + `develop` | `master`(生产) / `develop`(日常) / `feat/xxx` / `fix/xxx` |
| 无 main/develop | 询问用户偏好，默认 `main` + tag 发布 |

提交格式: `<type>(<scope>): <description>` — type: feat/fix/refactor/docs/test/chore/perf
