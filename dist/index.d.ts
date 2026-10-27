import { setupOpenCodeV2 } from "./opencode-v2-bridge";
declare const _default: {
    id: string;
    server: import("@opencode-ai/plugin").Plugin;
    setup: typeof setupOpenCodeV2;
};
export default _default;
export type { AgentName, AgentOverrideConfig, AgentOverrides, BuiltinCommandName, HookName, McpName, CryptHunterConfig, } from "./config";
export type { ConfigLoadError } from "./shared/config-errors";
