import { getEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Get vendor in QuickBooks Online
 */
export const getQuickbooksVendor = getEntityHandler(ENTITY_CONFIGS.vendor);
