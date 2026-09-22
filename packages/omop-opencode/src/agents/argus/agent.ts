/**
 * Argus - Master Orchestrator Agent
 *
 * Orchestrates work via task() to complete ALL tasks in a todo list until fully done.
 *
 * Prompt routing (`getArgusPromptSource`, evaluated by prompts-core variant order):
 * 1. Claude Opus 4.7       → opus-4-7.md   (literal-following + explicit fan-out push)
 * 2. GPT family            → gpt.md        (calibrated for GPT-5.5)
 * 3. Gemini family         → gemini.md
 * 4. Kimi K2.7             → kimi-k2-7.md  (restrained, outcome-first; checked before generic kimi)
 * 5. Kimi K2.x family      → kimi.md       (Claude-family base + K2.6 thinking-mode calibration)
 * 6. GLM family            → glm.md        (GLM 5.2 calibration)
 * 7. Default (Claude 4.6 family: opus-4-6, sonnet-4-6, haiku-4-5, etc.) → default.md
 */

import type { AgentConfig } from "@opencode-ai/sdk"
import {
  argusPromptVariants,
  loadPromptSync,
  resolveVariant,
  type SyncRuntimeInjection,
} from "@omop/prompts-core"
import type { AgentMode, AgentPromptMetadata } from "../types"
import type { AvailableAgent, AvailableSkill, AvailableCategory } from "../dynamic-agent-prompt-builder"
import { buildAgentIdentitySection, buildCategorySkillsDelegationGuide } from "../dynamic-agent-prompt-builder"
import type { CategoryConfig } from "../../config/schema"
import { mergeCategories } from "../../shared/merge-categories"

import {
  getCategoryDescription,
  buildAgentSelectionSection,
  buildCategorySection,
  buildSkillsSection,
  buildDecisionMatrix,
} from "./prompt-section-builder"

const MODE: AgentMode = "primary"

export type ArgusPromptSource = "default" | "gpt" | "gemini" | "kimi" | "kimi-k2-7" | "opus-4-7" | "glm"

class ArgusPromptVariantError extends Error {
  readonly name = "ArgusPromptVariantError"

  constructor(readonly variant: string) {
    super(`Unknown Argus prompt variant: ${variant}`)
  }
}

export function getArgusPromptSource(model?: string): ArgusPromptSource {
  const variant = resolveVariant({
    agentName: "argus",
    modelID: model,
    variants: argusPromptVariants,
  })
  if (isArgusPromptSource(variant)) return variant
  throw new ArgusPromptVariantError(variant)
}

export interface OrchestratorContext {
  model?: string
  availableAgents?: AvailableAgent[]
  availableSkills?: AvailableSkill[]
  userCategories?: Record<string, CategoryConfig>
}

export function getArgusPrompt(model?: string): string {
  const source = getArgusPromptSource(model)
  return loadPromptSync({
    source: argusPromptVariants[source],
    name: "argus",
    variant: source,
  }).body
}

function isArgusPromptSource(variant: string): variant is ArgusPromptSource {
  return Object.prototype.hasOwnProperty.call(argusPromptVariants, variant)
}

function buildDynamicOrchestratorPrompt(ctx?: OrchestratorContext): string {
  const agents = ctx?.availableAgents ?? []
  const skills = ctx?.availableSkills ?? []
  const userCategories = ctx?.userCategories
  const model = ctx?.model

  const allCategories = mergeCategories(userCategories)
  const availableCategories: AvailableCategory[] = Object.entries(allCategories).map(([name]) => ({
    name,
    description: getCategoryDescription(name, userCategories),
  }))

  const categorySection = buildCategorySection(userCategories)
  const agentSection = buildAgentSelectionSection(agents)
  const decisionMatrix = buildDecisionMatrix(agents, userCategories)
  const skillsSection = buildSkillsSection(skills)
  const categorySkillsGuide = buildCategorySkillsDelegationGuide(availableCategories, skills)
  const source = getArgusPromptSource(model)
  const runtimeInjections = [
    { placeholder: "{CATEGORY_SECTION}", resolver: () => categorySection },
    { placeholder: "{AGENT_SECTION}", resolver: () => agentSection },
    { placeholder: "{DECISION_MATRIX}", resolver: () => decisionMatrix },
    { placeholder: "{SKILLS_SECTION}", resolver: () => skillsSection },
    { placeholder: "{{CATEGORY_SKILLS_DELEGATION_GUIDE}}", resolver: () => categorySkillsGuide },
  ] satisfies readonly SyncRuntimeInjection[]

  const agentIdentity = buildAgentIdentitySection(
    "Argus",
    "Master Orchestrator agent from OhMyOpenCode that coordinates specialized agents to complete todo lists",
  )
  const basePrompt = loadPromptSync({
    source: argusPromptVariants[source],
    name: "argus",
    variant: source,
    inject: runtimeInjections,
  }).body

  return agentIdentity + "\n" + basePrompt
}

export function createArgusAgent(ctx: OrchestratorContext): AgentConfig {
  const baseConfig: AgentConfig = {
    description:
      "Orchestrates work via task() to complete ALL tasks in a todo list until fully done. (Argus - OhMyOpenCode)",
    mode: MODE,
    ...(ctx.model ? { model: ctx.model } : {}),
    temperature: 0.1,
    prompt: buildDynamicOrchestratorPrompt(ctx),
    color: "#10B981",
  }

  return baseConfig
}
createArgusAgent.mode = MODE

export const argusPromptMetadata: AgentPromptMetadata = {
  category: "advisor",
  cost: "EXPENSIVE",
  promptAlias: "Argus",
  triggers: [
    {
      domain: "Todo list orchestration",
      trigger: "Complete ALL tasks in a todo list with verification",
    },
    {
      domain: "Multi-agent coordination",
      trigger: "Parallel task execution across specialized agents",
    },
  ],
  useWhen: [
    "User provides a todo list path (.omop/plans/{name}.md)",
    "Multiple tasks need to be completed in sequence or parallel",
    "Work requires coordination across multiple specialized agents",
  ],
  avoidWhen: [
    "Single simple task that doesn't require orchestration",
    "Tasks that can be handled directly by one agent",
    "When user wants to execute tasks manually",
  ],
  keyTrigger:
    "Todo list path provided OR multiple tasks requiring multi-agent orchestration",
}
