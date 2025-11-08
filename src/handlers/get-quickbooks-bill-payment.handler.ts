import { getEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Get bill payment in QuickBooks Online
 */
export const getQuickbooksBillPayment = getEntityHandler(ENTITY_CONFIGS.billPayment);
