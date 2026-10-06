import type { PluginInput } from "@opencode-ai/plugin";
import type { ArgusHookOptions, SessionState } from "./types";
export declare function hasRunningBackgroundTasks(sessionID: string, options?: ArgusHookOptions): boolean;
export declare function injectContinuation(input: {
    ctx: PluginInput;
    sessionID: string;
    sessionState: SessionState;
    options?: ArgusHookOptions;
    planName: string;
    progress: {
        total: number;
        completed: number;
    };
    agent?: string;
    worktreePath?: string;
    idleSettleMs?: number;
}): Promise<void>;
export declare function scheduleRetry(input: {
    ctx: PluginInput;
    sessionID: string;
    sessionState: SessionState;
    options?: ArgusHookOptions;
}): void;
