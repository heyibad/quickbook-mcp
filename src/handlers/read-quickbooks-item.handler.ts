import { readEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Read item in QuickBooks Online
 */
export const readQuickbooksItem = readEntityHandler(ENTITY_CONFIGS.item);
