import { resolveModel, resolveModelWithFallback as resolveModelWithFallbackFromCore, normalizeFallbackModels, flattenToFallbackModelStrings } from "@omop/model-core";
import type { ModelResolutionInput, ExtendedModelResolutionInput } from "@omop/model-core";
export { resolveModel, normalizeFallbackModels, flattenToFallbackModelStrings };
type CoreModelResolutionResult = ReturnType<typeof resolveModelWithFallbackFromCore>;
export type ModelResolutionResult = Exclude<CoreModelResolutionResult, undefined>;
export type ModelSource = ModelResolutionResult["source"];
export declare function resolveModelWithFallback(input: ExtendedModelResolutionInput): CoreModelResolutionResult;
export type { ModelResolutionInput, ExtendedModelResolutionInput, };
