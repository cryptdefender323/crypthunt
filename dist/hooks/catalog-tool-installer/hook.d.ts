import type { Hooks } from "@opencode-ai/plugin";
import type { ToolsCatalog } from "@omop/pentest-core";
import { checkToolInstalled, installTool } from "@omop/pentest-core";
export type CatalogToolInstallerOptions = {
    readonly enabled?: boolean;
    readonly getCatalog?: () => Promise<ToolsCatalog | null>;
    readonly checkInstalled?: typeof checkToolInstalled;
    readonly install?: typeof installTool;
    readonly platform?: NodeJS.Platform;
};
export declare function extractCatalogToolToken(command: string): string | null;
export declare function createCatalogToolInstallerHook(options?: CatalogToolInstallerOptions): Hooks;
export declare function resetCatalogToolInstallerStateForTests(): void;
