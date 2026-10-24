import { exec } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import { homedir, platform as getPlatform } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import {
  checkAllToolsInstalled,
  ensureToolsInstalled,
  getMissingTools,
  loadToolsCatalogFromFs,
} from "@omop/pentest-core"
import { commandAvailable, createLoggedExec, ensureDebianBinutils, ensureToolchain, updateTemplates } from "./tool-bootstrap-runtime"
import {
  existingTemplateDir,
  goToolNames,
  localEnvironment,
  pythonToolNames,
  recommendedNames,
  readLinuxId,
  toolForManagedPython,
  venvPaths,
} from "./tool-bootstrap-platform"
import type { ToolBootstrapOptions, ToolBootstrapReport } from "./tool-bootstrap-types"

const execAsync = promisify(exec)

function resolveInstallDir(options: ToolBootstrapOptions): string {
  const moduleDir = dirname(fileURLToPath(import.meta.url))
  const inferred = [resolve(moduleDir, "../.."), resolve(moduleDir, "../../../..")]
    .find((candidate) => existsSync(join(candidate, "tools-catalog.json")))
  const fallback = process.env.CRYPTHUNTER_PACKAGE_ROOT ?? inferred ?? join(homedir(), ".crypthunter")
  return resolve(options.installDir ?? process.env.CRYPTHUNTER_INSTALL_DIR ?? fallback)
}

export async function bootstrapRecommendedTools(options: ToolBootstrapOptions = {}): Promise<ToolBootstrapReport> {
  const targetPlatform = options.platform ?? getPlatform()
  const installDir = resolveInstallDir(options)
  const toolsDir = join(installDir, "tools")
  const logPath = join(toolsDir, ".bootstrap.log")
  const statePath = join(toolsDir, ".bootstrap-state.json")
  const names = await recommendedNames(targetPlatform)
  const catalogPath = options.catalogPath ?? join(installDir, "tools-catalog.json")
  const catalog = await loadToolsCatalogFromFs(await import("node:fs/promises"), { catalogPath })
  const selected = names.flatMap((name) => {
    const tool = catalog.tools.find((entry) => entry.tools_name === name)
    if (!tool) return []
    if (targetPlatform === "win32" && pythonToolNames.has(tool.tools_name)) {
      return [{
        ...tool,
        check_installed: {
          ...tool.check_installed,
          command: tool.check_installed.command.replace(/\bpython3\b/g, "python"),
        },
      }]
    }
    return [tool]
  })
  const venv = venvPaths(toolsDir, targetPlatform)
  const env = localEnvironment(toolsDir, venv.bin, installDir)

  if (options.dryRun) {
    const availability = await checkAllToolsInstalled(selected, {
      execAsync: (command, execOptions) => execAsync(command, {
        timeout: execOptions?.timeout ?? 10000,
        cwd: execOptions?.cwd ?? installDir,
        env: execOptions?.env ?? env,
      }),
    })
    const existingTemplates = await existingTemplateDir(toolsDir)
    return {
      installDir,
      toolsDir,
      recommended: names,
      alreadyInstalled: availability.filter((item) => item.installed).map((item) => item.tools_name),
      installed: [],
      failed: [],
      missing: getMissingTools(availability).map((item) => item.tools_name),
      unavailable: names.filter((name) => !selected.some((tool) => tool.tools_name === name)),
      templates: "dry-run",
      templatesDir: existingTemplates ?? process.env.NUCLEI_TEMPLATES_DIR ?? join(toolsDir, "nuclei-templates"),
      logPath,
    }
  }

  await mkdir(toolsDir, { recursive: true })
  await writeFile(logPath, `CryptHunter tool bootstrap ${new Date().toISOString()}\n`, "utf8")
  const run = createLoggedExec(logPath, env, installDir)
  const initialAvailability = await checkAllToolsInstalled(selected, { execAsync: run })
  const alreadyInstalled = initialAvailability.filter((item) => item.installed).map((item) => item.tools_name)
  const missingEntries = selected.filter((tool) => !alreadyInstalled.includes(tool.tools_name))
  const pythonToolEntries = missingEntries.filter((tool) => pythonToolNames.has(tool.tools_name))
  const toolchain = await ensureToolchain(targetPlatform, installDir, logPath)
  const failed: string[] = [
    ...(!toolchain.go ? missingEntries.filter((tool) => goToolNames.has(tool.tools_name)).map((tool) => tool.tools_name) : []),
    ...(!toolchain.python ? pythonToolEntries.map((tool) => tool.tools_name) : []),
  ]

  let pycryptodomePresent = true
  const pythonForCheck = existsSync(venv.python)
    ? `"${venv.python}"`
    : targetPlatform === "win32" ? "python" : "python3"
  try {
    await run(`${pythonForCheck} -c "from Crypto.Cipher import AES"`, { cwd: installDir, env })
  } catch {
    pycryptodomePresent = false
  }

  const needsPythonEnvironment = (pythonToolEntries.length > 0 || !pycryptodomePresent) && toolchain.python
  if (needsPythonEnvironment && !existsSync(venv.python)) {
    try {
      await run(`${targetPlatform === "win32" ? "python" : "python3"} -m venv --system-site-packages "${venv.root}"`, {
        timeout: 120000,
        cwd: installDir,
        env: process.env,
      })
    } catch {
      failed.push(...pythonToolEntries.map((tool) => tool.tools_name))
    }
  }

  const pythonReady = !needsPythonEnvironment || existsSync(venv.python)
  const installableEntries = missingEntries
    .filter((tool) => {
      if (goToolNames.has(tool.tools_name)) return toolchain.go
      if (pythonToolNames.has(tool.tools_name)) return toolchain.python && pythonReady
      return true
    })
    .map((tool) => toolForManagedPython(tool, targetPlatform, venv.python))
  const installResult = await ensureToolsInstalled(installableEntries, targetPlatform, { execAsync: run })
  const installed = installResult.installed.map((item) => item.tools_name)
  failed.push(...installResult.failed.map((item) => item.tool))
  failed.push(...installResult.missing.map((item) => item.tools_name))

  if (pythonReady && !pycryptodomePresent) {
    try {
      await run(`"${venv.python}" -m pip install pycryptodome`, { timeout: 300000, cwd: installDir, env })
      installed.push("pycryptodome")
    } catch {
      failed.push("pycryptodome")
    }
  }

  const nucleiInstalled = (await checkAllToolsInstalled(
    selected.filter((tool) => tool.tools_name === "nuclei"),
    { execAsync: run },
  )).some((item) => item.installed)
  const distroId = targetPlatform === "linux" ? await readLinuxId() : ""
  if (targetPlatform === "linux" && ["debian", "ubuntu"].includes(distroId) && !await commandAvailable("objdump")) {
    if (!await ensureDebianBinutils(targetPlatform, distroId, installDir, logPath)) failed.push("binutils")
  }
  const templates = await updateTemplates(nucleiInstalled, toolsDir, installDir, env, logPath)
  const finalAvailability = await checkAllToolsInstalled(selected, { execAsync: run })
  const report: ToolBootstrapReport = {
    installDir,
    toolsDir,
    recommended: names,
    alreadyInstalled: Array.from(new Set(alreadyInstalled)),
    installed: Array.from(new Set(installed)),
    failed: Array.from(new Set(failed)),
    missing: getMissingTools(finalAvailability).map((item) => item.tools_name),
    unavailable: names.filter((name) => !selected.some((tool) => tool.tools_name === name)),
    templates: templates.status,
    templatesDir: templates.directory,
    logPath,
  }
  await writeFile(statePath, JSON.stringify({ ...report, completedAt: new Date().toISOString() }, null, 2), "utf8")
  return report
}

export function formatToolBootstrapSummary(report: ToolBootstrapReport): string {
  const deferred = new Set([...report.failed, ...report.missing]).size
  return `Tools: ${report.installed.length} installed, ${report.alreadyInstalled.length} already present, ${deferred} deferred. Nuclei templates: ${report.templates}. Details: ${report.logPath}`
}
