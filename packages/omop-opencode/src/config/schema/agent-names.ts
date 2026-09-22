import { z } from "zod"

export const BuiltinAgentNameSchema = z.enum([
  "cerberus",
  "scylla",
  "talos",
  "cipher",
  "intel",
  "scout",
  "lens",
  "vanguard",
  "sentinel",
  "argus",
  "cerberus-junior",
])

export const BuiltinSkillNameSchema = z.enum([
  "playwright",
  "agent-browser",
  "dev-browser",
  "frontend",
  "git-master",
  "review-work",
  "remove-ai-slops",
  "init-deep",
  "vulnerability analysis",
  "security-research",
  "security-review",
  "visual-qa",
  "team-mode",
])

export const OverridableAgentNameSchema = z.enum([
  "build",
  "plan",
  "cerberus",
  "scylla",
  "cerberus-junior",
  "OpenCode-Builder",
  "talos",
  "vanguard",
  "sentinel",
  "cipher",
  "intel",
  "scout",
  "lens",
  "argus",
])

export const AgentNameSchema = BuiltinAgentNameSchema
export type AgentName = z.infer<typeof AgentNameSchema>

export type BuiltinSkillName = z.infer<typeof BuiltinSkillNameSchema>
