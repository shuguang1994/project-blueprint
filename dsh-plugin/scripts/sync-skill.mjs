#!/usr/bin/env node
/**
 * Sync the DSH plugin's bundled skill with the repository root.
 *
 * Single source of truth = repository root (`SKILL.md` + `references/`).
 * Run before tagging a release so `dsh-plugin/skills/project-blueprint/`
 * always ships the current skill content.
 *
 *   node dsh-plugin/scripts/sync-skill.mjs
 */
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const target = join(repoRoot, "dsh-plugin", "skills", "project-blueprint");

const fromRefs = join(repoRoot, "references");
const toRefs = join(target, "references");
const fromSkill = join(repoRoot, "SKILL.md");
const toSkill = join(target, "SKILL.md");

mkdirSync(target, { recursive: true });
rmSync(toRefs, { recursive: true, force: true });
cpSync(fromRefs, toRefs, { recursive: true });
cpSync(fromSkill, toSkill);

// Normalize line endings so the bundled skill stays consistent across checkouts.
const normalized = readFileSync(toSkill, "utf8").replace(/\r\n/g, "\n");
if (normalized !== readFileSync(toSkill, "utf8")) {
  writeFileSync(toSkill, normalized);
}

console.log(
  `[sync-skill] synced SKILL.md + references/ -> dsh-plugin/skills/project-blueprint/ (${target})`,
);
