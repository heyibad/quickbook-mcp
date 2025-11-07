import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { QuickbooksSearchCriteriaInput, buildQuickbooksSearchCriteria } from "../helpers/build-quickbooks-search-criteria.js";
import { convertCriteriaToSQL } from "../helpers/criteria-to-sql.js";

export type InvoiceSearchCriteria = QuickbooksSearchCriteriaInput;

/**
 * Search for invoices in QuickBooks Online using SQL-like query
 */
export async function searchQuickbooksInvoices(
    criteria: InvoiceSearchCriteria
): Promise<ToolResponse<any[]>> {
    try {
        const { accessToken, realmId } = getQuickBooksCredentials();

        const normalizedCriteria = buildQuickbooksSearchCriteria(criteria);

        // Convert criteria to SQL query string
        const sqlQuery = convertCriteriaToSQL("Invoice", normalizedCriteria);

        // Make query API call to QuickBooks
        const response = await queryQuickBooks({
            query: sqlQuery,
            accessToken,
            realmId,
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
