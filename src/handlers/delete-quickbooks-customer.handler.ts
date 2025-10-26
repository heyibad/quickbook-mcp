import {
    makeQuickBooksRequest,
    queryQuickBooks,
    extractAccessToken,
} from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

/**
 * Delete a customer (makes them inactive) in QuickBooks Online
 * Accepts either customer id or full customer entity as required by node-quickbooks
 */
export async function deleteQuickbooksCustomer(
    idOrEntity: any
): Promise<ToolResponse<any>> {
    try {
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

        // Try to delete using the delete operation first
        let deleteBody: any;
        if (typeof idOrEntity === "object" && idOrEntity.Id) {
            deleteBody = { Id: idOrEntity.Id, SyncToken: idOrEntity.SyncToken };
        } else {
            // Need to fetch the entity first to get SyncToken
            const getResponse = await makeQuickBooksRequest({
                method: "GET",
                endpoint: `/customer/${idOrEntity}`,
                accessToken,
            });

            if (getResponse.isError) {
                return {
                    result: null,
                    isError: true,
                    error:
                        getResponse.error ||
                        "Failed to retrieve customer for deletion",
                };
            }

            const customer = getResponse.result?.Customer;
            deleteBody = { Id: customer.Id, SyncToken: customer.SyncToken };
        }

        const deleteResponse = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/customer",
            body: deleteBody,
            queryParams: { operation: "delete" },
            accessToken,
        });

        // If delete fails, fall back to marking as inactive
        if (deleteResponse.isError) {
            // Fetch latest entity
            const customerId = deleteBody.Id;
            const getResponse = await makeQuickBooksRequest({
                method: "GET",
                endpoint: `/customer/${customerId}`,
                accessToken,
            });

            if (getResponse.isError) {
                return {
                    result: null,
                    isError: true,
                    error:
                        getResponse.error ||
                        "Failed to retrieve customer for inactive update",
                };
            }

            const customer = getResponse.result?.Customer;

            // Mark as inactive
            const inactivePayload = {
                ...customer,
                Active: false,
                sparse: true,
            };

            const updateResponse = await makeQuickBooksRequest({
                method: "POST",
                endpoint: "/customer",
                body: inactivePayload,
                accessToken,
            });

            if (updateResponse.isError) {
                return {
                    result: null,
                    isError: true,
                    error:
                        updateResponse.error ||
                        "Failed to mark customer as inactive",
                };
            }

            return {
                result: updateResponse.result?.Customer,
                isError: false,
                error: null,
            };
        }

        return {
            result: deleteResponse.result?.Customer,
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
