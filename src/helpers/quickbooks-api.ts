import dotenv from "dotenv";

dotenv.config();

const REALM_ID = process.env.QUICKBOOKS_REALM_ID;
const ENVIRONMENT = process.env.QUICKBOOKS_ENVIRONMENT || "sandbox";

if (!REALM_ID) {
    throw new Error("QUICKBOOKS_REALM_ID must be set in environment variables");
}

// Base URLs for QuickBooks API
const BASE_URLS = {
    sandbox: "https://sandbox-quickbooks.api.intuit.com",
    production: "https://quickbooks.api.intuit.com",
} as const;

const BASE_URL =
    BASE_URLS[ENVIRONMENT as keyof typeof BASE_URLS] || BASE_URLS.sandbox;

/**
 * Configuration for making QuickBooks API requests
 */
export interface QuickBooksRequestConfig {
    /** HTTP method (GET, POST, PUT, DELETE) */
    method: "GET" | "POST" | "PUT" | "DELETE";
    /** API endpoint path (e.g., "/invoice", "/customer") */
    endpoint: string;
    /** Request body for POST/PUT requests */
    body?: any;
    /** Query parameters */
    queryParams?: Record<string, string>;
    /** Access token from request headers */
    accessToken: string;
    /** QuickBooks Realm ID (company ID) */
    realmId: string;
    /** Minor version for QuickBooks API (default: 65) */
    minorVersion?: number;
}

/**
 * Response from QuickBooks API calls
 */
export interface QuickBooksResponse<T = any> {
    isError: boolean;
    result?: T;
    error?: string;
    statusCode?: number;
}

/**
 * Makes a direct HTTP call to QuickBooks Online API
 *
 * @param config Request configuration
 * @returns Promise with the API response
 *
 * @example
 * ```typescript
 * const result = await makeQuickBooksRequest({
 *   method: "POST",
 *   endpoint: "/invoice",
 *   body: { CustomerRef: { value: "1" }, Line: [...] },
 *   accessToken: "Bearer eyJxxxxx..."
 * });
 * ```
 */
export async function makeQuickBooksRequest<T = any>(
    config: QuickBooksRequestConfig
): Promise<QuickBooksResponse<T>> {
    const {
        method,
        endpoint,
        body,
        queryParams = {},
        accessToken,
        realmId,
        minorVersion = 65,
    } = config;

    try {
        // Build the full URL using the provided realmId
        const url = new URL(`${BASE_URL}/v3/company/${realmId}${endpoint}`);

        // Add minor version to query params
        url.searchParams.append("minorversion", minorVersion.toString());

        // Add any additional query params
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        // Make the HTTP request
        const response = await fetch(url.toString(), {
            method,
            headers: {
                Authorization: accessToken.startsWith("Bearer ")
                    ? accessToken
                    : `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        // Parse response
        const responseData = await response.json();

        // Check for errors
        if (!response.ok) {
            const errorMessage =
                responseData?.Fault?.Error?.[0]?.Message ||
                responseData?.error_description ||
                `API request failed with status ${response.status}`;

            return {
                isError: true,
                error: errorMessage,
                statusCode: response.status,
            };
        }

        // Return successful response
        return {
            isError: false,
            result: responseData,
            statusCode: response.status,
        };
    } catch (error: any) {
        return {
            isError: true,
            error: `Network error: ${error.message}`,
        };
    }
}

/**
 * Extract access token from MCP request headers or metadata
 *
 * @param headers Headers object from the request
 * @returns Access token string or undefined
 */
export function extractAccessToken(
    headers: Record<string, string | string[] | undefined>
): string | undefined {
    // Debug logging
    console.log("[DEBUG] Extracting token from headers:", Object.keys(headers));

    // Check for Authorization header (most common)
    const authHeader = headers["authorization"] || headers["Authorization"];

    if (authHeader) {
        const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        console.log(
            "[DEBUG] Found Authorization header:",
            token?.substring(0, 50) + "..."
        );
        // Remove "Bearer " prefix if present
        return token.replace(/^Bearer\s+/i, "");
    }

    // Check for X-QuickBooks-Token custom header (alternative)
    const customHeader =
        headers["x-quickbooks-token"] || headers["X-QuickBooks-Token"];
    if (customHeader) {
        const token = Array.isArray(customHeader)
            ? customHeader[0]
            : customHeader;
        console.log(
            "[DEBUG] Found X-QuickBooks-Token header:",
            token?.substring(0, 50) + "..."
        );
        return token;
    }

    console.log("[DEBUG] No access token found in headers");
    return undefined;
}

/**
 * Helper to perform QuickBooks queries (SQL-like)
 *
 * @example
 * ```typescript
 * const customers = await queryQuickBooks({
 *   query: "SELECT * FROM Customer WHERE DisplayName LIKE 'John%'",
 *   accessToken: token,
 *   realmId: "123456789"
 * });
 * ```
 */
export async function queryQuickBooks<T = any>(config: {
    query: string;
    accessToken: string;
    realmId: string;
    minorVersion?: number;
}): Promise<QuickBooksResponse<T>> {
    return makeQuickBooksRequest<T>({
        method: "GET",
        endpoint: "/query",
        queryParams: { query: config.query },
        accessToken: config.accessToken,
        realmId: config.realmId,
        minorVersion: config.minorVersion,
    });
}
