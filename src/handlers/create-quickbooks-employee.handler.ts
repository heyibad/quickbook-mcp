import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create employee in QuickBooks Online
 */
export const createQuickbooksEmployee = createEntityHandler(ENTITY_CONFIGS.employee);
