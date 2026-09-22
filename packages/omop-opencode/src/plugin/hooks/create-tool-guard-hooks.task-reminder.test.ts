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

describe("createToolGuardHooks task-reminder", () => {
  it("#given task-reminder enabled #when createToolGuardHooks #then taskReminder is created", () => {
    // given
    const factory = spyOn(hooks, "createTaskReminderHook").mockImplementation(() => ({
      "tool.execute.after": async () => {},
      event: async () => {},
    }) as never)

    // when
    const result = createToolGuardHooks({
      ctx: mockContext,
      pluginConfig: {} as OhMyOpenCodeConfig,
      modelCacheState: mockModelCacheState,
      isHookEnabled: (name) => name === "task-reminder",
      safeHookEnabled: true,
    })

    // then
    expect(factory).toHaveBeenCalled()
    expect(result.taskReminder).not.toBeNull()
    factory.mockRestore()
  })
})