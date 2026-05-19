import { JournalEntry } from '../../domain/entities/journal-entry.entity';

export const toJournalEntryResponse = (entry: JournalEntry) => ({
  id: entry.id,
  title: entry.title,
  content: entry.content,
  entryDate: entry.entryDate,
  type: entry.type,
  userId: entry.userId,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});
