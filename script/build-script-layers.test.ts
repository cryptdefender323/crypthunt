import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url))
const packageJson = JSON.parse(readFileSync(`${repositoryRoot}/package.json`, "utf8")) as {
  scripts: Record<string, string>
}

const scripts = packageJson.scripts

function script(name: string): string {
  const value = scripts[name]
  expect(value, `missing script: ${name}`).toBeString()
  return value
}

describe("build script layers", () => {
  test("build composes vendored → adapter → assets → cli", () => {
    // given
    const build = script("build")

    // when / then
    expect(build).toBe(
      "bun run build:vendored && bun run build:adapter && bun run build:assets && bun run build:cli",
    )
  })

  test("build:dev skips vendored and cli", () => {
    // given
    const dev = script("build:dev")

    // when / then
    expect(dev).toBe("bun run build:adapter && bun run build:assets")
    expect(dev).not.toContain("build:vendored")
    expect(dev).not.toContain("build:cli")
  })

  test("layer scripts cover full product leaf steps", () => {
    // given
    const vendored = script("build:vendored")
    const adapter = script("build:adapter")
    const assets = script("build:assets")
    const cli = script("build:cli")

    // when / then
    expect(vendored).toBe("bun run script/build-vendored.ts")

    expect(adapter).toContain("packages/omop-opencode/src/index.ts")
    expect(adapter).toContain("packages/omop-opencode/src/tui.ts")
    expect(adapter).toContain("build:node-require-shim")
    expect(adapter).toContain("tsc --emitDeclarationOnly")

    expect(assets).toContain("build:shared-skills-assets")
    expect(assets).toContain("build:schema")

    expect(cli).toContain("packages/omop-opencode/src/cli/index.ts")
    expect(cli).toContain("build:cli-node")
    expect(cli).toContain("build:codex-install")
  })

  test("build-vendored.ts runs leaf packages in parallel", () => {
    // given
    const source = readFileSync(`${repositoryRoot}/script/build-vendored.ts`, "utf8")

    // when / then
    expect(source).toContain("Promise.allSettled")
    for (const leaf of [
      "packages/git-bash-mcp",
      "packages/lsp-tools-mcp",
      "packages/lsp-daemon",
      "packages/omop-codex/plugin",
    ]) {
      expect(source).toContain(leaf)
    }
  })

  test("build:all still chains full build then binaries", () => {
    expect(script("build:all")).toBe("bun run build && bun run build:binaries")
  })
})
