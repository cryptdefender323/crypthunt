#!/usr/bin/env node
import { runCatalogToolInstallerCli } from "./codex-hook.js";

const HELP =
	"Usage:\n  omop-catalog-tool-installer hook pre-tool-use\n  omop-catalog-tool-installer help | --help | -h\n";

async function main(): Promise<number> {
	const argv = process.argv.slice(2);
	const command = argv[0];
	if (command === undefined || command === "help" || command === "--help" || command === "-h") {
		process.stdout.write(HELP);
		return 0;
	}
	if (command === "hook" && argv[1] === "pre-tool-use") {
		await runCatalogToolInstallerCli(process.stdin, process.stdout);
		return 0;
	}
	process.stderr.write(`[omop-catalog-tool-installer] unknown command: ${argv.join(" ")}\n${HELP}`);
	return 1;
}

main()
	.then((code) => {
		process.exit(code);
	})
	.catch((error: unknown) => {
		process.stderr.write(
			`[omop-catalog-tool-installer] ${error instanceof Error ? error.message : String(error)}\n`,
		);
		process.exit(1);
	});
