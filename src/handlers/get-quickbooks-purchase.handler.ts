import { getEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Get purchase in QuickBooks Online
 */
export const getQuickbooksPurchase = getEntityHandler(ENTITY_CONFIGS.purchase);
