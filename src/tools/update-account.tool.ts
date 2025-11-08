import { updateQuickbooksAccount } from "../handlers/update-quickbooks-account.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_account";
const toolTitle = "Update Account";
const toolDescription = `Update an existing Chart of Accounts entry in QuickBooks Online. Modify account names, descriptions, numbers, or status. Requires current SyncToken.

**Why use this tool:**
- Rename accounts for clarity
- Update account descriptions
- Change account numbers
- Deactivate unused accounts
- Correct account setup errors
- Update parent account relationships

**When to use:**
- Renaming accounts for better organization
- Updating account numbers to match new structure
- Deactivating old or unused accounts
- Correcting account descriptions
- Reorganizing chart of accounts hierarchy
- Fixing account configuration mistakes

**Required Parameters:**
- account_id: The QuickBooks ID of the account to update
- sync_token: Current version token (get from search_accounts or read operation)

**Updatable Fields:**
- Name: Account name
- Description: Account description
- AcctNum: Account number
- Active: true/false to activate/deactivate
- ParentRef: Parent account for sub-accounts

**Important:**
- Always get current SyncToken before updating
- Cannot change AccountType or AccountSubType after creation
- Cannot deactivate accounts with transactions (in some QB versions)
- Deactivating parent accounts may affect sub-accounts
- Account must not be in use to change certain properties

**Example usage:**
1. Rename account:
   {
     "account_id": "67",
     "sync_token": "2",
     "name": "Marketing & Advertising"
   }

2. Update account number:
   {
     "account_id": "67",
     "sync_token": "2",
     "acct_num": "5100"
   }

3. Deactivate account:
   {
     "account_id": "67",
     "sync_token": "2",
     "active": false
   }

4. Update description:
   {
     "account_id": "67",
     "sync_token": "2",
     "description": "All marketing expenses including digital and print advertising"
   }

5. Update multiple fields:
   {
     "account_id": "67",
     "sync_token": "2",
     "name": "Advertising Expense",
     "acct_num": "5200",
     "description": "Digital and traditional advertising costs"
   }

**Returns:**
- Updated Account object
- New SyncToken for subsequent updates
- All account details with changes applied
- MetaData with LastUpdatedTime
- CurrentBalance (unchanged by name/description updates)`;

const inputSchema = {
  account_id: z.string().min(1),
  patch: z.record(z.any()),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await updateQuickbooksAccount(params);
  if (response.isError) {
    const output = {
      success: false,
      error: response.error || "Unknown error occurred",
    };
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(output, null, 2),
        },
      ],
      structuredContent: output,
      isError: true,
    };
  }
  return {
    content: [
      { type: "text" as const, text: `Account updated successfully:` },
      { type: "text" as const, text: JSON.stringify(response.result, null, 2) },
    ],
  };
};

export const UpdateAccountTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 