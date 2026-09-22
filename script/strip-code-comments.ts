import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs"
import { join, extname } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "")
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "lsp-tools-mcp", "lsp-daemon", ".kiro"])

function stripBashComments(md: string): string {
  const lines = md.split("\n")
  const result: string[] = []
  let inCodeBlock = false
  let codeBlockLang = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fenceMatch = line.match(/^```(\w*)/)

    if (fenceMatch && !inCodeBlock) {
      inCodeBlock = true
      codeBlockLang = fenceMatch[1] ?? ""
      result.push(line)
      continue
    }

    if (line.startsWith("```") && inCodeBlock) {
      inCodeBlock = false
      codeBlockLang = ""
      result.push(line)
      continue
    }

    if (inCodeBlock && (codeBlockLang === "bash" || codeBlockLang === "sh" || codeBlockLang === "")) {
      const isStandaloneComment = /^\s*#\s+[A-Za-z]/.test(line) && !/sudo|apt|brew|go install/.test(line)
      const prevLine = result[result.length - 1] ?? ""
      const nextLine = lines[i + 1] ?? ""

      if (isStandaloneComment) {
        if (prevLine !== "" && !prevLine.startsWith("```")) {
          result.push("")
        }
        continue
      }
    }

    result.push(line)
  }

  return result.join("\n").replace(/\n{3,}/g, "\n\n")
}

function walk(dir: string): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full)
    } else if (extname(entry) === ".md") {
      try {
        const text = readFileSync(full, "utf8")
        const updated = stripBashComments(text)
        if (updated !== text) {
          writeFileSync(full, updated, "utf8")
          console.log("stripped:", full.replace(ROOT + "/", ""))
        }
      } catch {
        // skip unreadable
      }
    }
  }
}

walk(ROOT)
console.log("done")
