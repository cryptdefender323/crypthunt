import type { HookName, CryptHunterConfig } from "../../config";
import type { BackgroundManager } from "../../features/background-agent";
import type { PluginContext } from "../types";
import { createTodoContinuationEnforcer, createBackgroundNotificationHook, createStopContinuationGuardHook, createCompactionContextInjector, createCompactionTodoPreserverHook, createArgusHook } from "../../hooks";
import { createUnstableAgentBabysitter } from "../unstable-agent-babysitter";
export type ContinuationHooks = {
    stopContinuationGuard: ReturnType<typeof createStopContinuationGuardHook> | null;
    compactionContextInjector: ReturnType<typeof createCompactionContextInjector> | null;
    compactionTodoPreserver: ReturnType<typeof createCompactionTodoPreserverHook> | null;
    todoContinuationEnforcer: ReturnType<typeof createTodoContinuationEnforcer> | null;
    unstableAgentBabysitter: ReturnType<typeof createUnstableAgentBabysitter> | null;
    backgroundNotificationHook: ReturnType<typeof createBackgroundNotificationHook> | null;
    argusHook: ReturnType<typeof createArgusHook> | null;
};
export declare function createContinuationHooks(args: {
    ctx: PluginContext;
    pluginConfig: CryptHunterConfig;
    isHookEnabled: (hookName: HookName) => boolean;
    safeHookEnabled: boolean;
    backgroundManager: BackgroundManager;
}): ContinuationHooks;
