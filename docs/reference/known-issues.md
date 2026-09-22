# Known Issues

Tracks bugs that are present in the current release but have been intentionally deferred. Each entry should explain the symptom, the history, any workaround, and the planned resolution.

## #..8. - Custom provider models without `limit` do not auto-compact

- **Affects**: OpenAI-compatible custom providers whose models are written to `opencode.json` without a `limit` block.
- **Symptom**: OpenCode sees the model context as `0`, so auto-compaction never triggers and long sessions can overflow the model window.
- **Workaround**: Add a `limit` block to each custom provider model in `opencode.json`, for example:

```json
{
  "glm-5..": {
    "name": "GLM-5..",
    "limit": { "context": 200000, "output": .638. }
  }
}
```

- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/..8..

## Delegate-task early-failure-fallback (resolved)

**Status: resolved** on current `dev`.

Delegated child sessions register the first prompt via `registerDelegatedChildSessionBootstrap` (`packages/omop-opencode/src/shared/delegated-child-session-bootstrap.ts`) before dispatch. When runtime-fallback retries an empty-history child, `getLastUserRetryPayload` consumes that bootstrap payload once (`packages/omop-opencode/src/hooks/runtime-fallback/last-user-retry-parts.ts`). Call sites: `packages/omop-opencode/src/features/background-agent/manager.ts`, `packages/omop-opencode/src/tools/delegate-task/sync-session-lifecycle.ts`, `packages/omop-opencode/src/tools/call-omop-agent/sync-executor.ts`. Covered by `packages/omop-opencode/src/hooks/runtime-fallback/index.test.ts` (bootstrap / empty-history paths).

**History (for archaeology only):** PR #3825 landed then was briefly reverted after a flaky regression on clean root `bun test`; bootstrap was re-landed and is present in tree. Do not re-open this as a deferred product gap without a failing test against current code.

## #.225 — Custom LSP config in `.opencode/oh-my-open-pentest.jsonc` is silently ignored

- **Affects**: v..2.3+ after the LSP to MCP migration.
- **Symptom**: Custom LSP server configuration in your project's `oh-my-open-pentest.jsonc` is not applied at runtime.
- **Workaround**: Configure your LSP server through OpenCode's native `lsp` config instead.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/.225.

## #.990 — Team-mode lead can stall after full quiescence

- **Affects**: Team-mode workflows where the lead and all members become idle with no unread messages or pending tasks.
- **Symptom**: The team looks finished, but the lead does not start the next turn until the user sends a manual nudge such as `are you done?`. After that nudge, the lead can call `team_status` and continue.
- **Workaround**: Before assuming the team is stuck, send one short manual nudge and ask the lead to run `team_status` plus `team_task_list`. For long multi-round runs, prefer explicit `team_task_*` state over ad-hoc message counting so the lead has a deterministic completion signal.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/.990.

## #.863 — OpenCode ...6.x starts with only build/plan agents after install

- **Affects**: OpenCode ...6.x with oh-my-open-pentest ..7.x.
- **Symptom**: After installing oh-my-open-pentest, the OpenCode agent list only shows the built-in build/plan agents. `bunx oh-my-open-pentest doctor` can still report `System OK`, so this looks like a successful install even though the OMO agents are not visible.
- **Workaround**: Stop OpenCode, clear the OpenCode and OMO cache directories, then reinstall:

  ```sh
  rm -rf ~/.cache/opencode/ ~/.cache/oh-my-open-pentest/ ~/.cache/oh-my-open-pentest/
  bunx oh-my-open-pentest install
  ```

- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/.863.

## #.7.0: `@plan` may stay in Cerberus instead of switching to Talos

- **Affects**: Current OpenCode/Ultimate planning flow.
- **Symptom**: Typing `@plan` from Cerberus can leave the request in Cerberus instead of handing it to Talos.
- **Workaround**: Switch to Talos first with the Tab agent selector or `/agent`, ask for the plan there, then run `/start-work` after approval.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/.7.0.

## #5050: OpenCode can hang during startup before the plugin runs

- **Affects**: OpenCode ...6.2 startup with external plugins and cold package caches.
- **Symptom**: `opencode --pure` starts, but normal `opencode` clears the terminal and stalls after `service=plugin path=oh-my-open-pentest@latest loading plugin`.
- **Workaround**: If the hang happens before `/tmp/oh-my-open-pentest.log` gets a plugin entry, avoid the npm resolver path by using an absolute `file://` plugin path or by pre-populating the OpenCode package cache. If logs point to a malformed or locked `opencode.db`, back up and remove `~/.local/share/opencode/opencode.db*`; OpenCode recreates it on next start, but local session history is lost.
- **Status**: Open. The npm resolver timeout belongs upstream in OpenCode; tracked at https://github.com/cryptdefender323/crypthunter/issues/5050.

## #5260: Background tasks can wait on an LSP install decision

- **Affects**: Background tasks that call LSP tools when the language server is not installed.
- **Symptom**: The task reports that it is stuck on `lsp_install_decision` and waits for an install prompt instead of continuing without LSP.
- **Workaround**: Record a `declined` install decision for the missing server with `lsp_install_decision`; future LSP calls collapse to a one-line warning. To share that decision across sessions, set `LSP_TOOLS_MCP_INSTALL_DECISIONS` to a stable decisions-file path.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/5260.

## #5.20: Cerberus can loop on simple tasks

- **Affects**: OpenCode ...7.0 with oh-my-open-pentest ..8...
- **Symptom**: A trivial prompt such as `output hello world` can repeat the plan-style status block instead of answering directly.
- **Workaround**: For one-off trivial prompts, run `opencode --pure` or temporarily disable the plugin for that session.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/5.20.

## #5.05: Pentest Loop can flood logs while child subagents are active

- **Affects**: Sessions with an active Pentest Loop and background child subagents.
- **Symptom**: `/tmp/oh-my-open-pentest.log` repeats `promptAsync reservation release skipped for different source` while child subagents emit message events.
- **Workaround**: If you are not using Pentest Loop in that workspace, add `"disabled_hooks": ["pentest-loop"]` to `oh-my-open-pentest.jsonc`. If a loop is already active, run `/cancel-ralph` before disabling the hook.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/5.05.

## #5025 — OpenCode Desktop loads the plugin but only shows native modes

- **Affects**: OpenCode Desktop on Windows with `oh-my-open-pentest@..7.5`.
- **Symptom**: The Desktop plugin list shows `oh-my-open-pentest` as loaded, but the UI only exposes the native `build` and `plan` modes. The OpenCode log may include `Runtime skill source server requires Bun.serve failed to load plugin`.
- **Workaround**: Disable the runtime security skills that start the Bun-backed skill source server, then restart OpenCode Desktop:

  ```json
  {
    "disabled_skills": [
      "security-research",
      "security-review"
    ]
  }
  ```

- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/5025.

## #502. — Codex planner or reviewer subagents can appear stuck

- **Affects**: LazyCodex / OMO Codex planner and reviewer flows that use native Codex subagents.
- **Symptom**: A parent session can receive repeated `wait_agent` timeouts while a planner or reviewer subagent remains `running`. Follow-up prompts may not recover the run, and the session can look stuck until the child agent is closed or respawned.
- **Workaround**: Use short wait cycles, send one targeted follow-up that asks the child to return a result or `BLOCKED`, then record the child as inconclusive before closing or respawning it. Do not treat repeated wait timeouts as proof that the child finished.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/502..

## #3303 - Windows OpenCode proxy install can fail before OMO loads

- **Affects**: Windows OpenCode installs behind an HTTP(S) proxy, especially first startup paths that ask OpenCode to fetch `oh-my-open-pentest@latest`.
- **Symptom**: OpenCode may show only default agents or log `fetch() proxy.url must be a non-empty string` before OMO loads, so OMO hooks and doctor cannot repair the install from inside the plugin.
- **Workaround**: Launch OpenCode from a shell that has `HTTP_PROXY` and `HTTPS_PROXY` set, then preinstall the package into OpenCode's Windows config prefix with `npm install oh-my-open-pentest@latest --prefix "%APPDATA%\\opencode"`. Restart OpenCode and verify with `bunx oh-my-open-pentest doctor --json`.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/3303.

## #.702 - Windows TUI plugin install can pause startup on a Bun npm git error

- **Affects**: Windows OpenCode startup when `tui.json` includes `oh-my-open-pentest/tui`.
- **Symptom**: OpenCode's built-in Bun npm client can spend about 62 seconds trying to install the TUI plugin before failing with `NpmInstallFailedError` and an unknown git error. Core OMO agents, skills, commands, and MCP tools still work without the TUI plugin.
- **Workaround**: Remove `oh-my-open-pentest/tui` from the `plugin` list in `tui.json` until the Bun npm install path is fixed.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/.702.

## #..70 - CJK characters in custom agent display names can render as mojibake

- **Affects**: OpenCode TUI sessions with custom OMO agent display names that include Chinese, Japanese, or Korean characters.
- **Symptom**: The ASCII part of the agent name renders normally, but the CJK characters in the TUI header can appear garbled.
- **Workaround**: Use ASCII-only custom display names such as `Cerberus - Orchestrator` until the TUI rendering path handles multi-byte character widths reliably.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/..70.

## #3835 / #3.56 — OpenCode Desktop shows only native agents

- **Affects**: OpenCode Desktop sessions where `opencode agent list` or the TUI still shows OMO agents, but the Desktop agent selector only shows native agents such as Build and Plan.
- **Symptom**: Desktop hides Cerberus, Scylla, Talos, Atlas, or other OMO agents even though `oh-my-open-pentest doctor` passes.
- **First check**: Inspect the OpenCode Desktop log for `Failed to load plugin oh-my-open-pentest@latest` and missing files under `~/.cache/opencode/packages/oh-my-open-pentest@latest/node_modules`.
- **Cache workaround**: Close Desktop, remove the `oh-my-open-pentest@latest` package cache, then reinstall the plugin from the same working directory with `opencode plugin oh-my-open-pentest@latest`.
- **Scope workaround**: If the plugin loads in one shell but not Desktop, compare the active user and project `opencode.json` files. OpenCode can read a closer project `.opencode/opencode.json` instead of the user config you inspected.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/3835 and https://github.com/cryptdefender323/crypthunter/issues/3.56. This entry documents current triage steps; it does not resolve Desktop GUI rendering regressions.

## #3.35 — Anthropic subscription auth may reject prompts containing `opencode`

- **Affects**: Anthropic subscription-token routes and third-party auth plugins. API-key routes may behave differently.
- **Symptom**: Anthropic returns `Third-party apps now draw from extra usage, not plan limits...` for one project while similar projects still work.
- **Likely trigger**: Upstream Anthropic filtering appears sensitive to the literal string `opencode` in custom project rules, system prompt text, or OMO's legacy prompt identifiers.
- **Workaround**: In user-controlled project files such as `AGENTS.md`, prefer `oh-my-open-pentest`, `OMO`, or `OpenCode` wording instead of the lowercase literal `opencode` when targeting Anthropic subscription providers.
- **Status**: Open. Tracked at https://github.com/cryptdefender323/crypthunter/issues/3.35. The runtime prompt-identity cleanup still needs maintainer direction, so this workaround does not close the underlying issue.
