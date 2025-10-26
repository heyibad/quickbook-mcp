import {
    queryQuickBooks,
    extractAccessToken,
} from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import {
    buildQuickbooksSearchCriteria,
    QuickbooksSearchCriteriaInput,
} from "../helpers/build-quickbooks-search-criteria.js";
import { convertCriteriaToSQL } from "../helpers/criteria-to-sql.js";

export type InvoiceSearchCriteria = QuickbooksSearchCriteriaInput;

/**
 * Search for invoices in QuickBooks Online using SQL-like query
 */
export async function searchQuickbooksInvoices(
    criteria: InvoiceSearchCriteria
): Promise<ToolResponse<any[]>> {
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

        const normalizedCriteria = buildQuickbooksSearchCriteria(criteria);

        // Convert criteria to SQL query string
        const sqlQuery = convertCriteriaToSQL("Invoice", normalizedCriteria);

        // Make query API call to QuickBooks
        const response = await queryQuickBooks({
            query: sqlQuery,
            accessToken,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Search failed",
            };
        }

        return {
            result: response.result?.QueryResponse?.Invoice || [],
            isError: false,
            error: null,
        };
    } catch (error) {
        return { result: null, isError: true, error: formatError(error) };
    }
}
