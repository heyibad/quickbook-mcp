import { getQuickbooksPurchase } from "../handlers/get-quickbooks-purchase.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "get_purchase";
const toolTitle = "Get Purchase";
const toolDescription = `Retrieve a specific purchase transaction by ID from QuickBooks Online. Returns complete purchase details including payment account, type, vendor, and expense line items.

**Why use this tool:**
- View purchase transaction details
- Verify expense categorization
- Check payment amounts and dates
- Review vendor payment information
- Get check or reference numbers
- Display purchase details in applications

**When to use:**
- Displaying purchase information to users
- Verifying purchase before updating
- Reviewing expense details
- Checking payment method and account
- Reconciling bank or credit card transactions
- Generating expense reports

**Required Parameters:**
- Id: The QuickBooks ID of the purchase to retrieve

**Example usage:**
1. Get purchase by ID:
   { "Id": "256" }

2. Retrieve check purchase:
   { "Id": "345" }

3. Get credit card purchase:
   { "Id": "678" }

**Returns:**
- Complete Purchase object
- AccountRef: Payment account used
- PaymentType: Cash, Check, or CreditCard
- TxnDate: Transaction date
- TotalAmt: Total purchase amount
- EntityRef: Vendor or customer information
- DocNumber: Check or reference number
- Line items with expense details:
  - Amount for each line
  - Description
  - AccountRef for expense categorization
- PrivateNote: Internal notes
- MetaData with creation and update timestamps
- SyncToken for future updates
- CurrencyRef for multi-currency transactions`;

// Define the expected input schema for getting a purchase
const inputSchema = {
    id: z.string(),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

// Define the tool handler
const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await getQuickbooksPurchase(params.id);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error getting purchase: ${response.error}`,
                },
            ],
        };
    }

    return {
        content: [
            { type: "text" as const, text: `Purchase retrieved:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const GetPurchaseTool: ToolDefinition<
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
