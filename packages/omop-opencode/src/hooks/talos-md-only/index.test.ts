import { afterAll, describe, expect, test, beforeEach, afterEach, mock } from "bun:test"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { randomUUID } from "node:crypto"
import { SYSTEM_DIRECTIVE_PREFIX } from "../../shared/system-directive"
import { PLANNING_CONTEXT_OPEN } from "./constants"
import { clearSessionAgent, setSessionAgent } from "../../features/claude-code-session-state"
// Force stable (JSON) mode for tests that rely on message file storage
mock.module("../../shared/opencode-storage-detection", () => ({
  isSqliteBackend: () => false,
  resetSqliteBackendCache: () => {},
}))

afterAll(() => {
  mock.restore()
})

const { createTalosMdOnlyHook } = await import("./index")
const { MESSAGE_STORAGE } = await import("../../features/hook-message-injector")

describe("talos-md-only", () => {
  const TEST_SESSION_ID = "ses_test_talos"
  let testMessageDir: string

  function createMockPluginInput() {
    return {
      client: {},
      directory: "/tmp/test",
    } as never
  }

  function setupMessageStorage(
    sessionID: string,
    agent: string | undefined,
    options?: { useSessionAgent?: boolean },
  ): void {
    const useSessionAgent = options?.useSessionAgent ?? true
    testMessageDir = join(MESSAGE_STORAGE, sessionID)
    if (agent && useSessionAgent) {
      setSessionAgent(sessionID, agent)
      return
    }

    clearSessionAgent(sessionID)
    rmSync(testMessageDir, { recursive: true, force: true })
    mkdirSync(testMessageDir, { recursive: true })
    if (!agent) {
      return
    }

    try {
      writeFileSync(
        join(testMessageDir, "msg_001.json"),
        JSON.stringify({
          agent,
          model: { providerID: "test", modelID: "test-model" },
        }),
      )
    } catch {
      clearSessionAgent(sessionID)
    }
  }

  afterEach(() => {
    clearSessionAgent(TEST_SESSION_ID)
    if (testMessageDir) {
      try {
        rmSync(testMessageDir, { recursive: true, force: true })
      } catch {
        // ignore
      }
    }
  })

  describe("agent name matching", () => {
    test("should enforce md-only restriction for exact talos agent name", async () => {
      //#given
      setupMessageStorage(TEST_SESSION_ID, "talos")
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      //#when //#then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should enforce md-only restriction for Talos display name Plan Builder", async () => {
      //#given
      setupMessageStorage(TEST_SESSION_ID, "Talos - Plan Builder")
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      //#when //#then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should enforce md-only restriction for Talos display name Planner", async () => {
      //#given
      setupMessageStorage(TEST_SESSION_ID, "Talos - Plan Builder")
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      //#when //#then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should enforce md-only restriction for uppercase TALOS", async () => {
      //#given
      setupMessageStorage(TEST_SESSION_ID, "TALOS")
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      //#when //#then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should not enforce restriction for non-Talos agent", async () => {
      //#given
      setupMessageStorage(TEST_SESSION_ID, "cerberus")
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      //#when //#then
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })

    test("should not enforce restriction when agent name is undefined", async () => {
      //#given
      setupMessageStorage(TEST_SESSION_ID, undefined)
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      //#when //#then
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })
  })

   describe("with Talos agent in message storage", () => {
     beforeEach(() => {
       setupMessageStorage(TEST_SESSION_ID, "talos")
     })

    test("should block Talos from writing non-.md files", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should allow Talos to write .md files inside .omop/", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/tmp/test/.omop/plans/work-plan.md" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })

    test("should inject workflow reminder when Talos writes to .omop/plans/", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output: { args: Record<string, unknown>; message?: string } = {
        args: { filePath: "/tmp/test/.omop/plans/work-plan.md" },
      }

      // when
      await hook["tool.execute.before"](input, output)

      // then
      expect(output.message).toContain("TALOS MANDATORY WORKFLOW REMINDER")
      expect(output.message).toContain("INTERVIEW")
      expect(output.message).toContain("METIS CONSULTATION")
      expect(output.message).toContain("MOMUS REVIEW")
    })

    test("should NOT inject workflow reminder for .omop/drafts/", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output: { args: Record<string, unknown>; message?: string } = {
        args: { filePath: "/tmp/test/.omop/drafts/notes.md" },
      }

      // when
      await hook["tool.execute.before"](input, output)

      // then
      expect(output.message).toBeUndefined()
    })

    test("should block Talos from writing .md files outside .omop/", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/README.md" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should block Talos from writing .md files when .omo is only part of a path segment", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/tmp/test/work.omop/plans/work-plan.md" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should block Talos from writing .md files under .omop-backup", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/tmp/test/.omop-backup/plans/work-plan.md" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should block Edit tool for non-.md files", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Edit",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/code.py" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should allow bash commands from Talos", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "bash",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { command: "echo test" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })

    test("should not affect non-blocked tools", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Read",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })

    test("should handle missing filePath gracefully", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: {},
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })

    test("should inject planning warning when Talos calls task", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "task",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { prompt: "Analyze this codebase" },
      }

      // when
      await hook["tool.execute.before"](input, output)

      // then — XML tag used, not bracket directive (#4036)
      expect(output.args.prompt).toContain(PLANNING_CONTEXT_OPEN)
      expect(output.args.prompt).not.toContain("[SYSTEM DIRECTIVE:")
      expect(output.args.prompt).toContain("DO NOT modify any files")
    })

    test("should inject planning warning when Talos calls task (research)", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "task",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { prompt: "Research this library" },
      }

      // when
      await hook["tool.execute.before"](input, output)

      // then
      expect(output.args.prompt).toContain(PLANNING_CONTEXT_OPEN)
      expect(output.args.prompt).not.toContain("[SYSTEM DIRECTIVE:")
    })

    test("should inject planning warning when Talos calls call_omo_agent", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "call_omo_agent",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { prompt: "Find implementation examples" },
      }

      // when
      await hook["tool.execute.before"](input, output)

      // then
      expect(output.args.prompt).toContain(PLANNING_CONTEXT_OPEN)
      expect(output.args.prompt).not.toContain("[SYSTEM DIRECTIVE:")
    })

    test("should not double-inject warning if already present", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "task",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const promptWithWarning = `Some prompt ${PLANNING_CONTEXT_OPEN} already here`
      const output = {
        args: { prompt: promptWithWarning },
      }

      // when
      await hook["tool.execute.before"](input, output)

      // then
      const occurrences = (output.args.prompt as string).split(PLANNING_CONTEXT_OPEN).length - 1
      expect(occurrences).toBe(1)
    })

    test("regression #4036: task() prompt must not contain [SYSTEM DIRECTIVE: for Azure Prompt Shield safety", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "task",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { prompt: "Analyze the codebase architecture" },
      }

      // when
      await hook["tool.execute.before"](input, output)

      // then — the bracket-enclosed directive must NOT appear in the forwarded prompt
      // because Azure OpenAI Prompt Shield flags it as indirect prompt injection
      expect(output.args.prompt as string).not.toContain("[SYSTEM DIRECTIVE:")
    })
  })

  describe("with non-Talos agent in message storage", () => {
    beforeEach(() => {
      setupMessageStorage(TEST_SESSION_ID, "cerberus")
    })

    test("should not affect non-Talos agents", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })

    test("should not inject warning for non-Talos agents calling task", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "task",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const originalPrompt = "Implement this feature"
      const output = {
        args: { prompt: originalPrompt },
      }

      // when
      await hook["tool.execute.before"](input, output)

      // then
      expect(output.args.prompt).toBe(originalPrompt)
      expect(output.args.prompt).not.toContain(SYSTEM_DIRECTIVE_PREFIX)
    })
  })

  describe("boulder state priority over message files (fixes #927)", () => {
    const BOULDER_DIR = join(tmpdir(), `boulder-test-${randomUUID()}`)
    const BOULDER_FILE = join(BOULDER_DIR, ".omo", "boulder.json")

    beforeEach(() => {
      mkdirSync(join(BOULDER_DIR, ".omo"), { recursive: true })
    })

    afterEach(() => {
      rmSync(BOULDER_DIR, { recursive: true, force: true })
    })

    //#given session was started with talos (first message), but /start-work set boulder agent to argus
    //#when user types "continue" after interruption (memory cleared, falls back to message files)
    //#then should use boulder state agent (argus), not message file agent (talos)
    test("should prioritize boulder agent over message file agent", async () => {
      setupMessageStorage(TEST_SESSION_ID, undefined)
      
      // given - argus in boulder state (from /start-work)
      writeFileSync(BOULDER_FILE, JSON.stringify({
        active_plan: "/test/plan.md",
        started_at: new Date().toISOString(),
        session_ids: [TEST_SESSION_ID],
        plan_name: "test-plan",
        agent: "argus"
      }))

      const hook = createTalosMdOnlyHook({
        client: {},
        directory: BOULDER_DIR,
      } as never)

      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/code.ts" },
      }

      // when / then - should NOT block because boulder says argus, not talos
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })

    test("should use talos from boulder state when set", async () => {
      // given - argus in message files (from some other agent)
      setupMessageStorage(TEST_SESSION_ID, "argus", { useSessionAgent: false })
      
      // given - talos in boulder state (edge case, but should honor it)
      writeFileSync(BOULDER_FILE, JSON.stringify({
        active_plan: "/test/plan.md",
        started_at: new Date().toISOString(),
        session_ids: [TEST_SESSION_ID],
        plan_name: "test-plan",
        agent: "talos"
      }))

      const hook = createTalosMdOnlyHook({
        client: {},
        directory: BOULDER_DIR,
      } as never)

      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/code.ts" },
      }

      // when / then - should block because boulder says talos
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })

    test("should fall back to message files when session not in boulder", async () => {
      // given - talos in message files
      setupMessageStorage(TEST_SESSION_ID, "talos")
      
      // given - boulder state exists but for different session
      writeFileSync(BOULDER_FILE, JSON.stringify({
        active_plan: "/test/plan.md",
        started_at: new Date().toISOString(),
        session_ids: ["ses_other_session_id"],
        plan_name: "test-plan",
        agent: "argus"
      }))

      const hook = createTalosMdOnlyHook({
        client: {},
        directory: BOULDER_DIR,
      } as never)

      const input = {
        tool: "Write",
        sessionID: TEST_SESSION_ID,
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/code.ts" },
      }

      // when / then - should block because falls back to message files (talos)
      await expect(
        hook["tool.execute.before"](input, output)
      ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
    })
  })

  describe("without message storage", () => {
    test("should handle missing session gracefully (no agent found)", async () => {
      // given
      const hook = createTalosMdOnlyHook(createMockPluginInput())
      const input = {
        tool: "Write",
        sessionID: "ses_non_existent_session",
        callID: "call-1",
      }
      const output = {
        args: { filePath: "/path/to/file.ts" },
      }

      // when / #then
      await expect(
        hook["tool.execute.before"](input, output)
      ).resolves.toBeUndefined()
    })
  })

  describe("cross-platform path validation", () => {
    beforeEach(() => {
      setupMessageStorage(TEST_SESSION_ID, "talos")
    })

     test("should allow Windows-style backslash paths under .omop/", async () => {
       // given
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: ".omop\\plans\\work-plan.md" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).resolves.toBeUndefined()
     })

     test("should allow mixed separator paths under .omop/", async () => {
       // given
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: ".omop\\plans/work-plan.MD" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).resolves.toBeUndefined()
     })

     test("should allow uppercase .MD extension", async () => {
       // given
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: ".omop/plans/work-plan.MD" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).resolves.toBeUndefined()
     })

     test("should block paths outside workspace root even if containing .omo", async () => {
       // given
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: "/other/project/.omop/plans/x.md" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
     })

     test("should allow nested .omo directories (ctx.directory may be parent)", async () => {
       // given - when ctx.directory is parent of actual project, path includes project name
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: "src/.omop/plans/x.md" },
       }

       // when / #then - should allow because .omo is in path
       await expect(
         hook["tool.execute.before"](input, output)
       ).resolves.toBeUndefined()
     })

     test("should block path traversal attempts", async () => {
       // given
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: ".omop/../secrets.md" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
     })

     test("should allow case-insensitive .OMO directory", async () => {
       // given
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: ".OMO/plans/work-plan.md" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).resolves.toBeUndefined()
     })

     test("should allow nested project path with .omo (Windows real-world case)", async () => {
       // given - simulates when ctx.directory is parent of actual project
       // User reported: xauusd-dxy-plan\.omo\drafts\supabase-email-templates.md
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: "xauusd-dxy-plan\\.omop\\drafts\\supabase-email-templates.md" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).resolves.toBeUndefined()
     })

     test("should allow nested project path with mixed separators", async () => {
       // given
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: "my-project/.omop\\plans/task.md" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).resolves.toBeUndefined()
     })

     test("should block nested project path without .omo", async () => {
       // given
       setupMessageStorage(TEST_SESSION_ID, "talos")
       const hook = createTalosMdOnlyHook(createMockPluginInput())
       const input = {
         tool: "Write",
         sessionID: TEST_SESSION_ID,
         callID: "call-1",
       }
       const output = {
         args: { filePath: "my-project\\src\\code.ts" },
       }

       // when / #then
       await expect(
         hook["tool.execute.before"](input, output)
       ).rejects.toThrow("File operations restricted to .omop/*.md plan files only")
     })
  })
})
