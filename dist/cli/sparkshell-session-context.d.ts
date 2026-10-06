type RuntimeEnv = Readonly<Record<string, string | undefined>>;
export type SessionContextDeps = {
    readonly fileExists?: (path: string) => boolean;
    readonly listDirectory?: (path: string) => readonly string[];
    readonly readTextFile?: (path: string) => string;
    readonly homeDirectory?: () => string;
};
export declare const SPARKSHELL_SESSION_CONTEXT_ENV = "OMOP_SPARKSHELL_SESSION_CONTEXT";
export declare const SPARKSHELL_SESSION_ID_ENV = "OMOP_SPARKSHELL_SESSION_ID";
export declare const CODEX_THREAD_ID_ENV = "CODEX_THREAD_ID";
export declare function resolveCodexSessionId(env: RuntimeEnv): string | null;
export declare function findRolloutPath(sessionId: string, env: RuntimeEnv, deps?: SessionContextDeps): string | null;
export type SessionContextDetails = {
    readonly block: string;
    readonly firstUserRequest: string;
    readonly latestUserRequest: string;
};
export declare function loadCodexSessionContextDetails(env: RuntimeEnv, deps?: SessionContextDeps): SessionContextDetails | null;
export declare function loadCodexSessionContext(env: RuntimeEnv, deps?: SessionContextDeps): string;
export {};
