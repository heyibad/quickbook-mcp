import { searchQuickbooksEstimates } from "../handlers/search-quickbooks-estimates.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_estimates";
const toolTitle = "Search Estimates";
const toolDescription = `Search and filter sales estimates in QuickBooks Online using various criteria like customer, date, amount, status, and more. Supports pagination and sorting.

**Why use this tool:**
- Find estimates by customer
- List pending estimates awaiting approval
- Search for accepted estimates to convert to invoices
- Filter estimates by date range
- Get estimates expiring soon
- Build estimate reports and pipelines

**When to use:**
- Finding customer quotes for follow-up
- Listing pending estimates for review
- Searching for accepted estimates to invoice
- Generating estimate reports
- Finding expired quotes
- Building estimate dashboards


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
- CustomerRef: Customer ID
- TxnDate: Transaction date
- ExpirationDate: Quote expiration
- DocNumber: Estimate number
- TotalAmt: Total estimate amount
- TxnStatus: Accepted, Pending, Rejected, Closed
- EmailStatus: Email delivery status
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Example usage:**
1. Get pending estimates:
   {
     "criteria": [
       { "field": "TxnStatus", "value": "Pending" }
     ],
     "desc": "TxnDate"
   }

2. Find estimates by customer:
   {
     "criteria": [
       { "field": "CustomerRef", "value": "1" }
     ],
     "desc": "TxnDate"
   }

3. Find accepted estimates:
   {
     "criteria": [
       { "field": "TxnStatus", "value": "Accepted" }
     ],
     "asc": "TxnDate"
   }

4. Find estimates by date range:
   {
     "criteria": [
       { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" },
       { "field": "TxnDate", "value": "2024-12-31", "operator": "<=" }
     ]
   }

5. Find expiring estimates:
   {
     "criteria": [
       { "field": "ExpirationDate", "value": "2024-02-01", "operator": "<=" },
       { "field": "TxnStatus", "value": "Pending" }
     ]
   }

6. Find estimates by amount range:
   {
     "criteria": [
       { "field": "TotalAmt", "value": "1000", "operator": ">=" }
     ],
     "desc": "TotalAmt"
   }

**Returns:**
- Array of Estimate objects matching criteria
- Each estimate includes customer, amounts, status, dates
- Line item details and totals`;

// A subset of commonly‑used Estimate fields that can be filtered on.
// This is *not* an exhaustive list, but provides helpful IntelliSense / docs
// to users of the tool.  Any field returned in the Quickbooks Estimate entity is
// technically valid.
const estimateFieldEnum = z
    .enum([
        "Id",
        "DocNumber",
        "TxnDate",
        "TxnStatus",
        "CustomerRef",
        "TotalAmt",
        "MetaData.CreateTime",
        "MetaData.LastUpdatedTime",
    ])
    .describe(
        "Field to filter on – must be a property of the QuickBooks Online Estimate entity."
    );

const criterionSchema = z.object({
    key: z
        .string()
        .describe("Simple key (legacy) – any Estimate property name."),
    value: z.union([z.string(), z.boolean()]),
});

// Advanced criterion schema with operator support.
const advancedCriterionSchema = z.object({
    field: estimateFieldEnum,
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
        .describe("Number of estimates found or count result"),
    estimates: z
        .array(z.any())
        .optional()
        .describe("Array of estimate objects"),
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

    const response = await searchQuickbooksEstimates(criteriaToSend);
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
        estimates: Array.isArray(response.result) ? response.result : undefined,
    };

    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const SearchEstimatesTool: ToolDefinition<
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
