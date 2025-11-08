import { deleteEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Delete customer in QuickBooks Online
 */
export const deleteQuickbooksCustomer = deleteEntityHandler(ENTITY_CONFIGS.customer);
