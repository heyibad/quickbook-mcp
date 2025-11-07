import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

/**
 * Get a journal entry by ID from QuickBooks Online
 */
export async function getQuickbooksJournalEntry(id: string): Promise<ToolResponse<any>> {
  try {
    const { accessToken, realmId } = getQuickBooksCredentials();

    const response = await makeQuickBooksRequest({
      method: "GET",
      endpoint: `/journalentry/${id}`,
      accessToken,
      realmId
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to retrieve journalentry"
      };
    }

    return {
      result: response.result?.JournalEntry,
      isError: false,
      error: null
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
}
}
