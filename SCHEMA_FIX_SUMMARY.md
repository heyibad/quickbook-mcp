# Schema Validation Fixes

## Problem
The QuickBooks MCP server was throwing validation errors when registering tools with OpenAI/LLM function schemas:

```
BadRequestError: Error code: 400 - {'error': {'message': "Invalid schema for function 'search_employees': In context=('properties', 'criteria'), array schema missing items.", 'type': 'invalid_request_error', 'param': 'tools[34].function.parameters', 'code': 'invalid_function_parameters'}}
```

## Root Cause
Several search tools were using `z.array(z.any())` for their `criteria` input parameter. When converted to JSON Schema for OpenAI function calling, arrays must specify an `items` property that defines the schema of array elements. Using `z.any()` as the array item type doesn't generate a proper `items` definition.

## Solution
Updated all affected search tools to use a properly defined Zod object schema for array items:

### Before
```typescript
const inputSchema = {
    criteria: z.array(z.any()).optional(),
    // ... other fields
};
```

### After
```typescript
const inputSchema = {
    criteria: z
        .array(
            z.object({
                field: z.string().optional(),
                value: z.any().optional(),
                operator: z.string().optional(),
            })
        )
        .optional(),
    // ... other fields
};
```

## Files Fixed
1. `src/tools/search-employees.tool.ts`
2. `src/tools/search-journal-entries.tool.ts`
3. `src/tools/search-bill-payments.tool.ts`
4. `src/tools/search-purchases.tool.ts`

## Files Already Correct
The following search tools already had proper array item schemas and didn't need changes:
- `src/tools/search-vendors.tool.ts` - uses `advancedCriterionSchema.or(criterionSchema)`
- `src/tools/search-bills.tool.ts` - uses `advancedCriterionSchema.or(criterionSchema)`
- `src/tools/search-customers.tool.ts` - uses proper item schema
- `src/tools/search-estimates.tool.ts` - uses proper item schema

## Files Using Non-Array Input
These search tools use `z.any()` but not as array items, so they don't trigger the validation error:
- `src/tools/search-invoices.tool.ts` - `criteria: z.any()`
- `src/tools/search-accounts.tool.ts` - `criteria: z.any()`
- `src/tools/search-items.tool.ts` - `criteria: z.any()`

## Verification
- ✅ TypeScript compilation successful
- ✅ All tests passing
- ✅ Deployed to Heroku (v9)
- ✅ No remaining `z.array(z.any())` instances in input schemas

## Best Practice
When defining Zod schemas for arrays in tool inputs that will be converted to OpenAI function schemas:
1. Always use `z.array(z.object({...}))` with a defined object schema
2. Never use `z.array(z.any())` - it won't generate valid JSON Schema `items`
3. Even if fields are optional, define the object structure explicitly

## Testing
To verify the fix works in your backend:
```typescript
// The criteria parameter now accepts properly typed objects:
{
  "criteria": [
    { "field": "Active", "value": "true" },
    { "field": "GivenName", "value": "John", "operator": "LIKE" }
  ]
}
```

The schema will now pass OpenAI's function parameter validation.
