import { updateQuickbooksEstimate } from "../handlers/update-quickbooks-estimate.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_estimate";
const toolTitle = "Update Estimate";
const toolDescription = `Update an existing sales estimate in QuickBooks Online to modify line items, amounts, dates, or status. Requires the current SyncToken and complete estimate object.

**Why use this tool:**
- Update estimate amounts or line items
- Change estimate dates or expiration
- Update estimate status (mark as Accepted/Rejected)
- Add or remove line items from quotes
- Modify customer messages or notes
- Correct estimate errors before conversion

**When to use:**
- Revising quote amounts for customers
- Updating line items after negotiations
- Marking estimates as Accepted or Rejected
- Extending expiration dates
- Correcting estimate entry errors
- Adding items to existing quotes

**Required Parameters:**
- estimate: Complete estimate object including:
  - Id: The QuickBooks ID of the estimate
  - SyncToken: Current version token (get from get_estimate)
  - sparse: true (for partial updates)
  - All fields you want to update

**Updatable Fields:**
- Line: Array of line items (add, modify, or remove)
- TxnDate: Transaction date
- ExpirationDate: Quote expiration
- TxnStatus: Accepted, Pending, Rejected, Closed
- CustomerMemo: Message to customer
- PrivateNote: Internal notes
- BillEmail: Customer email

**Important:**
- Always get current SyncToken before updating
- Cannot change CustomerRef after creation
- Include complete Line array (existing items you want to keep plus new ones)
- Use sparse=true for partial updates

**Example usage:**
1. Update estimate status:
   {
     "estimate": {
       "Id": "145",
       "SyncToken": "2",
       "sparse": true,
       "TxnStatus": "Accepted"
     }
   }

2. Update expiration date:
   {
     "estimate": {
       "Id": "145",
       "SyncToken": "2",
       "sparse": true,
       "ExpirationDate": "2024-03-31"
     }
   }

3. Update line items and amount:
   {
     "estimate": {
       "Id": "145",
       "SyncToken": "2",
       "sparse": true,
       "Line": [
         {
           "Id": "1",
           "DetailType": "SalesItemLineDetail",
           "Amount": 600.00,
           "SalesItemLineDetail": {
             "ItemRef": { "value": "10" },
             "Qty": 12,
             "UnitPrice": 50.00
           }
         }
       ]
     }
   }

4. Update customer memo:
   {
     "estimate": {
       "Id": "145",
       "SyncToken": "2",
       "sparse": true,
       "CustomerMemo": { "value": "Updated pricing - expires in 30 days" }
     }
   }

**Returns:**
- Updated Estimate object
- New SyncToken for subsequent updates
- All estimate details with changes applied
- MetaData with LastUpdatedTime`;
const inputSchema = {
  estimate: z
    .object({
      Id: z.string().describe("Estimate ID (required)"),
      SyncToken: z.string().describe("Current SyncToken (required) - get from get_estimate"),
      sparse: z.boolean().optional().describe("Set to true for partial updates"),
      Line: z.array(z.object({
        Id: z.string().optional().describe("Line ID for existing lines"),
        DetailType: z.string().describe("Line detail type (e.g., SalesItemLineDetail)"),
        Amount: z.number().optional().describe("Line total amount"),
        Description: z.string().optional().describe("Line description"),
        SalesItemLineDetail: z.object({
          ItemRef: z.object({
            value: z.string().describe("QuickBooks item ID")
          }).describe("Item reference"),
          Qty: z.number().optional().describe("Quantity"),
          UnitPrice: z.number().optional().describe("Price per unit")
        }).optional()
      })).optional().describe("Line items array - include all lines you want to keep"),
      TxnDate: z.string().optional().describe("Transaction date (YYYY-MM-DD)"),
      ExpirationDate: z.string().optional().describe("Quote expiration date (YYYY-MM-DD)"),
      TxnStatus: z.enum(["Pending", "Accepted", "Closed", "Rejected"]).optional().describe("Estimate status"),
      CustomerMemo: z.object({ value: z.string() }).optional().describe("Message to customer"),
    })
    .passthrough()
    .describe("Estimate update object: include Id and SyncToken and fields to update."),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await updateQuickbooksEstimate(params.estimate);
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
            { type: "text" as const, text: `Estimate updated:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const UpdateEstimateTool: ToolDefinition<
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
