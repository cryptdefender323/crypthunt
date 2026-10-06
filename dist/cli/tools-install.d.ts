import { ensureToolsInstalled, type ToolEntry } from "@omop/pentest-core";
import { type ToolPermissionConfig } from "@omop/tools";
export type ToolsInstallMode = "check" | "install";
export type ToolsInstallOptions = {
    readonly mode: ToolsInstallMode;
    readonly tools?: readonly string[];
    readonly phase?: "recon" | "enumeration" | "exploitation" | "reporting";
    readonly catalogPath?: string;
    readonly platform?: NodeJS.Platform;
    readonly dryRun?: boolean;
    readonly json?: boolean;
    readonly permissionConfig?: ToolPermissionConfig;
    readonly cwd?: string;
};
export type ToolsInstallReport = {
    readonly mode: ToolsInstallMode;
    readonly platform: NodeJS.Platform;
    readonly selected: string[];
    readonly alreadyInstalled: string[];
    readonly missing: string[];
    readonly wouldInstall?: {
        tools_name: string;
        command: string | null;
    }[];
    readonly installed?: string[];
    readonly denied?: string[];
    readonly failed?: {
        tools_name: string;
        message: string;
    }[];
    readonly stillMissing?: string[];
};
export declare function runToolsInstall(options: ToolsInstallOptions): Promise<{
    readonly exitCode: number;
    readonly report: ToolsInstallReport;
}>;
/** Core path without permission layer (for simple callers). */
export declare function ensureCatalogToolsInstalled(tools: readonly ToolEntry[], platform?: NodeJS.Platform): Promise<Awaited<ReturnType<typeof ensureToolsInstalled>>>;
export declare function formatToolsInstallReport(report: ToolsInstallReport): string;
