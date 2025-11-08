import { createQuickbooksEstimate } from "../handlers/create-quickbooks-estimate.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_estimate";
const toolTitle = "Create Estimate";
const toolDescription = `Create a sales estimate (quote) in QuickBooks Online to provide pricing to potential customers. Estimates can later be converted to invoices when accepted.

**Why use this tool:**
- Provide price quotes to potential customers
- Create detailed proposals with line items
- Establish terms and conditions before sale
- Track estimated vs actual sales
- Enable customer approval workflow
- Build sales pipeline with quoted amounts

**When to use:**
- Responding to customer quote requests
- Creating project proposals with pricing
- Providing service estimates before work begins
- Generating bid documents for contracts
- Building sales quotes for products
- Creating multi-line item proposals

**Required Parameters:**
- CustomerRef: Customer reference { value: "customer_id" }
- Line: Array of line items with DetailType, Amount, and item/account details

**Optional Parameters:**
- TxnDate: Estimate date (defaults to today)
- ExpirationDate: Quote expiration date
- DocNumber: Estimate number (auto-generated if omitted)
- PrivateNote: Internal notes
- CustomerMemo: Message to customer
- BillEmail: Customer email for estimate delivery
- EmailStatus: Email tracking status
- TxnStatus: Status (Accepted, Closed, Pending, Rejected)

**Line Item Structure:**
- DetailType: "SalesItemLineDetail"
- Amount: Line total
- Description: Line description
- SalesItemLineDetail:
  - ItemRef: { value: "item_id" }
  - Qty: Quantity
  - UnitPrice: Price per unit

**Example usage:**
1. Create basic estimate:
   {
     "estimate": {
       "CustomerRef": { "value": "1" },
       "Line": [
         {
           "DetailType": "SalesItemLineDetail",
           "Amount": 500.00,
           "SalesItemLineDetail": {
             "ItemRef": { "value": "10" },
             "Qty": 10,
             "UnitPrice": 50.00
           }
         }
       ]
     }
   }

2. Create estimate with multiple items:
   {
     "estimate": {
       "CustomerRef": { "value": "1" },
       "TxnDate": "2024-01-15",
       "ExpirationDate": "2024-02-15",
       "CustomerMemo": { "value": "Thank you for your business" },
       "Line": [
         {
           "DetailType": "SalesItemLineDetail",
           "Description": "Consulting Services",
           "Amount": 1500.00,
           "SalesItemLineDetail": {
             "ItemRef": { "value": "5" },
             "Qty": 10,
             "UnitPrice": 150.00
           }
         },
         {
           "DetailType": "SalesItemLineDetail",
           "Description": "Materials",
           "Amount": 300.00,
           "SalesItemLineDetail": {
             "ItemRef": { "value": "12" },
             "Qty": 3,
             "UnitPrice": 100.00
           }
         }
       ]
     }
   }

3. Create estimate with tax:
   {
     "estimate": {
       "CustomerRef": { "value": "1" },
       "TxnTaxDetail": {
         "TxnTaxCodeRef": { "value": "TAX" }
       },
       "Line": [
         {
           "DetailType": "SalesItemLineDetail",
           "Amount": 1000.00,
           "SalesItemLineDetail": {
             "ItemRef": { "value": "8" },
             "Qty": 5,
             "UnitPrice": 200.00,
             "TaxCodeRef": { "value": "TAX" }
           }
         }
       ]
     }
   }

**Returns:**
- Created Estimate object with QuickBooks-assigned ID
- All estimate details including customer, line items, totals
- TxnStatus set to "Pending" by default
- MetaData with creation timestamp
- SyncToken for future updates`;
const inputSchema = { estimate: z.any().describe("Estimate object to create") };

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await createQuickbooksEstimate(params.estimate);
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
            { type: "text" as const, text: `Estimate created:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const CreateEstimateTool: ToolDefinition<
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
