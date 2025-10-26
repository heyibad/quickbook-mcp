import { updateQuickbooksBillPayment } from "../handlers/update-quickbooks-bill-payment.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "update_bill_payment";
const toolTitle = "Update Bill Payment";
const toolDescription = "Update a bill payment in QuickBooks Online.";

// Define the expected input schema for updating a bill payment
const inputSchema = {
  billPayment: z.any(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await updateQuickbooksBillPayment(params.billPayment);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error updating bill payment: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Bill payment updated:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const UpdateBillPaymentTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 