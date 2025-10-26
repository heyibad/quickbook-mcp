import {
    makeQuickBooksRequest,
    queryQuickBooks,
    extractAccessToken,
} from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Get a bill by ID from QuickBooks Online
 */
export async function getQuickbooksBill(
    id: string
): Promise<ToolResponse<any>> {
    try {
        console.log("[DEBUG] get-quickbooks-bill handler called with id:", id);

        // Get access token from request headers
        const headers = getRequestHeaders();
        console.log("[DEBUG] Headers retrieved from context");

        const accessToken = extractAccessToken(headers);
        console.log(
            "[DEBUG] Access token extracted:",
            accessToken ? "YES (length: " + accessToken.length + ")" : "NO"
        );

        if (!accessToken) {
            console.log(
                "[DEBUG] Returning error: Missing Authorization header"
            );
            return {
                result: null,
                isError: true,
                error: "Missing Authorization header. Please provide: Authorization: Bearer <access_token>",
            };
        }

        console.log("[DEBUG] Making QuickBooks API request...");
        const response = await makeQuickBooksRequest({
            method: "GET",
            endpoint: `/bill/${id}`,
            accessToken,
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
