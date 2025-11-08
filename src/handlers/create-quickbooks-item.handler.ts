import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create item in QuickBooks Online
 */
export const createQuickbooksItem = createEntityHandler(ENTITY_CONFIGS.item);
