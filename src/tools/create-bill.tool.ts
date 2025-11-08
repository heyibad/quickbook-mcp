import { createQuickbooksBill } from "../handlers/create-quickbooks-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create-bill";
const toolTitle = "Create Bill";
const toolDescription = `Create a bill (accounts payable) in QuickBooks Online to record money you owe to vendors for goods or services received.

**Why use this tool:**
- Record expenses and amounts owed to vendors
- Track accounts payable and vendor balances
- Create bills that will be paid later
- Properly categorize business expenses
- Maintain accurate financial records for accounting

**When to use:**
- Recording vendor invoices received
- Entering expenses that will be paid later
- Tracking purchases on credit terms
- Recording services received from contractors
- Importing bills from vendor systems

**Parameters:**
- bill (required): Bill object with:
  - VendorRef (required): { value: "vendor_id" }
  - Line (required): Array of line items, each with:
    - Amount: Line item amount
    - DetailType: "AccountBasedExpenseLineDetail"
    - AccountBasedExpenseLineDetail: { AccountRef: { value: "account_id" } }
  - TxnDate (optional): Bill date in YYYY-MM-DD format
  - DueDate (optional): Payment due date
  - PrivateNote (optional): Internal memo
  - DocNumber (optional): Bill number

**Example usage:**
1. Create simple bill:
   {
     "bill": {
       "VendorRef": { "value": "56" },
       "Line": [
         {
           "Amount": 500.00,
           "DetailType": "AccountBasedExpenseLineDetail",
           "AccountBasedExpenseLineDetail": {
             "AccountRef": { "value": "7" }
           }
         }
       ],
       "TxnDate": "2024-01-15"
     }
   }

2. Create bill with multiple line items:
   {
     "bill": {
       "VendorRef": { "value": "89" },
       "Line": [
         {
           "Amount": 1000.00,
           "Description": "Office Supplies",
           "DetailType": "AccountBasedExpenseLineDetail",
           "AccountBasedExpenseLineDetail": {
             "AccountRef": { "value": "25" }
           }
         },
         {
           "Amount": 250.00,
           "Description": "Shipping",
           "DetailType": "AccountBasedExpenseLineDetail",
           "AccountBasedExpenseLineDetail": {
             "AccountRef": { "value": "26" }
           }
         }
       ],
       "TxnDate": "2024-01-20",
       "DueDate": "2024-02-20",
       "DocNumber": "INV-12345"
     }
   }

**Returns:**
- Created bill object with QuickBooks-assigned Id, total balance, and SyncToken`;
const inputSchema = {
  bill: z.object({
    Line: z.array(z.object({
      Amount: z.number(),
      DetailType: z.string(),
      Description: z.string(),
      AccountRef: z.object({
        value: z.string(),
        name: z.string().optional(),
      }),
    })),
    VendorRef: z.object({
      value: z.string(),
      name: z.string().optional(),
    }),
    DueDate: z.string(),
    Balance: z.number(),
    TotalAmt: z.number(),
  }),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
  const response = await createQuickbooksBill(args.bill);

  if (response.isError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error creating bill: ${response.error}`,
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

export const CreateBillTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 