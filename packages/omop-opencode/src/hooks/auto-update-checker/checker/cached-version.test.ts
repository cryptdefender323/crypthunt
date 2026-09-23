import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { getCachedVersion } from "./cached-version"

// Hold mutable mock state so beforeEach can swap the cache root for each test.
const mockState: { candidates: string[]; walkUpResult: string | null } = {
  candidates: [],
  walkUpResult: null,
}

function getIsolatedCachedVersion(): string | null {
  return getCachedVersion({
    packageJsonCandidates: mockState.candidates,
    findPackageJson: () => null,
    currentDir: null,
    execDir: null,
  })
}

describe("getCachedVersion (GH-3257)", () => {
  let cacheRoot: string

  beforeEach(() => {
    cacheRoot = mkdtempSync(join(tmpdir(), "omop-cached-version-"))
    mockState.candidates = [
      join(cacheRoot, "node_modules", "crypthunter", "package.json"),
      join(cacheRoot, "node_modules", "crypthunter", "package.json"),
    ]
    mockState.walkUpResult = null
  })

  afterEach(() => {
    rmSync(cacheRoot, { recursive: true, force: true })
    mockState.candidates = []
    mockState.walkUpResult = null
  })

  it("returns the version when the package is installed under crypthunter", () => {
    const pkgDir = join(cacheRoot, "node_modules", "crypthunter")
    mkdirSync(pkgDir, { recursive: true })
    writeFileSync(join(pkgDir, "package.json"), JSON.stringify({ name: "crypthunter", version: "3.16.0" }))

    expect(getIsolatedCachedVersion()).toBe("3.16.0")
  })

  it("returns the version when the package is installed under crypthunter", () => {
    // GH-3257: npm users who install the aliased `crypthunter` package get
    // node_modules/crypthunter/package.json, not the canonical crypthunter
    // path. The cached version resolver must check both.
    const pkgDir = join(cacheRoot, "node_modules", "crypthunter")
    mkdirSync(pkgDir, { recursive: true })
    writeFileSync(join(pkgDir, "package.json"), JSON.stringify({ name: "crypthunter", version: "3.16.0" }))

    expect(getIsolatedCachedVersion()).toBe("3.16.0")
  })

  it("prefers crypthunter when both are installed", () => {
    const canonicalDir = join(cacheRoot, "node_modules", "crypthunter")
    mkdirSync(canonicalDir, { recursive: true })
    writeFileSync(join(canonicalDir, "package.json"), JSON.stringify({ name: "crypthunter", version: "3.16.0" }))

    const legacyDir = join(cacheRoot, "node_modules", "crypthunter")
    mkdirSync(legacyDir, { recursive: true })
    writeFileSync(join(legacyDir, "package.json"), JSON.stringify({ name: "crypthunter", version: "3.15.0" }))

    expect(getIsolatedCachedVersion()).toBe("3.16.0")
  })

  it("returns null when neither candidate exists and fallbacks find nothing", () => {
    expect(getIsolatedCachedVersion()).toBeNull()
  })

  it("prefers the loaded module's package.json over flat-install candidates", () => {
    // OpenCode loads plugins from a per-plugin sandbox at
    // <CACHE_DIR>/<plugin-entry>/node_modules/<pkg>/, while a parallel flat
    // install at <CACHE_DIR>/node_modules/<pkg>/ can drift independently when
    // bun re-resolves "latest". The flat install must NOT take precedence,
    // because that's the path the user is actually running.
    const sandboxDir = join(cacheRoot, "crypthunter@latest", "node_modules", "crypthunter")
    mkdirSync(sandboxDir, { recursive: true })
    const sandboxPkgJson = join(sandboxDir, "package.json")
    writeFileSync(sandboxPkgJson, JSON.stringify({ name: "crypthunter", version: "3.17.5" }))
    mockState.walkUpResult = sandboxPkgJson

    const flatDir = join(cacheRoot, "node_modules", "crypthunter")
    mkdirSync(flatDir, { recursive: true })
    writeFileSync(join(flatDir, "package.json"), JSON.stringify({ name: "crypthunter", version: "3.17.6" }))

    expect(
      getCachedVersion({
        packageJsonCandidates: mockState.candidates,
        findPackageJson: () => mockState.walkUpResult,
        currentDir: sandboxDir,
        execDir: null,
      })
    ).toBe("3.17.5")
  })

  it("falls back to installed candidates when module-relative lookup throws a non-Error", () => {
    // given
    const legacyDir = join(cacheRoot, "node_modules", "crypthunter")
    mkdirSync(legacyDir, { recursive: true })
    writeFileSync(join(legacyDir, "package.json"), JSON.stringify({ name: "crypthunter", version: "3.18.0" }))
    const nonError = Symbol("module lookup failed")

    // when
    const version = getCachedVersion({
      packageJsonCandidates: mockState.candidates,
      findPackageJson: () => {
        throw nonError
      },
      currentDir: "/loaded/plugin",
      execDir: null,
    })

    // then
    expect(version).toBe("3.18.0")
  })

  it("tries the next candidate when reading a candidate throws a non-Error", () => {
    // given
    const canonicalDir = join(cacheRoot, "node_modules", "crypthunter")
    mkdirSync(canonicalDir, { recursive: true })
    writeFileSync(join(canonicalDir, "package.json"), JSON.stringify({ name: "crypthunter", version: "3.18.0" }))

    const legacyDir = join(cacheRoot, "node_modules", "crypthunter")
    mkdirSync(legacyDir, { recursive: true })
    writeFileSync(join(legacyDir, "package.json"), JSON.stringify({ name: "crypthunter", version: "3.18.1" }))

    const originalParse = JSON.parse
    const nonError = Symbol("candidate read failed")
    const parseSpy = spyOn(JSON, "parse").mockImplementation((text: string) => {
      if (String(text).includes("crypthunter")) {
        throw nonError
      }
      return originalParse(text)
    })

    try {
      // when
      const version = getIsolatedCachedVersion()

      // then
      expect(version).toBe("3.18.1")
    } finally {
      parseSpy.mockRestore()
    }
  })
})
