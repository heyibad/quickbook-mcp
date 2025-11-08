import { deleteQuickbooksBill } from "../handlers/delete-quickbooks-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "delete-bill";
const toolTitle = "Delete Bill";
const toolDescription = `Delete a bill from QuickBooks Online. Use with caution as this removes the bill record.

**Why use this tool:**
- Remove bills entered in error
- Clean up duplicate bill entries
- Delete test bills
- Remove bills that were entered incorrectly

**When to use:**
- Bill was created by mistake
- Duplicate bill entry needs to be removed
- Test or demo bills need cleanup
- Bill is no longer valid or relevant

**Important notes:**
- Cannot delete bills that have been paid
- Cannot delete bills with linked transactions
- Requires bill Id and SyncToken
- This action cannot be undone
- Consider voiding instead of deleting for audit trails

**Parameters:**
- bill (required): Bill object with:
  - Id (required): Bill's QuickBooks ID
  - SyncToken (required): Current sync token

**Example usage:**
1. Delete bill with ID and SyncToken:
   {
     "bill": {
       "Id": "126",
       "SyncToken": "0"
     }
   }

2. Delete bill after retrieving details:
   // First get bill: get-bill with id="145"
   // Then delete with returned object
   {
     "bill": {
       "Id": "145",
       "SyncToken": "1"
     }
   }

**Returns:**
- Success status and deleted bill information`;
const inputSchema = {
  bill: z.object({
    Id: z.string(),
    SyncToken: z.string(),
  }),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
  const response = await deleteQuickbooksBill(args.bill);

  if (response.isError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error deleting bill: ${response.error}`,
        },
      ],
    };
  }

  const bill = response.result;

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(bill),
      }
    ],
  };
};

export const DeleteBillTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 