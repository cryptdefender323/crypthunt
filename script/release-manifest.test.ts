import { describe, expect, test } from "bun:test"
import {
  PACKAGE_NAME,
  PLATFORM_PACKAGE_IDS,
  bumpVersion,
  getDistTag,
  readRootPackageVersion,
  resolveReleaseVersion,
} from "./release-manifest"
import { PLATFORMS } from "./build-binaries"

describe("release-manifest", () => {
  test("PLATFORM_PACKAGE_IDS matches build-binaries PLATFORMS", () => {
    expect([...PLATFORM_PACKAGE_IDS].sort()).toEqual(PLATFORMS.map((p) => p.platform).sort())
  })

  test("PACKAGE_NAME is primary npm identity", () => {
    expect(PACKAGE_NAME).toBe("crypthunter")
  })

  test("readRootPackageVersion reads package.json", () => {
    const version = readRootPackageVersion()
    expect(version).toMatch(/^\d+\.\d+\.\d+/)
  })

  test("bumpVersion strips prerelease base then bumps", () => {
    expect(bumpVersion("1.4.0", "patch")).toBe("1.4.1")
    expect(bumpVersion("1.4.0", "minor")).toBe("1.5.0")
    expect(bumpVersion("1.4.0", "major")).toBe("2.0.0")
    expect(bumpVersion("3.0.0-beta.7", "patch")).toBe("3.0.1")
  })

  test("getDistTag for stable and prerelease", () => {
    expect(getDistTag("1.4.1")).toBeNull()
    expect(getDistTag("3.0.0-beta.6")).toBe("beta")
    expect(getDistTag("1.0.0-rc.1")).toBe("rc")
  })

  test("resolveReleaseVersion prefers override over bump", () => {
    const result = resolveReleaseVersion({
      baseVersion: "1.4.0",
      bump: "major",
      override: "2.0.0-beta.1",
    })
    expect(result.version).toBe("2.0.0-beta.1")
    expect(result.distTag).toBe("beta")
    expect(result.baseVersion).toBe("1.4.0")
  })

  test("resolveReleaseVersion bumps from package.json base", () => {
    const result = resolveReleaseVersion({
      baseVersion: "1.4.0",
      bump: "patch",
    })
    expect(result.version).toBe("1.4.1")
    expect(result.distTag).toBeNull()
  })
})
