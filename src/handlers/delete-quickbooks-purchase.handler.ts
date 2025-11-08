import { deleteEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Delete purchase in QuickBooks Online
 */
export const deleteQuickbooksPurchase = deleteEntityHandler(ENTITY_CONFIGS.purchase);
