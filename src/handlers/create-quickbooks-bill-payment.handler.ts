import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { makeQuickBooksRequest } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Create a bill payment in QuickBooks Online
 * @param billPaymentData The bill payment object to create
 */
export async function createQuickbooksBillPayment(
    billPaymentData: any
): Promise<ToolResponse<any>> {
    try {
        // Get credentials from request headers
        const { accessToken, realmId } = getQuickBooksCredentials();

        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/billpayment",
            body: billPaymentData,
            accessToken,
            realmId,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to create billpayment",
            };
        }

        return {
            result: response.result?.BillPayment,
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
