import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JOURNAL_ENTRIES_REPOSITORY } from '../tokens';
import {
  JournalEntryRepositoryPort,
  UpdateJournalEntryInput,
} from '../../domain/ports/journal-entry.repository.port';
import { JournalEntryType } from '../../domain/entities/journal-entry.entity';
import { toJournalEntryResponse } from '../mappers/journal-entry.mapper';

type CreateJournalEntryPayload = {
  title: string;
  content: string;
  entryDate: string;
  type: JournalEntryType;
};

type UpdateJournalEntryPayload = {
  title?: string;
  content?: string;
  entryDate?: string;
  type?: JournalEntryType;
};

type ListJournalEntriesPayload = {
  type?: JournalEntryType;
  page: number;
  pageSize: number;
};

@Injectable()
export class JournalEntriesService {
  constructor(
    @Inject(JOURNAL_ENTRIES_REPOSITORY)
    private readonly journalEntriesRepository: JournalEntryRepositoryPort,
  ) {}

  async create(userId: string, payload: CreateJournalEntryPayload) {
    await this.assertSingleGeneralEntry(userId, payload.type);

    const entry = await this.journalEntriesRepository.create({
      title: payload.title,
      content: payload.content,
      entryDate: new Date(payload.entryDate),
      type: payload.type,
      userId,
    });

    return toJournalEntryResponse(entry);
  }

  async list(userId: string, payload: ListJournalEntriesPayload) {
    const page = Math.max(payload.page, 1);
    const pageSize = Math.min(Math.max(payload.pageSize, 1), 50);
    const skip = (page - 1) * pageSize;

    const [entries, total] = await Promise.all([
      this.journalEntriesRepository.findMany({
        userId,
        type: payload.type,
        skip,
        take: pageSize,
      }),
      this.journalEntriesRepository.countByUser(userId, payload.type),
    ]);

    return {
      items: entries.map(toJournalEntryResponse),
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    };
  }

  async getById(userId: string, entryId: string) {
    const entry = await this.requireOwnedEntry(userId, entryId);
    return toJournalEntryResponse(entry);
  }

  async update(userId: string, entryId: string, payload: UpdateJournalEntryPayload) {
    const existingEntry = await this.requireOwnedEntry(userId, entryId);
    const nextType = payload.type ?? existingEntry.type;

    if (nextType === 'GENERAL' && existingEntry.type !== 'GENERAL') {
      await this.assertSingleGeneralEntry(userId, nextType, entryId);
    }

    const updateInput: UpdateJournalEntryInput = {};

    if (payload.title !== undefined) {
      updateInput.title = payload.title;
    }

    if (payload.content !== undefined) {
      updateInput.content = payload.content;
    }

    if (payload.entryDate !== undefined) {
      updateInput.entryDate = new Date(payload.entryDate);
    }

    if (payload.type !== undefined) {
      updateInput.type = payload.type;
    }

    const updatedEntry = await this.journalEntriesRepository.update(entryId, updateInput);
    return toJournalEntryResponse(updatedEntry);
  }

  async delete(userId: string, entryId: string) {
    await this.requireOwnedEntry(userId, entryId);
    await this.journalEntriesRepository.delete(entryId);
  }

  private async requireOwnedEntry(userId: string, entryId: string) {
    const entry = await this.journalEntriesRepository.findById(entryId);

    if (!entry) {
      throw new NotFoundException('Journal entry not found.');
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException('You can only access your own journal entries.');
    }

    return entry;
  }

  private async assertSingleGeneralEntry(
    userId: string,
    type: JournalEntryType,
    currentEntryId?: string,
  ) {
    if (type !== 'GENERAL') {
      return;
    }

    const generalEntry = await this.journalEntriesRepository.findGeneralByUserId(userId);

    if (generalEntry && generalEntry.id !== currentEntryId) {
      throw new ConflictException('Each user can only have one GENERAL journal entry.');
    }
  }
}
