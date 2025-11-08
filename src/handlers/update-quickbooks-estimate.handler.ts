import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update estimate in QuickBooks Online
 */
export const updateQuickbooksEstimate = updateEntityHandler(ENTITY_CONFIGS.estimate);
