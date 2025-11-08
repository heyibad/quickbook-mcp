import { createQuickbooksEmployee } from "../handlers/create-quickbooks-employee.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "create_employee";
const toolTitle = "Create Employee";
const toolDescription = `Create a new employee record in QuickBooks Online. This is essential for payroll processing, time tracking, and expense management.

**Why use this tool:**
- Add new employees to your organization
- Set up employee records for payroll processing
- Create employee profiles for time tracking
- Enable employee expense reimbursement
- Maintain employee contact information
- Track employee status (active/inactive)

**When to use:**
- Onboarding new employees
- Setting up payroll for new hires
- Creating employee records for time tracking
- Enabling employee access to expense reporting
- Importing employee data from other systems
- Establishing employee database in QuickBooks

**Required Parameters:**
- GivenName: Employee's first name
- FamilyName: Employee's last name

**Optional Parameters:**
- DisplayName: Name displayed in QuickBooks (defaults to GivenName + FamilyName)
- PrimaryEmailAddr: Employee email address
- PrimaryPhone: Employee phone number
- Mobile: Employee mobile number
- PrimaryAddr: Employee address
- SSN: Social Security Number (for payroll)
- EmployeeNumber: Company employee ID/number
- BillableTime: Whether employee time is billable (true/false)
- BillRate: Hourly billing rate
- BirthDate: Date of birth
- Gender: Male, Female, or not specified
- HiredDate: Date employee was hired
- ReleasedDate: Date employee left company (if applicable)

**Example usage:**
1. Create basic employee:
   {
     "GivenName": "John",
     "FamilyName": "Smith",
     "PrimaryEmailAddr": { "Address": "john.smith@company.com" }
   }

2. Create employee with full details:
   {
     "GivenName": "Jane",
     "FamilyName": "Doe",
     "DisplayName": "Jane D.",
     "PrimaryEmailAddr": { "Address": "jane.doe@company.com" },
     "PrimaryPhone": { "FreeFormNumber": "(555) 123-4567" },
     "Mobile": { "FreeFormNumber": "(555) 987-6543" },
     "EmployeeNumber": "EMP-1001",
     "HiredDate": "2024-01-15",
     "BillableTime": true,
     "BillRate": 75.00
   }

3. Create employee for payroll:
   {
     "GivenName": "Robert",
     "FamilyName": "Johnson",
     "SSN": "xxx-xx-1234",
     "EmployeeNumber": "EMP-1002",
     "HiredDate": "2024-02-01",
     "BirthDate": "1985-06-15",
     "PrimaryAddr": {
       "Line1": "123 Main St",
       "City": "Springfield",
       "CountrySubDivisionCode": "IL",
       "PostalCode": "62701"
     }
   }

4. Create billable employee:
   {
     "GivenName": "Sarah",
     "FamilyName": "Williams",
     "BillableTime": true,
     "BillRate": 125.00,
     "EmployeeNumber": "EMP-1003"
   }

**Returns:**
- Created Employee object with QuickBooks-assigned ID
- All employee details
- MetaData with creation timestamp
- Active status set to true by default`;

// Define the expected input schema for creating an employee
const inputSchema = {
  employee: z.any(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};


// Define the tool handler
const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await createQuickbooksEmployee(params.employee);

  if (response.isError) {
    return {
      content: [
        { type: "text" as const, text: `Error creating employee: ${response.error}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: `Employee created:` },
      { type: "text" as const, text: JSON.stringify(response.result) },
    ],
  };
};

export const CreateEmployeeTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 