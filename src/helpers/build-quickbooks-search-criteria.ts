export interface QuickbooksFilter {
    /** Field/column name to filter on */
    field: string;
    /** Value to match against */
    value: any;
    /** Comparison operator to use (default '=') */
    operator?: string;
}

export interface AdvancedQuickbooksSearchOptions {
    /** Array of filter objects that map to QuickBooks query filters */
    filters?: QuickbooksFilter[];
    /** Sort ascending by the provided field */
    asc?: string;
    /** Sort descending by the provided field */
    desc?: string;
    /** Maximum number of rows to return */
    limit?: number;
    /** Number of rows to skip from the start of the result set */
    offset?: number;
    /** If true, only a count of rows is returned */
    count?: boolean;
    /** If true, transparently fetches all records. */
    fetchAll?: boolean;
}

/**
 * User-supplied criteria can be one of:
 *  1. A simple criteria object (e.g. { Name: 'Foo' })
 *  2. An array of objects specifying field/value/operator
 *  3. An {@link AdvancedQuickbooksSearchOptions} object that is translated to the array format expected by node-quickbooks
 */
export type QuickbooksSearchCriteriaInput =
    | Record<string, any>
    | Array<Record<string, any>>
    | AdvancedQuickbooksSearchOptions;

/**
 * Convert various input shapes into the criteria shape that `node-quickbooks` expects.
 *
 * If the input is already an object or array that `node-quickbooks` understands, it is returned untouched.
 * If the input is an {@link AdvancedQuickbooksSearchOptions} instance, it is converted to an array of
 * `{field, value, operator}` objects.
 */
export function buildQuickbooksSearchCriteria(
    input: QuickbooksSearchCriteriaInput
): Record<string, any> | Array<Record<string, any>> {
    // If the user supplied an array we assume they know what they're doing.
    if (Array.isArray(input)) {
        return input as Array<Record<string, any>>;
    }

    // If the input is a plain object, check if it contains ONLY pagination/sorting keys
    // or if it has actual filter fields
    const paginationSortKeys = [
        "asc",
        "desc",
        "limit",
        "offset",
        "count",
        "fetchAll",
    ];
    const advancedOptionsKeys = [...paginationSortKeys, "filters"];

    const inputKeys = Object.keys(input || {});

    // If it has 'filters' key, it's definitely advanced format
    if ("filters" in input) {
        // Advanced format with filters
        const options = input as AdvancedQuickbooksSearchOptions;
        const criteriaArr: Array<Record<string, any>> = [];

        // Convert filters
        options.filters?.forEach((f) => {
            criteriaArr.push({
                field: f.field,
                value: f.value,
                operator: f.operator,
            });
        });

        // Add pagination/sorting
        if (options.asc) criteriaArr.push({ field: "asc", value: options.asc });
        if (options.desc)
            criteriaArr.push({ field: "desc", value: options.desc });
        if (typeof options.limit === "number")
            criteriaArr.push({ field: "limit", value: options.limit });
        if (typeof options.offset === "number")
            criteriaArr.push({ field: "offset", value: options.offset });
        if (options.count) criteriaArr.push({ field: "count", value: true });
        if (options.fetchAll)
            criteriaArr.push({ field: "fetchAll", value: true });

        return criteriaArr.length > 0 ? criteriaArr : {};
    }

    // Check if ALL keys are pagination/sorting keys (no actual filter fields)
    const allKeysPaginationSort = inputKeys.every((k) =>
        paginationSortKeys.includes(k)
    );

    if (allKeysPaginationSort && inputKeys.length > 0) {
        // Only pagination/sorting, no filters - convert to array format
        const options = input as AdvancedQuickbooksSearchOptions;
        const criteriaArr: Array<Record<string, any>> = [];

        if (options.asc) criteriaArr.push({ field: "asc", value: options.asc });
        if (options.desc)
            criteriaArr.push({ field: "desc", value: options.desc });
        if (typeof options.limit === "number")
            criteriaArr.push({ field: "limit", value: options.limit });
        if (typeof options.offset === "number")
            criteriaArr.push({ field: "offset", value: options.offset });
        if (options.count) criteriaArr.push({ field: "count", value: true });
        if (options.fetchAll)
            criteriaArr.push({ field: "fetchAll", value: true });

        return criteriaArr.length > 0 ? criteriaArr : {};
    }

    // Check if it has SOME pagination/sorting keys mixed with filter fields
    const hasPaginationSortKeys = inputKeys.some((k) =>
        paginationSortKeys.includes(k)
    );
    const hasFilterKeys = inputKeys.some(
        (k) => !advancedOptionsKeys.includes(k)
    );

    if (hasPaginationSortKeys && hasFilterKeys) {
        // Mixed format: some filter fields + pagination/sorting
        // This is ambiguous, but we'll treat non-pagination keys as filters
        const criteriaArr: Array<Record<string, any>> = [];

        Object.entries(input).forEach(([key, value]) => {
            if (key === "asc") {
                criteriaArr.push({ field: "asc", value });
            } else if (key === "desc") {
                criteriaArr.push({ field: "desc", value });
            } else if (key === "limit") {
                criteriaArr.push({ field: "limit", value });
            } else if (key === "offset") {
                criteriaArr.push({ field: "offset", value });
            } else if (key === "count") {
                criteriaArr.push({ field: "count", value: true });
            } else if (key === "fetchAll") {
                criteriaArr.push({ field: "fetchAll", value: true });
            } else {
                // Regular filter field
                criteriaArr.push({ field: key, value, operator: "=" });
            }
        });

        return criteriaArr.length > 0 ? criteriaArr : {};
    }

    // Simple criteria object with only filter fields – pass through as-is
    return input as Record<string, any>;
}
