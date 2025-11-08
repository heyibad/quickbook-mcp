#!/usr/bin/env node

/**
 * This script adds format rules documentation to all search tool files
 * Run with: node add-format-rules-to-search-tools.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FORMAT_RULES = `

**IMPORTANT: Three Input Formats**

This tool accepts criteria in **three different formats**:

**Format 1: Empty object (get all records)**
\`\`\`json
{}
// or with pagination only
{ "limit": 20 }
\`\`\`

**Format 2: Array format (for filters with operators)**
\`\`\`json
[
  { "field": "FieldName", "value": "value", "operator": ">" },
  { "field": "limit", "value": 10 }
]
\`\`\`

**Format 3: Advanced options format (with filters key)**
\`\`\`json
{
  "filters": [
    { "field": "FieldName", "value": "value", "operator": ">" }
  ],
  "limit": 10,
  "desc": "FieldName"
}
\`\`\`

**CRITICAL RULES:**
1. ⚠️ **Pagination/sorting ONLY**: Use Format 1 or Format 3 with empty filters
   - ✅ CORRECT: \`{ "limit": 10 }\`
   - ✅ CORRECT: \`{ "filters": [], "limit": 10 }\`

2. ⚠️ **Simple field filters**: Use simple object WITHOUT reserved keywords, or use array/advanced format
   - ✅ CORRECT: \`{ "FieldName": "value" }\` (no pagination)
   - ❌ WRONG: \`{ "FieldName": "value", "limit": 10 }\` (mixed format - ambiguous!)
   - ✅ CORRECT: \`{ "filters": [{ "field": "FieldName", "value": "value" }], "limit": 10 }\`

3. ⚠️ **Complex filters with operators**: Always use array or advanced format
   - ✅ CORRECT: \`[{ "field": "Amount", "value": "100", "operator": ">" }]\`
   - ✅ CORRECT: \`{ "filters": [{ "field": "Amount", "value": "100", "operator": ">" }] }\`

**Reserved Keywords (do NOT use as filter field names):**
- \`limit\` - Maximum results
- \`offset\` - Skip records  
- \`asc\` - Sort ascending by field
- \`desc\` - Sort descending by field
- \`count\` - Return count only
- \`fetchAll\` - Get all records
- \`filters\` - Array of filters (advanced format only)

⚠️ **DO NOT mix reserved keywords with filter fields in simple object format!**
Use array format or advanced format when combining filters with pagination/sorting.

For complete usage guide, see: SEARCH_TOOLS_USAGE_GUIDE.md
`;

const toolsDir = path.join(__dirname, "src", "tools");
const searchTools = [
    "search-customers.tool.ts",
    "search-vendors.tool.ts",
    "search-invoices.tool.ts",
    "search-bill-payments.tool.ts",
    "search-employees.tool.ts",
    "search-items.tool.ts",
    "search-accounts.tool.ts",
    "search-estimates.tool.ts",
    "search-purchases.tool.ts",
    "search-journal-entries.tool.ts",
];

console.log("Adding format rules to search tools...\n");

let updatedCount = 0;
let skippedCount = 0;

for (const toolFile of searchTools) {
    const filePath = path.join(toolsDir, toolFile);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${toolFile}`);
        continue;
    }

    let content = fs.readFileSync(filePath, "utf8");

    // Check if format rules already exist
    if (content.includes("**IMPORTANT: Three Input Formats**")) {
        console.log(`⏭️  Skipped (already has format rules): ${toolFile}`);
        skippedCount++;
        continue;
    }

    // Find where to insert (after "When to use:" section, before "**Parameters:**" or "**Supported fields:**")
    const insertMarkers = [
        /(\*\*When to use:\*\*[\s\S]*?)\n\n\*\*Parameters:\*\*/,
        /(\*\*When to use:\*\*[\s\S]*?)\n\n\*\*Supported fields:\*\*/,
        /(\*\*When to use:\*\*[\s\S]*?)\n\n\*\*Example usage:\*\*/,
    ];

    let inserted = false;
    for (const marker of insertMarkers) {
        if (marker.test(content)) {
            content = content.replace(
                marker,
                `$1\n${FORMAT_RULES}\n\n**Parameters:**`
            );
            inserted = true;
            break;
        }
    }

    if (!inserted) {
        console.log(`⚠️  Could not find insertion point in: ${toolFile}`);
        console.log(
            "   File structure may be different. Manual update needed."
        );
        skippedCount++;
        continue;
    }

    // Write back
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Updated: ${toolFile}`);
    updatedCount++;
}

console.log(`\n✅ Updated: ${updatedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files`);
console.log(
    '\nDone! Run "npm run build" to rebuild with updated descriptions.'
);
