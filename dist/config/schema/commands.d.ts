import { z } from "zod";
export declare const BuiltinCommandNameSchema: z.ZodEnum<{
    "remove-ai-slops": "remove-ai-slops";
    "pentest-loop": "pentest-loop";
    "ulw-loop": "ulw-loop";
    "cancel-pentest-loop": "cancel-pentest-loop";
    refactor: "refactor";
    "start-work": "start-work";
    "stop-continuation": "stop-continuation";
    hyperplan: "hyperplan";
}>;
export type BuiltinCommandName = z.infer<typeof BuiltinCommandNameSchema>;
