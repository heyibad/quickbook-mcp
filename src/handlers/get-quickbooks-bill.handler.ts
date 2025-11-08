import { getEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Get bill in QuickBooks Online
 */
export const getQuickbooksBill = getEntityHandler(ENTITY_CONFIGS.bill);
