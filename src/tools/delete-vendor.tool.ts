import { deleteQuickbooksVendor } from "../handlers/delete-quickbooks-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "delete-vendor";
const toolTitle = "Delete-vendor";
const toolDescription = "Delete a vendor in QuickBooks Online.";
const inputSchema = {
  vendor: z.object({
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
  const response = await deleteQuickbooksVendor(args.vendor);

  if (response.isError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error deleting vendor: ${response.error}`,
        },
      ],
    };
  }

  const vendor = response.result;

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(vendor),
      }
    ],
  };
};

export const DeleteVendorTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 