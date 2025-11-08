const fs = require('fs');
const path = require('path');

const toolFiles = [
  'src/tools/search-accounts.tool.ts',
  'src/tools/search-bill-payments.tool.ts',
  'src/tools/search-customers.tool.ts',
  'src/tools/search-employees.tool.ts',
  'src/tools/search-estimates.tool.ts',
  'src/tools/search-invoices.tool.ts',
  'src/tools/search-journal-entries.tool.ts',
  'src/tools/search-purchases.tool.ts',
  'src/tools/search-vendors.tool.ts'
];

const fixedFormatRules = `**IMPORTANT - Three Input Formats:**

Format 1 - Pagination only: { "limit": 10, "desc": "MetaData.CreateTime" }
Format 2 - Array with operators: [{ "field": "FieldName", "value": "value", "operator": ">" }, { "field": "limit", "value": 10 }]
Format 3 - Advanced with filters key: { "filters": [{ "field": "FieldName", "value": "value", "operator": ">" }], "limit": 10 }

**CRITICAL RULES:**
1. For pagination ONLY, use Format 1 or Format 3 with empty filters
2. For simple filters WITHOUT pagination, use: { "FieldName": "value" }
3. NEVER mix filter fields with reserved keywords (limit, offset, asc, desc, count, fetchAll, filters) in simple object format
4. When combining filters with pagination, use Format 2 (array) or Format 3 (filters key)
5. For operators (>, <, >=, <=, LIKE, IN), use Format 2 or Format 3

**Reserved Keywords:** limit, offset, asc, desc, count, fetchAll, filters

See SEARCH_TOOLS_USAGE_GUIDE.md for detailed examples.`;

console.log('Fixing search tool syntax errors...\n');

let fixedCount = 0;
let errorCount = 0;

toolFiles.forEach(file => {
  try {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the start and end of the problematic section
    const startMarker = '**IMPORTANT: Three Input Formats**';
    const endMarker = 'For complete usage guide, see: SEARCH_TOOLS_USAGE_GUIDE.md';
    
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);
    
    if (startIdx === -1 || endIdx === -1) {
      console.log(`⏭️  Skipped: ${file} (markers not found)`);
      return;
    }
    
    // Replace the entire problematic section
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx + endMarker.length);
    
    const newContent = before + fixedFormatRules + after;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed: ${file}`);
    fixedCount++;
    
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✅ Fixed: ${fixedCount} files`);
if (errorCount > 0) {
  console.log(`❌ Errors: ${errorCount} files`);
}

console.log('\nDone! Run "npm run build" to verify the fix.');
