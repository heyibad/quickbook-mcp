import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update account in QuickBooks Online
 */
export const updateQuickbooksAccount = updateEntityHandler(ENTITY_CONFIGS.account);
