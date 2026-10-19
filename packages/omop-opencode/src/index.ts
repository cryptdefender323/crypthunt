import type { PluginModule } from "@opencode-ai/plugin"
import { createPluginModule } from "./testing/create-plugin-module"
import { setupOpenCodeV2 } from "./opencode-v2-bridge"

const pluginModule: PluginModule = createPluginModule()

export default {
  id: "crypthunter",
  server: pluginModule.server,
  setup: setupOpenCodeV2,
}

export type {
  AgentName,
  AgentOverrideConfig,
  AgentOverrides,
  BuiltinCommandName,
  HookName,
  McpName,
  CryptHunterConfig,
} from "./config"

export type { ConfigLoadError } from "./shared/config-errors"
