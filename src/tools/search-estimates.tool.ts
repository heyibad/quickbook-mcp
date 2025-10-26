import { searchQuickbooksEstimates } from "../handlers/search-quickbooks-estimates.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_estimates";
const toolTitle = "Search Estimates";
const toolDescription =
    "Search estimates in QuickBooks Online that match given criteria.";

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
