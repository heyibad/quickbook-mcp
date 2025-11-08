import { createQuickbooksInvoice } from "../handlers/create-quickbooks-invoice.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_invoice";
const toolTitle = "Create Invoice";
const toolDescription = `Create an invoice (accounts receivable) in QuickBooks Online to bill customers for products or services provided.

**Why use this tool:**
- Bill customers for goods sold or services rendered
- Track accounts receivable and customer balances
- Create professional invoices with line items and descriptions
- Record revenue and sales transactions
- Enable customer payments and payment tracking

**When to use:**
- Billing customers for completed work or delivered products
- Creating recurring invoices for services
- Recording sales transactions
- Generating invoices from estimates or sales orders
- Requesting payment from customers

**Parameters:**
- invoice (required): Invoice object with:
  - CustomerRef (required): { value: "customer_id" }
  - Line (required): Array of line items, each with:
    - Amount: Line item total amount
    - DetailType: "SalesItemLineDetail"
    - SalesItemLineDetail: {
        ItemRef: { value: "item_id" },
        Qty: quantity,
        UnitPrice: price per unit
      }
  - TxnDate (optional): Invoice date in YYYY-MM-DD format
  - DueDate (optional): Payment due date
  - DocNumber (optional): Invoice number
  - PrivateNote (optional): Internal memo
  - CustomerMemo (optional): { value: "Message to customer" }

**Example usage:**
1. Create simple invoice:
   {
     "invoice": {
       "CustomerRef": { "value": "58" },
       "Line": [
         {
           "Amount": 150.00,
           "DetailType": "SalesItemLineDetail",
           "SalesItemLineDetail": {
             "ItemRef": { "value": "3" },
             "Qty": 3,
             "UnitPrice": 50.00
           }
         }
       ],
       "TxnDate": "2024-01-15",
       "DueDate": "2024-02-15"
     }
   }

2. Create invoice with multiple items and memo:
   {
     "invoice": {
       "CustomerRef": { "value": "142" },
       "Line": [
         {
           "Amount": 500.00,
           "Description": "Consulting Services",
           "DetailType": "SalesItemLineDetail",
           "SalesItemLineDetail": {
             "ItemRef": { "value": "5" },
             "Qty": 10,
             "UnitPrice": 50.00
           }
         },
         {
           "Amount": 100.00,
           "Description": "Materials",
           "DetailType": "SalesItemLineDetail",
           "SalesItemLineDetail": {
             "ItemRef": { "value": "8" },
             "Qty": 1,
             "UnitPrice": 100.00
           }
         }
       ],
       "TxnDate": "2024-01-20",
       "DueDate": "2024-02-20",
       "DocNumber": "INV-1001",
       "CustomerMemo": { "value": "Thank you for your business!" }
     }
   }

**Returns:**
- Created invoice object with QuickBooks-assigned Id, total amount, balance due, and SyncToken`;

const lineItemSchema = z.object({
    item_ref: z.string().min(1).describe("Item ID reference"),
    qty: z.number().positive().describe("Quantity of items"),
    unit_price: z.number().nonnegative().describe("Unit price per item"),
    description: z.string().optional().describe("Line item description"),
});

const inputSchema = {
    customer_ref: z.string().min(1).describe("Customer ID reference"),
    line_items: z.array(lineItemSchema).min(1).describe("Array of line items"),
    doc_number: z
        .string()
        .optional()
        .describe("Document number for the invoice"),
    txn_date: z
        .string()
        .optional()
        .describe("Transaction date (YYYY-MM-DD format)"),
};

const outputSchema = {
    success: z
        .boolean()
        .describe("Whether the invoice was created successfully"),
    invoice_id: z.string().optional().describe("The ID of the created invoice"),
    doc_number: z
        .string()
        .optional()
        .describe("The document number of the created invoice"),
    error: z.string().optional().describe("Error message if creation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await createQuickbooksInvoice(params);

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

    const output = {
        success: true,
        invoice_id: response.result?.Id,
        doc_number: response.result?.DocNumber,
    };

    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const CreateInvoiceTool: ToolDefinition<
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
