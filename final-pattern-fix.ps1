# Final fix based on working pattern from delete-quickbooks-bill.handler.ts
# This will rewrite ALL handler files to use the getQuickBooksCredentials() pattern

$handlersPath = "src\handlers"
$handlers = Get-ChildItem -Path $handlersPath -Filter "*.handler.ts"

$totalFiles = $handlers.Count
$current = 0

foreach ($handler in $handlers) {
    $current++
    $filePath = $handler.FullName
    Write-Progress -Activity "Fixing handlers" -Status "$current of $totalFiles - $($handler.Name)" -PercentComplete (($current / $totalFiles) * 100)
    
    $content = Get-Content -Path $filePath -Raw
    
    # Step 1: Fix all imports - replace any combination with the correct ones
    # Remove all old import variations
    $content = $content -replace 'import \{ getRequestHeaders[^\}]*\} from [^\n]+\n', ''
    $content = $content -replace 'import \{ getAccessToken[^\}]*\} from [^\n]+\n', ''
    $content = $content -replace 'import \{ getRealmId[^\}]*\} from [^\n]+\n', ''
    $content = $content -replace 'import \{ extractAccessToken[^\}]*\} from [^\n]+\n', ''
    $content = $content -replace 'import \{ extractRealmId[^\}]*\} from [^\n]+\n', ''
    
    # Remove duplicate makeQuickBooksRequest imports (keep first)
    $content = $content -creplace '(import \{ makeQuickBooksRequest[^\n]+\n)(.*?)(import \{ makeQuickBooksRequest[^\n]+\n)', '$1$2'
    
    # Add correct import after ToolResponse if not present
    if ($content -notmatch 'getQuickBooksCredentials') {
        $content = $content -replace '(import \{ ToolResponse \}[^\n]+\n)', "`$1import { getQuickBooksCredentials } from `"../helpers/request-context.js`";`n"
    }
    
    # Step 2: Replace old credential extraction pattern with new one
    # Pattern: const headers = getRequestHeaders(); const accessToken = ...
    $content = $content -replace '(?s)(\/\/ Get .*?from request headers\s+)const headers = getRequestHeaders\(\);[^\n]*\n\s*const accessToken = get[^\n]+\n(\s*const realmId[^\n]+\n)?', '$1const { accessToken, realmId } = getQuickBooksCredentials();'
    
    # Remove standalone credential extraction
    $content = $content -replace '(?m)^\s*const headers = getRequestHeaders\(\);[^\n]*\n', ''
    $content = $content -replace '(?m)^\s*const accessToken = get[^;]+;[^\n]*\n', ''
    $content = $content -replace '(?m)^\s*const realmId = get[^;]+;[^\n]*\n', ''
    
    # Step 3: Remove old validation blocks for accessToken/realmId
    $content = $content -replace '(?s)\s*if \(!accessToken\) \{[^\}]+\}\s*', ''
    $content = $content -replace '(?s)\s*if \(!realmId\) \{[^\}]+\}\s*', ''
    
    # Step 4: Add realmId to all makeQuickBooksRequest and queryQuickBooks calls if missing
    # Match function calls and ensure realmId is present
    $content = $content -replace '(makeQuickBooksRequest\(\{[^}]+accessToken)(\s*\}\);)', '$1,$2realmId$2'
    $content = $content -replace '(queryQuickBooks\(\{[^}]+accessToken)(\s*\}\);)', '$1,$2realmId$2'
    
    # Fix double realmId if accidentally added
    $content = $content -replace 'realmId,\s*realmId', 'realmId'
    
    # Fix cases where realmId is already there but formatted wrong
    $content = $content -replace '(accessToken[,\s]+)\n(\s+\}\);realmId)', '$1$2realmId$2'
    
    # Write back
    Set-Content -Path $filePath -Value $content -NoNewline
}

Write-Progress -Activity "Fixing handlers" -Completed
Write-Host "Done! Fixed all $totalFiles handler files."
