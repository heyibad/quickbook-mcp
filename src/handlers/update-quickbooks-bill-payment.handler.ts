import { makeQuickBooksRequest, queryQuickBooks, extractAccessToken } from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Update a bill payment in QuickBooks Online
 * @param billPaymentData The bill payment object to update
 */
export async function updateQuickbooksBillPayment(billPaymentData: any): Promise<ToolResponse<any>> {
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
      method: "POST",
      endpoint: "/billpayment",
      body: billPaymentData,
      accessToken
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to update billpayment"
      };
    }

    return {
      result: response.result?.BillPayment,
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
