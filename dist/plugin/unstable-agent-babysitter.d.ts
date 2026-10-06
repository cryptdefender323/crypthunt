import type { CryptHunterConfig } from "../config";
import type { PluginContext } from "./types";
import type { BackgroundManager } from "../features/background-agent";
export declare function createUnstableAgentBabysitter(args: {
    ctx: PluginContext;
    backgroundManager: BackgroundManager;
    pluginConfig: CryptHunterConfig;
}): {
    event: ({ event }: {
        event: {
            type: string;
            properties?: unknown;
        };
    }) => Promise<void>;
};
