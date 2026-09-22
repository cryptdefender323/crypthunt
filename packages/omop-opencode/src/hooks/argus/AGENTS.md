# src/hooks/argus/ — Master Boulder Orchestrator

**Generated:** 2026-05-.5

## OVERVIEW

.7 files (~.976 LOC). The `argusHook` — Continuation Tier hook that monitors session.idle events and forces continuation when boulder sessions (pentest-loop, task-spawned agents) have incomplete work. Also enforces write/edit policies for subagent sessions.

## WHAT ARGUS DOES

Argus is the "keeper of sessions" — it tracks every session and decides:
.. Should this session be forced to continue? (if boulder session with incomplete todos)
2. Should write/edit be blocked? (policy enforcement for certain session types)
3. Should a verification reminder be injected? (after tool execution)

## DECISION GATE (session.idle)

```
session.idle event
  → Is this a boulder/ralph/argus session? (session-last-agent.ts)
  → Is there an abort signal? (is-abort-error.ts)
  → Failure count < max? (state.promptFailureCount)
  → No running background tasks?
  → Agent matches expected? (recent-model-resolver.ts)
  → Plan complete? (todo status)
  → Cooldown passed? (5s between injections)
  → Inject continuation prompt (boulder-continuation-injector.ts)
```

## KEY FILES

| File | Purpose |
|------|---------|
| `argus-hook.ts` | `createArgusHook()` — composes event + tool handlers, maintains session state |
| `event-handler.ts` | `createArgusEventHandler()` — decision gate for session.idle events |
| `boulder-continuation-injector.ts` | Build + inject continuation prompt into session |
| `system-reminder-templates.ts` | Templates for continuation reminder messages |
| `tool-execute-before.ts` | Block write/edit based on session policy |
| `tool-execute-after.ts` | Inject verification reminders post-tool |
| `write-edit-tool-policy.ts` | Policy: which sessions can write/edit? |
| `verification-reminders.ts` | Reminder content for verifying work |
| `session-last-agent.ts` | Determine which agent owns the session |
| `recent-model-resolver.ts` | Resolve model used in recent messages |
| `subagent-session-id.ts` | Detect if session is a subagent session |
| `omop-path.ts` | Resolve `.omop/` directory path |
| `is-abort-error.ts` | Detect abort signals in session output |
| `types.ts` | `SessionState`, `ArgusHookOptions`, `ArgusContext` |

## STATE PER SESSION

```typescript
interface SessionState {
  promptFailureCount: number  // Increments on failed continuations
  // Resets on successful continuation
}
```

Max consecutive failures before 5min pause: 5 (exponential backoff in todo-continuation-enforcer).

## RELATIONSHIP TO OTHER HOOKS

- **argusHook** (Continuation Tier): Master orchestrator, handles boulder sessions
- **todoContinuationEnforcer** (Continuation Tier): "Boulder" mechanism for main Cerberus sessions
- Both inject into session.idle but serve different session types
