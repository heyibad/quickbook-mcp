# Build Path Fix

## Problem
Tool descriptions weren't updating even after rebuilding because:
1. TypeScript was compiling to `dist/src/` instead of `dist/`
2. package.json was pointing to `dist/index.js` but files were in `dist/src/index.js`
3. Old MCP server instance was still running with old code

## Root Cause
Missing `"rootDir": "."` in tsconfig.json caused TypeScript to preserve the `src/` directory structure in the output.

## Solution Applied

### 1. Fixed tsconfig.json
```json
{
    "compilerOptions": {
        "rootDir": ".",  // Added this line
        "outDir": "dist",
        // ... other options
    }
}
```

### 2. Updated package.json paths
Changed:
- `"main": "dist/index.js"` → `"main": "dist/src/index.js"`
- `"bin": "./dist/index.js"` → `"bin": "./dist/src/index.js"`
- `"build": "tsc && shx chmod +x dist/*.js"` → `"build": "tsc && shx chmod +x dist/src/*.js"`
- `"auth": "node dist/auth-server.js"` → `"auth": "node dist/src/auth-server.js"`
- `"start": "node dist/index.js"` → `"start": "node dist/src/index.js"`

### 3. Verified Files
✅ Source files in `src/tools/search-*.tool.ts` have updated format documentation
✅ Compiled files in `dist/src/tools/search-*.tool.js` now include the full descriptions
✅ Build process working correctly

## To Apply Changes

1. **Rebuild the project:**
   ```bash
   npm run build
   ```

2. **Restart your MCP server** (choose one):
   - **If using Claude Desktop**: Restart Claude Desktop app
   - **If using MCP Inspector**: Restart the inspector
   - **If running manually**: 
     ```bash
     npm start
     ```

3. **Verify**: Call `tools/list` and check that search tool descriptions now include format rules

## Expected Result
When you call `tools/list`, search tools should show descriptions like:

```
"description": "Search and filter customers in QuickBooks Online...

**IMPORTANT - Three Input Formats:**

Format 1 - Pagination only: { \"limit\": 10, \"desc\": \"MetaData.CreateTime\" }
Format 2 - Array with operators: [{ \"field\": \"FieldName\", \"value\": \"value\", \"operator\": \">\" }, { \"field\": \"limit\", \"value\": 10 }]
Format 3 - Advanced with filters key: { \"filters\": [{ \"field\": \"FieldName\", \"value\": \"value\", \"operator\": \">\" }], \"limit\": 10 }
..."
```

## Files Modified
- ✅ tsconfig.json - Added rootDir
- ✅ package.json - Updated all paths from `dist/` to `dist/src/`
- ✅ Clean rebuild performed
