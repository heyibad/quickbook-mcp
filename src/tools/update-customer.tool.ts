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

**Important:** 
- You MUST include the customer's current SyncToken (get it first using get_customer)
- Include the Id field to identify which customer to update
- Only include fields you want to change (partial updates supported)

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
    customer: z.any().describe("Customer object with updated fields"),
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
