import { searchQuickbooksVendors } from "../handlers/search-quickbooks-vendors.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_vendors";
const toolTitle = "Search Vendors";
const toolDescription =
    "Search vendors in QuickBooks Online that match given criteria.";

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
