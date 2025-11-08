import { deleteQuickbooksPurchase } from "../handlers/delete-quickbooks-purchase.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "delete_purchase";
const toolTitle = "Delete Purchase";
const toolDescription = `Delete (void) a purchase transaction from QuickBooks Online. This removes the purchase but maintains record in audit trail. Requires ID and SyncToken.

**Why use this tool:**
- Remove purchases entered in error
- Void duplicate purchase entries
- Delete test transactions
- Remove purchases with wrong amounts
- Clean up incorrect expense entries
- Void stopped or cancelled checks

**When to use:**
- Purchase was entered in error
- Transaction is a duplicate
- Wrong account or amount was used
- Check was voided or stopped
- Purchase was for testing purposes
- Need to correct major entry errors

**Required Parameters:**
- Id: The QuickBooks ID of the purchase to delete
- SyncToken: Current version token (get from get_purchase)

**Important:**
- Cannot delete purchases after bank reconciliation (in some QB versions)
- Always get current SyncToken before deleting
- Deletion is permanent but appears in audit trail
- Consider creating reversing entry instead of deletion for better tracking

**Example usage:**
1. Delete purchase by ID:
   {
     "Id": "256",
     "SyncToken": "3"
   }

2. Void incorrect purchase:
   {
     "Id": "345",
     "SyncToken": "1"
   }

3. Remove duplicate entry:
   {
     "Id": "678",
     "SyncToken": "0"
   }

**Returns:**
- Deleted Purchase object with status "Deleted"
- Confirmation of deletion
- Original purchase details for reference

**Alternative Approach:**
Instead of deleting, consider creating a reversing purchase:
- Create new purchase with negative amounts
- Better audit trail than deletion
- Useful if original purchase was reconciled
- Maintains transaction history`;

// Define the expected input schema for deleting a purchase
const inputSchema = {
  idOrEntity: z.any(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await deleteQuickbooksPurchase(params.idOrEntity);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error deleting purchase: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Purchase deleted:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const DeletePurchaseTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 