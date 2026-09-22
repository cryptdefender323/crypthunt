import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("codex fullscan directive source", () => {
	it("#given bundled directive #when compared to prompts-core codex variant #then bytes match", () => {
		// given
		const directive = readFileSync("directive.md", "utf8");
		const codexPromptUrl = new URL(import.meta.resolve("@omop/prompts-core/prompts/fullscan/codex.md"));

		// when
		const codexPrompt = readFileSync(codexPromptUrl, "utf8");

		// then
		expect(codexPrompt).toBe(directive);
	});
});
