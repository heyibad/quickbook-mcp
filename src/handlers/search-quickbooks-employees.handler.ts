import { searchEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Search employees from QuickBooks Online.
 *
 * Accepts either:
 *   • A plain criteria object (key/value pairs) – passed directly to search
 *   • An **array** of objects in the `{ field, value, operator? }` shape – this
 *     allows use of operators such as `IN`, `LIKE`, `>`, `<`, `>=`, `<=` etc.
 *
 * Pagination / sorting options such as `limit`, `offset`, `asc`, `desc`,
 * `fetchAll`, `count` can be supplied via the top‑level criteria object or as
 * dedicated entries in the array form.
 */
export const searchQuickbooksEmployees = searchEntityHandler(ENTITY_CONFIGS.employee);
