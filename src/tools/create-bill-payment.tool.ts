import { createQuickbooksBillPayment } from "../handlers/create-quickbooks-bill-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "create_bill_payment";
const toolTitle = "Create Bill Payment";
const toolDescription = `Create a bill payment in QuickBooks Online to record payments made to vendors for outstanding bills. This tool creates a BillPayment entity that reduces bill balances and tracks payment details.

**Why use this tool:**
- Record payments to vendors for bills due
- Reduce outstanding vendor balances
- Track payment methods (check, credit card, cash, etc.)
- Link payments to specific bills for proper accounting
- Record partial or full bill payments
- Maintain accurate accounts payable records

**When to use:**
- Paying vendor bills by check or electronic payment
- Recording credit card payments to vendors
- Processing batch payments to multiple vendors
- Applying vendor credits to bill balances
- Recording partial bill payments
- Tracking cash payments to vendors

**Required Parameters:**
- VendorRef: Vendor being paid (Id and name)
- PayType: Payment method (Check, CreditCard, Cash)
- TotalAmt: Total payment amount

**Optional Parameters:**
- TxnDate: Payment date (defaults to today)
- PrivateNote: Internal notes about payment
- CheckNum: Check number if PayType is Check
- CreditCardPayment: Credit card details if PayType is CreditCard
- Line: Array of linked transactions (bills being paid)

**Example usage:**
1. Pay vendor bill with check:
   {
     "VendorRef": { "value": "56", "name": "Bob's Burgers" },
     "PayType": "Check",
     "TotalAmt": 500.00,
     "CheckNum": "1001",
     "TxnDate": "2024-01-15",
     "Line": [
       {
         "Amount": 500.00,
         "LinkedTxn": [
           {
             "TxnId": "145",
             "TxnType": "Bill"
           }
         ]
       }
     ]
   }

2. Pay bill with credit card:
   {
     "VendorRef": { "value": "42", "name": "Office Supplies Co" },
     "PayType": "CreditCard",
     "TotalAmt": 250.00,
     "CreditCardPayment": {
       "CreditChargeInfo": {
         "Number": "xxxx1234",
         "Type": "Visa"
       }
     },
     "Line": [
       {
         "Amount": 250.00,
         "LinkedTxn": [{ "TxnId": "199", "TxnType": "Bill" }]
       }
     ]
   }

3. Pay multiple bills with one check:
   {
     "VendorRef": { "value": "56" },
     "PayType": "Check",
     "TotalAmt": 1500.00,
     "CheckNum": "1002",
     "Line": [
       {
         "Amount": 800.00,
         "LinkedTxn": [{ "TxnId": "145", "TxnType": "Bill" }]
       },
       {
         "Amount": 700.00,
         "LinkedTxn": [{ "TxnId": "150", "TxnType": "Bill" }]
       }
     ]
   }

4. Simple cash payment:
   {
     "VendorRef": { "value": "56" },
     "PayType": "Cash",
     "TotalAmt": 100.00,
     "PrivateNote": "Cash payment for small purchase"
   }

**Returns:**
- Created BillPayment object with QuickBooks-assigned ID
- Payment details including TxnDate, TotalAmt, PayType
- Line items showing which bills were paid
- MetaData with creation timestamp`;

// Define the expected input schema for creating a bill payment
const inputSchema = {
  billPayment: z.any(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await createQuickbooksBillPayment(params.billPayment);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error creating bill payment: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Bill payment created:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const CreateBillPaymentTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 