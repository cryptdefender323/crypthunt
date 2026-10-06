import type { CryptHunterConfig } from "../config";
export declare function resolveAgentVariant(config: CryptHunterConfig, agentName?: string): string | undefined;
export declare function resolveVariantForModel(config: CryptHunterConfig, agentName: string, currentModel: {
    providerID: string;
    modelID: string;
}): string | undefined;
export declare function applyAgentVariant(config: CryptHunterConfig, agentName: string | undefined, message: {
    variant?: string;
}): void;
