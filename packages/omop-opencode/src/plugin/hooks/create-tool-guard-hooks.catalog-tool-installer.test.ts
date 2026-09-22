import { describe, expect, it } from "bun:test"
import { createToolGuardHooks } from "./create-tool-guard-hooks"
import type { OhMyOpenCodeConfig } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"

describe("createToolGuardHooks catalog-tool-installer", () => {
  it("#given default config #when createToolGuardHooks #then catalogToolInstaller is registered", () => {
    // given
    const pluginConfig = {} as OhMyOpenCodeConfig
    const modelCacheState = {} as ModelCacheState
    const ctx = { directory: process.cwd() } as PluginContext

    // when
    const hooks = createToolGuardHooks({
      ctx,
      pluginConfig,
      modelCacheState,
      isHookEnabled: () => true,
      safeHookEnabled: true,
    })

    // then
    expect(hooks.catalogToolInstaller).not.toBeNull()
    expect(typeof hooks.catalogToolInstaller?.["tool.execute.before"]).toBe("function")
  })

  it("#given experimental.tools_auto_install false #when create #then catalogToolInstaller null", () => {
    // given
    const pluginConfig = {
      experimental: { tools_auto_install: false },
    } as OhMyOpenCodeConfig

    // when
    const hooks = createToolGuardHooks({
      ctx: { directory: process.cwd() } as PluginContext,
      pluginConfig,
      modelCacheState: {} as ModelCacheState,
      isHookEnabled: () => true,
      safeHookEnabled: true,
    })

    // then
    expect(hooks.catalogToolInstaller).toBeNull()
  })
})
