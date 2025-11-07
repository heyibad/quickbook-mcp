import { getQuickBooksCredentials } from "../helpers/request-context.js";
import {
    makeQuickBooksRequest,
    queryQuickBooks,
} from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Retrieve a single customer by Id from QuickBooks Online
 */
export async function getQuickbooksCustomer(
    id: string
): Promise<ToolResponse<any>> {
    try {
        // Get credentials from request headers
        const { accessToken, realmId } = getQuickBooksCredentials();

        const response = await makeQuickBooksRequest({
            method: "GET",
            endpoint: `/customer/${id}`,
            accessToken,
            realmId,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to retrieve customer",
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
