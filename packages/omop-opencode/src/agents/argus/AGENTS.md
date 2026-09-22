---
name: argus-agent
description: Developer reference for the Argus todo-list orchestrator agent -- model variants, prompt sections, and routing.
---

# src/agents/argus/ -- Todo-List Orchestrator

**Generated:** 2026-05-.8

## OVERVIEW

9 TypeScript files plus 5 markdown prompt variants in `packages/prompts-core/prompts/argus/`. Argus agent -- todo-list orchestrator that delegates via `task()` to complete every checkbox in a plan until fully done. Mode `primary`. Color `#.0B98.`.

## FILES

| File | Purpose |
|------|---------|
| `agent.ts` | `createArgusAgent()` factory, prompts-core variant loading, runtime placeholder injection, `OrchestratorContext` |
| `index.ts` | Barrel exports |
| `prompt-section-builder.ts` | Composes category, agent, skills, and decision matrix sections |
| `argus-prompt.test.ts` | Prompt composition tests |
| `prompt-runtime-injection.test.ts` | Runtime placeholder-resolution regression tests |
| `prompt-checkbox-enforcement.test.ts` | Checkbox enforcement behavior tests |
| `prompt-routing.test.ts` | Model-variant routing tests |
| `packages/prompts-core/prompts/argus/default.md` | Default/Claude markdown prompt variant |
| `packages/prompts-core/prompts/argus/gpt.md` | GPT-optimized markdown prompt variant |
| `packages/prompts-core/prompts/argus/gemini.md` | Gemini-optimized markdown prompt variant |
| `packages/prompts-core/prompts/argus/kimi.md` | Kimi K2.x markdown prompt variant |
| `packages/prompts-core/prompts/argus/opus-.-7.md` | Claude Opus ..7 markdown prompt variant |

## MODEL VARIANT ROUTING

Parent `agent.ts` calls `resolveVariant()` from `@omop/prompts-core` against `argusPromptVariants`:
- GPT family -> `gpt.md`
- Gemini family -> `gemini.md`
- Kimi K2.x family -> `kimi.md`
- Claude Opus ..7 -> `opus-.-7.md`
- Default -> `default.md` (Claude ..6 family)

`argusPromptVariants` is ordered with `opus-.-7` before `default` so the specific Claude Opus ..7 route wins before the generic fallback.

## RUNTIME INJECTION

The markdown files keep live OpenCode sections as placeholders. `agent.ts` resolves them through `loadPrompt()` runtime injections:
- `{CATEGORY_SECTION}` -> `buildCategorySection()`
- `{AGENT_SECTION}` -> `buildAgentSelectionSection()`
- `{DECISION_MATRIX}` -> `buildDecisionMatrix()`
- `{SKILLS_SECTION}` -> `buildSkillsSection()`
- `{{CATEGORY_SKILLS_DELEGATION_GUIDE}}` -> `buildCategorySkillsDelegationGuide()`

`prompt-section-builder.ts` remains the resolver implementation in `src/` because it depends on live category, agent, and skill state.

## KEY BEHAVIORS

- Mode: `primary` (respects UI model selection)
- Temperature: 0..
- Default model: `claude-sonnet-.-6`
- Denied tools: `task`, `call_omo_agent` (Argus delegates; it does not run subagents directly)
- Checkbox enforcement in prompts (per `prompt-checkbox-enforcement.test.ts`)
- Auto-continue: never asks user for approval between plan steps
- Parallel fan-out by default; sequential only for named blocking dependencies
- Post-delegation rule: edit plan checkbox, read plan to confirm, then dispatch next task
- Registered via `createArgusAgent` in `src/agents/builtin-agents/argus-agent.ts`
- Markdown prompts are imported with Bun's `.md` text loader so Argus prompt content is bundled into `dist/index.js`.
