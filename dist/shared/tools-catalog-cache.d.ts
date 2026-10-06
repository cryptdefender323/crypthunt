import type { ToolsCatalog } from "@omop/pentest-core";
export type ToolsCatalogCacheOptions = {
    readonly catalogPath?: string;
    readonly remoteUrl?: string;
    readonly cwd?: string;
};
export declare function getToolsCatalog(options?: ToolsCatalogCacheOptions): Promise<ToolsCatalog | null>;
export declare function resetToolsCatalogCacheForTests(): void;
