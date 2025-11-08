import { getQuickbooksEmployee } from "../handlers/get-quickbooks-employee.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "get_employee";
const toolTitle = "Get Employee";
const toolDescription = `Retrieve a specific employee record by ID from QuickBooks Online. Returns complete employee information including contact details, payroll info, and billing rates.

**Why use this tool:**
- View employee details and contact information
- Retrieve employee information for payroll processing
- Check employee billing rates for time tracking
- Verify employee status (active/inactive)
- Get employee data for reports
- Display employee profiles in applications

**When to use:**
- Displaying employee information in your application
- Verifying employee details before updates
- Generating employee reports
- Processing payroll for specific employee
- Checking employee billing rates
- Reviewing employee contact information

**Required Parameters:**
- Id: The QuickBooks ID of the employee to retrieve

**Example usage:**
1. Get employee by ID:
   { "Id": "55" }

2. Retrieve employee for payroll:
   { "Id": "89" }

3. Get employee billing information:
   { "Id": "123" }

**Returns:**
- Complete Employee object
- Personal information: GivenName, FamilyName, DisplayName
- Contact details: PrimaryEmailAddr, PrimaryPhone, Mobile
- Address information: PrimaryAddr
- Employment details: EmployeeNumber, HiredDate, ReleasedDate
- Billing information: BillableTime, BillRate
- Payroll information: SSN, BirthDate, Gender
- Active status
- MetaData with creation and update timestamps
- SyncToken for future updates`;

// Define the expected input schema for getting an employee
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
  const response = await getQuickbooksEmployee(params.id);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error getting employee: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Employee retrieved:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const GetEmployeeTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 