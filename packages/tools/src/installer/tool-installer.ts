import type { ToolEntry, ToolAvailability } from "@omop/pentest-core"
import {
  checkToolInstalled as coreCheckToolInstalled,
  checkAllToolsInstalled as coreCheckAllToolsInstalled,
  getInstallCommand as coreGetInstallCommand,
  getInstallCommands as coreGetInstallCommands,
  installTool as coreInstallTool,
  getMissingTools as coreGetMissingTools,
  getInstalledTools as coreGetInstalledTools,
  type ToolInstallerDeps,
} from "@omop/pentest-core"
import { exec } from "child_process"
import { promisify } from "util"
import type { ToolPermission, ToolPermissionConfig, ToolInstallResult, ToolStatusReport } from "../types"
import { checkPermission } from "./permission-manager"

const execAsync = promisify(exec)

export const checkToolInstalled = coreCheckToolInstalled
export const checkAllToolsInstalled = coreCheckAllToolsInstalled
export const getInstallCommand = coreGetInstallCommand
export const getInstallCommands = coreGetInstallCommands
export const getMissingTools = coreGetMissingTools
export const getInstalledTools = coreGetInstalledTools

export async function installTool(
  tool: ToolEntry,
  permissionConfig: ToolPermissionConfig,
  platform: NodeJS.Platform = process.platform,
  deps?: ToolInstallerDeps,
): Promise<ToolInstallResult> {
  const permission = checkPermission(tool.tools_name, permissionConfig)

  if (permission === "deny") {
    return {
      tools_name: tool.tools_name,
      success: false,
      message: `Installation denied by permission policy for: ${tool.tools_name}`,
      permission,
    }
  }

  const result = await coreInstallTool(tool, platform, deps)
  let version: string | undefined
  if (result.success && tool.check_installed.parse_version) {
    const recheck = await coreCheckToolInstalled(tool, deps)
    version = recheck.version
  }

  return {
    tools_name: tool.tools_name,
    success: result.success,
    message: result.message,
    version,
    permission,
  }
}

export async function installToolWithSudo(
  tool: ToolEntry,
  permissionConfig: ToolPermissionConfig,
  platform: NodeJS.Platform = process.platform,
  deps?: ToolInstallerDeps,
): Promise<ToolInstallResult> {
  if (!tool.requires_root) {
    return installTool(tool, permissionConfig, platform, deps)
  }

  const permission = checkPermission(tool.tools_name, permissionConfig)

  if (permission === "deny") {
    return {
      tools_name: tool.tools_name,
      success: false,
      message: `Installation denied by permission policy for: ${tool.tools_name} (requires root)`,
      permission,
    }
  }

  const config = tool.installation[platform as keyof typeof tool.installation]
  if (!config) {
    return {
      tools_name: tool.tools_name,
      success: false,
      message: `No installation command available for platform: ${platform}`,
      permission,
    }
  }

  const run = deps?.execAsync ?? execAsync
  const sudoCommand =
    platform === "win32"
      ? `Start-Process -Verb RunAs -Wait -FilePath "${config.command.split(" ")[0]}" -ArgumentList "${config.command.split(" ").slice(1).join(" ")}"`
      : `sudo ${config.command}`

  try {
    const { stdout, stderr } = await run(sudoCommand, { timeout: 300000 })
    return {
      tools_name: tool.tools_name,
      success: true,
      message: stdout || stderr || "Installation completed (with elevated privileges)",
      permission,
    }
  } catch (error) {
    return {
      tools_name: tool.tools_name,
      success: false,
      message: error instanceof Error ? error.message : "Installation with sudo failed",
      permission,
    }
  }
}

export async function ensureToolsInstalled(
  tools: readonly ToolEntry[],
  permissionConfig: ToolPermissionConfig,
  platform: NodeJS.Platform = process.platform,
  deps?: ToolInstallerDeps,
): Promise<{
  installed: ToolInstallResult[]
  denied: ToolInstallResult[]
  missing: ToolAvailability[]
  failed: ToolInstallResult[]
}> {
  const availability = await coreCheckAllToolsInstalled(tools, deps)
  const missing = coreGetMissingTools(availability)
  const installed: ToolInstallResult[] = []
  const denied: ToolInstallResult[] = []
  const failed: ToolInstallResult[] = []

  for (const toolAvail of missing) {
    const toolEntry = tools.find((t) => t.tools_name === toolAvail.tools_name)
    if (!toolEntry) continue

    const result = toolEntry.requires_root
      ? await installToolWithSudo(toolEntry, permissionConfig, platform, deps)
      : await installTool(toolEntry, permissionConfig, platform, deps)

    if (result.permission === "deny") {
      denied.push(result)
    } else if (result.success) {
      installed.push(result)
    } else {
      failed.push(result)
    }
  }

  return {
    installed,
    denied,
    missing: coreGetMissingTools(await coreCheckAllToolsInstalled(tools, deps)),
    failed,
  }
}

export async function getToolStatusReport(
  tools: readonly ToolEntry[],
  permissionConfig: ToolPermissionConfig,
  platform: NodeJS.Platform = process.platform,
  deps?: ToolInstallerDeps,
): Promise<ToolStatusReport[]> {
  const availability = await coreCheckAllToolsInstalled(tools, deps)

  return tools.map((tool) => {
    const avail = availability.find((a) => a.tools_name === tool.tools_name)
    const permission: ToolPermission = checkPermission(tool.tools_name, permissionConfig)
    const installCmd = coreGetInstallCommand(tool, platform)

    return {
      tools_name: tool.tools_name,
      installed: avail?.installed ?? false,
      version: avail?.version,
      permission,
      requires_root: tool.requires_root,
      category: tool.category,
      phase: tool.phase,
      installable: installCmd !== null && permission === "allow",
      install_command: installCmd ?? undefined,
    }
  })
}
