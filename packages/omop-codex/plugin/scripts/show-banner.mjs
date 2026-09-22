#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  try {
    const asciiPath = join(__dirname, "ascii-omop.txt");
    const art = await readFile(asciiPath, "utf8");
    const banner = `${art}\n  OMOP (CryptHunter)\n  By Muhammad Zakir Ramadhan (zakirkun)\n`;
    console.log(banner);
  } catch {
    console.log("  OMOP (CryptHunter) - By Muhammad Zakir Ramadhan (zakirkun)");
  }
}

main();
