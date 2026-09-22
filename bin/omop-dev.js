#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const bun = "bun";

const builtCli = resolve(root, "dist", "cli", "index.js");
const srcCli = resolve(root, "packages", "omo-opencode", "src", "cli", "index.ts");
const target = existsSync(builtCli) ? builtCli : existsSync(srcCli) ? srcCli : null;

if (!target) {
  console.error("Could not find CLI entry point. Run 'bun run build' first.");
  process.exit(1);
}

const result = spawnSync(bun, ["run", `"${target}"`, ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: process.cwd(),
  shell: true,
  env: {
    ...process.env,
    OMOP_INVOCATION_NAME: "omop-dev",
  },
});
if (result.error) {
  console.error("Failed to run bun:", result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 0);
