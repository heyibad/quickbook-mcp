import { makeQuickBooksRequest, queryQuickBooks, extractAccessToken } from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Delete a vendor in QuickBooks Online
 */
export async function deleteQuickbooksVendor(vendor: any): Promise<ToolResponse<any>> {
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

    // Convert entity object to ID and SyncToken if needed
    let deleteBody: any;
    if (typeof vendor === 'object' && vendor.Id) {
      deleteBody = { Id: vendor.Id, SyncToken: vendor.SyncToken };
    } else {
      deleteBody = vendor;
    }

    const response = await makeQuickBooksRequest({
      method: "POST",
      endpoint: "/vendor",
      body: deleteBody,
      queryParams: { operation: "delete" },
      accessToken
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to delete vendor"
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
