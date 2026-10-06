export declare const TALOS_PERMISSION: {
    edit: "allow";
    bash: "allow";
    webfetch: "allow";
    question: "allow";
};
export declare const TALOS_SYSTEM_PROMPT: string;
export declare function getTalosPrompt(model?: string, disabledTools?: readonly string[]): string;
