import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

/**
 * Retrieve a single estimate by Id from QuickBooks Online
 */
export async function getQuickbooksEstimate(id: string): Promise<ToolResponse<any>> {
  try {
    const { accessToken, realmId } = getQuickBooksCredentials();

    const response = await makeQuickBooksRequest({
      method: "GET",
      endpoint: `/estimate/${id}`,
      accessToken,
      realmId
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to retrieve estimate"
      };
    }

    return {
      result: response.result?.Estimate,
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
