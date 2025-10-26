import { getQuickbooksVendor } from "../handlers/get-quickbooks-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "get-vendor";
const toolTitle = "Get-vendor";
const toolDescription = "Get a vendor by ID from QuickBooks Online.";
const inputSchema = {
  id: z.string(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
  const response = await getQuickbooksVendor(args.id);

  if (response.isError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error getting vendor: ${response.error}`,
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

export const GetVendorTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 