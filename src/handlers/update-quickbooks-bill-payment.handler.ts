import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update bill payment in QuickBooks Online
 */
export const updateQuickbooksBillPayment = updateEntityHandler(ENTITY_CONFIGS.billPayment);
