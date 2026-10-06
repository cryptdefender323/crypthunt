import { z } from "zod";
export declare const TaskStatusSchema: z.ZodEnum<{
    deleted: "deleted";
    completed: "completed";
    pending: "pending";
    in_progress: "in_progress";
}>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    subject: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<{
        deleted: "deleted";
        completed: "completed";
        pending: "pending";
        in_progress: "in_progress";
    }>;
    activeForm: z.ZodOptional<z.ZodString>;
    blocks: z.ZodArray<z.ZodString>;
    blockedBy: z.ZodArray<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strict>;
export type Task = z.infer<typeof TaskSchema>;
