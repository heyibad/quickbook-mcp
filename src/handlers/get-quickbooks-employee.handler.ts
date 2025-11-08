import { getEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Get employee in QuickBooks Online
 */
export const getQuickbooksEmployee = getEntityHandler(ENTITY_CONFIGS.employee);
