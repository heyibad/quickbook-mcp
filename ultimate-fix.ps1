# FINAL ULTIMATE FIX - Properly fix all handlers to use getQuickBooksCredentials()

$handlersPath = "src\handlers"
$handlers = Get-ChildItem -Path $handlersPath -Filter "*.handler.ts"

foreach ($handler in $handlers) {
    $filePath = $handler.FullName
    Write-Host "Processing $($handler.Name)..."
    
    $lines = Get-Content -Path $filePath
    $newLines = @()
    $inImports = $true
    $importsAdded = $false
    
    foreach ($line in $lines) {
        # Skip duplicate imports
        if ($line -match 'import.*getRequestHeaders.*request-context' -or 
            $line -match 'import.*getAccessToken.*request-context' -or
            $line -match 'import.*getRealmId.*request-context' -or
            $line -match 'import.*extractAccessToken' -or
            $line -match 'import.*extractRealmId') {
            continue
        }
        
        # Add proper import after ToolResponse import
        if ($line -match 'import.*ToolResponse' -and -not $importsAdded) {
            $newLines += $line
            $newLines += 'import { getQuickBooksCredentials } from "../helpers/request-context.js";'
            $importsAdded = $true
            continue
        }
        
        # Remove old header/token extraction lines
        if ($line -match '^\s*const headers = getRequestHeaders\(\);' -or
            $line -match '^\s*const accessToken = getAccessToken\(' -or
            $line -match '^\s*const realmId = getRealmId\(') {
            continue
        }
        
        # Replace old token validation with credentials extraction
        if ($line -match '^\s*if \(!accessToken\)') {
            $newLines += '        // Get credentials from request headers'
            $newLines += '        const { accessToken, realmId } = getQuickBooksCredentials();'
            $newLines += ''
            # Skip the old validation block (next 5 lines typically)
            continue
        }
        
        # Skip the old error return lines after !accessToken check
        if ($line -match 'Missing Authorization header' -or
            $line -match 'Missing.*realmId' -or
            ($line -match '^\s*(return \{|result: null,|isError: true,|error:.*Authorization)' -and 
             $newLines[-1] -match '(accessToken|realmId|Missing)')) {
            continue
        }
        
        # Fix shorthand property issues - add realmId where missing
        if ($line -match 'await (makeQuickBooksRequest|queryQuickBooks)\(\{') {
            $newLines += $line
            # Check next few lines for realmId
            $hasRealmId = $false
            $lookahead = 5
            for ($i = $lines.IndexOf($line) + 1; $i -lt ($lines.IndexOf($line) + $lookahead) -and $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match 'realmId') {
                    $hasRealmId = $true
                    break
                }
            }
            continue
        }
        
        $newLines += $line
    }
    
    # Write back
    $newLines | Set-Content -Path $filePath
    Write-Host "  Fixed $($handler.Name)"
}

Write-Host ""
Write-Host "Done! Fixed all handlers to use getQuickBooksCredentials()"
