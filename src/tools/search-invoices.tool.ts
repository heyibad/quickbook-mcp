import { searchQuickbooksInvoices } from "../handlers/search-quickbooks-invoices.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_invoices";
const toolDescription =
    "Search invoices in QuickBooks Online using criteria (maps to node-quickbooks findInvoices).";

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
