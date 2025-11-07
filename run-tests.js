#!/usr/bin/env node

/**
 * Quick Test Runner - Example Usage
 * 
 * This script demonstrates how to run the test suite with your credentials.
 * 
 * Usage:
 * 1. Edit this file to add your credentials (or use environment variables)
 * 2. Run: npm run build (first time only)
 * 3. Run: node run-tests.js
 */

import { testAllTools } from "./dist/test-all-tools.js";

// ============================================================================
// CONFIGURATION - Add your credentials here or use environment variables
// ============================================================================

const config = {
  // Option 1: Hard-code credentials (NOT recommended for production)
  accessToken: "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..xOqv230C4sukpjZ40UAS4Q.spDMtxH4SXzKSq662XPot2n00jaqt_8vdDSZe8QOuWMTk1wxqBqWKRAB8fCsllqLLT99-WejocDD3UyiTOkQ3HjeyQFKdXxhH-dhlGZYNNUDYAKM1dnXwZhtWMERBCx9M-bRMF7BYbqWbj7PWuTjfJ69J4EvAyPPCf7dLSk3uPrlh8M9JG0BOslH8RRXwo_MCrZOkGEa3dA_ljqu-BG1WOhtm9WzfxTTyl06OOBRd4Vvj59EVj4ub8G2bCVzS9WHv5xVHrboWGfQuTM5s_bMVwVkRcDB23mWYkfuxCKBR6in6Y99U8qZyNgjgsxFB6lSfGKoRtf-phz3JJ7ReprF3nO44WwQkZ1Jr5CMkZj9Yyi9rB1kw1qSPOvjhdlDbmVxcXvd2j4upIFtUHZ34Vqh2IOk2aVrZBq8DnMwAqoqs0QnUKtugOG0VZE7VixJOrywi_u6pSL16xpJ1nfPGcs419byxXYvoC4wC4ymLdjOUm8.DGSNaYwrFhjriMICqZkZEQ",
  realmId: "9341455550665383",
};

// ============================================================================
// VALIDATION
// ============================================================================

if (
  !config.accessToken ||
  config.accessToken === "YOUR_ACCESS_TOKEN_HERE"
) {
  console.error("❌ Error: Access Token not configured");
  console.error("\nPlease either:");
  console.error("1. Set QUICKBOOKS_ACCESS_TOKEN environment variable");
  console.error("2. Edit run-tests.js and add your access token");
  console.error("\nExample:");
  console.error('  export QUICKBOOKS_ACCESS_TOKEN="eyJhbGciOiJ..."');
  process.exit(1);
}

if (!config.realmId || config.realmId === "YOUR_REALM_ID_HERE") {
  console.error("❌ Error: Realm ID not configured");
  console.error("\nPlease either:");
  console.error("1. Set QUICKBOOKS_REALM_ID environment variable");
  console.error("2. Edit run-tests.js and add your realm ID");
  console.error("\nExample:");
  console.error('  export QUICKBOOKS_REALM_ID="9341453159261958"');
  process.exit(1);
}

// ============================================================================
// RUN TESTS
// ============================================================================

console.log("🚀 Starting QuickBooks MCP Server Tests...\n");

testAllTools(config)
  .then((summary) => {
    console.log("\n✨ Test run completed!");
    console.log(`   Passed: ${summary.passed}/${summary.total}`);
    console.log(`   Failed: ${summary.failed}/${summary.total}`);
    console.log(`   Skipped: ${summary.skipped}/${summary.total}`);

    // Exit with appropriate code
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error during test execution:");
    console.error(error);
    process.exit(1);
  });
