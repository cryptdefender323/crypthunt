import { z } from "zod"

export const CerberusTasksConfigSchema = z.object({
  /** Absolute or relative storage path override. When set, bypasses global config dir. */
  storage_path: z.string().optional(),
  /** Force task list ID (alternative to env FULLSCAN_TASK_LIST_ID) */
  task_list_id: z.string().optional(),
  /** Enable Claude Code path compatibility mode */
  claude_code_compat: z.boolean().default(false),
})

export const CerberusConfigSchema = z.object({
  tasks: CerberusTasksConfigSchema.optional(),
})

export type CerberusTasksConfig = z.infer<typeof CerberusTasksConfigSchema>
export type CerberusConfig = z.infer<typeof CerberusConfigSchema>
