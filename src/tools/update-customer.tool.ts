import { updateQuickbooksCustomer } from "../handlers/update-quickbooks-customer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_customer";
const toolTitle = "Update Customer";
const toolDescription = "Update an existing customer in QuickBooks Online.";

const inputSchema = {
    customer: z.any().describe("Customer object with updated fields"),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    customer: z.any().optional().describe("The updated customer object"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await updateQuickbooksCustomer(params.customer);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error updating customer: ${response.error}`,
                    structured: {
                        success: false,
                        error: response.error || "Unknown error occurred",
                    }
                },
            ],
        };
    }

    return {
        content: [
            { 
                type: "text" as const, 
                text: `Customer updated successfully: ${JSON.stringify(response.result, null, 2)}`,
                structured: {
                    success: true,
                    customer: response.result,
                }
            },
        ],
    };
};

export const UpdateCustomerTool: ToolDefinition<
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
