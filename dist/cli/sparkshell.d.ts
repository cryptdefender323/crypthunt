import { type RuntimeEnv, type SparkShellAppServerClient, type SparkShellAppServerCommand, type SparkShellAppServerResult } from "./sparkshell-appserver";
import { type SessionContextDetails } from "./sparkshell-session-context";
import { type SparkSummarizer } from "./sparkshell-spark";
export declare const SPARKSHELL_BIN_ENV = "OMOP_SPARKSHELL_BIN";
export declare const SPARKSHELL_CONDENSE_ENV = "OMOP_SPARKSHELL_CONDENSE";
export declare const SPARKSHELL_CONDENSE_BUDGET_ENV = "OMOP_SPARKSHELL_CONDENSE_BUDGET";
export type { SparkShellAppServerClient, SparkShellAppServerCommand, SparkShellAppServerResult };
export { parseSparkShellFallbackInvocation, parseTopLevelSparkShellBudget, resolveFallbackShellArgv, SPARKSHELL_USAGE, } from "./sparkshell-parse";
export { DEFAULT_SPARK_MODEL, SPARKSHELL_SPARK_BIN_ENV, SPARKSHELL_SPARK_ENV, SPARKSHELL_SPARK_MODEL_ENV, SPARKSHELL_SPARK_TIMEOUT_ENV, type SparkSummarizer, type SparkSummaryRequest, } from "./sparkshell-spark";
export type SparkShellSpawnResult = {
    readonly status?: number | null;
    readonly signal?: string | null;
    readonly stdout?: string;
    readonly stderr?: string;
    readonly error?: Error;
};
export type SparkShellSpawn = (command: string, args: readonly string[], options: {
    readonly cwd: string;
    readonly env: RuntimeEnv;
}) => SparkShellSpawnResult;
export type SparkShellRunOptions = {
    readonly cwd?: string;
    readonly env?: RuntimeEnv;
    readonly platform?: NodeJS.Platform;
    readonly spawn?: SparkShellSpawn;
    readonly writeStdout?: (value: string) => void;
    readonly writeStderr?: (value: string) => void;
    readonly commandExists?: (command: string) => boolean;
    readonly appServerClient?: SparkShellAppServerClient | null;
    readonly loadSessionContext?: (env: RuntimeEnv) => SessionContextDetails | null;
    readonly sparkSummarize?: SparkSummarizer | null;
};
export declare function runSparkShell(args: readonly string[], options?: SparkShellRunOptions): Promise<number>;
