import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create purchase in QuickBooks Online
 */
export const createQuickbooksPurchase = createEntityHandler(ENTITY_CONFIGS.purchase);
