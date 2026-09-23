# CryptHunter Architecture Gap Matrix
**Audit Date:** 2026-09-23
**Auditor:** Architecture audit via context-gatherer + manual code inspection
**Baseline Commit:** `7857a1f` (cognitive superiority upgrade)
**This Commit:** architecture gap fixes

---

## SUBSYSTEM CLASSIFICATION

| Subsystem | Status | Notes |
|-----------|--------|-------|
| `pentest_hypothesize` tool | **IMPLEMENTED** | Full dedup, 9-step prompts, chain matching |
| `pentest_validate` tool | **IMPLEMENTED** | Evidence ladder L1-L6, L4 CONFIRMED gate enforced in code, adversarial review |
| `pentest_confidence` tool | **IMPLEMENTED** | Read-only query, handoff reminder |
| `pentest_pivot` tool | **IMPLEMENTED** | Pivot recommendations + Gap #5 fix: now persists to disk |
| `pentest_target_model_update` tool | **IMPLEMENTED** | Signal extraction, hypothesis seeds, chain matching |
| `pentest_handoff` tool | **IMPLEMENTED** | Structured handoff package with adversarial review summary |
| Living Attack Model (in-memory) | **IMPLEMENTED** | `Map<string, AttackModel>` in `target-model.ts` |
| Living Attack Model (persistence) | **IMPLEMENTED** ✅ NEW | Gap #1 fixed: `model-persistence.ts` write-through to `.omop/engagement/<sessionId>/attack-model.json` |
| AttackModel compaction survival | **IMPLEMENTED** ✅ NEW | Gap #4 fixed: structured JSON injected into compaction context via `compaction-context-injector` |
| Pivot recommendation persistence | **IMPLEMENTED** ✅ NEW | Gap #5 fixed: `lastPivotRecommendations` persisted to attack-model.json |
| Mode detection (first message) | **IMPLEMENTED** | Keyword/pattern matching in `mode-selector.ts` |
| Mode re-detection mid-session | **IMPLEMENTED** ✅ NEW | Gap #2 fixed: `/mode <name>` clears injection guard, re-runs detection with `mode_switch="true"` attribute |
| Mode as prompt injection | **IMPLEMENTED** | `<PENTEST_CONTEXT>` block injected on first message |
| Mode as execution control | **NOT IMPLEMENTED** | Modes are advisory context only — tool registry is not mode-filtered at runtime |
| Mode specialization (each mode different) | **PARTIAL** | MODE_PRESETS data exists, but all modes execute same generic workflow. No mode-specific tool restriction, agent routing, or report format enforcement at runtime |
| Evidence ladder enforcement | **IMPLEMENTED** | CONFIRMED blocked below L4 in `pentest-validate` code path |
| Adversarial review (10 questions) | **IMPLEMENTED** | 10 review items in validate args, `evaluateComposite` auto-rejects on disqualification |
| False-positive pipeline | **IMPLEMENTED** | Auto-reject when `alternativeExplanationFits && !attackerCapabilityConfirmed` |
| Attack model persistence across restarts | **IMPLEMENTED** ✅ NEW | See Gap #1 above |
| Attack model compaction survival | **IMPLEMENTED** ✅ NEW | See Gap #4 above |
| Tool registry intelligence | **NOT IMPLEMENTED** | Static assembly at startup, all tools always-on, no per-request or per-mode filtering |
| Pentest tools always-on (no mode gate) | **BY DESIGN** | All 6 pentest reasoning tools registered unconditionally |
| Skill loading | **IMPLEMENTED** | `opencode-skill-loader` discovers and loads skills from `.agents/skills/` |
| Session/context persistence | **PARTIAL** | In-memory across turns, compaction-preserved descriptively for general state |
| Benchmark framework | **NOT IMPLEMENTED** | No controlled benchmark environment exists |
| OMOP comparison (measured) | **NOT BENCHMARKED** | No controlled test results exist |
| Unit tests for persistence layer | **NOT TESTED** | `model-persistence.ts` has no test file yet |
| Unit tests for mode re-detection | **NOT TESTED** | `pentest-context/hook.ts` changes have no new tests |
| Attack-chain model | **PARTIAL** | `chain-matcher.ts` matches against known chains, but no user-facing graph visualization or explicit chain assembly workflow |
| Memory affecting future decisions | **PARTIAL** | Attack model signals boost pivot scores (+2 per match), hypothesis dedup prevents re-registration — but failure memory (which tests failed) is NOT persisted or consulted |
| Failure memory | **NOT IMPLEMENTED** | Failed hypotheses are stored in `model.rejected[]` but there is no mechanism that prevents re-testing the same approach |
| Adaptive mode based on evidence | **NOT IMPLEMENTED** | Mode is set at session start and doesn't change based on discovered evidence (except manual `/mode` now) |

---

## GAPS FIXED THIS CYCLE

### Gap #1 — AttackModel file persistence (FIXED)
**Before:** `Map<string, AttackModel>` in process memory only. Process restart = all engagement state lost.
**After:** `model-persistence.ts` implements write-through persistence. Every `updateModel()` call triggers a debounced (300ms) write to `.omop/engagement/<sessionId>/attack-model.json`. Critical transitions (CONFIRMED/REJECTED) call `persistModelNow()` for immediate write. `restoreOrCreateModel()` loads from disk on startup.
**Files changed:**
- `packages/pentest-core/src/intelligence/model-persistence.ts` (new)
- `packages/pentest-core/src/intelligence/target-model.ts` (write-through in `updateModel`)
- `packages/pentest-core/src/intelligence/index.ts` (exports)
- `packages/omop-opencode/src/create-tools.ts` (registers Node.js fs implementation)

### Gap #2 — Mode re-detection mid-session (FIXED)
**Before:** `injectedSessions` Set prevented any re-injection after first message. Changing targets mid-session left stale mode context.
**After:** `/mode <name>` command clears the injection guard and triggers re-detection on the same message. `mode_switch="true"` attribute added to re-injected `<PENTEST_CONTEXT>` block so agent knows context was explicitly switched.
**Files changed:**
- `packages/omop-opencode/src/hooks/pentest-context/hook.ts`

### Gap #4 — AttackModel compaction serialization (FIXED)
**Before:** Compaction context template said "preserve state variables" but `AttackModel` was never structurally serialized — only descriptive LLM summarization.
**After:** `inject()` function in `compaction-context-injector/hook.ts` now calls `serializeModelToJson()` and appends full structured JSON to compaction context when model has non-empty state. Includes instructions for post-compaction restoration via `pentest_target_model_update` + `pentest_hypothesize`.
**Files changed:**
- `packages/omop-opencode/src/hooks/compaction-context-injector/hook.ts`

### Gap #5 — Pivot recommendation persistence (FIXED)
**Before:** `computePivot()` results returned to agent but never stored. Restart = no memory of which skills/tools were recommended and why.
**After:** `pentest_pivot` tool calls `persistPivotRecommendations()` after `computePivot()`, storing `lastPivotRecommendations` with observation, ranked skill/tool names, and chain gap IDs into `attack-model.json`.
**Files changed:**
- `packages/omop-opencode/src/tools/pentest-pivot/tools.ts`

---

## REMAINING GAPS (PRIORITIZED)

### Priority 1 — Failure Memory
**Current state:** `model.rejected[]` stores hypothesis IDs but nothing about WHY they were rejected or what tests failed. Next session on same target will re-test same vectors.
**Required:** Persist `{ hypothesisId, vulnClass, asset, endpoint, rejectedReason, failedApproaches[] }` into attack model. Consult before generating new hypotheses for same asset+endpoint.
**Files to change:** `hypothesis-store.ts`, `model-persistence.ts`, `pentest-hypothesize/tools.ts`

### Priority 2 — Mode as execution control (not just prompt injection)
**Current state:** Modes are `<PENTEST_CONTEXT>` prompt text. Agent ignores it if distracted.
**Required:** Mode-specific tool filtering in `tool-registry.ts`. Red-team mode should suppress nuclei (too noisy). CTF mode should not require CVSS. Bug-bounty mode should enforce scope_strict.
**Files to change:** `tool-registry.ts`, `tool-registry-core-tools.ts`, `pentest-context/hook.ts`

### Priority 3 — Unit tests for new persistence layer
**Current state:** `model-persistence.ts` has zero tests. Injectable `PersistenceFs` interface was designed for testability.
**Required:** `model-persistence.test.ts` with given/when/then tests for: write-through on updateModel, debounce behavior, restore from disk, compaction context injection, pivot persistence.
**Files to change:** `packages/pentest-core/src/intelligence/model-persistence.test.ts` (new)

### Priority 4 — Benchmark framework
**Current state:** NOT IMPLEMENTED. No controlled environment.
**Required:** Local DVWA/VulnHub/HackTheBox API lab + benchmark runner that measures useful findings, FP rate, evidence quality, attack-chain completion vs OMOP on same scenario.
**Files to change:** `.omop/benchmarks/` (new directory)

### Priority 5 — Adaptive mode based on evidence
**Current state:** Mode is set at session start based on first-message keyword matching.
**Required:** When pentest_target_model_update detects technology signals (e.g., Active Directory keywords, cloud assets), automatically suggest mode switch if current mode is less specific than what evidence supports.
**Files to change:** `pentest-target-model-update/tools.ts`, `pentest-context/hook.ts`

---

## OMOP COMPARISON

| Dimension | OMOP | CryptHunter | Delta |
|-----------|------|-------------|-------|
| CTF depth | 4 basic skills | 30+ category-specific skills | CryptHunter ahead |
| Reasoning model | Tool summarization | Hypothesis graph + evidence ladder + adversarial review | CryptHunter ahead (architecture) |
| Attack model state | Unknown | In-memory + file persistent | CryptHunter ahead |
| Compaction survival | Unknown | Structured JSON in compaction context | CryptHunter ahead |
| Engagement memory | Unknown | Per-session disk persistence | CryptHunter ahead |
| Benchmark evidence | NOT BENCHMARKED | NOT BENCHMARKED | EQUAL (neither measured) |
| Test coverage for reasoning layer | Unknown | PARTIAL (existing tests, no new persistence tests) | NEEDS WORK |
| Mode execution control | Unknown | Prompt-only (partial) | NEEDS WORK |
| Failure memory | Unknown | NOT IMPLEMENTED | NEEDS WORK |

**Honest verdict:** CryptHunter has superior architecture on paper (hypothesis lifecycle, evidence ladder, adversarial review, persistence). Benchmark evidence does not exist to claim runtime superiority. The gap between architecture and measured outcomes remains open.

---

## NOT IMPLEMENTED

- Controlled benchmark environment
- Failure memory (failed approaches not consulted)
- Mode as hard execution control (tool restriction per mode)
- Attack surface graph visualization
- Vulnerability graph
- Regression test suite for reasoning layer
- Benchmark comparison with OMOP

## NOT TESTED

- `model-persistence.ts` — no unit tests
- `pentest-context/hook.ts` mode re-detection — no new tests
- AttackModel compaction injection — no integration tests
- Pivot persistence — no tests

## NOT BENCHMARKED

- Useful findings per engagement
- False positive rate
- Evidence quality score
- Attack chain completion rate
- Recovery from failures
- Tool efficiency
- OMOP vs CryptHunter on controlled scenarios
