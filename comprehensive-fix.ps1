# Comprehensive fix for all handler files

$handlersPath = "src\handlers"
$handlers = Get-ChildItem -Path $handlersPath -Filter "*.handler.ts"

foreach ($handler in $handlers) {
    $filePath = $handler.FullName
    Write-Host "Fixing $($handler.Name)..."
    
    $content = Get-Content -Path $filePath -Raw
    
    # Remove ALL existing imports to start fresh
    $content = $content -replace 'import \{ getRequestHeaders.*?\n', ''
    $content = $content -replace 'import \{ makeQuickBooksRequest.*?\n', ''
    $content = $content -replace 'import \{ extractAccessToken.*?\n', ''
    $content = $content -replace 'import \{ extractRealmId.*?\n', ''
    
    # Fix function calls: extractAccessToken -> getAccessToken
    $content = $content -replace 'extractAccessToken', 'getAccessToken'
    
    # Fix function calls: extractRealmId -> getRealmId
    $content = $content -replace 'extractRealmId', 'getRealmId'
    
    # Add proper imports after ToolResponse import
    if ($content -notmatch 'import \{ getRequestHeaders') {
        $content = $content -replace '(import.*ToolResponse.*\n)', "`$1import { getRequestHeaders, getAccessToken, getRealmId } from `"../helpers/request-context.js`";`n"
    }
    
    if ($content -notmatch 'import \{.*makeQuickBooksRequest') {
        $content = $content -replace '(import.*request-context.*\n)', "`$1import { makeQuickBooksRequest, queryQuickBooks } from `"../helpers/quickbooks-api.js`";`n"
    }
    
    # Write back
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "  Fixed $($handler.Name)"
}

Write-Host "Done! Fixed all handler files."
