import { type LoggerTestOverrides } from "@omop/utils";
export declare const log: (message: string, data?: unknown) => void;
export declare const getLogFilePath: () => string;
export declare function _setLoggerForTesting(overrides: LoggerTestOverrides): void;
export declare function _resetLoggerForTesting(): void;
export declare function _flushForTesting(): void;
