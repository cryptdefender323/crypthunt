import { describe, expect, it, beforeEach } from "bun:test"
import type { ToolEntry, ToolsCatalog } from "@omop/pentest-core"
import {
  createCatalogToolInstallerHook,
  extractCatalogToolToken,
  resetCatalogToolInstallerStateForTests,
} from "./hook"

const nmapEntry = {
  tools_name: "nmap",
  description: "scanner",
  category: "enumeration",
  command: { base: "nmap", flags: [], positional: [] },
  installation: {
    linux: { command: "echo install-nmap", manager: "echo" },
    win32: { command: "echo install-nmap", manager: "echo" },
  },
  check_installed: { command: "nmap --version", parse_version: "([\\d.]+)" },
  skills_loader: "none",
  phase: ["enumeration"],
  tags: [],
  requires_root: false,
  output_format: ["text"],
} as unknown as ToolEntry

const catalog: ToolsCatalog = {
  $schema: "x",
  version: "1",
  categories: ["enumeration"],
  tools: [nmapEntry],
} as unknown as ToolsCatalog

describe("extractCatalogToolToken", () => {
  it("#given plain nmap command #when extract #then nmap", () => {
    expect(extractCatalogToolToken("nmap -sV example.com")).toBe("nmap")
  })

  it("#given sudo prefix #when extract #then nmap", () => {
    expect(extractCatalogToolToken("sudo nmap -sV target")).toBe("nmap")
  })

  it("#given which nmap #when extract #then null (presence check)", () => {
    expect(extractCatalogToolToken("which nmap")).toBeNull()
  })

  it("#given path-prefixed binary #when extract #then basename", () => {
    expect(extractCatalogToolToken("/usr/bin/nmap -p 80 host")).toBe("nmap")
  })

  it("#given pipe chain #when extract #then first command", () => {
    expect(extractCatalogToolToken("nmap -sV host | tee out.txt")).toBe("nmap")
  })
})

describe("createCatalogToolInstallerHook", () => {
  beforeEach(() => {
    resetCatalogToolInstallerStateForTests()
  })

  it("#given missing nmap #when bash before #then installs then marks ensured", async () => {
    // given
    let installed = false
    const installs: string[] = []
    const hook = createCatalogToolInstallerHook({
      getCatalog: async () => catalog,
      checkInstalled: async () => ({
        tools_name: "nmap",
        installed,
        version: installed ? "7.0" : undefined,
      }),
      install: async (tool) => {
        installs.push(tool.tools_name)
        installed = true
        return { success: true, message: "ok" }
      },
      platform: "linux",
    })

    const output: { args: Record<string, unknown>; message?: string } = {
      args: { command: "nmap -sV example.com" },
    }

    // when
    await hook["tool.execute.before"]?.(
      { tool: "bash", sessionID: "ses_1", callID: "c1" },
      output,
    )

    // then
    expect(installs).toEqual(["nmap"])
    expect(output.message).toContain("nmap")
    expect(output.args.command).toBe("nmap -sV example.com")
  })

  it("#given install reports success but binary remains missing #when bash before #then blocks the original command", async () => {
    // given
    let checks = 0
    const output: { args: Record<string, unknown>; message?: string } = {
      args: { command: "nmap -sV example.com" },
    }
    const hook = createCatalogToolInstallerHook({
      getCatalog: async () => catalog,
      checkInstalled: async () => {
        checks += 1
        return { tools_name: "nmap", installed: false, error: "not found" }
      },
      install: async () => ({ success: true, message: "installer exited successfully" }),
      platform: "linux",
    })

    // when
    await hook["tool.execute.before"]?.(
      { tool: "bash", sessionID: "ses-unverified-install", callID: "c-unverified" },
      output,
    )

    // then
    expect(checks).toBe(2)
    expect(output.message).toContain("could not be verified")
    expect(output.args.command).not.toBe("nmap -sV example.com")
    expect(output.args.command).toContain("original command was not run")
  })

  it("#given missing exploitation tool on macOS #when first invoked #then installs and verifies it before execution", async () => {
    // given
    const sqlmapEntry = {
      ...nmapEntry,
      tools_name: "sqlmap",
      command: { base: "sqlmap", flags: [], positional: [] },
      installation: { darwin: { command: "python3 -m pip install sqlmap", manager: "pip" } },
      check_installed: { command: "sqlmap --version", parse_version: "([\\d.]+)" },
      phase: ["exploitation"],
    } as unknown as ToolEntry
    const sqlmapCatalog = { ...catalog, tools: [sqlmapEntry] }
    let installed = false
    const hook = createCatalogToolInstallerHook({
      getCatalog: async () => sqlmapCatalog,
      checkInstalled: async () => ({ tools_name: "sqlmap", installed, version: installed ? "1.8" : undefined }),
      install: async (tool, platform) => {
        expect(tool.tools_name).toBe("sqlmap")
        expect(platform).toBe("darwin")
        installed = true
        return { success: true, message: "installed" }
      },
      platform: "darwin",
    })
    const output: { args: Record<string, unknown>; message?: string } = {
      args: { command: "sqlmap --version" },
    }

    // when
    await hook["tool.execute.before"]?.(
      { tool: "bash", sessionID: "ses-sqlmap-macos", callID: "c-sqlmap" },
      output,
    )

    // then
    expect(installed).toBe(true)
    expect(output.message).toContain("ensured")
    expect(output.args.command).toBe("sqlmap --version")
  })

  it("#given already installed #when bash before #then does not install", async () => {
    // given
    const installs: string[] = []
    const hook = createCatalogToolInstallerHook({
      getCatalog: async () => catalog,
      checkInstalled: async () => ({ tools_name: "nmap", installed: true, version: "7.0" }),
      install: async (tool) => {
        installs.push(tool.tools_name)
        return { success: true, message: "ok" }
      },
    })

    // when
    await hook["tool.execute.before"]?.(
      { tool: "bash", sessionID: "ses_1", callID: "c1" },
      { args: { command: "nmap -sV x" } },
    )

    // then
    expect(installs).toEqual([])
  })

  it("#given non-bash tool #when before #then no-op", async () => {
    // given
    let called = false
    const hook = createCatalogToolInstallerHook({
      getCatalog: async () => {
        called = true
        return catalog
      },
    })

    // when
    await hook["tool.execute.before"]?.(
      { tool: "read", sessionID: "ses_1", callID: "c1" },
      { args: { path: "x" } },
    )

    // then
    expect(called).toBe(false)
  })

  it("#given unknown binary #when bash #then no install", async () => {
    // given
    const installs: string[] = []
    const hook = createCatalogToolInstallerHook({
      getCatalog: async () => catalog,
      install: async (tool) => {
        installs.push(tool.tools_name)
        return { success: true, message: "ok" }
      },
    })

    // when
    await hook["tool.execute.before"]?.(
      { tool: "bash", sessionID: "ses_1", callID: "c1" },
      { args: { command: "ls -la" } },
    )

    // then
    expect(installs).toEqual([])
  })
})
