import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execAsync = promisify(exec);

export interface PreToolUsePayload {
	readonly hook_event_name: "PreToolUse";
	readonly tool_name: string;
	readonly tool_input: unknown;
	readonly session_id?: string;
	readonly cwd?: string;
}

export interface CatalogToolInstallerOptions {
	readonly platform?: NodeJS.Platform | string;
	readonly env?: NodeJS.ProcessEnv;
	readonly catalogPath?: string;
	readonly pluginRoot?: string;
	readonly execAsync?: (command: string, options?: { timeout?: number }) => Promise<{ stdout: string; stderr: string }>;
}

interface CatalogTool {
	readonly tools_name: string;
	readonly command?: { readonly base?: string };
	readonly installation?: Partial<Record<string, { readonly command?: string }>>;
	readonly check_installed?: { readonly command?: string; readonly parse_version?: string };
}

interface ToolsCatalog {
	readonly tools: readonly CatalogTool[];
}

const BASH_TOOL_NAME = "Bash";
const SKIP_PREFIXES = new Set([
	"sudo",
	"env",
	"nohup",
	"time",
	"command",
	"nice",
	"timeout",
	"which",
	"where",
	"where.exe",
	"type",
]);
const PRESENCE_CHECK_PREFIXES = new Set(["which", "where", "where.exe", "type", "command"]);

const verifiedInstalled = new Set<string>();
let cachedCatalog: ToolsCatalog | null | "missing" = null;

export function extractCatalogToolToken(command: string): string | null {
	let rest = command.trim();
	if (!rest) return null;
	rest = rest.split(/[|;&]/)[0]?.trim() ?? rest;
	if (!rest) return null;

	const parts = rest.split(/\s+/).filter(Boolean);
	let i = 0;
	if (parts[0] && PRESENCE_CHECK_PREFIXES.has(parts[0].toLowerCase())) return null;

	while (i < parts.length) {
		const p = parts[i]!;
		const lower = p.toLowerCase();
		if (SKIP_PREFIXES.has(lower)) {
			i += 1;
			if (lower === "env") {
				while (i < parts.length && parts[i]!.includes("=")) i += 1;
			}
			if (lower === "command" && i < parts.length && parts[i]!.startsWith("-")) i += 1;
			continue;
		}
		if (p.includes("=") && !p.startsWith("-")) {
			i += 1;
			continue;
		}
		break;
	}

	const raw = parts[i];
	if (!raw || raw.startsWith("-")) return null;
	const base = raw.replace(/^.*[/\\]/, "").replace(/\.exe$/i, "");
	if (!base || base === "cd" || base === "echo" || base === "true" || base === "false") return null;
	return base;
}

export function parsePreToolUsePayload(raw: string): PreToolUsePayload | null {
	if (raw.trim().length === 0) return null;
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!isRecord(parsed)) return null;
		if (parsed.hook_event_name !== "PreToolUse") return null;
		if (typeof parsed.tool_name !== "string") return null;
		return {
			hook_event_name: "PreToolUse",
			tool_name: parsed.tool_name,
			tool_input: parsed.tool_input,
			session_id: typeof parsed.session_id === "string" ? parsed.session_id : undefined,
			cwd: typeof parsed.cwd === "string" ? parsed.cwd : undefined,
		};
	} catch {
		return null;
	}
}

export function extractBashCommand(toolInput: unknown): string | null {
	if (!isRecord(toolInput)) return null;
	if (typeof toolInput.command === "string") return toolInput.command;
	if (isRecord(toolInput.input) && typeof toolInput.input.command === "string") return toolInput.input.command;
	return null;
}

function findCatalogCandidates(options: CatalogToolInstallerOptions): string[] {
	const out: string[] = [];
	if (options.catalogPath) out.push(options.catalogPath);
	const cwd = options.env?.PWD ?? process.cwd();
	out.push(resolve(cwd, "tools-catalog.json"));
	const pluginRoot = options.pluginRoot ?? defaultPluginRoot();
	// plugin/components/catalog-tool-installer -> repo root tools-catalog.json
	out.push(resolve(pluginRoot, "../../../../tools-catalog.json"));
	out.push(resolve(pluginRoot, "../../../tools-catalog.json"));
	const home = options.env?.HOME ?? options.env?.USERPROFILE ?? homedir();
	out.push(join(home, ".omop", "tools-catalog.json"));
	return out;
}

function defaultPluginRoot(): string {
	try {
		return dirname(fileURLToPath(import.meta.url));
	} catch {
		return process.cwd();
	}
}

export function loadCatalog(options: CatalogToolInstallerOptions = {}): ToolsCatalog | null {
	if (cachedCatalog === "missing") return null;
	if (cachedCatalog !== null) return cachedCatalog;
	for (const path of findCatalogCandidates(options)) {
		if (!existsSync(path)) continue;
		try {
			const parsed = JSON.parse(readFileSync(path, "utf8")) as ToolsCatalog;
			if (Array.isArray(parsed.tools)) {
				cachedCatalog = parsed;
				return parsed;
			}
		} catch {
			// try next
		}
	}
	cachedCatalog = "missing";
	return null;
}

function findTool(catalog: ToolsCatalog, token: string): CatalogTool | undefined {
	const lower = token.toLowerCase();
	return (
		catalog.tools.find((t) => t.tools_name.toLowerCase() === lower) ??
		catalog.tools.find((t) => (t.command?.base ?? "").toLowerCase() === lower) ??
		catalog.tools.find((t) => (t.command?.base ?? "").toLowerCase().replace(/\.exe$/i, "") === lower)
	);
}

async function isInstalled(
	tool: CatalogTool,
	run: NonNullable<CatalogToolInstallerOptions["execAsync"]>,
): Promise<boolean> {
	const cmd = tool.check_installed?.command;
	if (!cmd) return false;
	try {
		await run(cmd, { timeout: 10000 });
		return true;
	} catch {
		return false;
	}
}

async function installTool(
	tool: CatalogTool,
	platform: string,
	run: NonNullable<CatalogToolInstallerOptions["execAsync"]>,
): Promise<{ success: boolean; message: string }> {
	const installCmd = tool.installation?.[platform]?.command;
	if (!installCmd) {
		return { success: false, message: `No installation command for platform ${platform}` };
	}
	try {
		const { stdout, stderr } = await run(installCmd, { timeout: 300000 });
		return { success: true, message: stdout || stderr || "ok" };
	} catch (error) {
		return { success: false, message: error instanceof Error ? error.message : String(error) };
	}
}

export async function applyCatalogToolInstallerPreToolUse(
	payload: PreToolUsePayload,
	options: CatalogToolInstallerOptions = {},
): Promise<string> {
	if (payload.hook_event_name !== "PreToolUse") return "";
	if (payload.tool_name !== BASH_TOOL_NAME) return "";

	const command = extractBashCommand(payload.tool_input);
	if (!command) return "";

	const token = extractCatalogToolToken(command);
	if (!token) return "";
	if (verifiedInstalled.has(token)) return "";

	const catalog = loadCatalog(options);
	if (!catalog) return "";

	const tool = findTool(catalog, token);
	if (!tool) return "";

	const key = tool.tools_name;
	if (verifiedInstalled.has(key)) return "";

	const run = options.execAsync ?? execAsync;
	const platform = String(options.platform ?? process.platform);

	if (await isInstalled(tool, run)) {
		verifiedInstalled.add(key);
		verifiedInstalled.add(token);
		return "";
	}

	const result = await installTool(tool, platform, run);
	if (result.success) {
		verifiedInstalled.add(key);
		verifiedInstalled.add(token);
		return `${JSON.stringify({
			hookSpecificOutput: {
				hookEventName: "PreToolUse",
				additionalContext: `[omop] installed catalog tool "${key}" before Bash`,
			},
		})}\n`;
	}

	return `${JSON.stringify({
		hookSpecificOutput: {
			hookEventName: "PreToolUse",
			additionalContext: `[omop] catalog tool "${key}" missing; install failed: ${result.message}. Try: oh-my-open-pentest tools install -t ${key}`,
		},
	})}\n`;
}

export async function runCatalogToolInstallerCli(
	stdin: NodeJS.ReadableStream,
	stdout: NodeJS.WritableStream,
	options: CatalogToolInstallerOptions = {},
): Promise<void> {
	try {
		const raw = await readAll(stdin);
		const payload = parsePreToolUsePayload(raw);
		if (!payload) return;
		const output = await applyCatalogToolInstallerPreToolUse(payload, options);
		if (output.length > 0) stdout.write(output);
	} catch {
		// silent — never block Codex
	}
}

export function resetCatalogToolInstallerStateForTests(): void {
	verifiedInstalled.clear();
	cachedCatalog = null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

async function readAll(stream: NodeJS.ReadableStream): Promise<string> {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	}
	return Buffer.concat(chunks).toString("utf8");
}
