# Replace old credential extraction pattern with getQuickBooksCredentials()
# This fixes all files that still use getRequestHeaders() and getAccessToken()

$handlersPath = "src\handlers"
$handlers = Get-ChildItem -Path $handlersPath -Filter "*.handler.ts"

$filesFixed = 0

foreach ($handler in $handlers) {
    $filePath = $handler.FullName
    $content = Get-Content -Path $filePath -Raw
    
    # Skip if already using getQuickBooksCredentials
    if ($content -match 'getQuickBooksCredentials\(\)') {
        continue
    }
    
    # Check if it has old pattern
    if ($content -notmatch 'getRequestHeaders\(\)|getAccessToken\(') {
        continue
    }
    
    Write-Host "Fixing $($handler.Name)..."
    
    # Pattern 1: Remove const headers = getRequestHeaders();
    $content = $content -replace '(?m)^\s*const headers = getRequestHeaders\(\);.*\n', ''
    
    # Pattern 2: Replace const accessToken = getAccessToken(...) with credentials extraction
    $content = $content -replace '(?m)^\s*const accessToken = getAccessToken\([^\)]*\);.*\n', '        // Get credentials from request headers' + "`n" + '        const { accessToken, realmId } = getQuickBooksCredentials();' + "`n`n"
    
    # Pattern 3: Remove const realmId = getRealmId(...) if exists
    $content = $content -replace '(?m)^\s*const realmId = getRealmId\([^\)]*\);.*\n', ''
    
    # Pattern 4: Remove old validation blocks
    $content = $content -replace '(?s)\s*if \(!accessToken\) \{[^\}]+\}\s*\n', ''
    $content = $content -replace '(?s)\s*if \(!realmId\) \{[^\}]+\}\s*\n', ''
    
    # Pattern 5: Add getQuickBooksCredentials import if not present
    if ($content -notmatch 'getQuickBooksCredentials') {
        $content = $content -replace '(import \{ ToolResponse \}[^\n]+\n)', '$1import { getQuickBooksCredentials } from "../helpers/request-context.js";' + "`n"
    }
    
    # Pattern 6: Ensure realmId is in API calls - add after accessToken
    # Fix makeQuickBooksRequest calls
    $content = $content -replace '(\s+accessToken)\n(\s+\}\);)', '$1,' + "`n" + 'realmId' + "`n" + '$2'
    
    # Fix queryQuickBooks calls  
    $content = $content -replace '(\s+accessToken)\n(\s+\}\);)', '$1,' + "`n" + 'realmId' + "`n" + '$2'
    
    # Remove duplicate realmId
    $content = $content -replace '(?m)^\s*realmId,\s*\n\s*realmId,', 'realmId,'
    
    # Write back
    Set-Content -Path $filePath -Value $content -NoNewline
    $filesFixed++
    Write-Host "  Fixed!"
}

Write-Host ""
Write-Host "Fixed $filesFixed handler files."
