import { searchQuickbooksItems } from "../handlers/search-quickbooks-items.handler.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { z } from "zod";

const toolName = "search_items";
const toolTitle = "Search Items";
const toolDescription = `Search and filter products and service items in QuickBooks Online using various criteria like name, type, price, and more. Supports advanced filtering, sorting, and pagination.

**Why use this tool:**
- Find items by name or description
- Filter items by type (Service, Inventory, NonInventory)
- Search for active items only
- Get items within price ranges
- List inventory items with quantities
- Build item catalogs for invoicing

**When to use:**
- Building item dropdowns for invoices/estimates
- Searching for specific products or services
- Generating product catalogs
- Finding items by type or category
- Listing active vs inactive items
- Creating inventory reports

**IMPORTANT - Three Input Formats:**

Format 1 - Pagination only: { "limit": 10, "desc": "MetaData.CreateTime" }
Format 2 - Array with operators: [{ "field": "Type", "value": "Service" }, { "field": "limit", "value": 10 }]
Format 3 - Advanced with filters key: { "filters": [{ "field": "Type", "value": "Service" }], "limit": 10 }

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
- Name, Description, Type
- UnitPrice, PurchaseCost
- QtyOnHand (for Inventory items)
- Active (true/false)
- Taxable
- Sku
- IncomeAccountRef, ExpenseAccountRef, AssetAccountRef
- MetaData.CreateTime, MetaData.LastUpdatedTime

**Operators:**
- = (equals), < (less than), > (greater than)
- <= (less than or equal), >= (greater than or equal)
- LIKE (partial match), IN (list of values)

**Item Types:**
- Service: Service offerings
- Inventory: Physical products with quantity tracking
- NonInventory: Products sold without quantity tracking
- Category: For organizing items

**Example usage:**
1. Get all active items:
   {
     "criteria": [
       { "field": "Active", "value": "true" }
     ],
     "asc": "Name"
   }

2. Search by name:
   {
     "criteria": [
       { "field": "Name", "value": "Widget", "operator": "LIKE" }
     ]
   }

3. Find service items:
   {
     "criteria": [
       { "field": "Type", "value": "Service" },
       { "field": "Active", "value": "true" }
     ],
     "desc": "UnitPrice"
   }

4. Find inventory items:
   {
     "criteria": [
       { "field": "Type", "value": "Inventory" }
     ],
     "asc": "Name"
   }

5. Find items by price range:
   {
     "criteria": [
       { "field": "UnitPrice", "value": "50", "operator": ">=" },
       { "field": "UnitPrice", "value": "200", "operator": "<=" }
     ]
   }

6. Find low stock items:
   {
     "criteria": [
       { "field": "Type", "value": "Inventory" },
       { "field": "QtyOnHand", "value": "10", "operator": "<" }
     ],
     "asc": "QtyOnHand"
   }

7. Get all items (limit 50):
   { "criteria": {}, "limit": 50 }

**Returns:**
- Array of Item objects matching criteria
- Each item includes name, type, pricing, descriptions
- Account references and inventory quantities
- Active status and taxable information`;

// Allowed field lists derived from QuickBooks Online Item entity documentation (Filterable/Sortable columns)
const ALLOWED_FILTER_FIELDS = [
    "Id",
    "MetaData.CreateTime",
    "MetaData.LastUpdatedTime",
    "Name",
    "Active",
    "Type",
    "Sku",
] as const;

const ALLOWED_SORT_FIELDS = [
    "Id",
    "MetaData.CreateTime",
    "MetaData.LastUpdatedTime",
    "Name",
    "ParentRef",
    "PrefVendorRef",
    "UnitPrice",
    "Type",
    "QtyOnHand",
] as const;

const ITEM_FIELD_TYPE_MAP = {
    Id: "string",
    "MetaData.CreateTime": "date",
    "MetaData.LastUpdatedTime": "date",
    Name: "string",
    Active: "boolean",
    Type: "string",
    Sku: "string",
    ParentRef: "string",
    PrefVendorRef: "string",
    UnitPrice: "number",
    QtyOnHand: "number",
};

const filterableFieldSchema = z
    .string()
    .refine(
        (val) => (ALLOWED_FILTER_FIELDS as readonly string[]).includes(val),
        {
            message: `Field must be one of: ${ALLOWED_FILTER_FIELDS.join(", ")}`,
        }
    );

const sortableFieldSchema = z
    .string()
    .refine((val) => (ALLOWED_SORT_FIELDS as readonly string[]).includes(val), {
        message: `Sort field must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}`,
    });

// Advanced criteria validations
const operatorSchema = z
    .enum(["=", "IN", "<", ">", "<=", ">=", "LIKE"])
    .optional();
const filterSchema = z
    .object({
        field: filterableFieldSchema,
        value: z.any(),
        operator: operatorSchema,
    })
    .superRefine((obj, ctx) => {
        if (!isValidItemValueType(obj.field as string, obj.value)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Value type does not match expected type for field ${obj.field}`,
            });
        }
    });

const advancedCriteriaSchema = z.object({
    filters: z.array(filterSchema).optional(),
    asc: sortableFieldSchema.optional(),
    desc: sortableFieldSchema.optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
    count: z.boolean().optional(),
    fetchAll: z.boolean().optional(),
});

// Runtime schema used internally for validation
const RUNTIME_CRITERIA_SCHEMA = z.union([
    z.record(z.any()),
    z.array(z.record(z.any())),
    advancedCriteriaSchema,
]);

// Exposed schema for OpenAI/JSON – use broad schema to avoid deep $ref issues
const inputSchema = { criteria: z.any().describe("Search criteria for items") };

const outputSchema = {
    success: z.boolean().describe("Whether the search was successful"),
    count: z.number().optional().describe("Number of items found"),
    items: z.array(z.any()).optional().describe("Array of item objects"),
    error: z.string().optional().describe("Error message if search failed"),
};

const toolHandler = async (
    params: z.infer<z.ZodObject<typeof inputSchema>>
) => {
    const { criteria } = params;

    // Validate against runtime schema
    const parsed = RUNTIME_CRITERIA_SCHEMA.safeParse(criteria);
    if (!parsed.success) {
        return {
            content: [
                {
                    type: "text" as const,
                    text: `Invalid criteria: ${parsed.error.message}`,
                },
            ],
        };
    }

    const response = await searchQuickbooksItems(criteria);

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
    const items = response.result;
    return {
        content: [
            {
                type: "text" as const,
                text: `Found ${items?.length || 0} items`,
            },
            ...(items?.map((item) => ({
                type: "text" as const,
                text: JSON.stringify(item),
            })) || []),
        ],
    };
};

function isValidItemValueType(field: string, value: any): boolean {
    const expected =
        ITEM_FIELD_TYPE_MAP[field as keyof typeof ITEM_FIELD_TYPE_MAP];
    if (!expected) return true;
    const check = (v: any): boolean => {
        switch (expected) {
            case "string":
                return typeof v === "string";
            case "number":
                return typeof v === "number";
            case "boolean":
                return typeof v === "boolean";
            case "date":
                return typeof v === "string";
            default:
                return true;
        }
    };
    return Array.isArray(value) ? value.every(check) : check(value);
}

export const SearchItemsTool: ToolDefinition<
    typeof inputSchema,
    typeof outputSchema
> = {
    name: toolName,
    description: toolDescription,
    inputSchema: inputSchema,
    outputSchema: outputSchema,
    title: toolTitle,
    handler: toolHandler,
};
