import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs"
import { join, extname } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "")

const REPLACEMENTS: [string, string][] = [
  [
    "https://raw.githubusercontent.com/cryptdefender323/crypthunter/dev/assets/crypthunter.schema.json",
    "https://raw.githubusercontent.com/cryptdefender323/crypthunter/dev/assets/crypthunter.schema.json",
  ],
  [
    "https://github.com/cryptdefender323/crypthunter",
    "https://github.com/cryptdefender323/crypthunter",
  ],
  [
    "https://github.com/cryptdefender323/crypthunter",
    "https://github.com/cryptdefender323/crypthunter",
  ],
  ["CryptHunter Configuration", "CryptHunter Configuration"],
  ["crypthunter plugin", "crypthunter plugin"],
  ["assets/crypthunter.schema.json", "assets/crypthunter.schema.json"],
  ["dist/crypthunter.schema.json", "dist/crypthunter.schema.json"],
  ["CryptHunter", "CryptHunter"],
]

const EXTS = new Set([".jsonc", ".md", ".ts", ".json", ".yml", ".yaml", ".mjs", ".sh"])
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "lsp-tools-mcp", "lsp-daemon"])

const changed: string[] = []

function walk(dir: string): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full)
    } else if (EXTS.has(extname(entry))) {
      try {
        let text = readFileSync(full, "utf8")
        let updated = text
        for (const [from, to] of REPLACEMENTS) {
          updated = updated.replaceAll(from, to)
        }
        if (updated !== text) {
          writeFileSync(full, updated, "utf8")
          changed.push(full.replace(ROOT + "/", ""))
        }
      } catch {
        // binary or unreadable — skip
      }
    }
  }
}

walk(ROOT)

for (const f of changed.sort()) {
  console.log("updated:", f)
}
console.log(`\nTotal: ${changed.length} files`)
