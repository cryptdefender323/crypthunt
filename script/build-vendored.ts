#!/usr/bin/env bun
import { $ } from "bun"

async function run(name: string, fn: () => Promise<unknown>): Promise<string> {
  console.log(`[build:vendored] start ${name}`)
  await fn()
  console.log(`[build:vendored] done  ${name}`)
  return name
}

const results = await Promise.allSettled([
  run("git-bash-mcp", () => $`bun run --cwd packages/git-bash-mcp build`),
  run("lsp-tools-mcp", async () => {
    await $`npm --prefix packages/lsp-tools-mcp install --ignore-scripts`
    await $`npm --prefix packages/lsp-tools-mcp run build`
  }),
  run("lsp-daemon", async () => {
    await $`npm --prefix packages/lsp-daemon install --ignore-scripts`
    await $`npm --prefix packages/lsp-daemon run build`
  }),
  run("codex-plugin", async () => {
    await $`npm --prefix packages/omop-codex/plugin install --ignore-scripts`
    await $`bun run --cwd packages/omop-codex/plugin build`
  }),
])

const failed = results.flatMap((result, index) => {
  if (result.status === "fulfilled") return []
  const names = ["git-bash-mcp", "lsp-tools-mcp", "lsp-daemon", "codex-plugin"]
  const reason = result.reason instanceof Error ? result.reason.message : String(result.reason)
  return [`${names[index] ?? index}: ${reason}`]
})

if (failed.length > 0) {
  console.error("[build:vendored] failed:\n" + failed.join("\n"))
  process.exit(1)
}

console.log("[build:vendored] all ok")
