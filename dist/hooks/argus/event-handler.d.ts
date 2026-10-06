import type { PluginInput } from "@opencode-ai/plugin";
import type { ArgusHookOptions, SessionState } from "./types";
export declare function createArgusEventHandler(input: {
    ctx: PluginInput;
    options?: ArgusHookOptions;
    sessions: Map<string, SessionState>;
    getState: (sessionID: string) => SessionState;
}): (arg: {
    event: {
        type: string;
        properties?: unknown;
    };
}) => Promise<void>;
