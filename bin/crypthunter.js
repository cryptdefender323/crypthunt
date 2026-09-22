#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(new URL("..", import.meta.url)));
const CLI = join(ROOT, "dist", "cli", "index.js");

function findBun() {
  const home = process.env.HOME ?? "";
  for (const p of [
    join(home, ".bun", "bin", "bun"),
    "/usr/local/bin/bun",
    "/usr/bin/bun",
    "bun",
  ]) {
    try {
      if (spawnSync(p, ["--version"], { stdio: "pipe" }).status === 0) return p;
    } catch {}
  }
  return null;
}

function run(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (r.error) {
    process.stderr.write(`crypthunter: ${r.error.message}\n`);
    process.exit(2);
  }
  const sig = { SIGINT: 2, SIGILL: 4, SIGKILL: 9, SIGTERM: 15 };
  if (r.signal) process.exit(128 + (sig[r.signal] ?? 1));
  process.exit(r.status ?? 1);
}

const bun = findBun();

if (!bun) {
  process.stderr.write(
    "\ncrypthunter: Bun not found.\n" +
    "Install Bun: curl -fsSL https://bun.sh/install | bash\n" +
    "Then reload shell: exec $SHELL\n\n"
  );
  process.exit(1);
}

if (!existsSync(CLI)) {
  process.stdout.write("\n[crypthunter] Building from source (first run)...\n\n");
  const install = spawnSync(bun, ["install", "--silent"], { stdio: "inherit", cwd: ROOT });
  if (install.status !== 0) { process.stderr.write("crypthunter: bun install failed\n"); process.exit(1); }
  const build = spawnSync(bun, ["run", "build"], { stdio: "inherit", cwd: ROOT });
  if (build.status !== 0) { process.stderr.write("crypthunter: build failed\n"); process.exit(1); }
  if (!existsSync(CLI)) { process.stderr.write("crypthunter: build done but dist/cli/index.js missing\n"); process.exit(1); }
  process.stdout.write("\n[crypthunter] Build complete\n\n");
}

run(bun, ["run", CLI, ...process.argv.slice(2)], {
  CRYPTHUNTER_INVOCATION_NAME: process.env.CRYPTHUNTER_INVOCATION_NAME ?? "crypthunter",
  CRYPTHUNTER_PACKAGE_ROOT: ROOT,
});
