import type { ToolPermission, ToolPermissionConfig, ToolPermissionEntry } from "../types"

const DEFAULT_PERMISSION_CONFIG: ToolPermissionConfig = {
  default: "allow",
  overrides: []
}

export function checkPermission(
  toolName: string,
  config: ToolPermissionConfig = DEFAULT_PERMISSION_CONFIG,
): ToolPermission {
  const override = config.overrides.find(o => o.tools_name === toolName)
  return override?.permission ?? config.default
}

export function createPermissionConfig(
  defaultPermission: ToolPermission = "allow",
  overrides: readonly ToolPermissionEntry[] = [],
): ToolPermissionConfig {
  return { default: defaultPermission, overrides }
}

export function allowTool(toolName: string, reason?: string): ToolPermissionEntry {
  return { tools_name: toolName, permission: "allow", reason }
}

export function denyTool(toolName: string, reason?: string): ToolPermissionEntry {
  return { tools_name: toolName, permission: "deny", reason }
}

export function allowTools(toolNames: readonly string[]): ToolPermissionEntry[] {
  return toolNames.map(name => allowTool(name))
}

export function denyTools(toolNames: readonly string[]): ToolPermissionEntry[] {
  return toolNames.map(name => denyTool(name))
}

export function denyRootTools(): ToolPermissionEntry[] {
  return []
}

export function mergePermissionConfigs(
  base: ToolPermissionConfig,
  override: Partial<ToolPermissionConfig>,
): ToolPermissionConfig {
  const mergedOverrides = [...base.overrides]
  
  if (override.overrides) {
    for (const entry of override.overrides) {
      const existingIndex = mergedOverrides.findIndex(o => o.tools_name === entry.tools_name)
      if (existingIndex >= 0) {
        mergedOverrides[existingIndex] = entry
      } else {
        mergedOverrides.push(entry)
      }
    }
  }

  return {
    default: override.default ?? base.default,
    overrides: mergedOverrides,
  }
}

export function getDeniedTools(config: ToolPermissionConfig): string[] {
  if (config.default === "deny") {
    return []
  }
  return config.overrides
    .filter(o => o.permission === "deny")
    .map(o => o.tools_name)
}

export function getAllowedTools(config: ToolPermissionConfig, allToolNames: readonly string[]): string[] {
  if (config.default === "allow") {
    const deniedSet = new Set(getDeniedTools(config))
    return allToolNames.filter(name => !deniedSet.has(name))
  }
  return config.overrides
    .filter(o => o.permission === "allow")
    .map(o => o.tools_name)
}

export function formatPermissionReport(reports: readonly { tools_name: string; permission: ToolPermission; reason?: string }[]): string {
  const lines: string[] = ["Tool Permissions:"]
  
  for (const report of reports) {
    const icon = report.permission === "allow" ? "✓" : "✗"
    const reason = report.reason ? ` (${report.reason})` : ""
    lines.push(`  ${icon} ${report.tools_name} [${report.permission}]${reason}`)
  }
  
  return lines.join("\n")
}
