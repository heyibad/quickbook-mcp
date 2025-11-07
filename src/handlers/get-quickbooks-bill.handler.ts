import {
    makeQuickBooksRequest,
    queryQuickBooks,
} from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

/**
 * Get a bill by ID from QuickBooks Online
 */
export async function getQuickbooksBill(
    id: string
): Promise<ToolResponse<any>> {
    try {
        console.log("[DEBUG] get-quickbooks-bill handler called with id:", id);

        const { accessToken, realmId } = getQuickBooksCredentials();
        console.log(
            "[DEBUG] Access token extracted:",
            accessToken ? "YES (length: " + accessToken.length + ")" : "NO"
        );

        console.log("[DEBUG] Making QuickBooks API request...");
        const response = await makeQuickBooksRequest({
            method: "GET",
            endpoint: `/bill/${id}`,
            accessToken,
            realmId,
        });

        console.log(
            "[DEBUG] QuickBooks API response:",
            response.isError ? "ERROR" : "SUCCESS"
        );

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to retrieve bill",
            };
        }

        return {
            result: response.result?.Bill,
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
