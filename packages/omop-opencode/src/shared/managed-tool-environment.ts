import { existsSync, readFileSync } from "node:fs"
import { delimiter, dirname, join, resolve } from "node:path"
import { homedir } from "node:os"
import { fileURLToPath } from "node:url"

type BootstrapState = { readonly templates?: unknown; readonly templatesDir?: unknown }

function managedToolsDir(): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url))
  const inferred = [resolve(moduleDir, ".."), resolve(moduleDir, "../../../..")]
    .find((candidate) => existsSync(join(candidate, "tools-catalog.json")))
  const installRoot = process.env.CRYPTHUNTER_INSTALL_DIR
    ?? process.env.CRYPTHUNTER_PACKAGE_ROOT
    ?? inferred
    ?? join(homedir(), ".crypthunter")
  return join(resolve(installRoot), "tools")
}

function addExistingPaths(paths: readonly string[]): void {
  const current = process.env.PATH ?? ""
  const currentParts = current.split(delimiter).filter(Boolean)
  const compare = (value: string): string => process.platform === "win32" ? value.toLowerCase() : value
  const known = new Set(currentParts.map(compare))
  const additions = paths
    .filter(existsSync)
    .map((value) => resolve(value))
    .filter((value) => !known.has(compare(value)))
  if (additions.length > 0) process.env.PATH = [...additions, current].filter(Boolean).join(delimiter)
}

function readTemplatesPath(stateFile: string): string | undefined {
  try {
    const state = JSON.parse(readFileSync(stateFile, "utf8")) as BootstrapState
    if (state.templates !== "installed" && state.templates !== "already-present") return undefined
    if (typeof state.templatesDir !== "string" || !existsSync(state.templatesDir)) return undefined
    return resolve(state.templatesDir)
  } catch {
    return undefined
  }
}

export function applyManagedToolEnvironment(): void {
  const toolsDir = managedToolsDir()
  const pythonBin = process.platform === "win32"
    ? join(toolsDir, "python", "Scripts")
    : join(toolsDir, "python", "bin")
  addExistingPaths([join(toolsDir, "bin"), pythonBin])
  if (process.env.NUCLEI_TEMPLATES_DIR) return
  const templatesDir = readTemplatesPath(join(toolsDir, ".bootstrap-state.json"))
  if (templatesDir) process.env.NUCLEI_TEMPLATES_DIR = templatesDir
}
