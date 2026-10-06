import type { GetModelCapabilitiesInput, ModelCapabilities } from "@omop/model-core";
export declare function getBundledModelCapabilitiesSnapshotForRuntime(): import("@omop/model-core").ModelCapabilitiesSnapshot;
export declare function getBundledModelCapabilitiesSnapshotForShared(): ReturnType<typeof getBundledModelCapabilitiesSnapshotForRuntime>;
export { getBundledModelCapabilitiesSnapshotForShared as getBundledModelCapabilitiesSnapshot };
export declare function getModelCapabilities(input: GetModelCapabilitiesInput): ModelCapabilities;
export type { GetModelCapabilitiesInput, ModelCapabilities, ModelCapabilitiesDiagnostics, ModelCapabilitiesSnapshot, ModelCapabilitiesSnapshotEntry, } from "@omop/model-core";
