import {
    makeQuickBooksRequest,
    queryQuickBooks,
    extractAccessToken,
} from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { validateCustomerData } from "../schemas/customer.schema.js";

/**
 * Create a customer in QuickBooks Online
 * @param customerData The customer object to create
 */
export async function createQuickbooksCustomer(
    customerData: any
): Promise<ToolResponse<any>> {
    try {
        // Validate input data before making API call
        const validation = validateCustomerData(customerData);
        if (!validation.success) {
            return {
                result: null,
                isError: true,
                error: `Validation failed:\n${validation.errors?.join("\n")}`,
            };
        }

        // Get access token from request headers
        const headers = getRequestHeaders();
        const accessToken = extractAccessToken(headers);

        if (!accessToken) {
            return {
                result: null,
                isError: true,
                error: "Missing Authorization header. Please provide: Authorization: Bearer <access_token>",
            };
        }

        // Make direct API call to QuickBooks with validated data
        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/customer",
            body: validation.data,
            accessToken,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to create customer",
            };
        }

        return {
            result: response.result?.Customer,
            isError: false,
            error: null,
        };
    } catch (error) {
        return {
            result: null,
            isError: true,
            error: formatError(error),
        };
    }
}
