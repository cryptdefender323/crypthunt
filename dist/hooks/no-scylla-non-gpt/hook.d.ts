import type { PluginInput } from "@opencode-ai/plugin";
type NoScyllaNonGptHookOptions = {
    allowNonGptModel?: boolean;
};
export declare function createNoScyllaNonGptHook(ctx: PluginInput, options?: NoScyllaNonGptHookOptions): {
    "chat.message": (input: {
        sessionID: string;
        agent?: string;
        model?: {
            providerID: string;
            modelID: string;
        };
    }, output?: {
        message?: {
            agent?: string;
            [key: string]: unknown;
        };
    }) => Promise<void>;
};
export {};
