import type { CommandDefinition } from "../claude-code-command-loader"

export type BuiltinCommandName = "pentest-loop" | "ulw-loop" | "cancel-pentest-loop" | "refactor" | "start-work" | "stop-continuation" | "handoff" | "remove-ai-slops" | "hyperplan"

export interface BuiltinCommandConfig {
  disabled_commands?: BuiltinCommandName[]
}

export type BuiltinCommands = Record<string, CommandDefinition>
