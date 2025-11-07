import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

/**
 * Read a single invoice from QuickBooks Online by its ID
 */
export async function readQuickbooksInvoice(
    invoiceId: string
): Promise<ToolResponse<any>> {
    try {
        const { accessToken, realmId } = getQuickBooksCredentials();

        // Make direct API call to QuickBooks
        const response = await makeQuickBooksRequest({
            method: "GET",
            endpoint: `/invoice/${invoiceId}`,
            accessToken,
            realmId,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to retrieve invoice",
            };
        }

        return {
            result: response.result?.Invoice,
            isError: false,
            error: null,
        };
    } catch (error) {
        return {
            result: null,
            isError: true,
            error: formatError(error),
        };
    }
}
