import { updateQuickbooksItem } from "../handlers/update-quickbooks-item.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "update_item";
const toolTitle = "Update Item";
const toolDescription = `Update an existing product or service item in QuickBooks Online. Modify pricing, descriptions, inventory quantities, or account assignments. Supports sparse updates (partial field updates).

**Why use this tool:**
- Update item pricing
- Modify item descriptions
- Change item account assignments
- Adjust inventory quantities
- Update item status (active/inactive)
- Correct item configuration errors

**When to use:**
- Changing item prices
- Updating item descriptions for clarity
- Adjusting inventory levels manually
- Reassigning items to different accounts
- Deactivating discontinued items
- Correcting item setup mistakes

**Required Parameters:**
- item_id: The QuickBooks ID of the item to update
- sync_token: Current version token (get from read_item)

**Updatable Fields:**
- Name: Item name
- Description: Item description
- UnitPrice: Sales price
- PurchaseCost: Purchase cost
- QtyOnHand: Inventory quantity (for Inventory items)
- Active: true/false to activate/deactivate
- IncomeAccountRef: Income account reference
- ExpenseAccountRef: Expense/COGS account reference
- AssetAccountRef: Asset account (for Inventory items)
- Taxable: Whether item is taxable
- Type: Cannot be changed after creation

**Important:**
- Always get current SyncToken before updating
- Sparse updates recommended (only include fields to change)
- Cannot change item Type after creation
- Changing QtyOnHand directly affects inventory count
- Use inventory adjustments for better tracking

**Example usage:**
1. Update item price:
   {
     "item_id": "25",
     "sync_token": "3",
     "unit_price": 175.00
   }

2. Update description:
   {
     "item_id": "25",
     "sync_token": "3",
     "description": "Updated service description with more details"
   }

3. Deactivate item:
   {
     "item_id": "25",
     "sync_token": "3",
     "active": false
   }

4. Update multiple fields:
   {
     "item_id": "25",
     "sync_token": "3",
     "unit_price": 199.99,
     "purchase_cost": 95.00,
     "description": "Premium Widget - Updated Model"
   }

5. Adjust inventory quantity:
   {
     "item_id": "42",
     "sync_token": "5",
     "qty_on_hand": 250
   }

**Returns:**
- Updated Item object
- New SyncToken for subsequent updates
- All item details with changes applied
- MetaData with LastUpdatedTime`;

const inputSchema = {
    item_id: z.string().min(1),
    patch: z.record(z.any()),
};

const outputSchema = {
    success: z.boolean().describe("Whether the operation was successful"),
    data: z.any().optional().describe("The result data"),
    error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const response = await updateQuickbooksItem(params);
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
            { type: "text" as const, text: `Item updated successfully:` },
            {
                type: "text" as const,
                text: JSON.stringify(response.result, null, 2),
            },
        ],
    };
};

export const UpdateItemTool: ToolDefinition<
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
