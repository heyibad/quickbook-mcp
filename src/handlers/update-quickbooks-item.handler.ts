import {
    makeQuickBooksRequest,
    queryQuickBooks,
    extractAccessToken,
} from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface UpdateItemInput {
    item_id: string;
    patch: Record<string, any>; // Sparse update fields per Quickbooks spec
}

export async function updateQuickbooksItem({
    item_id,
    patch,
}: UpdateItemInput): Promise<ToolResponse<any>> {
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

        // Need SyncToken; fetch existing item first
        const existingResponse = await makeQuickBooksRequest({
            method: "GET",
            endpoint: `/item/${item_id}`,
            accessToken,
        });

        if (existingResponse.isError) {
            return {
                result: null,
                isError: true,
                error:
                    existingResponse.error ||
                    "Failed to retrieve existing item",
            };
        }

        const existing = existingResponse.result?.Item;
        const payload = { ...existing, ...patch, Id: item_id, sparse: true };

        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/item",
            body: payload,
            accessToken,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to update item",
            };
        }

        return { result: response.result?.Item, isError: false, error: null };
    } catch (error) {
        return { result: null, isError: true, error: formatError(error) };
    }
}
