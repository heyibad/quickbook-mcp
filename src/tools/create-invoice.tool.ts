import { createQuickbooksInvoice } from "../handlers/create-quickbooks-invoice.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_invoice";
const toolTitle = "Create Invoice";
const toolDescription = "Create an invoice in QuickBooks Online.";

const lineItemSchema = z.object({
    item_ref: z.string().min(1).describe("Item ID reference"),
    qty: z.number().positive().describe("Quantity of items"),
    unit_price: z.number().nonnegative().describe("Unit price per item"),
    description: z.string().optional().describe("Line item description"),
});

const inputSchema = {
    customer_ref: z.string().min(1).describe("Customer ID reference"),
    line_items: z.array(lineItemSchema).min(1).describe("Array of line items"),
    doc_number: z
        .string()
        .optional()
        .describe("Document number for the invoice"),
    txn_date: z
        .string()
        .optional()
        .describe("Transaction date (YYYY-MM-DD format)"),
};

const outputSchema = {
    success: z
        .boolean()
        .describe("Whether the invoice was created successfully"),
    invoice_id: z.string().optional().describe("The ID of the created invoice"),
    doc_number: z
        .string()
        .optional()
        .describe("The document number of the created invoice"),
    error: z.string().optional().describe("Error message if creation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await createQuickbooksInvoice(params);

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
        invoice_id: response.result?.Id,
        doc_number: response.result?.DocNumber,
    };

    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const CreateInvoiceTool: ToolDefinition<
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
