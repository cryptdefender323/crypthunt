import { z } from "zod";
export declare const KeywordTypeSchema: z.ZodEnum<{
    fullscan: "fullscan";
    hyperplan: "hyperplan";
    "red-team": "red-team";
    team: "team";
    "hyperplan-fullscan": "hyperplan-fullscan";
}>;
export type KeywordType = z.infer<typeof KeywordTypeSchema>;
export declare const KeywordDetectorConfigSchema: z.ZodObject<{
    enabled_expansions: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        fullscan: "fullscan";
        hyperplan: "hyperplan";
        "red-team": "red-team";
        team: "team";
        "hyperplan-fullscan": "hyperplan-fullscan";
    }>>>;
    disabled_keywords: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        fullscan: "fullscan";
        hyperplan: "hyperplan";
        "red-team": "red-team";
        team: "team";
        "hyperplan-fullscan": "hyperplan-fullscan";
    }>>>;
}, z.core.$strip>;
export type KeywordDetectorConfig = z.infer<typeof KeywordDetectorConfigSchema>;
