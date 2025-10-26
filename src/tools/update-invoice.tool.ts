import { updateQuickbooksInvoice } from "../handlers/update-quickbooks-invoice.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_invoice";
const toolTitle = "Update Invoice";
const toolDescription =
    "Update an existing invoice in Quickbooks by ID (sparse update).";

const inputSchema = {
    invoice_id: z.string().min(1).describe("The ID of the invoice to update"),
    patch: z.record(z.any()).describe("Object containing fields to update"),
};

const outputSchema = {
    success: z
        .boolean()
        .describe("Whether the invoice was updated successfully"),
    invoice: z.any().optional().describe("The updated invoice object"),
    error: z.string().optional().describe("Error message if update failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await updateQuickbooksInvoice(params);

    if (response.isError) {
        const output = {
            success: false,
            error: response.error || "Unknown error occurred",
        };
        return {
            content: [
                {
                    type: "text" as const,
                    text: JSON.stringify(output, null, 2),
                },
            ],
            structuredContent: output,
            isError: true,
        };
    }

    const output = {
        success: true,
        invoice: response.result,
    };
    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const UpdateInvoiceTool: ToolDefinition<
    typeof inputSchema,
    typeof outputSchema
> = {
    name: toolName,
    title: toolTitle,
    description: toolDescription,
    inputSchema: inputSchema,
    outputSchema: outputSchema,
    handler: toolHandler,
};
