import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create invoice in QuickBooks Online
 */
export const createQuickbooksInvoice = createEntityHandler(ENTITY_CONFIGS.invoice);
