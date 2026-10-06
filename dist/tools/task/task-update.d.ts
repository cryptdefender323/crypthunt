import type { PluginInput } from "@opencode-ai/plugin";
import { type ToolDefinition } from "@opencode-ai/plugin/tool";
import type { CryptHunterConfig } from "../../config/schema";
export declare function createTaskUpdateTool(config: Partial<CryptHunterConfig>, ctx?: PluginInput): ToolDefinition;
