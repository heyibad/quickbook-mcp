import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create bill in QuickBooks Online
 */
export const createQuickbooksBill = createEntityHandler(ENTITY_CONFIGS.bill);
