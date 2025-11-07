import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { makeQuickBooksRequest } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Delete (make inactive) a journal entry in QuickBooks Online
 * @param idOrEntity The journal entry ID or entity to delete
 */
export async function deleteQuickbooksJournalEntry(
    idOrEntity: any
): Promise<ToolResponse<any>> {
    try {
        // Get credentials from request headers
        const { accessToken, realmId } = getQuickBooksCredentials();

        // Convert entity object to ID and SyncToken if needed
        let deleteBody: any;
        if (typeof idOrEntity === "object" && idOrEntity.Id) {
            deleteBody = { Id: idOrEntity.Id, SyncToken: idOrEntity.SyncToken };
        } else {
            deleteBody = idOrEntity;
        }

        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/journalentry",
            body: deleteBody,
            queryParams: { operation: "delete" },
            accessToken,
            realmId,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to delete journalentry",
            };
        }

        return {
            result: response.result?.JournalEntry,
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
