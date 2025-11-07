import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { makeQuickBooksRequest } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Create a vendor in QuickBooks Online
 */
export async function createQuickbooksVendor(vendor: any): Promise<ToolResponse<any>> {
  try {
    // Get credentials from request headers
    const { accessToken, realmId } = getQuickBooksCredentials();

    const response = await makeQuickBooksRequest({
      method: "POST",
      endpoint: "/vendor",
      body: vendor,
      accessToken,
      realmId
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to create vendor"
      };
    }

    return {
      result: response.result?.Vendor,
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
