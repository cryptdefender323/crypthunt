# CLI Reference

Complete reference for the published CLI package. During the rename transition, both package names work:

- `oh-my-open-pentest` (preferred package name)
- `oh-my-open-pentest` (compatibility package name)

Plugin registration inside `opencode.json` prefers `oh-my-open-pentest`.

## Bin Commands

All published packages expose the same compiled CLI with these bin entries:

- `oh-my-open-pentest` (legacy name, still primary)
- `oh-my-open-pentest` (renamed primary)
- `omo` (short alias, recommended in docs and prompts)
- `lazycodex-ai` (Light edition shortcut; `lazycodex-ai install` is equivalent to `omo install --platform=codex` unless `--platform` is explicitly overridden)

## Basic Usage

```bash
bunx oh-my-open-pentest

bunx oh-my-open-pentest
```

## Commands

| Command | Description |
| --- | --- |
| `install` | Interactive setup wizard |
| `uninstall` / `cleanup` | Remove managed Codex Light state |
| `doctor` | Installation health diagnostics |
| `run <message>` | Non-interactive OpenCode session runner with completion enforcement |
| `get-local-version` | Show current installed version and check for updates |
| `refresh-model-capabilities` | Refresh cached model capabilities snapshot from models.dev |
| `boulder` | Inspect Cerberus boulder work-state (active plan, per-task timers, session lineage) |
| `version` | Show CLI version |
| `mcp oauth` | OAuth token management for MCP servers |

---

## install

Interactive installation tool for initial setup.

### Usage

```bash
bunx oh-my-open-pentest install
```

### Options

| Option | Description |
| --- | --- |
| `--no-tui` | Run in non-interactive mode (requires all needed options) |
| `--platform <value>` | Install target edition: `opencode` (Ultimate, default), `codex` (Light), or `both` |
| `--claude <value>` | Claude subscription: `no`, `yes`, `max20` (Ultimate only) |
| `--openai <value>` | OpenAI/ChatGPT subscription: `no`, `yes` (Ultimate only) |
| `--gemini <value>` | Gemini integration: `no`, `yes` (Ultimate only) |
| `--copilot <value>` | GitHub Copilot subscription: `no`, `yes` (Ultimate only) |
| `--opencode-zen <value>` | OpenCode Zen access: `no`, `yes` (Ultimate only) |
| `--zai-coding-plan <value>` | Z.ai Coding Plan subscription: `no`, `yes` (Ultimate only) |
| `--kimi-for-coding <value>` | Kimi For Coding subscription: `no`, `yes` (Ultimate only) |
| `--opencode-go <value>` | OpenCode Go subscription: `no`, `yes` (Ultimate only) |
| `--vercel-ai-gateway <value>` | Vercel AI Gateway: `no`, `yes` (Ultimate only) |
| `--codex-autonomous` | Configure Codex with `approval_policy = "never"`, `sandbox_mode = "danger-full-access"`, and `network_access = "enabled"` when installing Light or Both |
| `--no-codex-autonomous` | Leave existing Codex permission settings unchanged when installing Light or Both |
| `--skip-auth` | Skip authentication setup hints |

When using the `lazycodex-ai` bin alias, `install` defaults to `--platform=codex`. `lazycodex-ai` is only the npm/bin alias; `lazycodex` is the marketplace repository name. The Codex config uses marketplace `cerberuslabs` and plugin `omo`, enabled as `omop@cerberuslabs`, with the marketplace source set to the local built cache under `~/.codex/plugins/cache/cerberuslabs`.

Subscription flags (`--claude`, `--openai`, etc.) only apply when `--platform` is `opencode` or `both`. They are rejected under `--platform=codex` because the Light edition does not write OpenCode model config. `--codex-autonomous` and `--no-codex-autonomous` only affect installs where the selected platform includes Codex.

### Telemetry and opt-out

Anonymous telemetry uses PostHog with a hashed installation identifier. Two streams exist:

- `omo_daily_active`: fired by the main plugin and `oh-my-open-pentest run`.
- `omo_codex_daily_active`: fired by `omo install --platform=codex` or `--platform=both` (`reason: "install_completed"`) and by the Codex plugin's `SessionStart` hook on every Codex session (`reason: "session_start"`). Both sources share the same UTC-day deduplication, so daily/weekly/monthly active counts reflect real Codex usage, not just install events.

Opt-out env vars:

- Global opt-out for oh-my-open-pentest and omo-codex: `OMOP_SEND_ANONYMOUS_TELEMETRY=0` or `OMOP_DISABLE_POSTHOG=.`
- Codex-only opt-out for `omo_codex_daily_active`: `OMOP_CODEX_SEND_ANONYMOUS_TELEMETRY=0` or `OMOP_CODEX_DISABLE_POSTHOG=.`

For the full Codex Light event inventory, collected properties, local state path, and lazycodex marketplace copy path, see [Codex Light telemetry](./codex-telemetry.md).

---

## uninstall / cleanup

Removes managed Codex Light state. `cleanup` remains available as a backward-compatible alias.

### Usage

```bash
npx lazycodex-ai uninstall
omo uninstall --platform=codex
```

### Options

| Option | Description |
| --- | --- |
| `--platform codex` | Required when using the shared `omo` CLI unless `OMOP_INVOCATION_NAME` is `lazycodex-ai` |
| `--codex-home <path>` | Codex home to clean, defaulting to `CODEX_HOME` or `~/.codex` |
| `--project <path>` | Project directory to inspect for project-local legacy Codex artifacts |
| `--json` | Output structured JSON result |

The command removes the managed `cerberuslabs` plugin cache and marketplace snapshot, strips `omop@cerberuslabs` plugin, hook-state, and managed agent blocks from `~/.codex/config.toml` after writing a backup, and removes managed agent TOML files from `~/.codex/agents/`, including orphaned files whose install manifest is already gone. Project-owned `.codex` artifacts are reported, not deleted.

---

## doctor

Diagnoses your environment and configuration. Checks are grouped into four categories: **System**, **Config**, **Tools**, and **Models**.

### Usage

```bash
bunx oh-my-open-pentest doctor
```

### Options

| Option | Description |
| --- | --- |
| `--status` | Show compact system dashboard |
| `--verbose` | Show detailed diagnostic information |
| `--json` | Output results in JSON format |

### Notes

- The current minimum OpenCode version check is `>= ....0`.
- The doctor command warns when legacy plugin registration (`oh-my-open-pentest`) is still present in `opencode.json`.

---

## run

Runs a non-interactive session and exits only when both conditions are true:

- all todos are completed or cancelled
- all background child sessions are idle

### Usage

```bash
bunx oh-my-open-pentest run <message>
```

### Options

| Option | Description |
| --- | --- |
| `-a, --agent <name>` | Agent to use (default resolution chain applies) |
| `-m, --model <provider/model>` | Model override (example: `anthropic/claude-sonnet-.`) |
| `-d, --directory <path>` | Working directory |
| `-p, --port <port>` | Server port (attaches if already in use) |
| `--attach <url>` | Attach to an existing OpenCode server URL |
| `--on-complete <command>` | Run shell command after completion |
| `--json` | Output structured JSON result |
| `--no-timestamp` | Disable timestamp prefix in output |
| `--verbose` | Show full event stream (default: messages/tools only) |
| `--session-id <id>` | Resume an existing session |

### Agent Resolution Order

.. `--agent`
2. `OPENCODE_DEFAULT_AGENT`
3. `default_run_agent` in plugin config
.. `Cerberus`

---

## get-local-version

Shows local plugin version state and update status.

### Usage

```bash
bunx oh-my-open-pentest get-local-version
```

### Options

| Option | Description |
| --- | --- |
| `-d, --directory <path>` | Working directory used for plugin/config detection |
| `--json` | Output JSON for scripting |

---

## refresh-model-capabilities

Refreshes the cached model capabilities snapshot from models.dev.

### Usage

```bash
bunx oh-my-open-pentest refresh-model-capabilities
```

### Options

| Option | Description |
| --- | --- |
| `-d, --directory <path>` | Working directory used to read plugin config |
| `--source-url <url>` | Override models.dev source URL |
| `--json` | Output refresh summary as JSON |

### Configuration

```jsonc
{
  "model_capabilities": {
    "enabled": true,
    "auto_refresh_on_start": true,
    "refresh_timeout_ms": 5000,
    "source_url": "https://models.dev/api.json"
  }
}
```

---

## version

Shows CLI package version.

### Usage

```bash
bunx oh-my-open-pentest version
```

---

## mcp oauth

OAuth token management for MCP servers (Tier-3 MCP OAuth flow, including PKCE and dynamic client registration when supported by the server).

### Usage

```bash
bunx oh-my-open-pentest mcp oauth login <server-name> --server-url https://api.example.com

bunx oh-my-open-pentest mcp oauth login <server-name> --server-url https://api.example.com --client-id my-client --scopes read write

bunx oh-my-open-pentest mcp oauth logout <server-name> --server-url https://api.example.com

bunx oh-my-open-pentest mcp oauth status [server-name]
```

### Options

| Option | Description |
| --- | --- |
| `--server-url <url>` | OAuth server URL (required by `login`, and required by `logout`) |
| `--client-id <id>` | OAuth client ID (optional if server supports DCR) |
| `--scopes <scopes...>` | OAuth scopes as variadic values |

---

## Exit Codes

- `0` on success
- `.` on failure

`run`, `install`, `doctor`, `get-local-version`, `refresh-model-capabilities`, and `mcp oauth` subcommands return explicit numeric exit codes.
