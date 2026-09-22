import color from "picocolors"
import { validateGatewayUrl } from "../openclaw/gateway-url-validation"
import type {
  BooleanArg,
  ClaudeSubscription,
  DetectedConfig,
  InstallArgs,
  InstallConfig,
  InstallPlatform,
  OpenClawGatewayConfig,
} from "./types"

export const SYMBOLS = {
  check: color.green("[OK]"),
  cross: color.red("[X]"),
  arrow: color.cyan("->"),
  bullet: color.dim("*"),
  info: color.blue("[i]"),
  warn: color.yellow("[!]"),
  star: color.yellow("*"),
}

const ANSI_COLOR_PATTERN = new RegExp("\u001b\\[[0-9;]*m", "g")

function formatProvider(name: string, enabled: boolean, detail?: string): string {
  const status = enabled ? SYMBOLS.check : color.dim("○")
  const label = enabled ? color.white(name) : color.dim(name)
  const suffix = detail ? color.dim(` (${detail})`) : ""
  return `  ${status} ${label}${suffix}`
}

export function formatConfigSummary(config: InstallConfig): string {
  const lines: string[] = []

  lines.push(color.bold(color.white("Configuration Summary")))
  lines.push("")
  lines.push(`  ${SYMBOLS.info} Platform: ${config.platform}`)
  if (config.hasCodex) {
    lines.push(`  ${SYMBOLS.info} Codex autonomous mode: ${config.codexAutonomous ? "enabled" : "disabled"}`)
  }
  if (config.hasHermes) {
    lines.push(`  ${SYMBOLS.info} Hermes plugin: omop → HERMES_HOME/plugins/omop`)
  }

  if (!config.hasOpenCode) return lines.join("\n")

  lines.push("")

  const claudeDetail = config.hasClaude ? (config.isMax20 ? "max20" : "standard") : undefined
  lines.push(formatProvider("Claude", config.hasClaude, claudeDetail))
  lines.push(formatProvider("OpenAI/ChatGPT", config.hasOpenAI, "GPT-5.4 for Cipher"))
  lines.push(formatProvider("Gemini", config.hasGemini))
  lines.push(formatProvider("GitHub Copilot", config.hasCopilot, "fallback"))
  lines.push(formatProvider("OpenCode Zen", config.hasOpencodeZen, "opencode/ models"))
  lines.push(formatProvider("Z.ai Coding Plan", config.hasZaiCodingPlan, "GLM fallbacks"))
  lines.push(formatProvider("Kimi For Coding", config.hasKimiForCoding, "Cerberus/Talos fallback"))
  lines.push(formatProvider("Bailian Coding Plan", config.hasBailianCodingPlan, "Qwen/GLM/Kimi fallback"))
  lines.push(formatProvider("MiniMax Coding Plan (minimaxi.com)", config.hasMinimaxCnCodingPlan, "MiniMax-M3 fallback"))
  lines.push(formatProvider("MiniMax Coding Plan (minimax.io)", config.hasMinimaxCodingPlan, "MiniMax-M3 fallback"))
  lines.push(formatProvider("Vercel AI Gateway", config.hasVercelAiGateway, "universal proxy"))

  if (config.hasOpenClaw) {
    const gatewayDetail = config.openClawGateway
      ? config.openClawGateway.type === "http"
        ? `HTTP webhook ${color.dim(config.openClawGateway.url)}`
        : `shell command ${color.dim(config.openClawGateway.command)}`
      : "gateway not configured yet"
    lines.push("")
    lines.push(`  ${SYMBOLS.info} OpenClaw: enabled ${color.dim(`(${gatewayDetail})`)}`)
  }

  lines.push("")
  lines.push(color.dim("─".repeat(40)))
  lines.push("")

  lines.push(color.bold(color.white("Model Assignment")))
  lines.push("")
  lines.push(`  ${SYMBOLS.info} Models auto-configured based on provider priority`)
  lines.push(`  ${SYMBOLS.bullet} Priority: Native > Copilot > OpenCode Zen > Z.ai > Kimi > Bailian > MiniMax > Vercel`)

  return lines.join("\n")
}

export function printHeader(isUpdate: boolean): void {
  const mode = isUpdate ? "Update" : "Install"
  const asciiBanner = [
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⠓⠶⣤⠀⠀⠀⠀⣠⠶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠇⠀⢠⡏⠀⠀⢀⡔⠉⠀⢈⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠩⠤⣄⣼⠁⠀⣠⠟⠀⠀⣠⠏⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢀⣀⣀⣀⣀⣀⣀⣀⠀⠀⠀⠁⠀⠀⠣⣤⣀⡼⠃⠀⢀⡴⠋⠈⠳⡄⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣴⣶⣿⡿⠿⠿⠟⠛⠛⠛⠛⠿⠿⣿⣿⣶⣤⣄⠀⠀⠀⠉⠀⢀⡴⠋⠀⠀⣠⠞⠁⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣾⣿⠿⠋⠉⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠻⢿⣿⣶⣄⠀⠀⠳⣄⠀⣠⠞⢁⡠⢶⡄⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⠿⠋⠀⠀⢀⣴⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢤⡈⠛⢿⣿⣦⡀⠈⠛⢡⠚⠃⠀⠀⢹⡆⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿⠟⠁⠀⠀⠀⢀⣾⠃⠀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡆⠀⠀⢻⣦⠀⠙⢿⣿⣦⡀⠈⢶⣀⡴⠞⠋⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⣠⣿⡿⠃⠀⠀⠀⠀⢀⣾⡇⢀⡄⠀⢸⡇⠀⠀⠀⠀⠀⠀⣀⠀⢸⣷⡀⠀⠀⠹⣷⡀⠀⠙⢿⣷⡀⠀⠉⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⣰⣿⡟⠀⠀⠀⠀⠀⠀⣾⣿⠃⣼⡇⠀⢸⡇⠀⠀⠀⠀⠀⠀⣿⠀⢸⣿⣷⡀⠀⢀⣾⣿⡤⠐⠊⢻⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⢠⣿⣿⣼⡇⠀⠀⠀⠀⢠⣿⠉⢠⣿⠧⠀⣸⣇⣠⡄⠀⠀⠀⠀⣿⠠⢸⡟⠹⣿⡍⠉⣿⣿⣧⠀⠀⠀⠻⣿⣶⣄⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⢸⣿⣿⡟⠀⠀⠀⠀⠀⣼⡏⢠⡿⣿⣦⣤⣿⡿⣿⡇⠀⠀⠀⢸⡿⠻⣿⣧⣤⣼⣿⡄⢸⡿⣿⡇⠀⠀⢠⣌⠛⢿⣿⣶⣤⣤⣄⡀",
    "⠀⠀⠀⣀⣤⣿⣿⠟⣀⠀⠀⠀⠀⠀⣿⢃⣿⠇⢿⣯⣿⣿⣇⣿⠁⠀⠀⠀⣾⡇⢸⣿⠃⠉⠁⠸⣿⣼⡇⢻⡇⠀⠀⠀⢿⣷⣶⣬⣭⣿⣿⣿⠇",
    "⣾⣿⣿⣿⣿⣻⣥⣾⡇⠀⠀⠀⠀⠀⣿⣿⠇⠀⠘⠿⠋⠻⠿⠿⠶⠶⠾⠿⠿⠍⢛⣧⣰⠶⢀⣀⣼⣿⣴⡸⣿⠀⠀⠀⠸⣿⣿⣿⠉⠛⠉⠀⠀",
    "⠘⠛⠿⠿⢿⣿⠉⣿⠁⠀⠀⠀⠀⢀⣿⡿⣶⣶⣶⣤⣤⣤⣀⣀⠀⠀⠀⠀⠀⠀⢀⣭⣶⣿⡿⠟⠋⠉⠀⠀⣿⠀⡀⡀⠀⣿⣿⣿⡆⠀⠀⠀⠀",
    "⠀⠀⠀⠀⣼⣿⠀⣿⠀⠀⠸⠀⠀⠸⣿⠇⠀⠀⣈⣩⣭⣿⡿⠟⠃⠀⠀⠀⠀⠀⠙⠛⠛⠛⠛⠻⠿⠷⠆⠀⣯⠀⠇⡇⠀⣿⡏⣿⣧⠀⠀⠀⠀",
    "⠀⠀⠀⠀⢿⣿⡀⣿⡆⠀⠀⠀⠀⠀⣿⠰⠿⠿⠛⠋⠉⠀⠀⢀⣴⣶⣶⣶⣶⣶⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣧⠀⠀⠀⣿⡇⣿⣿⠀⠀⠀⠀",
    "⠀⠀⠀⠀⢸⣿⡇⢻⣇⠀⠘⣰⡀⠀⣿⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⢸⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣿⠀⠀⠀⣿⣧⣿⡿⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠈⣿⣧⢸⣿⡀⠀⡿⣧⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡄⠀⠀⠀⣼⡇⠀⠀⠀⠀⠀⠀⢀⣤⣾⡟⢡⣶⠀⢠⣿⣿⣿⠃⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠹⣿⣿⣿⣷⠀⠇⢹⣷⡸⣿⣶⣦⣄⣀⡀⠀⠀⠀⣿⡇⠀⠀⢠⣿⠁⣀⣀⣠⣤⣶⣾⡿⢿⣿⡇⣼⣿⢀⣿⣿⠿⠏⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠈⠛⠛⣿⣷⣴⠀⢹⣿⣿⣿⡟⠿⠿⣿⣿⣿⣿⣾⣷⣶⣿⣿⣿⣿⡿⠿⠟⠛⠋⠉⠀⢸⣿⣿⣿⣿⣾⣿⠃⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⣿⣦⣘⣿⡿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠛⠛⠻⠿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  ].join("\n")
  console.log(color.magenta(asciiBanner))
  console.log(color.bold(color.magenta("  CryptHunter (OMOP)")) + color.dim(" — By Muhammad Zakir Ramadhan (zakirkun)"))
  console.log()
  console.log(color.bgMagenta(color.white(` CryptHunter... ${mode} `)))
  console.log()
}

export function printStep(step: number, total: number, message: string): void {
  const progress = color.dim(`[${step}/${total}]`)
  console.log(`${progress} ${message}`)
}

export function printSuccess(message: string): void {
  console.log(`${SYMBOLS.check} ${message}`)
}

export function printError(message: string): void {
  console.log(`${SYMBOLS.cross} ${color.red(message)}`)
}

export function printInfo(message: string): void {
  console.log(`${SYMBOLS.info} ${message}`)
}

export function printWarning(message: string): void {
  console.log(`${SYMBOLS.warn} ${color.yellow(message)}`)
}

export function printBox(content: string, title?: string): void {
  const lines = content.split("\n")
  const maxWidth =
    Math.max(
      ...lines.map((line) => line.replace(ANSI_COLOR_PATTERN, "").length),
      title?.length ?? 0,
    ) + 4
  const border = color.dim("─".repeat(maxWidth))

  console.log()
  if (title) {
    console.log(
      color.dim("┌─") +
        color.bold(` ${title} `) +
        color.dim("─".repeat(maxWidth - title.length - 4)) +
        color.dim("┐"),
    )
  } else {
    console.log(color.dim("┌") + border + color.dim("┐"))
  }

  for (const line of lines) {
    const stripped = line.replace(ANSI_COLOR_PATTERN, "")
    const padding = maxWidth - stripped.length
    console.log(color.dim("│") + ` ${line}${" ".repeat(padding - 1)}` + color.dim("│"))
  }

  console.log(color.dim("└") + border + color.dim("┘"))
  console.log()
}

export function validateNonTuiArgs(args: InstallArgs): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const platform = resolvePlatform(args)
  const hasOpenCode = platform === "opencode" || platform === "both"
  const hasCodexOnly = platform === "codex"
  const hasHermesOnly = platform === "hermes"
  const skipOpenCodeProviderFlags = hasCodexOnly || hasHermesOnly

  if (!skipOpenCodeProviderFlags && hasOpenCode && args.claude === undefined) {
    errors.push("--claude is required (values: no, yes, max20)")
  } else if (args.claude !== undefined && !["no", "yes", "max20"].includes(args.claude)) {
    errors.push(`Invalid --claude value: ${args.claude} (expected: no, yes, max20)`)
  }

  if (!skipOpenCodeProviderFlags && hasOpenCode && args.gemini === undefined) {
    errors.push("--gemini is required (values: no, yes)")
  } else if (args.gemini !== undefined && !["no", "yes"].includes(args.gemini)) {
    errors.push(`Invalid --gemini value: ${args.gemini} (expected: no, yes)`)
  }

  if (!skipOpenCodeProviderFlags && hasOpenCode && args.copilot === undefined) {
    errors.push("--copilot is required (values: no, yes)")
  } else if (args.copilot !== undefined && !["no", "yes"].includes(args.copilot)) {
    errors.push(`Invalid --copilot value: ${args.copilot} (expected: no, yes)`)
  }

  if (args.openai !== undefined && !["no", "yes"].includes(args.openai)) {
    errors.push(`Invalid --openai value: ${args.openai} (expected: no, yes)`)
  }

  if (args.opencodeGo !== undefined && !["no", "yes"].includes(args.opencodeGo)) {
    errors.push(`Invalid --opencode-go value: ${args.opencodeGo} (expected: no, yes)`)
  }

  if (args.opencodeZen !== undefined && !["no", "yes"].includes(args.opencodeZen)) {
    errors.push(`Invalid --opencode-zen value: ${args.opencodeZen} (expected: no, yes)`)
  }

  if (args.zaiCodingPlan !== undefined && !["no", "yes"].includes(args.zaiCodingPlan)) {
    errors.push(`Invalid --zai-coding-plan value: ${args.zaiCodingPlan} (expected: no, yes)`)
  }

  if (args.kimiForCoding !== undefined && !["no", "yes"].includes(args.kimiForCoding)) {
    errors.push(`Invalid --kimi-for-coding value: ${args.kimiForCoding} (expected: no, yes)`)
  }

  if (args.bailianCodingPlan !== undefined && !["no", "yes"].includes(args.bailianCodingPlan)) {
    errors.push(`Invalid --bailian-coding-plan value: ${args.bailianCodingPlan} (expected: no, yes)`)
  }

  if (args.minimaxCnCodingPlan !== undefined && !["no", "yes"].includes(args.minimaxCnCodingPlan)) {
    errors.push(`Invalid --minimax-cn-coding-plan value: ${args.minimaxCnCodingPlan} (expected: no, yes)`)
  }

  if (args.minimaxCodingPlan !== undefined && !["no", "yes"].includes(args.minimaxCodingPlan)) {
    errors.push(`Invalid --minimax-coding-plan value: ${args.minimaxCodingPlan} (expected: no, yes)`)
  }

  if (args.vercelAiGateway !== undefined && !["no", "yes"].includes(args.vercelAiGateway)) {
    errors.push(`Invalid --vercel-ai-gateway value: ${args.vercelAiGateway} (expected: no, yes)`)
  }

  if (args.openclaw !== undefined && !["no", "yes"].includes(args.openclaw)) {
    errors.push(`Invalid --openclaw value: ${args.openclaw} (expected: no, yes)`)
  }

  errors.push(...collectOpenClawGatewayErrors(args))

  if (hasCodexOnly || hasHermesOnly) {
    const opencodeFlagErrors = collectCodexOnlyOpenCodeFlagErrors(args, platform)
    errors.push(...opencodeFlagErrors)
  }

  return { valid: errors.length === 0, errors }
}

function resolvePlatform(args: InstallArgs): InstallPlatform {
  return args.platform ?? "opencode"
}

function collectOpenClawGatewayErrors(args: InstallArgs): string[] {
  const errors: string[] = []
  if (args.openclawGatewayType === "http" && !args.openclawGatewayUrl) {
    errors.push("--openclaw-gateway-url is required when --openclaw-gateway-type=http")
  }
  if (args.openclawGatewayType === "http" && args.openclawGatewayUrl && !validateGatewayUrl(args.openclawGatewayUrl)) {
    errors.push(`Invalid --openclaw-gateway-url: ${args.openclawGatewayUrl} (must be HTTPS, or HTTP on localhost)`)
  }
  if (args.openclawGatewayType === "command" && !args.openclawGatewayCommand) {
    errors.push("--openclaw-gateway-command is required when --openclaw-gateway-type=command")
  }
  if (!args.openclawGatewayType && (args.openclawGatewayUrl || args.openclawGatewayCommand)) {
    errors.push("--openclaw-gateway-type=<http|command> is required when a gateway url/command is set")
  }
  return errors
}

function buildOpenClawGateway(args: InstallArgs): OpenClawGatewayConfig | undefined {
  if (args.openclawGatewayType === "http" && args.openclawGatewayUrl) {
    return { type: "http", url: args.openclawGatewayUrl }
  }
  if (args.openclawGatewayType === "command" && args.openclawGatewayCommand) {
    return { type: "command", command: args.openclawGatewayCommand }
  }
  return undefined
}

function collectCodexOnlyOpenCodeFlagErrors(args: InstallArgs, platform: InstallPlatform): string[] {
  const label = `--platform=${platform}`
  const errors: string[] = []
  if (args.claude !== undefined) errors.push(`--claude cannot be used with ${label}`)
  if (args.openai !== undefined) errors.push(`--openai cannot be used with ${label}`)
  if (args.gemini !== undefined) errors.push(`--gemini cannot be used with ${label}`)
  if (args.copilot !== undefined) errors.push(`--copilot cannot be used with ${label}`)
  if (args.opencodeZen !== undefined) errors.push(`--opencode-zen cannot be used with ${label}`)
  if (args.zaiCodingPlan !== undefined) errors.push(`--zai-coding-plan cannot be used with ${label}`)
  if (args.kimiForCoding !== undefined) errors.push(`--kimi-for-coding cannot be used with ${label}`)
  if (args.opencodeGo !== undefined) errors.push(`--opencode-go cannot be used with ${label}`)
  if (args.bailianCodingPlan !== undefined) errors.push(`--bailian-coding-plan cannot be used with ${label}`)
  if (args.minimaxCnCodingPlan !== undefined) errors.push(`--minimax-cn-coding-plan cannot be used with ${label}`)
  if (args.minimaxCodingPlan !== undefined) errors.push(`--minimax-coding-plan cannot be used with ${label}`)
  if (args.vercelAiGateway !== undefined) errors.push(`--vercel-ai-gateway cannot be used with ${label}`)
  if (args.openclaw !== undefined) errors.push(`--openclaw cannot be used with ${label}`)
  if (args.openclawGatewayType !== undefined) errors.push(`--openclaw-gateway-type cannot be used with ${label}`)
  if (args.openclawGatewayUrl !== undefined) errors.push(`--openclaw-gateway-url cannot be used with ${label}`)
  if (args.openclawGatewayCommand !== undefined) errors.push(`--openclaw-gateway-command cannot be used with ${label}`)
  return errors
}

export function argsToConfig(args: InstallArgs): InstallConfig {
  const platform = resolvePlatform(args)
  const hasOpenCode = platform === "opencode" || platform === "both"
  const hasCodex = platform === "codex" || platform === "both"
  const hasHermes = platform === "hermes"

  return {
    platform,
    hasOpenCode,
    hasClaude: hasOpenCode && args.claude !== "no",
    isMax20: args.claude === "max20",
    hasOpenAI: hasOpenCode && args.openai === "yes",
    hasGemini: hasOpenCode && args.gemini === "yes",
    hasCopilot: hasOpenCode && args.copilot === "yes",
    hasCodex,
    hasHermes,
    hasOpencodeZen: hasOpenCode && args.opencodeZen === "yes",
    hasZaiCodingPlan: hasOpenCode && args.zaiCodingPlan === "yes",
    hasKimiForCoding: hasOpenCode && args.kimiForCoding === "yes",
    hasOpencodeGo: hasOpenCode && args.opencodeGo === "yes",
    hasBailianCodingPlan: hasOpenCode && args.bailianCodingPlan === "yes",
    hasMinimaxCnCodingPlan: hasOpenCode && args.minimaxCnCodingPlan === "yes",
    hasMinimaxCodingPlan: hasOpenCode && args.minimaxCodingPlan === "yes",
    hasVercelAiGateway: hasOpenCode && args.vercelAiGateway === "yes",
    hasOpenClaw: hasOpenCode && args.openclaw === "yes",
    openClawGateway: hasOpenCode && args.openclaw === "yes" ? buildOpenClawGateway(args) : undefined,
    codexAutonomous: hasCodex && args.codexAutonomous !== false,
  }
}

export function detectedToInitialValues(detected: DetectedConfig): {
  claude: ClaudeSubscription
  openai: BooleanArg
  gemini: BooleanArg
  copilot: BooleanArg
  opencodeZen: BooleanArg
  zaiCodingPlan: BooleanArg
  kimiForCoding: BooleanArg
  opencodeGo: BooleanArg
  bailianCodingPlan: BooleanArg
  minimaxCnCodingPlan: BooleanArg
  minimaxCodingPlan: BooleanArg
  vercelAiGateway: BooleanArg
} {
  let claude: ClaudeSubscription = "no"
  if (detected.hasClaude) {
    claude = detected.isMax20 ? "max20" : "yes"
  }

  return {
    claude,
    openai: detected.hasOpenAI ? "yes" : "no",
    gemini: detected.hasGemini ? "yes" : "no",
    copilot: detected.hasCopilot ? "yes" : "no",
    opencodeZen: detected.hasOpencodeZen ? "yes" : "no",
    zaiCodingPlan: detected.hasZaiCodingPlan ? "yes" : "no",
    kimiForCoding: detected.hasKimiForCoding ? "yes" : "no",
    opencodeGo: detected.hasOpencodeGo ? "yes" : "no",
    bailianCodingPlan: detected.hasBailianCodingPlan ? "yes" : "no",
    minimaxCnCodingPlan: detected.hasMinimaxCnCodingPlan ? "yes" : "no",
    minimaxCodingPlan: detected.hasMinimaxCodingPlan ? "yes" : "no",
    vercelAiGateway: detected.hasVercelAiGateway ? "yes" : "no",
  }
}
