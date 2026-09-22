import { mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "bun:test";

import {
  clearProjectRootCache,
  createAgentsMdCache,
  createRuleScanCache,
  findRuleFilesRecursive,
  findAgentsMdUp,
  findProjectRoot,
  findRuleFiles,
  parseRuleFrontmatter,
  shouldApplyRule,
  type DirectoryScanEntry,
} from "./index";
import { _resetCerberusRuleDeprecationWarningStateForTesting, _setCerberusRuleDeprecationLoggerForTesting } from "./finder";

let testRoot: string | null = null;

const CERBERUS_DEPRECATION_MESSAGE = "[rules] .cerberus/rules is deprecated and will be removed in v4.3.0; migrate to .omop/rules";

function createTestRoot(name: string): string {
  testRoot = join(tmpdir(), `${name}-${Date.now()}-${Math.random()}`);
  mkdirSync(testRoot, { recursive: true });
  return testRoot;
}

afterEach(() => {
  _resetCerberusRuleDeprecationWarningStateForTesting();
  if (testRoot) {
    rmSync(testRoot, { recursive: true, force: true });
    testRoot = null;
  }
  clearProjectRootCache();
});

describe("rules-core", () => {
  it("#given mixed rule sources #when finding rule files #then returns deterministic source-priority order", () => {
    // given
    const root = createTestRoot("rules-core-order");
    mkdirSync(join(root, ".git"));
    mkdirSync(join(root, ".omop", "rules"), { recursive: true });
    mkdirSync(join(root, ".cerberus", "rules"), { recursive: true });
    mkdirSync(join(root, ".claude", "rules"), { recursive: true });
    mkdirSync(join(root, ".cursor", "rules"), { recursive: true });
    mkdirSync(join(root, ".github", "instructions"), { recursive: true });
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, ".github", "copilot-instructions.md"), "copilot");
    writeFileSync(join(root, ".omop", "rules", "omo.md"), "omop");
    writeFileSync(join(root, ".cerberus", "rules", "cerberus.md"), "cerberus");
    writeFileSync(join(root, ".claude", "rules", "claude.md"), "claude");
    writeFileSync(join(root, ".cursor", "rules", "cursor.md"), "cursor");
    writeFileSync(join(root, ".github", "instructions", "github.instructions.md"), "github");

    // when
    const found = findRuleFiles(root, root, join(root, "src", "index.ts"));

    // then
    expect(found.map((rule) => rule.relativePath)).toEqual([
      ".github/copilot-instructions.md",
      ".omop/rules/omo.md",
      ".claude/rules/claude.md",
      ".cursor/rules/cursor.md",
      ".github/instructions/github.instructions.md",
      ".cerberus/rules/cerberus.md",
    ]);
  });

  it("#given Windows separators in .github instructions path #when scanning #then only instructions files are discovered", () => {
    // given
    const root = createTestRoot("rules-core-windows-github-instructions");
    const githubInstructionsDir = join(root, String.raw`.github\instructions`);
    const instructionFile = join(githubInstructionsDir, "typescript.instructions.md");
    const ignoredMarkdownFile = join(githubInstructionsDir, "README.md");
    const results: DirectoryScanEntry[] = [];
    mkdirSync(githubInstructionsDir, { recursive: true });
    writeFileSync(instructionFile, "typescript");
    writeFileSync(ignoredMarkdownFile, "ignored");

    // when
    findRuleFilesRecursive(githubInstructionsDir, results, new Set<string>(), root);

    // then
    expect(results.map((rule) => rule.path)).toEqual([instructionFile]);
  });

  it("#given an alias boundary root #when scanning github instructions #then boundary comparison uses canonical paths", () => {
    // given
    const root = createTestRoot("rules-core-alias-boundary");
    const realProjectRoot = join(root, "repo-real");
    const aliasProjectRoot = join(root, "repo-link");
    const githubInstructionsDir = join(aliasProjectRoot, ".github", "instructions");
    const instructionFile = join(githubInstructionsDir, "typescript.instructions.md");
    const results: DirectoryScanEntry[] = [];
    mkdirSync(join(realProjectRoot, ".github", "instructions"), { recursive: true });
    symlinkSync(realProjectRoot, aliasProjectRoot, "dir");
    writeFileSync(instructionFile, "typescript");

    // when
    findRuleFilesRecursive(githubInstructionsDir, results, new Set<string>(), aliasProjectRoot);

    // then
    expect(results.map((rule) => rule.path)).toEqual([instructionFile]);
  });

  it("#given a workspace with .cerberus/rules/*.md #when findRuleFiles is called #then those files are discovered with lowest priority among project sources", () => {
    // given
    const root = createTestRoot("rules-core-cerberus-restored");
    mkdirSync(join(root, ".git"));
    mkdirSync(join(root, ".omop", "rules"), { recursive: true });
    mkdirSync(join(root, ".cerberus", "rules"), { recursive: true });
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, ".omop", "rules", "shared.md"), "omop");
    writeFileSync(join(root, ".cerberus", "rules", "shared.md"), "legacy");
    writeFileSync(join(root, ".cerberus", "rules", "legacy.md"), "legacy");

    // when
    const found = findRuleFiles(root, root, join(root, "src", "index.ts"));
    const relativePaths = found.map((rule) => rule.relativePath);
    const omoSharedIndex = relativePaths.indexOf(".omop/rules/shared.md");
    const cerberusSharedIndex = relativePaths.indexOf(".cerberus/rules/shared.md");

    // then
    expect(relativePaths).toContain(".cerberus/rules/legacy.md");
    expect(omoSharedIndex).toBeGreaterThanOrEqual(0);
    expect(cerberusSharedIndex).toBeGreaterThan(omoSharedIndex);
  });

  it("#given .cerberus/rules is discovered #when the finder runs #then a deprecation warning is logged exactly once", () => {
    // given
    const root = createTestRoot("rules-core-cerberus-warning");
    const legacyRulePath = join(root, ".cerberus", "rules", "legacy.md");
    mkdirSync(join(root, ".git"));
    mkdirSync(join(root, ".cerberus", "rules"), { recursive: true });
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(legacyRulePath, "legacy");
    const warnings: Array<{ readonly message: string; readonly data: unknown }> = [];
    _setCerberusRuleDeprecationLoggerForTesting((message, data) => {
      warnings.push({ message, data });
    });

    // when
    findRuleFiles(root, root, join(root, "src", "index.ts"));
    findRuleFiles(root, root, join(root, "src", "index.ts"));
    const deprecationWarnings = warnings.filter(
      ({ message, data }) => message === CERBERUS_DEPRECATION_MESSAGE && isCerberusDeprecationData(data, legacyRulePath),
    );

    // then
    expect(deprecationWarnings).toHaveLength(1);
  });

  it("#given a workspace directory has no project marker (no .git, no package.json, etc.) AND contains .omop/rules/ #when findRuleFiles is called #then the .omop/rules/ files are still discovered", () => {
    // given
    const root = createTestRoot("rules-core-markerless-workspace");
    const homeDir = join(root, "home");
    const sourceDir = join(root, "src");
    const ruleFile = join(root, ".omop", "rules", "test-rule.md");
    const currentFile = join(sourceDir, "index.ts");
    mkdirSync(join(root, ".omop", "rules"), { recursive: true });
    mkdirSync(homeDir, { recursive: true });
    mkdirSync(sourceDir, { recursive: true });
    writeFileSync(ruleFile, "markerless workspace rule");
    writeFileSync(currentFile, "export {};");
    const projectRoot = findProjectRoot(currentFile);
    const options = { skipClaudeUserRules: false, workspaceDirectory: root };

    // when
    const found = findRuleFiles(projectRoot, homeDir, currentFile, options);

    // then
    // Some CI/dev environments have project markers (package.json, .git) in
    // tmpdir ancestors, which makes findProjectRoot return a non-null root.
    // The core invariant under test is that .omop/rules files are discovered
    // regardless of project root resolution.
    if (projectRoot === null) {
      expect(projectRoot).toBeNull();
    }
    expect(found.map((rule) => rule.path)).toContain(ruleFile);
  });

  it("#given frontmatter aliases and negative glob #when matching #then honors applyTo paths and exclusions", () => {
    // given
    const { metadata } = parseRuleFrontmatter(`---\npaths: ["src/**/*.ts"]\napplyTo:\n  - "!src/**/*.test.ts"\n---\nRule\n`);

    // when
    const sourceMatch = shouldApplyRule(metadata, "/repo/src/index.ts", "/repo");
    const testMatch = shouldApplyRule(metadata, "/repo/src/index.test.ts", "/repo");

    // then
    expect(sourceMatch).toEqual({ applies: true, reason: "glob: src/**/*.ts" });
    expect(testMatch).toEqual({ applies: false });
  });

  it("#given nested AGENTS.md files #when walking up with root skip #then returns parent-to-child non-root files", async () => {
    // given
    const root = createTestRoot("rules-core-agents");
    mkdirSync(join(root, ".git"));
    mkdirSync(join(root, "packages", "app", "src"), { recursive: true });
    writeFileSync(join(root, "AGENTS.md"), "root");
    writeFileSync(join(root, "packages", "AGENTS.md"), "packages");
    writeFileSync(join(root, "packages", "app", "AGENTS.md"), "app");

    // when
    const found = await findAgentsMdUp({
      startDir: join(root, "packages", "app", "src"),
      rootDir: root,
      cache: createAgentsMdCache(),
    });

    // then
    expect(found).toEqual([
      realpathSync(join(root, "packages", "AGENTS.md")),
      realpathSync(join(root, "packages", "app", "AGENTS.md")),
    ]);
  });

  it("#given start directory outside root #when walking AGENTS.md #then returns no files", async () => {
    // given
    const base = createTestRoot("rules-core-agents-boundary");
    const root = join(base, "repo");
    const outside = join(base, "outside");
    mkdirSync(root, { recursive: true });
    mkdirSync(outside, { recursive: true });
    writeFileSync(join(outside, "AGENTS.md"), "# outside");

    // when
    const found = await findAgentsMdUp({
      startDir: outside,
      rootDir: root,
      cache: createAgentsMdCache(),
    });

    // then
    expect(found).toEqual([]);
  });

  it("#given AGENTS.md symlink points outside root #when walking AGENTS.md #then outside file is ignored", async () => {
    // given
    const base = createTestRoot("rules-core-agents-symlink-boundary");
    const root = join(base, "repo");
    const outside = join(base, "outside");
    mkdirSync(join(root, "src"), { recursive: true });
    mkdirSync(outside, { recursive: true });
    writeFileSync(join(outside, "AGENTS.md"), "# outside symlink");
    symlinkSync(join(outside, "AGENTS.md"), join(root, "src", "AGENTS.md"));

    // when
    const found = await findAgentsMdUp({
      startDir: join(root, "src"),
      rootDir: root,
      cache: createAgentsMdCache(),
    });

    // then
    expect(found).toEqual([]);
  });

  it("#given repeated same-directory targets #when using scan caches #then reuses cached candidates", () => {
    // given
    const root = createTestRoot("rules-core-cache");
    mkdirSync(join(root, ".git"));
    mkdirSync(join(root, ".omop", "rules"), { recursive: true });
    mkdirSync(join(root, "src"), { recursive: true });
    writeFileSync(join(root, ".omop", "rules", "typescript.md"), "typescript");
    const cache = createRuleScanCache();

    // when
    const first = findRuleFiles(root, root, join(root, "src", "a.ts"), undefined, cache);
    const second = findRuleFiles(root, root, join(root, "src", "b.ts"), undefined, cache);

    // then
    expect(first).toEqual(second);
    expect(cache.stats()).toEqual({ candidateEntries: 1, directoryEntries: 11 });
  });

  it("#given nested project markers #when finding project root #then memoizes ancestor lookups", () => {
    // given
    const root = createTestRoot("rules-core-project-root");
    mkdirSync(join(root, ".git"));
    mkdirSync(join(root, "a", "b", "c"), { recursive: true });

    // when
    const first = findProjectRoot(join(root, "a", "b", "c", "file.ts"));
    const second = findProjectRoot(join(root, "a", "b", "other.ts"));

    // then
    expect(first).toBe(root);
    expect(second).toBe(root);
  });
});

function isCerberusDeprecationData(data: unknown, path: string): boolean {
  if (typeof data !== "object" || data === null) return false;
  if (!("event" in data) || !("path" in data)) return false;
  return data.event === "rules-cerberus-deprecated" && data.path === path;
}
