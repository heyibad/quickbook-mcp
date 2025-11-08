import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update bill in QuickBooks Online
 */
export const updateQuickbooksBill = updateEntityHandler(ENTITY_CONFIGS.bill);
