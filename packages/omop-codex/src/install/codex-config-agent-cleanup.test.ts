/// <reference path="../../../../bun-test.d.ts" />
/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test"
import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { updateCodexConfig } from "./codex-config-toml"

describe("codex config managed agent cleanup", () => {
  test("#given stale managed OMO agent sections #when updating with current agent links #then removes missing managed roles", async () => {
    // given
    const root = await mkdtemp(join(tmpdir(), "omop-codex-config-stale-agents-"))
    const configPath = join(root, "config.toml")
    await writeFile(
      configPath,
      [
        "[agents.explorer]",
        'config_file = "./agents/old-explorer.toml"',
        "",
        "[agents.vanguard]",
        'config_file = "./agents/vanguard.toml"',
        "",
        "[agents.user_custom]",
        'config_file = "./agents/user-custom.toml"',
        "",
      ].join("\n"),
    )

    // when
    await updateCodexConfig({
      configPath,
      repoRoot: "/repo/packages/omop-codex",
      marketplaceName: "cerberuslabs",
      marketplaceSource: {
        sourceType: "git",
        source: "https://github.com/code-yeongyu/lazycodex.git",
        ref: "main",
      },
      pluginNames: ["omop"],
      agentConfigs: [{ name: "explorer", configFile: "./agents/explorer.toml" }],
    })

    // then
    const content = await readFile(configPath, "utf8")
    expect(content).toContain("[agents.explorer]")
    expect(content).toContain('config_file = "./agents/explorer.toml"')
    expect(content).not.toContain("[agents.vanguard]")
    expect(content).not.toContain('config_file = "./agents/vanguard.toml"')
    expect(content).toContain("[agents.user_custom]")
    expect(content).toContain('config_file = "./agents/user-custom.toml"')
  })
})
