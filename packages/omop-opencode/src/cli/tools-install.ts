import { resolve } from "node:path"
import { promises as fs } from "node:fs"
import {
  ensureToolsInstalled,
  getInstallCommand,
  getToolByName,
  loadToolsCatalogFromFs,
  selectToolsByPhase,
  type ToolEntry,
  type ToolsCatalog,
} from "@omop/pentest-core"
import {
  createPermissionConfig,
  ensureToolsInstalled as ensureToolsInstalledWithPermissions,
  type ToolPermissionConfig,
} from "@omop/tools"

export type ToolsInstallMode = "check" | "install"

export type ToolsInstallOptions = {
  readonly mode: ToolsInstallMode
  readonly tools?: readonly string[]
  readonly phase?: "recon" | "enumeration" | "exploitation" | "reporting"
  readonly catalogPath?: string
  readonly platform?: NodeJS.Platform
  readonly dryRun?: boolean
  readonly json?: boolean
  readonly permissionConfig?: ToolPermissionConfig
  readonly cwd?: string
}

export type ToolsInstallReport = {
  readonly mode: ToolsInstallMode
  readonly platform: NodeJS.Platform
  readonly selected: string[]
  readonly alreadyInstalled: string[]
  readonly missing: string[]
  readonly wouldInstall?: { tools_name: string; command: string | null }[]
  readonly installed?: string[]
  readonly denied?: string[]
  readonly failed?: { tools_name: string; message: string }[]
  readonly stillMissing?: string[]
}

function resolveCatalogPath(options: ToolsInstallOptions): string {
  if (options.catalogPath) return options.catalogPath
  const cwd = options.cwd ?? process.cwd()
  return resolve(cwd, "tools-catalog.json")
}

function selectTools(catalog: ToolsCatalog, options: ToolsInstallOptions): ToolEntry[] {
  if (options.tools && options.tools.length > 0) {
    const selected: ToolEntry[] = []
    for (const name of options.tools) {
      const entry = getToolByName(catalog, name)
      if (!entry) throw new Error(`Unknown tool in catalog: ${name}`)
      selected.push(entry)
    }
    return selected
  }
  if (options.phase) return selectToolsByPhase(catalog, options.phase)
  return [...catalog.tools]
}

export async function runToolsInstall(options: ToolsInstallOptions): Promise<{
  readonly exitCode: number
  readonly report: ToolsInstallReport
}> {
  const platform = options.platform ?? process.platform
  const catalog = await loadToolsCatalogFromFs(fs, { catalogPath: resolveCatalogPath(options) })
  const selected = selectTools(catalog, options)
  const permissionConfig = options.permissionConfig ?? createPermissionConfig("allow")

  if (options.mode === "check" || options.dryRun) {
    const { checkAllToolsInstalled, getMissingTools, getInstalledTools } = await import("@omop/pentest-core")
    const availability = await checkAllToolsInstalled(selected)
    const missing = getMissingTools(availability)
    const installed = getInstalledTools(availability)
    const report: ToolsInstallReport = {
      mode: options.mode,
      platform,
      selected: selected.map((t) => t.tools_name),
      alreadyInstalled: installed.map((t) => t.tools_name),
      missing: missing.map((t) => t.tools_name),
      wouldInstall: missing.map((m) => {
        const entry = selected.find((t) => t.tools_name === m.tools_name)
        return {
          tools_name: m.tools_name,
          command: entry ? getInstallCommand(entry, platform) : null,
        }
      }),
    }
    return { exitCode: missing.length > 0 ? 1 : 0, report }
  }

  const result = await ensureToolsInstalledWithPermissions(selected, permissionConfig, platform)
  const report: ToolsInstallReport = {
    mode: "install",
    platform,
    selected: selected.map((t) => t.tools_name),
    alreadyInstalled: [],
    missing: result.missing.map((t) => t.tools_name),
    installed: result.installed.map((t) => t.tools_name),
    denied: result.denied.map((t) => t.tools_name),
    failed: result.failed.map((t) => ({ tools_name: t.tools_name, message: t.message })),
    stillMissing: result.missing.map((t) => t.tools_name),
  }

  const exitCode =
    result.failed.length > 0 || result.missing.length > 0 || result.denied.length > 0 ? 1 : 0
  return { exitCode, report }
}

/** Core path without permission layer (for simple callers). */
export async function ensureCatalogToolsInstalled(
  tools: readonly ToolEntry[],
  platform: NodeJS.Platform = process.platform,
): Promise<Awaited<ReturnType<typeof ensureToolsInstalled>>> {
  return ensureToolsInstalled(tools, platform)
}

export function formatToolsInstallReport(report: ToolsInstallReport): string {
  const lines: string[] = [
    `mode=${report.mode} platform=${report.platform}`,
    `selected=${report.selected.length}`,
    `already_installed=${report.alreadyInstalled.length}`,
    `missing=${report.missing.length}`,
  ]
  if (report.wouldInstall && report.wouldInstall.length > 0) {
    lines.push("would_install:")
    for (const item of report.wouldInstall) {
      lines.push(`  - ${item.tools_name}: ${item.command ?? "(no install command)"}`)
    }
  }
  if (report.installed && report.installed.length > 0) {
    lines.push(`installed=${report.installed.join(",")}`)
  }
  if (report.denied && report.denied.length > 0) {
    lines.push(`denied=${report.denied.join(",")}`)
  }
  if (report.failed && report.failed.length > 0) {
    lines.push("failed:")
    for (const item of report.failed) {
      lines.push(`  - ${item.tools_name}: ${item.message}`)
    }
  }
  if (report.stillMissing && report.stillMissing.length > 0) {
    lines.push(`still_missing=${report.stillMissing.join(",")}`)
  }
  return lines.join("\n")
}
