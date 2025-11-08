import { searchQuickbooksJournalEntries } from "../handlers/search-quickbooks-journal-entries.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "search_journal_entries";
const toolTitle = "Search Journal Entries";
const toolDescription = `Search and filter journal entries in QuickBooks Online using various criteria like date, amount, account, and adjustment status. Supports pagination and sorting.

**Why use this tool:**
- Find journal entries by date or period
- List adjusting entries
- Search for entries affecting specific accounts
- Filter entries by amount
- Find depreciation or accrual entries
- Generate journal entry reports

**When to use:**
- Reviewing period-end adjustments
- Finding entries for specific accounts
- Generating audit trails
- Searching for adjusting entries
- Listing recent journal entries
- Building accounting reports


**IMPORTANT - Three Input Formats:**

Format 1 - Pagination only: { "limit": 10, "desc": "MetaData.CreateTime" }
Format 2 - Array with operators: [{ "field": "FieldName", "value": "value", "operator": ">" }, { "field": "limit", "value": 10 }]
Format 3 - Advanced with filters key: { "filters": [{ "field": "FieldName", "value": "value", "operator": ">" }], "limit": 10 }

**CRITICAL RULES:**
1. For pagination ONLY, use Format 1 or Format 3 with empty filters
2. For simple filters WITHOUT pagination, use: { "FieldName": "value" }
3. NEVER mix filter fields with reserved keywords (limit, offset, asc, desc, count, fetchAll, filters) in simple object format
4. When combining filters with pagination, use Format 2 (array) or Format 3 (filters key)
5. For operators (>, <, >=, <=, LIKE, IN), use Format 2 or Format 3

**Reserved Keywords:** limit, offset, asc, desc, count, fetchAll, filters

See SEARCH_TOOLS_USAGE_GUIDE.md for detailed examples.


**Parameters:**
- criteria (optional): Array of filter objects OR simple key-value object
- limit (optional): Maximum number of results
- offset (optional): Number of records to skip for pagination
- asc/desc (optional): Field name to sort by

**Supported fields:**
- TxnDate: Transaction date
- DocNumber: Journal entry number
- Adjustment: true/false (adjusting entries)
- TotalAmt: Total transaction amount
- PrivateNote: Entry description
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Example usage:**
1. Get all journal entries (limit 20):
   { "criteria": {}, "limit": 20 }

2. Find adjusting entries:
   {
     "criteria": [
       { "field": "Adjustment", "value": "true" }
     ],
     "desc": "TxnDate"
   }

3. Find entries by date range:
   {
     "criteria": [
       { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" },
       { "field": "TxnDate", "value": "2024-01-31", "operator": "<=" }
     ]
   }

4. Search entries by description:
   {
     "criteria": [
       { "field": "PrivateNote", "value": "depreciation", "operator": "LIKE" }
     ]
   }

5. Find entries by amount:
   {
     "criteria": [
       { "field": "TotalAmt", "value": "1000", "operator": ">=" }
     ],
     "desc": "TotalAmt"
   }

6. Find entries from specific month:
   {
     "criteria": [
       { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" },
       { "field": "TxnDate", "value": "2024-01-31", "operator": "<=" },
       { "field": "Adjustment", "value": "true" }
     ]
   }

7. Get recent entries:
   {
     "criteria": {},
     "desc": "MetaData.CreateTime",
     "limit": 10
   }

**Returns:**
- Array of JournalEntry objects matching criteria
- Each entry includes date, amounts, line items
- Debit and credit details with accounts
- Adjustment status and descriptions`;

// Define the expected input schema for searching journal entries
const inputSchema = {
    criteria: z.array(z.any()).optional(),
    asc: z.string().optional(),
    desc: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    count: z.boolean().optional(),
    fetchAll: z.boolean().optional(),
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
    const response = await searchQuickbooksJournalEntries(params);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error searching journal entries: ${response.error}`,
                },
            ],
        };
    }

    return {
        content: [
            { type: "text" as const, text: `Journal entries found:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const SearchJournalEntriesTool: ToolDefinition<
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
