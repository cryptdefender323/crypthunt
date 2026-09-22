import { describe, expect, test } from "bun:test"
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  enablePluginInConfig,
  ensureSkillsExternalDir,
  resolveHermesPluginSource,
  resolveRepoRoot,
  runHermesInstaller,
} from "./install-hermes"

describe("enablePluginInConfig", () => {
  test("#given empty config #when enabling omop #then writes plugins.enabled", () => {
    // given
    const input = ""
    // when
    const out = enablePluginInConfig(input, "omop")
    // then
    expect(out).toContain("plugins:")
    expect(out).toContain("enabled:")
    expect(out).toContain("- omop")
  })

  test("#given plugins block without enabled #when enabling #then injects enabled list", () => {
    // given
    const input = "plugins:\n  disabled:\n    - other\n"
    // when
    const out = enablePluginInConfig(input, "omop")
    // then
    expect(out).toContain("- omop")
    expect(out).toContain("enabled:")
  })

  test("#given already enabled #when enabling again #then no duplicate", () => {
    // given
    const input = "plugins:\n  enabled:\n    - omop\n"
    // when
    const out = enablePluginInConfig(input, "omop")
    // then
    const matches = out.match(/- omop/g) ?? []
    expect(matches.length).toBe(1)
  })
})

describe("ensureSkillsExternalDir", () => {
  test("#given no skills block #when adding path #then creates external_dirs", () => {
    // given
    const input = "model: foo\n"
    // when
    const out = ensureSkillsExternalDir(input, "/tmp/skills")
    // then
    expect(out).toContain("skills:")
    expect(out).toContain("external_dirs:")
    expect(out).toContain("/tmp/skills")
  })

  test("#given empty external_dirs list #when adding path #then expands list", () => {
    // given
    const input = "skills:\n  external_dirs: []\n"
    // when
    const out = ensureSkillsExternalDir(input, "/tmp/skills")
    // then
    expect(out).toContain("/tmp/skills")
    expect(out).not.toMatch(/external_dirs:\s*\[\s*\]/)
  })

  test("#given path already present #when adding #then unchanged", () => {
    // given
    const input = 'skills:\n  external_dirs:\n    - "/tmp/skills"\n'
    // when
    const out = ensureSkillsExternalDir(input, "/tmp/skills")
    // then
    expect(out).toBe(input)
  })
})

describe("resolveHermesPluginSource", () => {
  test("#given repo root with packages/omop-hermes/plugin #when resolve #then returns that plugin dir", () => {
    // given
    const root = resolveRepoRoot()
    // when
    const source = resolveHermesPluginSource({ repoRoot: root })
    // then
    expect(source.replace(/\\/g, "/")).toMatch(/packages\/omop-hermes\/plugin$/)
    expect(existsSync(join(source, "plugin.yaml"))).toBe(true)
  })

  test("#given no explicit root #when resolve from importer #then finds plugin.yaml", () => {
    // when
    const source = resolveHermesPluginSource()
    // then
    expect(existsSync(join(source, "plugin.yaml"))).toBe(true)
  })
})

describe("runHermesInstaller", () => {
  test("#given isolated HERMES_HOME #when install #then plugin + config land", async () => {
    // given
    const home = mkdtempSync(join(tmpdir(), "omop-hermes-"))
    try {
      // when
      const result = await runHermesInstaller({
        hermesHome: home,
        linkSkills: false,
      })
      // then
      expect(result.enabled).toBe(true)
      expect(result.pluginPath).toContain("plugins")
      expect(result.pluginPath).toContain("omop")
      const pluginYaml = readFileSync(join(result.pluginPath, "plugin.yaml"), "utf8")
      expect(pluginYaml).toContain("name: omop")
      const initPy = readFileSync(join(result.pluginPath, "__init__.py"), "utf8")
      expect(initPy).toContain("def register")
      const config = readFileSync(result.configPath, "utf8")
      expect(config).toContain("- omop")
      const meta = JSON.parse(readFileSync(join(result.pluginPath, ".omop-install.json"), "utf8"))
      expect(meta.plugin).toBe("omop")
    } finally {
      rmSync(home, { recursive: true, force: true })
    }
  })

  test("#given existing config with disabled omop #when install #then enables omop", async () => {
    // given
    const home = mkdtempSync(join(tmpdir(), "omop-hermes-"))
    mkdirSync(home, { recursive: true })
    writeFileSync(
      join(home, "config.yaml"),
      "plugins:\n  disabled:\n    - omop\n  enabled:\n    - other\n",
      "utf8",
    )
    try {
      // when
      const result = await runHermesInstaller({ hermesHome: home, linkSkills: false })
      // then
      const config = readFileSync(result.configPath, "utf8")
      expect(config).toMatch(/enabled:[\s\S]*- omop/)
    } finally {
      rmSync(home, { recursive: true, force: true })
    }
  })
})
