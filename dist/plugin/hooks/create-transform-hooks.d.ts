import type { CryptHunterConfig } from "../../config";
import type { MonitorManager } from "../../features/monitor";
import type { PluginContext } from "../types";
import type { RalphLoopHook } from "../../hooks/pentest-loop";
import { createClaudeCodeHooksHook, createKeywordDetectorHook, createMonitorStatusInjectorHook, createPentestContextHook, createTeamMailboxInjector, createTeamModeStatusInjector, createToolPairValidatorHook } from "../../hooks";
import { createContextInjectorMessagesTransformHook } from "../../features/context-injector";
export type TransformHooks = {
    claudeCodeHooks: ReturnType<typeof createClaudeCodeHooksHook> | null;
    keywordDetector: ReturnType<typeof createKeywordDetectorHook> | null;
    pentestContext: ReturnType<typeof createPentestContextHook> | null;
    contextInjectorMessagesTransform: ReturnType<typeof createContextInjectorMessagesTransformHook>;
    teamModeStatusInjector: ReturnType<typeof createTeamModeStatusInjector> | null;
    teamMailboxInjector: ReturnType<typeof createTeamMailboxInjector> | null;
    toolPairValidator: ReturnType<typeof createToolPairValidatorHook> | null;
    monitorStatusInjector: ReturnType<typeof createMonitorStatusInjectorHook> | null;
};
export declare function createTransformHooks(args: {
    ctx: PluginContext;
    pluginConfig: CryptHunterConfig;
    isHookEnabled: (hookName: string) => boolean;
    safeHookEnabled?: boolean;
    ralphLoop?: RalphLoopHook | null;
    monitorManager?: MonitorManager;
}): TransformHooks;
