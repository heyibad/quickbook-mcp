import { getQuickbooksVendor } from "../handlers/get-quickbooks-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get-vendor";
const toolTitle = "Get Vendor";
const toolDescription = `Retrieve detailed information about a specific vendor from QuickBooks Online using their unique ID.

**Why use this tool:**
- Get complete vendor details including contact information, payment terms, and account balances
- Verify vendor existence before creating bills or expenses
- Retrieve current sync token for update operations
- Access vendor 1099 status and tax information
- Check vendor payment history and outstanding balances

**When to use:**
- Before creating a bill or expense for a vendor
- When displaying vendor details in your application
- To verify vendor information before processing payments
- When updating vendor records (need current SyncToken)
- Checking 1099 contractor status

**Parameters:**
- id (required): The unique QuickBooks ID of the vendor (e.g., "56", "142")

**Example usage:**
1. Get vendor with ID "56":
   { "id": "56" }

2. Retrieve vendor for bill creation:
   { "id": "89" }

3. Get 1099 contractor details:
   { "id": "123" }

**Returns:**
- Vendor object with fields: Id, DisplayName, GivenName, FamilyName, CompanyName, PrimaryEmailAddr, PrimaryPhone, BillAddr, Balance, Vendor1099, SyncToken, etc.`;
const inputSchema = {
    id: z.string(),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
    const response = await getQuickbooksVendor(args.id);

    if (response.isError) {
        const output = {
            success: false,
            error: response.error || "Unknown error",
        };
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error getting vendor: ${response.error}`,
                },
            ],
            structuredContent: output,
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
                text: `Vendor retrieved successfully: ${JSON.stringify(response.result, null, 2)}`,
            },
        ],
        structuredContent: output,
    };
};

export const GetVendorTool: ToolDefinition<
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
