import { deleteQuickbooksJournalEntry } from "../handlers/delete-quickbooks-journal-entry.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "delete_journal_entry";
const toolTitle = "Delete Journal Entry";
const toolDescription = `Delete (void) a journal entry from QuickBooks Online. This removes the journal entry but maintains record in audit trail. Requires ID and SyncToken.

**Why use this tool:**
- Remove journal entries entered in error
- Void incorrect adjusting entries
- Delete duplicate journal entries
- Remove test entries
- Clean up erroneous postings
- Void entries made to wrong period

**When to use:**
- Journal entry was created in error
- Entry posted to wrong accounts
- Amounts were completely incorrect
- Entry was duplicate of another entry
- Entry was for testing purposes
- Need to remove and recreate entry

**Required Parameters:**
- Id: The QuickBooks ID of the journal entry to delete
- SyncToken: Current version token (get from get_journal_entry)

**Important:**
- Cannot delete journal entries after certain accounting periods closed
- Always get current SyncToken before deleting
- Deletion is permanent but appears in audit trail
- Consider creating reversing entry instead of deletion
- Better to reverse than delete for audit purposes

**Example usage:**
1. Delete journal entry by ID:
   {
     "Id": "456",
     "SyncToken": "3"
   }

2. Void incorrect entry:
   {
     "Id": "789",
     "SyncToken": "1"
   }

3. Remove duplicate entry:
   {
     "Id": "123",
     "SyncToken": "0"
   }

**Returns:**
- Deleted JournalEntry object with status "Deleted"
- Confirmation of deletion
- Original journal entry details for reference

**Alternative Approach:**
Instead of deleting, consider creating a reversing entry:
1. Get the original journal entry
2. Create new entry with opposite debits/credits:
   - Original debits become credits
   - Original credits become debits
   - Same amounts and accounts
   - Same or next period date
3. Add note referencing original entry
4. This maintains complete audit trail`;

// Define the expected input schema for deleting a journal entry
const inputSchema = {
  idOrEntity: z.any(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await deleteQuickbooksJournalEntry(params.idOrEntity);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error deleting journal entry: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Journal entry deleted:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const DeleteJournalEntryTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 