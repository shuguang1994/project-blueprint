/**
 * Project Blueprint — DSH (DeepSeek Harness) plugin.
 *
 * Registers a custom skill root pointing at this package's bundled `skills/`
 * directory, reusing the official `@deepseek-ai/dsh-skill-filesystem` provider
 * (custom rank 300, scanned after project roots and before user roots).
 *
 * Zero build step: this ESM module is loaded directly by the harness, and the
 * bundled `skills/` directory is kept in sync with the repository root via
 * `scripts/sync-skill.mjs` (single source of truth = repository root).
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FileSystemSkillProvider } from "@deepseek-ai/dsh-skill-filesystem";

export const name = "project-blueprint";
export const inject = ["skills"];

const skillsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "skills");

export function apply(ctx, config = {}) {
  let provider;
  ctx.skills.registerProvider((control) => {
    provider = new FileSystemSkillProvider(ctx, control, {
      providerName: "project-blueprint",
      includeDefaultRoots: false,
      customSkillDirs: [skillsDir],
      ...config,
    });
    return provider;
  });
  ctx.effect(function* () {
    yield async () => {
      await provider?.dispose();
    };
  }, "project-blueprint skill provider");
}
