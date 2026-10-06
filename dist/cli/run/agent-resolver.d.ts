import type { RunOptions } from "./types";
import type { CryptHunterConfig } from "../../config";
type EnvVars = Record<string, string | undefined>;
export declare const resolveRunAgent: (options: RunOptions, pluginConfig: CryptHunterConfig, env?: EnvVars) => string;
export {};
