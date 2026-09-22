import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const pluginRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = join(pluginRoot, "..", "..", "..");

test("#given Codex Light install docs #when inspected #then lazycodex is npm-first and Bun-free", async () => {
	// given
	const files = [
		join(repoRoot, "README.md"),
		join(repoRoot, "docs", "guide", "installation.md"),
		join(repoRoot, "packages", "omop-codex", "README.md"),
		join(repoRoot, "packages", "omop-codex", "MARKETPLACE.md"),
		join(pluginRoot, "components", "fullscan", "README.md"),
		join(pluginRoot, "components", "pentest-loop", "README.md"),
	];

	// when
	const docs = await Promise.all(files.map(async (path) => [path, await readFile(path, "utf8")]));

	// then
	for (const [path, text] of docs) {
		assert.match(text, /\bnpx lazycodex-ai install\b/, `${path} should document the Node/npm install command`);
		assert.doesNotMatch(text, /\bbunx lazycodex-ai\b/, `${path} should not require Bun for lazycodex`);
	}
});
