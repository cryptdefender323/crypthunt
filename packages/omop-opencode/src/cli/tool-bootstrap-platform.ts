import { existsSync } from "node:fs"
import { readFile, readdir } from "node:fs/promises"
import { homedir, platform } from "node:os"
import { delimiter, join, resolve } from "node:path"
import type { ToolEntry } from "@omop/pentest-core"

const goTools = ["subfinder", "httpx", "nuclei", "katana", "naabu", "ffuf", "anew"]
const pythonPackages: Readonly<Record<string, string>> = {
  pwntools: "pwntools",
  impacket: "impacket",
  certipy: "certipy-ad",
  bloodhound: "bloodhound",
  crackmapexec: "crackmapexec",
}
const commonPythonTools = ["pwntools", "impacket", "certipy"]
const debianTools = ["nmap", "sqlmap", "hashcat", "john", "gdb", "nuclei"]

export const pythonToolNames = new Set(Object.keys(pythonPackages))
export const goToolNames = new Set(goTools)

export async function readLinuxId(): Promise<string> {
  try {
    const release = await readFile("/etc/os-release", "utf8")
    return release.match(/^ID=(.*)$/m)?.[1]?.replace(/^"|"$/g, "").toLowerCase() ?? "linux"
  } catch {
    return "linux"
  }
}

export async function recommendedNames(targetPlatform: NodeJS.Platform): Promise<string[]> {
  if (targetPlatform === "darwin") return [...goTools, ...commonPythonTools, "bloodhound", "crackmapexec"]
  if (targetPlatform === "win32") return [...goTools.filter((name) => name !== "naabu"), ...commonPythonTools]
  if (targetPlatform === "linux") {
    const distro = await readLinuxId()
    if (distro === "kali" || distro === "parrot") {
      return [["subfinder", "httpx", "nuclei", "katana"], commonPythonTools].flat()
    }
    if (["debian", "ubuntu", "linuxmint", "pop"].includes(distro)) {
      return [...debianTools, ...commonPythonTools]
    }
    return [...goTools, ...commonPythonTools]
  }
  return []
}

export function venvPaths(toolsDir: string, targetPlatform: NodeJS.Platform): { root: string; bin: string; python: string } {
  const root = join(toolsDir, "python")
  const bin = targetPlatform === "win32" ? join(root, "Scripts") : join(root, "bin")
  const python = join(bin, targetPlatform === "win32" ? "python.exe" : "python3")
  return { root, bin, python }
}

export function quote(path: string): string {
  return `"${path.replaceAll('"', '\\"')}"`
}

export function localEnvironment(toolsDir: string, pythonBin: string, installDir: string): NodeJS.ProcessEnv {
  const dirs = [join(toolsDir, "bin"), pythonBin]
  const originalPath = process.env.PATH ?? ""
  return {
    ...process.env,
    CRYPTHUNTER_INSTALL_DIR: installDir,
    GOBIN: join(toolsDir, "bin"),
    VIRTUAL_ENV: join(toolsDir, "python"),
    PATH: [...dirs, originalPath].filter(Boolean).join(delimiter),
  }
}

export function toolForManagedPython(tool: ToolEntry, targetPlatform: NodeJS.Platform, python: string): ToolEntry {
  const packageName = pythonPackages[tool.tools_name]
  if (!packageName) return tool
  const command = `${quote(python)} -m pip install ${packageName}`
  const checkCommand = tool.check_installed.command.replace(/\bpython3\b/g, quote(python))
  return {
    ...tool,
    check_installed: { ...tool.check_installed, command: checkCommand },
    installation: {
      ...tool.installation,
      [targetPlatform]: { command, manager: "managed-python-venv" },
    },
  }
}

export async function hasEntries(path: string): Promise<boolean> {
  try {
    return (await readdir(path)).length > 0
  } catch {
    return false
  }
}

export async function existingTemplateDir(toolsDir: string): Promise<string | undefined> {
  const candidates = [
    process.env.NUCLEI_TEMPLATES_DIR,
    join(toolsDir, "nuclei-templates"),
    join(homedir(), "nuclei-templates"),
    join(homedir(), ".local", "nuclei-templates"),
  ].filter((value): value is string => Boolean(value))
  for (const candidate of candidates) {
    if (existsSync(candidate) && await hasEntries(candidate)) return resolve(candidate)
  }
  return undefined
}
