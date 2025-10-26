import { getQuickbooksJournalEntry } from "../handlers/get-quickbooks-journal-entry.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "get_journal_entry";
const toolTitle = "Get Journal Entry";
const toolDescription = "Get a journal entry by Id from QuickBooks Online.";

// Define the expected input schema for getting a journal entry
const inputSchema = {
  id: z.string(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await getQuickbooksJournalEntry(params.id);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error getting journal entry: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Journal entry retrieved:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const GetJournalEntryTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 