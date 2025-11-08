import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update customer in QuickBooks Online
 */
export const updateQuickbooksCustomer = updateEntityHandler(ENTITY_CONFIGS.customer);
