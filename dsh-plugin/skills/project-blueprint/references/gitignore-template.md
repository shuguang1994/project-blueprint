# .gitignore 通用模板

> Skill `project-blueprint` Step 4 参考。根据 Step 1 探测结果选择对应规则。

---

## 基础规则（所有项目通用）

```gitignore
# Dependencies
node_modules/
.pnpm/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local
.env.production
.env.test

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
logs/

# Certificates / Keys
*.keystore
*.jks
*.p12
*.key
*.pem
!example.pem
```

---

## TypeScript/NestJS 附加

```gitignore
# Turbo (monorepo)
.turbo/

# NestJS
dist/

# Coverage
coverage/
```

---

## Go 附加

```gitignore
# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
vendor/
```

---

## Python 附加

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
.venv/
```

---

## 生成规则

1. 先检查是否已有 `.gitignore` → 如果有，只补充缺失的规则
2. 基础规则始终生成
3. 根据 Step 1 探测的语言追加对应附加规则
4. **不要覆盖**用户已有的 `.gitignore` 配置
