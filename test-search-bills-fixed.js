import { searchQuickbooksBills } from "./dist/handlers/search-quickbooks-bills.handler.js";

async function testSearchBills() {
    console.log("Testing search_bills tool...\n");

    try {
        // Test 1: Empty criteria (get all bills with default limit)
        console.log("Test 1: Empty criteria");
        const result1 = await searchQuickbooksBills({});
        console.log("✅ Success:", result1.result?.length || 0, "bills found");
        console.log();

        // Test 2: With limit only (THIS WAS FAILING)
        console.log("Test 2: With limit only");
        const result2 = await searchQuickbooksBills({ limit: 5 });
        console.log("✅ Success:", result2.result?.length || 0, "bills found");
        console.log();

        // Test 3: Array format with filters
        console.log("Test 3: Array format with filters");
        const result3 = await searchQuickbooksBills([
            { field: "Balance", value: "0", operator: ">" }
        ]);
        console.log("✅ Success:", result3.result?.length || 0, "bills found");
        console.log();

        // Test 4: Advanced options format
        console.log("Test 4: Advanced options format");
        const result4 = await searchQuickbooksBills({
            filters: [
                { field: "Balance", value: "0", operator: ">" }
            ],
            limit: 3,
            desc: "TxnDate"
        });
        console.log("✅ Success:", result4.result?.length || 0, "bills found");
        console.log();

        console.log("✅ All tests passed!");

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error);
    }
}

testSearchBills();
