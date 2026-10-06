import { z } from "zod";
import type { TmuxConfig, TmuxIsolation, TmuxLayout } from "@omop/tmux-core";
export declare const TmuxLayoutSchema: z.ZodEnum<{
    "main-horizontal": "main-horizontal";
    "main-vertical": "main-vertical";
    tiled: "tiled";
    "even-horizontal": "even-horizontal";
    "even-vertical": "even-vertical";
}>;
export declare const TmuxIsolationSchema: z.ZodEnum<{
    session: "session";
    window: "window";
    inline: "inline";
}>;
export declare const TmuxConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    layout: z.ZodDefault<z.ZodEnum<{
        "main-horizontal": "main-horizontal";
        "main-vertical": "main-vertical";
        tiled: "tiled";
        "even-horizontal": "even-horizontal";
        "even-vertical": "even-vertical";
    }>>;
    main_pane_size: z.ZodDefault<z.ZodNumber>;
    main_pane_min_width: z.ZodDefault<z.ZodNumber>;
    agent_pane_min_width: z.ZodDefault<z.ZodNumber>;
    isolation: z.ZodDefault<z.ZodEnum<{
        session: "session";
        window: "window";
        inline: "inline";
    }>>;
}, z.core.$strip>;
export type { TmuxConfig, TmuxIsolation, TmuxLayout };
