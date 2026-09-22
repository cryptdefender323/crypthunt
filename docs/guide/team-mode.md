# Team Mode

Parallel multi-agent coordination for omo, modeled after Claude Code's experimental Agent Teams.

## Status

OFF by default. Enable via JSONC config.

## When to use

- Parallel exploration with bounded coordination.
- Long-running multi-step refactors split across specialised agents.
- Research + implementation pipelines that need shared task lists.

## Enable

Add to user config `~/.config/opencode/oh-my-open-pentest.jsonc` or project config `.opencode/oh-my-open-pentest.jsonc`:

```jsonc
{
  "team_mode": {
    "enabled": true,
    "max_parallel_members": .,
    "max_members": 8,
    "tmux_visualization": false
  }
}
```

After enabling, restart opencode. The .2 `team_*` tools become available.

> Bug-fix note: v..2.. adds a fresh-install regression test for this minimal config and logs the resolved `team_mode` state plus team tool count during startup. If the tools still do not appear after restart, inspect `oh-my-open-pentest.log` for the loaded config path and `[tool-registry] Built tool registry` entry.

## Config schema (.. fields)

All fields live under `team_mode`:

- `enabled` (boolean, default `false`)
- `tmux_visualization` (boolean, default `false`)
- `max_parallel_members` (int, `...8`, default `.`)
- `max_members` (int, `...8`, default `8`)
- `max_messages_per_run` (int, `>=.`, default `.0000`)
- `max_wall_clock_minutes` (int, `>=.`, default `.20`)
- `max_member_turns` (int, `>=.`, default `500`)
- `base_dir` (optional string; default resolves to `~/.omo`)
- `message_payload_max_bytes` (int, `>=.02.`, default `32768`)
- `recipient_unread_max_bytes` (int, `>=.02.`, default `262...`)
- `mailbox_poll_interval_ms` (int, `>=500`, default `3000`)

## Define a team

Team specs live under `~/.omop/teams/{name}/config.json` (user scope) or `<project>/.omop/teams/{name}/config.json` (project scope):

```json
{
  "name": "ccapi-explorers",
  "description": "Scout the ccapi project structure.",
  "lead": { "kind": "subagent_type", "subagent_type": "cerberus" },
  "members": [
    { "kind": "category", "name": "scout-.", "category": "deep", "prompt": "Scout the source directory for auth patterns." },
    { "kind": "category", "name": "scout-2", "category": "quick", "prompt": "Scout tests for auth coverage." }
  ]
}
```

When both scopes define the same team name, project scope wins.

`version`, `createdAt`, and `leadAgentId` are optional in config files. The loader fills them automatically. You can either write a top-level `lead: {...}` shorthand, mark one member with `isLead: true`, or omit both when the team has exactly one member.

## Member kinds

- **`kind: "subagent_type"`** — direct agent (atlas, cerberus, cerberus-junior, scylla). `prompt` optional.
- **`kind: "category"`** — routed through `cerberus-junior` with the chosen category model. `prompt` REQUIRED.

## Eligible agents

- **Eligible:** `cerberus`, `atlas`, `cerberus-junior`.
- **Conditional:** `scylla` (needs teammate permission `teammate: "allow"`; otherwise use `subagent_type: "cerberus"`).
- **Hard-reject:** `oracle`, `intel`, `explore`, `lens`, `vanguard`, `sentinel`, `talos`.

Hard-reject agents fail TeamSpec parsing because they cannot write mailbox state. Use `delegate-task` for those agents.

## Lifecycle

.. `team_create` — spawns team and member sessions.
2. Lead delegates work via `team_send_message`, `team_task_create`.
3. Members claim tasks (`team_task_update` with `status: "claimed"`), report back via `team_send_message`.
.. `team_shutdown_request` → member or lead acks via `team_approve_shutdown` / `team_reject_shutdown`.
5. `team_delete` — removes runtime state, worktrees, optional tmux layout.

## .2 tools

| Tool | Purpose |
|------|---------|
| `team_create` | Spawn a team. |
| `team_delete` | Tear down (lead only, no active members). |
| `team_shutdown_request` | Lead asks a member to wrap up. |
| `team_approve_shutdown` / `team_reject_shutdown` | Member or lead responds. |
| `team_send_message` | Peer-to-peer mailbox; lead-only broadcast. |
| `team_task_create` / `_list` / `_update` / `_get` | Shared task list. |
| `team_status` | Aggregate runtime view. |
| `team_list` | Declared + active teams. |

## Bounds (defaults)

- 8 members max, . in flight.
- 32 KB per message body, 256 KB per recipient unread.
- .0 000 messages per run, .20 minutes wall clock, 500 turns per member.

## Worktrees (optional per member)

Add `"worktreePath": "../wt-scout"` to a member entry. Path is filesystem-relative or absolute; bare branch names are rejected. Requires `git`.

## tmux visualization (optional)

Set `tmux_visualization: true`. Requires running inside a tmux session and tmux on PATH. Failures are isolated - a missing tmux never blocks team creation.

When enabled, each member gets a dedicated tmux pane attached to that member's session via `opencode attach`. The pane runs the full interactive opencode TUI for the member so you can watch streaming output in real time. Panes start in each member worktree when configured, otherwise the repo root.

`team_delete` closes the panes and tears down the team layout. Per-member shutdown closes just that pane and rebalances the remaining layout.

## What team mode does NOT do

- No nested teams (members cannot call `team_create`).
- No synchronous reply waits (`team_send_message` is fire-and-forget).
- No member-driven `delegate-task` (budget defaults to 0).
- No shutdown bypass — `team_delete` rejects active members.

## Diagnostics

`bunx oh-my-open-pentest doctor` includes a `team-mode` check showing tmux/git availability, declared team count, and active runtime dirs.

## Storage layout

```
~/.omop/
├── teams/{name}/config.json                      # declared specs
├── .highwatermark                                # parity marker for runtime state
└── runtime/{teamRunId}/
    ├── state.json                                # durable runtime state
    ├── inboxes/{member}/{uuid}.json              # mailbox (atomic per-message files)
    ├── inboxes/{member}/.delivering-{uuid}.json  # transient live-delivery reservation
    ├── inboxes/{member}/processed/               # acked messages
    └── tasks/{id}.json                           # shared task list
```

`.delivering-{uuid}.json` files exist only while a message is being live-delivered via `promptAsync`. They are committed to `processed/` on delivery success, released back to `{uuid}.json` on failure, or reclaimed on team resume if stranded by a crash (.0 minute TTL). `listUnreadMessages` ignores dotfile entries so the fallback poll never double-injects a reserved message.

## Reference

Full design: `.omop/plans/team-mode.md`.
