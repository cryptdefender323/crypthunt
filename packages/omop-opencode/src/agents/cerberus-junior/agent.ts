/**
 * Cerberus-Junior - Focused Task Executor
 *
 * Executes delegated tasks directly without spawning other agents.
 * Category-spawned executor with domain-specific configurations.
 *
 * Routing:
 * 1. GPT models (openai/*, github-copilot/gpt-*) -> gpt.ts (GPT-5.4 optimized)
 * 2. Gemini models (google/*, google-vertex/*) -> gemini.ts (Gemini-optimized)
 * 3. Default (Claude, etc.) -> default.ts (Claude-optimized)
 */

import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode } from "../types"
import { isGlmModel, isGpt5_5Model, isGptModel, isGeminiModel, isKimiK2Model, isKimiK27Model, buildClaudeThinkingConfig } from "../types"
import type { AgentOverrideConfig } from "../../config/schema"
import {
  createAgentToolRestrictions,
  migrateAgentConfig,
  type PermissionValue,
} from "../../shared/permission-compat"

import { buildDefaultCerberusJuniorPrompt } from "./default"
import { buildKimiK26CerberusJuniorPrompt } from "./kimi-k2-6"
import { buildKimiK27CerberusJuniorPrompt } from "./kimi-k2-7"
import { buildGptCerberusJuniorPrompt } from "./gpt"
import { buildGpt54CerberusJuniorPrompt } from "./gpt-5-4"
import { buildGpt55CerberusJuniorPrompt } from "./gpt-5-5"
import { buildGeminiCerberusJuniorPrompt } from "./gemini"
import { buildGlm52CerberusJuniorPrompt } from "./glm-5-2"

const MODE: AgentMode = "subagent"

// Core tools that Cerberus-Junior must NEVER have access to
// Note: call_omo_agent is ALLOWED so subagents can spawn scout/intel
const BLOCKED_TOOLS = ["task"]

export const CERBERUS_JUNIOR_DEFAULTS = {
  model: "anthropic/claude-sonnet-4-6",
  temperature: 0.1,
} as const

export type CerberusJuniorPromptSource =
  | "default"
  | "kimi-k2"
  | "kimi-k2-7"
  | "gpt"
  | "gpt-5-5"
  | "gpt-5-4"
  | "gemini"
  | "glm-5-2"

export function getCerberusJuniorPromptSource(model?: string): CerberusJuniorPromptSource {
  if (model && isKimiK27Model(model)) return "kimi-k2-7"
  if (model && isKimiK2Model(model)) return "kimi-k2"
  if (model && isGptModel(model)) {
    if (isGpt5_5Model(model)) return "gpt-5-5"
    const lower = model.toLowerCase()
    if (lower.includes("gpt-5.4") || lower.includes("gpt-5-4")) return "gpt-5-4"
    return "gpt"
  }
  if (model && isGeminiModel(model)) {
    return "gemini"
  }
  if (model && isGlmModel(model)) return "glm-5-2"
  return "default"
}

/**
 * Builds the appropriate Cerberus-Junior prompt based on model.
 */
export function buildCerberusJuniorPrompt(
  model: string | undefined,
  useTaskSystem: boolean,
  promptAppend?: string
): string {
  const source = getCerberusJuniorPromptSource(model)

  switch (source) {
    case "kimi-k2-7":
      return buildKimiK27CerberusJuniorPrompt(useTaskSystem, promptAppend)
    case "kimi-k2":
      return buildKimiK26CerberusJuniorPrompt(useTaskSystem, promptAppend)
    case "gpt-5-5":
      return buildGpt55CerberusJuniorPrompt(useTaskSystem, promptAppend)
    case "gpt-5-4":
      return buildGpt54CerberusJuniorPrompt(useTaskSystem, promptAppend)
    case "gpt":
      return buildGptCerberusJuniorPrompt(useTaskSystem, promptAppend)
    case "gemini":
      return buildGeminiCerberusJuniorPrompt(useTaskSystem, promptAppend)
    case "glm-5-2":
      return buildGlm52CerberusJuniorPrompt(useTaskSystem, promptAppend)
    case "default":
    default:
      return buildDefaultCerberusJuniorPrompt(useTaskSystem, promptAppend)
  }
}

export function createCerberusJuniorAgentWithOverrides(
  override: AgentOverrideConfig | undefined,
  systemDefaultModel?: string,
  useTaskSystem = false
): AgentConfig {
  if (override?.disable) {
    override = undefined
  }

  const overrideModel = (override as { model?: string } | undefined)?.model
  const model = overrideModel ?? systemDefaultModel ?? CERBERUS_JUNIOR_DEFAULTS.model
  const temperature = override?.temperature ?? CERBERUS_JUNIOR_DEFAULTS.temperature

  const promptAppend = override?.prompt_append
  const prompt = buildCerberusJuniorPrompt(model, useTaskSystem, promptAppend)
  const blockedTools = BLOCKED_TOOLS

  const baseRestrictions = createAgentToolRestrictions(blockedTools)

  const migratedOverride = override
    ? (migrateAgentConfig(override as Record<string, unknown>) as typeof override)
    : undefined
  const userPermission = (migratedOverride?.permission ?? {}) as Record<string, PermissionValue>
  const basePermission = baseRestrictions.permission
  const merged: Record<string, PermissionValue> = { ...userPermission }
  for (const tool of blockedTools) {
    merged[tool] = "deny"
  }
  merged.call_omo_agent = "allow"
  const toolsConfig = { permission: { ...merged, ...basePermission } as Record<string, PermissionValue> }
  const permission: Record<string, PermissionValue> = {
    ...toolsConfig.permission,
  }

  const base: AgentConfig = {
    description: override?.description ??
      "Focused task executor. Same discipline, no delegation. (Cerberus-Junior - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature,
    maxTokens: 64000,
    prompt,
    color: override?.color ?? "#20B2AA",
    permission,
  }

  if (override?.top_p !== undefined) {
    base.top_p = override.top_p
  }

  if (isGptModel(model)) {
    return { ...base, reasoningEffort: "medium" } as AgentConfig
  }

  if (isGlmModel(model)) {
    return base as AgentConfig
  }

  return {
    ...base,
    ...buildClaudeThinkingConfig(model),
  } as AgentConfig
}

createCerberusJuniorAgentWithOverrides.mode = MODE
