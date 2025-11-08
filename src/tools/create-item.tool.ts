import { createQuickbooksItem } from "../handlers/create-quickbooks-item.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "create_item";
const toolTitle = "Create Item";
const toolDescription = `Create a product or service item in QuickBooks Online that can be used on invoices, estimates, and sales receipts.

**Why use this tool:**
- Add products or services to your QuickBooks catalog
- Set up items before creating invoices or estimates
- Define pricing, descriptions, and income accounts for items
- Enable inventory tracking for products
- Standardize service offerings with consistent pricing

**When to use:**
- Adding new products to your inventory
- Setting up service offerings
- Before creating first invoice with a new item
- Importing product catalogs from other systems
- Establishing item library for sales transactions

**Parameters:**
- name (required): Item name/title
- type (required): Item type - "Inventory", "Service", "NonInventory"
- income_account_ref (required): { value: "account_id" } - Income account for sales
- description (optional): Item description for forms
- unit_price (optional): Default sales price
- purchase_cost (optional): Cost when purchasing
- qty_on_hand (optional): Starting quantity (for Inventory items)
- track_qty_on_hand (optional): true/false for inventory tracking
- asset_account_ref (optional): Asset account for Inventory items
- expense_account_ref (optional): COGS account for tracking costs

**Example usage:**
1. Create service item:
   {
     "name": "Consulting Hour",
     "type": "Service",
     "description": "Professional consulting services",
     "unit_price": 150.00,
     "income_account_ref": { "value": "79" }
   }

2. Create non-inventory product:
   {
     "name": "Office Supplies",
     "type": "NonInventory",
     "description": "Miscellaneous office supplies",
     "unit_price": 25.00,
     "purchase_cost": 15.00,
     "income_account_ref": { "value": "79" },
     "expense_account_ref": { "value": "80" }
   }

3. Create inventory item:
   {
     "name": "Widget Model X",
     "type": "Inventory",
     "description": "Premium widget for resale",
     "unit_price": 99.99,
     "purchase_cost": 45.00,
     "qty_on_hand": 100,
     "track_qty_on_hand": true,
     "income_account_ref": { "value": "79" },
     "asset_account_ref": { "value": "81" },
     "expense_account_ref": { "value": "80" }
   }

**Returns:**
- Created item object with QuickBooks-assigned Id and SyncToken`;

const inputSchema = {
  name: z.string().min(1),
  type: z.string().min(1),
  income_account_ref: z.string().min(1),
  expense_account_ref: z.string().optional(),
  unit_price: z.number().optional(),
  description: z.string().optional(),
};

const outputSchema = {
  success: z.boolean().describe("Whether the operation was successful"),
  data: z.any().optional().describe("The result data"),
  error: z.string().optional().describe("Error message if operation failed"),
};

const toolHandler = async (params: z.infer<z.ZodObject<typeof inputSchema>>) => {
  const response = await createQuickbooksItem(params);
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
      { type: "text" as const, text: `Item created successfully:` },
      { type: "text" as const, text: JSON.stringify(response.result, null, 2) },
    ],
  };
};

export const CreateItemTool: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  name: toolName,
  title: toolTitle,
  description: toolDescription,
  inputSchema: inputSchema,
  outputSchema: outputSchema,
  handler: toolHandler,
}; 