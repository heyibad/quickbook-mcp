import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update purchase in QuickBooks Online
 */
export const updateQuickbooksPurchase = updateEntityHandler(ENTITY_CONFIGS.purchase);
