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
