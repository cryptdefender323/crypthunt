export type {
  ToolEntry,
  ToolsCatalog,
  ToolCategory,
  PentestPhase,
  OutputFormat,
  FlagDefinition,
  FlagType,
  PositionalArgument,
  CommandDefinition,
  PlatformInstallation,
  InstallationConfig,
  CheckInstalledConfig,
  ToolAvailability,
  CommandBuildResult,
  CommandBuildOptions,
  ToolSelectorOptions,
} from "@omop/pentest-core"

export type ToolPermission = "allow" | "deny"

export interface ToolPermissionEntry {
  readonly tools_name: string
  readonly permission: ToolPermission
  readonly reason?: string
}

export interface ToolPermissionConfig {
  readonly default: ToolPermission
  readonly overrides: readonly ToolPermissionEntry[]
}

export interface ToolInstallResult {
  readonly tools_name: string
  readonly success: boolean
  readonly message: string
  readonly version?: string
  readonly permission: ToolPermission
}

export interface ToolStatusReport {
  readonly tools_name: string
  readonly installed: boolean
  readonly version?: string
  readonly permission: ToolPermission
  readonly requires_root: boolean
  readonly category: string
  readonly phase: readonly string[]
  readonly installable: boolean
  readonly install_command?: string
}
