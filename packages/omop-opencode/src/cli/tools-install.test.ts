import { describe, expect, it } from "bun:test"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { formatToolsInstallReport, runToolsInstall } from "./tools-install"

const minimalCatalog = {
  $schema: "https://example.com/tools-catalog.schema.json",
  version: "1.0.0",
  categories: ["utility"],
  tools: [
    {
      tools_name: "demo-tool",
      description: "demo",
      category: "utility",
      command: { base: "demo-tool", flags: [], positional: [] },
      installation: {
        linux: { command: "echo install", manager: "echo" },
        darwin: { command: "echo install", manager: "echo" },
        win32: { command: "echo install", manager: "echo" },
      },
      check_installed: { command: "demo-tool --version", parse_version: "([\\d.]+)" },
      skills_loader: "none",
      phase: ["utility"],
      tags: [],
      requires_root: false,
      output_format: ["text"],
    },
  ],
}

describe("tools-install CLI runner", () => {
  it("#given catalog with unknown check command #when check mode #then reports missing + install command", async () => {
    // given
    const dir = mkdtempSync(join(tmpdir(), "omop-tools-install-"))
    const catalogPath = join(dir, "tools-catalog.json")
    writeFileSync(catalogPath, JSON.stringify(minimalCatalog))

    // when
    const { exitCode, report } = await runToolsInstall({
      mode: "check",
      catalogPath,
      tools: ["demo-tool"],
      platform: "linux",
    })

    // then
    expect(exitCode).toBe(1)
    expect(report.missing).toEqual(["demo-tool"])
    expect(report.wouldInstall?.[0]?.command).toBe("echo install")
    expect(formatToolsInstallReport(report)).toContain("would_install:")
  })

  it("#given unknown tool name #when check #then throws", async () => {
    // given
    const dir = mkdtempSync(join(tmpdir(), "omop-tools-install-"))
    const catalogPath = join(dir, "tools-catalog.json")
    writeFileSync(catalogPath, JSON.stringify(minimalCatalog))

    // when / then
    await expect(
      runToolsInstall({ mode: "check", catalogPath, tools: ["nope"] }),
    ).rejects.toThrow(/Unknown tool/)
  })
})
