import { getQuickbooksEstimate } from "../handlers/get-quickbooks-estimate.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_estimate";
const toolTitle = "Get Estimate";
const toolDescription = `Retrieve a specific sales estimate by ID from QuickBooks Online. Returns complete estimate details including customer, line items, amounts, and status.

**Why use this tool:**
- View estimate details for customer quotes
- Check estimate status (Accepted, Pending, Rejected, Closed)
- Review line items and pricing before invoicing
- Verify estimate amounts and expiration dates
- Display estimate information in applications
- Retrieve estimate for conversion to invoice

**When to use:**
- Displaying estimate details to users
- Before converting estimate to invoice
- Checking estimate acceptance status
- Reviewing quote details with customers
- Verifying estimate line items
- Preparing estimate reports

**Required Parameters:**
- id: The QuickBooks ID of the estimate to retrieve

**Example usage:**
1. Get estimate by ID:
   { "id": "145" }

2. Retrieve estimate for review:
   { "id": "234" }

3. Get estimate before invoicing:
   { "id": "567" }

**Returns:**
- Complete Estimate object
- Customer reference and details
- Line items with descriptions, quantities, prices
- TotalAmt: Total estimate amount
- TxnDate: Estimate creation date
- ExpirationDate: Quote expiration date
- TxnStatus: Accepted, Pending, Rejected, or Closed
- DocNumber: Estimate number
- PrivateNote and CustomerMemo
- EmailStatus: Email delivery tracking
- MetaData with creation and update timestamps
- SyncToken for future updates
- LinkedTxn: References to invoices created from estimate`;
const inputSchema = {
    id: z.string().describe("The ID of the estimate to retrieve"),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await getQuickbooksEstimate(params.id);

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

export const GetEstimateTool: ToolDefinition<
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
