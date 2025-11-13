import { updateQuickbooksCustomer } from "../handlers/update-quickbooks-customer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_customer";
const toolTitle = "Update Customer";
const toolDescription = `Update an existing customer's information in QuickBooks Online including contact details, billing address, and payment terms.

**Why use this tool:**
- Modify customer contact information when details change
- Update billing addresses for accurate invoicing
- Change payment terms or methods for customers
- Correct errors in customer records
- Keep customer information current and accurate

**When to use:**
- Customer changes their email, phone, or address
- Need to update payment terms or methods
- Correcting typos or errors in customer data
- Customer requests to update their information
- Before creating new transactions with updated customer details

**Important - READ CAREFULLY:** 
- **REQUIRED**: Customer's Id (string like "58" or "142")
- **REQUIRED**: Current SyncToken (string like "0", "1", "2") - Get this first using get_customer tool
- **Workflow**: Always call get_customer first to retrieve current data including SyncToken, then modify fields and call update
- **Partial updates**: You can update only specific fields without sending the entire customer object
- **SyncToken purpose**: Prevents concurrent modification conflicts - QuickBooks increments it on each update

**Parameters:**
- customer (required): Customer object with:
  - Id (required): Customer's QuickBooks ID
  - SyncToken (required): Current sync token from the customer record
  - Any fields to update: DisplayName, GivenName, FamilyName, CompanyName, PrimaryEmailAddr, PrimaryPhone, BillAddr, etc.

**Example usage:**
1. Update customer email:
   {
     "customer": {
       "Id": "58",
       "SyncToken": "0",
       "PrimaryEmailAddr": { "Address": "newemail@example.com" }
     }
   }

2. Update customer address and phone:
   {
     "customer": {
       "Id": "142",
       "SyncToken": "2",
       "PrimaryPhone": { "FreeFormNumber": "(555) 999-8888" },
       "BillAddr": {
         "Line1": "456 Oak Avenue",
         "City": "New York",
         "CountrySubDivisionCode": "NY",
         "PostalCode": "10001"
       }
     }
   }

3. Update company name and display name:
   {
     "customer": {
       "Id": "75",
       "SyncToken": "1",
       "DisplayName": "ABC Industries Inc",
       "CompanyName": "ABC Industries"
     }
   }

**Returns:**
- Updated customer object with new SyncToken`;

const inputSchema = {
    customer: z
        .object({
            Id: z.string().describe("QuickBooks customer ID (REQUIRED) - e.g., '58', '142'"),
            SyncToken: z.string().describe("Current sync token (REQUIRED) - Get from get_customer first"),
            DisplayName: z.string().optional().describe("Customer display name"),
            GivenName: z.string().optional().describe("First name"),
            FamilyName: z.string().optional().describe("Last name"),
            CompanyName: z.string().optional().describe("Company name"),
            PrimaryEmailAddr: z
                .object({
                    Address: z.string(),
                })
                .optional()
                .describe("Primary email"),
            PrimaryPhone: z
                .object({
                    FreeFormNumber: z.string(),
                })
                .optional()
                .describe("Primary phone"),
            BillAddr: z
                .object({
                    Line1: z.string().optional(),
                    City: z.string().optional(),
                    CountrySubDivisionCode: z.string().optional(),
                    PostalCode: z.string().optional(),
                })
                .optional()
                .describe("Billing address"),
            Notes: z.string().optional().describe("Customer notes"),
        })
        .passthrough()
        .describe("Customer object with Id, SyncToken (both required), and fields to update"),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    customer: z.any().optional().describe("The updated customer object"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await updateQuickbooksCustomer(params.customer);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error updating customer: ${response.error}`,
                    structured: {
                        success: false,
                        error: response.error || "Unknown error occurred",
                    },
                },
            ],
        };
    }

    return {
        content: [
            {
                type: "text" as const,
                text: `Customer updated successfully: ${JSON.stringify(response.result, null, 2)}`,
                structured: {
                    success: true,
                    customer: response.result,
                },
            },
        ],
    };
};

export const UpdateCustomerTool: ToolDefinition<
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
