import { deleteQuickbooksVendor } from "../handlers/delete-quickbooks-vendor.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "delete-vendor";
const toolTitle = "Delete Vendor";
const toolDescription = `Mark a vendor as inactive in QuickBooks Online. Note: QuickBooks doesn't permanently delete vendors but makes them inactive to preserve transaction history.

**Why use this tool:**
- Remove vendors you no longer work with from active lists
- Clean up duplicate or test vendor records
- Maintain data integrity while preserving expense history
- Keep vendor lists organized and current

**When to use:**
- Vendor is no longer active or has closed their business
- Need to remove duplicate vendor entries
- Cleaning up test or demo vendor data
- Vendor requested removal from your system

**Important notes:**
- Vendors are marked as "inactive" not permanently deleted
- Cannot delete vendors with active transactions in some cases
- Requires vendor Id and SyncToken
- Transaction history is preserved for reporting

**Parameters:**
- vendor (required): Vendor object with:
  - Id (required): Vendor's QuickBooks ID
  - SyncToken (required): Current sync token

**Example usage:**
1. Delete vendor with ID and SyncToken:
   {
     "vendor": {
       "Id": "56",
       "SyncToken": "0"
     }
   }

2. Delete vendor after retrieving details:
   // First get vendor: get-vendor with id="89"
   // Then delete with returned object
   {
     "vendor": {
       "Id": "89",
       "SyncToken": "2"
     }
   }

**Returns:**
- Success status and the inactivated vendor object`;
const inputSchema = {
    vendor: z.object({
        Id: z.string(),
        SyncToken: z.string(),
    }),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (args: { [x: string]: any }) => {
    const response = await deleteQuickbooksVendor(args.vendor);

    if (response.isError) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Error deleting vendor: ${response.error}`,
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

export const DeleteVendorTool: ToolDefinition<
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
