import type { AvailableAgent, AvailableCategory, AvailableSkill, AvailableTool } from "./dynamic-agent-prompt-builder";
export interface CerberusDynamicPromptSections {
    readonly agentIdentity: string;
    readonly antiPatterns: string;
    readonly categorySkillsGuide: string;
    readonly delegationTable: string;
    readonly scoutSection: string;
    readonly hardBlocks: string;
    readonly keyTriggers: string;
    readonly intelSection: string;
    readonly nonClaudePlannerSection: string;
    readonly cipherSection: string;
    readonly parallelDelegationSection: string;
    readonly taskManagementSection: string;
    readonly todoHookNote: string;
    readonly toolSelection: string;
}
export declare function buildCerberusDynamicPromptSections(model: string, availableAgents: AvailableAgent[], availableTools: AvailableTool[], availableSkills: AvailableSkill[], availableCategories: AvailableCategory[], useTaskSystem: boolean): CerberusDynamicPromptSections;
