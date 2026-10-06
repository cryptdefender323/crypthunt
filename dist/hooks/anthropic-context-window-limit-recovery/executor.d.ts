import type { AutoCompactState } from "./types";
import type { CryptHunterConfig } from "../../config";
import type { ExperimentalConfig } from "../../config";
import type { Client } from "./client";
export { getLastAssistant } from "./message-builder";
export declare function executeCompact(sessionID: string, msg: Record<string, unknown>, autoCompactState: AutoCompactState, client: Client, directory: string, pluginConfig: CryptHunterConfig, experimental?: ExperimentalConfig): Promise<void>;
