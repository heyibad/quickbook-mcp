# Fix all handler files by adding missing imports

$handlersPath = "src\handlers"
$handlers = Get-ChildItem -Path $handlersPath -Filter "*.handler.ts"

foreach ($handler in $handlers) {
    $filePath = $handler.FullName
    Write-Host "Fixing imports in $($handler.Name)..."
    
    $content = Get-Content -Path $filePath -Raw
    
    # Check if file already has the imports
    if ($content -match 'getRequestHeaders') {
        # Check if import statement exists
        if (-not ($content -match 'from.*request-context')) {
            # Add imports after the first import line
            $content = $content -replace '(import.*from.*\n)', "`$1import { getRequestHeaders, extractAccessToken, extractRealmId } from ""../helpers/request-context.js"";`n"
            Write-Host "  Added request-context imports"
        }
    }
    
    if ($content -match 'makeQuickBooksRequest|queryQuickBooks') {
        # Check if import statement exists
        if (-not ($content -match 'from.*quickbooks-api')) {
            # Add imports after the first import line
            $content = $content -replace '(import.*from.*\n)', "`$1import { makeQuickBooksRequest, queryQuickBooks } from ""../helpers/quickbooks-api.js"";`n"
            Write-Host "  Added quickbooks-api imports"
        }
    }
    
    # Write back
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "  Fixed $($handler.Name)"
}

Write-Host "Done! Fixed all imports."
