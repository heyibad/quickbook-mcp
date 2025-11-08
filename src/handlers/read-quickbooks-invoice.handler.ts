import { readEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Read invoice in QuickBooks Online
 */
export const readQuickbooksInvoice = readEntityHandler(ENTITY_CONFIGS.invoice);
