# Tool Audit and Improvement Plan

## Issues Identified

### 1. **Schema Issues**
- ✅ FIXED: Array schemas missing items (search-employees, search-journal-entries, search-bill-payments, search-purchases)
- **Input schemas using `z.any()`** - Too permissive, doesn't provide type hints to LLMs:
  - All create tools: `customer: z.any()`, `invoice: z.any()`, etc.
  - All update tools: entity parameters using `z.any()`
  - Delete tools: `idOrEntity: z.any()`

### 2. **Description Issues**
- **Inconsistent structure** - Some have detailed "Why/When" sections, others don't
- **Missing key information**:
  - Required vs optional fields not clearly marked
  - Field types not specified
  - Return value structures not detailed
  - Error scenarios not documented

### 3. **Parameter Documentation**
- **Unclear field requirements** - Agents don't know which fields are mandatory
- **Missing field descriptions** - No explanation of what fields do
- **No validation hints** - No info about field formats, ranges, etc.

### 4. **Operational Clarity**
- **SyncToken confusion** - Not all tools clearly explain when/how to get it
- **Sparse vs full updates** - Not clear which operations support partial updates
- **QuickBooks ID format** - Not explained (numeric string like "58")

## Improvement Strategy

### Phase 1: Critical Fixes (High Priority)
1. Improve schema definitions for better LLM understanding
2. Standardize description format across all tools
3. Add clear field requirements and types
4. Document return structures

### Phase 2: Enhanced Documentation
1. Add workflow examples (e.g., "To update, first get_X to retrieve SyncToken")
2. Document common error scenarios
3. Add field validation rules
4. Clarify QuickBooks-specific concepts

### Phase 3: Schema Enhancements
1. Replace `z.any()` with proper typed schemas where practical
2. Add better descriptions to all schema fields
3. Improve error messages in output schemas

## Tool Categories

### CRUD Operations (40 tools)
- **Create** (11): account, bill-payment, bill, customer, employee, estimate, invoice, item, journal-entry, purchase, vendor
- **Read/Get** (8): bill-payment, bill, customer, employee, estimate, invoice (read-), item (read-), journal-entry, purchase, vendor
- **Update** (11): account, bill-payment, bill, customer, employee, estimate, invoice, item, journal-entry, purchase, vendor
- **Delete** (7): bill-payment, bill, customer, estimate, journal-entry, purchase, vendor
- **Search** (10): accounts, bill-payments, bills, customers, employees, estimates, invoices, items, journal-entries, purchases, vendors

### Pattern Observations

#### Good Examples (Well Documented):
- `create-customer.tool.ts` - Has comprehensive "Why/When/Parameters/Examples/Returns"
- `get-customer.tool.ts` - Clear structure with use cases
- `update-customer.tool.ts` - Explains SyncToken requirement clearly
- `delete-customer.tool.ts` - Explains QuickBooks' "inactive" vs "delete" behavior

#### Needs Improvement:
- Most tools lack field-level documentation
- Input schemas are too generic (`z.any()`)
- Return structures not documented
- Missing workflow guidance

## Recommended Template

```typescript
const toolDescription = `
[One-line summary of what the tool does]

**Why use this tool:**
- [Primary use case 1]
- [Primary use case 2]
- [Primary use case 3]

**When to use:**
- [Scenario 1]
- [Scenario 2]
- [Workflow context]

**Important Notes:**
- [Critical information about requirements]
- [QuickBooks-specific behavior]
- [Limitations or constraints]

**Required Parameters:**
- param1 (type): Description
- param2 (type): Description

**Optional Parameters:**
- param3 (type): Description with default

**Common Fields:**
[Table or list of entity-specific fields with types and descriptions]

**Example Usage:**
1. [Simple example with description]
   { json }

2. [Complex example with description]
   { json }

**Returns:**
- success (boolean): Operation status
- data (object): [Structure description]
- Includes: field1, field2, field3

**Common Errors:**
- Error scenario 1 and how to handle
- Error scenario 2 and how to handle
`;
```

## Priority Fixes List

### Immediate (Critical for Agent Understanding):
1. ✅ Fix array schemas in search tools
2. Add required field markers to all tool descriptions
3. Document SyncToken workflow for update/delete operations
4. Clarify ID format (string, numeric like "58", "142")

### High Priority:
5. Standardize description format across all tools
6. Add return structure documentation
7. Document common error scenarios
8. Add workflow examples (e.g., get before update)

### Medium Priority:
9. Replace generic `z.any()` with typed schemas where possible
10. Add field-level descriptions to schemas
11. Document field validation rules
12. Add cross-reference links between related tools

### Low Priority:
13. Add performance notes where relevant
14. Document QuickBooks API limitations
15. Add troubleshooting tips
16. Create unified examples document
