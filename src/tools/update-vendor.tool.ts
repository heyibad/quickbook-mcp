import { updateQuickbooksVendor } from "../handlers/update-quickbooks-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update-vendor";
const toolTitle = "Update Vendor";
const toolDescription = `Update an existing vendor's information in QuickBooks Online including contact details, payment terms, and 1099 status.

**Why use this tool:**
- Modify vendor contact information when details change
- Update payment terms or account numbers
- Change 1099 contractor status
- Correct errors in vendor records
- Keep vendor information current for accurate expense tracking

**When to use:**
- Vendor changes their email, phone, or address
- Need to update payment terms or account numbers
- Correcting typos or errors in vendor data
- Vendor requests information updates
- Updating 1099 status for tax reporting

**Important:** 
- You MUST include the vendor's current SyncToken (get it first using get-vendor)
- Include the Id field to identify which vendor to update
- Only include fields you want to change (partial updates supported)

**Parameters:**
- vendor (required): Vendor object with:
  - Id (required): Vendor's QuickBooks ID
  - SyncToken (required): Current sync token from the vendor record
  - Any fields to update: DisplayName, CompanyName, PrimaryEmailAddr, PrimaryPhone, BillAddr, Vendor1099, etc.

**Example usage:**
1. Update vendor email:
   {
     "vendor": {
       "Id": "56",
       "SyncToken": "0",
       "PrimaryEmailAddr": { "Address": "newemail@vendor.com" }
     }
   }

2. Update vendor address and phone:
   {
     "vendor": {
       "Id": "89",
       "SyncToken": "1",
       "PrimaryPhone": { "FreeFormNumber": "(555) 888-9999" },
       "BillAddr": {
         "Line1": "456 New Street",
         "City": "Boston",
         "CountrySubDivisionCode": "MA",
         "PostalCode": "02101"
       }
     }
   }

3. Update 1099 status:
   {
     "vendor": {
       "Id": "123",
       "SyncToken": "2",
       "Vendor1099": true
     }
   }

**Returns:**
- Updated vendor object with new SyncToken`;
const inputSchema = {
    vendor: z.object({
        Id: z.string(),
        SyncToken: z.string(),
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
    const response = await updateQuickbooksVendor(args.vendor);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error updating vendor: ${response.error}`,
                },
            ],
        };
    }

    const vendor = response.result;

    return {
        content: [
            {
                type: "text" as const,
                text: JSON.stringify(vendor),
            },
        ],
    };
};

export const UpdateVendorTool: ToolDefinition<
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
