# Testing Guide

## Comprehensive Tool Testing

The `test-all-tools.ts` script provides comprehensive testing of all QuickBooks MCP tools with real QuickBooks data.

### How It Works

The test suite follows this intelligent approach:

1. **Fetch Prerequisites**: First, it searches QuickBooks for existing data (customers, vendors, bills, invoices, etc.)
2. **Test GET Operations**: Uses IDs from fetched data to test individual GET operations
3. **Test READ Operations**: Tests read operations on invoices and items
4. **Test UPDATE Operations**: Updates existing entities with test notes
5. **Test CREATE Operations**: Creates new test entities (customers, vendors)
6. **Test SEARCH Operations**: Already tested in Phase 1

### Running the Tests

#### Method 1: Command Line Arguments

```bash
npm run build
npx ts-node test-all-tools.ts <ACCESS_TOKEN> <REALM_ID>
```

Example:

```bash
npx ts-node test-all-tools.ts "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." "9341453159261958"
```

#### Method 2: Environment Variables

```bash
export QUICKBOOKS_ACCESS_TOKEN="your_access_token_here"
export QUICKBOOKS_REALM_ID="your_realm_id_here"
npx ts-node test-all-tools.ts
```

Or on Windows PowerShell:

```powershell
$env:QUICKBOOKS_ACCESS_TOKEN="your_access_token_here"
$env:QUICKBOOKS_REALM_ID="your_realm_id_here"
npx ts-node test-all-tools.ts
```

### Test Output

The test script provides detailed output:

```
================================================================================
QuickBooks MCP Server - Comprehensive Tool Testing
================================================================================
Realm ID: 9341453159261958
Access Token: eyJhbGciOiJSUzI1Ni...
================================================================================

📋 PHASE 1: Fetching Prerequisite Data

✅ Search Accounts: Found 15 accounts (234ms)
✅ Search Customers: Found 42 customers (189ms)
✅ Search Vendors: Found 12 vendors (156ms)
✅ Search Items: Found 28 items (201ms)
...

🔍 PHASE 2: Testing GET Operations

✅ Get Bill: Retrieved bill 123 (145ms)
✅ Get Bill Payment: Retrieved bill payment 456 (132ms)
⏭️  Get Estimate: No estimates available (0ms)
...

================================================================================
TEST SUMMARY
================================================================================

Total Tests: 35
✅ Passed: 28 (80.0%)
❌ Failed: 2 (5.7%)
⏭️  Skipped: 5 (14.3%)
```

### Understanding Results

- **✅ PASS**: Tool executed successfully with valid response
- **❌ FAIL**: Tool encountered an error (shows error message)
- **⏭️ SKIP**: Test skipped due to missing prerequisite data (e.g., no invoices exist)

### What Gets Tested

#### Search Operations (11 tools)

- search-quickbooks-accounts
- search-quickbooks-bills
- search-quickbooks-bill-payments
- search-quickbooks-customers
- search-quickbooks-employees
- search-quickbooks-estimates
- search-quickbooks-invoices
- search-quickbooks-items
- search-quickbooks-journal-entries
- search-quickbooks-purchases
- search-quickbooks-vendors

#### GET Operations (6 tools)

- get-quickbooks-bill
- get-quickbooks-bill-payment
- get-quickbooks-estimate
- get-quickbooks-journal-entry
- get-quickbooks-purchase
- get-quickbooks-vendor

#### READ Operations (2 tools)

- read-quickbooks-invoice
- read-quickbooks-item

#### UPDATE Operations (11 tools)

- update-quickbooks-account
- update-quickbooks-bill
- update-quickbooks-bill-payment
- update-quickbooks-customer
- update-quickbooks-employee
- update-quickbooks-estimate
- update-quickbooks-invoice
- update-quickbooks-item
- update-quickbooks-journal-entry
- update-quickbooks-purchase
- update-quickbooks-vendor

#### CREATE Operations (11 tools)

- create-quickbooks-account
- create-quickbooks-bill
- create-quickbooks-bill-payment
- create-quickbooks-customer
- create-quickbooks-employee
- create-quickbooks-estimate
- create-quickbooks-invoice
- create-quickbooks-item
- create-quickbooks-journal-entry
- create-quickbooks-purchase
- create-quickbooks-vendor

#### DELETE Operations (7 tools)

Note: DELETE operations are not tested by default to avoid data loss. They can be tested separately if needed.

### Getting QuickBooks Credentials

#### Access Token

You need a valid OAuth 2.0 access token from QuickBooks. You can obtain this by:

1. Setting up OAuth 2.0 in QuickBooks Developer Portal
2. Using the OAuth Playground
3. Implementing OAuth flow in your application

#### Realm ID

The Realm ID is your QuickBooks Company ID. You can find it:

1. In the QuickBooks Online URL after logging in
2. From the OAuth response during authentication
3. In your QuickBooks Developer Dashboard

### Test Data Safety

The test suite is designed to be **mostly non-destructive**:

- **Search operations**: Read-only, no data changes
- **GET/READ operations**: Read-only, no data changes
- **UPDATE operations**: Only adds test notes to existing entities
- **CREATE operations**: Creates new test entities (prefixed with "Test")

⚠️ **Note**: The test creates new customers and vendors which will remain in your QuickBooks account unless manually deleted.

### Exit Codes

- **0**: All tests passed
- **1**: One or more tests failed or fatal error occurred

### Troubleshooting

#### "Missing credentials" error

Make sure you provide both ACCESS_TOKEN and REALM_ID via command line or environment variables.

#### "Authentication failed" errors

- Check that your access token is valid and not expired
- Verify the Realm ID matches your QuickBooks company

#### Many "SKIP" results

This is normal if your QuickBooks company has limited data. The tests will skip operations that require data that doesn't exist.

#### "FAIL" results

Check the error message in the output. Common issues:

- Expired access token
- Insufficient permissions
- QuickBooks API rate limits
- Network connectivity issues

### Advanced Usage

You can modify the test script to:

- Test specific tools only
- Adjust the limit of entities fetched (default: 10)
- Add DELETE operation tests
- Test with multiple credentials for multi-tenant scenarios
- Generate detailed test reports

### Example: Multi-Tenant Testing

```bash
# Test with Tenant 1
npx ts-node test-all-tools.ts "$TENANT1_TOKEN" "$TENANT1_REALM_ID"

# Test with Tenant 2
npx ts-node test-all-tools.ts "$TENANT2_TOKEN" "$TENANT2_REALM_ID"
```

### Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Test QuickBooks Tools
  env:
      QUICKBOOKS_ACCESS_TOKEN: ${{ secrets.QB_ACCESS_TOKEN }}
      QUICKBOOKS_REALM_ID: ${{ secrets.QB_REALM_ID }}
  run: |
      npm run build
      npx ts-node test-all-tools.ts
```

### Performance Benchmarking

The test script reports execution time for each tool, helping you:

- Identify slow operations
- Monitor API performance
- Optimize tool implementations
- Track performance over time
