import { updateQuickbooksPurchase } from "../handlers/update-quickbooks-purchase.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "update_purchase";
const toolTitle = "Update Purchase";
const toolDescription = `Update an existing purchase transaction in QuickBooks Online to modify amounts, dates, expense categories, or payment details. Requires the current SyncToken.

**Why use this tool:**
- Correct purchase amounts or dates
- Update expense categorization
- Change check numbers
- Modify purchase descriptions
- Add or update vendor information
- Fix purchase entry errors

**When to use:**
- Correcting purchase amounts after entry
- Updating expense account assignments
- Changing transaction dates
- Modifying check or reference numbers
- Updating line item descriptions
- Fixing categorization errors

**Required Parameters:**
- Id: The QuickBooks ID of the purchase to update
- SyncToken: Current version token (get from get_purchase)
- sparse: Set to true for partial updates

**Updatable Fields:**
- TxnDate: Transaction date
- DocNumber: Check or reference number
- PrivateNote: Internal notes
- EntityRef: Vendor or customer reference
- Line: Array of expense line items
- TotalAmt: Must match sum of line amounts

**Important:**
- Always get current SyncToken before updating
- Cannot change AccountRef (payment account) after creation
- Cannot change PaymentType after creation
- TotalAmt must equal sum of all line amounts
- Use sparse=true to update specific fields only

**Example usage:**
1. Update check number:
   {
     "Id": "256",
     "SyncToken": "2",
     "sparse": true,
     "DocNumber": "1055"
   }

2. Update transaction date:
   {
     "Id": "256",
     "SyncToken": "2",
     "sparse": true,
     "TxnDate": "2024-01-20"
   }

3. Update expense categorization:
   {
     "Id": "256",
     "SyncToken": "2",
     "sparse": true,
     "Line": [
       {
         "Id": "1",
         "DetailType": "AccountBasedExpenseLineDetail",
         "Amount": 250.00,
         "Description": "Office supplies - updated",
         "AccountBasedExpenseLineDetail": {
           "AccountRef": { "value": "8" }
         }
       }
     ]
   }

4. Update private note:
   {
     "Id": "256",
     "SyncToken": "2",
     "sparse": true,
     "PrivateNote": "Expense approved by manager"
   }

5. Update multiple fields:
   {
     "Id": "256",
     "SyncToken": "2",
     "sparse": true,
     "TxnDate": "2024-01-18",
     "DocNumber": "1056",
     "PrivateNote": "Corrected date and check number"
   }

**Returns:**
- Updated Purchase object
- New SyncToken for subsequent updates
- All purchase details with changes applied
- MetaData with LastUpdatedTime`;

// Define the expected input schema for updating a purchase
const inputSchema = {
  purchase: z.any(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await updateQuickbooksPurchase(params.purchase);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error updating purchase: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Purchase updated:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const UpdatePurchaseTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 