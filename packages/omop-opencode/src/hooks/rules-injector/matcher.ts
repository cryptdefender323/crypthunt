export {
  createContentHash,
  getMatcherCacheStats,
  isDuplicateByContentHash,
  isDuplicateByRealPath,
  resetMatcherCache,
  shouldApplyRule,
} from "@omop/rules-engine";
export type { MatchResult } from "@omop/rules-engine";

export interface MatcherCacheStats {
  readonly entries: number;
}
