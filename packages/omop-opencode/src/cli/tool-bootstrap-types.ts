export type ToolBootstrapOptions = {
  readonly installDir?: string
  readonly platform?: NodeJS.Platform
  readonly dryRun?: boolean
  readonly catalogPath?: string
}

export type ToolBootstrapReport = {
  readonly installDir: string
  readonly toolsDir: string
  readonly recommended: string[]
  readonly alreadyInstalled: string[]
  readonly installed: string[]
  readonly failed: string[]
  readonly missing: string[]
  readonly unavailable: string[]
  readonly templates: "installed" | "already-present" | "deferred" | "dry-run"
  readonly templatesDir: string
  readonly logPath: string
}
