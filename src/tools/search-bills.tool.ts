import { searchQuickbooksBills } from "../handlers/search-quickbooks-bills.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_bills";
const toolTitle = "Search Bills";
const toolDescription = `Search and filter bills in QuickBooks Online using various criteria like vendor, date, amount, status, and more. Supports advanced filtering and pagination.

**Why use this tool:**
- Find bills by vendor name or ID
- Search for unpaid bills
- Filter bills by date range or amount
- Get list of recent bills for accounts payable management
- Find bills requiring payment
- Track vendor payables and payment schedules

**When to use:**
- Need to find vendor bills before processing payments
- Generating accounts payable reports
- Searching for overdue bills requiring payment
- Building bill lists for payment processing
- Finding bills by date or amount ranges
- Tracking unpaid vendor invoices

**IMPORTANT: Three Input Formats**

This tool accepts criteria in **three different formats**:

**Format 1: Empty object (get all bills)**
\`\`\`json
{}
// or
{ "limit": 20 }
\`\`\`

**Format 2: Array format (for filters with operators)**
\`\`\`json
[
  { "field": "Balance", "value": "0", "operator": ">" },
  { "field": "limit", "value": 10 }
]
\`\`\`

**Format 3: Advanced options format (with filters key)**
\`\`\`json
{
  "filters": [
    { "field": "Balance", "value": "0", "operator": ">" }
  ],
  "limit": 10,
  "desc": "TxnDate"
}
\`\`\`

**CRITICAL RULES:**
1. ⚠️ **Pagination/sorting ONLY**: Use array format or include "filters" key
   - ✅ CORRECT: \`{ "limit": 10 }\` (will be converted internally)
   - ✅ CORRECT: \`{ "filters": [], "limit": 10 }\`
   - ✅ CORRECT: \`[{ "field": "limit", "value": 10 }]\`

2. ⚠️ **Simple field filters**: Use object format without reserved keys
   - ✅ CORRECT: \`{ "VendorRef": "56" }\`
   - ❌ WRONG: \`{ "VendorRef": "56", "limit": 10 }\` (mixed format - ambiguous)
   - ✅ CORRECT: \`[{ "field": "VendorRef", "value": "56" }, { "field": "limit", "value": 10 }]\`

3. ⚠️ **Complex filters**: Always use array or advanced format
   - ✅ CORRECT: \`[{ "field": "Balance", "value": "0", "operator": ">" }]\`
   - ✅ CORRECT: \`{ "filters": [{ "field": "Balance", "value": "0", "operator": ">" }] }\`

**Reserved Keywords (pagination/sorting):**
- \`limit\` - Maximum results
- \`offset\` - Skip records
- \`asc\` - Sort ascending
- \`desc\` - Sort descending
- \`count\` - Count only
- \`fetchAll\` - Get all records
- \`filters\` - Filter array (advanced format)

**DO NOT mix reserved keywords with filter fields in simple object format!**

**Supported QuickBooks Fields:**
- VendorRef (vendor ID)
- TxnDate (transaction date)
- DueDate (payment due date)
- DocNumber (bill number)
- TotalAmt (total amount)
- Balance (remaining balance)
- MetaData.CreateTime
- MetaData.LastUpdatedTime

**Supported Operators:**
- \`=\` (equals) - default
- \`<\` (less than)
- \`>\` (greater than)
- \`<=\` (less than or equal)
- \`>=\` (greater than or equal)
- \`LIKE\` (partial match)
- \`IN\` (list of values)

**Example usage:**

1. **Get all bills with limit:**
   \`\`\`json
   { "limit": 20 }
   \`\`\`

2. **Find unpaid bills (Balance > 0):**
   \`\`\`json
   [
     { "field": "Balance", "value": "0", "operator": ">" },
     { "field": "desc", "value": "Balance" }
   ]
   \`\`\`

3. **Search by vendor (simple):**
   \`\`\`json
   { "VendorRef": "56" }
   \`\`\`

4. **Search by vendor with limit (array format):**
   \`\`\`json
   [
     { "field": "VendorRef", "value": "56" },
     { "field": "limit", "value": 10 }
   ]
   \`\`\`

5. **Find bills by date range (advanced format):**
   \`\`\`json
   {
     "filters": [
       { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" },
       { "field": "TxnDate", "value": "2024-12-31", "operator": "<=" }
     ],
     "desc": "TxnDate"
   }
   \`\`\`

6. **Find overdue bills (DueDate < today, Balance > 0):**
   \`\`\`json
   {
     "filters": [
       { "field": "DueDate", "value": "2024-01-15", "operator": "<" },
       { "field": "Balance", "value": "0", "operator": ">" }
     ],
     "limit": 50
   }
   \`\`\`

7. **Simple vendor search:**
   \`\`\`json
   { "VendorRef": "56" }
   \`\`\`

8. **Get recent bills (sort by creation):**
   \`\`\`json
   {
     "filters": [],
     "desc": "MetaData.CreateTime",
     "limit": 10
   }
   \`\`\`

**Returns:**
- Array of bill objects matching the criteria
- Each bill includes vendor, amounts, dates, line items

**Common Errors:**
- ❌ \`{ "VendorRef": "56", "limit": 10 }\` - Mixed format, use array instead
- ❌ \`{ "Balance > 0" }\` - Invalid field name, use array with operator
- ✅ \`[{ "field": "VendorRef", "value": "56" }, { "field": "limit", "value": 10 }]\`
- ✅ \`{ "filters": [{ "field": "Balance", "value": "0", "operator": ">" }], "limit": 10 }\``;

// A subset of commonly-used Bill fields that can be filtered on.
// This is *not* an exhaustive list, but provides helpful IntelliSense / docs
// to users of the tool. Any field returned in the Quickbooks Bill entity is
// technically valid.
const billFieldEnum = z
    .enum([
        "Id",
        "SyncToken",
        "MetaData.CreateTime",
        "MetaData.LastUpdatedTime",
        "TxnDate",
        "DueDate",
        "Balance",
        "TotalAmt",
        "VendorRef",
        "APAccountRef",
        "DocNumber",
        "PrivateNote",
        "ExchangeRate",
        "DepartmentRef",
        "CurrencyRef",
    ])
    .describe(
        "Field to filter on – must be a property of the QuickBooks Online Bill entity."
    );

const criterionSchema = z.object({
    key: z.string().describe("Simple key (legacy) – any Bill property name."),
    value: z.union([z.string(), z.boolean()]),
});

// Advanced criterion schema with operator support.
const advancedCriterionSchema = z.object({
    field: billFieldEnum,
    value: z.union([z.string(), z.boolean()]),
    operator: z
        .enum(["=", "<", ">", "<=", ">=", "LIKE", "IN"])
        .optional()
        .describe("Comparison operator. Defaults to '=' if omitted."),
});

const inputSchema = {
    // Allow advanced criteria array like [{field,value,operator}]
    criteria: z
        .array(advancedCriterionSchema.or(criterionSchema))
        .optional()
        .describe(
            "Filters to apply. Use the advanced form {field,value,operator?} for operators or the simple {key,value} pairs."
        ),

    limit: z
        .number()
        .optional()
        .describe("Maximum number of results to return"),
    offset: z.number().optional().describe("Number of results to skip"),
    asc: z.string().optional().describe("Field to sort ascending by"),
    desc: z.string().optional().describe("Field to sort descending by"),
    fetchAll: z.boolean().optional().describe("Fetch all matching results"),
    count: z.boolean().optional().describe("Return only the count of results"),
};

const outputSchema = {
    success: z.boolean().describe("Whether the search was successful"),
    count: z
        .number()
        .optional()
        .describe("Number of bills found or count result"),
    bills: z.array(z.any()).optional().describe("Array of bill objects"),
    error: z.string().optional().describe("Error message if search failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const { criteria = [], ...options } = params;

    // build criteria to pass to SDK, supporting advanced operator syntax
    let criteriaToSend: any;
    if (Array.isArray(criteria) && criteria.length > 0) {
        const first = criteria[0] as any;
        if (typeof first === "object" && "field" in first) {
            criteriaToSend = [
                ...criteria,
                ...Object.entries(options).map(([key, value]) => ({
                    field: key,
                    value,
                })),
            ];
        } else {
            criteriaToSend = (
                criteria as Array<{ key: string; value: any }>
            ).reduce<Record<string, any>>(
                (acc, { key, value }) => {
                    if (value !== undefined && value !== null) acc[key] = value;
                    return acc;
                },
                { ...options }
            );
        }
    } else {
        criteriaToSend = { ...options };
    }

    const response = await searchQuickbooksBills(criteriaToSend);
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
        count: Array.isArray(response.result)
            ? response.result.length
            : (response.result ?? undefined),
        bills: Array.isArray(response.result) ? response.result : undefined,
    };

    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const SearchBillsTool: ToolDefinition<
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
