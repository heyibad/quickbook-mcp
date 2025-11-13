import { updateQuickbooksBill } from "../handlers/update-quickbooks-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update-bill";
const toolTitle = "Update Bill";
const toolDescription = `Update an existing bill in QuickBooks Online including line items, amounts, dates, and vendor information.

**Why use this tool:**
- Modify bill amounts or line items when corrections are needed
- Update due dates or transaction dates
- Change vendor or account allocations
- Correct errors in bill entry
- Add or modify private notes

**When to use:**
- Bill amount or details were entered incorrectly
- Vendor sends a corrected invoice
- Need to change due dates or payment terms
- Adding or modifying line items
- Correcting account allocations

**Important:**
- You MUST include the bill's current SyncToken (get it first using get-bill)
- Include the Id field to identify which bill to update
- Include all line items even if only changing one

**Parameters:**
- bill (required): Bill object with:
  - Id (required): Bill's QuickBooks ID
  - SyncToken (required): Current sync token
  - VendorRef: { value: "vendor_id" }
  - Line: Array of line items
  - TxnDate, DueDate, PrivateNote, etc.

**Example usage:**
1. Update bill amount:
   {
     "bill": {
       "Id": "126",
       "SyncToken": "0",
       "VendorRef": { "value": "56" },
       "Line": [
         {
           "Id": "1",
           "Amount": 750.00,
           "DetailType": "AccountBasedExpenseLineDetail",
           "AccountBasedExpenseLineDetail": {
             "AccountRef": { "value": "7" }
           }
         }
       ]
     }
   }

2. Update due date:
   {
     "bill": {
       "Id": "145",
       "SyncToken": "1",
       "DueDate": "2024-03-15"
     }
   }

**Returns:**
- Updated bill object with new SyncToken`;
const inputSchema = {
    bill: z.object({
        Id: z.string().describe("Bill ID (required)"),
        SyncToken: z.string().describe("Current SyncToken (required) - get from get-bill"),
        Line: z.array(
            z.object({
                Amount: z.number(),
                DetailType: z.string(),
                Description: z.string().optional(),
                AccountRef: z.object({
                    value: z.string(),
                    name: z.string().optional(),
                }),
            })
        ),
        VendorRef: z
            .object({
                value: z.string(),
                name: z.string().optional(),
            })
            .optional(),
        DueDate: z.string().optional(),
        Balance: z.number().optional(),
        TotalAmt: z.number().optional(),
    }),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
    const response = await updateQuickbooksBill(args.bill);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error updating bill: ${response.error}`,
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
            },
        ],
    };
};

export const UpdateBillTool: ToolDefinition<
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
