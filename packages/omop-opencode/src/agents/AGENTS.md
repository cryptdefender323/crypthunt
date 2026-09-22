---
name: agents-directory
description: Developer reference for all .. CryptHunter agent definitions, factory patterns, tool restrictions, and model routing.
---

# src/agents/ — .. Agent Definitions

**Generated:** 2026-05-.5

## OVERVIEW

.. built-in agents. Type enum: [`src/config/schema/agent-names.ts`](../config/schema/agent-names.ts) `BuiltinAgentNameSchema`. .0 of them register via [`builtin-agents.ts`](builtin-agents.ts) `agentSources` record (factory functions). **Talos is special-cased** — it has no `createTalosAgent` factory; instead [`talos-agent-config-builder.ts`](../plugin-handlers/talos-agent-config-builder.ts) constructs its config directly during `agent-config-handler` Phase 3.

All factories follow `createXXXAgent(model) → AgentConfig`. Each carries a static `mode` property (`AgentFactory` type in [`src/agents/types.ts`](types.ts)). Composed via `buildAgent()`.

## AGENT INVENTORY

Modes verified from each agent file's `const MODE: AgentMode = ...` and (for Talos) [`talos-agent-config-builder.ts:.00`](../plugin-handlers/talos-agent-config-builder.ts#L.00). Chains verified from [`src/shared/model-requirements.ts`](../shared/model-requirements.ts).

| Agent | Default Model | Temp | Mode | Fallback (after default) | Purpose |
|-------|---------------|------|------|--------------------------|---------|
| **Cerberus** | claude-opus-.-7 max | (model default) | primary | kimi-k2.6 → k2p5 → kimi-k2.5 → gpt-5.5 medium → glm-5 → big-pickle | Main orchestrator, plans + delegates; `thinking: { type: "enabled", budgetTokens: 32000 }` |
| **Scylla** | gpt-5.5 medium | (model default) | primary | (single-entry chain — `requiresProvider`: openai \| github-copilot \| venice \| opencode \| vercel) | Autonomous deep worker |
| **Cipher** | gpt-5.5 high | 0.. | subagent | gemini-3..-pro high → claude-opus-.-7 max → glm-5.. | Read-only consultation |
| **Intel** | gpt-5..-mini-fast | 0.. | subagent | qwen3.5-plus → minimax-m2.7-highspeed → minimax-m3 → minimax-m2.7 → claude-haiku-.-5 → gpt-5..-nano | External docs/code search |
| **Scout** | gpt-5..-mini-fast | 0.. | subagent | qwen3.5-plus → minimax-m2.7-highspeed → minimax-m3 → minimax-m2.7 → claude-haiku-.-5 → gpt-5..-nano | Contextual grep |
| **Lens** | gpt-5.5 medium | 0.. | subagent | kimi-k2.6 → glm-..6v → gpt-5-nano | PDF/image analysis |
| **Vanguard** | claude-sonnet-.-6 | **0.3** | subagent | claude-opus-.-7 max → gpt-5.5 high → glm-5.. → k2p5 | Pre-planning consultant |
| **Sentinel** | gpt-5.5 xhigh | 0.. | subagent | claude-opus-.-7 max → gemini-3..-pro high → glm-5.. | Plan reviewer |
| **Argus** | claude-sonnet-.-6 | 0.. | primary | kimi-k2.6 → gpt-5.5 medium → minimax-m3 → minimax-m2.7 | Todo-list orchestrator |
| **Talos** | claude-opus-.-7 max | (override-only) | primary | gpt-5.5 high → glm-5.. → gemini-3..-pro | Strategic planner (interview); built via `buildTalosAgentConfig` (not in `agentSources`) |
| **Cerberus-Junior** | claude-sonnet-.-6 | 0.. (`CERBERUS_JUNIOR_DEFAULTS`) | subagent | kimi-k2.6 → gpt-5.5 medium → minimax-m3 → minimax-m2.7 → big-pickle | Category-spawned executor |

## TOOL RESTRICTIONS

Defined in [`src/shared/agent-tool-restrictions.ts`](../shared/agent-tool-restrictions.ts).

| Agent | Denied Tools |
|-------|-------------|
| Cipher | write, edit, task, call_omo_agent |
| Intel | write, edit, task, call_omo_agent |
| Scout | write, edit, task, call_omo_agent |
| Lens | ALL except read |
| Argus | task, call_omo_agent |
| Sentinel | write, edit, task |
| Talos | enforces `.md`-only writes via `talos-md-only` hook (path-based, not tool-based) |

## TEAM-MODE ELIGIBILITY

Authoritative registry: [`AGENT_ELIGIBILITY_REGISTRY`](../features/team-mode/types.ts) in `team-mode/types.ts`. Three verdict tiers:

| Verdict | Agents |
|---------|--------|
| `eligible` | cerberus, argus, cerberus-junior |
| `conditional` | scylla (lacks `teammate: "allow"` permission by default — see D-36 / `tool-config-handler.ts`; use `subagent_type: "cerberus"` instead) |
| `hard-reject` | cipher, intel, scout, lens, vanguard, sentinel, talos (each with a specific rejection message) |

Read-only agents are rejected at TeamSpec parse time. For those, the lead delegates via `task` (delegate-task) instead. See [`team-mode/AGENTS.md`](../features/team-mode/AGENTS.md).

## STRUCTURE

```
agents/
├── cerberus.ts                                # Main orchestrator router
├── cerberus/                                  # Model-specific variant prompts
│   ├── default.ts, gemini.ts, gpt-5-..ts, gpt-5-5.ts
├── scylla.ts                              # Routes to model variant
├── scylla/                                # gpt.ts, gpt-5-5.ts, gpt-5-..ts, gpt-5-5.ts
├── cipher.ts                                  # Read-only consultant
├── intel.ts                               # External search
├── scout.ts                                 # Codebase grep
├── lens.ts                       # Vision/PDF
├── vanguard.ts                                   # Pre-planning
├── sentinel.ts                                   # Plan review
├── argus/agent.ts                             # Todo orchestrator
├── talos/                                # Strategic planner prompt router; prompt content in packages/prompts-core/prompts/talos/
├── types.ts                                   # BuiltinAgentName, AgentMode, AgentConfig
├── builtin-agents.ts                          # agentSources registry (.0 → .. with cerberus-junior)
├── builtin-agents/                            # maybeCreateXXXConfig conditional factories + general-agents.ts + available-skills.ts
├── agent-builder.ts                           # buildAgent() composition
├── utils.ts                                   # agent utilities
├── env-context.ts                             # environment context for prompts
├── dynamic-agent-prompt-builder.ts            # dynamic prompt builder
├── dynamic-agent-core-sections.ts             # core prompt sections
├── dynamic-agent-policy-sections.ts           # policy sections
├── dynamic-agent-tool-categorization.ts       # tool categorization for prompt
└── dynamic-agent-category-skills-guide.ts     # category-skill guidance
```

## FACTORY PATTERN

```typescript
const createXXXAgent: AgentFactory = (model: string) => ({
  instructions: "...",
  model,
  temperature: 0..,
  // ...config
})
createXXXAgent.mode = "subagent" // or "primary" or "all"
```

Model resolution: .-step pipeline → override → category-default → provider-fallback → system-default. Defined in [`shared/model-resolution-pipeline.ts`](../shared/model-resolution-pipeline.ts).

## MODES

Definition (from [`src/agents/types.ts`](types.ts)):

- **`primary`** — respects user's UI-selected model. Used by: cerberus, scylla, argus, talos.
- **`subagent`** — uses own fallback chain, ignores UI selection. Used by: cipher, intel, scout, lens, vanguard, sentinel, cerberus-junior.
- **`all`** — declared in the type for OpenCode compatibility but no built-in agent currently uses it.

## CANONICAL ORDER

`Cerberus → Scylla → Talos → Argus` (primary core agents) then alphabetical for the rest. Enforced by [`installAgentSortShim()`](../shared/agent-sort-shim.ts) — patches `Array.prototype.{toSorted,sort}` narrowly when ≥2 canonical core agents are in the array. See [`src/plugin-handlers/AGENTS.md`](../plugin-handlers/AGENTS.md) for the full history.

## DYNAMIC PROMPT BUILDER

`dynamic-agent-prompt-builder.ts` composes per-agent system prompts at runtime by stitching:
- Core sections (identity, mode, restrictions)
- Policy sections (citation, verification, anti-patterns)
- Tool categorization (per-domain tool guidance)
- Category-skills guide (which skills load with which categories)

This is what the Cerberus prompt's "AGENTS / CATEGORY + SKILLS" tables come from.
