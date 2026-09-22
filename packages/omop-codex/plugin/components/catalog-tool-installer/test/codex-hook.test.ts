import { describe, expect, it, beforeEach } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	applyCatalogToolInstallerPreToolUse,
	extractCatalogToolToken,
	resetCatalogToolInstallerStateForTests,
	type PreToolUsePayload,
} from "../src/codex-hook.ts";

const catalog = {
	tools: [
		{
			tools_name: "nmap",
			command: { base: "nmap" },
			installation: {
				linux: { command: "echo install-nmap" },
				win32: { command: "echo install-nmap" },
			},
			check_installed: { command: "nmap --version" },
		},
	],
};

describe("codex catalog-tool-installer", () => {
	beforeEach(() => {
		resetCatalogToolInstallerStateForTests();
	});

	it("#given sudo nmap #when extract #then nmap", () => {
		expect(extractCatalogToolToken("sudo nmap -sV host")).toBe("nmap");
	});

	it("#given which nmap #when extract #then null", () => {
		expect(extractCatalogToolToken("which nmap")).toBeNull();
	});

	it("#given missing nmap Bash #when PreToolUse #then installs and emits context", async () => {
		// given
		const dir = mkdtempSync(join(tmpdir(), "omop-codex-catalog-"));
		const catalogPath = join(dir, "tools-catalog.json");
		writeFileSync(catalogPath, JSON.stringify(catalog));
		let installed = false;
		const payload: PreToolUsePayload = {
			hook_event_name: "PreToolUse",
			tool_name: "Bash",
			tool_input: { command: "nmap -sV example.com" },
			session_id: "s1",
		};

		// when
		const out = await applyCatalogToolInstallerPreToolUse(payload, {
			catalogPath,
			platform: "linux",
			execAsync: async (command) => {
				if (command.includes("--version")) {
					if (!installed) throw new Error("missing");
					return { stdout: "7.0\n", stderr: "" };
				}
				installed = true;
				return { stdout: "ok\n", stderr: "" };
			},
		});

		// then
		expect(out).toContain("installed catalog tool");
		expect(installed).toBe(true);
	});

	it("#given already installed #when PreToolUse #then silent", async () => {
		// given
		const dir = mkdtempSync(join(tmpdir(), "omop-codex-catalog-"));
		const catalogPath = join(dir, "tools-catalog.json");
		writeFileSync(catalogPath, JSON.stringify(catalog));

		// when
		const out = await applyCatalogToolInstallerPreToolUse(
			{
				hook_event_name: "PreToolUse",
				tool_name: "Bash",
				tool_input: { command: "nmap -sV x" },
			},
			{
				catalogPath,
				execAsync: async () => ({ stdout: "ok\n", stderr: "" }),
			},
		);

		// then
		expect(out).toBe("");
	});
});
