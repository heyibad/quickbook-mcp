import { z } from "zod";

/**
 * Tool definition interface for the new MCP SDK pattern.
 * Uses inputSchema and outputSchema with Zod objects for validation.
 */
export interface ToolDefinition<
    TInput extends z.ZodRawShape,
    TOutput extends z.ZodRawShape = z.ZodRawShape,
> {
    name: string;
    title: string;
    description: string;
    inputSchema: TInput;
    outputSchema?: TOutput;
    handler: (params: z.infer<z.ZodObject<TInput>>) => Promise<{
        content: Array<{ type: "text"; text: string }>;
        structuredContent?: z.infer<z.ZodObject<TOutput>>;
        isError?: boolean;
    }>;
}
