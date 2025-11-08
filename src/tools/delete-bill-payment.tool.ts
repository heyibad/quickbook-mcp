import { deleteQuickbooksBillPayment } from "../handlers/delete-quickbooks-bill-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "delete_bill_payment";
const toolTitle = "Delete Bill Payment";
const toolDescription = `Delete (void) a bill payment from QuickBooks Online. This reverses the payment and restores the bill balance. Requires the current SyncToken for the payment.

**Why use this tool:**
- Void payments entered in error
- Reverse payments with wrong amounts
- Cancel payments for stopped checks
- Remove duplicate payment entries
- Undo payments before bank reconciliation
- Correct payment application errors

**When to use:**
- Payment was entered incorrectly
- Check was voided or stopped
- Payment was duplicate entry
- Need to reapply payment to different bills
- Payment failed to clear bank
- Correcting accounts payable errors

**Required Parameters:**
- Id: The QuickBooks ID of the payment to delete
- SyncToken: Current version token (get from get_bill_payment)

**Important:**
- Deletion voids the payment transaction
- Restores bill balance to original amount
- Cannot delete payments after bank reconciliation (in some QB versions)
- Always get current SyncToken before deleting
- Consider creating a reversing payment instead of deletion

**Example usage:**
1. Delete payment by ID:
   {
     "Id": "234",
     "SyncToken": "3"
   }

2. Void incorrect payment:
   {
     "Id": "456",
     "SyncToken": "1"
   }

3. Remove duplicate payment:
   {
     "Id": "789",
     "SyncToken": "0"
   }

**Returns:**
- Deleted BillPayment object with status "Deleted"
- Confirmation of deletion
- Original payment details for reference

**Alternative Approach:**
Instead of deleting, consider creating a reversing payment if:
- Payment has been reconciled
- You need audit trail of void
- Multiple users access the system`;

// Define the expected input schema for deleting a bill payment
const inputSchema = {
    idOrEntity: z.any(),
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
    const response = await deleteQuickbooksBillPayment(params.idOrEntity);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error deleting bill payment: ${response.error}`,
                },
            ],
        };
    }

    return {
        content: [
            { type: "text" as const, text: `Bill payment deleted:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const DeleteBillPaymentTool: ToolDefinition<
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
