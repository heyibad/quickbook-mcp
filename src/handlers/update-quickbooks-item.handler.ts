import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update item in QuickBooks Online
 */
export const updateQuickbooksItem = updateEntityHandler(ENTITY_CONFIGS.item);
