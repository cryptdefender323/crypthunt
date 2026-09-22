import { readFileSync, readdirSync, rmSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  getPlatformPackageCandidates,
  getBinaryPath,
  resolvePlatformPackageBaseName,
} from "./bin/platform.js";
import { detectPlatformBinaryMismatch } from "./bin/version-mismatch.js";

const require = createRequire(import.meta.url);

const MIN_OPENCODE_VERSION = "1.4.0";
const OPENCODE_PLUGIN_PACKAGES = ["crypthunter"];

function parseVersion(version) {
  return version
    .replace(/^v/, "")
    .split("-")[0]
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
}

function compareVersions(current, minimum) {
  const currentParts = parseVersion(current);
  const minimumParts = parseVersion(minimum);
  const length = Math.max(currentParts.length, minimumParts.length);

  for (let index = 0; index < length; index++) {
    const currentPart = currentParts[index] ?? 0;
    const minimumPart = minimumParts[index] ?? 0;
    if (currentPart > minimumPart) return true;
    if (currentPart < minimumPart) return false;
  }

  return true;
}

function checkOpenCodeVersion() {
  try {
    const result = require("child_process").execSync("opencode --version", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const version = result.trim();
    const ok = compareVersions(version, MIN_OPENCODE_VERSION);
    return { ok, version };
  } catch {
    return { ok: true, version: null };
  }
}

function getLibcFamily() {
  if (process.platform !== "linux") {
    return undefined;
  }
  try {
    const detectLibc = require("detect-libc");
    return detectLibc.familySync();
  } catch {
    return null;
  }
}

function readMainPackageJson() {
  try {
    return JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
  } catch {
    return null;
  }
}

function getPackageBaseName() {
  const packageJson = readMainPackageJson();
  return resolvePlatformPackageBaseName(packageJson?.name || "oh-my-open-pentest");
}

function getMainPackageVersion() {
  const packageJson = readMainPackageJson();
  return packageJson?.version ?? null;
}

function invalidateOpenCodePluginCache() {
  const cacheDir = join(process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"), "opencode");
  const parentDirs = [cacheDir, join(cacheDir, "packages")];
  const prefixes = OPENCODE_PLUGIN_PACKAGES.map((packageName) => `${packageName}@`);

  for (const parentDir of parentDirs) {
    try {
      for (const entry of readdirSync(parentDir, { withFileTypes: true })) {
        if (entry.isDirectory() && prefixes.some((prefix) => entry.name.startsWith(prefix))) {
          rmSync(join(parentDir, entry.name), { recursive: true, force: true });
        }
      }
    } catch {}
  }
}

function readPlatformPackageVersion(pkg) {
  try {
    const platformPackageJsonPath = require.resolve(`${pkg}/package.json`);
    const packageJson = JSON.parse(readFileSync(platformPackageJsonPath, "utf8"));
    return packageJson.version ?? null;
  } catch {
    return null;
  }
}

function main() {
  const { platform, arch } = process;
  const libcFamily = getLibcFamily();
  const packageBaseName = getPackageBaseName();

  invalidateOpenCodePluginCache();

  const versionCheck = checkOpenCodeVersion();
  if (versionCheck.version && !versionCheck.ok) {
    console.warn(`⚠ CryptHunter requires OpenCode >= ${MIN_OPENCODE_VERSION}`);
    console.warn(`  Detected: ${versionCheck.version}`);
    console.warn(`  Update OpenCode: npm install -g opencode-ai`);
  }

  const distCliPath = new URL("./dist/cli/index.js", import.meta.url).pathname;
  let hasDist = false;
  try {
    hasDist = existsSync(distCliPath);
  } catch {
    hasDist = false;
  }

  try {
    const packageCandidates = getPlatformPackageCandidates({
      platform,
      arch,
      libcFamily,
      packageBaseName,
    });

    const resolvedPackage = packageCandidates.find((pkg) => {
      try {
        require.resolve(getBinaryPath(pkg, platform));
        return true;
      } catch {
        return false;
      }
    });

    if (!resolvedPackage) {
      if (hasDist) {
        console.log(`✓ CryptHunter installed (source build — dist/cli/index.js)`);
      } else {
        console.log(`✓ CryptHunter installed — run 'crypthunter install' to complete setup`);
      }
      return;
    }

    const mismatch = detectPlatformBinaryMismatch({
      mainVersion: getMainPackageVersion(),
      platformVersion: readPlatformPackageVersion(resolvedPackage),
      platformPackage: resolvedPackage,
    });
    if (mismatch) {
      console.warn(`⚠ CryptHunter platform binary version mismatch`);
      console.warn(`  Fix: npm install -g crypthunter@${mismatch.mainVersion} ${mismatch.platformPackage}@${mismatch.mainVersion}`);
    }

    console.log(`✓ CryptHunter binary installed for ${platform}-${arch} (${resolvedPackage})`);
  } catch {
    if (hasDist) {
      console.log(`✓ CryptHunter installed (source build)`);
    } else {
      console.log(`✓ CryptHunter installed — first run will build automatically`);
    }
  }
}

main();
