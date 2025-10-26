/**
 * Convert node-quickbooks style criteria to QuickBooks SQL query string
 */

export function convertCriteriaToSQL(
    entity: string,
    criteria: Record<string, any> | Array<Record<string, any>>
): string {
    let whereClauses: string[] = [];
    let orderBy: string | null = null;
    let limit: number | null = null;
    let offset: number | null = null;

    // Handle array format (from buildQuickbooksSearchCriteria)
    if (Array.isArray(criteria)) {
        criteria.forEach((item) => {
            const { field, value, operator = "=" } = item;

            if (field === "asc") {
                orderBy = `${value} ASC`;
            } else if (field === "desc") {
                orderBy = `${value} DESC`;
            } else if (field === "limit") {
                limit = value;
            } else if (field === "offset") {
                offset = value;
            } else if (field === "count") {
                // COUNT queries are handled differently
                return `SELECT COUNT(*) FROM ${entity}`;
            } else {
                // Regular filter
                const formattedValue =
                    typeof value === "string"
                        ? `'${value.replace(/'/g, "\\'")}'`
                        : value;
                whereClauses.push(`${field} ${operator} ${formattedValue}`);
            }
        });
    }
    // Handle object format (simple key-value pairs)
    else if (typeof criteria === "object") {
        Object.entries(criteria).forEach(([key, value]) => {
            const formattedValue =
                typeof value === "string"
                    ? `'${value.replace(/'/g, "\\'")}'`
                    : value;
            whereClauses.push(`${key} = ${formattedValue}`);
        });
    }

    // Build the SQL query
    let sql = `SELECT * FROM ${entity}`;

    if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    if (orderBy) {
        sql += ` ORDER BY ${orderBy}`;
    }

    if (limit) {
        sql += ` MAXRESULTS ${limit}`;
    }

    if (offset) {
        sql += ` STARTPOSITION ${offset + 1}`; // QuickBooks uses 1-based indexing
    }

    return sql;
}
