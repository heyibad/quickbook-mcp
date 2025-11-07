import { makeQuickBooksRequest, queryQuickBooks } from "../helpers/quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getQuickBooksCredentials } from "../helpers/request-context.js";

export interface UpdateAccountInput {
    account_id: string;
    patch: Record<string, any>;
}

// Reuse the same field-type map for normalization
const updateFieldTypeMap: Record<string, "string" | "boolean" | "number"> = {
    Name: "string",
    AccountType: "string",
    AccountSubType: "string",
    Description: "string",
    Classification: "string",
    Active: "boolean",
    SubAccount: "boolean",
    ParentRef: "string",
    CurrentBalance: "number",
};

function normalizePatch(patch: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
    Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined) return;
        const expectedType = updateFieldTypeMap[key];
        if (!expectedType) {
            normalized[key] = value;
            return;
        }
        switch (expectedType) {
            case "string":
                normalized[key] = String(value);
                break;
            case "boolean":
                normalized[key] =
                    typeof value === "boolean" ? value : value === "true";
                break;
            case "number":
                normalized[key] =
                    typeof value === "number" ? value : Number(value);
                break;
            default:
                normalized[key] = value;
        }
    });
    return normalized;
}

export async function updateQuickbooksAccount({
    account_id,
    patch,
}: UpdateAccountInput): Promise<ToolResponse<any>> {
    try {
        const { accessToken, realmId } = getQuickBooksCredentials();

        // First, get the existing account
        const existingResponse = await makeQuickBooksRequest({
            method: "GET",
            endpoint: `/account/${account_id}`,
            accessToken,
            realmId,
        });

        if (existingResponse.isError) {
            return {
                result: null,
                isError: true,
                error:
                    existingResponse.error ||
                    "Failed to retrieve existing account",
            };
        }

        const existing = existingResponse.result?.Account;

        // When merging existing with patch, normalize the patch first.
        const normalizedPatch = normalizePatch(patch);
        const payload = {
            ...existing,
            ...normalizedPatch,
            Id: account_id,
            sparse: true,
        };

        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/account",
            body: payload,
            accessToken,
            realmId,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to update account",
            };
        }

        return {
            result: response.result?.Account,
            isError: false,
            error: null,
        };
    } catch (error) {
        return { result: null, isError: true, error: formatError(error) };
    }
}
