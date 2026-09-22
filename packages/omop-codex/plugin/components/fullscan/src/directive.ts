import { readFileSync } from "node:fs";

export const FULLSCAN_DIRECTIVE: string = readFileSync(new URL("../directive.md", import.meta.url), "utf8");
