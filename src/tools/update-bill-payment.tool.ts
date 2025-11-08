import { updateQuickbooksBillPayment } from "../handlers/update-quickbooks-bill-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "update_bill_payment";
const toolTitle = "Update Bill Payment";
const toolDescription = `Update an existing bill payment in QuickBooks Online to modify payment details, amounts, or linked bills. Requires the current SyncToken for concurrency control.

**Why use this tool:**
- Correct payment amounts or dates
- Update check numbers
- Change payment methods
- Add or remove linked bills
- Update payment notes
- Fix payment entry errors

**When to use:**
- Correcting payment amounts after entry
- Updating check numbers for tracking
- Modifying payment dates
- Changing which bills are paid
- Adding notes to existing payments
- Fixing payment errors before reconciliation

**Required Parameters:**
- Id: The QuickBooks ID of the payment to update
- SyncToken: Current version token (get from get_bill_payment)
- sparse: Set to true for partial updates

**Updatable Fields:**
- TxnDate: Payment transaction date
- PrivateNote: Internal payment notes
- CheckNum: Check number for check payments
- Line: Array of linked bills and amounts
- TotalAmt: Total payment amount (must match Line totals)

**Important:**
- Always get current SyncToken before updating
- TotalAmt must equal sum of all Line amounts
- Cannot change VendorRef or PayType after creation
- Use sparse=true to update specific fields only

**Example usage:**
1. Update check number:
   {
     "Id": "234",
     "SyncToken": "2",
     "sparse": true,
     "CheckNum": "1005"
   }

2. Update payment date:
   {
     "Id": "234",
     "SyncToken": "2",
     "sparse": true,
     "TxnDate": "2024-01-20"
   }

3. Update payment amount and linked bills:
   {
     "Id": "234",
     "SyncToken": "2",
     "sparse": true,
     "TotalAmt": 750.00,
     "Line": [
       {
         "Amount": 750.00,
         "LinkedTxn": [{ "TxnId": "145", "TxnType": "Bill" }]
       }
     ]
   }

4. Add note to payment:
   {
     "Id": "234",
     "SyncToken": "2",
     "sparse": true,
     "PrivateNote": "Payment approved by manager"
   }

**Returns:**
- Updated BillPayment object
- New SyncToken for subsequent updates
- All payment details with changes applied
- MetaData with LastUpdatedTime`;

// Define the expected input schema for updating a bill payment
const inputSchema = {
    billPayment: z.any(),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

// Define the tool handler
const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await updateQuickbooksBillPayment(params.billPayment);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error updating bill payment: ${response.error}`,
                },
            ],
        };
    }

    return {
        content: [
            { type: "text" as const, text: `Bill payment updated:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const UpdateBillPaymentTool: ToolDefinition<
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
