# @omop/omop-hermes

Hermes Agent harness adapter for **oh-my-open-pentest**.

Installs a native Hermes plugin (`omop`) into `HERMES_HOME/plugins/omop/` and enables it in `config.yaml`. Optionally points Hermes `skills.external_dirs` at OMOP skill trees so the agent can load 250 pentest playbooks.

## Quick install

```bash
bunx oh-my-open-pentest install --platform=hermes --no-tui

HERMES_HOME=/tmp/hermes-test bunx oh-my-open-pentest install --platform=hermes --no-tui
```

Requires [Hermes Agent](https://hermes-agent.nousresearch.com/) installed separately (`hermes` on PATH).

## Layout

| Path | Purpose |
|------|---------|
| `plugin/` | Hermes plugin (Python) |
| `src/install/` | Installer |
| `AGENTS.md` | Maintainer notes |

See [AGENTS.md](./AGENTS.md).
