import { type BuildCodegraphEnvOptions, type CodegraphCommandResolution, type CodegraphNodeSupport, type CodegraphProvisionResult, type CodegraphWorkspacePreparation, type PrepareCodegraphWorkspaceOptions, type ResolveCodegraphCommandOptions } from "@omop/utils";
import type { CodegraphConfig } from "../../config";
import type { CodegraphCommandResult } from "./command-runner";
export interface CodegraphBootstrapContext {
    readonly directory: string;
}
export interface CodegraphBootstrapEventInput {
    readonly event: {
        readonly properties?: unknown;
        readonly type: string;
    };
}
export interface CodegraphBootstrapDeps {
    readonly buildEnv: (options?: BuildCodegraphEnvOptions) => Record<string, string>;
    readonly ensureGitignored: (projectRoot: string) => boolean;
    readonly ensureProvisioned: (options: {
        readonly installDir?: string;
        readonly lockDir: string;
        readonly version: "1.0.1";
    }) => Promise<CodegraphProvisionResult>;
    readonly log: (message: string, data?: Record<string, unknown>) => void;
    readonly nodeSupport: () => CodegraphNodeSupport;
    readonly prepareWorkspace: (projectRoot: string, options?: PrepareCodegraphWorkspaceOptions) => CodegraphWorkspacePreparation;
    readonly resolveCommand: (options?: ResolveCodegraphCommandOptions) => CodegraphCommandResolution;
    readonly runCommand: (projectRoot: string, command: string, args: readonly string[], options: {
        readonly env: Record<string, string>;
        readonly timeoutMs: number;
    }) => Promise<CodegraphCommandResult>;
    readonly schedule: (task: () => Promise<void>) => void;
}
export declare function clearCodegraphBootstrapProjectsForTesting(): void;
export declare function createCodegraphBootstrapHook(ctx: CodegraphBootstrapContext, config: Partial<CodegraphConfig> | undefined, depsOverride?: Partial<CodegraphBootstrapDeps>): {
    event(input: CodegraphBootstrapEventInput): void;
};
