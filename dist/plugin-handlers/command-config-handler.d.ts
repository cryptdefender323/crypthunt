import type { CryptHunterConfig } from "../config";
import type { PluginComponents } from "./plugin-components-loader";
export declare function applyCommandConfig(params: {
    config: Record<string, unknown>;
    pluginConfig: CryptHunterConfig;
    ctx: {
        directory: string;
    };
    pluginComponents: PluginComponents;
}): Promise<void>;
