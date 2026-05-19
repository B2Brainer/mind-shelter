import { JournalEntry, JournalEntryType } from '../entities/journal-entry.entity';

export type ListJournalEntriesOptions = {
  userId: string;
  type?: JournalEntryType;
  skip: number;
  take: number;
};

export type CreateJournalEntryInput = {
  title: string;
  content: string;
  entryDate: Date;
  type: JournalEntryType;
  userId: string;
};

export type UpdateJournalEntryInput = {
  title?: string;
  content?: string;
  entryDate?: Date;
  type?: JournalEntryType;
};

export interface JournalEntryRepositoryPort {
  create(input: CreateJournalEntryInput): Promise<JournalEntry>;
  findById(id: string): Promise<JournalEntry | null>;
  findGeneralByUserId(userId: string): Promise<JournalEntry | null>;
  findMany(options: ListJournalEntriesOptions): Promise<JournalEntry[]>;
  countByUser(userId: string, type?: JournalEntryType): Promise<number>;
  update(id: string, input: UpdateJournalEntryInput): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}
