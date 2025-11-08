import { createQuickbooksPurchase } from "../handlers/create-quickbooks-purchase.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "create_purchase";
const toolTitle = "Create Purchase";
const toolDescription = `Create a purchase transaction in QuickBooks Online to record expenses, checks, credit card charges, or cash purchases. Purchases track money going out of your business.

**Why use this tool:**
- Record business expenses as they occur
- Track check payments to vendors
- Record credit card purchases
- Log cash expenses
- Categorize business spending
- Maintain accurate expense records

**When to use:**
- Recording check payments for expenses
- Logging credit card transactions
- Tracking cash purchases
- Recording vendor payments without bills
- Documenting business expense transactions
- Entering expense receipts

**Required Parameters:**
- AccountRef: Payment account (bank, credit card, or cash account)
- PaymentType: Cash, Check, or CreditCard
- Line: Array of expense line items

**Optional Parameters:**
- TxnDate: Transaction date (defaults to today)
- EntityRef: Vendor or customer reference
- PrivateNote: Internal notes
- DocNumber: Check or reference number
- DepartmentRef: Department for tracking
- CurrencyRef: Currency for multi-currency

**Line Item Structure:**
- DetailType: "AccountBasedExpenseLineDetail"
- Amount: Line amount
- Description: Expense description
- AccountBasedExpenseLineDetail:
  - AccountRef: { value: "expense_account_id" }
  - ClassRef: Optional class for tracking
  - CustomerRef: Optional customer for billable expenses

**Payment Types:**
- Cash: Cash purchases or payments
- Check: Check payments
- CreditCard: Credit card charges

**Example usage:**
1. Create check purchase:
   {
     "AccountRef": { "value": "35" },
     "PaymentType": "Check",
     "DocNumber": "1050",
     "EntityRef": { "value": "56", "type": "Vendor" },
     "Line": [
       {
         "DetailType": "AccountBasedExpenseLineDetail",
         "Amount": 250.00,
         "Description": "Office supplies",
         "AccountBasedExpenseLineDetail": {
           "AccountRef": { "value": "7" }
         }
       }
     ]
   }

2. Create credit card purchase:
   {
     "AccountRef": { "value": "42" },
     "PaymentType": "CreditCard",
     "TxnDate": "2024-01-15",
     "EntityRef": { "value": "89", "type": "Vendor" },
     "Line": [
       {
         "DetailType": "AccountBasedExpenseLineDetail",
         "Amount": 500.00,
         "Description": "Software subscription",
         "AccountBasedExpenseLineDetail": {
           "AccountRef": { "value": "12" }
         }
       }
     ]
   }

3. Create cash purchase:
   {
     "AccountRef": { "value": "5" },
     "PaymentType": "Cash",
     "Line": [
       {
         "DetailType": "AccountBasedExpenseLineDetail",
         "Amount": 50.00,
         "Description": "Parking fees",
         "AccountBasedExpenseLineDetail": {
           "AccountRef": { "value": "25" }
         }
       }
     ]
   }

4. Create multi-line purchase:
   {
     "AccountRef": { "value": "35" },
     "PaymentType": "Check",
     "DocNumber": "1051",
     "Line": [
       {
         "DetailType": "AccountBasedExpenseLineDetail",
         "Amount": 150.00,
         "Description": "Office rent",
         "AccountBasedExpenseLineDetail": {
           "AccountRef": { "value": "18" }
         }
       },
       {
         "DetailType": "AccountBasedExpenseLineDetail",
         "Amount": 75.00,
         "Description": "Utilities",
         "AccountBasedExpenseLineDetail": {
           "AccountRef": { "value": "19" }
         }
       }
     ]
   }

**Returns:**
- Created Purchase object with QuickBooks-assigned ID
- Transaction details including account, payment type, amounts
- Line items with expense categorization
- MetaData with creation timestamp
- SyncToken for future updates`;

// Define the expected input schema for creating a purchase
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
  const response = await createQuickbooksPurchase(params.purchase);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error creating purchase: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Purchase created:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const CreatePurchaseTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 