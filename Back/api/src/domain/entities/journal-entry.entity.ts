export type JournalEntryType = 'DAILY' | 'GENERAL';

export class JournalEntry {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly entryDate: Date,
    public readonly type: JournalEntryType,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
