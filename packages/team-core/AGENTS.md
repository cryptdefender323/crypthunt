# team-core — Team-Mode Domain Primitives (Core)

**Generated:** 2026-06-.6

## OVERVIEW

Harness-neutral domain primitives for team-mode: registry, mailbox, tasklist, state store, worktree, and tmux layout. Consumed by the OpenCode adapter at [omo-opencode team-mode](../omop-opencode/src/features/team-mode/AGENTS.md) (gated on `team_mode.enabled`). Package: `@omop/team-core`.

## DOMAIN PRIMITIVES

| Area | Files | Purpose |
|------|-------|---------|
| **Registry** | `team-registry/paths.ts`, `loader.ts`, `validator.ts`, `team-spec-input-normalizer.ts` | Discover/load `config.json` from `~/.omop/teams/{name}/` and `<project>/.omop/teams/{name}/`. Validate member eligibility, hyperplan composition, and path traversal guards. |
| **Mailbox** | `team-mailbox/send.ts`, `inbox.ts`, `poll.ts`, `ack.ts`, `reservation.ts` | Async member messaging with payload caps, broadcast gating, unread polling, delivery reservations, and pending-delivery recovery. |
| **Tasklist** | `team-tasklist/store.ts`, `list.ts`, `get.ts`, `claim.ts`, `update.ts`, `dependencies.ts` | Shared task CRUD with atomic claiming, dependency tracking, and status transitions. |
| **State Store** | `team-state-store/store.ts`, `locks.ts`, `resume.ts`, `runtime-cleanup.ts`, `session-liveness.ts` | Durable runtime `state.json` with atomic file locks, allowed status transitions, resume/recovery, and stale-run cleanup. |
| **Worktree** | `team-worktree/manager.ts`, `cleanup.ts` | Per-member git worktree creation, validation, and orphan removal. |
| **Tmux Layout** | `team-layout-tmux/layout.ts`, `resolve-caller-tmux-session.ts`, `rebalance-team-window.ts`, `sweep-stale-team-sessions.ts` | Optional tmux focus + grid pane layout, stale session sweep, and pane cleanup. |

## STORAGE

Team specs live under `~/.omop/teams/{name}/config.json` (user) and `<project>/.omop/teams/{name}/config.json` (project). Runtime state, mailbox inboxes, and tasks are stored under `~/.omop/runtime/{teamRunId}/`. Worktrees are under `~/.omop/worktrees/{teamRunId}/{member}/`.

## NOTES

- **78 TypeScript files** across the 6 primitives plus shared types, config, and logger.
- **Zod schemas** in `types.ts` define `TeamSpec`, `Member`, `Message`, `Task`, `RuntimeState`, and `AGENT_ELIGIBILITY_REGISTRY`.
- **Eligible agents** are cerberus, atlas, cerberus-junior, and scylla (conditional). Hard-reject agents are blocked at parse time.
- **Atomic writes** via `team-state-store/locks.ts`: temp file + rename, with file-based locking for task claims and state transitions.
- Parent: [`packages/AGENTS.md`](../AGENTS.md).
