import { getQuickBooksCredentials } from "../helpers/request-context.js";
import { makeQuickBooksRequest } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface CreateItemInput {
    name: string;
    type: string; // Service, Inventory, etc.
    income_account_ref: string; // account id
    expense_account_ref?: string;
    unit_price?: number;
    description?: string;
}

export async function createQuickbooksItem(
    data: CreateItemInput
): Promise<ToolResponse<any>> {
    try {
        // Get credentials from request headers
        const { accessToken, realmId } = getQuickBooksCredentials();

        const payload = {
            Name: data.name,
            Type: data.type,
            IncomeAccountRef: { value: data.income_account_ref },
            ExpenseAccountRef: data.expense_account_ref
                ? { value: data.expense_account_ref }
                : undefined,
            UnitPrice: data.unit_price,
            Description: data.description,
        };

        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/item",
            body: payload,
            accessToken,
            realmId,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to create item",
            };
        }

        return { result: response.result?.Item, isError: false, error: null };
    } catch (error) {
        return { result: null, isError: true, error: formatError(error) };
    }
}
