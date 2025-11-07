import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

/**
 * Update a journal entry in QuickBooks Online
 * @param journalEntryData The journal entry object to update
 */
export async function updateQuickbooksJournalEntry(journalEntryData: any): Promise<ToolResponse<any>> {
  try {
    const { accessToken, realmId } = getQuickBooksCredentials();

    const response = await makeQuickBooksRequest({
      method: "POST",
      endpoint: "/journalentry",
      body: journalEntryData,
      accessToken,
      realmId
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to update journalentry"
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
