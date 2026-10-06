import type { PluginInput } from "@opencode-ai/plugin";
import type { ArgusHookOptions, SessionState } from "./types";
export declare function handleArgusSessionIdle(input: {
    ctx: PluginInput;
    options?: ArgusHookOptions;
    getState: (sessionID: string) => SessionState;
    sessionID: string;
}): Promise<void>;
