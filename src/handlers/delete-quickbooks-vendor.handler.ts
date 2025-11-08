import { deleteEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Delete vendor in QuickBooks Online
 */
export const deleteQuickbooksVendor = deleteEntityHandler(ENTITY_CONFIGS.vendor);
