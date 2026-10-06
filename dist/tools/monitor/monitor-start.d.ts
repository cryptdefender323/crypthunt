import { type ToolDefinition } from "@opencode-ai/plugin";
import type { CryptHunterConfig } from "../../config/schema/crypthunter-config";
import type { MonitorManager } from "../../features/monitor/types";
import type { PluginContext } from "../../plugin/types";
type MonitorStartConfig = {
    monitor?: Partial<NonNullable<CryptHunterConfig["monitor"]>>;
};
export declare function createMonitorStart(manager: MonitorManager, pluginConfig: MonitorStartConfig, _ctx?: PluginContext): ToolDefinition;
export {};
