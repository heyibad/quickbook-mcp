/**
 * Quick test for search_bills tool
 */

import "dotenv/config";
import { searchQuickbooksBills } from "./dist/handlers/search-quickbooks-bills.handler.js";
import { setQuickBooksCredentials } from "./dist/helpers/request-context.js";

async function testSearchBills() {
    console.log("Testing search_bills with various formats...\n");

    const accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;
    const realmId = process.env.QUICKBOOKS_REALM_ID;

    if (!accessToken || !realmId) {
        console.error("Missing QUICKBOOKS_ACCESS_TOKEN or QUICKBOOKS_REALM_ID");
        process.exit(1);
    }

    setQuickBooksCredentials(accessToken, realmId);

    // Test 1: Simple limit (this likely causes the issue)
    console.log("Test 1: Simple object with limit only");
    try {
        const result = await searchQuickbooksBills({ limit: 5 });
        if (result.isError) {
            console.error("❌ FAILED:", result.error);
        } else {
            console.log(`✅ SUCCESS: Found ${result.result?.length || 0} bills`);
            if (result.result?.[0]) {
                console.log("   Sample:", {
                    Id: result.result[0].Id,
                    VendorRef: result.result[0].VendorRef?.name,
                    TotalAmt: result.result[0].TotalAmt,
                });
            }
        }
    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
    console.log();

    // Test 2: Array format with limit
    console.log("Test 2: Array format with limit");
    try {
        const result = await searchQuickbooksBills([
            { field: "limit", value: 5 },
        ]);
        if (result.isError) {
            console.error("❌ FAILED:", result.error);
        } else {
            console.log(`✅ SUCCESS: Found ${result.result?.length || 0} bills`);
        }
    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
    console.log();

    // Test 3: Empty criteria (get all)
    console.log("Test 3: Empty criteria");
    try {
        const result = await searchQuickbooksBills({});
        if (result.isError) {
            console.error("❌ FAILED:", result.error);
        } else {
            console.log(`✅ SUCCESS: Found ${result.result?.length || 0} bills`);
        }
    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
    console.log();

    // Test 4: Array format with actual filter
    console.log("Test 4: Filter by Balance > 0");
    try {
        const result = await searchQuickbooksBills([
            { field: "Balance", value: "0", operator: ">" },
            { field: "limit", value: 5 },
        ]);
        if (result.isError) {
            console.error("❌ FAILED:", result.error);
        } else {
            console.log(`✅ SUCCESS: Found ${result.result?.length || 0} unpaid bills`);
            if (result.result?.[0]) {
                console.log("   Sample:", {
                    Id: result.result[0].Id,
                    Balance: result.result[0].Balance,
                    TotalAmt: result.result[0].TotalAmt,
                });
            }
        }
    } catch (error) {
        console.error("❌ ERROR:", error.message);
    }
}

testSearchBills().catch(console.error);
