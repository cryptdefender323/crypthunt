import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const EXPECTED_COMPONENT_BINS = new Map([
	["comment-checker", "omop-comment-checker"],
	["lsp", "omop-lsp"],
	["rules", "omop-rules"],
	["start-work-continuation", "omop-start-work-continuation"],
	["telemetry", "omop-telemetry"],
	["fullscan", "omop-fullscan"],
	["pentest-loop", "omop-pentest-loop"],
]);

const EXPECTED_USAGE_PREFIXES = new Map([
	["comment-checker", "Usage: omop-comment-checker "],
	["lsp", "Usage: omop-lsp "],
	["rules", "Usage: omop-rules "],
	["start-work-continuation", "Usage: omop-start-work-continuation "],
	["telemetry", "Usage: omop-telemetry "],
	["fullscan", "Usage: omop-fullscan "],
]);

async function readJson(relativePath) {
	return JSON.parse(await readFile(join(root, relativePath), "utf8"));
}

test("#given aggregate component package metadata #when bin names are inspected #then local component CLIs use the OMO prefix", async () => {
	// given
	const components = [...EXPECTED_COMPONENT_BINS.entries()];

	// when
	const mismatches = [];
	for (const [component, expectedName] of components) {
		const packageJson = await readJson(join("components", component, "package.json"));
		const bin = packageJson.bin ?? {};
		const binNames = Object.keys(bin).sort();
		if (bin[expectedName] !== "./dist/cli.js" || binNames.some((name) => name.startsWith("codex-"))) {
			mismatches.push({ component, expectedName, bin });
		}
	}

	// then
	assert.deepEqual(mismatches, []);
});

test("#given component CLI sources #when usage text is inspected #then user-facing command names use OMO names", async () => {
	// given
	const components = [...EXPECTED_USAGE_PREFIXES.entries()];

	// when
	const mismatches = [];
	for (const [component, expectedUsage] of components) {
		const source = await readFile(join(root, "components", component, "src", "cli.ts"), "utf8");
		if (!source.includes(expectedUsage) || /Usage: codex-/.test(source)) {
			mismatches.push({ component, expectedUsage });
		}
	}

	// then
	assert.deepEqual(mismatches, []);
});
