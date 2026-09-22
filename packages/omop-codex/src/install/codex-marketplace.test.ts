import { describe, expect, test } from "bun:test"
import { mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readMarketplace, readPluginManifest, resolvePluginSource } from "./codex-marketplace"

describe("codex-marketplace", () => {
  test("reads marketplace and resolves plugin source with override", async () => {
    // given
    const root = await mkdtemp(join(tmpdir(), "omop-codex-marketplace-"))
    const pkgRoot = join(root, "packages", "omop-codex")
    const pluginRoot = join(pkgRoot, "plugin", ".codex-plugin")
    await mkdir(pluginRoot, { recursive: true })
    await writeFile(join(pkgRoot, "marketplace.json"), JSON.stringify({ name: "cerberuslabs", plugins: [{ name: "omop", source: "./plugins/omo" }] }))
    await writeFile(join(pluginRoot, "plugin.json"), JSON.stringify({ name: "omop", version: "0.1.0" }))

    // when
    const marketplace = await readMarketplace(root)
    const sourcePath = resolvePluginSource(pkgRoot, marketplace.plugins[0], { pathOverride: "./plugin" })
    const manifest = await readPluginManifest(sourcePath)

    // then
    expect(marketplace.name).toBe("cerberuslabs")
    expect(sourcePath).toBe(join(pkgRoot, "plugin"))
    expect(manifest.name).toBe("omop")
  })

  test("rejects traversal source path", async () => {
    // given
    const root = await mkdtemp(join(tmpdir(), "omop-codex-marketplace-"))
    const pkgRoot = join(root, "packages", "omop-codex")
    await mkdir(pkgRoot, { recursive: true })
    await writeFile(join(pkgRoot, "marketplace.json"), JSON.stringify({ name: "cerberuslabs", plugins: [{ name: "omop", source: "./../escape" }] }))

    // when
    const action = readMarketplace(root)

    // then
    await expect(action).rejects.toThrow("local plugin source path must stay within the marketplace root")
  })
})
