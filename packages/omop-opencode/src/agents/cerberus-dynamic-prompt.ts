import type {
  AvailableAgent,
  AvailableCategory,
  AvailableSkill,
  AvailableTool,
} from "./dynamic-agent-prompt-builder";
import { buildCerberusDynamicPromptContent } from "./cerberus-dynamic-prompt-builder";
import { applyGeminiFallbackOverrides } from "./cerberus-gemini-fallback-overrides";

export function buildDynamicCerberusPrompt(
  model: string,
  availableAgents: AvailableAgent[],
  availableTools: AvailableTool[] = [],
  availableSkills: AvailableSkill[] = [],
  availableCategories: AvailableCategory[] = [],
  useTaskSystem = false,
): string {
  return buildCerberusDynamicPromptContent(
    model,
    availableAgents,
    availableTools,
    availableSkills,
    availableCategories,
    useTaskSystem,
  );
}

export function buildFallbackCerberusPrompt(
  model: string,
  agents: AvailableAgent[],
  tools: AvailableTool[],
  skills: AvailableSkill[],
  categories: AvailableCategory[],
  useTaskSystem = false,
): string {
  return applyGeminiFallbackOverrides(
    model,
    buildDynamicCerberusPrompt(model, agents, tools, skills, categories, useTaskSystem),
  );
}
