import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { HermesInstallOptions, HermesInstallResult } from "./types"

const PLUGIN_NAME = "omop"
const IMPORTER_DIR = dirname(fileURLToPath(import.meta.url))
const SOURCE_PACKAGE_DIR = resolve(IMPORTER_DIR, "../..")

export function defaultHermesHome(): string {
  const fromEnv = process.env.HERMES_HOME?.trim()
  if (fromEnv) return resolve(fromEnv)
  return join(homedir(), ".hermes")
}

function isHermesPluginDir(path: string): boolean {
  return existsSync(join(path, "plugin.yaml"))
}

function isRepoRootWithHermesPlugin(repoRoot: string): boolean {
  return isHermesPluginDir(join(repoRoot, "packages", "omop-hermes", "plugin"))
}

export function findRepoRootFromImporter(importerDir: string): string {
  let current = resolve(importerDir)
  for (let depth = 0; depth <= 8; depth += 1) {
    if (isRepoRootWithHermesPlugin(current)) return current
    for (const nested of [
      join(current, "node_modules", "oh-my-open-pentest"),
      join(current, "oh-my-open-pentest"),
    ]) {
      if (isRepoRootWithHermesPlugin(nested)) return nested
    }
    current = resolve(current, "..")
  }
  throw new Error(
    "Unable to locate Hermes plugin: expected packages/omop-hermes/plugin/plugin.yaml within 8 parent levels of the installer (or under node_modules/oh-my-open-pentest)",
  )
}

export function resolveRepoRoot(explicit?: string): string {
  if (explicit) return resolve(explicit)
  const wrapper = process.env.OMOP_WRAPPER_PACKAGE_ROOT?.trim()
  if (wrapper && isRepoRootWithHermesPlugin(resolve(wrapper))) return resolve(wrapper)
  try {
    return findRepoRootFromImporter(IMPORTER_DIR)
  } catch {
    if (isHermesPluginDir(join(SOURCE_PACKAGE_DIR, "plugin"))) {
      return resolve(SOURCE_PACKAGE_DIR, "../..")
    }
    if (isRepoRootWithHermesPlugin(process.cwd())) return resolve(process.cwd())
    throw new Error(
      "Unable to locate Hermes plugin: expected packages/omop-hermes/plugin/plugin.yaml (run from repo root, or set OMOP_WRAPPER_PACKAGE_ROOT)",
    )
  }
}

export function resolveHermesPluginSource(options: { repoRoot?: string } = {}): string {
  const candidates: string[] = []
  if (options.repoRoot) {
    candidates.push(join(resolve(options.repoRoot), "packages", "omop-hermes", "plugin"))
  }
  candidates.push(join(SOURCE_PACKAGE_DIR, "plugin"))
  const walkedRoot = tryResolveRepoRoot(options.repoRoot)
  if (walkedRoot) {
    candidates.push(join(walkedRoot, "packages", "omop-hermes", "plugin"))
  }
  candidates.push(join(process.cwd(), "packages", "omop-hermes", "plugin"))

  for (const candidate of candidates) {
    if (isHermesPluginDir(candidate)) return candidate
  }
  throw new Error(
    `Hermes plugin source missing: looked for plugin.yaml under packages/omop-hermes/plugin (candidates: ${candidates.join(", ")})`,
  )
}

function tryResolveRepoRoot(explicit?: string): string | null {
  try {
    return resolveRepoRoot(explicit)
  } catch {
    return null
  }
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true })
}

function copyPluginTree(source: string, dest: string): void {
  ensureDir(dirname(dest))
  if (existsSync(dest)) {
    // atomic replace: copy to temp sibling then rename
    const tmp = `${dest}.tmp-${Date.now()}`
    cpSync(source, tmp, { recursive: true })
    // windows-safe: remove dest by renaming away first if needed
    const trash = `${dest}.old-${Date.now()}`
    try {
      renameSync(dest, trash)
    } catch {
      // dest may not exist or be locked; fall through to overwrite
    }
    renameSync(tmp, dest)
  } else {
    cpSync(source, dest, { recursive: true })
  }
}

/** Minimal YAML-ish enable of plugins.enabled: [omop] without a full parser. */
export function enablePluginInConfig(configText: string, pluginName: string): string {
  const enabledListRe = /^(\s*enabled\s*:\s*)(?:\[([^\]]*)\]|)$/m
  const pluginsBlockRe = /^plugins\s*:\s*$/m

  if (!pluginsBlockRe.test(configText) && !/plugins\s*:/.test(configText)) {
    const block = [
      "",
      "plugins:",
      "  enabled:",
      `    - ${pluginName}`,
      "",
    ].join("\n")
    return `${configText.trimEnd()}\n${block}`
  }

  // If plugins.disabled lists us, strip that entry
  let next = configText.replace(
    new RegExp(`^(\\s*-\\s*)${pluginName}\\s*$`, "gm"),
    (line, indent, offset, full) => {
      // only strip under a disabled: list near plugins — keep simple: if line is bare name under disabled
      const before = full.slice(0, offset)
      const lastDisabled = before.lastIndexOf("disabled:")
      const lastEnabled = before.lastIndexOf("enabled:")
      if (lastDisabled > lastEnabled) return `${indent}# removed by omop-hermes installer: ${pluginName}`
      return line
    },
  )

  if (new RegExp(`enabled:[\\s\\S]*?-\\s*${pluginName}\\b`).test(next)) {
    return next
  }

  // inject under plugins.enabled
  if (/plugins:[\s\S]*?enabled\s*:/.test(next)) {
    next = next.replace(/(plugins:[\s\S]*?enabled\s*:\s*\n)/, `$1    - ${pluginName}\n`)
    return next
  }

  next = next.replace(/(plugins\s*:\s*\n)/, `$1  enabled:\n    - ${pluginName}\n`)
  return next
}

export function ensureSkillsExternalDir(configText: string, skillsPath: string): string {
  const normalized = skillsPath.replace(/\\/g, "/")
  if (configText.includes(normalized) || configText.includes(skillsPath)) {
    return configText
  }

  if (/^skills\s*:/m.test(configText)) {
    if (/external_dirs\s*:\s*\[\s*\]/.test(configText)) {
      return configText.replace(
        /external_dirs\s*:\s*\[\s*\]/,
        `external_dirs:\n    - ${JSON.stringify(normalized)}`,
      )
    }
    if (/external_dirs\s*:\s*\n/.test(configText)) {
      return configText.replace(
        /(external_dirs\s*:\s*\n)/,
        `$1    - ${JSON.stringify(normalized)}\n`,
      )
    }
    if (/external_dirs\s*:\s*\[/.test(configText)) {
      return configText.replace(
        /(external_dirs\s*:\s*\[)/,
        `$1${JSON.stringify(normalized)}, `,
      )
    }
    return configText.replace(
      /(skills\s*:\s*\n)/,
      `$1  external_dirs:\n    - ${JSON.stringify(normalized)}\n`,
    )
  }

  return `${configText.trimEnd()}\n\nskills:\n  external_dirs:\n    - ${JSON.stringify(normalized)}\n`
}

export async function runHermesInstaller(options: HermesInstallOptions = {}): Promise<HermesInstallResult> {
  const hermesHome = resolve(options.hermesHome ?? defaultHermesHome())
  const repoRoot = resolveRepoRoot(options.repoRoot)
  const linkSkills = options.linkSkills !== false
  const pluginSource = resolveHermesPluginSource({ repoRoot })

  const pluginsDir = join(hermesHome, "plugins")
  const pluginDest = join(pluginsDir, PLUGIN_NAME)
  ensureDir(pluginsDir)
  copyPluginTree(pluginSource, pluginDest)

  const configPath = join(hermesHome, "config.yaml")
  let configText = existsSync(configPath) ? readFileSync(configPath, "utf8") : "# managed by omop-hermes installer\n"
  configText = enablePluginInConfig(configText, PLUGIN_NAME)

  let skillsDir: string | null = null
  if (linkSkills) {
    const candidates = [
      join(repoRoot, ".agents", "skills"),
      join(repoRoot, "packages", "shared-skills", "skills"),
    ]
    for (const candidate of candidates) {
      if (existsSync(candidate) && statSync(candidate).isDirectory()) {
        skillsDir = candidate
        break
      }
    }
    if (skillsDir) {
      configText = ensureSkillsExternalDir(configText, skillsDir)
    }
  }

  ensureDir(hermesHome)
  writeFileSync(configPath, configText.endsWith("\n") ? configText : `${configText}\n`, "utf8")

  // stamp install metadata
  const metaPath = join(pluginDest, ".omop-install.json")
  writeFileSync(
    metaPath,
    `${JSON.stringify(
      {
        plugin: PLUGIN_NAME,
        installedAt: new Date().toISOString(),
        hermesHome,
        skillsDir,
        version: readPackageVersion(repoRoot),
      },
      null,
      2,
    )}\n`,
    "utf8",
  )

  return {
    hermesHome,
    pluginPath: pluginDest,
    configPath,
    skillsDir,
    enabled: true,
  }
}

function readPackageVersion(repoRoot: string): string {
  const candidates = [
    join(SOURCE_PACKAGE_DIR, "package.json"),
    join(repoRoot, "packages", "omop-hermes", "package.json"),
    join(repoRoot, "package.json"),
  ]
  for (const path of candidates) {
    try {
      if (!existsSync(path)) continue
      const pkg = JSON.parse(readFileSync(path, "utf8")) as { version?: string }
      if (typeof pkg.version === "string" && pkg.version.length > 0) return pkg.version
    } catch {
      continue
    }
  }
  return "0.0.0"
}

// silence unused import if tree-shaken differently
void copyFileSync
void readdirSync
