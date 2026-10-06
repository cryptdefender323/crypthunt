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
import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentOverrideConfig } from "../../config/schema";
export declare const CERBERUS_JUNIOR_DEFAULTS: {
    readonly model: "anthropic/claude-sonnet-4-6";
    readonly temperature: 0.1;
};
export type CerberusJuniorPromptSource = "default" | "kimi-k2" | "kimi-k2-7" | "gpt" | "gpt-5-5" | "gpt-5-4" | "gemini" | "glm-5-2";
export declare function getCerberusJuniorPromptSource(model?: string): CerberusJuniorPromptSource;
/**
 * Builds the appropriate Cerberus-Junior prompt based on model.
 */
export declare function buildCerberusJuniorPrompt(model: string | undefined, useTaskSystem: boolean, promptAppend?: string): string;
export declare function createCerberusJuniorAgentWithOverrides(override: AgentOverrideConfig | undefined, systemDefaultModel?: string, useTaskSystem?: boolean): AgentConfig;
export declare namespace createCerberusJuniorAgentWithOverrides {
    var mode: "subagent";
}
