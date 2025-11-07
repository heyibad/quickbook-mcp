import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

/**
 * Update an estimate in QuickBooks Online (must include Id and SyncToken)
 */
export async function updateQuickbooksEstimate(estimateData: any): Promise<ToolResponse<any>> {
  try {
    const { accessToken, realmId } = getQuickBooksCredentials();

    const response = await makeQuickBooksRequest({
      method: "POST",
      endpoint: "/estimate",
      body: estimateData,
      accessToken,
      realmId
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to update estimate"
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
