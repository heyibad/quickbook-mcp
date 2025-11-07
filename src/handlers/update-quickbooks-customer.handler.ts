import {
    makeQuickBooksRequest,
    queryQuickBooks,
} from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

/**
 * Update an existing customer in QuickBooks Online
 * The customerData object must include Id and SyncToken per Quickbooks API requirements
 */
export async function updateQuickbooksCustomer(
    customerData: any
): Promise<ToolResponse<any>> {
    try {
        const { accessToken, realmId } = getQuickBooksCredentials();

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
                error: response.error || "Failed to update customer",
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
