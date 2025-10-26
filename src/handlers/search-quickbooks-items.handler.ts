import {
    makeQuickBooksRequest,
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

export type ItemSearchCriteria = QuickbooksSearchCriteriaInput;

export async function searchQuickbooksItems(
    criteria: ItemSearchCriteria
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

        const sqlQuery = convertCriteriaToSQL("Item", normalizedCriteria);

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
            result: response.result?.QueryResponse?.Item || [],
            isError: false,
            error: null,
        };
    } catch (error) {
        return { result: null, isError: true, error: formatError(error) };
    }
}
