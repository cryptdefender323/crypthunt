import type { CryptHunterConfig } from "../config";
import type { PluginContext } from "./types";
import type { ChatMessageHandlerOutput, ChatMessageHooks, ChatMessageInput, FirstMessageVariantGate } from "./chat-message/types";
export type { ChatMessageHandlerOutput, ChatMessageInput } from "./chat-message/types";
export declare function createChatMessageHandler(args: {
    ctx: PluginContext;
    pluginConfig: CryptHunterConfig;
    firstMessageVariantGate: FirstMessageVariantGate;
    hooks: ChatMessageHooks;
}): (input: ChatMessageInput, output: ChatMessageHandlerOutput) => Promise<void>;
