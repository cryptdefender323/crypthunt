import { z } from "zod"

export const BuiltinCommandNameSchema = z.enum([
  "pentest-loop",
  "ulw-loop",
  "cancel-pentest-loop",
  "refactor",
  "start-work",
  "stop-continuation",
  "remove-ai-slops",
  "hyperplan",
])

export type BuiltinCommandName = z.infer<typeof BuiltinCommandNameSchema>
