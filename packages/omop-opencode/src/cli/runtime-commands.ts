import type { Command } from "commander"

import { boulder } from "./boulder"
import { codexUlwLoop } from "./codex-pentest-loop"
import { refreshModelCapabilities } from "./refresh-model-capabilities"
import { runSparkShell } from "./sparkshell"
import { formatToolsInstallReport, runToolsInstall } from "./tools-install"
import { PLUGIN_NAME } from "../shared"
import packageJson from "../../../../package.json" with { type: "json" }

const VERSION = packageJson.version

export function configureRuntimeCommands(program: Command): void {
  program
    .command("refresh-model-capabilities")
    .description("Refresh the cached models.dev-based model capabilities snapshot")
    .option("-d, --directory <path>", "Working directory to read oh-my-open-pentest config from")
    .option("--source-url <url>", "Override the models.dev source URL")
    .option("--json", "Output refresh summary as JSON")
    .action(async (options: { readonly directory?: string; readonly sourceUrl?: string; readonly json?: boolean }) => {
      const exitCode = await refreshModelCapabilities({
        directory: options.directory,
        sourceUrl: options.sourceUrl,
        json: options.json ?? false,
      })
      process.exit(exitCode)
    })

  program
    .command("sparkshell [args...]")
    .allowUnknownOption()
    .passThroughOptions()
    .helpOption(false)
    .description("Run Sparkshell shell-native inspection with explicit raw fallback")
    .action(async (args: string[] = []) => {
      const exitCode = await runSparkShell(args)
      process.exit(exitCode)
    })

  program
    .command("version")
    .description("Show version information")
    .action(() => {
      console.log(`${PLUGIN_NAME} v${VERSION}`)
    })

  program
    .command("boulder")
    .description("Show boulder progress, elapsed time, and per-task statistics")
    .option("-d, --directory <path>", "Working directory")
    .option("-w, --work-id <id>", "Filter to a specific work")
    .option("--json", "Output as JSON")
    .action(async (options: { readonly directory?: string; readonly workId?: string; readonly json?: boolean }) => {
      const exitCode = await boulder({
        directory: options.directory,
        workId: options.workId,
        json: options.json ?? false,
      })
      process.exit(exitCode)
    })

  program
    .command("pentest-loop [args...]")
    .allowUnknownOption()
    .passThroughOptions()
    .description("Run the Codex LazyCodex pentest-loop CLI")
    .action(async (args: string[] = []) => {
      const exitCode = await codexUlwLoop(args)
      process.exit(exitCode)
    })

  const toolsCmd = program.command("tools").description("Pentest tools catalog: check availability and auto-install missing tools")

  toolsCmd
    .command("check")
    .description("Check which catalog tools are installed (exit 1 if any missing)")
    .option("-t, --tool <name...>", "Tool name(s) from tools-catalog.json")
    .option("--phase <phase>", "Filter by phase: recon, enumeration, exploitation, reporting")
    .option("--catalog <path>", "Path to tools-catalog.json (default: ./tools-catalog.json)")
    .option("--json", "JSON report")
    .action(async (options: {
      readonly tool?: string[]
      readonly phase?: "recon" | "enumeration" | "exploitation" | "reporting"
      readonly catalog?: string
      readonly json?: boolean
    }) => {
      try {
        const { exitCode, report } = await runToolsInstall({
          mode: "check",
          tools: options.tool,
          phase: options.phase,
          catalogPath: options.catalog,
          json: options.json ?? false,
        })
        if (options.json) {
          console.log(JSON.stringify(report, null, 2))
        } else {
          console.log(formatToolsInstallReport(report))
        }
        process.exit(exitCode)
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(2)
      }
    })

  toolsCmd
    .command("install")
    .description("Auto-install missing catalog tools for this platform")
    .option("-t, --tool <name...>", "Tool name(s) from tools-catalog.json")
    .option("--phase <phase>", "Filter by phase: recon, enumeration, exploitation, reporting")
    .option("--catalog <path>", "Path to tools-catalog.json (default: ./tools-catalog.json)")
    .option("--dry-run", "Show install commands without running them")
    .option("--json", "JSON report")
    .action(async (options: {
      readonly tool?: string[]
      readonly phase?: "recon" | "enumeration" | "exploitation" | "reporting"
      readonly catalog?: string
      readonly dryRun?: boolean
      readonly json?: boolean
    }) => {
      try {
        const { exitCode, report } = await runToolsInstall({
          mode: options.dryRun ? "check" : "install",
          tools: options.tool,
          phase: options.phase,
          catalogPath: options.catalog,
          dryRun: options.dryRun ?? false,
          json: options.json ?? false,
        })
        if (options.json) {
          console.log(JSON.stringify(report, null, 2))
        } else {
          console.log(formatToolsInstallReport(report))
        }
        process.exit(exitCode)
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(2)
      }
    })
}
