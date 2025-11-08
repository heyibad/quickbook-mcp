import { getQuickbooksCustomer } from "../handlers/get-quickbooks-customer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_customer";
const toolTitle = "Get Customer";
const toolDescription = `Retrieve detailed information about a specific customer from QuickBooks Online using their unique ID.

**Why use this tool:**
- Get complete customer details including contact information, billing address, payment terms, and balance
- Verify customer existence before creating invoices or transactions
- Retrieve current sync token for update operations
- Access customer metadata like creation date and last modified time

**When to use:**
- Before creating an invoice or estimate for a customer
- When you need to display customer details in your application
- To verify customer information before processing transactions
- When updating customer records (need current SyncToken)

**Parameters:**
- id (required): The unique QuickBooks ID of the customer (e.g., "58", "123")

**Example usage:**
1. Get customer with ID "58":
   { "id": "58" }

2. Retrieve customer for invoice creation:
   { "id": "142" }

**Returns:**
- Customer object with fields: Id, DisplayName, GivenName, FamilyName, CompanyName, PrimaryEmailAddr, PrimaryPhone, BillAddr, Balance, SyncToken, etc.`;

const inputSchema = {
    id: z.string().describe("The ID of the customer to retrieve"),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    customer: z.any().optional().describe("The customer object"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await getQuickbooksCustomer(params.id);

    if (response.isError) {
        const output = {
            success: false,
            error: response.error || "Unknown error",
        };
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error getting customer: ${response.error}`,
                },
            ],
            structuredContent: output,
        };
    }

    const output = {
        success: true,
        customer: response.result,
    };
    return {
        content: [
            {
                type: "text" as const,
                text: `Customer retrieved successfully: ${JSON.stringify(response.result, null, 2)}`,
            },
        ],
        structuredContent: output,
    };
};

export const GetCustomerTool: ToolDefinition<
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
