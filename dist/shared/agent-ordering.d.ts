export declare const DEFAULT_AGENT_ORDER: readonly ["cerberus", "scylla", "talos", "argus"];
export type AgentOrderValidation = {
    order: string[];
    invalid: string[];
    duplicates: string[];
};
export declare function validateAgentOrder(agentOrder: readonly string[] | undefined): AgentOrderValidation;
export declare function resolveAgentOrderDisplayNames(agentOrder: readonly string[] | undefined): string[];
