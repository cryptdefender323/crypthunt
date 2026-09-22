import type { Hooks } from "@opencode-ai/plugin"
import type { ToolEntry, ToolsCatalog } from "@omop/pentest-core"
import { checkToolInstalled, installTool } from "@omop/pentest-core"

import { getToolsCatalog } from "../../shared/tools-catalog-cache"
import { log } from "../../shared"

const SKIP_PREFIXES = new Set([
  "sudo",
  "env",
  "nohup",
  "time",
  "command",
  "nice",
  "ionice",
  "stdbuf",
  "timeout",
  "which",
  "where",
  "where.exe",
  "type",
])

const PRESENCE_CHECK_PREFIXES = new Set(["which", "where", "where.exe", "type", "command"])

const verifiedInstalled = new Set<string>()
const inFlight = new Map<string, Promise<void>>()

export type CatalogToolInstallerOptions = {
  readonly enabled?: boolean
  readonly getCatalog?: () => Promise<ToolsCatalog | null>
  readonly checkInstalled?: typeof checkToolInstalled
  readonly install?: typeof installTool
  readonly platform?: NodeJS.Platform
}

export function extractCatalogToolToken(command: string): string | null {
  let rest = command.trim()
  if (!rest) return null

  // First segment of a shell chain
  rest = rest.split(/[|;&]/)[0]?.trim() ?? rest
  if (!rest) return null

  const parts = rest.split(/\s+/).filter(Boolean)
  let i = 0

  // Skip presence-check wrappers entirely (which nmap / where.exe subfinder)
  if (parts[0] && PRESENCE_CHECK_PREFIXES.has(parts[0].toLowerCase())) {
    return null
  }

  while (i < parts.length) {
    const p = parts[i]!
    const lower = p.toLowerCase()
    if (SKIP_PREFIXES.has(lower)) {
      i += 1
      // env VAR=val …
      if (lower === "env") {
        while (i < parts.length && parts[i]!.includes("=")) i += 1
      }
      // command -v / command --…
      if (lower === "command" && i < parts.length && parts[i]!.startsWith("-")) {
        i += 1
      }
      continue
    }
    // VAR=val prefixes
    if (p.includes("=") && !p.startsWith("-")) {
      i += 1
      continue
    }
    break
  }

  const raw = parts[i]
  if (!raw || raw.startsWith("-")) return null

  // Strip path prefix
  const base = raw.replace(/^.*[/\\]/, "").replace(/\.exe$/i, "")
  if (!base || base === "cd" || base === "echo" || base === "true" || base === "false") return null
  return base
}

function findCatalogTool(catalog: ToolsCatalog, token: string): ToolEntry | undefined {
  const lower = token.toLowerCase()
  return (
    catalog.tools.find((t) => t.tools_name.toLowerCase() === lower) ??
    catalog.tools.find((t) => t.command.base.toLowerCase() === lower) ??
    catalog.tools.find((t) => t.command.base.toLowerCase().replace(/\.exe$/i, "") === lower)
  )
}

export function createCatalogToolInstallerHook(options: CatalogToolInstallerOptions = {}): Hooks {
  const enabled = options.enabled !== false
  const getCatalog = options.getCatalog ?? (() => getToolsCatalog())
  const checkInstalled = options.checkInstalled ?? checkToolInstalled
  const install = options.install ?? installTool
  const platform = options.platform ?? process.platform

  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { args: Record<string, unknown>; message?: string },
    ): Promise<void> => {
      if (!enabled) return
      if (input.tool.toLowerCase() !== "bash") return

      const command = output.args.command
      if (typeof command !== "string") return

      const token = extractCatalogToolToken(command)
      if (!token) return

      if (verifiedInstalled.has(token)) return

      const catalog = await getCatalog()
      if (!catalog) return

      const entry = findCatalogTool(catalog, token)
      if (!entry) return

      const key = entry.tools_name
      if (verifiedInstalled.has(key)) return

      // Deduplicate concurrent Bash calls for same tool
      let job = inFlight.get(key)
      if (!job) {
        job = (async () => {
          try {
            const status = await checkInstalled(entry)
            if (status.installed) {
              verifiedInstalled.add(key)
              verifiedInstalled.add(token)
              return
            }

            log("[catalog-tool-installer] missing catalog tool; installing", {
              sessionID: input.sessionID,
              tool: key,
              platform,
            })

            const result = await install(entry, platform)
            if (result.success) {
              verifiedInstalled.add(key)
              verifiedInstalled.add(token)
              log("[catalog-tool-installer] install succeeded", { tool: key })
            } else {
              log("[catalog-tool-installer] install failed", { tool: key, message: result.message })
            }
          } catch (err) {
            log("[catalog-tool-installer] install error", { tool: key, err: String(err) })
          } finally {
            inFlight.delete(key)
          }
        })()
        inFlight.set(key, job)
      }

      // Await so first use gets install attempt before Bash runs (bounded by install timeout in core)
      await job

      if (!verifiedInstalled.has(key)) {
        output.message =
          `[omop] catalog tool "${key}" missing or install failed — retry after: oh-my-open-pentest tools install -t ${key}`
      } else if (!output.message) {
        output.message = `[omop] ensured catalog tool "${key}" is installed`
      }
    },
  }
}

export function resetCatalogToolInstallerStateForTests(): void {
  verifiedInstalled.clear()
  inFlight.clear()
}
