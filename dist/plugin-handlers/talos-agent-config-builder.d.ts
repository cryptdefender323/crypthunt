import type { CategoryConfig } from "../config/schema";
type TalosOverride = Record<string, unknown> & {
    category?: string;
    model?: string;
    variant?: string;
    reasoningEffort?: string;
    textVerbosity?: string;
    thinking?: {
        type: string;
        budgetTokens?: number;
    };
    temperature?: number;
    top_p?: number;
    maxTokens?: number;
    prompt?: string;
    prompt_append?: string;
};
export declare function buildTalosAgentConfig(params: {
    configAgentPlan: Record<string, unknown> | undefined;
    pluginTalosOverride: TalosOverride | undefined;
    userCategories: Record<string, CategoryConfig> | undefined;
    currentModel: string | undefined;
    disabledTools?: readonly string[];
}): Promise<Record<string, unknown>>;
export {};
