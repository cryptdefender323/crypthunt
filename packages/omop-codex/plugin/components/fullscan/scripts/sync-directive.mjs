#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const componentRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const codexPromptUrl = new URL(import.meta.resolve("@omop/prompts-core/prompts/fullscan/codex.md"));
const directivePath = join(componentRoot, "directive.md");

const codexPrompt = await readFile(codexPromptUrl, "utf8");
await writeFile(directivePath, codexPrompt);
