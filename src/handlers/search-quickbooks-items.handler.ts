import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { QuickbooksSearchCriteriaInput, buildQuickbooksSearchCriteria } from "../helpers/build-quickbooks-search-criteria.js";
import { convertCriteriaToSQL } from "../helpers/criteria-to-sql.js";

export type ItemSearchCriteria = QuickbooksSearchCriteriaInput;

export async function searchQuickbooksItems(
    criteria: ItemSearchCriteria
): Promise<ToolResponse<any[]>> {
    try {
        const { accessToken, realmId } = getQuickBooksCredentials();

        const normalizedCriteria = buildQuickbooksSearchCriteria(criteria);

        const sqlQuery = convertCriteriaToSQL("Item", normalizedCriteria);

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
            result: response.result?.QueryResponse?.Item || [],
            isError: false,
            error: null,
        };
    } catch (error) {
        return { result: null, isError: true, error: formatError(error) };
    }
}
