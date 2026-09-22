export interface HermesInstallOptions {
  /** Override HERMES_HOME (default: ~/.hermes or $HERMES_HOME). */
  hermesHome?: string
  /** Repo root that contains packages/omop-hermes and .agents/skills. */
  repoRoot?: string
  /** When true, also set skills.external_dirs to OMOP pentest skills. */
  linkSkills?: boolean
}

export interface HermesInstallResult {
  hermesHome: string
  pluginPath: string
  configPath: string
  skillsDir: string | null
  enabled: boolean
}
