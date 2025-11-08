import { updateEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Update journal entry in QuickBooks Online
 */
export const updateQuickbooksJournalEntry = updateEntityHandler(ENTITY_CONFIGS.journalEntry);
