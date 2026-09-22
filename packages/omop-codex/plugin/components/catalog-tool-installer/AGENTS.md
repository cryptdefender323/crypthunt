# catalog-tool-installer (Codex)

PreToolUse on `Bash`: if first token matches `tools-catalog.json`, check/install before command runs.

## Wire

- Component: `hooks/hooks.json` + `dist/cli.js hook pre-tool-use`
- Aggregate: `plugin/hooks/pre-tool-use-ensuring-catalog-tools.json` in `plugin.json`

## Opt-out

Remove aggregate hook path from marketplace install, or disable plugin component.

## Build

```bash
npm run build --workspace components/catalog-tool-installer
```
