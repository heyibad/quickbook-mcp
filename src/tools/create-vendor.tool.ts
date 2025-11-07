import { createQuickbooksVendor } from "../handlers/create-quickbooks-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create-vendor";
const toolTitle = "Create-vendor";
const toolDescription = "Create a vendor in QuickBooks Online.";
const inputSchema = {
  vendor: z.object({
    DisplayName: z.string(),
    GivenName: z.string().optional(),
    FamilyName: z.string().optional(),
    CompanyName: z.string().optional(),
    PrimaryEmailAddr: z.object({
      Address: z.string().optional(),
    }).optional(),
    PrimaryPhone: z.object({
      FreeFormNumber: z.string().optional(),
    }).optional(),
    BillAddr: z.object({
      Line1: z.string().optional(),
      City: z.string().optional(),
      Country: z.string().optional(),
      CountrySubDivisionCode: z.string().optional(),
      PostalCode: z.string().optional(),
    }).optional(),
  }),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
  const response = await createQuickbooksVendor(args.vendor);

  if (response.isError) {
    const output = {
      success: false,
      error: response.error || "Unknown error",
    };
    return {
      content: [
        {
          type: "text" as const,
          text: `Error creating vendor: ${response.error}`,
        },
      ],
      structuredContent: output,
    };
  }

  const output = {
    success: true,
    data: response.result,
  };
  return {
    content: [
      {
        type: "text" as const,
        text: `Vendor created successfully: ${JSON.stringify(response.result, null, 2)}`,
      }
    ],
    structuredContent: output,
  };
};

export const CreateVendorTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 