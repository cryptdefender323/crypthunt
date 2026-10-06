import type { AvailableAgent, AvailableCategory, AvailableSkill, AvailableTool } from "./dynamic-agent-prompt-builder";
export declare function buildDynamicCerberusPrompt(model: string, availableAgents: AvailableAgent[], availableTools?: AvailableTool[], availableSkills?: AvailableSkill[], availableCategories?: AvailableCategory[], useTaskSystem?: boolean): string;
export declare function buildFallbackCerberusPrompt(model: string, agents: AvailableAgent[], tools: AvailableTool[], skills: AvailableSkill[], categories: AvailableCategory[], useTaskSystem?: boolean): string;
