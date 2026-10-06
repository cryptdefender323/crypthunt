import { type CryptHunterConfig } from "./schema";
export type PluginConfigValidation = {
    readonly valid: boolean;
    readonly messages: readonly string[];
    readonly path: string | null;
    readonly config: CryptHunterConfig;
};
export declare function validatePluginConfig(directory: string): PluginConfigValidation;
