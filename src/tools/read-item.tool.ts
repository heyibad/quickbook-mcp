import { readQuickbooksItem } from "../handlers/read-quickbooks-item.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "read_item";
const toolTitle = "Read Item";
const toolDescription = `Retrieve a specific product or service item by its ID from QuickBooks Online. Returns complete item details including pricing, description, and account references.

**Why use this tool:**
- View item details and pricing
- Get item information for invoice/estimate creation
- Verify item configuration
- Check inventory quantities
- Display item details in applications
- Review item account assignments

**When to use:**
- Displaying item information in your application
- Before adding item to invoice or estimate
- Checking current item pricing
- Verifying inventory levels
- Reviewing item account setup
- Getting item details for reports

**Required Parameters:**
- item_id: The QuickBooks ID of the item to retrieve

**Example usage:**
1. Get item by ID:
   { "item_id": "25" }

2. Retrieve inventory item details:
   { "item_id": "42" }

3. Get service item pricing:
   { "item_id": "89" }

**Returns:**
- Complete Item object
- Item details: Name, Description, Type
- Pricing: UnitPrice, PurchaseCost
- Account references: IncomeAccountRef, ExpenseAccountRef, AssetAccountRef
- Inventory: QtyOnHand, InvStartDate (for Inventory items)
- Active status
- MetaData with creation and update timestamps
- SyncToken for future updates
- Taxable status and tax code references`;

const inputSchema = {
    item_id: z.string().min(1, { message: "Item ID is required" }),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const { item_id } = params;
    const response = await readQuickbooksItem(item_id);

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

    return {
        content: [
            { type: "text" as const, text: `Item details for ID ${item_id}:` },
            {
                type: "text" as const,
                text: JSON.stringify(response.result, null, 2),
            },
        ],
    };
};

export const ReadItemTool: ToolDefinition<
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
