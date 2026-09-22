import { describe, expect, it, spyOn } from "bun:test"
import type { OhMyOpenCodeConfig } from "../../config"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"
import * as hooks from "../../hooks"
import { createToolGuardHooks } from "./create-tool-guard-hooks"

const mockContext = { directory: "/tmp" } as PluginContext
const mockModelCacheState = {
  anthropicContext1MEnabled: false,
  modelContextLimitsCache: new Map(),
} satisfies ModelCacheState

describe("createToolGuardHooks hashline-edit-diff-enhancer", () => {
  it("#given hook enabled #when createToolGuardHooks #then hashlineEditDiffEnhancer is created", () => {
    // given
    const factory = spyOn(hooks, "createHashlineEditDiffEnhancerHook").mockImplementation(() => ({
      "tool.execute.before": async () => {},
      "tool.execute.after": async () => {},
    }) as never)

    // when
    const result = createToolGuardHooks({
      ctx: mockContext,
      pluginConfig: { hashline_edit: true } as OhMyOpenCodeConfig,
      modelCacheState: mockModelCacheState,
      isHookEnabled: (name) => name === "hashline-edit-diff-enhancer",
      safeHookEnabled: true,
    })

    // then
    expect(factory).toHaveBeenCalled()
    expect(result.hashlineEditDiffEnhancer).not.toBeNull()
    factory.mockRestore()
  })
})