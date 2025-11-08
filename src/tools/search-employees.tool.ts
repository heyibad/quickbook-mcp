import { searchQuickbooksEmployees } from "../handlers/search-quickbooks-employees.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "search_employees";
const toolTitle = "Search Employees";
const toolDescription = `Search and filter employees in QuickBooks Online using various criteria like name, status, hire date, and more. Supports pagination and sorting.

**Why use this tool:**
- Find employees by name
- List active employees
- Search for employees by employee number
- Filter employees by hire date
- Get list of billable employees
- Generate employee rosters

**When to use:**
- Building employee dropdowns or lists
- Generating payroll reports
- Finding employees for time tracking
- Creating employee directories
- Filtering active vs inactive employees
- Searching for specific employees


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
- GivenName, FamilyName, DisplayName
- EmployeeNumber
- PrimaryEmailAddr
- Active (true/false)
- HiredDate, ReleasedDate
- BillableTime, BillRate
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Example usage:**
1. Get all active employees:
   {
     "criteria": [
       { "field": "Active", "value": "true" }
     ],
     "asc": "FamilyName"
   }

2. Search by name:
   {
     "criteria": [
       { "field": "GivenName", "value": "John", "operator": "LIKE" }
     ]
   }

3. Find employees by employee number:
   {
     "criteria": [
       { "field": "EmployeeNumber", "value": "EMP-1001" }
     ]
   }

4. Get billable employees:
   {
     "criteria": [
       { "field": "BillableTime", "value": "true" },
       { "field": "Active", "value": "true" }
     ],
     "desc": "BillRate"
   }

5. Find recently hired employees:
   {
     "criteria": [
       { "field": "HiredDate", "value": "2024-01-01", "operator": ">=" }
     ],
     "desc": "HiredDate"
   }

6. Get all employees (limit 50):
   { "criteria": {}, "limit": 50 }

**Returns:**
- Array of Employee objects matching criteria
- Each employee includes name, contact info, billing rates, status
- Employment dates and employee numbers`;

// Define the expected input schema for searching employees
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
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await searchQuickbooksEmployees(params);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error searching employees: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Employees found:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const SearchEmployeesTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 