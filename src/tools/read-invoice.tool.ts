import { readQuickbooksInvoice } from "../handlers/read-quickbooks-invoice.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "read_invoice";
const toolTitle = "Read Invoice";
const toolDescription = `Retrieve complete details of a specific invoice from QuickBooks Online including line items, customer information, amounts, and payment status.

**Why use this tool:**
- Get full invoice details including all line items
- Check invoice payment status and balance due
- Retrieve invoice for customer review or resending
- Get current sync token before updating invoice
- Access invoice PDF link or email status
- Review invoice line items and tax calculations

**When to use:**
- Displaying invoice details to customers
- Before applying payments to an invoice
- When updating or modifying an existing invoice (need SyncToken)
- Generating invoice reports or statements
- Verifying invoice amounts and line items
- Checking if invoice has been emailed or printed

**Parameters:**
- id (required): The unique QuickBooks ID of the invoice (e.g., "130", "1052")

**Example usage:**
1. Read invoice by ID:
   { "id": "130" }

2. Get invoice before applying payment:
   { "id": "1052" }

3. Retrieve invoice for customer statement:
   { "id": "845" }

**Returns:**
- Complete invoice object including:
  - Id, DocNumber, TxnDate, DueDate
  - CustomerRef (customer details)
  - Line items (products/services sold)
  - TotalAmt (total invoice amount)
  - Balance (amount still owed)
  - EmailStatus, PrintStatus
  - SyncToken (for updates)
  - LinkedTxn (payments applied)`;

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
