import { updateQuickbooksJournalEntry } from "../handlers/update-quickbooks-journal-entry.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "update_journal_entry";
const toolTitle = "Update Journal Entry";
const toolDescription = `Update an existing journal entry in QuickBooks Online to modify amounts, accounts, dates, or line items. Journal entries must remain balanced (debits = credits). Requires current SyncToken.

**Why use this tool:**
- Correct journal entry amounts
- Update posting dates
- Change account assignments
- Modify entry descriptions
- Fix imbalanced entries
- Update adjusting entries

**When to use:**
- Correcting journal entry errors
- Updating amounts in period-end entries
- Changing accounts after review
- Modifying entry dates
- Fixing posting errors
- Updating descriptions for clarity

**Required Parameters:**
- Id: The QuickBooks ID of the journal entry to update
- SyncToken: Current version token (get from get_journal_entry)
- sparse: Set to true for partial updates

**Updatable Fields:**
- TxnDate: Transaction date
- PrivateNote: Internal description
- DocNumber: Journal entry number
- Line: Array of journal entry lines
- Adjustment: true/false flag

**Important:**
- Always get current SyncToken before updating
- Total debits must equal total credits
- All amounts remain positive (PostingType determines debit/credit)
- Include complete Line array when updating lines
- Use sparse=true for partial updates

**Example usage:**
1. Update transaction date:
   {
     "Id": "456",
     "SyncToken": "2",
     "sparse": true,
     "TxnDate": "2024-01-31"
   }

2. Update private note:
   {
     "Id": "456",
     "SyncToken": "2",
     "sparse": true,
     "PrivateNote": "Updated description - January accrual"
   }

3. Update line amounts (must balance):
   {
     "Id": "456",
     "SyncToken": "2",
     "sparse": true,
     "Line": [
       {
         "Id": "1",
         "DetailType": "JournalEntryLineDetail",
         "Amount": 600.00,
         "Description": "Utilities expense - updated",
         "JournalEntryLineDetail": {
           "PostingType": "Debit",
           "AccountRef": { "value": "65" }
         }
       },
       {
         "Id": "2",
         "DetailType": "JournalEntryLineDetail",
         "Amount": 600.00,
         "Description": "Accrued utilities - updated",
         "JournalEntryLineDetail": {
           "PostingType": "Credit",
           "AccountRef": { "value": "28" }
         }
       }
     ]
   }

4. Change account assignment:
   {
     "Id": "456",
     "SyncToken": "2",
     "sparse": true,
     "Line": [
       {
         "Id": "1",
         "DetailType": "JournalEntryLineDetail",
         "Amount": 500.00,
         "JournalEntryLineDetail": {
           "PostingType": "Debit",
           "AccountRef": { "value": "68" }
         }
       },
       {
         "Id": "2",
         "DetailType": "JournalEntryLineDetail",
         "Amount": 500.00,
         "JournalEntryLineDetail": {
           "PostingType": "Credit",
           "AccountRef": { "value": "28" }
         }
       }
     ]
   }

**Returns:**
- Updated JournalEntry object
- New SyncToken for subsequent updates
- All journal entry details with changes applied
- Balanced debits and credits
- MetaData with LastUpdatedTime`;

// Define the expected input schema for updating a journal entry
const inputSchema = {
    journalEntry: z.any(),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

// Define the tool handler
const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await updateQuickbooksJournalEntry(params.journalEntry);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error updating journal entry: ${response.error}`,
                },
            ],
        };
    }

    return {
        content: [
            { type: "text" as const, text: `Journal entry updated:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const UpdateJournalEntryTool: ToolDefinition<
    typeof inputSchema,
    typeof outputSchema
> = {
    name: toolName,
    title: toolTitle,
    description: toolDescription,
    inputSchema: inputSchema,
    outputSchema: outputSchema,
    handler: toolHandler,
};
