import type { CryptHunterConfig } from "../../config";
export declare function resolveCompactionModel(pluginConfig: CryptHunterConfig, sessionID: string, originalProviderID: string, originalModelID: string): {
    providerID: string;
    modelID: string;
};
