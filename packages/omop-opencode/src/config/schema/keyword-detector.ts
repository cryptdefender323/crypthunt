import { z } from "zod"

export const KeywordTypeSchema = z.enum(["fullscan", "team", "hyperplan", "hyperplan-fullscan", "red-team"])
export type KeywordType = z.infer<typeof KeywordTypeSchema>

export const KeywordDetectorConfigSchema = z.object({
  enabled_expansions: z.array(KeywordTypeSchema).optional(),
  disabled_keywords: z.array(KeywordTypeSchema).optional(),
})

export type KeywordDetectorConfig = z.infer<typeof KeywordDetectorConfigSchema>
