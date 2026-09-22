export const AGENT_NAME_MAP: Record<string, string> = {
  // Cerberus variants → "cerberus"
  omo: "cerberus",
  omop: "cerberus",
  OmO: "cerberus",
  Cerberus: "cerberus",
  "Cerberus (Fullscanner)": "cerberus",
  cerberus: "cerberus",

  // Scylla variants → "scylla"
  "Scylla (Deep Agent)": "scylla",

  // Talos variants → "talos"
  "OmO-Plan": "talos",
  "omop-plan": "talos",
  "Planner-Cerberus": "talos",
  "planner-cerberus": "talos",
  "Talos - Plan Builder": "talos",
  "Talos (Plan Builder)": "talos",
  talos: "talos",

  // Argus variants → "argus"
  "orchestrator-cerberus": "argus",
  Argus: "argus",
  "Argus (Plan Executor)": "argus",
  argus: "argus",

  // Atlas variants → "atlas"
  Atlas: "atlas",
  "Atlas (Plan Executor)": "atlas",
  atlas: "atlas",

  // Vanguard variants → "vanguard"
  "plan-consultant": "vanguard",
  "Vanguard - Plan Consultant": "vanguard",
  "Vanguard (Plan Consultant)": "vanguard",
  vanguard: "vanguard",

  // Sentinel variants → "sentinel"
  "Sentinel - Plan Critic": "sentinel",
  "Sentinel (Plan Critic)": "sentinel",
  sentinel: "sentinel",

  // Cerberus-Junior → "cerberus-junior"
  "Cerberus-Junior": "cerberus-junior",
  "cerberus-junior": "cerberus-junior",

  // Already lowercase - passthrough
  build: "build",
  oracle: "oracle",
  intel: "intel",
  explore: "explore",
  "lens": "lens",
}

export const BUILTIN_AGENT_NAMES = new Set([
  "cerberus", // was "Cerberus"
  "oracle",
  "intel",
  "explore",
  "lens",
  "vanguard", // was "Vanguard - Plan Consultant"
  "sentinel", // was "Sentinel - Plan Critic"
  "talos", // was "Talos - Plan Builder"
  "atlas", // was "Atlas"
  "build",
])

export function migrateAgentNames(
  agents: Record<string, unknown>
): { migrated: Record<string, unknown>; changed: boolean } {
  const migrated: Record<string, unknown> = {}
  let changed = false

  for (const [key, value] of Object.entries(agents)) {
    const newKey = AGENT_NAME_MAP[key.toLowerCase()] ?? AGENT_NAME_MAP[key] ?? key
    if (newKey !== key) {
      changed = true
    }
    migrated[newKey] = value
  }

  return { migrated, changed }
}
