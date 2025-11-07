import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

export interface UpdateItemInput {
    item_id: string;
    patch: Record<string, any>; // Sparse update fields per Quickbooks spec
}

export async function updateQuickbooksItem({
    item_id,
    patch,
}: UpdateItemInput): Promise<ToolResponse<any>> {
    try {
        const { accessToken, realmId } = getQuickBooksCredentials();

        // Need SyncToken; fetch existing item first
        const existingResponse = await makeQuickBooksRequest({
            method: "GET",
            endpoint: `/item/${item_id}`,
            accessToken,
            realmId,
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
            realmId,
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
