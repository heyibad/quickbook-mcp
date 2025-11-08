import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update employee in QuickBooks Online
 */
export const updateQuickbooksEmployee = updateEntityHandler(ENTITY_CONFIGS.employee);
