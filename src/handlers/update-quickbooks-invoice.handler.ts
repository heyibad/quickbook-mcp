import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

export interface UpdateInvoiceInput {
    invoice_id: string;
    patch: Record<string, any>; // Sparse update fields per Quickbooks spec
}

export async function updateQuickbooksInvoice({
    invoice_id,
    patch,
}: UpdateInvoiceInput): Promise<ToolResponse<any>> {
    try {
        const { accessToken, realmId } = getQuickBooksCredentials();

        // Need SyncToken; fetch existing invoice first
        const existingResponse = await makeQuickBooksRequest({
            method: "GET",
            endpoint: `/invoice/${invoice_id}`,
            accessToken,
            realmId,
        });

        if (existingResponse.isError) {
            return {
                result: null,
                isError: true,
                error:
                    existingResponse.error ||
                    "Failed to retrieve existing invoice",
            };
        }

        const existing = existingResponse.result?.Invoice;
        const updatePayload = {
            ...existing,
            ...patch,
            Id: invoice_id,
            sparse: true,
        };

        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/invoice",
            body: updatePayload,
            accessToken,
            realmId,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to update invoice",
            };
        }

        return {
            result: response.result?.Invoice,
            isError: false,
            error: null,
        };
    } catch (error) {
        return { result: null, isError: true, error: formatError(error) };
    }
}
