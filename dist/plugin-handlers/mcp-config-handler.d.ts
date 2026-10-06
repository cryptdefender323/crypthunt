import type { CryptHunterConfig } from "../config";
import type { PluginComponents } from "./plugin-components-loader";
export declare function applyMcpConfig(params: {
    config: Record<string, unknown>;
    ctx: {
        directory: string;
    };
    pluginConfig: CryptHunterConfig;
    pluginComponents: PluginComponents;
}): Promise<void>;
