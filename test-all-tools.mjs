#!/usr/bin/env node

/**
 * Test script for all QuickBooks MCP Server tools
 * Tests each tool with proper authentication headers
 */

const SERVER_URL = "http://localhost:3000/mcp";
const ACCESS_TOKEN =
    "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..PNxGRe75NLP87qcY-HdHIw.m5l7uQXwccYaY4vBFWHakz-_w6BcIkI0E0l4lsmhNMHdyJV45zDXaoHorNBJwBp53bOdTC1oFnn9V7hnIZsTfddcN-8ZStvJniB_viSdK08nVxkLS_gKrX13ra8ptQxMPiFKr7DAWqnTed6NaWxtaqUR6eplx8vxX9xuCWDa_KNIAWYPZurxB_HRe28Ym-ATQ58BtXLYH-97jeg_9hSjD4AFBRUjUrPKtmmTOtHnG3by2YaDtSrrkOUZNdR3dkhXYUBgnLNBMMLRY_cUJXRCI5RSwwo8NAHybTQCrGcRRepPsXnJYTvQvwBxWoW8pnAgsSLdDgDpPDVzh3vyqdIWZ8a6FKcp_YVuYgHhGKucRC_Jlpa54iBGvmUPwyrFNF4cmkJSjnK4hSV_KS4pvMUhuKQ68qi8eFkaaf3ZOZql0aMFRI_sBQeo3D1z_X-Me2tcDvYLFwqIGuGbq8HSlDnkwFw1fqM0xnU4hcCNyXP8nsQ.j_Kv-NDui1Lpbedk6L32mg";

// Color codes for terminal output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[36m",
    gray: "\x1b[90m",
};

/**
 * Parse Server-Sent Events (SSE) response to JSON
 */
function parseSSE(text) {
    const lines = text.split("\n");
    let result = "";

    for (const line of lines) {
        if (line.startsWith("data: ")) {
            result += line.substring(6);
        }
    }

    return result ? JSON.parse(result) : null;
}

/**
 * Call an MCP tool
 */
async function callTool(toolName, args = {}) {
    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                Accept: "application/json, text/event-stream",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: Math.floor(Math.random() * 10000),
                method: "tools/call",
                params: {
                    name: toolName,
                    arguments: args,
                },
            }),
        });

        const text = await response.text();
        const data = parseSSE(text);
        return data;
    } catch (error) {
        return {
            error: {
                code: -1,
                message: `Network error: ${error.message}`,
            },
        };
    }
}

/**
 * List all available tools
 */
async function listTools() {
    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                Accept: "application/json, text/event-stream",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "tools/list",
            }),
        });

        const text = await response.text();
        const data = parseSSE(text);
        return data?.result?.tools || [];
    } catch (error) {
        console.error("Error listing tools:", error.message);
        return [];
    }
}

/**
 * Test tool definitions (READ operations)
 */
const readTests = [
    {
        name: "read_invoice",
        args: { invoice_id: "1" },
        description: "Read Invoice by ID",
    },
    {
        name: "read_item",
        args: { item_id: "1" },
        description: "Read Item by ID",
    },
    {
        name: "get_customer",
        args: { id: "1" },
        description: "Get Customer by ID",
    },
    { name: "get-bill", args: { id: "1" }, description: "Get Bill by ID" },
    {
        name: "get_estimate",
        args: { id: "1" },
        description: "Get Estimate by ID",
    },
    { name: "get_vendor", args: { id: "1" }, description: "Get Vendor by ID" },
    {
        name: "get_employee",
        args: { id: "1" },
        description: "Get Employee by ID",
    },
    {
        name: "get_journal_entry",
        args: { id: "1" },
        description: "Get Journal Entry by ID",
    },
    {
        name: "get_bill_payment",
        args: { id: "1" },
        description: "Get Bill Payment by ID",
    },
    {
        name: "get_purchase",
        args: { id: "1" },
        description: "Get Purchase by ID",
    },
];

/**
 * Test tool definitions (SEARCH operations)
 */
const searchTests = [
    { name: "search_invoices", args: {}, description: "Search Invoices" },
    { name: "search_items", args: {}, description: "Search Items" },
    { name: "search_accounts", args: {}, description: "Search Accounts" },
    { name: "search_customers", args: {}, description: "Search Customers" },
    { name: "search-bills", args: {}, description: "Search Bills" },
    { name: "search_estimates", args: {}, description: "Search Estimates" },
    { name: "search-vendors", args: {}, description: "Search Vendors" },
    { name: "search_employees", args: {}, description: "Search Employees" },
    {
        name: "search_journal_entries",
        args: {},
        description: "Search Journal Entries",
    },
    {
        name: "search_bill_payments",
        args: {},
        description: "Search Bill Payments",
    },
    { name: "search_purchases", args: {}, description: "Search Purchases" },
];

/**
 * Display test result
 */
function displayResult(testName, description, result) {
    const hasError = result.error || result.result?.isError;
    const status = hasError
        ? `${colors.red}✗ FAIL${colors.reset}`
        : `${colors.green}✓ PASS${colors.reset}`;

    console.log(
        `  ${status} ${colors.blue}${testName}${colors.reset} - ${description}`
    );

    if (hasError) {
        const errorMsg =
            result.error?.message || result.result?.error || "Unknown error";
        console.log(`    ${colors.red}Error: ${errorMsg}${colors.reset}`);
    } else {
        const contentText = result.result?.content?.[0]?.text;
        if (contentText) {
            const preview = contentText.substring(0, 100);
            console.log(
                `    ${colors.gray}${preview}${contentText.length > 100 ? "..." : ""}${colors.reset}`
            );
        }
    }
}

/**
 * Main test runner
 */
async function runTests() {
    console.log(
        `\n${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(
        `${colors.yellow}  QuickBooks MCP Server - Tool Test Suite${colors.reset}`
    );
    console.log(
        `${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}\n`
    );

    console.log(`${colors.blue}Server URL:${colors.reset} ${SERVER_URL}`);
    console.log(
        `${colors.blue}Access Token:${colors.reset} ${ACCESS_TOKEN.substring(0, 50)}...`
    );
    console.log("");

    // List all available tools
    console.log(`${colors.yellow}Listing available tools...${colors.reset}`);
    const tools = await listTools();
    console.log(`${colors.green}Found ${tools.length} tools${colors.reset}\n`);

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    // Test READ operations
    console.log(
        `${colors.yellow}Testing READ Operations (${readTests.length} tests)${colors.reset}`
    );
    console.log(
        `${colors.yellow}─────────────────────────────────────────────────────────────${colors.reset}`
    );

    for (const test of readTests) {
        totalTests++;
        const result = await callTool(test.name, test.args);
        const hasError = result.error || result.result?.isError;

        if (hasError) {
            failedTests++;
        } else {
            passedTests++;
        }

        displayResult(test.name, test.description, result);
    }

    console.log("");

    // Test SEARCH operations
    console.log(
        `${colors.yellow}Testing SEARCH Operations (${searchTests.length} tests)${colors.reset}`
    );
    console.log(
        `${colors.yellow}─────────────────────────────────────────────────────────────${colors.reset}`
    );

    for (const test of searchTests) {
        totalTests++;
        const result = await callTool(test.name, test.args);
        const hasError = result.error || result.result?.isError;

        if (hasError) {
            failedTests++;
        } else {
            passedTests++;
        }

        displayResult(test.name, test.description, result);
    }

    console.log("");

    // Summary
    console.log(
        `${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`${colors.yellow}  Test Summary${colors.reset}`);
    console.log(
        `${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(`  Total Tests:  ${totalTests}`);
    console.log(`  ${colors.green}Passed:       ${passedTests}${colors.reset}`);
    console.log(`  ${colors.red}Failed:       ${failedTests}${colors.reset}`);
    console.log(
        `  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );
    console.log(
        `${colors.yellow}═══════════════════════════════════════════════════════════════${colors.reset}\n`
    );

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
}

// Check if server is running
async function checkServer() {
    try {
        console.log(
            `${colors.blue}Checking if server is running at ${SERVER_URL}...${colors.reset}`
        );

        // Try to list tools as a simple health check
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                Accept: "application/json, text/event-stream",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 0,
                method: "tools/list",
            }),
        });

        const text = await response.text();
        const data = parseSSE(text);

        // Check if we got a valid response (even if it's an error, server is running)
        if (data && data.jsonrpc === "2.0") {
            console.log(`${colors.green}✓ Server is running${colors.reset}\n`);
            return true;
        }

        throw new Error("Invalid response from server");
    } catch (error) {
        console.error(
            `${colors.red}✗ Server is not running or not responding${colors.reset}`
        );
        console.error(`${colors.red}  Error: ${error.message}${colors.reset}`);
        console.error(
            `\n${colors.yellow}Please start the server first:${colors.reset}`
        );
        console.error(`  ${colors.blue}node dist/index.js${colors.reset}`);
        console.error(`  ${colors.gray}OR${colors.reset}`);
        console.error(`  ${colors.blue}npm run start${colors.reset}\n`);
        return false;
    }
}

// Run the test suite
(async () => {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await runTests();
    } else {
        process.exit(1);
    }
})();
