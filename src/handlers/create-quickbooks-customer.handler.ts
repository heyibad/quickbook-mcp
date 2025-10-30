import { makeQuickBooksRequest, extractAccessToken } from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { customerSchema } from "../schemas/customer.schema.js";

/**
 * Create a customer in QuickBooks Online
 * @param customerData The customer object to create
 */
export async function createQuickbooksCustomer(
    customerData: unknown
): Promise<ToolResponse<any>> {
    try {
        const validation = customerSchema.safeParse(customerData);

        if (!validation.success) {
            const message = validation.error.errors
                .map((error) => {
                    const path = error.path.length ? error.path.join(".") : "customer";
                    return `${path}: ${error.message}`;
                })
                .join("; ");

            return {
                result: null,
                isError: true,
                error: `Invalid customer data provided: ${message}`,
            };
        }

        const normalizedCustomer = validation.data;

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

        // Make direct API call to QuickBooks
        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/customer",
            body: normalizedCustomer,
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
