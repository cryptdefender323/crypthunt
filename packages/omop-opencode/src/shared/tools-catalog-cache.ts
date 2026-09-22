import { resolve } from "node:path"
import { promises as fs } from "node:fs"
import type { ToolsCatalog } from "@omop/pentest-core"
import { loadToolsCatalogFromFs } from "@omop/pentest-core"
import { log } from "./logger"

const DEFAULT_REMOTE_URL =
  "https://raw.githubusercontent.com/zakirkun/oh-my-open-pentest/refs/heads/dev/tools-catalog.json"

let cachedCatalog: ToolsCatalog | null | "not-found" = null
let loadPromise: Promise<ToolsCatalog | null> | null = null

export type ToolsCatalogCacheOptions = {
  readonly catalogPath?: string
  readonly remoteUrl?: string
  readonly cwd?: string
}

async function loadFromLocalFile(path: string): Promise<ToolsCatalog | null> {
  try {
    return await loadToolsCatalogFromFs(fs, { catalogPath: path })
  } catch {
    return null
  }
}

async function loadFromRemote(url: string): Promise<ToolsCatalog | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as ToolsCatalog
  } catch (err) {
    log("[tools-catalog-cache] remote catalog load failed", { err: String(err), url })
    return null
  }
}

export async function getToolsCatalog(options: ToolsCatalogCacheOptions = {}): Promise<ToolsCatalog | null> {
  if (cachedCatalog === "not-found") return null
  if (cachedCatalog !== null) return cachedCatalog
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const cwd = options.cwd ?? process.cwd()
    const localPath = options.catalogPath ?? resolve(cwd, "tools-catalog.json")
    const local = await loadFromLocalFile(localPath)
    if (local) {
      cachedCatalog = local
      return local
    }

    const remote = await loadFromRemote(options.remoteUrl ?? DEFAULT_REMOTE_URL)
    if (remote) {
      cachedCatalog = remote
      return remote
    }

    cachedCatalog = "not-found"
    return null
  })()

  try {
    return await loadPromise
  } finally {
    loadPromise = null
  }
}

export function resetToolsCatalogCacheForTests(): void {
  cachedCatalog = null
  loadPromise = null
}
