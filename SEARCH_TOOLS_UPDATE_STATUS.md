# Search Tools Format Rules Update - Status

## Tools That Need Format Rules Added

All search tools use the same underlying `build-quickbooks-search-criteria` function, so they all need the format rules documentation.

### Tools to Update (10 remaining):

1. ✅ `search-bills.tool.ts` - ALREADY UPDATED
2. ⏳ `search-customers.tool.ts` - NEEDS UPDATE
3. ⏳ `search-vendors.tool.ts` - NEEDS UPDATE
4. ⏳ `search-invoices.tool.ts` - NEEDS UPDATE
5. ⏳ `search-bill-payments.tool.ts` - NEEDS UPDATE
6. ⏳ `search-employees.tool.ts` - NEEDS UPDATE
7. ⏳ `search-items.tool.ts` - NEEDS UPDATE
8. ⏳ `search-accounts.tool.ts` - NEEDS UPDATE
9. ⏳ `search-estimates.tool.ts` - NEEDS UPDATE
10. ⏳ `search-purchases.tool.ts` - NEEDS UPDATE
11. ⏳ `search-journal-entries.tool.ts` - NEEDS UPDATE

## What Needs to Be Added

Each tool description needs to include:

1. **Three Input Formats Section**

    - Format 1: Empty/Pagination only
    - Format 2: Array format
    - Format 3: Advanced options format

2. **Critical Rules Section**
    - Rule about pagination/sorting only
    - Rule about simple field filters
    - Rule about complex filters with operators
3. **Reserved Keywords List**

    - limit, offset, asc, desc, count, fetchAll, filters

4. **Warning About Mixed Formats**
    - DO NOT mix reserved keywords with filter fields

## Update Strategy

Since all tools follow the same pattern, I'll:

1. Add the format rules section after "When to use:"
2. Keep existing "Parameters" section but update it
3. Update examples to show all three formats
4. Add "Common Errors" section at the end

## Files to Modify

All files in `src/tools/search-*.tool.ts` except `search-bills.tool.ts` which is already done.

Total: 10 files to update
Estimated: ~100-150 lines added per file
