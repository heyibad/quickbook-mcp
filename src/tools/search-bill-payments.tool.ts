import { searchQuickbooksBillPayments } from "../handlers/search-quickbooks-bill-payments.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "search_bill_payments";
const toolTitle = "Search Bill Payments";
const toolDescription = `Search and filter bill payments in QuickBooks Online using various criteria like vendor, date, amount, payment type, and more. Supports pagination and sorting.

**Why use this tool:**
- Find payments by vendor
- List payments by date range
- Search for payments by check number
- Filter payments by payment method
- Generate payment reports
- Track payment history

**When to use:**
- Reconciling bank accounts with vendor payments
- Finding payments for specific vendor
- Generating accounts payable reports
- Searching for payments by check number
- Listing recent payments
- Building payment history displays


**IMPORTANT - Three Input Formats:**

Format 1 - Pagination only: { "limit": 10, "desc": "MetaData.CreateTime" }
Format 2 - Array with operators: [{ "field": "FieldName", "value": "value", "operator": ">" }, { "field": "limit", "value": 10 }]
Format 3 - Advanced with filters key: { "filters": [{ "field": "FieldName", "value": "value", "operator": ">" }], "limit": 10 }

**CRITICAL RULES:**
1. For pagination ONLY, use Format 1 or Format 3 with empty filters
2. For simple filters WITHOUT pagination, use: { "FieldName": "value" }
3. NEVER mix filter fields with reserved keywords (limit, offset, asc, desc, count, fetchAll, filters) in simple object format
4. When combining filters with pagination, use Format 2 (array) or Format 3 (filters key)
5. For operators (>, <, >=, <=, LIKE, IN), use Format 2 or Format 3

**Reserved Keywords:** limit, offset, asc, desc, count, fetchAll, filters

See SEARCH_TOOLS_USAGE_GUIDE.md for detailed examples.


**Parameters:**
- criteria (optional): Array of filter objects OR simple key-value object
- limit (optional): Maximum number of results
- offset (optional): Number of records to skip for pagination
- asc/desc (optional): Field name to sort by

**Supported fields:**
- VendorRef, PayType, TxnDate
- TotalAmt, CheckNum
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Example usage:**
1. Get all payments (limit 20):
   { "criteria": {}, "limit": 20 }

2. Find payments by vendor:
   {
     "criteria": [
       { "field": "VendorRef", "value": "56" }
     ],
     "desc": "TxnDate"
   }

3. Search by check number:
   {
     "criteria": [
       { "field": "CheckNum", "value": "1001" }
     ]
   }

4. Find payments by date range:
   {
     "criteria": [
       { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" },
       { "field": "TxnDate", "value": "2024-12-31", "operator": "<=" }
     ]
   }

5. Find check payments only:
   {
     "criteria": [
       { "field": "PayType", "value": "Check" }
     ],
     "desc": "CheckNum"
   }

6. Find payments above certain amount:
   {
     "criteria": [
       { "field": "TotalAmt", "value": "1000", "operator": ">" }
     ]
   }

**Returns:**
- Array of BillPayment objects matching criteria
- Each payment includes vendor, amount, payment type, check number
- Linked bills information`;

// Define the expected input schema for searching bill payments
const inputSchema = {
    criteria: z.array(z.any()).optional(),
    asc: z.string().optional(),
    desc: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    count: z.boolean().optional(),
    fetchAll: z.boolean().optional(),
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
    const response = await searchQuickbooksBillPayments(params);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error searching bill payments: ${response.error}`,
                },
            ],
        };
    }

    return {
        content: [
            { type: "text" as const, text: `Bill payments found:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const SearchBillPaymentsTool: ToolDefinition<
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
