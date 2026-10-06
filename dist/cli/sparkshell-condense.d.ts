export type CondenseOptions = {
    readonly budgetChars: number;
    readonly hints: readonly string[];
};
export type CondenseResult = {
    readonly output: string;
    readonly condensed: boolean;
};
export declare function condenseOutput(text: string, options: CondenseOptions): CondenseResult;
export declare function extractContextHints(requests: readonly string[]): readonly string[];
