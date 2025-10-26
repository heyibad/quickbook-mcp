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
