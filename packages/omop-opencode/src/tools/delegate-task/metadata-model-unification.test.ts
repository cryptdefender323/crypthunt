const { describe, test, expect } = require("bun:test")

import type { DelegateTaskArgs, ToolContextWithMetadata } from "./types"
import type { ParentContext } from "./executor-types"
import { unsafeTestValue } from "../../../../../test-support/unsafe-test-value"

const MODEL = { providerID: "anthropic", modelID: "claude-sonnet-4-6" }
const MODEL_WITH_VARIANT = { providerID: "google", modelID: "gemini-3.1-pro", variant: "high" }

type CapturedMetadata = { title?: string; metadata: Record<string, unknown> }

function makeMockCtx(): ToolContextWithMetadata & { captured: CapturedMetadata[] } {
  const captured: CapturedMetadata[] = []
  return {
    sessionID: "ses_parent",
    messageID: "msg_parent",
    agent: "cerberus",
    abort: new AbortController().signal,
    callID: "call_001",
    metadata: async (input: { title?: string; metadata?: Record<string, unknown> }) => { captured.push(input as CapturedMetadata) },
    captured,
  }
}

const parentContext: ParentContext = {
  sessionID: "ses_parent",
  messageID: "msg_parent",
  agent: "cerberus",
  model: MODEL,
}

describe("metadata model unification", () => {
  describe("#given delegate-task executors", () => {
    describe("#when metadata is set during execution", () => {

      test("#then sync-task metadata includes model", async () => {
        const { executeSyncTask } = require("./sync-task")
        const ctx = makeMockCtx()
        const deps = {
          createSyncSession: async () => ({ ok: true, sessionID: "ses_sync" }),
          sendSyncPrompt: async () => null,
          pollSyncSession: async () => null,
          fetchSyncResult: async () => ({ ok: true as const, textContent: "done" }),
        }
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          category: "quick", load_skills: [], run_in_background: false,
        }

        await executeSyncTask(args, ctx, {
          client: { session: { create: async () => ({ data: { id: "ses_sync" } }) } },
          directory: "/tmp",
          onSyncSessionCreated: null,
        }, parentContext, "scout", MODEL, undefined, undefined, undefined, deps)

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })

      test("#then background-task metadata includes model", async () => {
        const { executeBackgroundTask } = require("./background-task")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          load_skills: [], run_in_background: true, subagent_type: "scout",
        }

        await executeBackgroundTask(args, ctx, unsafeTestValue({
          manager: {
            launch: async () => ({
              id: "bg_1", description: "test", agent: "scout",
              status: "pending", sessionId: "ses_bg", model: MODEL,
            }),
            getTask: () => undefined,
          },
        }), parentContext, "scout", MODEL, undefined)

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })

      test("#then unstable-agent-task metadata includes model", async () => {
        const { executeUnstableAgentTask } = require("./unstable-agent-task")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          category: "quick", load_skills: [], run_in_background: false,
        }

        const launchedTask = {
          id: "bg_unstable", description: "test", agent: "scout",
          status: "completed", sessionId: "ses_unstable", model: MODEL,
        }
        await executeUnstableAgentTask(
          args, ctx,
          unsafeTestValue({
            manager: {
              launch: async () => launchedTask,
              getTask: () => launchedTask,
            },
            client: {
              session: {
                status: async () => ({ data: { ses_unstable: { type: "idle" } } }),
                messages: async () => ({
                  data: [{
                    info: { role: "assistant", time: { created: 1 } },
                    parts: [{ type: "text", text: "done" }],
                  }],
                }),
              },
            },
            syncPollTimeoutMs: 100,
          }),
          parentContext, "scout", MODEL, undefined, "anthropic/claude-sonnet-4-6",
        )

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })

      test("#then background-continuation metadata includes model from task", async () => {
        const { executeBackgroundContinuation } = require("./background-continuation")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "continue", prompt: "keep going",
          load_skills: [], run_in_background: true, task_id: "ses_resumed",
        }

        await executeBackgroundContinuation(args, ctx, unsafeTestValue({
          manager: {
            resume: async () => ({
              id: "bg_2", description: "continue", agent: "scout",
              status: "running", sessionId: "ses_resumed", model: MODEL,
            }),
          },
        }), parentContext)

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })

      test("#then sync-continuation metadata includes model from resumed session", async () => {
        const { executeSyncContinuation } = require("./sync-continuation")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "continue", prompt: "keep going",
          load_skills: [], run_in_background: false, task_id: "ses_cont",
        }

        const deps = {
          pollSyncSession: async () => null,
          fetchSyncResult: async () => ({ ok: true as const, textContent: "done" }),
        }

        await executeSyncContinuation(args, ctx, unsafeTestValue({
          client: {
            session: {
              messages: async () => ({
                data: [{ info: { agent: "scout", model: MODEL, providerID: "anthropic", modelID: "claude-sonnet-4-6" } }],
              }),
              prompt: async () => ({}),
            },
          },
        }), parentContext, deps)

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })
    })
  })

  describe("#given categoryModel is undefined but parent.model is set", () => {
    describe("#when executors publish metadata", () => {
      test("#then sync-task metadata falls back to parent.model", async () => {
        const { executeSyncTask } = require("./sync-task")
        const ctx = makeMockCtx()
        const deps = {
          createSyncSession: async () => ({ ok: true, sessionID: "ses_sync" }),
          sendSyncPrompt: async () => null,
          pollSyncSession: async () => null,
          fetchSyncResult: async () => ({ ok: true as const, textContent: "done" }),
        }
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          subagent_type: "scout", load_skills: [], run_in_background: false,
        }

        await executeSyncTask(args, ctx, {
          client: { session: { create: async () => ({ data: { id: "ses_sync" } }) } },
          directory: "/tmp",
          onSyncSessionCreated: null,
        }, parentContext, "scout", undefined, undefined, undefined, undefined, deps)

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })

      test("#then background-task metadata falls back to parent.model", async () => {
        const { executeBackgroundTask } = require("./background-task")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          load_skills: [], run_in_background: true, subagent_type: "scout",
        }

        await executeBackgroundTask(args, ctx, unsafeTestValue({
          manager: {
            launch: async () => ({
              id: "bg_1", description: "test", agent: "scout",
              status: "pending", sessionId: "ses_bg",
            }),
            getTask: () => undefined,
          },
        }), parentContext, "scout", undefined, undefined)

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })

      test("#then unstable-agent-task metadata falls back to parent.model", async () => {
        const { executeUnstableAgentTask } = require("./unstable-agent-task")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          category: "quick", load_skills: [], run_in_background: false,
        }

        const launchedTask = {
          id: "bg_unstable", description: "test", agent: "scout",
          status: "completed", sessionId: "ses_unstable",
        }

        await executeUnstableAgentTask(
          args, ctx,
          unsafeTestValue({
            manager: {
              launch: async () => launchedTask,
              getTask: () => launchedTask,
            },
            client: {
              session: {
                status: async () => ({ data: { ses_unstable: { type: "idle" } } }),
                messages: async () => ({
                  data: [{
                    info: { role: "assistant", time: { created: 1 } },
                    parts: [{ type: "text", text: "done" }],
                  }],
                }),
              },
            },
            syncPollTimeoutMs: 100,
          }),
          parentContext, "scout", undefined, undefined, "anthropic/claude-sonnet-4-6",
        )

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })

      test("#then background-continuation metadata falls back to parent.model when task.model missing", async () => {
        const { executeBackgroundContinuation } = require("./background-continuation")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "continue", prompt: "keep going",
          load_skills: [], run_in_background: true, task_id: "ses_resumed",
        }

        await executeBackgroundContinuation(args, ctx, unsafeTestValue({
          manager: {
            resume: async () => ({
              id: "bg_2", description: "continue", agent: "scout",
              status: "running", sessionId: "ses_resumed",
            }),
          },
        }), parentContext)

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })

      test("#then sync-continuation metadata falls back to parent.model when resume model missing", async () => {
        const { executeSyncContinuation } = require("./sync-continuation")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "continue", prompt: "keep going",
          load_skills: [], run_in_background: false, task_id: "ses_cont",
        }

        const deps = {
          pollSyncSession: async () => null,
          fetchSyncResult: async () => ({ ok: true as const, textContent: "done" }),
        }

        await executeSyncContinuation(args, ctx, unsafeTestValue({
          client: {
            session: {
              messages: async () => ({ data: [] }),
              prompt: async () => ({}),
            },
          },
        }), parentContext, deps)

        const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL)
      })
    })
  })

  describe("#given both categoryModel and parent.model are undefined", () => {
    test("#when sync-task runs #then metadata.model is undefined without crashing", async () => {
      const { executeSyncTask } = require("./sync-task")
      const ctx = makeMockCtx()
      const deps = {
        createSyncSession: async () => ({ ok: true, sessionID: "ses_sync" }),
        sendSyncPrompt: async () => null,
        pollSyncSession: async () => null,
        fetchSyncResult: async () => ({ ok: true as const, textContent: "done" }),
      }
      const args: DelegateTaskArgs = {
        description: "test", prompt: "do it",
        subagent_type: "scout", load_skills: [], run_in_background: false,
      }

      const parentContextWithoutModel: ParentContext = {
        sessionID: "ses_parent",
        messageID: "msg_parent",
        agent: "cerberus",
      }

      await executeSyncTask(args, ctx, {
        client: { session: { create: async () => ({ data: { id: "ses_sync" } }) } },
        directory: "/tmp",
        onSyncSessionCreated: null,
      }, parentContextWithoutModel, "scout", undefined, undefined, undefined, undefined, deps)

      const meta = ctx.captured.find((m: CapturedMetadata) => m.metadata?.sessionId)!
      expect(meta).toBeDefined()
      expect(meta.metadata.model).toBeUndefined()
    })
  })

  describe("#given category model with variant", () => {
    describe("#when executors publish metadata", () => {
      test("#then sync-task metadata includes variant", async () => {
        const { executeSyncTask } = require("./sync-task")
        const ctx = makeMockCtx()
        const deps = {
          createSyncSession: async () => ({ ok: true, sessionID: "ses_sync_variant" }),
          sendSyncPrompt: async () => null,
          pollSyncSession: async () => null,
          fetchSyncResult: async () => ({ ok: true as const, textContent: "done" }),
        }
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          category: "visual-engineering", load_skills: [], run_in_background: false,
        }

        await executeSyncTask(args, ctx, {
          client: { session: { create: async () => ({ data: { id: "ses_sync_variant" } }) } },
          directory: "/tmp",
          onSyncSessionCreated: null,
        }, parentContext, "scout", MODEL_WITH_VARIANT, undefined, undefined, undefined, deps)

        const meta = ctx.captured.find((metadataEvent: CapturedMetadata) => metadataEvent.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL_WITH_VARIANT)
      })

      test("#then background-task metadata includes variant", async () => {
        const { executeBackgroundTask } = require("./background-task")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          category: "visual-engineering", load_skills: [], run_in_background: true, subagent_type: "scout",
        }

        await executeBackgroundTask(args, ctx, unsafeTestValue({
          manager: {
            launch: async () => ({
              id: "bg_variant", description: "test", agent: "scout",
              status: "pending", sessionId: "ses_bg_variant", model: MODEL_WITH_VARIANT,
            }),
            getTask: () => undefined,
          },
        }), parentContext, "scout", MODEL_WITH_VARIANT, undefined)

        const meta = ctx.captured.find((metadataEvent: CapturedMetadata) => metadataEvent.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL_WITH_VARIANT)
      })

      test("#then unstable-agent-task metadata includes variant", async () => {
        const { executeUnstableAgentTask } = require("./unstable-agent-task")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "test", prompt: "do it",
          category: "visual-engineering", load_skills: [], run_in_background: false,
        }

        const launchedTask = {
          id: "bg_unstable_variant", description: "test", agent: "scout",
          status: "completed", sessionId: "ses_unstable_variant", model: MODEL_WITH_VARIANT,
        }

        await executeUnstableAgentTask(
          args, ctx,
          unsafeTestValue({
            manager: {
              launch: async () => launchedTask,
              getTask: () => launchedTask,
            },
            client: {
              session: {
                status: async () => ({ data: { ses_unstable_variant: { type: "idle" } } }),
                messages: async () => ({
                  data: [{
                    info: { role: "assistant", time: { created: 1 } },
                    parts: [{ type: "text", text: "done" }],
                  }],
                }),
              },
            },
            syncPollTimeoutMs: 100,
          }),
          parentContext, "scout", MODEL_WITH_VARIANT, undefined, "google/gemini-3.1-pro high",
        )

        const meta = ctx.captured.find((metadataEvent: CapturedMetadata) => metadataEvent.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL_WITH_VARIANT)
      })

      test("#then background-continuation metadata includes variant from task", async () => {
        const { executeBackgroundContinuation } = require("./background-continuation")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "continue", prompt: "keep going",
          load_skills: [], run_in_background: true, task_id: "ses_resumed_variant",
        }

        await executeBackgroundContinuation(args, ctx, unsafeTestValue({
          manager: {
            resume: async () => ({
              id: "bg_resume_variant", description: "continue", agent: "scout",
              status: "running", sessionId: "ses_resumed_variant", model: MODEL_WITH_VARIANT,
            }),
          },
        }), parentContext)

        const meta = ctx.captured.find((metadataEvent: CapturedMetadata) => metadataEvent.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL_WITH_VARIANT)
      })

      test("#then sync-continuation metadata includes variant from resumed session", async () => {
        const { executeSyncContinuation } = require("./sync-continuation")
        const ctx = makeMockCtx()
        const args: DelegateTaskArgs = {
          description: "continue", prompt: "keep going",
          load_skills: [], run_in_background: false, task_id: "ses_cont_variant",
        }

        const deps = {
          pollSyncSession: async () => null,
          fetchSyncResult: async () => ({ ok: true as const, textContent: "done" }),
        }

        await executeSyncContinuation(args, ctx, unsafeTestValue({
          client: {
            session: {
              messages: async () => ({
                data: [{ info: { agent: "scout", model: MODEL_WITH_VARIANT, providerID: "google", modelID: "gemini-3.1-pro" } }],
              }),
              prompt: async () => ({}),
            },
          },
        }), parentContext, deps)

        const meta = ctx.captured.find((metadataEvent: CapturedMetadata) => metadataEvent.metadata?.sessionId)!
        expect(meta).toBeDefined()
        expect(meta.metadata.model).toEqual(MODEL_WITH_VARIANT)
      })
    })
  })
})
