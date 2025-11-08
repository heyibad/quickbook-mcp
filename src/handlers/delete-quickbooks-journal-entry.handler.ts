import { deleteEntityHandler } from "../helpers/handler-factory.js";
import { ENTITY_CONFIGS } from "../helpers/entity-configs.js";

/**
 * Delete journal entry in QuickBooks Online
 */
export const deleteQuickbooksJournalEntry = deleteEntityHandler(ENTITY_CONFIGS.journalEntry);
