import { exec } from "node:child_process"
import { appendFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { promisify } from "node:util"
import type { ToolInstallerExec } from "@omop/pentest-core"
import type { ToolBootstrapReport } from "./tool-bootstrap-types"
import { existingTemplateDir, hasEntries, readLinuxId } from "./tool-bootstrap-platform"

const execAsync = promisify(exec)

async function appendLog(logPath: string, command: string, output: string): Promise<void> {
  await appendFile(logPath, `\n$ ${command}\n${output.trim()}\n`, "utf8")
}

export function createLoggedExec(logPath: string, env: NodeJS.ProcessEnv, cwd: string): ToolInstallerExec {
  return async (command, options) => {
    const nonInteractive = command.replace(/\bsudo\s+(?!-n\b)/g, "sudo -n ")
    try {
      const result = await execAsync(nonInteractive, {
        cwd: options?.cwd ?? cwd,
        env: options?.env ?? env,
        timeout: options?.timeout ?? 300000,
        maxBuffer: 8 * 1024 * 1024,
      })
      await appendLog(logPath, nonInteractive, `${result.stdout}\n${result.stderr}`)
      return { stdout: result.stdout, stderr: result.stderr }
    } catch (error) {
      const details = typeof error === "object" && error !== null
        ? ["message", "stdout", "stderr"].map((key) => key in error ? String(error[key as keyof typeof error] ?? "") : "").filter(Boolean).join("\n")
        : String(error)
      await appendLog(logPath, nonInteractive, details)
      throw error
    }
  }
}

export async function commandAvailable(command: string): Promise<boolean> {
  try {
    await execAsync(`${command} --version`, { timeout: 10000 })
    return true
  } catch {
    return false
  }
}

export async function ensureToolchain(
  targetPlatform: NodeJS.Platform,
  installDir: string,
  logPath: string,
): Promise<{ go: boolean; python: boolean }> {
  const pythonCommand = targetPlatform === "win32" ? "python" : "python3"
  let goAvailable = await commandAvailable("go")
  let pythonAvailable = await commandAvailable(pythonCommand)
  if (goAvailable && pythonAvailable) return { go: true, python: true }

  const distro = targetPlatform === "linux" ? await readLinuxId() : ""
  const installers: Partial<Record<NodeJS.Platform, string[]>> = {
    darwin: ["brew install go python3"],
    linux: distro === "debian" || distro === "ubuntu" || distro === "kali" || distro === "parrot"
      ? ["sudo -n apt-get install -y -qq golang-go python3 python3-pip python3-venv"]
      : distro === "fedora" || distro === "rhel"
        ? ["sudo -n dnf install -y golang python3 python3-pip"]
        : distro === "arch" || distro === "manjaro"
          ? ["sudo -n pacman -S --noconfirm go python python-pip"]
          : [],
    win32: [
      "winget install --silent --accept-source-agreements --accept-package-agreements GoLang.Go",
      "winget install --silent --accept-source-agreements --accept-package-agreements Python.Python.3.12",
    ],
  }
  const run = createLoggedExec(logPath, process.env, installDir)
  for (const command of installers[targetPlatform] ?? []) {
    if (goAvailable && pythonAvailable) break
    const installsGo = /\bgo\b|golang/i.test(command)
    const installsPython = /python/i.test(command)
    if ((!goAvailable && installsGo) || (!pythonAvailable && installsPython)) {
      try {
        await run(command, { timeout: 600000, cwd: installDir, env: process.env })
      } catch {
        continue
      }
      goAvailable = await commandAvailable("go")
      pythonAvailable = await commandAvailable(pythonCommand)
    }
  }
  await appendLog(logPath, "toolchain-preflight", `go=${goAvailable}; python=${pythonAvailable}`)
  return { go: goAvailable, python: pythonAvailable }
}

export async function ensureDebianBinutils(
  targetPlatform: NodeJS.Platform,
  distro: string,
  installDir: string,
  logPath: string,
): Promise<boolean> {
  if (targetPlatform !== "linux" || !["debian", "ubuntu"].includes(distro)) return false
  if (await commandAvailable("objdump")) return true
  const run = createLoggedExec(logPath, process.env, installDir)
  try {
    await run("sudo -n apt-get install -y -qq binutils", { timeout: 600000, cwd: installDir, env: process.env })
    return await commandAvailable("objdump")
  } catch {
    return false
  }
}

export async function updateTemplates(
  nucleiInstalled: boolean,
  toolsDir: string,
  installDir: string,
  env: NodeJS.ProcessEnv,
  logPath: string,
): Promise<{ status: ToolBootstrapReport["templates"]; directory: string }> {
  const existing = await existingTemplateDir(toolsDir)
  if (existing) return { status: "already-present", directory: existing }
  const directory = process.env.NUCLEI_TEMPLATES_DIR ?? join(toolsDir, "nuclei-templates")
  if (!nucleiInstalled) return { status: "deferred", directory }
  await mkdir(directory, { recursive: true })
  const templateEnv = { ...env, CRYPTHUNTER_INSTALL_DIR: installDir, NUCLEI_TEMPLATES_DIR: directory }
  const run = createLoggedExec(logPath, templateEnv, installDir)
  try {
    await run("nuclei -update-templates", { timeout: 600000, env: templateEnv, cwd: installDir })
    return { status: await hasEntries(directory) ? "installed" : "deferred", directory }
  } catch {
    return { status: "deferred", directory }
  }
}
