# QuickBooks Online MCP Server - Search Tools Usage Guide

## Overview

All search tools in this server accept criteria in **three different formats** to accommodate various use cases. Understanding these formats is critical for successful searches.

## Three Input Formats

### Format 1: Empty Object (Get All Records)
Used when you want all records or just pagination/sorting without filters.

```json
{}
```

```json
{ "limit": 20 }
```

```json
{ "desc": "TxnDate", "limit": 10 }
```

### Format 2: Array Format (Explicit Field/Value/Operator)
Used when you need operators like `>`, `<`, `>=`, `<=`, `LIKE`, `IN` or want to mix filters with pagination.

```json
[
  { "field": "Balance", "value": "0", "operator": ">" },
  { "field": "limit", "value": 10 }
]
```

### Format 3: Advanced Options Format (With Filters Key)
Most readable format for complex queries with multiple filters and pagination.

```json
{
  "filters": [
    { "field": "Balance", "value": "0", "operator": ">" },
    { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" }
  ],
  "limit": 10,
  "desc": "TxnDate"
}
```

## Critical Rules

### ⚠️ Rule 1: Reserved Keywords
These keywords are for pagination and sorting ONLY:
- `limit` - Maximum number of results
- `offset` - Number of records to skip
- `asc` - Field name to sort ascending
- `desc` - Field name to sort descending
- `count` - Return count only
- `fetchAll` - Fetch all records (pagination handled automatically)
- `filters` - Array of filter objects (advanced format only)

### ⚠️ Rule 2: DO NOT Mix Formats
**WRONG** ❌:
```json
{
  "VendorRef": "56",
  "limit": 10
}
```
This is ambiguous! Is `VendorRef` a filter or a pagination keyword?

**CORRECT** ✅:
```json
[
  { "field": "VendorRef", "value": "56" },
  { "field": "limit", "value": 10 }
]
```

Or:
```json
{
  "filters": [
    { "field": "VendorRef", "value": "56" }
  ],
  "limit": 10
}
```

### ⚠️ Rule 3: Simple Filters Without Pagination
If you only have simple equality filters (no operators) and NO pagination/sorting:

**CORRECT** ✅:
```json
{
  "VendorRef": "56"
}
```

```json
{
  "CustomerRef": "1",
  "Active": true
}
```

But if you need pagination:

**CORRECT** ✅:
```json
{
  "filters": [
    { "field": "VendorRef", "value": "56" }
  ],
  "limit": 10
}
```

## Supported Operators

- `=` - Equals (default, can be omitted)
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal
- `<=` - Less than or equal
- `LIKE` - Partial string match
- `IN` - Value in list

## Common Use Cases

### 1. Get All Records with Limit
```json
{ "limit": 20 }
```

### 2. Simple Equality Filter
```json
{ "VendorRef": "56" }
```

### 3. Comparison Operator
```json
[
  { "field": "Balance", "value": "0", "operator": ">" }
]
```

### 4. Multiple Filters
```json
{
  "filters": [
    { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" },
    { "field": "TxnDate", "value": "2024-12-31", "operator": "<=" }
  ]
}
```

### 5. Filters with Sorting
```json
{
  "filters": [
    { "field": "Active", "value": "true" }
  ],
  "desc": "TxnDate",
  "limit": 50
}
```

### 6. Partial String Match
```json
[
  { "field": "DisplayName", "value": "John", "operator": "LIKE" }
]
```

### 7. Pagination Only (No Filters)
```json
{
  "limit": 25,
  "offset": 50,
  "desc": "MetaData.CreateTime"
}
```

## Format Decision Tree

```
Do you need operators (>, <, >=, <=, LIKE, IN)?
├─ YES → Use Array Format or Advanced Format
└─ NO → Do you need pagination/sorting?
    ├─ YES → Use Array Format or Advanced Format
    └─ NO → Use Simple Object Format (only if pure filters)
```

## Common Errors and Solutions

### Error: "Invalid SQL query"
**Cause**: Mixed reserved keywords with filter fields in simple object format.

**Wrong** ❌:
```json
{
  "VendorRef": "56",
  "limit": 10
}
```

**Fix** ✅:
```json
{
  "filters": [
    { "field": "VendorRef", "value": "56" }
  ],
  "limit": 10
}
```

### Error: "Operator not supported"
**Cause**: Using operator in simple object format.

**Wrong** ❌:
```json
{
  "Balance > 0": true
}
```

**Fix** ✅:
```json
[
  { "field": "Balance", "value": "0", "operator": ">" }
]
```

## QuickBooks SQL Translation

### Empty Criteria
```json
{}
```
Becomes: `SELECT * FROM Bill`

### Simple Filter
```json
{ "VendorRef": "56" }
```
Becomes: `SELECT * FROM Bill WHERE VendorRef = '56'`

### Array Format with Operator
```json
[
  { "field": "Balance", "value": "0", "operator": ">" },
  { "field": "limit", "value": 10 }
]
```
Becomes: `SELECT * FROM Bill WHERE Balance > 0 MAXRESULTS 10`

### Advanced Format
```json
{
  "filters": [
    { "field": "TxnDate", "value": "2024-01-01", "operator": ">=" }
  ],
  "desc": "TxnDate",
  "limit": 20
}
```
Becomes: `SELECT * FROM Bill WHERE TxnDate >= '2024-01-01' ORDER BY TxnDate DESC MAXRESULTS 20`

## Best Practices

1. **Use Advanced Format for Complex Queries**
   - Most readable
   - Clear separation of filters and options
   - Recommended for production code

2. **Use Array Format for Dynamic Queries**
   - Easy to build programmatically
   - Flexible for varying number of filters

3. **Use Simple Format Only for Basic Filters**
   - Only when no pagination/sorting needed
   - Only equality comparisons
   - Very limited use case

4. **Always Test Your Queries**
   - Start with empty criteria `{}`
   - Add filters one at a time
   - Verify results match expectations

## All Search Tools

These rules apply to ALL search tools in the server:

- `search_customers`
- `search_vendors`
- `search_bills`
- `search_bill_payments`
- `search_invoices`
- `search_employees`
- `search_items`
- `search_accounts`
- `search_estimates`
- `search_purchases`
- `search_journal_entries`

## Testing Your Queries

Use the provided test files to verify your queries work correctly:

```bash
# Build the project
npm run build

# Test a specific search
node test-search-bills-fixed.js
```

Create your own test file:
```javascript
import { searchQuickbooksBills } from "./dist/handlers/search-quickbooks-bills.handler.js";

async function test() {
    const result = await searchQuickbooksBills({
        filters: [
            { field: "Balance", value: "0", operator: ">" }
        ],
        limit: 10
    });
    
    console.log("Found:", result.result?.length, "bills");
    console.log(result.result);
}

test();
```

---

**Remember**: When in doubt, use the Advanced Format with `filters` key - it's the most explicit and least error-prone!
