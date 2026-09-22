import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const actionPath = fileURLToPath(new URL("../.github/actions/setup-omop/action.yml", import.meta.url))
const action = readFileSync(actionPath, "utf8")

describe("setup-omop cache", () => {
  test("caches bun install cache and npm for vendored packages", () => {
    expect(action).toContain("path: ~/.bun/install/cache")
    expect(action).toContain("path: ~/.npm")
    expect(action).toContain("hashFiles('bun.lock')")
    expect(action).toContain("packages/lsp-tools-mcp/package-lock.json")
    expect(action).toContain("packages/lsp-daemon/package-lock.json")
    expect(action).toContain("--prefer-offline")
  })
})
