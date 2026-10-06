export declare const EXPECTED_OMOP_COMPONENT_BINS: readonly [{
    readonly name: "omop";
    readonly target: string;
    readonly kind: "runtime-wrapper";
}, {
    readonly name: "omop-comment-checker";
    readonly target: string;
}, {
    readonly name: "omop-git-bash-hook";
    readonly target: string;
}, {
    readonly name: "omop-lsp";
    readonly target: string;
}, {
    readonly name: "omop-rules";
    readonly target: string;
}, {
    readonly name: "omop-start-work-continuation";
    readonly target: string;
}, {
    readonly name: "omop-telemetry";
    readonly target: string;
}, {
    readonly name: "omop-pentest-loop";
    readonly target: string;
}, {
    readonly name: "omop-fullscan";
    readonly target: string;
}];
export declare function expectedBinName(name: string): string;
export declare function createRepoWithBuiltComponentBins(input?: {
    readonly includeBundledGitBashMcp?: boolean;
    readonly includeRootCliDist?: boolean;
}): Promise<string>;
