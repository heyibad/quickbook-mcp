import { createQuickbooksJournalEntry } from "../handlers/create-quickbooks-journal-entry.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "create_journal_entry";
const toolTitle = "Create Journal Entry";
const toolDescription = `Create a journal entry in QuickBooks Online for manual accounting adjustments, accruals, deferrals, and other double-entry bookkeeping transactions. Journal entries must always balance (debits = credits).

**Why use this tool:**
- Record manual accounting adjustments
- Create accrual and deferral entries
- Record depreciation expenses
- Make period-end closing entries
- Correct account balances
- Record transactions not covered by standard forms

**When to use:**
- Making accounting adjustments at period end
- Recording depreciation or amortization
- Creating accrual entries for expenses or revenue
- Correcting posting errors to wrong accounts
- Recording non-cash transactions
- Making reclassification entries

**Required Parameters:**
- Line: Array of journal entry lines (must have debits and credits that balance)

**Optional Parameters:**
- TxnDate: Transaction date (defaults to today)
- PrivateNote: Internal description of the entry
- DocNumber: Journal entry number (auto-generated if omitted)
- Adjustment: true/false (marks as adjusting entry)
- CurrencyRef: Currency for multi-currency

**Line Item Structure:**
- DetailType: "JournalEntryLineDetail"
- Amount: Dollar amount (always positive)
- Description: Line description
- JournalEntryLineDetail:
  - PostingType: "Debit" or "Credit"
  - AccountRef: { value: "account_id" }
  - ClassRef: Optional class for tracking
  - DepartmentRef: Optional department

**Important Rules:**
- Total debits MUST equal total credits
- All amounts are positive (posting type determines debit/credit)
- Cannot use accounts restricted from journal entries
- Must have at least 2 lines (one debit, one credit)

**Example usage:**
1. Simple journal entry (debit expense, credit liability):
   {
     "TxnDate": "2024-01-31",
     "PrivateNote": "Accrue January utilities",
     "Line": [
       {
         "DetailType": "JournalEntryLineDetail",
         "Amount": 500.00,
         "Description": "Utilities expense",
         "JournalEntryLineDetail": {
           "PostingType": "Debit",
           "AccountRef": { "value": "65" }
         }
       },
       {
         "DetailType": "JournalEntryLineDetail",
         "Amount": 500.00,
         "Description": "Accrued utilities",
         "JournalEntryLineDetail": {
           "PostingType": "Credit",
           "AccountRef": { "value": "28" }
         }
       }
     ]
   }

2. Depreciation entry:
   {
     "TxnDate": "2024-01-31",
     "PrivateNote": "Monthly depreciation - Equipment",
     "Adjustment": true,
     "Line": [
       {
         "DetailType": "JournalEntryLineDetail",
         "Amount": 833.33,
         "Description": "Depreciation expense",
         "JournalEntryLineDetail": {
           "PostingType": "Debit",
           "AccountRef": { "value": "72" }
         }
       },
       {
         "DetailType": "JournalEntryLineDetail",
         "Amount": 833.33,
         "Description": "Accumulated depreciation",
         "JournalEntryLineDetail": {
           "PostingType": "Credit",
           "AccountRef": { "value": "16" }
         }
       }
     ]
   }

3. Multi-line entry (split one credit across multiple debits):
   {
     "TxnDate": "2024-01-31",
     "PrivateNote": "Reclassify expenses",
     "Line": [
       {
         "DetailType": "JournalEntryLineDetail",
         "Amount": 300.00,
         "Description": "Marketing expense",
         "JournalEntryLineDetail": {
           "PostingType": "Debit",
           "AccountRef": { "value": "45" }
         }
       },
       {
         "DetailType": "JournalEntryLineDetail",
         "Amount": 200.00,
         "Description": "Travel expense",
         "JournalEntryLineDetail": {
           "PostingType": "Debit",
           "AccountRef": { "value": "48" }
         }
       },
       {
         "DetailType": "JournalEntryLineDetail",
         "Amount": 500.00,
         "Description": "General expense - correction",
         "JournalEntryLineDetail": {
           "PostingType": "Credit",
           "AccountRef": { "value": "50" }
         }
       }
     ]
   }

**Returns:**
- Created JournalEntry object with QuickBooks-assigned ID
- All line items with debits and credits
- Total debit and credit amounts (must be equal)
- MetaData with creation timestamp
- SyncToken for future updates`;

// Define the expected input schema for creating a journal entry
const inputSchema = {
  journalEntry: z.any(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await createQuickbooksJournalEntry(params.journalEntry);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error creating journal entry: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Journal entry created:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const CreateJournalEntryTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 