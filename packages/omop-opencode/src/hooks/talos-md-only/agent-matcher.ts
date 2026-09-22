import { TALOS_AGENT } from "./constants"

export function isTalosAgent(agentName: string | undefined): boolean {
  return agentName?.toLowerCase().includes(TALOS_AGENT) ?? false
}
