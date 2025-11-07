# PowerShell script to update all handler files to use dynamic credentials

$handlersPath = "src\handlers"
$files = Get-ChildItem -Path $handlersPath -Filter "*.handler.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already updated (contains getQuickBooksCredentials)
    if ($content -match "getQuickBooksCredentials") {
        Write-Host "Skipping $($file.Name) - already updated"
        continue
    }
    
    # Skip if doesn't use extractAccessToken (doesn't need update)
    if ($content -notmatch "extractAccessToken") {
        Write-Host "Skipping $($file.Name) - doesn't use extractAccessToken"
        continue
    }
    
    Write-Host "Updating $($file.Name)..."
    
    # Replace import statement
    $content = $content -replace 'import \{[^}]*extractAccessToken[^}]*\} from "../helpers/quickbooks-api\.js";', ''
    $content = $content -replace 'import \{[^}]*queryQuickBooks[^}]*\} from "../helpers/quickbooks-api\.js";', ''
    $content = $content -replace 'import \{ getRequestHeaders \} from "../helpers/request-context\.js";', ''
    
    # Add correct imports at the top after other imports
    if ($content -match 'makeQuickBooksRequest') {
        $content = $content -replace '(import \{ makeQuickBooksRequest[^}]*\} from "../helpers/quickbooks-api\.js";)', "`$1`nimport { getQuickBooksCredentials } from `"../helpers/request-context.js`";"
    } elseif ($content -match 'queryQuickBooks') {
        $content = $content -replace '(import \{ queryQuickBooks[^}]*\} from "../helpers/quickbooks-api\.js";)', "`$1`nimport { getQuickBooksCredentials } from `"../helpers/request-context.js`";"
    }
    
    # Replace the old pattern with new pattern
    $oldPattern = @'
        // Get access token from request headers
        const headers = getRequestHeaders\(\);
        const accessToken = extractAccessToken\(headers\);

        if \(!accessToken\) \{
            return \{
                result: null,
                isError: true,
                error: "Missing Authorization header\. Please provide: Authorization: Bearer <access_token>",
            \};
        \}
'@
    
    $newPattern = @'
        // Get credentials from request headers
        const { accessToken, realmId } = getQuickBooksCredentials();
'@
    
    $content = $content -replace $oldPattern, $newPattern
    
    # Add realmId to makeQuickBooksRequest calls
    $content = $content -replace '(\s+accessToken,)(\s+\})', "`$1`n            realmId,`$2"
    
    # Add realmId to queryQuickBooks calls  
    $content = $content -replace '(query: [^,]+,\s+accessToken,)', "`$1`n            realmId,"
    $content = $content -replace '(accessToken: accessToken,)', "`$1`n            realmId: realmId,"
    
    # Clean up any double blank lines
    $content = $content -replace '\n\n\n+', "`n`n"
    
    # Write back to file
    Set-Content -Path $file.FullName -Value $content -NoNewline
    
    Write-Host "  Updated $($file.Name)"
}

Write-Host ""
Write-Host "Done! Updated all handler files."
