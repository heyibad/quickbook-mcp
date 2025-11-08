import { getQuickbooksBill } from "../handlers/get-quickbooks-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get-bill";
const toolTitle = "Get Bill";
const toolDescription = `Retrieve detailed information about a specific bill from QuickBooks Online using its unique ID.

**Why use this tool:**
- Get complete bill details including line items, amounts, and due dates
- Verify bill existence before making payments
- Retrieve current sync token for update operations
- Access vendor information and payment status
- Review bill line items and expense allocations

**When to use:**
- Before processing a bill payment
- When displaying bill details in your application
- To verify bill information before updates
- When updating bill records (need current SyncToken)
- Checking bill payment status and due dates

**Parameters:**
- id (required): The unique QuickBooks ID of the bill (e.g., "126", "145")

**Example usage:**
1. Get bill with ID "126":
   { "id": "126" }

2. Retrieve bill for payment processing:
   { "id": "145" }

3. Get bill details for review:
   { "id": "89" }

**Returns:**
- Bill object with fields: Id, VendorRef, Line (line items), TxnDate, DueDate, TotalAmt, Balance, SyncToken, etc.`;
const inputSchema = {
    id: z.string(),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
    const response = await getQuickbooksBill(args.id);

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
        data: response.result,
    };

    return {
        content: [
            {
                type: "text" as const,
                text: JSON.stringify(output, null, 2),
            },
        ],
        structuredContent: output,
    };
};

export const GetBillTool: ToolDefinition<
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
