#!/usr/bin/env node
import express, { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { QuickbooksMCPServer } from "./server/qbo-mcp-server.js";
import { requestContext } from "./helpers/request-context.js";
// import { ListInvoicesTool } from "./tools/list-invoices.tool.js";
// import { CreateCustomerTool } from "./tools/create-customer.tool.js";
import { CreateInvoiceTool } from "./tools/create-invoice.tool.js";
import { RegisterTool } from "./helpers/register-tool.js";
import { ReadInvoiceTool } from "./tools/read-invoice.tool.js";
import { SearchInvoicesTool } from "./tools/search-invoices.tool.js";
import { UpdateInvoiceTool } from "./tools/update-invoice.tool.js";
import { CreateAccountTool } from "./tools/create-account.tool.js";
import { UpdateAccountTool } from "./tools/update-account.tool.js";
import { SearchAccountsTool } from "./tools/search-accounts.tool.js";
import { ReadItemTool } from "./tools/read-item.tool.js";
import { SearchItemsTool } from "./tools/search-items.tool.js";
import { CreateItemTool } from "./tools/create-item.tool.js";
import { UpdateItemTool } from "./tools/update-item.tool.js";
// import { ListAccountsTool } from "./tools/list-accounts.tool.js";
// import { UpdateCustomerTool } from "./tools/update-customer.tool.js";
import { CreateCustomerTool } from "./tools/create-customer.tool.js";
import { GetCustomerTool } from "./tools/get-customer.tool.js";
import { UpdateCustomerTool } from "./tools/update-customer.tool.js";
import { DeleteCustomerTool } from "./tools/delete-customer.tool.js";
import { CreateEstimateTool } from "./tools/create-estimate.tool.js";
import { GetEstimateTool } from "./tools/get-estimate.tool.js";
import { UpdateEstimateTool } from "./tools/update-estimate.tool.js";
import { DeleteEstimateTool } from "./tools/delete-estimate.tool.js";
import { SearchCustomersTool } from "./tools/search-customers.tool.js";
import { SearchEstimatesTool } from "./tools/search-estimates.tool.js";
import { CreateBillTool } from "./tools/create-bill.tool.js";
import { UpdateBillTool } from "./tools/update-bill.tool.js";
import { DeleteBillTool } from "./tools/delete-bill.tool.js";
import { GetBillTool } from "./tools/get-bill.tool.js";
import { CreateVendorTool } from "./tools/create-vendor.tool.js";
import { UpdateVendorTool } from "./tools/update-vendor.tool.js";
import { DeleteVendorTool } from "./tools/delete-vendor.tool.js";
import { GetVendorTool } from "./tools/get-vendor.tool.js";
import { SearchBillsTool } from "./tools/search-bills.tool.js";
import { SearchVendorsTool } from "./tools/search-vendors.tool.js";

// Employee tools
import { CreateEmployeeTool } from "./tools/create-employee.tool.js";
import { GetEmployeeTool } from "./tools/get-employee.tool.js";
import { UpdateEmployeeTool } from "./tools/update-employee.tool.js";
import { SearchEmployeesTool } from "./tools/search-employees.tool.js";

// Journal Entry tools
import { CreateJournalEntryTool } from "./tools/create-journal-entry.tool.js";
import { GetJournalEntryTool } from "./tools/get-journal-entry.tool.js";
import { UpdateJournalEntryTool } from "./tools/update-journal-entry.tool.js";
import { DeleteJournalEntryTool } from "./tools/delete-journal-entry.tool.js";
import { SearchJournalEntriesTool } from "./tools/search-journal-entries.tool.js";

// Bill Payment tools
import { CreateBillPaymentTool } from "./tools/create-bill-payment.tool.js";
import { GetBillPaymentTool } from "./tools/get-bill-payment.tool.js";
import { UpdateBillPaymentTool } from "./tools/update-bill-payment.tool.js";
import { DeleteBillPaymentTool } from "./tools/delete-bill-payment.tool.js";
import { SearchBillPaymentsTool } from "./tools/search-bill-payments.tool.js";

// Purchase tools
import { CreatePurchaseTool } from "./tools/create-purchase.tool.js";
import { GetPurchaseTool } from "./tools/get-purchase.tool.js";
import { UpdatePurchaseTool } from "./tools/update-purchase.tool.js";
import { DeletePurchaseTool } from "./tools/delete-purchase.tool.js";
import { SearchPurchasesTool } from "./tools/search-purchases.tool.js";

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

const main = async () => {
    // Create an MCP server with registered tools
    const server = QuickbooksMCPServer.GetServer();

    // Add tools for customers
    RegisterTool(server, CreateCustomerTool);
    RegisterTool(server, GetCustomerTool);
    RegisterTool(server, UpdateCustomerTool);
    RegisterTool(server, DeleteCustomerTool);
    RegisterTool(server, SearchCustomersTool);

    // Add tools for estimates
    RegisterTool(server, CreateEstimateTool);
    RegisterTool(server, GetEstimateTool);
    RegisterTool(server, UpdateEstimateTool);
    RegisterTool(server, DeleteEstimateTool);
    RegisterTool(server, SearchEstimatesTool);

    // Add tools for bills
    RegisterTool(server, CreateBillTool);
    RegisterTool(server, UpdateBillTool);
    RegisterTool(server, DeleteBillTool);
    RegisterTool(server, GetBillTool);
    RegisterTool(server, SearchBillsTool);

    // Add tool to read a single invoice
    RegisterTool(server, ReadInvoiceTool);

    // Add tool to search invoices
    RegisterTool(server, SearchInvoicesTool);

    // Add tool to create invoice
    RegisterTool(server, CreateInvoiceTool);

    // Add tool to update invoice
    RegisterTool(server, UpdateInvoiceTool);

    // Chart of accounts tools
    RegisterTool(server, CreateAccountTool);
    RegisterTool(server, UpdateAccountTool);
    RegisterTool(server, SearchAccountsTool);

    // Add tool to read item
    RegisterTool(server, ReadItemTool);
    RegisterTool(server, SearchItemsTool);
    RegisterTool(server, CreateItemTool);
    RegisterTool(server, UpdateItemTool);

    // // Add a tool to create a customer
    // RegisterTool(server, CreateCustomerTool);

    // // Add tool to list accounts
    // RegisterTool(server, ListAccountsTool);

    // // Add tool to update a customer
    // RegisterTool(server, UpdateCustomerTool);

    // Add tools for vendors
    RegisterTool(server, CreateVendorTool);
    RegisterTool(server, UpdateVendorTool);
    RegisterTool(server, DeleteVendorTool);
    RegisterTool(server, GetVendorTool);
    RegisterTool(server, SearchVendorsTool);

    // Add tools for employees
    RegisterTool(server, CreateEmployeeTool);
    RegisterTool(server, GetEmployeeTool);
    RegisterTool(server, UpdateEmployeeTool);
    RegisterTool(server, SearchEmployeesTool);

    // Add tools for journal entries
    RegisterTool(server, CreateJournalEntryTool);
    RegisterTool(server, GetJournalEntryTool);
    RegisterTool(server, UpdateJournalEntryTool);
    RegisterTool(server, DeleteJournalEntryTool);
    RegisterTool(server, SearchJournalEntriesTool);

    // Add tools for bill payments
    RegisterTool(server, CreateBillPaymentTool);
    RegisterTool(server, GetBillPaymentTool);
    RegisterTool(server, UpdateBillPaymentTool);
    RegisterTool(server, DeleteBillPaymentTool);
    RegisterTool(server, SearchBillPaymentsTool);

    // Add tools for purchases
    RegisterTool(server, CreatePurchaseTool);
    RegisterTool(server, GetPurchaseTool);
    RegisterTool(server, UpdatePurchaseTool);
    RegisterTool(server, DeletePurchaseTool);
    RegisterTool(server, SearchPurchasesTool);

    // Create Express app to handle HTTP requests
    const app = express();
    app.use(express.json());

    // Handle POST/GET/DELETE requests for Streamable HTTP transport
    app.all("/mcp", async (req: Request, res: Response) => {
        console.log(`Received ${req.method} request to /mcp`);

        // Run the request handler within an async context that stores headers
        await requestContext.run({ headers: req.headers, req }, async () => {
            let transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
                //  enableJsonResponse: true
            });

            // Connect the transport to the MCP server
            await server.connect(transport);

            // Handle the request with the transport
            await transport.handleRequest(req, res, req.body);
        });
    });

    // Start the HTTP server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`QuickBooks Online MCP Server listening on port ${PORT}`);
        console.log(`Endpoint: http://localhost:${PORT}/mcp`);
    });

    // Handle server shutdown
    process.on("SIGINT", async () => {
        console.log("Shutting down server...");
        // Close all transports
        for (const sessionId in transports) {
            await transports[sessionId].close();
        }
        process.exit(0);
    });
};

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
