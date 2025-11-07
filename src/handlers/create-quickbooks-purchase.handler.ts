import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { makeQuickBooksRequest } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Create a purchase in QuickBooks Online
 * @param purchaseData The purchase object to create
 */
export async function createQuickbooksPurchase(purchaseData: any): Promise<ToolResponse<any>> {
  try {
    // Get credentials from request headers
    const { accessToken, realmId } = getQuickBooksCredentials();

    const response = await makeQuickBooksRequest({
      method: "POST",
      endpoint: "/purchase",
      body: purchaseData,
      accessToken,
      realmId
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to create purchase"
      };
    }

    return {
      result: response.result?.Purchase,
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
