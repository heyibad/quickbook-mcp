import { deleteQuickbooksEstimate } from "../handlers/delete-quickbooks-estimate.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "delete_estimate";
const toolTitle = "Delete Estimate";
const toolDescription = `Delete (void) a sales estimate from QuickBooks Online. This removes the estimate but maintains record in audit trail. Requires ID and SyncToken.

**Why use this tool:**
- Remove estimates entered in error
- Void declined or expired quotes
- Clean up old estimates
- Delete duplicate estimate entries
- Remove estimates created for testing
- Void estimates never sent to customer

**When to use:**
- Estimate was created in error
- Customer declined and won't be using quote
- Estimate is expired and no longer valid
- Cleaning up old or unused estimates
- Need to remove duplicate entries
- Estimate was for testing purposes

**Required Parameters:**
- idOrEntity: Either:
  - String: Just the estimate ID (requires separate SyncToken parameter)
  - Object: Complete estimate object with Id and SyncToken

**Important:**
- Cannot delete estimates already converted to invoices
- Always get current SyncToken before deleting
- Deletion is permanent but appears in audit trail
- Consider marking as "Closed" instead if want to keep record

**Example usage:**
1. Delete by ID and SyncToken:
   {
     "idOrEntity": "145",
     "syncToken": "3"
   }

2. Delete using estimate object:
   {
     "idOrEntity": {
       "Id": "145",
       "SyncToken": "3"
     }
   }

3. Delete old estimate:
   {
     "idOrEntity": "234",
     "syncToken": "1"
   }

**Returns:**
- Deleted Estimate object with status "Deleted"
- Confirmation of deletion
- Original estimate details for reference

**Alternative Approach:**
Instead of deleting, consider updating TxnStatus:
- Set TxnStatus to "Closed" to keep estimate but mark inactive
- Set TxnStatus to "Rejected" if customer declined
- This maintains better audit trail than deletion`;
const inputSchema = {
    idOrEntity: z
        .any()
        .describe("Estimate ID (string) or estimate entity object to delete"),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await deleteQuickbooksEstimate(params.idOrEntity);
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
            { type: "text" as const, text: `Estimate deleted:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const DeleteEstimateTool: ToolDefinition<
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
