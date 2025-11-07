import { AsyncLocalStorage } from "async_hooks";
import { Request } from "express";

/**
 * Context that contains request-specific data like headers
 */
export interface RequestContext {
    /** HTTP headers from the incoming request */
    headers: Record<string, string | string[] | undefined>;
    /** Full Express request object (optional) */
    req?: Request;
}

/**
 * AsyncLocalStorage to store request context across async operations
 * This allows tool handlers to access request headers without explicit passing
 */
export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Get the current request context (headers, etc.)
 *
 * @returns Request context if available, undefined otherwise
 * @throws Error if called outside of a request context
 */
export function getRequestContext(): RequestContext {
    const context = requestContext.getStore();

    if (!context) {
        throw new Error(
            "Request context not available. This function must be called within a tool handler during an active request."
        );
    }

    return context;
}

/**
 * Get headers from the current request context
 *
 * @returns HTTP headers object
 * @throws Error if called outside of a request context
 */
export function getRequestHeaders(): Record<
    string,
    string | string[] | undefined
> {
    const context = getRequestContext();

    // Debug logging
    console.log(
        "[DEBUG] Request headers:",
        JSON.stringify(context.headers, null, 2)
    );

    return context.headers;
}

/**
 * Safely get request context without throwing
 *
 * @returns Request context if available, undefined otherwise
 */
export function tryGetRequestContext(): RequestContext | undefined {
    return requestContext.getStore();
}

/**
 * Extract access token from request headers
 * Supports both "Authorization: Bearer <token>" and "X-Access-Token: <token>" formats
 *
 * @returns Access token string or null if not found
 */
export function getAccessToken(): string | null {
    const headers = getRequestHeaders();
    
    // Try Authorization header first (Bearer token)
    const authHeader = headers.authorization || headers.Authorization;
    if (authHeader) {
        const bearerMatch = String(authHeader).match(/^Bearer\s+(.+)$/i);
        if (bearerMatch) {
            return bearerMatch[1];
        }
    }
    
    // Try X-Access-Token header
    const tokenHeader = headers['x-access-token'] || headers['X-Access-Token'];
    if (tokenHeader) {
        return String(tokenHeader);
    }
    
    return null;
}

/**
 * Extract QuickBooks Realm ID from request headers
 * Supports "X-Realm-Id" or "X-QuickBooks-Realm-Id" headers
 *
 * @returns Realm ID string or null if not found
 */
export function getRealmId(): string | null {
    const headers = getRequestHeaders();
    
    // Try various header formats
    const realmId = 
        headers['x-realm-id'] || 
        headers['X-Realm-Id'] ||
        headers['x-quickbooks-realm-id'] ||
        headers['X-QuickBooks-Realm-Id'];
    
    if (realmId) {
        return String(realmId);
    }
    
    return null;
}

/**
 * Get QuickBooks credentials from request headers
 * 
 * @returns Object with accessToken and realmId
 * @throws Error if required credentials are missing
 */
export function getQuickBooksCredentials(): { accessToken: string; realmId: string } {
    const accessToken = getAccessToken();
    const realmId = getRealmId();
    
    if (!accessToken) {
        throw new Error(
            "Missing access token. Please provide via 'Authorization: Bearer <token>' or 'X-Access-Token' header."
        );
    }
    
    if (!realmId) {
        throw new Error(
            "Missing QuickBooks Realm ID. Please provide via 'X-Realm-Id' or 'X-QuickBooks-Realm-Id' header."
        );
    }
    
    return { accessToken, realmId };
}
