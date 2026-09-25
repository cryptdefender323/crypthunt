import { resolve } from "node:path"
import { promises as fs } from "node:fs"
import type { ToolsCatalog } from "@omop/pentest-core"
import { loadToolsCatalogFromFs } from "@omop/pentest-core"
import { log } from "./logger"

const DEFAULT_REMOTE_URL =
  "https://raw.githubusercontent.com/zakirkun/crypthunter/refs/heads/dev/tools-catalog.json"
const REMOTE_LOAD_TIMEOUT_MS = 1_000

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
  const controller = new AbortController()
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    const fetchPromise = fetch(url, { signal: controller.signal })
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort()
        reject(new Error(`Timed out after ${REMOTE_LOAD_TIMEOUT_MS}ms`))
      }, REMOTE_LOAD_TIMEOUT_MS)
    })
    const res = await Promise.race([fetchPromise, timeoutPromise])
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as ToolsCatalog
  } catch (err) {
    log("[tools-catalog-cache] remote catalog load failed", { err: String(err), url })
    return null
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

function getLocalCatalogPaths(options: ToolsCatalogCacheOptions, cwd: string): string[] {
  if (options.catalogPath) return [options.catalogPath]

  return [...new Set([
    resolve(cwd, "tools-catalog.json"),
    resolve(import.meta.dir, "../tools-catalog.json"),
    resolve(import.meta.dir, "../../../../tools-catalog.json"),
  ])]
}

export async function getToolsCatalog(options: ToolsCatalogCacheOptions = {}): Promise<ToolsCatalog | null> {
  if (cachedCatalog === "not-found") return null
  if (cachedCatalog !== null) return cachedCatalog
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const cwd = options.cwd ?? process.cwd()
    for (const localPath of getLocalCatalogPaths(options, cwd)) {
      const local = await loadFromLocalFile(localPath)
      if (local) {
        cachedCatalog = local
        return local
      }
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
