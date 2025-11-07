import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Create a customer in QuickBooks Online
 * @param customerData The customer object to create
 */
export async function createQuickbooksCustomer(
    customerData: any
): Promise<ToolResponse<any>> {
    try {
        // Get credentials from request headers
        const { accessToken, realmId } = getQuickBooksCredentials();

        // Make direct API call to QuickBooks
        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/customer",
            body: customerData,
            accessToken,
            realmId,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to create customer",
            };
        }

        return {
            result: response.result?.Customer,
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
