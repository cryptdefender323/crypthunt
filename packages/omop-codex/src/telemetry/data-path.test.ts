import { afterEach, describe, expect, it } from "bun:test"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

import {
  __resetOsProviderForTesting,
  __setOsProviderForTesting,
  getActivityStateDir,
  getDataDir,
} from "./data-path"

const originalXdgDataHome = process.env.XDG_DATA_HOME

const tempPaths: string[] = []

function createTempPath(prefix: string): string {
  const tempPath = mkdtempSync(join(tmpdir(), `${prefix}-`))
  tempPaths.push(tempPath)
  return tempPath
}

afterEach(() => {
  __resetOsProviderForTesting()

  if (originalXdgDataHome === undefined) {
    delete process.env.XDG_DATA_HOME
  } else {
    process.env.XDG_DATA_HOME = originalXdgDataHome
  }

  for (const tempPath of tempPaths.splice(0)) {
    rmSync(tempPath, { recursive: true, force: true })
  }
})

describe("telemetry data path", () => {
  it("uses XDG_DATA_HOME when the preferred path is writable", () => {
    // given
    const xdgDataHome = createTempPath("omop-codex-xdg")
    process.env.XDG_DATA_HOME = xdgDataHome

    // when
    const resolvedDataDir = getDataDir()

    // then
    expect(resolvedDataDir.startsWith(xdgDataHome)).toBe(true)
  })

  it("falls back to tmp directory when XDG_DATA_HOME points to a non-directory", () => {
    // given
    const nonDirectoryRoot = createTempPath("omop-codex-xdg-file")
    const nonDirectoryPath = join(nonDirectoryRoot, "xdg-data-home")
    writeFileSync(nonDirectoryPath, "not-a-directory", "utf-8")
    process.env.XDG_DATA_HOME = nonDirectoryPath

    // when
    const resolvedDataDir = getDataDir()

    // then
    expect(resolvedDataDir).toBe(join(tmpdir(), "omop-codex-data"))
  })

  it("uses homedir/.local/share when XDG_DATA_HOME is unset", () => {
    // given
    delete process.env.XDG_DATA_HOME
    const customHomeRoot = createTempPath("omop-codex-home")
    const customTmpRoot = createTempPath("omop-codex-tmp")
    __setOsProviderForTesting({
      homedir: () => customHomeRoot,
      tmpdir: () => customTmpRoot,
    })

    // when
    const resolvedDataDir = getDataDir()

    // then
    expect(resolvedDataDir).toBe(join(customHomeRoot, ".local", "share"))
  })

  it("returns activity state path ending with omop-codex", () => {
    // given
    const xdgDataHome = createTempPath("omop-codex-activity")
    process.env.XDG_DATA_HOME = xdgDataHome

    // when
    const activityStateDir = getActivityStateDir()

    // then
    expect(activityStateDir.endsWith(join("", "omop-codex"))).toBe(true)
  })

  it("respects injected os provider homedir override", () => {
    // given
    delete process.env.XDG_DATA_HOME
    const injectedHome = createTempPath("omop-codex-injected-home")
    const injectedTmp = createTempPath("omop-codex-injected-tmp")
    __setOsProviderForTesting({
      homedir: () => injectedHome,
      tmpdir: () => injectedTmp,
    })

    // when
    const resolvedDataDir = getDataDir()

    // then
    expect(resolvedDataDir.startsWith(injectedHome)).toBe(true)
    expect(resolvedDataDir).toBe(join(injectedHome, ".local", "share"))
  })
})
