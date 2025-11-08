import { deleteEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Delete estimate in QuickBooks Online
 */
export const deleteQuickbooksEstimate = deleteEntityHandler(ENTITY_CONFIGS.estimate);
