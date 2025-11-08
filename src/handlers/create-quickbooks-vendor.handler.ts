import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create vendor in QuickBooks Online
 */
export const createQuickbooksVendor = createEntityHandler(ENTITY_CONFIGS.vendor);
