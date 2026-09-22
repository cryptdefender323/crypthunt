import { describe, expect, it } from "bun:test"
import { createPermissionConfig, denyTool } from "./permission-manager"
import { ensureToolsInstalled, getInstallCommand, installTool } from "./tool-installer"
import type { ToolEntry } from "@omop/pentest-core"
import type { ToolInstallerExec } from "@omop/pentest-core"

const fakeTool = {
  tools_name: "nmap",
  requires_root: false,
  category: "enumeration",
  phase: ["recon"],
  tags: [],
  check_installed: { command: "nmap --version", parse_version: "([\\d.]+)" },
  installation: {
    linux: { command: "apt install nmap", manager: "apt" },
    darwin: { command: "brew install nmap", manager: "brew" },
    win32: { command: "choco install nmap", manager: "choco" },
  },
  command: { base: "nmap", flags: [], positional: [] },
} as unknown as ToolEntry

describe("tools installer permission gate", () => {
  it("#given deny override #when installTool #then returns denied without installing", async () => {
    // given
    const config = createPermissionConfig("allow", [denyTool("nmap", "policy")])
    const calls: string[] = []
    const execAsync: ToolInstallerExec = async (command) => {
      calls.push(command)
      return { stdout: "", stderr: "" }
    }

    // when
    const result = await installTool(fakeTool, config, "linux", { execAsync })

    // then
    expect(result.success).toBe(false)
    expect(result.permission).toBe("deny")
    expect(result.message).toContain("denied")
    expect(calls).toEqual([])
  })

  it("#given missing allowed tool #when ensureToolsInstalled #then installs via core", async () => {
    // given
    const config = createPermissionConfig("allow")
    let present = false
    const execAsync: ToolInstallerExec = async (command) => {
      if (command.includes("--version")) {
        if (!present) throw new Error("missing")
        return { stdout: "7.94\n", stderr: "" }
      }
      present = true
      return { stdout: "installed\n", stderr: "" }
    }

    // when
    const result = await ensureToolsInstalled([fakeTool], config, "linux", { execAsync })

    // then
    expect(result.denied).toEqual([])
    expect(result.failed).toEqual([])
    expect(result.installed).toHaveLength(1)
    expect(result.installed[0]?.tools_name).toBe("nmap")
    expect(result.installed[0]?.permission).toBe("allow")
    expect(result.missing).toEqual([])
  })

  it("#given core re-export #when getInstallCommand #then matches platform install string", () => {
    // given / when
    const cmd = getInstallCommand(fakeTool, "linux")

    // then
    expect(cmd).toBe("apt install nmap")
  })
})
