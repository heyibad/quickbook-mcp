import { EntityConfig } from "./handler-factory.js";

/**
 * Registry of all QuickBooks entity configurations
 */
export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
    customer: {
        singular: "customer",
        plural: "customers",
        endpoint: "/customer",
        responseKey: "Customer",
    },
    vendor: {
        singular: "vendor",
        plural: "vendors",
        endpoint: "/vendor",
        responseKey: "Vendor",
    },
    employee: {
        singular: "employee",
        plural: "employees",
        endpoint: "/employee",
        responseKey: "Employee",
    },
    item: {
        singular: "item",
        plural: "items",
        endpoint: "/item",
        responseKey: "Item",
    },
    account: {
        singular: "account",
        plural: "accounts",
        endpoint: "/account",
        responseKey: "Account",
    },
    bill: {
        singular: "bill",
        plural: "bills",
        endpoint: "/bill",
        responseKey: "Bill",
    },
    billPayment: {
        singular: "bill payment",
        plural: "bill payments",
        endpoint: "/billpayment",
        responseKey: "BillPayment",
    },
    invoice: {
        singular: "invoice",
        plural: "invoices",
        endpoint: "/invoice",
        responseKey: "Invoice",
    },
    estimate: {
        singular: "estimate",
        plural: "estimates",
        endpoint: "/estimate",
        responseKey: "Estimate",
    },
    purchase: {
        singular: "purchase",
        plural: "purchases",
        endpoint: "/purchase",
        responseKey: "Purchase",
    },
    journalEntry: {
        singular: "journal entry",
        plural: "journal entries",
        endpoint: "/journalentry",
        responseKey: "JournalEntry",
    },
};
