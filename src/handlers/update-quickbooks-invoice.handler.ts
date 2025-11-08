import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update invoice in QuickBooks Online
 */
export const updateQuickbooksInvoice = updateEntityHandler(ENTITY_CONFIGS.invoice);
