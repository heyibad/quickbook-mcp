import { updateQuickbooksInvoice } from "../handlers/update-quickbooks-invoice.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_invoice";
const toolTitle = "Update Invoice";
const toolDescription = `Update an existing invoice in QuickBooks Online to modify line items, amounts, dates, payment terms, or customer information. Requires the current SyncToken and supports sparse updates.

**Why use this tool:**
- Modify invoice amounts or line items
- Update invoice due dates or payment terms
- Add or remove line items
- Change invoice customer messages
- Update billing or shipping addresses
- Correct invoice errors before sending

**When to use:**
- Correcting invoice amounts after creation
- Adding forgotten line items to invoices
- Updating due dates for payment extensions
- Changing invoice terms or conditions
- Fixing customer information on invoices
- Updating invoices before email delivery

**Required Parameters:**
- invoice_id: The QuickBooks ID of the invoice to update
- sync_token: Current version token (get from read_invoice or search)
- Other fields to update (at least one)

**Updatable Fields:**
- Line: Array of line items (add, modify, or remove)
- DueDate: Payment due date
- TxnDate: Transaction date
- CustomerMemo: Message to customer on invoice
- PrivateNote: Internal notes not visible to customer
- BillAddr: Billing address
- ShipAddr: Shipping address
- SalesTermRef: Payment terms reference
- CustomField: Custom field values

**CRITICAL - Required Workflow:**
- Step 1: Call read_invoice with the invoice ID to get current SyncToken
- Step 2: Call this tool with the invoice_id, current SyncToken, and fields to update
- SyncToken Format: String like "0", "1", "2" - increments with each update
- Why: SyncToken prevents concurrent modification conflicts in QuickBooks

**Important Limitations:**
- Cannot change CustomerRef after invoice is created
- Include complete Line array when modifying line items (partial line updates not supported)
- Cannot update paid or voided invoices in most cases
- Use sparse=true for updating individual non-line fields

**Example usage:**
1. Update due date:
   {
     "invoice_id": "145",
     "sync_token": "3",
     "due_date": "2024-02-28"
   }

2. Update customer memo:
   {
     "invoice_id": "145",
     "sync_token": "3",
     "customer_memo": "Payment due in 30 days - thank you!"
   }

3. Update line items:
   {
     "invoice_id": "145",
     "sync_token": "3",
     "line": [
       {
         "Id": "1",
         "DetailType": "SalesItemLineDetail",
         "Amount": 750.00,
         "SalesItemLineDetail": {
           "ItemRef": { "value": "10" },
           "Qty": 15,
           "UnitPrice": 50.00
         }
       }
     ]
   }

4. Update billing address:
   {
     "invoice_id": "145",
     "sync_token": "3",
     "bill_addr": {
       "Line1": "456 New Address St",
       "City": "Boston",
       "CountrySubDivisionCode": "MA",
       "PostalCode": "02101"
     }
   }

5. Add private note:
   {
     "invoice_id": "145",
     "sync_token": "3",
     "private_note": "Customer requested extended payment terms"
   }

**Returns:**
- Updated Invoice object
- New SyncToken for subsequent updates
- All invoice details with changes applied
- Updated TotalAmt if line items changed
- MetaData with LastUpdatedTime
- Balance reflecting any payments`;

const inputSchema = {
    invoice_id: z.string().min(1).describe("The QuickBooks ID of the invoice to update"),
    sync_token: z.string().min(1).describe("Current version token from the invoice (required for concurrency control)"),
    due_date: z.string().optional().describe("Payment due date in YYYY-MM-DD format"),
    txn_date: z.string().optional().describe("Transaction date in YYYY-MM-DD format"),
    customer_memo: z.string().optional().describe("Message to customer on the invoice"),
    private_note: z.string().optional().describe("Internal notes not visible to customer"),
    bill_addr: z.object({
        Line1: z.string().optional(),
        Line2: z.string().optional(),
        City: z.string().optional(),
        CountrySubDivisionCode: z.string().optional(),
        PostalCode: z.string().optional(),
        Country: z.string().optional()
    }).optional().describe("Billing address"),
    ship_addr: z.object({
        Line1: z.string().optional(),
        Line2: z.string().optional(),
        City: z.string().optional(),
        CountrySubDivisionCode: z.string().optional(),
        PostalCode: z.string().optional(),
        Country: z.string().optional()
    }).optional().describe("Shipping address"),
    sales_term_ref: z.object({
        value: z.string().describe("Payment terms ID")
    }).optional().describe("Payment terms reference"),
    line: z.array(z.object({
        Id: z.string().optional().describe("Line ID for updating existing lines"),
        DetailType: z.string().describe("Line detail type (usually SalesItemLineDetail)"),
        Amount: z.number().optional().describe("Line total amount"),
        Description: z.string().optional().describe("Line description"),
        SalesItemLineDetail: z.object({
            ItemRef: z.object({
                value: z.string().describe("QuickBooks item ID")
            }).describe("Item reference"),
            Qty: z.number().optional().describe("Quantity"),
            UnitPrice: z.number().optional().describe("Price per unit")
        }).optional()
    })).optional().describe("Array of invoice line items (include complete array when updating)"),
};

const outputSchema = {
    success: z
        .boolean()
        .describe("Whether the invoice was updated successfully"),
    invoice: z.any().optional().describe("The updated invoice object"),
    error: z.string().optional().describe("Error message if update failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await updateQuickbooksInvoice(params);

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
        invoice: response.result,
    };
    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const UpdateInvoiceTool: ToolDefinition<
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
