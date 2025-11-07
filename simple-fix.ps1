# Simple fix: Remove duplicate imports, fix getAccessToken() calls, ensure realmId is extracted

$handlersPath = "src\handlers"
$handlers = Get-ChildItem -Path $handlersPath -Filter "*.handler.ts"

foreach ($handler in $handlers) {
    $filePath = $handler.FullName
    Write-Host "Fixing $($handler.Name)..."
    
    $content = Get-Content -Path $filePath -Raw
    
    # Remove duplicate import lines (keep only first occurrence of each import)
    $lines = $content -split "`n"
    $seenImports = @{}
    $newLines = @()
    
    foreach ($line in $lines) {
        if ($line -match '^import') {
            $importKey = $line -replace '\s+', ''
            if (-not $seenImports.ContainsKey($importKey)) {
                $seenImports[$importKey] = $true
                $newLines += $line
            }
        } else {
            $newLines += $line
        }
    }
    
    $content = $newLines -join "`n"
    
    # Remove old individual credential extraction if getQuickBooksCredentials is already used
    if ($content -match 'getQuickBooksCredentials\(\)') {
        # Remove old lines
        $content = $content -replace '(?m)^\s*const headers = getRequestHeaders\(\);.*\n', ''
        $content = $content -replace '(?m)^\s*const accessToken = getAccessToken\(.*\);.*\n', ''
        $content = $content -replace '(?m)^\s*const realmId = getRealmId\(.*\);.*\n', ''
    } else {
        # Fix getAccessToken() and getRealmId() calls - remove arguments
        $content = $content -replace 'getAccessToken\([^)]*\)', 'getAccessToken()'
        $content = $content -replace 'getRealmId\([^)]*\)', 'getRealmId()'
        
        # Add realmId extraction after accessToken if missing
        if ($content -match 'const accessToken = getAccessToken\(\);' -and 
            $content -notmatch 'const realmId = getRealmId\(\);') {
            $content = $content -replace '(const accessToken = getAccessToken\(\);)', "`$1`nconst realmId = getRealmId();"
        }
        
        # Add realmId validation after accessToken validation
        if ($content -match 'if \(!accessToken\)' -and $content -notmatch 'if \(!realmId\)') {
            $content = $content -replace '(\s+if \(!accessToken\) \{[^}]+\})', "`$1`n`nif (!realmId) {`n  return {`n    result: null,`n    isError: true,`n    error: `"Missing QuickBooks Realm ID. Please provide via 'X-Realm-Id' or 'X-QuickBooks-Realm-Id' header.`"`n  };`n}"
        }
    }
    
    # Ensure realmId is in API calls - look for makeQuickBooksRequest or queryQuickBooks calls
    # Add realmId after accessToken if missing
    $content = $content -replace '(accessToken[,\s]*)\n(\s*\}\);)', "`$1`nrealmId,`n`$2"
    $content = $content -replace '(accessToken)\n(\s*\}\);)', "`$1,`nrealmId`n`$2"
    
    # Remove duplicate realmId entries
    $content = $content -replace '(?m)^\s*realmId,\s*\n\s*realmId,', 'realmId,'
    
    # Write back
    Set-Content -Path $filePath -Value $content -NoNewline
    Write-Host "  Fixed $($handler.Name)"
}

Write-Host ""
Write-Host "Done!"
