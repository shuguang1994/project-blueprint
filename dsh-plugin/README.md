# Project Blueprint — DSH 插件包 (DSH Plugin)

[English](README.md) | 中文

将 Project Blueprint 技能包（`SKILL.md` + `references/`）打包为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（缩写 `dsh`）插件。DSH 采用"一切皆插件"架构，本插件以自定义 skill 根目录的形式把技能注册进 `ctx.skills`，由官方 `@deepseek-ai/dsh-skill-filesystem` 提供方加载 —— **零构建、零依赖、纯 Markdown 技能内容**。

## 安装

需要 DSH `0.1.0-rc.x` 及以上（已 `npx @deepseek-ai/dsh web` 启动过 Web UI）。

```bash
# 方式一：GitHub 仓库 tag（推荐，固定版本）
dsh plugin --profile web add 'github:shuguang1994/project-blueprint#<tag>'

# 方式二：本地路径（开发调试）
dsh plugin --profile web add D:\open-source\project-blueprint\dsh-plugin

# 方式三：从 git 下载的 tarball
dsh plugin --profile web add <path-to>/project-blueprint-dsh-1.6.0.tgz
```

安装后重启 `dsh web`，在会话输入 `/` 或描述"初始化新项目/建立开发规范"即可触发 Project Blueprint 技能。

## 原理

- `package.json` 声明 `dsh.bundle.patch: ./cordis.patch.yml`，安装时把插件挂进当前 profile。
- `cordis.patch.yml` 以包名挂载本插件（`- insert: [{ id: project-blueprint, name: project-blueprint }]`）。
- `lib/index.js` 复用官方 `FileSystemSkillProvider`，把包内 `skills/` 目录注册为 custom skill 根（rank 300，项目根之后、用户根之前）。
- `skills/project-blueprint/SKILL.md` + `references/` 为标准 Agent Skills 格式（`name`/`description` frontmatter），DSH 原生加载，`/` 命令与 description 自动触发均可用。

## 维护

技能内容的**唯一事实来源是仓库根** `SKILL.md` + `references/`。改动后发版前运行：

```bash
node dsh-plugin/scripts/sync-skill.mjs
```

它会把根目录内容同步到 `dsh-plugin/skills/project-blueprint/`，确保插件包与主技能一致。

## 通用分发（Agent Plugins v1.0.0）

仓库同时提供 `plugin.json`（Agent Plugins v1.0.0 清单）+ `skills/` 目录，任何符合该标准的客户端（如 Claude Code、Cursor、Codex 的插件机制）可将本仓库根作为便携插件包安装。

## 文件结构

```
dsh-plugin/
├── package.json        # npm 包元数据 + dsh.bundle.patch
├── cordis.patch.yml    # profile 挂载配置
├── plugin.json         # Agent Plugins v1.0.0 便携清单（跨宿主）
├── lib/                # 零构建 ESM 插件（直接加载）
│   ├── index.js
│   └── types/index.d.ts
├── skills/             # 打包的技能内容（由 sync-skill.mjs 同步）
│   └── project-blueprint/
│       ├── SKILL.md
│       └── references/
└── scripts/
    └── sync-skill.mjs  # 同步脚本
```

## 许可证

MIT。技能内容与仓库根保持一致，变更请同步更新 `README.md` / `README_CN.md` / `CHANGELOG.md`。
