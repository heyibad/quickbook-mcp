import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { makeQuickBooksRequest } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Create an estimate in QuickBooks Online
 */
export async function createQuickbooksEstimate(estimateData: any): Promise<ToolResponse<any>> {
  try {
    // Get credentials from request headers
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
        error: response.error || "Failed to create estimate"
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
