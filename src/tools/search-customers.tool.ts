import { searchQuickbooksCustomers } from "../handlers/search-quickbooks-customers.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_customers";
const toolTitle = "Search Customers";
const toolDescription = `Search and filter customers in QuickBooks Online using various criteria like name, email, company, balance, and more. Supports advanced filtering with operators and pagination.

⚠️ **IMPORTANT**: This searches CUSTOMERS (buyers/clients), NOT accounts/vendors/employees!
- To search accounts: use search_accounts
- To search vendors: use search_vendors
- To search employees: use search_employees

**Why use this tool:**
- Find customers by name, email, or company before creating transactions
- Get list of customers for dropdown menus or selection lists
- Find customers with outstanding balances
- Search for customers by partial name matches
- Filter customers by active/inactive status
- Generate customer reports and analytics

**When to use:**
- Need to find a customer by name before creating an invoice
- Building a customer selection interface
- Searching for customers by email or phone
- Getting list of active customers for reporting
- Finding customers with specific characteristics (e.g., high balance)
- Verifying if a customer exists before creating a new one


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
  - Simple format: { "Active": true, "limit": 10 }
  - Advanced format with operators: [{ "field": "DisplayName", "value": "John", "operator": "LIKE" }]
- limit (optional): Maximum number of results (default: unlimited)
- offset (optional): Number of records to skip for pagination
- asc (optional): Field name to sort ascending
- desc (optional): Field name to sort descending

**Supported fields:**
- Id, DisplayName, GivenName, FamilyName, CompanyName
- PrimaryEmailAddr, PrimaryPhone
- Balance, Active
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Example usage:**
1. Get all active customers (limit 10):
   {
     "criteria": { "Active": true, "limit": 10 }
   }

2. Search by name (partial match):
   {
     "criteria": [
       { "field": "DisplayName", "value": "John", "operator": "LIKE" }
     ],
     "limit": 20
   }

3. Find customers with balance > 0:
   {
     "criteria": [
       { "field": "Balance", "value": "0", "operator": ">" }
     ]
   }

4. Search by email:
   {
     "criteria": [
       { "field": "PrimaryEmailAddr", "value": "john@example.com" }
     ]
   }

5. Get customers sorted by name:
   {
     "criteria": { "Active": true },
     "asc": "DisplayName",
     "limit": 50
   }

6. Complex search - active customers with balance > 100:
   {
     "criteria": [
       { "field": "Active", "value": true },
       { "field": "Balance", "value": "100", "operator": ">" }
     ],
     "desc": "Balance"
   }

**Returns:**
- Array of customer objects matching the criteria`;

// Common Customer entity fields that are filterable. Not exhaustive – any
// property present on the QuickBooks Customer object is valid.
const customerFieldEnum = z
    .enum([
        "Id",
        "DisplayName",
        "GivenName",
        "FamilyName",
        "CompanyName",
        "PrimaryEmailAddr",
        "PrimaryPhone",
        "Balance",
        "Active",
        "MetaData.CreateTime",
        "MetaData.LastUpdatedTime",
    ])
    .describe(
        "Field to filter on – must be a property of the QuickBooks Online Customer entity."
    );

const criterionSchema = z.object({
    key: z
        .string()
        .describe("Simple key (legacy) – any Customer property name."),
    value: z.union([z.string(), z.boolean()]),
});

const advancedCriterionSchema = z.object({
    field: customerFieldEnum,
    value: z.union([z.string(), z.boolean()]),
    operator: z.enum(["=", "<", ">", "<=", ">=", "LIKE", "IN"]).optional(),
});

const inputSchema = {
    // Criteria can be passed as list of key/value/operator triples (array form)
    // or omitted for unfiltered search.
    criteria: z
        .array(advancedCriterionSchema.or(criterionSchema))
        .optional()
        .describe(
            "Filters to apply. Use the advanced form {field,value,operator?} for operators or the simple {key,value} pairs."
        ),

    // Pagination / sorting / count
    limit: z.number().optional(),
    offset: z.number().optional(),
    asc: z.string().optional(),
    desc: z.string().optional(),
    fetchAll: z.boolean().optional(),
    count: z.boolean().optional(),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const { criteria = [], ...options } = params ?? {};

    // Build criteria to send to SDK. If user provided the advanced array with field/operator/value
    // we pass it straight through. Otherwise we transform legacy {key,value} pairs to object.
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
            // original simple key/value list → map
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

    const response = await searchQuickbooksCustomers(criteriaToSend);
    if (response.isError) {
        const output = {
            success: false,
            error: response.error || "Unknown error occurred",
        };
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error searching customers: ${response.error}`,
                },
            ],
            structuredContent: output,
        };
    }

    const output = {
        success: true,
        data: response.result,
    };

    const resultText = Array.isArray(response.result)
        ? `Found ${response.result.length} customers`
        : `Count: ${response.result}`;

    return {
        content: [
            {
                type: "text" as const,
                text: `${resultText}\n${JSON.stringify(response.result, null, 2)}`,
            },
        ],
        structuredContent: output,
    };
};

export const SearchCustomersTool: ToolDefinition<
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
