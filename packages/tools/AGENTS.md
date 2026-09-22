# packages/tools — Tool Catalog Manager (`@omop/tools`)

**Generated:** 2026-07-15
**Score reason:** distinct domain (permission-gated install); thin wrapper over pentest-core

## OVERVIEW

Permission-aware tool install/select layer on top of `@omop/pentest-core`.

- **catalog / selector / command-builder:** re-export only (SSoT = `pentest-core`)
- **installer:** core check/install helpers + `permission-manager` allow/deny + sudo/status report

## STRUCTURE

```
src/
├── catalog/           # re-export @omop/pentest-core catalog APIs
├── selector/          # re-export @omop/pentest-core selector APIs
├── command-builder/   # re-export @omop/pentest-core command-builder APIs
├── installer/         # permission-manager + gated install wrappers
├── types.ts           # ToolPermission* + re-exports from pentest-core
└── index.ts           # barrel only
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Allow/deny tool install | `src/installer/permission-manager.ts` |
| Install with permission check | `src/installer/tool-installer.ts` |
| Catalog / select / build | `@omop/pentest-core` (re-exported here for convenience) |
| Live tool definitions | root `tools-catalog.json` |

## CONVENTIONS

- Depends on `@omop/pentest-core` only. No harness imports.
- Default permission = `allow`; overrides by `tools_name`.
- Do **not** re-implement catalog/selector/command-builder logic here — re-export.
- Barrel `index.ts` has no logic.

## ANTI-PATTERNS

- Do not duplicate catalog schema here — edit `tools-catalog.json` + `pentest-core` types.
- Do not install tools without `checkPermission` when caller supplies `ToolPermissionConfig`.
- Do not copy-paste core installer body; wrap `coreInstallTool` / `checkToolInstalled`.
