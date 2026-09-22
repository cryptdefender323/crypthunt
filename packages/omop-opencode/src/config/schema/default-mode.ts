import { z } from "zod"

export const PENTEST_MODES = [
  "auto",
  "ctf",
  "bug-bounty",
  "red-team",
  "blue-team",
  "offensive",
  "grey-hat",
  "forensic",
  "reverse-engineering",
  "mobile-pentest",
] as const

export type EngagementMode = (typeof PENTEST_MODES)[number]

export const DefaultModeConfigSchema = z.object({
  /**
   * Automatically inject fullscan mode prompt on main session start
   * without requiring "fullscan"/"ulw" keyword in the message.
   * The fullscan mode system prompt is injected once per session.
   */
  fullscan: z.boolean().default(false),
  /**
   * Automatically start pentest loop on main session start
   * without requiring /pentest-loop or /pentest-loop commands.
   * When fullscan is also enabled, the loop starts in fullscan mode.
   */
  pentest_loop: z.boolean().default(false),
  /**
   * Default engagement mode for this project.
   * When set, this mode is injected into the pentest context on every session
   * without needing a keyword or --mode flag.
   * Override per-session with --mode on the CLI or by typing a mode keyword.
   *
   * @example "red-team"
   */
  engagement_mode: z.enum(PENTEST_MODES).optional(),
})

export type DefaultModeConfig = z.infer<typeof DefaultModeConfigSchema>
