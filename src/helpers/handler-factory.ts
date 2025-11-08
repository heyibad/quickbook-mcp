import { getQuickBooksCredentials } from "./request-context.js";
import { makeQuickBooksRequest, queryQuickBooks } from "./quickbooks-api.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "./format-error.js";
import { buildQuickbooksSearchCriteria } from "./build-quickbooks-search-criteria.js";
import { convertCriteriaToSQL } from "./criteria-to-sql.js";

/**
 * Entity configuration for handler factories
 */
export interface EntityConfig {
    /** Entity name in singular form (e.g., "customer", "vendor") */
    singular: string;
    /** Entity name in plural form (e.g., "customers", "vendors") */
    plural: string;
    /** QuickBooks API endpoint path (e.g., "/customer", "/vendor") */
    endpoint: string;
    /** Response property name in QuickBooks API (e.g., "Customer", "Vendor") */
    responseKey: string;
}

/**
 * Create a generic "create entity" handler
 * @param config Entity configuration
 * @returns Handler function
 */
export function createEntityHandler(config: EntityConfig) {
    return async (entityData: any): Promise<ToolResponse<any>> => {
        try {
            const { accessToken, realmId } = getQuickBooksCredentials();

            const response = await makeQuickBooksRequest({
                method: "POST",
                endpoint: config.endpoint,
                body: entityData,
                accessToken,
                realmId,
            });

            if (response.isError) {
                return {
                    result: null,
                    isError: true,
                    error:
                        response.error ||
                        `Failed to create ${config.singular}`,
                };
            }

            return {
                result: response.result?.[config.responseKey],
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
    };
}

/**
 * Create a generic "get entity by ID" handler
 * @param config Entity configuration
 * @returns Handler function
 */
export function getEntityHandler(config: EntityConfig) {
    return async (id: string): Promise<ToolResponse<any>> => {
        try {
            const { accessToken, realmId } = getQuickBooksCredentials();

            const response = await makeQuickBooksRequest({
                method: "GET",
                endpoint: `${config.endpoint}/${id}`,
                accessToken,
                realmId,
            });

            if (response.isError) {
                return {
                    result: null,
                    isError: true,
                    error:
                        response.error ||
                        `Failed to retrieve ${config.singular}`,
                };
            }

            return {
                result: response.result?.[config.responseKey],
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
    };
}

/**
 * Create a generic "update entity" handler
 * @param config Entity configuration
 * @returns Handler function
 */
export function updateEntityHandler(config: EntityConfig) {
    return async (entityData: any): Promise<ToolResponse<any>> => {
        try {
            const { accessToken, realmId } = getQuickBooksCredentials();

            const response = await makeQuickBooksRequest({
                method: "POST",
                endpoint: config.endpoint,
                body: entityData,
                accessToken,
                realmId,
            });

            if (response.isError) {
                return {
                    result: null,
                    isError: true,
                    error:
                        response.error ||
                        `Failed to update ${config.singular}`,
                };
            }

            return {
                result: response.result?.[config.responseKey],
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
    };
}

/**
 * Create a generic "delete entity" handler
 * @param config Entity configuration
 * @returns Handler function
 */
export function deleteEntityHandler(config: EntityConfig) {
    return async (params: {
        id: string;
        syncToken: string;
    }): Promise<ToolResponse<any>> => {
        try {
            const { accessToken, realmId } = getQuickBooksCredentials();

            const response = await makeQuickBooksRequest({
                method: "POST",
                endpoint: `${config.endpoint}`,
                queryParams: {
                    operation: "delete",
                },
                body: {
                    Id: params.id,
                    SyncToken: params.syncToken,
                },
                accessToken,
                realmId,
            });

            if (response.isError) {
                return {
                    result: null,
                    isError: true,
                    error:
                        response.error ||
                        `Failed to delete ${config.singular}`,
                };
            }

            return {
                result: response.result?.[config.responseKey],
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
    };
}

/**
 * Create a generic "search entities" handler
 * @param config Entity configuration
 * @returns Handler function
 */
export function searchEntityHandler(config: EntityConfig) {
    return async (
        criteria: object | Array<Record<string, any>> = {}
    ): Promise<ToolResponse<any[]>> => {
        try {
            const { accessToken, realmId } = getQuickBooksCredentials();

            const normalizedCriteria = buildQuickbooksSearchCriteria(criteria);
            const sqlQuery = convertCriteriaToSQL(
                config.responseKey,
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
                result:
                    response.result?.QueryResponse?.[config.responseKey] || [],
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
    };
}

/**
 * Create a generic "read entity" handler (alias for get)
 * @param config Entity configuration
 * @returns Handler function
 */
export function readEntityHandler(config: EntityConfig) {
    return getEntityHandler(config);
}
