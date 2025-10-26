import { readQuickbooksInvoice } from "../handlers/read-quickbooks-invoice.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "read_invoice";
const toolTitle = "Read Invoice";
const toolDescription =
    "Read a single invoice from QuickBooks Online by its ID.";

const inputSchema = {
    invoice_id: z.string().min(1).describe("The ID of the invoice to read"),
};

const outputSchema = {
    success: z
        .boolean()
        .describe("Whether the invoice was retrieved successfully"),
    invoice: z.any().optional().describe("The invoice object"),
    error: z.string().optional().describe("Error message if retrieval failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const { invoice_id } = params;
    const response = await readQuickbooksInvoice(invoice_id);

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

export const ReadInvoiceTool: ToolDefinition<
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
