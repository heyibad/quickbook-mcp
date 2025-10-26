import { searchQuickbooksAccounts } from "../handlers/search-quickbooks-accounts.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_accounts";
const toolTitle = "Search Accounts";
const toolDescription = "Search chart‑of‑accounts entries using criteria.";

// Allowed field lists based on QuickBooks Online Account entity documentation. Only these can be
// used in the search criteria.
const ALLOWED_FILTER_FIELDS = [
    "Id",
    "MetaData.CreateTime",
    "MetaData.LastUpdatedTime",
    "Name",
    "SubAccount",
    "ParentRef",
    "Description",
    "Active",
    "Classification",
    "AccountType",
    "CurrentBalance",
] as const;

const ALLOWED_SORT_FIELDS = [
    "Id",
    "MetaData.CreateTime",
    "MetaData.LastUpdatedTime",
    "Name",
    "SubAccount",
    "ParentRef",
    "Description",
    "CurrentBalance",
] as const;

// BEGIN ADD FIELD TYPE MAP
const ACCOUNT_FIELD_TYPE_MAP: Record<
    string,
    "string" | "number" | "boolean" | "date"
> = {
    Id: "string",
    "MetaData.CreateTime": "date",
    "MetaData.LastUpdatedTime": "date",
    Name: "string",
    SubAccount: "boolean",
    ParentRef: "string",
    Description: "string",
    Active: "boolean",
    Classification: "string",
    AccountType: "string",
    CurrentBalance: "number",
};

function isValidValueType(field: string, value: any): boolean {
    const expected = ACCOUNT_FIELD_TYPE_MAP[field];
    if (!expected) return true; // If field not in map, skip type check.
    switch (expected) {
        case "string":
            return typeof value === "string";
        case "number":
            return typeof value === "number";
        case "boolean":
            return typeof value === "boolean";
        case "date":
            return typeof value === "string"; // assume ISO date string
        default:
            return true;
    }
}
// END ADD FIELD TYPE MAP

// Zod schemas that validate the fields against the above white-lists
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

// Advanced criteria shape
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
        if (!isValidValueType(obj.field, obj.value)) {
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

// Runtime schema keeps full validation
const RUNTIME_CRITERIA_SCHEMA = z.union([
    z.record(z.any()),
    z.array(z.record(z.any())),
    advancedCriteriaSchema,
]);

// ---------- Coercion & Normalization ----------
function coerceAccountFieldValue(field: string, value: any): any {
    const expected =
        ACCOUNT_FIELD_TYPE_MAP[field as keyof typeof ACCOUNT_FIELD_TYPE_MAP];
    if (!expected) return value;

    const convert = (v: any): any => {
        switch (expected) {
            case "string":
                return typeof v === "string" ? v : String(v);
            case "number":
                return typeof v === "number" ? v : Number(v);
            case "boolean":
                return typeof v === "boolean"
                    ? v
                    : v === "true" || v === 1 || v === "1";
            case "date":
                return typeof v === "string" ? v : String(v);
            default:
                return v;
        }
    };
    return Array.isArray(value) ? value.map(convert) : convert(value);
}

function normalizeAccountCriteria(criteria: any): any {
    if (!criteria) return criteria;

    // Advanced format with filters
    if (criteria.filters && Array.isArray(criteria.filters)) {
        return {
            ...criteria,
            filters: criteria.filters.map((f: any) => ({
                ...f,
                value: coerceAccountFieldValue(f.field, f.value),
            })),
        };
    }

    // Array of criteria objects
    if (Array.isArray(criteria)) {
        return criteria.map(normalizeAccountCriteria);
    }

    // Simple key-value map criteria
    if (typeof criteria === "object") {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(criteria)) {
            out[k] = coerceAccountFieldValue(k, v);
        }
        return out;
    }

    return criteria;
}

// Schema exposed to function definition – use broad schema to sidestep $ref errors
const inputSchema = {
    criteria: z.any().describe("Search criteria for accounts"),
};

const outputSchema = {
    success: z.boolean().describe("Whether the search was successful"),
    count: z.number().optional().describe("Number of accounts found"),
    accounts: z.array(z.any()).optional().describe("Array of account objects"),
    error: z.string().optional().describe("Error message if search failed"),
};

// Tool handler with runtime validation & coercion
const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const { criteria } = params;
    const parsed = RUNTIME_CRITERIA_SCHEMA.safeParse(criteria);
    if (!parsed.success) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Invalid criteria: ${parsed.error.message}`,
                },
            ],
        };
    }
    const normalized = normalizeAccountCriteria(criteria);
    const response = await searchQuickbooksAccounts(normalized);

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

    const accounts = response.result;
    const output = {
        success: true,
        count: accounts?.length || 0,
        accounts: accounts || undefined,
    };

    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

// Update export
export const SearchAccountsTool: ToolDefinition<
    typeof inputSchema,
    typeof outputSchema
> = {
    name: toolName,
    description: toolDescription,
    inputSchema: inputSchema,
    outputSchema: outputSchema,
    title: toolTitle,
    handler: toolHandler,
};
