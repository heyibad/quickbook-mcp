import { createQuickbooksAccount } from "../handlers/create-quickbooks-account.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_account";
const toolTitle = "Create Account";
const toolDescription = `Create a new Chart of Accounts entry in QuickBooks Online. Accounts are used to categorize and track financial transactions across all areas of the business.

**Why use this tool:**
- Add new accounts to your chart of accounts
- Create specific accounts for tracking income/expenses
- Set up bank or credit card accounts
- Establish asset or liability accounts
- Create equity accounts for ownership tracking
- Build customized chart of accounts structure

**When to use:**
- Setting up new bank accounts in QuickBooks
- Creating expense categories for better tracking
- Adding income accounts for revenue streams
- Establishing asset accounts for fixed assets
- Creating liability accounts for loans/payables
- Customizing chart of accounts for your business

**Required Parameters:**
- name: Account name (e.g., "Office Supplies Expense")
- account_type: Account type from QuickBooks list
- account_sub_type: Sub-type providing more specific classification

**Optional Parameters:**
- description: Account description
- acct_num: Account number for organizing
- parent_ref: Parent account ID for sub-accounts
- currency_ref: Currency for multi-currency (defaults to home currency)

**Account Types:**
- **Asset**: Bank, Other Current Asset, Fixed Asset, Other Asset
- **Liability**: Accounts Payable, Credit Card, Other Current Liability, Long Term Liability
- **Equity**: Equity
- **Income**: Income, Other Income
- **Expense**: Expense, Other Expense, Cost of Goods Sold

**Example usage:**
1. Create expense account:
   {
     "name": "Marketing Expense",
     "account_type": "Expense",
     "account_sub_type": "AdvertisingPromotional",
     "description": "Marketing and advertising costs"
   }

2. Create bank account:
   {
     "name": "Business Checking",
     "account_type": "Bank",
     "account_sub_type": "Checking",
     "acct_num": "1000"
   }

3. Create income account:
   {
     "name": "Consulting Revenue",
     "account_type": "Income",
     "account_sub_type": "ServiceFeeIncome",
     "description": "Revenue from consulting services"
   }

4. Create sub-account:
   {
     "name": "Office Rent",
     "account_type": "Expense",
     "account_sub_type": "Rent",
     "parent_ref": { "value": "67" }
   }

5. Create credit card account:
   {
     "name": "Business Credit Card",
     "account_type": "Credit Card",
     "account_sub_type": "CreditCard",
     "acct_num": "2000"
   }

**Returns:**
- Created Account object with QuickBooks-assigned ID
- Account details including Name, AccountType, AccountSubType
- Active status (defaults to true)
- CurrentBalance (starts at 0)
- MetaData with creation timestamp
- SyncToken for future updates`;

const inputSchema = {
    name: z.string().min(1),
    type: z.string().min(1),
    sub_type: z.string().optional(),
    description: z.string().optional(),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await createQuickbooksAccount(params);
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
            { type: "text" as const, text: `Account created successfully:` },
            {
                type: "text" as const,
                text: JSON.stringify(response.result, null, 2),
            },
        ],
    };
};

export const CreateAccountTool: ToolDefinition<
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
