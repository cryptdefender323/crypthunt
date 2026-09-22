/**
 * Cross-platform check if a path is inside .omop/ directory.
 * Handles both forward slashes (Unix) and backslashes (Windows).
 * Uses path segment matching instead of substring matching.
 */
export function isOmoPath(filePath: string): boolean {
  return /(^|[/\\])\.omop?([/\\]|$)/.test(filePath)
}
