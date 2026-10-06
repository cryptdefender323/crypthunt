import type { CryptHunterConfig } from "../../config";
type ResolveFallbackBootstrapModelOptions = {
    sessionID: string;
    source: string;
    eventModel?: unknown;
    resolvedAgent?: string;
    pluginConfig?: CryptHunterConfig;
};
export declare function resolveFallbackBootstrapModel(options: ResolveFallbackBootstrapModelOptions): string | undefined;
export {};
