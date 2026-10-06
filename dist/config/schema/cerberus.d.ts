import { z } from "zod";
export declare const CerberusTasksConfigSchema: z.ZodObject<{
    storage_path: z.ZodOptional<z.ZodString>;
    task_list_id: z.ZodOptional<z.ZodString>;
    claude_code_compat: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const CerberusConfigSchema: z.ZodObject<{
    tasks: z.ZodOptional<z.ZodObject<{
        storage_path: z.ZodOptional<z.ZodString>;
        task_list_id: z.ZodOptional<z.ZodString>;
        claude_code_compat: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CerberusTasksConfig = z.infer<typeof CerberusTasksConfigSchema>;
export type CerberusConfig = z.infer<typeof CerberusConfigSchema>;
