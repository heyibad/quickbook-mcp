import { searchQuickbooksInvoices } from "../handlers/search-quickbooks-invoices.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_invoices";
const toolDescription = `Search and filter invoices in QuickBooks Online using various criteria like customer, date, amount, status, and more. Supports advanced filtering with operators and pagination.

**Why use this tool:**
- Find invoices by customer name or ID
- Search for unpaid or overdue invoices
- Filter invoices by date range or amount
- Get list of recent invoices for reporting
- Find invoices with specific characteristics (e.g., high value, specific status)
- Track accounts receivable and payment status

**When to use:**
- Need to find customer invoices before processing payments
- Generating accounts receivable reports
- Searching for overdue invoices requiring follow-up
- Building invoice lists for customer portals
- Finding invoices by date or amount ranges
- Tracking invoice payment status


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
- CustomerRef, TxnDate, DueDate, DocNumber
- TotalAmt, Balance, BillEmail
- EmailStatus, PrintStatus
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Example usage:**
1. Get all invoices (limit 20):
   { "criteria": {}, "limit": 20 }

2. Find unpaid invoices (Balance > 0):
   {
     "criteria": [
       { "field": "Balance", "value": "0", "operator": ">" }
     ],
     "desc": "Balance"
   }

3. Search by customer:
   {
     "criteria": [
       { "field": "CustomerRef", "value": "58" }
     ]
   }

4. Find invoices by date range:
   {
     "criteria": [
       { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" },
       { "field": "TxnDate", "value": "2024-12-31", "operator": "<=" }
     ]
   }

5. Find large invoices:
   {
     "criteria": [
       { "field": "TotalAmt", "value": "1000", "operator": ">" }
     ]
   }

**Returns:**
- Array of invoice objects matching the criteria`;

// ALLOWED FIELD LISTS (derived from Quickbooks Invoice entity docs – Filterable and Sortable columns)
const ALLOWED_FILTER_FIELDS = [
    "Id",
    "MetaData.CreateTime",
    "MetaData.LastUpdatedTime",
    "DocNumber",
    "TxnDate",
    "DueDate",
    "CustomerRef",
    "ClassRef",
    "DepartmentRef",
    "Balance",
    "TotalAmt",
] as const;

const ALLOWED_SORT_FIELDS = [
    "Id",
    "MetaData.CreateTime",
    "MetaData.LastUpdatedTime",
    "DocNumber",
    "TxnDate",
    "Balance",
    "TotalAmt",
] as const;

// FIELD TYPE MAP
const FIELD_TYPE_MAP = {
    Id: "string",
    "MetaData.CreateTime": "date",
    "MetaData.LastUpdatedTime": "date",
    DocNumber: "string",
    TxnDate: "date",
    DueDate: "date",
    CustomerRef: "string",
    ClassRef: "string",
    DepartmentRef: "string",
    Balance: "number",
    TotalAmt: "number",
} as const;

// Helper function to check if the value type matches the expected type for the field
const isValidInvoiceValueType = (field: string, value: any): boolean => {
    const expectedType = FIELD_TYPE_MAP[field as keyof typeof FIELD_TYPE_MAP];
    return typeof value === expectedType;
};

// Zod schemas that validate the fields against the white-lists
const filterableFieldSchema = z
    .string()
    .refine(
        (val) => (ALLOWED_FILTER_FIELDS as readonly string[]).includes(val),
        {
            message: `Field must be one of: ${ALLOWED_FILTER_FIELDS.join(", ")}`,
        }
    );

const sortableFieldSchema = z
    .string()
    .refine((val) => (ALLOWED_SORT_FIELDS as readonly string[]).includes(val), {
        message: `Sort field must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}`,
    });

// Criteria can be advanced
const operatorSchema = z
    .enum(["=", "IN", "<", ">", "<=", ">=", "LIKE"])
    .optional();
const filterSchema = z
    .object({
        field: filterableFieldSchema,
        value: z.any(),
        operator: operatorSchema,
    })
    .superRefine((obj, ctx) => {
        if (!isValidInvoiceValueType(obj.field as string, obj.value)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Value type does not match expected type for field ${obj.field}`,
            });
        }
    });

const advancedCriteriaSchema = z.object({
    filters: z.array(filterSchema).optional(),
    asc: sortableFieldSchema.optional(),
    desc: sortableFieldSchema.optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    count: z.boolean().optional(),
    fetchAll: z.boolean().optional(),
});

// Runtime schema used internally for validation
const RUNTIME_CRITERIA_SCHEMA = z.union([
    z.record(z.any()),
    z.array(z.record(z.any())),
    advancedCriteriaSchema,
]);

// Input schema – use broad type to prevent deep $ref issues
const inputSchema = {
    criteria: z
        .any()
        .describe(
            "Search criteria for invoices - can be simple object, array, or advanced criteria with filters, sorting, and pagination"
        ),
};

// Output schema
const outputSchema = {
    success: z.boolean().describe("Whether the search was successful"),
    count: z.number().describe("Number of invoices found"),
    invoices: z.array(z.any()).optional().describe("Array of invoice objects"),
    error: z.string().optional().describe("Error message if search failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const { criteria } = params;

    // Validate runtime schema
    const parsed = RUNTIME_CRITERIA_SCHEMA.safeParse(criteria);
    if (!parsed.success) {
        const output = {
            success: false,
            count: 0,
            error: `Invalid criteria: ${parsed.error.message}`,
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

    const response = await searchQuickbooksInvoices(criteria);

    if (response.isError) {
        const output = {
            success: false,
            count: 0,
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

    const invoices = response.result;
    const output = {
        success: true,
        count: invoices?.length || 0,
        invoices: invoices || undefined,
    };

    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const SearchInvoicesTool: ToolDefinition<
    typeof inputSchema,
    typeof outputSchema
> = {
    name: toolName,
    title: "Search Invoices",
    description: toolDescription,
    inputSchema: inputSchema,
    outputSchema: outputSchema,
    handler: toolHandler,
};
