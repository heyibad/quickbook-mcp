import { searchQuickbooksPurchases } from "../handlers/search-quickbooks-purchases.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "search_purchases";
const toolTitle = "Search Purchases";
const toolDescription = `Search and filter purchase transactions in QuickBooks Online using various criteria like vendor, date, amount, payment type, and account. Supports pagination and sorting.

**Why use this tool:**
- Find purchases by vendor
- List purchases by payment method
- Search for purchases by date range
- Filter by expense account
- Find check payments by number
- Generate expense reports

**When to use:**
- Reconciling bank or credit card accounts
- Finding vendor payments
- Generating expense reports by category
- Searching for specific check numbers
- Listing recent purchases
- Building expense analysis reports


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
- EntityRef: Vendor or customer ID
- AccountRef: Payment account ID
- PaymentType: Cash, Check, CreditCard
- TxnDate: Transaction date
- TotalAmt: Total purchase amount
- DocNumber: Check or reference number
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Example usage:**
1. Get all purchases (limit 20):
   { "criteria": {}, "limit": 20 }

2. Find purchases by vendor:
   {
     "criteria": [
       { "field": "EntityRef", "value": "56" }
     ],
     "desc": "TxnDate"
   }

3. Find check payments:
   {
     "criteria": [
       { "field": "PaymentType", "value": "Check" }
     ],
     "desc": "DocNumber"
   }

4. Search by check number:
   {
     "criteria": [
       { "field": "DocNumber", "value": "1050" }
     ]
   }

5. Find purchases by date range:
   {
     "criteria": [
       { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" },
       { "field": "TxnDate", "value": "2024-12-31", "operator": "<=" }
     ]
   }

6. Find credit card purchases:
   {
     "criteria": [
       { "field": "PaymentType", "value": "CreditCard" },
       { "field": "AccountRef", "value": "42" }
     ],
     "desc": "TxnDate"
   }

7. Find purchases by amount range:
   {
     "criteria": [
       { "field": "TotalAmt", "value": "100", "operator": ">=" }
     ],
     "desc": "TotalAmt"
   }

**Returns:**
- Array of Purchase objects matching criteria
- Each purchase includes payment type, amount, vendor, date
- Line item expense details
- Check numbers and account references`;

// Define the expected input schema for searching purchases
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
    const response = await searchQuickbooksPurchases(params);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error searching purchases: ${response.error}`,
                },
            ],
        };
    }

    return {
        content: [
            { type: "text" as const, text: `Purchases found:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const SearchPurchasesTool: ToolDefinition<
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
