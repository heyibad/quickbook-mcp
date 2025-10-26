import { createQuickbooksPurchase } from "../handlers/create-quickbooks-purchase.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "create_purchase";
const toolTitle = "Create Purchase";
const toolDescription = "Create a purchase in QuickBooks Online.";

// Define the expected input schema for creating a purchase
const inputSchema = {
  purchase: z.any(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await createQuickbooksPurchase(params.purchase);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error creating purchase: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Purchase created:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const CreatePurchaseTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 