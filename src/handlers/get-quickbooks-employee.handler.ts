import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { makeQuickBooksRequest } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Get an employee by ID from QuickBooks Online
 */
export async function getQuickbooksEmployee(id: string): Promise<ToolResponse<any>> {
  try {
    // Get credentials from request headers
    const { accessToken, realmId } = getQuickBooksCredentials();

    const response = await makeQuickBooksRequest({
      method: "GET",
      endpoint: `/employee/${id}`,
      accessToken,
      realmId
    });

    if (response.isError) {
      return {
        result: null,
        isError: true,
        error: response.error || "Failed to retrieve employee"
      };
    }

    return {
      result: response.result?.Employee,
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
