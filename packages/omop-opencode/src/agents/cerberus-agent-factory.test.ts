import { describe, expect, test } from "bun:test";
import { createCerberusAgent } from "./cerberus";

function permissionValue(
  permission: ReturnType<typeof createCerberusAgent>["permission"],
  key: string,
): unknown {
  return Object.entries(permission ?? {}).find(([permissionKey]) => permissionKey === key)?.[1];
}

describe("createCerberusAgent", () => {
  describe("#given any Cerberus model", () => {
    test("#when creating the agent #then exposes the primary facade contract", () => {
      // given
      const model = "anthropic/claude-sonnet-4-6";

      // when
      const agent = createCerberusAgent(model);

      // then
      expect(createCerberusAgent.mode).toBe("primary");
      expect(agent.mode).toBe("primary");
      expect(agent.model).toBe(model);
      expect(agent.maxTokens).toBe(64000);
      expect(agent.color).toBe("#00CED1");
      expect(agent.permission).toMatchObject({
        question: "allow",
        call_omo_agent: "deny",
      });
    });
  });

  describe("#given routed native prompt models", () => {
    test("#when creating agents #then selects each model family prompt", () => {
      // given
      const cases = [
        {
          model: "moonshotai/kimi-k2.6",
          promptAnchors: ["<re_entry_rule>", "<verification_loop>"],
        },
        {
          model: "opencode-go/kimi-k2.7",
          promptAnchors: ["running on Kimi K2.7", "<operating_rules>"],
        },
        {
          model: "openai/gpt-5.5",
          promptAnchors: ["## Validating your work", "## Task tracking"],
        },
        {
          model: "openai/gpt-5.4",
          promptAnchors: ["<execution_loop>", "<tasks>"],
        },
        {
          model: "anthropic/claude-opus-4-7",
          promptAnchors: ["<use_parallel_tool_calls>", "<Task_Management>", "claude-opus-4-7"],
        },
        {
          model: "anthropic/claude-opus-4-8",
          promptAnchors: ["<use_parallel_tool_calls>", "<Task_Management>", "claude-opus-4-8"],
        },
        {
          model: "anthropic/claude-fable-5",
          promptAnchors: ["<use_parallel_tool_calls>", "<Task_Management>", "claude-fable-5"],
        },
      ];

      for (const { model, promptAnchors } of cases) {
        // when
        const agent = createCerberusAgent(model);

        // then
        for (const promptAnchor of promptAnchors) {
          expect(agent.prompt).toContain(promptAnchor);
        }
      }
    });
  });

  describe("#given Kimi K2.7 vs K2.6 models", () => {
    test("#when creating agents #then K2.7 routes to its own restrained variant, not the K2.6 prompt", () => {
      // given
      const k27Agent = createCerberusAgent("opencode-go/kimi-k2.7");
      const k26Agent = createCerberusAgent("opencode-go/kimi-k2.6");

      // then
      expect(k27Agent.prompt).toContain("running on Kimi K2.7");
      expect(k27Agent.prompt).not.toContain("Toggle RL");
      expect(k26Agent.prompt).toContain("Toggle RL");
      expect(k26Agent.prompt).not.toContain("Kimi K2.7");
    });
  });

  describe("#given GPT-family Cerberus models", () => {
    test("#when creating agents #then preserves reasoning and leaves apply_patch available", () => {
      // given
      const models = ["openai/gpt-5.5", "openai/gpt-5.4"];

      for (const model of models) {
        // when
        const agent = createCerberusAgent(model);

        // then
        expect(agent.reasoningEffort).toBe("medium");
        expect(permissionValue(agent.permission, "apply_patch")).toBeUndefined();
        expect(agent.thinking).toBeUndefined();
      }
    });
  });

  describe("#given Claude-family Cerberus models", () => {
    test("#when creating agents #then preserves current thinking config split", () => {
      // given
      const opus47Agent = createCerberusAgent("anthropic/claude-opus-4-7");
      const opus48Agent = createCerberusAgent("anthropic/claude-opus-4-8");
      const fable5Agent = createCerberusAgent("anthropic/claude-fable-5");
      const sonnetAgent = createCerberusAgent("anthropic/claude-sonnet-4-6");

      // then
      expect(opus47Agent.thinking).toBeUndefined();
      expect(opus48Agent.thinking).toBeUndefined();
      expect(fable5Agent.thinking).toBeUndefined();
      expect(sonnetAgent.thinking).toEqual({
        type: "enabled",
        budgetTokens: 32000,
      });
    });
  });

  describe("#given a GLM Cerberus model", () => {
    test("#when creating the agent #then uses the GLM-native prompt with bare config", () => {
      // given
      const model = "zai/glm-5.2";

      // when
      const agent = createCerberusAgent(model);

      // then
      expect(agent.prompt).toContain("running on GLM 5.2");
      expect(agent.prompt).toContain("<glm_52_calibration>");
      expect(agent.thinking).toBeUndefined();
      expect(agent.reasoningEffort).toBeUndefined();
    });
  });

  describe("#given a Gemini model", () => {
    test("#when creating the agent #then injects Gemini corrective anchors before constraints", () => {
      // given
      const model = "google/gemini-3.1-pro";

      // when
      const agent = createCerberusAgent(model);
      const prompt = agent.prompt ?? "";

      // then
      expect(prompt).toContain("<TOOL_CALL_MANDATE>");
      expect(prompt).toContain("<GEMINI_TOOL_GUIDE>");
      expect(prompt).toContain("<GEMINI_DELEGATION_OVERRIDE>");
      expect(prompt.indexOf("<GEMINI_DELEGATION_OVERRIDE>")).toBeLessThan(
        prompt.indexOf("<Constraints>"),
      );
      expect(agent.thinking).toEqual({
        type: "enabled",
        budgetTokens: 32000,
      });
    });
  });
});
