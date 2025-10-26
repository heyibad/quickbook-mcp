import { updateQuickbooksAccount } from "../handlers/update-quickbooks-account.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_account";
const toolTitle = "Update Account";
const toolDescription = "Update an existing chart‑of‑accounts entry in Quickbooks.";

const inputSchema = {
  account_id: z.string().min(1),
  patch: z.record(z.any()),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await updateQuickbooksAccount(params);
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
      { type: "text" as const, text: `Account updated successfully:` },
      { type: "text" as const, text: JSON.stringify(response.result, null, 2) },
    ],
  };
};

export const UpdateAccountTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 