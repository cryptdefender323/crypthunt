import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { PLATFORMS } from "./build-binaries"

export const PACKAGE_NAME = "crypthunter" as const

/** Canonical platform package ids — single source for publish + workflow lists. */
export const PLATFORM_PACKAGE_IDS = PLATFORMS.map((entry) => entry.platform)

export type ReleaseBump = "major" | "minor" | "patch"

export type ResolveReleaseVersionInput = {
  readonly baseVersion: string
  readonly bump?: ReleaseBump
  readonly override?: string
}

export type ResolveReleaseVersionResult = {
  readonly version: string
  readonly distTag: string | null
  readonly baseVersion: string
}

const SEMVER_RE = /^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z]+(\.[0-9A-Za-z]+)*)?$/

export function readRootPackageVersion(packageJsonPath?: string): string {
  const path =
    packageJsonPath ??
    fileURLToPath(new URL("../package.json", import.meta.url))
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"))
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("package.json must be an object")
  }
  const version = (parsed as { version?: unknown }).version
  if (typeof version !== "string" || !SEMVER_RE.test(version)) {
    throw new Error(`package.json version must be semver, got: ${String(version)}`)
  }
  return version
}

export function bumpVersion(version: string, type: ReleaseBump): string {
  const baseVersion = version.split("-")[0] ?? version
  const [majorRaw, minorRaw, patchRaw] = baseVersion.split(".")
  const major = Number(majorRaw)
  const minor = Number(minorRaw)
  const patch = Number(patchRaw)
  if (![major, minor, patch].every((n) => Number.isInteger(n) && n >= 0)) {
    throw new Error(`Cannot bump non-semver base: ${version}`)
  }
  switch (type) {
    case "major":
      return `${major + 1}.0.0`
    case "minor":
      return `${major}.${minor + 1}.0`
    case "patch":
      return `${major}.${minor}.${patch + 1}`
  }
}

/** Prerelease `1.2.3-beta.1` → dist tag `beta`; stable → null (npm latest). */
export function getDistTag(version: string): string | null {
  if (!version.includes("-")) return null
  const pre = version.split("-")[1]
  if (pre === undefined || pre.length === 0) return "next"
  const tag = pre.split(".")[0] ?? "next"
  if (!/^[a-z][a-z0-9-]*$/.test(tag)) {
    throw new Error(`Invalid dist_tag from version ${version}: ${tag}`)
  }
  return tag
}

export function resolveReleaseVersion(input: ResolveReleaseVersionInput): ResolveReleaseVersionResult {
  const override = input.override?.trim()
  const version = override
    ? override
    : bumpVersion(input.baseVersion, input.bump ?? "patch")

  if (!SEMVER_RE.test(version)) {
    throw new Error(`Invalid version: ${version}`)
  }

  return {
    version,
    distTag: getDistTag(version),
    baseVersion: input.baseVersion,
  }
}
