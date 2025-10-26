import { updateQuickbooksBill } from "../handlers/update-quickbooks-bill.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update-bill";
const toolTitle = "Update-bill";
const toolDescription = "Update a bill in QuickBooks Online.";
const inputSchema = {
  bill: z.object({
    Id: z.string(),
    Line: z.array(z.object({
      Amount: z.number(),
      DetailType: z.string(),
      Description: z.string(),
      AccountRef: z.object({
        value: z.string(),
        name: z.string().optional(),
      }),
    })),
    VendorRef: z.object({
      value: z.string(),
      name: z.string().optional(),
    }),
    DueDate: z.string(),
    Balance: z.number(),
    TotalAmt: z.number(),
  }),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
  const response = await updateQuickbooksBill(args.bill);

  if (response.isError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error updating bill: ${response.error}`,
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

export const UpdateBillTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 