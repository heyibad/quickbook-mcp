import { getQuickbooksJournalEntry } from "../handlers/get-quickbooks-journal-entry.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "get_journal_entry";
const toolTitle = "Get Journal Entry";
const toolDescription = `Retrieve a specific journal entry by ID from QuickBooks Online. Returns complete journal entry details including all debit and credit lines with accounts and amounts.

**Why use this tool:**
- View journal entry details
- Verify debits and credits balance
- Review accounting adjustments
- Check journal entry accounts and amounts
- Display journal entry information
- Retrieve entry before updating or reversing

**When to use:**
- Displaying journal entry details in applications
- Verifying journal entries before updates
- Reviewing period-end adjustments
- Checking depreciation or accrual entries
- Analyzing account postings
- Preparing to reverse entries

**Required Parameters:**
- Id: The QuickBooks ID of the journal entry to retrieve

**Example usage:**
1. Get journal entry by ID:
   { "Id": "456" }

2. Retrieve adjustment entry:
   { "Id": "789" }

3. Get depreciation entry:
   { "Id": "123" }

**Returns:**
- Complete JournalEntry object
- TxnDate: Transaction date
- DocNumber: Journal entry number
- PrivateNote: Entry description
- Adjustment: Whether it's an adjusting entry
- Line items including:
  - Amount for each line
  - Description
  - PostingType: Debit or Credit
  - AccountRef with account details
  - ClassRef and DepartmentRef if assigned
- TotalAmt: Total transaction amount
- HomeTotalAmt: Amount in home currency
- MetaData with creation and update timestamps
- SyncToken for future updates`;

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