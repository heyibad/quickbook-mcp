import { getEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Get journal entry in QuickBooks Online
 */
export const getQuickbooksJournalEntry = getEntityHandler(ENTITY_CONFIGS.journalEntry);
