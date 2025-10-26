import { updateQuickbooksItem } from "../handlers/update-quickbooks-item.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_item";
const toolTitle = "Update Item";
const toolDescription = "Update an existing item in Quickbooks by ID (sparse update).";

const inputSchema = {
  item_id: z.string().min(1),
  patch: z.record(z.any()),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await updateQuickbooksItem(params);
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
  return {
    content: [
      { type: "text" as const, text: `Item updated successfully:` },
      { type: "text" as const, text: JSON.stringify(response.result, null, 2) },
    ],
  };
};

export const UpdateItemTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 