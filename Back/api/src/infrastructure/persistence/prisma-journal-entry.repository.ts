import { Injectable } from '@nestjs/common';
import { JournalEntry, JournalEntryType } from '../../domain/entities/journal-entry.entity';
import {
  CreateJournalEntryInput,
  JournalEntryRepositoryPort,
  ListJournalEntriesOptions,
  UpdateJournalEntryInput,
} from '../../domain/ports/journal-entry.repository.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaJournalEntryRepository implements JournalEntryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateJournalEntryInput): Promise<JournalEntry> {
    const entry = await this.prisma.journalEntry.create({
      data: input,
    });

    return this.toDomain(entry);
  }

  async findById(id: string): Promise<JournalEntry | null> {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
    });

    return entry ? this.toDomain(entry) : null;
  }

  async findGeneralByUserId(userId: string): Promise<JournalEntry | null> {
    const entry = await this.prisma.journalEntry.findFirst({
      where: {
        userId,
        type: 'GENERAL',
      },
    });

    return entry ? this.toDomain(entry) : null;
  }

  async findMany(options: ListJournalEntriesOptions): Promise<JournalEntry[]> {
    const entries = await this.prisma.journalEntry.findMany({
      where: {
        userId: options.userId,
        type: options.type,
      },
      orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }],
      skip: options.skip,
      take: options.take,
    });

    return entries.map((entry) => this.toDomain(entry));
  }

  countByUser(userId: string, type?: JournalEntryType): Promise<number> {
    return this.prisma.journalEntry.count({
      where: {
        userId,
        type,
      },
    });
  }

  async update(id: string, input: UpdateJournalEntryInput): Promise<JournalEntry> {
    const entry = await this.prisma.journalEntry.update({
      where: { id },
      data: input,
    });

    return this.toDomain(entry);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.journalEntry.delete({
      where: { id },
    });
  }

  private toDomain(entry: {
    id: string;
    title: string;
    content: string;
    entryDate: Date;
    type: JournalEntryType;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): JournalEntry {
    return new JournalEntry(
      entry.id,
      entry.title,
      entry.content,
      entry.entryDate,
      entry.type,
      entry.userId,
      entry.createdAt,
      entry.updatedAt,
    );
  }
}
