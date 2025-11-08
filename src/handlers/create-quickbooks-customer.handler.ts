import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create customer in QuickBooks Online
 */
export const createQuickbooksCustomer = createEntityHandler(ENTITY_CONFIGS.customer);
