import { searchQuickbooksVendors } from "../handlers/search-quickbooks-vendors.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_vendors";
const toolTitle = "Search Vendors";
const toolDescription = `Search and filter vendors in QuickBooks Online using various criteria like name, email, company, balance, 1099 status, and more. Supports advanced filtering with operators and pagination.

⚠️ **IMPORTANT**: This searches VENDORS (suppliers/payees), NOT accounts/customers/employees!
- To search accounts: use search_accounts
- To search customers: use search_customers
- To search employees: use search_employees

**Why use this tool:**
- Find vendors by name, email, or company before creating bills
- Get list of vendors for dropdown menus or selection lists
- Find 1099 contractors for tax reporting
- Search for vendors with outstanding balances
- Filter vendors by active/inactive status
- Generate vendor reports and analytics

**When to use:**
- Need to find a vendor by name before creating a bill
- Building a vendor selection interface
- Searching for 1099 contractors for year-end reporting
- Getting list of active vendors for expense tracking
- Finding vendors with specific characteristics
- Verifying if a vendor exists before creating a new one


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
  - Advanced format: [{ "field": "DisplayName", "value": "Tech", "operator": "LIKE" }]
- limit (optional): Maximum number of results
- offset (optional): Number of records to skip for pagination
- asc/desc (optional): Field name to sort by

**Supported fields:**
- Id, DisplayName, GivenName, FamilyName, CompanyName
- PrimaryEmailAddr, PrimaryPhone
- Balance, Active, Vendor1099
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Example usage:**
1. Get all active vendors (limit 10):
   { "criteria": { "Active": true, "limit": 10 } }

2. Search by name (partial match):
   {
     "criteria": [
       { "field": "DisplayName", "value": "Tech", "operator": "LIKE" }
     ]
   }

3. Find 1099 contractors:
   {
     "criteria": [
       { "field": "Vendor1099", "value": true }
     ]
   }

4. Find vendors with balance > 0:
   {
     "criteria": [
       { "field": "Balance", "value": "0", "operator": ">" }
     ]
   }

5. Search by email:
   {
     "criteria": [
       { "field": "PrimaryEmailAddr", "value": "billing@", "operator": "LIKE" }
     ]
   }

**Returns:**
- Array of vendor objects matching the criteria`;

// A subset of commonly-used Vendor fields that can be filtered on.
// This is *not* an exhaustive list, but provides helpful IntelliSense / docs
// to users of the tool. Any field returned in the Quickbooks Vendor entity is
// technically valid.
const vendorFieldEnum = z
    .enum([
        "Id",
        "SyncToken",
        "MetaData.CreateTime",
        "MetaData.LastUpdatedTime",
        "GivenName",
        "MiddleName",
        "FamilyName",
        "CompanyName",
        "DisplayName",
        "PrintOnCheckName",
        "Active",
        "PrimaryPhone",
        "AlternatePhone",
        "Mobile",
        "Fax",
        "PrimaryEmailAddr",
        "WebAddr",
        "Title",
        "Balance",
        "BillRate",
        "AcctNum",
        "Vendor1099",
    ])
    .describe(
        "Field to filter on – must be a property of the QuickBooks Online Vendor entity."
    );

const criterionSchema = z.object({
    key: z.string().describe("Simple key (legacy) – any Vendor property name."),
    value: z.union([z.string(), z.boolean()]),
});

// Advanced criterion schema with operator support.
const advancedCriterionSchema = z.object({
    field: vendorFieldEnum,
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
        .describe("Number of vendors found or count result"),
    vendors: z.array(z.any()).optional().describe("Array of vendor objects"),
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

    const response = await searchQuickbooksVendors(criteriaToSend);
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
        vendors: Array.isArray(response.result) ? response.result : undefined,
    };

    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const SearchVendorsTool: ToolDefinition<
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
