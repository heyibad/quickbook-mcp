import {
    makeQuickBooksRequest,
    extractAccessToken,
} from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface CreateInvoiceInput {
    customer_ref: string; // customer id
    line_items: Array<{
        item_ref: string; // item id
        qty: number;
        unit_price: number;
        description?: string;
    }>;
    doc_number?: string;
    txn_date?: string; // YYYY-MM-DD
}

// Primitive field type map (based on Quickbooks Invoice entity reference docs)
const invoiceFieldTypeMap: Record<string, "string" | "number" | "boolean"> = {
    DocNumber: "string",
    TxnDate: "string",
    PrivateNote: "string",
    GlobalTaxCalculation: "string",
    ApplyTaxAfterDiscount: "boolean",
    TotalAmt: "number",
};

/**
 * Coerce primitive invoice fields to the expected QuickBooks Online types.
 */
function normalizeInvoiceFields(obj: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = { ...obj };
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null) continue;
        const expected = invoiceFieldTypeMap[key];
        if (!expected) continue; // skip if not a primitive field we validate

        switch (expected) {
            case "string":
                normalized[key] = String(value);
                break;
            case "number":
                normalized[key] =
                    typeof value === "number" ? value : Number(value);
                break;
            case "boolean":
                normalized[key] =
                    typeof value === "boolean" ? value : value === "true";
                break;
        }
    }
    return normalized;
}

export async function createQuickbooksInvoice(
    data: CreateInvoiceInput
): Promise<ToolResponse<any>> {
    try {
        // Get access token from request headers
        const headers = getRequestHeaders();
        const accessToken = extractAccessToken(headers);

        if (!accessToken) {
            return {
                result: null,
                isError: true,
                error: "Missing Authorization header. Please provide: Authorization: Bearer <access_token>",
            };
        }

        // Build invoice payload
        const invoicePayload: any = {
            CustomerRef: { value: data.customer_ref },
            Line: data.line_items.map((l, idx) => ({
                Id: `${idx + 1}`,
                LineNum: idx + 1,
                Description: l.description || undefined,
                Amount: l.qty * l.unit_price,
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                    ItemRef: { value: l.item_ref },
                    Qty: l.qty,
                    UnitPrice: l.unit_price,
                },
            })),
            DocNumber: data.doc_number,
            TxnDate: data.txn_date,
        };

        const normalizedPayload = normalizeInvoiceFields(invoicePayload);

        // Make direct API call to QuickBooks
        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/invoice",
            body: normalizedPayload,
            accessToken,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to create invoice",
            };
        }

        // QuickBooks returns the created invoice in response.Invoice
        const createdInvoice = response.result?.Invoice;

        return {
            result: createdInvoice,
            isError: false,
            error: null,
        };
    } catch (error) {
        return { result: null, isError: true, error: formatError(error) };
    }
}
