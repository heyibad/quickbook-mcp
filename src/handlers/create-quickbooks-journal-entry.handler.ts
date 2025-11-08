import { createEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Create journal entry in QuickBooks Online
 */
export const createQuickbooksJournalEntry = createEntityHandler(ENTITY_CONFIGS.journalEntry);
