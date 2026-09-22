import { findRuleFilesRecursive as findRuleFileEntriesRecursive, safeRealpathSync } from "@omop/rules-engine";
import type { DirectoryScanEntry } from "@omop/rules-engine";

export { safeRealpathSync };

export function findRuleFilesRecursive(dir: string, results: string[]): void {
  const entries: DirectoryScanEntry[] = [];
  findRuleFileEntriesRecursive(dir, entries);
  results.push(...entries.map((entry) => entry.path));
}
