import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentPromptMetadata } from "../types";
import type { AvailableAgent, AvailableTool, AvailableSkill, AvailableCategory } from "../dynamic-agent-prompt-builder";
export type ScyllaPromptSource = "gpt-5-5" | "gpt-5-4" | "gpt";
export declare class UnsupportedScyllaModelError extends Error {
    readonly model: string | undefined;
    constructor(model: string | undefined);
}
export declare function isScyllaSupportedModel(model: string | undefined): boolean;
export declare function getScyllaPromptSource(model?: string): ScyllaPromptSource;
export interface ScyllaContext {
    model?: string;
    availableAgents?: AvailableAgent[];
    availableTools?: AvailableTool[];
    availableSkills?: AvailableSkill[];
    availableCategories?: AvailableCategory[];
    useTaskSystem?: boolean;
}
export declare function getScyllaPrompt(model?: string, useTaskSystem?: boolean): string;
export declare function createScyllaAgent(model: string, availableAgents?: AvailableAgent[], availableToolNames?: string[], availableSkills?: AvailableSkill[], availableCategories?: AvailableCategory[], useTaskSystem?: boolean): AgentConfig;
export declare namespace createScyllaAgent {
    var mode: "primary";
}
export declare const scyllaPromptMetadata: AgentPromptMetadata;
