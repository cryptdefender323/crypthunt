import type { CryptHunterConfig } from "../../config";
import type { ChatMessageHandlerOutput, ChatMessageInput, SessionModelOverride } from "./types";
export declare function getStoredMainSessionModel(input: ChatMessageInput, pluginConfig: CryptHunterConfig, isFirstMessage: boolean): SessionModelOverride | undefined;
export declare function recordSessionModel(input: ChatMessageInput, output: ChatMessageHandlerOutput): void;
