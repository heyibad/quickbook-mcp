import { deleteQuickbooksCustomer } from "../handlers/delete-quickbooks-customer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "delete_customer";
const toolTitle = "Delete Customer";
const toolDescription =
    "Delete (make inactive) a customer in QuickBooks Online.";

const inputSchema = {
    idOrEntity: z
        .any()
        .describe("Customer ID (string) or customer entity object to delete"),
};

const outputSchema = {
    success: z
        .boolean()
        .describe("Whether the customer was deleted successfully"),
    customer: z.any().optional().describe("The deleted customer object"),
    error: z.string().optional().describe("Error message if deletion failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await deleteQuickbooksCustomer(params.idOrEntity);

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
        customer: response.result,
    };
    return {
        content: [
            { type: "text" as const, text: JSON.stringify(output, null, 2) },
        ],
        structuredContent: output,
    };
};

export const DeleteCustomerTool: ToolDefinition<
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
