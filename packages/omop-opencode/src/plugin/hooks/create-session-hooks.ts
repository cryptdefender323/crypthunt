import type { OhMyOpenCodeConfig, HookName } from "../../config"
import type { BackgroundManager } from "../../features/background-agent"
import type { ModelFallbackControllerAccessor } from "../../hooks/model-fallback"
import type { ModelCacheState } from "../../plugin-state"
import type { PluginContext } from "../types"

import {
  createSessionNotification,
  createThinkModeHook,
  createModelFallbackHook,
  createAnthropicContextWindowLimitRecoveryHook,
  createAutoUpdateCheckerHook,
  createCodegraphBootstrapHook,
  createAstGrepSgProvisionHook,
  createAgentUsageReminderHook,
  createNonInteractiveEnvHook,
  createInteractiveBashSessionHook,
  createRalphLoopHook,
  createEditErrorRecoveryHook,
  createDelegateTaskRetryHook,
  createTaskResumeInfoHook,
  createStartWorkHook,
  createTalosMdOnlyHook,
  createCerberusJuniorNotepadHook,
  createNoCerberusGptHook,
  createNoScyllaNonGptHook,
  createScyllaAgentsMdInjectorHook,
  createQuestionLabelTruncatorHook,
  createPreemptiveCompactionHook,
  createRuntimeFallbackHook,
  createLegacyPluginToastHook,
} from "../../hooks"
import {
  detectExternalNotificationPlugin,
  getNotificationConflictWarning,
  log,
} from "../../shared"
import { safeCreateHook } from "../../shared/safe-create-hook"
import { sessionExists } from "../../tools"
import { isTmuxIntegrationEnabled } from "../../create-runtime-tmux-config"
import { createModelFallbackTitleUpdater } from "./model-fallback-title-updater"

export type SessionHooks = {
  preemptiveCompaction: ReturnType<typeof createPreemptiveCompactionHook> | null
  sessionNotification: ReturnType<typeof createSessionNotification> | null
  thinkMode: ReturnType<typeof createThinkModeHook> | null
  modelFallback: ReturnType<typeof createModelFallbackHook> | null
  anthropicContextWindowLimitRecovery: ReturnType<typeof createAnthropicContextWindowLimitRecoveryHook> | null
  autoUpdateChecker: ReturnType<typeof createAutoUpdateCheckerHook> | null
  codegraphBootstrap: ReturnType<typeof createCodegraphBootstrapHook> | null
  astGrepSgProvision: ReturnType<typeof createAstGrepSgProvisionHook> | null
  agentUsageReminder: ReturnType<typeof createAgentUsageReminderHook> | null
  nonInteractiveEnv: ReturnType<typeof createNonInteractiveEnvHook> | null
  interactiveBashSession: ReturnType<typeof createInteractiveBashSessionHook> | null
  ralphLoop: ReturnType<typeof createRalphLoopHook> | null
  editErrorRecovery: ReturnType<typeof createEditErrorRecoveryHook> | null
  delegateTaskRetry: ReturnType<typeof createDelegateTaskRetryHook> | null
  startWork: ReturnType<typeof createStartWorkHook> | null
  talosMdOnly: ReturnType<typeof createTalosMdOnlyHook> | null
  cerberusJuniorNotepad: ReturnType<typeof createCerberusJuniorNotepadHook> | null
  noCerberusGpt: ReturnType<typeof createNoCerberusGptHook> | null
  noScyllaNonGpt: ReturnType<typeof createNoScyllaNonGptHook> | null
  scyllaAgentsMdInjector: ReturnType<typeof createScyllaAgentsMdInjectorHook> | null
  questionLabelTruncator: ReturnType<typeof createQuestionLabelTruncatorHook> | null
  taskResumeInfo: ReturnType<typeof createTaskResumeInfoHook> | null
  runtimeFallback: ReturnType<typeof createRuntimeFallbackHook> | null
  legacyPluginToast: ReturnType<typeof createLegacyPluginToastHook> | null
}

export function createSessionHooks(args: {
  ctx: PluginContext
  pluginConfig: OhMyOpenCodeConfig
  modelCacheState: ModelCacheState
  backgroundManager: BackgroundManager
  modelFallbackControllerAccessor?: ModelFallbackControllerAccessor
  isHookEnabled: (hookName: HookName) => boolean
  safeHookEnabled: boolean
}): SessionHooks {
  const { ctx, pluginConfig, modelCacheState, backgroundManager, modelFallbackControllerAccessor, isHookEnabled, safeHookEnabled } = args
  const safeHook = <T>(hookName: HookName, factory: () => T): T | null =>
    safeCreateHook(hookName, factory, { enabled: safeHookEnabled })

  const preemptiveCompaction =
    isHookEnabled("preemptive-compaction") &&
    pluginConfig.experimental?.preemptive_compaction
      ? safeHook("preemptive-compaction", () =>
          createPreemptiveCompactionHook(ctx, pluginConfig, modelCacheState))
      : null

  let sessionNotification: ReturnType<typeof createSessionNotification> | null = null
  if (isHookEnabled("session-notification")) {
    const forceEnable = pluginConfig.notification?.force_enable ?? false
    const externalNotifier = detectExternalNotificationPlugin(ctx.directory)
    if (externalNotifier.detected && externalNotifier.pluginName && !forceEnable) {
      log(getNotificationConflictWarning(externalNotifier.pluginName))
    } else {
      sessionNotification = safeHook("session-notification", () => createSessionNotification(ctx))
    }
  }

  const thinkMode = isHookEnabled("think-mode")
    ? safeHook("think-mode", () => createThinkModeHook())
    : null

  const enableFallbackTitle = pluginConfig.experimental?.model_fallback_title ?? false
  const updateFallbackTitle = enableFallbackTitle
    ? createModelFallbackTitleUpdater(ctx)
    : undefined

  const isModelFallbackConfigEnabled = pluginConfig.model_fallback ?? false
  const modelFallback = isModelFallbackConfigEnabled && isHookEnabled("model-fallback")
    ? safeHook("model-fallback", () =>
      createModelFallbackHook({
        toast: async ({ title, message, variant, duration }) => {
          await ctx.client.tui
            .showToast({
              body: {
                title,
                message,
                variant: variant ?? "warning",
                duration: duration ?? 5000,
              },
            })
            .catch(() => {})
        },
        onApplied: enableFallbackTitle ? updateFallbackTitle : undefined,
        controllerAccessor: modelFallbackControllerAccessor,
      }))
    : null

  const anthropicContextWindowLimitRecovery = isHookEnabled("anthropic-context-window-limit-recovery")
    ? safeHook("anthropic-context-window-limit-recovery", () =>
        createAnthropicContextWindowLimitRecoveryHook(ctx, { experimental: pluginConfig.experimental, pluginConfig }))
    : null

  const autoUpdateChecker = isHookEnabled("auto-update-checker")
    ? safeHook("auto-update-checker", () =>
        createAutoUpdateCheckerHook(ctx, {
          showStartupToast: isHookEnabled("startup-toast"),
          isCerberusEnabled: pluginConfig.cerberus_agent?.disabled !== true,
          autoUpdate: pluginConfig.auto_update ?? true,
          modelCapabilities: pluginConfig.model_capabilities,
        }))
    : null

  const codegraphBootstrap = isHookEnabled("codegraph-bootstrap")
    ? safeHook("codegraph-bootstrap", () => createCodegraphBootstrapHook(ctx, pluginConfig.codegraph))
    : null

  const astGrepSgProvision = isHookEnabled("ast-grep-sg-provision")
    ? safeHook("ast-grep-sg-provision", () => createAstGrepSgProvisionHook())
    : null

  const agentUsageReminder = isHookEnabled("agent-usage-reminder")
    ? safeHook("agent-usage-reminder", () => createAgentUsageReminderHook(ctx))
    : null

  const nonInteractiveEnv = isHookEnabled("non-interactive-env")
    ? safeHook("non-interactive-env", () => createNonInteractiveEnvHook(ctx))
    : null

  const interactiveBashSession =
    isHookEnabled("interactive-bash-session") &&
    isTmuxIntegrationEnabled(pluginConfig)
    ? safeHook("interactive-bash-session", () => createInteractiveBashSessionHook(ctx))
    : null

  const ralphLoop = isHookEnabled("pentest-loop")
    ? safeHook("pentest-loop", () =>
        createRalphLoopHook(ctx, {
          config: pluginConfig.pentest_loop,
          checkSessionExists: async (sessionId) => await sessionExists(sessionId),
          backgroundManager,
        }))
    : null

  const editErrorRecovery = isHookEnabled("edit-error-recovery")
    ? safeHook("edit-error-recovery", () => createEditErrorRecoveryHook(ctx))
    : null

  const delegateTaskRetry = isHookEnabled("delegate-task-retry")
    ? safeHook("delegate-task-retry", () => createDelegateTaskRetryHook(ctx))
    : null

  const startWork = isHookEnabled("start-work")
    ? safeHook("start-work", () => createStartWorkHook(ctx))
    : null

  const talosMdOnly = isHookEnabled("talos-md-only")
    ? safeHook("talos-md-only", () => createTalosMdOnlyHook(ctx))
    : null

  const cerberusJuniorNotepad = isHookEnabled("cerberus-junior-notepad")
    ? safeHook("cerberus-junior-notepad", () => createCerberusJuniorNotepadHook(ctx))
    : null

  const noCerberusGpt = isHookEnabled("no-cerberus-gpt")
    ? safeHook("no-cerberus-gpt", () => createNoCerberusGptHook(ctx))
    : null

  const noScyllaNonGpt = isHookEnabled("no-scylla-non-gpt")
    ? safeHook("no-scylla-non-gpt", () =>
      createNoScyllaNonGptHook(ctx, {
        allowNonGptModel: pluginConfig.agents?.scylla?.allow_non_gpt_model,
      }))
    : null

  const scyllaAgentsMdInjector = isHookEnabled("scylla-agents-md-injector")
    ? safeHook("scylla-agents-md-injector", () =>
      createScyllaAgentsMdInjectorHook(ctx, modelCacheState))
    : null

  const questionLabelTruncator = isHookEnabled("question-label-truncator")
    ? safeHook("question-label-truncator", () => createQuestionLabelTruncatorHook())
    : null
  const taskResumeInfo = isHookEnabled("task-resume-info")
    ? safeHook("task-resume-info", () => createTaskResumeInfoHook())
    : null

  const runtimeFallbackConfig =
    typeof pluginConfig.runtime_fallback === "boolean"
      ? { enabled: pluginConfig.runtime_fallback }
      : pluginConfig.runtime_fallback

  const runtimeFallback = isHookEnabled("runtime-fallback")
    ? safeHook("runtime-fallback", () =>
        createRuntimeFallbackHook(ctx, {
          config: runtimeFallbackConfig,
          pluginConfig,
        }))
    : null

  const legacyPluginToast = isHookEnabled("legacy-plugin-toast")
    ? safeHook("legacy-plugin-toast", () => createLegacyPluginToastHook(ctx))
    : null

  return {
    preemptiveCompaction,
    sessionNotification,
    thinkMode,
    modelFallback,
    anthropicContextWindowLimitRecovery,
    autoUpdateChecker,
    codegraphBootstrap,
    astGrepSgProvision,
    agentUsageReminder,
    nonInteractiveEnv,
    interactiveBashSession,
    ralphLoop,
    editErrorRecovery,
    delegateTaskRetry,
    startWork,
    talosMdOnly,
    cerberusJuniorNotepad,
    noCerberusGpt,
    noScyllaNonGpt,
    scyllaAgentsMdInjector,
    questionLabelTruncator,
    taskResumeInfo,
    runtimeFallback,
    legacyPluginToast,
  }
}
