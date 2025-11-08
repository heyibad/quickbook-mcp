import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update vendor in QuickBooks Online
 */
export const updateQuickbooksVendor = updateEntityHandler(ENTITY_CONFIGS.vendor);
