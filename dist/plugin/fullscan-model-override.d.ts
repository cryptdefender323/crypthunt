import type { CryptHunterConfig } from "../config";
export declare function detectFullscan(text: string): boolean;
export type UltraworkOverrideResult = {
    providerID?: string;
    modelID?: string;
    variant?: string;
};
export declare function resolveFullscanOverride(pluginConfig: CryptHunterConfig, inputAgentName: string | undefined, output: {
    message: Record<string, unknown>;
    parts: Array<{
        type: string;
        text?: string;
        [key: string]: unknown;
    }>;
}, sessionID?: string): UltraworkOverrideResult | null;
export declare function applyFullscanModelOverrideOnMessage(pluginConfig: CryptHunterConfig, inputAgentName: string | undefined, output: {
    message: Record<string, unknown>;
    parts: Array<{
        type: string;
        text?: string;
        [key: string]: unknown;
    }>;
}, tui: unknown, sessionID?: string, client?: unknown): void | Promise<void>;
