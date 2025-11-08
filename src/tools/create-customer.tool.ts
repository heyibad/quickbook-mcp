import { createQuickbooksCustomer } from "../handlers/create-quickbooks-customer.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

// Define the tool metadata
const toolName = "create_customer";
const toolTitle = "Create Customer";
const toolDescription = `Create a new customer record in QuickBooks Online with contact information, billing details, and payment terms.

**Why use this tool:**
- Add new customers to your QuickBooks company before creating transactions
- Store customer contact information for invoicing and communications
- Set up payment terms and billing preferences for new customers
- Establish customer relationships for accounting and reporting

**When to use:**
- When onboarding a new client or customer
- Before creating the first invoice or estimate for a customer
- When importing customer data from other systems
- To establish a customer record for future transactions

**Parameters:**
- customer (required): Customer object with the following common fields:
  - DisplayName (required): Name displayed on forms and reports
  - GivenName: First name
  - FamilyName: Last name  
  - CompanyName: Company name
  - PrimaryEmailAddr: { Address: "email@example.com" }
  - PrimaryPhone: { FreeFormNumber: "555-1234" }
  - BillAddr: Billing address object
  - PaymentMethodRef: Payment method reference
  - TermRef: Payment terms reference

**Example usage:**
1. Create simple customer:
   {
     "customer": {
       "DisplayName": "John Doe",
       "GivenName": "John",
       "FamilyName": "Doe",
       "PrimaryEmailAddr": { "Address": "john@example.com" }
     }
   }

2. Create business customer with full details:
   {
     "customer": {
       "DisplayName": "Acme Corporation",
       "CompanyName": "Acme Corp",
       "PrimaryEmailAddr": { "Address": "billing@acme.com" },
       "PrimaryPhone": { "FreeFormNumber": "(555) 123-4567" },
       "BillAddr": {
         "Line1": "123 Main St",
         "City": "San Francisco",
         "CountrySubDivisionCode": "CA",
         "PostalCode": "94110"
       }
     }
   }

**Returns:**
- Created customer object with QuickBooks-assigned Id and SyncToken`;

// Define the expected input schema for creating a customer
const inputSchema = {
    customer: z.any(),
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
    const response = await createQuickbooksCustomer(params.customer);

    if (response.isError) {
        const output = {
            success: false,
            error: response.error || "Unknown error",
        };
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error creating customer: ${response.error}`,
                },
            ],
            structuredContent: output,
        };
    }

    const output = {
        success: true,
        data: response.result,
    };
    return {
        content: [
            {
                type: "text" as const,
                text: `Customer created successfully: ${JSON.stringify(response.result, null, 2)}`,
            },
        ],
        structuredContent: output,
    };
};

export const CreateCustomerTool: ToolDefinition<
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
