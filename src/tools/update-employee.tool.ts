import { updateQuickbooksEmployee } from "../handlers/update-quickbooks-employee.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "update_employee";
const toolTitle = "Update Employee";
const toolDescription = `Update an existing employee record in QuickBooks Online to modify personal information, contact details, billing rates, or employment status. Requires the current SyncToken.

**Why use this tool:**
- Update employee contact information
- Change employee billing rates
- Update employment dates (hire/release)
- Modify employee status (active/inactive)
- Update address and phone information
- Change employee display name or employee number

**When to use:**
- Employee changes contact information
- Adjusting billing rates for employees
- Recording employee termination date
- Updating employee addresses after relocation
- Correcting employee information errors
- Changing employee status to inactive

**Required Parameters:**
- Id: The QuickBooks ID of the employee to update
- SyncToken: Current version token (get from get_employee)
- sparse: Set to true for partial updates

**Updatable Fields:**
- GivenName, FamilyName, DisplayName
- PrimaryEmailAddr, PrimaryPhone, Mobile
- PrimaryAddr (address information)
- EmployeeNumber
- BillableTime, BillRate
- HiredDate, ReleasedDate
- Active status (to deactivate employee)
- SSN, BirthDate, Gender

**Important:**
- Always get current SyncToken before updating
- Use sparse=true to update specific fields only
- Cannot change employee to different person (use new employee instead)
- Setting Active=false deactivates employee

**Example usage:**
1. Update email address:
   {
     "Id": "55",
     "SyncToken": "2",
     "sparse": true,
     "PrimaryEmailAddr": { "Address": "newemail@company.com" }
   }

2. Update billing rate:
   {
     "Id": "55",
     "SyncToken": "2",
     "sparse": true,
     "BillRate": 95.00
   }

3. Record employee termination:
   {
     "Id": "55",
     "SyncToken": "2",
     "sparse": true,
     "ReleasedDate": "2024-12-31",
     "Active": false
   }

4. Update phone number:
   {
     "Id": "55",
     "SyncToken": "2",
     "sparse": true,
     "PrimaryPhone": { "FreeFormNumber": "(555) 999-8888" }
   }

5. Update address:
   {
     "Id": "55",
     "SyncToken": "2",
     "sparse": true,
     "PrimaryAddr": {
       "Line1": "456 New St",
       "City": "Boston",
       "CountrySubDivisionCode": "MA",
       "PostalCode": "02101"
     }
   }

**Returns:**
- Updated Employee object
- New SyncToken for subsequent updates
- All employee details with changes applied
- MetaData with LastUpdatedTime`;

// Define the expected input schema for updating an employee
const inputSchema = {
    employee: z.any(),
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
    const response = await updateQuickbooksEmployee(params.employee);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error updating employee: ${response.error}`,
                },
            ],
        };
    }

    return {
        content: [
            { type: "text" as const, text: `Employee updated:` },
            { type: "text" as const, text: JSON.stringify(response.result) },
        ],
    };
};

export const UpdateEmployeeTool: ToolDefinition<
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
