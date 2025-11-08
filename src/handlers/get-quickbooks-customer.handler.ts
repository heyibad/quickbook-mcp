import { getEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Get customer in QuickBooks Online
 */
export const getQuickbooksCustomer = getEntityHandler(ENTITY_CONFIGS.customer);
