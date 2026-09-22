import { setCerberusRuleDeprecationLogger } from "@omop/rules-engine";
import { log } from "../../shared/logger";

setCerberusRuleDeprecationLogger(log);

export { findRuleFiles } from "@omop/rules-engine";
export type { FindRuleFilesOptions } from "@omop/rules-engine";
