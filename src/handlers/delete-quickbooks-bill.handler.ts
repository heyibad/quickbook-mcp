import { makeQuickBooksRequest, queryQuickBooks, extractAccessToken } from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Delete a bill in QuickBooks Online
 */
export async function deleteQuickbooksBill(bill: any): Promise<ToolResponse<any>> {
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
    if (typeof bill === 'object' && bill.Id) {
      deleteBody = { Id: bill.Id, SyncToken: bill.SyncToken };
    } else {
      deleteBody = bill;
    }

    const response = await makeQuickBooksRequest({
      method: "POST",
      endpoint: "/bill",
      body: deleteBody,
      queryParams: { operation: "delete" },
      accessToken
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to delete bill"
      };
    }

    return {
      result: response.result?.Bill,
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
