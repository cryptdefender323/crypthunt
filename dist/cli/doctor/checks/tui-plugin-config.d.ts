import type { CheckResult } from "../framework/types";
interface ServerPluginInfo {
    registered: boolean;
    configPath: string | null;
    entry: string | null;
    packageExportsTui: boolean | null;
}
interface TuiPluginInfo {
    registered: boolean;
    configPath: string | null;
    exists: boolean;
    hasPackageTuiEntry: boolean;
    hasNamedTuiEntry: boolean;
    hasCanonicalNamedTuiEntry: boolean;
}
export declare function isOurFilePluginEntry(entry: string): boolean;
export declare function isServerPluginEntry(entry: string): boolean;
export declare function isTuiPluginEntry(entry: string): boolean;
export declare function isNamedTuiPluginEntry(entry: string): boolean;
export declare function detectServerPluginRegistration(): ServerPluginInfo;
export declare function detectTuiPluginRegistration(): TuiPluginInfo;
export declare function checkTuiPluginConfig(): Promise<CheckResult>;
export {};
