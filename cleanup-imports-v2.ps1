# Clean up ALL handler files - remove duplicate imports only
# Based on the corrected customer handler patterns

$handlersPath = "src\handlers"
$handlers = Get-ChildItem -Path $handlersPath -Filter "*.handler.ts"

Write-Host "Cleaning up $($handlers.Count) handler files..."
Write-Host ""

foreach ($handler in $handlers) {
    $filePath = $handler.FullName
    Write-Host "Processing $($handler.Name)..."
    
    $content = Get-Content -Path $filePath -Raw
    
    # Remove all variations of duplicate/wrong imports
    # Keep track of what we need
    $needsQuickBooksCredentials = $content -match 'getQuickBooksCredentials\(\)'
    $needsQuickBooksApi = $content -match '(makeQuickBooksRequest|queryQuickBooks)\('
    $needsToolResponse = $content -match 'ToolResponse'
    $needsFormatError = $content -match 'formatError\('
    
    # Remove ALL import lines
    $content = $content -replace '(?m)^import \{[^\}]+\} from [^\n]+\n', ''
    
    # Build imports
    $imports = @()
    
    if ($needsQuickBooksCredentials) {
        $imports += 'import { getQuickBooksCredentials } from "../helpers/request-context.js";'
    }
    
    if ($needsQuickBooksApi) {
        $imports += 'import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";'
    }
    
    if ($needsToolResponse) {
        $imports += 'import { ToolResponse } from "../types/tool-response.js";'
    }
    
    if ($needsFormatError) {
        $imports += 'import { formatError } from "../helpers/format-error.js";'
    }
    
    # Join imports and add to content
    $importBlock = ($imports -join "`n") + "`n`n"
    $content = $importBlock + $content.TrimStart()
    
    # Write back
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "  Done"
}

Write-Host ""
Write-Host "Finished cleaning all handler files."
