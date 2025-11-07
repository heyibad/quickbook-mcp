import {
    makeQuickBooksRequest,
    queryQuickBooks,
} from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { buildQuickbooksSearchCriteria } from "../helpers/build-quickbooks-search-criteria.js";
import { convertCriteriaToSQL } from "../helpers/criteria-to-sql.js";

/**
 * Search journal entries in QuickBooks Online that match given criteria
 */
export async function searchQuickbooksJournalEntries(
    params: any
): Promise<ToolResponse<any>> {
    try {
        const { accessToken, realmId } = getQuickBooksCredentials();

        const normalizedCriteria = buildQuickbooksSearchCriteria(params);
        const sqlQuery = convertCriteriaToSQL(
            "JournalEntry",
            normalizedCriteria
        );

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
            result: response.result?.QueryResponse?.JournalEntry || [],
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
