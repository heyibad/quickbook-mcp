import { getQuickbooksCustomer } from "../handlers/get-quickbooks-customer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get_customer";
const toolTitle = "Get Customer";
const toolDescription = "Get a customer by Id from QuickBooks Online.";

const inputSchema = {
    id: z.string().describe("The ID of the customer to retrieve"),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    customer: z.any().optional().describe("The customer object"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await getQuickbooksCustomer(params.id);

    if (response.isError) {
        const output = {
            success: false,
            error: response.error || "Unknown error",
        };
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error getting customer: ${response.error}`,
                },
            ],
            structuredContent: output,
        };
    }

    const output = {
        success: true,
        customer: response.result,
    };
    return {
        content: [
            {
                type: "text" as const,
                text: `Customer retrieved successfully: ${JSON.stringify(response.result, null, 2)}`,
            },
        ],
        structuredContent: output,
    };
};

export const GetCustomerTool: ToolDefinition<
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
