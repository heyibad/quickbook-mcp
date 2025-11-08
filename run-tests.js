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
    accessToken:
        "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..suSk-lH8ahXqY3orrJX6Ww._vQfdPBlRGEXgN0zD9CXAhdLAfv9XjjO4XoIqFpfnIF_dcCWtivUHBayNO_3hqGnKzRVnD3CchG3sNFwlDn-J8eQNvAJc7ywWS7vp5FupN5W9UnRzUyBWNu07K_ffwkts7vLo4jDujxiuMU7h8rquATVzEUtvGDomiSZEW_guuTvV58k_p4x_Ji4fKZzdB6IFxEcyQ4uKF8JEC4WrmeWwNsN-j1JklolPLx5ml-umQxrq5wJYiTv7hpX_fae2gZPL0Le9CtfIpnqhfQyZnrXUu-bgTVlBeYUCsf1DuAJr0QzMTVrjL1wWvt35KGt68PvyKCxMSO8CdYnBCoLnnKK49wswaYv-oLQRxrcW7hLFzeZr9OclDfE73y5tNlprycuVu86jWQ9b8OdsqgmHV6d_IqxcGtkfsUuXmSWEimNRg8ZhMg54Ghr66NVvWwhmPNGdQOrM286jr6Yydi9_cNdf2Cye2TXTqN9H7wO3GB4WNw.kDGSJhdFE4mDS8AAgifa9g",
    realmId: "9341455550665383",
};

// ============================================================================
// VALIDATION
// ============================================================================

if (!config.accessToken || config.accessToken === "YOUR_ACCESS_TOKEN_HERE") {
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
