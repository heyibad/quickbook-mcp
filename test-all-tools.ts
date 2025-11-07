import { AsyncLocalStorage } from "async_hooks";

// Import all handler functions
import { createQuickbooksAccount } from "./src/handlers/create-quickbooks-account.handler.js";
import { createQuickbooksBill } from "./src/handlers/create-quickbooks-bill.handler.js";
import { createQuickbooksBillPayment } from "./src/handlers/create-quickbooks-bill-payment.handler.js";
import { createQuickbooksCustomer } from "./src/handlers/create-quickbooks-customer.handler.js";
import { createQuickbooksEmployee } from "./src/handlers/create-quickbooks-employee.handler.js";
import { createQuickbooksEstimate } from "./src/handlers/create-quickbooks-estimate.handler.js";
import { createQuickbooksInvoice } from "./src/handlers/create-quickbooks-invoice.handler.js";
import { createQuickbooksItem } from "./src/handlers/create-quickbooks-item.handler.js";
import { createQuickbooksJournalEntry } from "./src/handlers/create-quickbooks-journal-entry.handler.js";
import { createQuickbooksPurchase } from "./src/handlers/create-quickbooks-purchase.handler.js";
import { createQuickbooksVendor } from "./src/handlers/create-quickbooks-vendor.handler.js";

import { deleteQuickbooksBill } from "./src/handlers/delete-quickbooks-bill.handler.js";
import { deleteQuickbooksBillPayment } from "./src/handlers/delete-quickbooks-bill-payment.handler.js";
import { deleteQuickbooksCustomer } from "./src/handlers/delete-quickbooks-customer.handler.js";
import { deleteQuickbooksEstimate } from "./src/handlers/delete-quickbooks-estimate.handler.js";
import { deleteQuickbooksJournalEntry } from "./src/handlers/delete-quickbooks-journal-entry.handler.js";
import { deleteQuickbooksPurchase } from "./src/handlers/delete-quickbooks-purchase.handler.js";
import { deleteQuickbooksVendor } from "./src/handlers/delete-quickbooks-vendor.handler.js";

import { getQuickbooksBill } from "./src/handlers/get-quickbooks-bill.handler.js";
import { getQuickbooksBillPayment } from "./src/handlers/get-quickbooks-bill-payment.handler.js";
import { getQuickbooksEstimate } from "./src/handlers/get-quickbooks-estimate.handler.js";
import { getQuickbooksJournalEntry } from "./src/handlers/get-quickbooks-journal-entry.handler.js";
import { getQuickbooksPurchase } from "./src/handlers/get-quickbooks-purchase.handler.js";
import { getQuickbooksVendor } from "./src/handlers/get-quickbooks-vendor.handler.js";

import { readQuickbooksInvoice } from "./src/handlers/read-quickbooks-invoice.handler.js";
import { readQuickbooksItem } from "./src/handlers/read-quickbooks-item.handler.js";

import { searchQuickbooksAccounts } from "./src/handlers/search-quickbooks-accounts.handler.js";
import { searchQuickbooksBills } from "./src/handlers/search-quickbooks-bills.handler.js";
import { searchQuickbooksBillPayments } from "./src/handlers/search-quickbooks-bill-payments.handler.js";
import { searchQuickbooksCustomers } from "./src/handlers/search-quickbooks-customers.handler.js";
import { searchQuickbooksEmployees } from "./src/handlers/search-quickbooks-employees.handler.js";
import { searchQuickbooksEstimates } from "./src/handlers/search-quickbooks-estimates.handler.js";
import { searchQuickbooksInvoices } from "./src/handlers/search-quickbooks-invoices.handler.js";
import { searchQuickbooksItems } from "./src/handlers/search-quickbooks-items.handler.js";
import { searchQuickbooksJournalEntries } from "./src/handlers/search-quickbooks-journal-entries.handler.js";
import { searchQuickbooksPurchases } from "./src/handlers/search-quickbooks-purchases.handler.js";
import { searchQuickbooksVendors } from "./src/handlers/search-quickbooks-vendors.handler.js";

import { updateQuickbooksAccount } from "./src/handlers/update-quickbooks-account.handler.js";
import { updateQuickbooksBill } from "./src/handlers/update-quickbooks-bill.handler.js";
import { updateQuickbooksBillPayment } from "./src/handlers/update-quickbooks-bill-payment.handler.js";
import { updateQuickbooksCustomer } from "./src/handlers/update-quickbooks-customer.handler.js";
import { updateQuickbooksEmployee } from "./src/handlers/update-quickbooks-employee.handler.js";
import { updateQuickbooksEstimate } from "./src/handlers/update-quickbooks-estimate.handler.js";
import { updateQuickbooksInvoice } from "./src/handlers/update-quickbooks-invoice.handler.js";
import { updateQuickbooksItem } from "./src/handlers/update-quickbooks-item.handler.js";
import { updateQuickbooksJournalEntry } from "./src/handlers/update-quickbooks-journal-entry.handler.js";
import { updateQuickbooksPurchase } from "./src/handlers/update-quickbooks-purchase.handler.js";
import { updateQuickbooksVendor } from "./src/handlers/update-quickbooks-vendor.handler.js";

import { requestContext } from "./src/helpers/request-context.js";

// Test configuration
interface TestConfig {
    accessToken: string;
    realmId: string;
}

// Test results tracking
interface TestResult {
    tool: string;
    status: "PASS" | "FAIL" | "SKIP";
    message: string;
    duration: number;
}

const testResults: TestResult[] = [];

// Helper function to run test in AsyncLocalStorage context
async function runInContext<T>(
    config: TestConfig,
    fn: () => Promise<T>
): Promise<T> {
    const context = {
        headers: {
            authorization: `Bearer ${config.accessToken}`,
            "x-quickbooks-realm-id": config.realmId,
        },
    };

    return requestContext.run(context, fn);
}

// Helper to log and track results
function logResult(
    tool: string,
    status: "PASS" | "FAIL" | "SKIP",
    message: string,
    duration: number
) {
    const statusEmoji =
        status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⏭️";
    console.log(`${statusEmoji} ${tool}: ${message} (${duration}ms)`);
    testResults.push({ tool, status, message, duration });
}

// Main test suite
async function testAllTools(config: TestConfig) {
    console.log("=".repeat(80));
    console.log("QuickBooks MCP Server - Comprehensive Tool Testing");
    console.log("=".repeat(80));
    console.log(`Realm ID: ${config.realmId}`);
    console.log(`Access Token: ${config.accessToken.substring(0, 20)}...`);
    console.log("=".repeat(80));
    console.log("");

    // Store prerequisite data
    const prereqData: any = {
        accounts: [],
        customers: [],
        vendors: [],
        items: [],
        employees: [],
        bills: [],
        billPayments: [],
        estimates: [],
        invoices: [],
        journalEntries: [],
        purchases: [],
    };

    // ========================================
    // PHASE 1: Fetch Prerequisite Data
    // ========================================
    console.log("\n📋 PHASE 1: Fetching Prerequisite Data\n");

    // Fetch Accounts
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksAccounts({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.accounts = result.result;
            logResult(
                "Search Accounts",
                "PASS",
                `Found ${prereqData.accounts.length} accounts`,
                duration
            );
        } else {
            logResult(
                "Search Accounts",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Accounts", "FAIL", error.message, 0);
    }

    // Fetch Customers
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksCustomers({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.customers = result.result;
            logResult(
                "Search Customers",
                "PASS",
                `Found ${prereqData.customers.length} customers`,
                duration
            );
        } else {
            logResult(
                "Search Customers",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Customers", "FAIL", error.message, 0);
    }

    // Fetch Vendors
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksVendors({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.vendors = result.result;
            logResult(
                "Search Vendors",
                "PASS",
                `Found ${prereqData.vendors.length} vendors`,
                duration
            );
        } else {
            logResult(
                "Search Vendors",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Vendors", "FAIL", error.message, 0);
    }

    // Fetch Items
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksItems({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.items = result.result;
            logResult(
                "Search Items",
                "PASS",
                `Found ${prereqData.items.length} items`,
                duration
            );
        } else {
            logResult(
                "Search Items",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Items", "FAIL", error.message, 0);
    }

    // Fetch Employees
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksEmployees({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.employees = result.result;
            logResult(
                "Search Employees",
                "PASS",
                `Found ${prereqData.employees.length} employees`,
                duration
            );
        } else {
            logResult(
                "Search Employees",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Employees", "FAIL", error.message, 0);
    }

    // Fetch Bills
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksBills({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.bills = result.result;
            logResult(
                "Search Bills",
                "PASS",
                `Found ${prereqData.bills.length} bills`,
                duration
            );
        } else {
            logResult(
                "Search Bills",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Bills", "FAIL", error.message, 0);
    }

    // Fetch Bill Payments
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksBillPayments({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.billPayments = result.result;
            logResult(
                "Search Bill Payments",
                "PASS",
                `Found ${prereqData.billPayments.length} bill payments`,
                duration
            );
        } else {
            logResult(
                "Search Bill Payments",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Bill Payments", "FAIL", error.message, 0);
    }

    // Fetch Estimates
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksEstimates({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.estimates = result.result;
            logResult(
                "Search Estimates",
                "PASS",
                `Found ${prereqData.estimates.length} estimates`,
                duration
            );
        } else {
            logResult(
                "Search Estimates",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Estimates", "FAIL", error.message, 0);
    }

    // Fetch Invoices
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksInvoices({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.invoices = result.result;
            logResult(
                "Search Invoices",
                "PASS",
                `Found ${prereqData.invoices.length} invoices`,
                duration
            );
        } else {
            logResult(
                "Search Invoices",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Invoices", "FAIL", error.message, 0);
    }

    // Fetch Journal Entries
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksJournalEntries({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.journalEntries = result.result;
            logResult(
                "Search Journal Entries",
                "PASS",
                `Found ${prereqData.journalEntries.length} journal entries`,
                duration
            );
        } else {
            logResult(
                "Search Journal Entries",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Journal Entries", "FAIL", error.message, 0);
    }

    // Fetch Purchases
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            searchQuickbooksPurchases({ limit: 10 })
        );
        const duration = Date.now() - start;
        if (!result.isError && result.result) {
            prereqData.purchases = result.result;
            logResult(
                "Search Purchases",
                "PASS",
                `Found ${prereqData.purchases.length} purchases`,
                duration
            );
        } else {
            logResult(
                "Search Purchases",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Search Purchases", "FAIL", error.message, 0);
    }

    // ========================================
    // PHASE 2: Test GET Operations
    // ========================================
    console.log("\n🔍 PHASE 2: Testing GET Operations\n");

    // Test Get Bill
    if (prereqData.bills.length > 0) {
        try {
            const billId = prereqData.bills[0].Id;
            const start = Date.now();
            const result = await runInContext(config, () =>
                getQuickbooksBill(billId)
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Get Bill",
                    "PASS",
                    `Retrieved bill ${billId}`,
                    duration
                );
            } else {
                logResult(
                    "Get Bill",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Get Bill", "FAIL", error.message, 0);
        }
    } else {
        logResult("Get Bill", "SKIP", "No bills available", 0);
    }

    // Test Get Bill Payment
    if (prereqData.billPayments.length > 0) {
        try {
            const id = prereqData.billPayments[0].Id;
            const start = Date.now();
            const result = await runInContext(config, () =>
                getQuickbooksBillPayment(id)
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Get Bill Payment",
                    "PASS",
                    `Retrieved bill payment ${id}`,
                    duration
                );
            } else {
                logResult(
                    "Get Bill Payment",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Get Bill Payment", "FAIL", error.message, 0);
        }
    } else {
        logResult("Get Bill Payment", "SKIP", "No bill payments available", 0);
    }

    // Test Get Estimate
    if (prereqData.estimates.length > 0) {
        try {
            const id = prereqData.estimates[0].Id;
            const start = Date.now();
            const result = await runInContext(config, () =>
                getQuickbooksEstimate(id)
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Get Estimate",
                    "PASS",
                    `Retrieved estimate ${id}`,
                    duration
                );
            } else {
                logResult(
                    "Get Estimate",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Get Estimate", "FAIL", error.message, 0);
        }
    } else {
        logResult("Get Estimate", "SKIP", "No estimates available", 0);
    }

    // Test Get Journal Entry
    if (prereqData.journalEntries.length > 0) {
        try {
            const id = prereqData.journalEntries[0].Id;
            const start = Date.now();
            const result = await runInContext(config, () =>
                getQuickbooksJournalEntry(id)
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Get Journal Entry",
                    "PASS",
                    `Retrieved journal entry ${id}`,
                    duration
                );
            } else {
                logResult(
                    "Get Journal Entry",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Get Journal Entry", "FAIL", error.message, 0);
        }
    } else {
        logResult(
            "Get Journal Entry",
            "SKIP",
            "No journal entries available",
            0
        );
    }

    // Test Get Purchase
    if (prereqData.purchases.length > 0) {
        try {
            const id = prereqData.purchases[0].Id;
            const start = Date.now();
            const result = await runInContext(config, () =>
                getQuickbooksPurchase(id)
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Get Purchase",
                    "PASS",
                    `Retrieved purchase ${id}`,
                    duration
                );
            } else {
                logResult(
                    "Get Purchase",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Get Purchase", "FAIL", error.message, 0);
        }
    } else {
        logResult("Get Purchase", "SKIP", "No purchases available", 0);
    }

    // Test Get Vendor
    if (prereqData.vendors.length > 0) {
        try {
            const id = prereqData.vendors[0].Id;
            const start = Date.now();
            const result = await runInContext(config, () =>
                getQuickbooksVendor(id)
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Get Vendor",
                    "PASS",
                    `Retrieved vendor ${id}`,
                    duration
                );
            } else {
                logResult(
                    "Get Vendor",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Get Vendor", "FAIL", error.message, 0);
        }
    } else {
        logResult("Get Vendor", "SKIP", "No vendors available", 0);
    }

    // ========================================
    // PHASE 3: Test READ Operations
    // ========================================
    console.log("\n📖 PHASE 3: Testing READ Operations\n");

    // Test Read Invoice
    if (prereqData.invoices.length > 0) {
        try {
            const id = prereqData.invoices[0].Id;
            const start = Date.now();
            const result = await runInContext(config, () =>
                readQuickbooksInvoice(id)
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Read Invoice",
                    "PASS",
                    `Read invoice ${id}`,
                    duration
                );
            } else {
                logResult(
                    "Read Invoice",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Read Invoice", "FAIL", error.message, 0);
        }
    } else {
        logResult("Read Invoice", "SKIP", "No invoices available", 0);
    }

    // Test Read Item
    if (prereqData.items.length > 0) {
        try {
            const id = prereqData.items[0].Id;
            const start = Date.now();
            const result = await runInContext(config, () =>
                readQuickbooksItem(id)
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult("Read Item", "PASS", `Read item ${id}`, duration);
            } else {
                logResult(
                    "Read Item",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Read Item", "FAIL", error.message, 0);
        }
    } else {
        logResult("Read Item", "SKIP", "No items available", 0);
    }

    // ========================================
    // PHASE 4: Test UPDATE Operations
    // ========================================
    console.log("\n✏️  PHASE 4: Testing UPDATE Operations\n");

    // Test Update Customer
    if (prereqData.customers.length > 0) {
        try {
            const customer = prereqData.customers[0];
            const start = Date.now();
            const result = await runInContext(config, () =>
                updateQuickbooksCustomer({
                    ...customer,
                    Notes: `Test update at ${new Date().toISOString()}`,
                })
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Update Customer",
                    "PASS",
                    `Updated customer ${customer.Id}`,
                    duration
                );
            } else {
                logResult(
                    "Update Customer",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Update Customer", "FAIL", error.message, 0);
        }
    } else {
        logResult("Update Customer", "SKIP", "No customers available", 0);
    }

    // Test Update Vendor
    if (prereqData.vendors.length > 0) {
        try {
            const vendor = prereqData.vendors[0];
            const start = Date.now();
            const result = await runInContext(config, () =>
                updateQuickbooksVendor({
                    ...vendor,
                    Notes: `Test update at ${new Date().toISOString()}`,
                })
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Update Vendor",
                    "PASS",
                    `Updated vendor ${vendor.Id}`,
                    duration
                );
            } else {
                logResult(
                    "Update Vendor",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Update Vendor", "FAIL", error.message, 0);
        }
    } else {
        logResult("Update Vendor", "SKIP", "No vendors available", 0);
    }

    // Test Update Account (using patch method)
    if (prereqData.accounts.length > 0) {
        try {
            const account = prereqData.accounts[0];
            const start = Date.now();
            const result = await runInContext(config, () =>
                updateQuickbooksAccount({
                    account_id: account.Id,
                    patch: {
                        Description: `Test update at ${new Date().toISOString()}`,
                    },
                })
            );
            const duration = Date.now() - start;
            if (!result.isError) {
                logResult(
                    "Update Account",
                    "PASS",
                    `Updated account ${account.Id}`,
                    duration
                );
            } else {
                logResult(
                    "Update Account",
                    "FAIL",
                    result.error || "Unknown error",
                    duration
                );
            }
        } catch (error: any) {
            logResult("Update Account", "FAIL", error.message, 0);
        }
    } else {
        logResult("Update Account", "SKIP", "No accounts available", 0);
    }

    // ========================================
    // PHASE 5: Test CREATE Operations (Non-Destructive)
    // ========================================
    console.log(
        "\n➕ PHASE 5: Testing CREATE Operations (will create test entities)\n"
    );

    // Test Create Customer
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            createQuickbooksCustomer({
                DisplayName: `Test Customer ${Date.now()}`,
                GivenName: "Test",
                FamilyName: "Customer",
                PrimaryEmailAddr: {
                    Address: `test${Date.now()}@example.com`,
                },
            })
        );
        const duration = Date.now() - start;
        if (!result.isError) {
            logResult(
                "Create Customer",
                "PASS",
                `Created customer ${result.result?.Customer?.Id}`,
                duration
            );
            // Store for potential cleanup
            if (result.result?.Customer) {
                prereqData.customers.push(result.result.Customer);
            }
        } else {
            logResult(
                "Create Customer",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Create Customer", "FAIL", error.message, 0);
    }

    // Test Create Vendor
    try {
        const start = Date.now();
        const result = await runInContext(config, () =>
            createQuickbooksVendor({
                DisplayName: `Test Vendor ${Date.now()}`,
                PrimaryEmailAddr: {
                    Address: `vendor${Date.now()}@example.com`,
                },
            })
        );
        const duration = Date.now() - start;
        if (!result.isError) {
            logResult(
                "Create Vendor",
                "PASS",
                `Created vendor ${result.result?.Vendor?.Id}`,
                duration
            );
            if (result.result?.Vendor) {
                prereqData.vendors.push(result.result.Vendor);
            }
        } else {
            logResult(
                "Create Vendor",
                "FAIL",
                result.error || "Unknown error",
                duration
            );
        }
    } catch (error: any) {
        logResult("Create Vendor", "FAIL", error.message, 0);
    }

    // ========================================
    // FINAL REPORT
    // ========================================
    console.log("\n" + "=".repeat(80));
    console.log("TEST SUMMARY");
    console.log("=".repeat(80));

    const passed = testResults.filter((r) => r.status === "PASS").length;
    const failed = testResults.filter((r) => r.status === "FAIL").length;
    const skipped = testResults.filter((r) => r.status === "SKIP").length;
    const total = testResults.length;

    console.log(`\nTotal Tests: ${total}`);
    console.log(
        `✅ Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`
    );
    console.log(
        `❌ Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`
    );
    console.log(
        `⏭️  Skipped: ${skipped} (${((skipped / total) * 100).toFixed(1)}%)`
    );

    if (failed > 0) {
        console.log("\n❌ Failed Tests:");
        testResults
            .filter((r) => r.status === "FAIL")
            .forEach((r) => {
                console.log(`   - ${r.tool}: ${r.message}`);
            });
    }

    console.log("\n" + "=".repeat(80));

    // Return summary
    return {
        total,
        passed,
        failed,
        skipped,
        results: testResults,
        prereqData,
    };
}

// Main execution
async function main() {
    // Get credentials from command line arguments or environment variables
    const accessToken =
        process.argv[2] || process.env.QUICKBOOKS_ACCESS_TOKEN || "";
    const realmId = process.argv[3] || process.env.QUICKBOOKS_REALM_ID || "";

    if (!accessToken || !realmId) {
        console.error("❌ Error: Missing credentials");
        console.error("\nUsage:");
        console.error("  ts-node test-all-tools.ts <ACCESS_TOKEN> <REALM_ID>");
        console.error("\nOr set environment variables:");
        console.error("  QUICKBOOKS_ACCESS_TOKEN");
        console.error("  QUICKBOOKS_REALM_ID");
        process.exit(1);
    }

    try {
        const summary = await testAllTools({ accessToken, realmId });

        // Exit with error code if any tests failed
        process.exit(summary.failed > 0 ? 1 : 0);
    } catch (error) {
        console.error("\n❌ Fatal Error:", error);
        process.exit(1);
    }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { testAllTools, TestConfig, TestResult };
