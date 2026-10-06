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
import type { AgentConfig } from "@opencode-ai/sdk";
import type { AgentPromptMetadata } from "../types";
import type { AvailableAgent, AvailableSkill } from "../dynamic-agent-prompt-builder";
import type { CategoryConfig } from "../../config/schema";
export type ArgusPromptSource = "default" | "gpt" | "gemini" | "kimi" | "kimi-k2-7" | "opus-4-7" | "glm";
export declare function getArgusPromptSource(model?: string): ArgusPromptSource;
export interface OrchestratorContext {
    model?: string;
    availableAgents?: AvailableAgent[];
    availableSkills?: AvailableSkill[];
    userCategories?: Record<string, CategoryConfig>;
}
export declare function getArgusPrompt(model?: string): string;
export declare function createArgusAgent(ctx: OrchestratorContext): AgentConfig;
export declare namespace createArgusAgent {
    var mode: "primary";
}
export declare const argusPromptMetadata: AgentPromptMetadata;
