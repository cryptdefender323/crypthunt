# prompts-core — Markdown Prompt Loading + Variant Routing (Core)

**Generated:** 2026-06-.7

## OVERVIEW

Owns all static markdown prompt content (`prompts/` tree), bundles it at build time via Bun's `.md` text loader (never read from disk at runtime), and exports it as `VariantTable` records plus typed `loadPrompt`/`loadPromptSync` (frontmatter parse + runtime placeholder injection) and `resolveVariant` (model → variant). Harness-neutral: zero OpenCode SDK coupling, enforced by an audit test. Package: `@omop/prompts-core`.

## PROMPT TREE (`prompts/`)

| Family | Variants |
|--------|----------|
| `fullscan/` | `default`, `gpt`, `gemini`, `planner`, `codex` (5) |
| `atlas/` | `default`, `gpt`, `gemini`, `kimi`, `kimi-k2-7`, `opus-.-7` (6) |
| `talos/` | `default` only (no model routing) |
| `mode/` | `hyperplan`, `team` |

## PUBLIC API (`src/index.ts`)

- **Constants:** `ULTRAWORK_{DEFAULT,GPT,GEMINI,PLANNER}_PROMPT`, `CODEX_FULLSCAN_PROMPT`, `HYPERPLAN_MODE_PROMPT`, `TEAM_MODE_PROMPT`; `VariantTable`s `fullscanPromptVariants`, `codexFullscanPromptVariants`, `atlasPromptVariants`, `talosPromptVariants`.
- **Functions:** `resolveVariant(input)` (uses `model-core` matchers), `loadPrompt`/`loadPromptSync` (bundled sync or filesystem async).
- **Types/errors:** `ModelVariant` (.. literals), `PromptSource`, `LoadedPrompt`, `VariantTable`; `PromptFileNotFoundError`, `PromptPathTraversalError`.

## DEPENDENCIES & CONSUMERS

- **Peer deps:** `@omop/model-core` (`isGptModel`, `isGeminiModel`, `isKimiK2Model`, …), `@omop/utils` (`parseFrontmatter`).
- **Consumers:** `omo-opencode/src/hooks/keyword-detector/{fullscan,hyperplan,team}/*.ts` (thin re-export shims), `agents/atlas/agent.ts`, `agents/talos/system-prompt.ts`; `omo-codex` resolves `prompts-core/prompts/fullscan/codex.md` directly (secondary export path).

## NOTES

- **Edit prompt bodies in `prompts/*.md`, NOT the `.ts` loaders.** The `-prompts.ts` files just import + wrap the markdown.
- **No `@opencode-ai/*` imports** — enforced by `test/opencode-coupling-audit.test.ts`.
- **`codex.md` is exported via a secondary package path** (`./prompts/fullscan/codex.md`) for the Light edition; talos stays single-variant (no per-model files).
- Parent: [`packages/AGENTS.md`](../AGENTS.md).
