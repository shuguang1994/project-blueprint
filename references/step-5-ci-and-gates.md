# Step 5：配置 CI/CD

> `SKILL.md` Step 5（含 Step 5.5 门禁装配）的完整实现细节，由 SKILL.md 的「Step 索引与按需加载」表按需加载。
> 关联：references/knowledge-base.md、references/ci-template.yml、references/gates-templates.md

### 从知识库获取 CI job

按探测到的语言，从 `references/knowledge-base.md` 中提取对应**语言层**和**测试层**的 CI job 片段，合并为完整 workflow 文件。

参考模板见 `references/ci-template.yml`（含 TS/Go/Python/Vue 四种完整 workflow）。

### 规则
- 不依赖外部服务（DB/Redis/MQ）
- 如果远程仓库是 Gitee → 创建 `.gitee-ci.yml`（语法与 GitHub Actions 不同，参考 [Gitee Go 文档](https://gitee.com/help/articles/4280)）
- 如果远程仓库是 GitHub → 创建 `.github/workflows/ci.yml`
- **其他平台**（GitLab/Bitbucket/Codeberg 等）→ WebSearch `"{platform}" CI pipeline {language} {framework} setup {currentYear}"` 获取对应配置格式
- **门禁统一入口 job（必须）**：CI 须包含一个 job 复用 `scripts/verify.*`（本地与 CI 同语义），避免本地能过、CI 用的却是另一套命令；该 job 失败即阻断合入
- **初始化种子门禁（两条）**：`docs-consistency`（文档一致性）+ `spec-drift`（规范漂移）；小项目只播种这两条，**不生成 `scripts/checks/` 目录**（详见 `references/gates-templates.md` §八）
- **漂移门独立 job**：`spec-drift` 在 CI 中作为**独立 job**（`level: warn` 时非阻断，只输出报告），不与 blocking 门禁混跑，便于单独观察漂移趋势
- **按门禁分级组织**：`level: blocking` 的门禁必跑；`level: warn` 的可作为独立非阻断 job 或仅输出报告
- 如果 CI 目录/文件已存在 → 跳过，不覆盖

---

## Step 5.5：门禁装配

> 规则已写在 AGENTS.md（门禁即规则），清单已生成（见 `references/step-3-docs.md` 的 Step 3.5）——本步把它们**接到提交与 CI 的触发点上并实跑验证**。新增门禁 = 写检查 + 清单加一条，装配自动生效，无需改装配脚本。

### A. 宿主选择（按优先级降级）

| 优先级 | 条件 | 宿主 |
|---|---|---|
| 1 | 项目已有任务入口 | 直接复用 `npm run <script>` / `make <target>` / `tox` / `./gradlew <task>` / `just <recipe>` |
| 2 | 有 Node 运行时 | `scripts/verify.mjs`（三平台通吃，最优） |
| 3 | 无 Node 有 Python | `scripts/verify.py` |
| 4 | 都没有（编译型语言通常有 make） | `Makefile` 目标 `verify:` |
| 5 | 兜底 | `scripts/verify.sh` + `scripts/verify.ps1` 双份（维护成本最高，最后选） |

### B. 装配点选择

| 技术栈 | pre-commit | pre-push | CI |
|---|---|---|---|
| JS/TS | husky（只跑快检查） | husky（跑全量） | 全量 + 重检查 |
| Python | `pre-commit` 框架 | 同左 | 全量 + 重检查 |
| Go / Java / Rust | Makefile / lefthook（可选） | 同左 | 全量 + 重检查（主入口） |
| 全语言 | — | — | **必须复用同一 `scripts/verify.*` 入口** |

### C. 五条硬性要求

1. **零新依赖**：门禁只允许使用项目已安装的工具，不得要求用户新装依赖（除非询问后经用户同意）
2. **生成后必须实跑**：每个生成的门禁都要本地实跑一次；跑不通的**降级为 `warn`** 或移入"建议清单"，**不得作为 `blocking` 门禁交付**
3. **负向验证**：新登记的 `blocking` 门禁必须故意制造一次违规，确认能拦住（拦不住则不得登记为 blocking）
4. **分级**：`blocking`（必过）/ `warn`（提示）；**存量项目默认全部 `warn`**，逐步升级
5. **豁免治理**：豁免须登记理由并设收敛目标（目标为零豁免）

> 装配细节与脚本模板见 `references/gates-templates.md` §四~§七。

### D. 准入门槛四问（新增门禁前必须能回答，缺一不进）

1. **可机检？** — 只有机器能稳定判定的事件才配门禁；靠人主观判断的红线强做只会假绿
2. **零新依赖？** — 只用项目已装工具，否则用户会因成本绕过门禁
3. **真发生过或有明确证据？** — 只为实际踩过的坑建门禁，凭想象设防会堆出死门禁
4. **误报率可控？** — 高频误报会让门禁被 `--no-verify` 绕过，宁可降为 `warn`

### E. 输出

装配完成后报告四项：**宿主 / 装配点 / 实跑结果 / blocking 与 warn 的条数**，并把实跑输出作为证据留档。
