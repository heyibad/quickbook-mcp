import { deleteQuickbooksCustomer } from "../handlers/delete-quickbooks-customer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "delete_customer";
const toolTitle = "Delete Customer";
const toolDescription = `Mark a customer as inactive in QuickBooks Online. Note: QuickBooks doesn't permanently delete customers but makes them inactive to preserve transaction history.

**Why use this tool:**
- Remove customers you no longer do business with from active lists
- Clean up duplicate or test customer records
- Maintain data integrity while preserving transaction history
- Keep customer lists organized and current

**When to use:**
- Customer is no longer active or has closed their account
- Need to remove duplicate customer entries
- Cleaning up test or demo customer data
- Customer requested removal from your system

**Important notes:**
- Customers are marked as "inactive" not permanently deleted
- Cannot delete customers with active transactions in some cases
- Requires customer Id and SyncToken
- Transaction history is preserved for reporting

**Parameters:**
- idOrEntity (required): Either:
  1. Customer ID string (e.g., "58")
  2. Customer object with Id and SyncToken fields

**Example usage:**
1. Delete by ID (will fetch SyncToken automatically):
   {
     "idOrEntity": "58"
   }

2. Delete with full customer object:
   {
     "idOrEntity": {
       "Id": "142",
       "SyncToken": "0"
     }
   }

3. Delete customer after retrieving details:
   // First get customer: get_customer with id="75"
   // Then delete with returned object
   {
     "idOrEntity": {
       "Id": "75",
       "SyncToken": "2"
     }
   }

**Returns:**
- Success status and the inactivated customer object`;

const inputSchema = {
    idOrEntity: z
        .any()
        .describe("Customer ID (string) or customer entity object to delete"),
};

const outputSchema = {
    success: z
        .boolean()
        .describe("Whether the customer was deleted successfully"),
    customer: z.any().optional().describe("The deleted customer object"),
    error: z.string().optional().describe("Error message if deletion failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await deleteQuickbooksCustomer(params.idOrEntity);

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
        customer: response.result,
    };
    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const DeleteCustomerTool: ToolDefinition<
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
