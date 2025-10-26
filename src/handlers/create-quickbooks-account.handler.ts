import {
    makeQuickBooksRequest,
    queryQuickBooks,
    extractAccessToken,
} from "../helpers/quickbooks-api.js";
import { getRequestHeaders } from "../helpers/request-context.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export interface CreateAccountInput {
    name: string;
    type: string; // e.g., Expense, Income, Bank, etc.
    sub_type?: string;
    description?: string;
}

// Helper to normalize field values to the correct data type expected by Quickbooks
const accountFieldTypeMap: Record<string, "string" | "boolean" | "number"> = {
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

function normalizeAccountPayload(
    payload: Record<string, any>
): Record<string, any> {
    const normalized: Record<string, any> = {};
    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return; // skip undefined
        const expectedType = accountFieldTypeMap[key];
        if (!expectedType) {
            // passthrough unknown keys without modification
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

export async function createQuickbooksAccount(
    data: CreateAccountInput
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

        // Build initial payload then normalize.
        const basePayload: any = {
            Name: data.name,
            AccountType: data.type,
            AccountSubType: data.sub_type,
            Description: data.description,
        };

        const payload = normalizeAccountPayload(basePayload);

        const response = await makeQuickBooksRequest({
            method: "POST",
            endpoint: "/account",
            body: payload,
            accessToken,
        });

        if (response.isError) {
            return {
                result: null,
                isError: true,
                error: response.error || "Failed to create account",
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
