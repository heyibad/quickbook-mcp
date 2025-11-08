import { getQuickbooksBillPayment } from "../handlers/get-quickbooks-bill-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "get_bill_payment";
const toolTitle = "Get Bill Payment";
const toolDescription = `Retrieve a specific bill payment by its ID from QuickBooks Online. Returns complete payment details including vendor, amount, payment method, and linked bills.

**Why use this tool:**
- View payment details for a specific transaction
- Verify payment amounts and dates
- Check which bills were paid by a payment
- Review payment method (check, credit card, cash)
- Retrieve check numbers for reconciliation
- Get payment information for reporting

**When to use:**
- Displaying payment details in your application
- Verifying payment before updating or voiding
- Reconciling bank accounts with payments
- Generating payment receipts or confirmations
- Reviewing payment history
- Auditing payment records

**Required Parameters:**
- Id: The QuickBooks ID of the bill payment to retrieve

**Example usage:**
1. Get payment details by ID:
   { "Id": "234" }

2. Retrieve payment to check status:
   { "Id": "456" }

3. Get payment for reconciliation:
   { "Id": "789" }

**Returns:**
- Complete BillPayment object
- Payment details: TxnDate, TotalAmt, PayType
- VendorRef with vendor ID and name
- CheckNum if payment was by check
- CreditCardPayment details if paid by card
- Line items showing which bills were paid
- LinkedTxn references to paid bills
- MetaData with creation and update timestamps
- SyncToken for future updates`;

// Define the expected input schema for getting a bill payment
const inputSchema = {
  id: z.string(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await getQuickbooksBillPayment(params.id);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error getting bill payment: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Bill payment retrieved:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const GetBillPaymentTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 