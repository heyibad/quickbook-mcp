# Common QuickBooks MCP Server Errors

## Invalid JSON Input Error

**Error Example:**
```
Error: Invalid JSON input for tool search_accounts: 
{"criteria":[{"value":"Ibad","field":"DisplayName","operator":"="}]}
{"criteria":[{"field":"Name","operator":"LIKE","value":"Supplies"}]}
```

**Cause:** The AI client is concatenating multiple JSON objects instead of sending one valid object.

**Solution:** This is a client-side issue. The AI needs to send ONE valid JSON object, not multiple concatenated objects.

---

## Wrong Entity Type Error

**Error Example:**
```
Using search_accounts with "DisplayName" field to search for vendors
```

**Cause:** Confusion between entity types. Each search tool works with specific entity types:

- **search_accounts** → Chart of Accounts (accounting categories)
  - Fields: Name, AccountType, Classification, AcctNum, CurrentBalance
  - Use for: Finding GL accounts for categorizing transactions

- **search_vendors** → Vendors/Suppliers (companies/people you buy from)
  - Fields: DisplayName, CompanyName, GivenName, FamilyName, Balance
  - Use for: Finding vendors before creating bills/purchases

- **search_customers** → Customers/Clients (companies/people who buy from you)
  - Fields: DisplayName, CompanyName, GivenName, FamilyName, Balance
  - Use for: Finding customers before creating invoices/estimates

- **search_employees** → Employees
  - Fields: DisplayName, GivenName, FamilyName, Active
  - Use for: Finding employees for payroll/time tracking

**Solution:** Use the correct search tool for the entity type you need.

---

## Common Field Mapping

### To find a person/company by name:

- **Vendor**: `search_vendors` with `DisplayName` or `CompanyName`
- **Customer**: `search_customers` with `DisplayName` or `CompanyName`
- **Employee**: `search_employees` with `DisplayName` or `GivenName`
- **Account**: `search_accounts` with `Name` (accounts don't have DisplayName!)

### To categorize a transaction:

- **Find expense account**: `search_accounts` with `AccountType` = "Expense"
- **Find income account**: `search_accounts` with `AccountType` = "Income"
- **Find bank account**: `search_accounts` with `AccountType` = "Bank"

---

## Mixed Format Error

**Error Example:**
```json
{ "VendorRef": "56", "limit": 10 }
```

**Cause:** Mixing filter fields with pagination keywords in simple object format.

**Solution:** Use array format or advanced format when combining filters with pagination:

✅ **Correct - Array format:**
```json
[
  { "field": "VendorRef", "value": "56" },
  { "field": "limit", "value": 10 }
]
```

✅ **Correct - Advanced format:**
```json
{
  "filters": [
    { "field": "VendorRef", "value": "56" }
  ],
  "limit": 10
}
```

❌ **Wrong - Mixed format:**
```json
{ "VendorRef": "56", "limit": 10 }
```

---

## Server Restart Required

After updating tool descriptions or fixing code, you MUST restart the MCP server:

- **Claude Desktop**: Quit and restart the app
- **Manual run**: Kill process and run `npm start`
- **MCP Inspector**: Restart the inspector

The server reads compiled JavaScript from `dist/src/` folder, not the TypeScript source files.
