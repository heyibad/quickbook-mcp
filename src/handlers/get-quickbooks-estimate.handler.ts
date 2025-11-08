import { getEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Get estimate in QuickBooks Online
 */
export const getQuickbooksEstimate = getEntityHandler(ENTITY_CONFIGS.estimate);
