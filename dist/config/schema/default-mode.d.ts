import { z } from "zod";
export declare const PENTEST_MODES: readonly ["auto", "ctf", "bug-bounty", "red-team", "blue-team", "offensive", "grey-hat", "forensic", "reverse-engineering", "mobile-pentest"];
export type EngagementMode = (typeof PENTEST_MODES)[number];
export declare const DefaultModeConfigSchema: z.ZodObject<{
    fullscan: z.ZodDefault<z.ZodBoolean>;
    pentest_loop: z.ZodDefault<z.ZodBoolean>;
    engagement_mode: z.ZodOptional<z.ZodEnum<{
        auto: "auto";
        ctf: "ctf";
        "bug-bounty": "bug-bounty";
        "red-team": "red-team";
        "blue-team": "blue-team";
        offensive: "offensive";
        "grey-hat": "grey-hat";
        forensic: "forensic";
        "reverse-engineering": "reverse-engineering";
        "mobile-pentest": "mobile-pentest";
    }>>;
}, z.core.$strip>;
export type DefaultModeConfig = z.infer<typeof DefaultModeConfigSchema>;
