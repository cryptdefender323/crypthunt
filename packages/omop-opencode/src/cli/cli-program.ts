import { Command, Option } from "commander"
import { install } from "./install"
import { configureCleanupCommand, resolveCleanupPlatform } from "./cleanup-command"
import { run } from "./run"
import { getLocalVersion } from "./get-local-version"
import { doctor, resolveDoctorTarget } from "./doctor"
import { createMcpOAuthCommand } from "./mcp-oauth"
import { configureRuntimeCommands } from "./runtime-commands"
import type { InstallArgs } from "./types"
import type { RunOptions } from "./run"
import type { GetLocalVersionOptions } from "./get-local-version/types"
import type { DoctorOptions } from "./doctor"
import packageJson from "../../../../package.json" with { type: "json" }

const VERSION = packageJson.version

const program = new Command()

type InstallCommandOptions = {
  readonly tui?: boolean
  readonly claude?: InstallArgs["claude"]
  readonly openai?: InstallArgs["openai"]
  readonly gemini?: InstallArgs["gemini"]
  readonly copilot?: InstallArgs["copilot"]
  readonly platform?: InstallArgs["platform"]
  readonly opencodeZen?: InstallArgs["opencodeZen"]
  readonly zaiCodingPlan?: InstallArgs["zaiCodingPlan"]
  readonly kimiForCoding?: InstallArgs["kimiForCoding"]
  readonly opencodeGo?: InstallArgs["opencodeGo"]
  readonly bailianCodingPlan?: InstallArgs["bailianCodingPlan"]
  readonly minimaxCnCodingPlan?: InstallArgs["minimaxCnCodingPlan"]
  readonly minimaxCodingPlan?: InstallArgs["minimaxCodingPlan"]
  readonly vercelAiGateway?: InstallArgs["vercelAiGateway"]
  readonly openclaw?: InstallArgs["openclaw"]
  readonly openclawGatewayType?: InstallArgs["openclawGatewayType"]
  readonly openclawGatewayUrl?: InstallArgs["openclawGatewayUrl"]
  readonly openclawGatewayCommand?: InstallArgs["openclawGatewayCommand"]
  readonly codexAutonomous?: InstallArgs["codexAutonomous"]
  readonly skipAuth?: boolean
}

type RootCommandOptions = {
  readonly platform?: InstallArgs["platform"]
}

export function resolveInstallArgs(
  options: InstallCommandOptions,
  invocationName: string | undefined = process.env.OMOP_INVOCATION_NAME,
): InstallArgs {
  const defaultPlatform = invocationName === "lazycodex" || invocationName === "lazycodex-ai" ? "codex" : undefined

  return {
    tui: options.tui !== false,
    claude: options.claude,
    openai: options.openai,
    gemini: options.gemini,
    copilot: options.copilot,
    platform: options.platform ?? defaultPlatform,
    opencodeZen: options.opencodeZen,
    zaiCodingPlan: options.zaiCodingPlan,
    kimiForCoding: options.kimiForCoding,
    opencodeGo: options.opencodeGo,
    bailianCodingPlan: options.bailianCodingPlan,
    minimaxCnCodingPlan: options.minimaxCnCodingPlan,
    minimaxCodingPlan: options.minimaxCodingPlan,
    vercelAiGateway: options.vercelAiGateway,
    openclaw: options.openclaw,
    openclawGatewayType: options.openclawGatewayType,
    openclawGatewayUrl: options.openclawGatewayUrl,
    openclawGatewayCommand: options.openclawGatewayCommand,
    codexAutonomous: options.codexAutonomous,
    skipAuth: options.skipAuth ?? false,
  }
}

export { resolveCleanupPlatform }

program
  .name("crypthunter")
  .description("CryptHunter — Autonomous Security Intelligence Engine")
  .version(VERSION, "-v, --version", "Show version number")
  .helpOption("-h, --help", "Display help for command")
  .addOption(new Option("--platform <platform>", "Install target platform: opencode, codex, hermes, both").choices(["opencode", "codex", "hermes", "both"]).hideHelp())
  .enablePositionalOptions()

program
  .command("install")
  .alias("setup")
  .description("Install and configure CryptHunter with interactive setup")
  .option("--no-tui", "Run in non-interactive mode (requires all options)")
  .option("--claude <value>", "Claude subscription: no, yes, max20")
  .option("--openai <value>", "OpenAI/ChatGPT subscription: no, yes (default: no)")
  .option("--gemini <value>", "Gemini integration: no, yes")
  .option("--copilot <value>", "GitHub Copilot subscription: no, yes")
  .addOption(new Option("--platform <platform>", "Install target platform: opencode, codex, hermes, both").choices(["opencode", "codex", "hermes", "both"]))
  .option("--opencode-zen <value>", "OpenCode Zen access: no, yes (default: no)")
  .option("--zai-coding-plan <value>", "Z.ai Coding Plan subscription: no, yes (default: no)")
  .option("--kimi-for-coding <value>", "Kimi For Coding subscription: no, yes (default: no)")
  .option("--opencode-go <value>", "OpenCode Go subscription: no, yes (default: no)")
  .option("--bailian-coding-plan <value>", "Bailian Coding Plan subscription: no, yes (default: no)")
  .option("--minimax-cn-coding-plan <value>", "MiniMax Coding Plan (minimaxi.com) subscription: no, yes (default: no)")
  .option("--minimax-coding-plan <value>", "MiniMax Coding Plan (minimax.io) subscription: no, yes (default: no)")
  .option("--vercel-ai-gateway <value>", "Vercel AI Gateway: no, yes (default: no)")
  .option("--openclaw <value>", "Enable OpenClaw integration: no, yes (default: no)")
  .addOption(new Option("--openclaw-gateway-type <type>", "OpenClaw outbound gateway: http, command").choices(["http", "command"]))
  .option("--openclaw-gateway-url <url>", "OpenClaw HTTP gateway URL (requires --openclaw-gateway-type=http)")
  .option("--openclaw-gateway-command <command>", "OpenClaw shell command gateway (requires --openclaw-gateway-type=command)")
  .option("--codex-autonomous", "Configure Codex with approval never, full filesystem access, and network enabled")
  .option("--no-codex-autonomous", "Leave existing Codex permission settings unchanged")
  .option("--skip-auth", "Skip authentication setup hints")
.addHelpText("after", `
Examples:
  $ crypthunter install
  $ npx lazycodex-ai install --no-tui
  $ crypthunter install --no-tui --platform=both --claude=max20 --openai=yes --gemini=yes --copilot=no
  $ crypthunter install --no-tui --claude=no --gemini=no --copilot=yes --opencode-zen=yes
  $ crypthunter install --no-tui --openclaw=yes --openclaw-gateway-type=http --openclaw-gateway-url=https://example.com/hook --claude=yes --gemini=no --copilot=no

Model Providers (Priority: Native > Copilot > OpenCode Zen > Z.ai > Kimi > Bailian > MiniMax > Vercel):
  Claude        Native anthropic/ models (Opus, Sonnet, Haiku)
  OpenAI        Native openai/ models (GPT-4o, GPT-4.1)
  Gemini        Native google/ models (Gemini 2.0 Pro, Flash)
  Copilot       github-copilot/ models (fallback)
  OpenCode Zen  opencode/ models
  Z.ai          zai-coding-plan/glm-5 (fallback)
  Kimi          kimi-for-coding/k2p5 (Cerberus/Talos fallback)
  Bailian       bailian-coding-plan/ models
  MiniMax       minimax-coding-plan/MiniMax-M3
  Vercel        vercel/ models (universal proxy, last fallback)
`)
  .action(async (options: InstallCommandOptions) => {
    const rootOptions = program.opts<RootCommandOptions>()
    const args = resolveInstallArgs({ ...options, platform: options.platform ?? rootOptions.platform })
    const exitCode = await install(args)
    process.exit(exitCode)
  })

configureCleanupCommand(program)

program
   .command("run <message>")
   .allowUnknownOption()
   .passThroughOptions()
  .description("Run opencode with todo/background task completion enforcement")
  .option("-a, --agent <name>", "Agent to use (default: from CLI/env/config, fallback: Cerberus)")
  .option("-m, --model <provider/model>", "Model override (e.g., anthropic/claude-sonnet-4)")
  .option("--mode <mode>", "Engagement mode: auto|ctf|bug-bounty|red-team|blue-team|offensive|grey-hat|forensic|reverse-engineering|mobile-pentest")
  .option("-d, --directory <path>", "Working directory")
  .option("-p, --port <port>", "Server port (attaches if port already in use)", parseInt)
  .option("--attach <url>", "Attach to existing opencode server URL")
  .option("--on-complete <command>", "Shell command to run after completion")
  .option("--json", "Output structured JSON result to stdout")
  .option("--no-timestamp", "Disable timestamp prefix in run output")
  .option("--verbose", "Show full event stream (default: messages/tools only)")
  .option("--session-id <id>", "Resume existing session instead of creating new one")
  .addHelpText("after", `
Examples:
  $ bunx oh-my-open-pentest run "Fix the bug in index.ts"
  $ bunx oh-my-open-pentest run --agent Cerberus "Implement feature X"
  $ bunx oh-my-open-pentest run --port 4321 "Fix the bug"
  $ bunx oh-my-open-pentest run --attach http://127.0.0.1:4321 "Fix the bug"
  $ bunx oh-my-open-pentest run --json "Fix the bug" | jq .sessionId
  $ bunx oh-my-open-pentest run --on-complete "notify-send Done" "Fix the bug"
  $ bunx oh-my-open-pentest run --session-id ses_abc123 "Continue the work"
  $ bunx oh-my-open-pentest run --model anthropic/claude-sonnet-4 "Fix the bug"
  $ bunx oh-my-open-pentest run --agent Cerberus --model openai/gpt-5.5 "Implement feature X"
  $ bunx oh-my-open-pentest run --mode red-team fullscan 10.0.0.1
  $ bunx oh-my-open-pentest run --mode bug-bounty fullscan https://example.com
  $ bunx oh-my-open-pentest run --mode ctf "Solve the challenge"

Agent resolution order:
  1) --agent flag
  2) OPENCODE_DEFAULT_AGENT
  3) oh-my-open-pentest.json "default_run_agent"
  4) Cerberus (fallback)

Available core agents:
  Cerberus, Scylla, Talos, Argus

Unlike 'opencode run', this command waits until:
  - All todos are completed or cancelled
  - All child sessions (background tasks) are idle
`)
  .action(async (message: string, options) => {
    if (options.port && options.attach) {
      console.error("Error: --port and --attach are mutually exclusive")
      process.exit(1)
    }
    const runOptions: RunOptions = {
      message,
      agent: options.agent,
      model: options.model,
      mode: options.mode,
      directory: options.directory,
      port: options.port,
      attach: options.attach,
      onComplete: options.onComplete,
      json: options.json ?? false,
      timestamp: options.timestamp ?? true,
      verbose: options.verbose ?? false,
      sessionId: options.sessionId,
    }
    const exitCode = await run(runOptions)
    process.exit(exitCode)
  })

program
  .command("get-local-version")
  .description("Show current installed version and check for updates")
  .option("-d, --directory <path>", "Working directory to check config from")
  .option("--json", "Output in JSON format for scripting")
  .addHelpText("after", `
Examples:
  $ bunx oh-my-open-pentest get-local-version
  $ bunx oh-my-open-pentest get-local-version --json
  $ bunx oh-my-open-pentest get-local-version --directory /path/to/project

This command shows:
  - Current installed version
  - Latest available version on npm
  - Whether you're up to date
  - Special modes (local dev, pinned version)
`)
  .action(async (options) => {
    const versionOptions: GetLocalVersionOptions = {
      directory: options.directory,
      json: options.json ?? false,
    }
    const exitCode = await getLocalVersion(versionOptions)
    process.exit(exitCode)
  })

program
  .command("doctor")
  .description("Check CryptHunter installation health and diagnose issues")
  .option("--status", "Show compact system dashboard")
  .option("--verbose", "Show detailed diagnostic information")
  .option("--json", "Output results in JSON format")
  .addHelpText("after", `
Examples:
  $ crypthunter doctor
  $ crypthunter doctor --status
  $ crypthunter doctor --verbose
  $ crypthunter doctor --json
`)
  .action(async (options) => {
    const mode = options.status ? "status" : options.verbose ? "verbose" : "default"
    const doctorOptions: DoctorOptions = {
      mode,
      json: options.json ?? false, target: resolveDoctorTarget(process.env.OMOP_INVOCATION_NAME),
    }
    const exitCode = await doctor(doctorOptions)
    process.exit(exitCode)
  })

configureRuntimeCommands(program)

program
  .command("dashboard")
  .description("Start the CryptHunter local web dashboard")
  .option("-p, --port <port>", "Dashboard port", "7474")
  .option("--opencode-port <port>", "OpenCode server port to connect to", "4096")
  .option("--no-open", "Do not automatically open browser")
  .option("-d, --directory <path>", "Working directory (engagement root)")
  .addHelpText("after", `
Examples:
  $ bunx crypthunter dashboard
  $ bunx crypthunter dashboard --port 8080
  $ bunx crypthunter dashboard --no-open
  $ bunx crypthunter dashboard --directory /path/to/engagement
`)
  .action(async (options) => {
    const { startDashboardServer } = await import("@omop/dashboard")
    startDashboardServer({
      port: parseInt(options.port, 10),
      opencodePort: parseInt(options.opencodePort, 10),
      cwd: options.directory ?? process.cwd(),
      open: options.open !== false,
    })
  })

program.addCommand(createMcpOAuthCommand())

export function runCli(): void {
  program.parse()
}
