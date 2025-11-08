import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create bill payment in QuickBooks Online
 */
export const createQuickbooksBillPayment = createEntityHandler(ENTITY_CONFIGS.billPayment);
