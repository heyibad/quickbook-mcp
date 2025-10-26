import { makeQuickBooksRequest, queryQuickBooks, extractAccessToken } from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Get a journal entry by ID from QuickBooks Online
 */
export async function getQuickbooksJournalEntry(id: string): Promise<ToolResponse<any>> {
  try {
    // Get access token from request headers
    const headers = getRequestHeaders();
    const accessToken = extractAccessToken(headers);
    
    if (!accessToken) {
      return {
        result: null,
        isError: true,
        error: "Missing Authorization header. Please provide: Authorization: Bearer <access_token>"
      };
    }

    const response = await makeQuickBooksRequest({
      method: "GET",
      endpoint: `/journalentry/${id}`,
      accessToken
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
