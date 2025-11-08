import { createQuickbooksVendor } from "../handlers/create-quickbooks-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create-vendor";
const toolTitle = "Create Vendor";
const toolDescription = `Create a new vendor record in QuickBooks Online for tracking suppliers, contractors, and service providers you pay for goods or services.

**Why use this tool:**
- Add new suppliers and service providers to your QuickBooks company
- Set up vendors before entering bills or expenses
- Store vendor contact and payment information
- Establish 1099 contractor relationships
- Track vendor payment terms and account numbers

**When to use:**
- Onboarding a new supplier or service provider
- Before creating the first bill or expense for a vendor
- Setting up contractors for 1099 tracking
- Importing vendor data from other systems
- Establishing vendor records for expense tracking

**Parameters:**
- vendor (required): Vendor object with:
  - DisplayName (required): Name shown on forms and reports
  - GivenName (optional): First name
  - FamilyName (optional): Last name
  - CompanyName (optional): Business name
  - PrimaryEmailAddr (optional): { Address: "email@example.com" }
  - PrimaryPhone (optional): { FreeFormNumber: "555-1234" }
  - BillAddr (optional): Billing address object
  - TermRef (optional): Payment terms reference
  - AcctNum (optional): Account number for this vendor
  - Vendor1099 (optional): true if 1099 contractor

**Example usage:**
1. Create simple vendor:
   {
     "vendor": {
       "DisplayName": "Office Supplies Inc",
       "CompanyName": "Office Supplies Inc",
       "PrimaryEmailAddr": { "Address": "billing@officesupplies.com" }
     }
   }

2. Create 1099 contractor:
   {
     "vendor": {
       "DisplayName": "John Smith Consulting",
       "GivenName": "John",
       "FamilyName": "Smith",
       "Vendor1099": true,
       "PrimaryEmailAddr": { "Address": "john@consulting.com" },
       "PrimaryPhone": { "FreeFormNumber": "(555) 123-4567" }
     }
   }

3. Create vendor with full details:
   {
     "vendor": {
       "DisplayName": "Tech Solutions LLC",
       "CompanyName": "Tech Solutions",
       "AcctNum": "TECH-001",
       "PrimaryEmailAddr": { "Address": "ap@techsolutions.com" },
       "BillAddr": {
         "Line1": "789 Tech Blvd",
         "City": "Austin",
         "CountrySubDivisionCode": "TX",
         "PostalCode": "78701"
       }
     }
   }

**Returns:**
- Created vendor object with QuickBooks-assigned Id and SyncToken`;
const inputSchema = {
    vendor: z.object({
        DisplayName: z.string(),
        GivenName: z.string().optional(),
        FamilyName: z.string().optional(),
        CompanyName: z.string().optional(),
        PrimaryEmailAddr: z
            .object({
                Address: z.string().optional(),
            })
            .optional(),
        PrimaryPhone: z
            .object({
                FreeFormNumber: z.string().optional(),
            })
            .optional(),
        BillAddr: z
            .object({
                Line1: z.string().optional(),
                City: z.string().optional(),
                Country: z.string().optional(),
                CountrySubDivisionCode: z.string().optional(),
                PostalCode: z.string().optional(),
            })
            .optional(),
    }),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
    const response = await createQuickbooksVendor(args.vendor);

    if (response.isError) {
        const output = {
            success: false,
            error: response.error || "Unknown error",
        };
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error creating vendor: ${response.error}`,
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
                text: `Vendor created successfully: ${JSON.stringify(response.result, null, 2)}`,
            },
        ],
        structuredContent: output,
    };
};

export const CreateVendorTool: ToolDefinition<
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
