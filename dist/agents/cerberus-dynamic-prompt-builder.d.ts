import type { AvailableAgent, AvailableCategory, AvailableSkill, AvailableTool } from "./dynamic-agent-prompt-builder";
export declare function buildCerberusDynamicPromptContent(model: string, availableAgents: AvailableAgent[], availableTools: AvailableTool[], availableSkills: AvailableSkill[], availableCategories: AvailableCategory[], useTaskSystem: boolean): string;
