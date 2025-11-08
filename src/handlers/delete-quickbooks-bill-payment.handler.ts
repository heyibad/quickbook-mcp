import { deleteEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Delete bill payment in QuickBooks Online
 */
export const deleteQuickbooksBillPayment = deleteEntityHandler(ENTITY_CONFIGS.billPayment);
