import { deleteQuickbooksBill } from "../handlers/delete-quickbooks-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "delete-bill";
const toolTitle = "Delete-bill";
const toolDescription = "Delete a bill in QuickBooks Online.";
const inputSchema = {
  bill: z.object({
    Id: z.string(),
    SyncToken: z.string(),
  }),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
  const response = await deleteQuickbooksBill(args.bill);

  if (response.isError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error deleting bill: ${response.error}`,
        },
      ],
    };
  }

  const bill = response.result;

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(bill),
      }
    ],
  };
};

export const DeleteBillTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 