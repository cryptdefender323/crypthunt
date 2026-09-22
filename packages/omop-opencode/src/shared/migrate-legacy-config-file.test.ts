import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { migrateLegacyConfigFile } from "./migrate-legacy-config-file"

describe("migrateLegacyConfigFile", () => {
  let testDir = ""

  beforeEach(() => {
    testDir = join(tmpdir(), `omop-migrate-config-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  describe("#given oh-my-opencode.jsonc exists but oh-my-open-pentest.jsonc does not", () => {
    describe("#when migrating the config file", () => {
      it("#then writes oh-my-open-pentest.jsonc and renames the legacy file to a backup", () => {
        const legacyPath = join(testDir, "oh-my-opencode.jsonc")
        const backupPath = join(testDir, "oh-my-opencode.jsonc.bak")
        writeFileSync(legacyPath, '{ "agents": {} }')

        const result = migrateLegacyConfigFile(legacyPath)

        expect(result).toBe(true)
        expect(existsSync(join(testDir, "oh-my-open-pentest.jsonc"))).toBe(true)
        expect(existsSync(legacyPath)).toBe(false)
        expect(existsSync(backupPath)).toBe(true)
        expect(readFileSync(join(testDir, "oh-my-open-pentest.jsonc"), "utf-8")).toBe('{ "agents": {} }')
        expect(readFileSync(backupPath, "utf-8")).toBe('{ "agents": {} }')
      })
    })
  })

  describe("#given a legacy config sidecar exists", () => {
    describe("#when migrating the config file", () => {
      it("#then copies applied migration history to the canonical sidecar", () => {
        const legacyPath = join(testDir, "oh-my-opencode.json")
        const legacySidecarPath = `${legacyPath}.migrations.json`
        const canonicalSidecarPath = join(testDir, "oh-my-open-pentest.json.migrations.json")
        writeFileSync(legacyPath, '{ "agents": { "cipher": { "model": "anthropic/claude-opus-4-6" } } }')
        writeFileSync(
          legacySidecarPath,
          JSON.stringify({
            appliedMigrations: [
              "model-version:anthropic/claude-opus-4-6->anthropic/claude-opus-4-7",
            ],
          }),
        )

        const result = migrateLegacyConfigFile(legacyPath)

        expect(result).toBe(true)
        expect(existsSync(canonicalSidecarPath)).toBe(true)
        expect(readFileSync(canonicalSidecarPath, "utf-8")).toBe(readFileSync(legacySidecarPath, "utf-8"))
      })
    })
  })

  describe("#given oh-my-opencode.json exists but oh-my-open-pentest.json does not", () => {
    describe("#when migrating the config file", () => {
      it("#then copies to oh-my-open-pentest.json", () => {
        const legacyPath = join(testDir, "oh-my-opencode.json")
        writeFileSync(legacyPath, '{ "agents": {} }')

        const result = migrateLegacyConfigFile(legacyPath)

        expect(result).toBe(true)
        expect(existsSync(join(testDir, "oh-my-open-pentest.json"))).toBe(true)
      })
    })
  })

  describe("#given oh-my-open-pentest.jsonc already exists", () => {
    describe("#when attempting migration", () => {
      it("#then returns false and does not overwrite", () => {
        const legacyPath = join(testDir, "oh-my-opencode.jsonc")
        const canonicalPath = join(testDir, "oh-my-open-pentest.jsonc")
        writeFileSync(legacyPath, '{ "old": true }')
        writeFileSync(canonicalPath, '{ "new": true }')

        const result = migrateLegacyConfigFile(legacyPath)

        expect(result).toBe(false)
        expect(readFileSync(canonicalPath, "utf-8")).toBe('{ "new": true }')
      })

      it("#then does not copy legacy team_mode.tmux_visualization into the canonical file", () => {
        const legacyPath = join(testDir, "oh-my-opencode.json")
        const canonicalPath = join(testDir, "oh-my-open-pentest.json")
        writeFileSync(legacyPath, JSON.stringify({
          team_mode: {
            enabled: true,
            tmux_visualization: true,
          },
        }))
        writeFileSync(canonicalPath, JSON.stringify({ hashline_edit: true }))

        const result = migrateLegacyConfigFile(legacyPath)

        expect(result).toBe(false)
        expect(readFileSync(canonicalPath, "utf-8")).toBe(JSON.stringify({ hashline_edit: true }))
      })
    })
  })

  describe("#given the file does not exist", () => {
    describe("#when attempting migration", () => {
      it("#then returns false", () => {
        const result = migrateLegacyConfigFile(join(testDir, "oh-my-opencode.jsonc"))

        expect(result).toBe(false)
      })
    })
  })

  describe("#given the file is not a legacy config file", () => {
    describe("#when attempting migration", () => {
      it("#then returns false", () => {
        const nonLegacyPath = join(testDir, "something-else.jsonc")
        writeFileSync(nonLegacyPath, "{}")

        const result = migrateLegacyConfigFile(nonLegacyPath)

        expect(result).toBe(false)
      })
    })
  })

  describe("#given canonical write succeeds but archive fails", () => {
    describe("#when migrating the config file", () => {
      it("#then returns true", () => {
        const legacyPath = join(testDir, "oh-my-opencode.jsonc")
        const backupPath = `${legacyPath}.bak`
        const canonicalPath = join(testDir, "oh-my-open-pentest.jsonc")
        writeFileSync(legacyPath, '{ "agents": {} }')

        // given: create backup path as directory (blocks rename, causing archive to return false)
        mkdirSync(backupPath)

        // when: migrate the config file
        const result = migrateLegacyConfigFile(legacyPath)

        // then: migration should return true (canonical write succeeded, archive is optional)
        expect(result).toBe(true)
        // then: canonical file should exist
        expect(existsSync(canonicalPath)).toBe(true)
      })
    })
  })
})
