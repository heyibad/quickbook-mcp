import { deleteEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Delete bill in QuickBooks Online
 */
export const deleteQuickbooksBill = deleteEntityHandler(ENTITY_CONFIGS.bill);
