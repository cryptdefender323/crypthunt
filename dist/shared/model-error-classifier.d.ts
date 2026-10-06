import { getNextFallback, hasMoreFallbacks, isRetryableModelError, selectFallbackProviderWithCache, shouldRetryError } from "@omop/model-core";
import type { ErrorInfo } from "@omop/model-core";
export type { ErrorInfo };
export { isRetryableModelError, shouldRetryError, getNextFallback, hasMoreFallbacks, selectFallbackProviderWithCache, };
export declare function selectFallbackProvider(providers: string[], preferredProviderID?: string): string;
