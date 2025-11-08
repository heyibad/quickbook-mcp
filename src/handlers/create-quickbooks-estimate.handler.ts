import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create estimate in QuickBooks Online
 */
export const createQuickbooksEstimate = createEntityHandler(ENTITY_CONFIGS.estimate);
