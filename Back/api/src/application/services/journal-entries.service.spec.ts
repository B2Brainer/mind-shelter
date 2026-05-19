import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntry } from '../../domain/entities/journal-entry.entity';

const createEntry = (overrides?: Partial<JournalEntry>) =>
  new JournalEntry(
    overrides?.id ?? 'entry-1',
    overrides?.title ?? 'Day 1',
    overrides?.content ?? 'A small note.',
    overrides?.entryDate ?? new Date('2026-05-18T00:00:00.000Z'),
    overrides?.type ?? 'DAILY',
    overrides?.userId ?? 'user-1',
    overrides?.createdAt ?? new Date('2026-05-18T00:00:00.000Z'),
    overrides?.updatedAt ?? new Date('2026-05-18T00:00:00.000Z'),
  );

test('create rejects a second GENERAL entry for the same user', async () => {
  const repository = {
    create: async () => createEntry({ type: 'GENERAL' }),
    findById: async () => null,
    findGeneralByUserId: async () => createEntry({ id: 'general-1', type: 'GENERAL' }),
    findMany: async () => [],
    countByUser: async () => 0,
    update: async () => createEntry(),
    delete: async () => undefined,
  };
  const service = new JournalEntriesService(repository);

  await assert.rejects(
    () =>
      service.create('user-1', {
        title: 'General',
        content: 'Long term reflection',
        entryDate: '2026-05-18T00:00:00.000Z',
        type: 'GENERAL',
      }),
    ConflictException,
  );
});

test('list returns paginated entries for the authenticated user', async () => {
  const repository = {
    create: async () => createEntry(),
    findById: async () => null,
    findGeneralByUserId: async () => null,
    findMany: async () => [createEntry(), createEntry({ id: 'entry-2', type: 'GENERAL' })],
    countByUser: async () => 2,
    update: async () => createEntry(),
    delete: async () => undefined,
  };
  const service = new JournalEntriesService(repository);

  const result = await service.list('user-1', { page: 1, pageSize: 10 });

  assert.equal(result.total, 2);
  assert.equal(result.items.length, 2);
  assert.equal(result.totalPages, 1);
});

test('getById rejects access to another user entry', async () => {
  const repository = {
    create: async () => createEntry(),
    findById: async () => createEntry({ userId: 'someone-else' }),
    findGeneralByUserId: async () => null,
    findMany: async () => [],
    countByUser: async () => 0,
    update: async () => createEntry(),
    delete: async () => undefined,
  };
  const service = new JournalEntriesService(repository);

  await assert.rejects(() => service.getById('user-1', 'entry-1'), ForbiddenException);
});

test('update throws not found when the entry does not exist', async () => {
  const repository = {
    create: async () => createEntry(),
    findById: async () => null,
    findGeneralByUserId: async () => null,
    findMany: async () => [],
    countByUser: async () => 0,
    update: async () => createEntry(),
    delete: async () => undefined,
  };
  const service = new JournalEntriesService(repository);

  await assert.rejects(
    () => service.update('user-1', 'missing-entry', { title: 'Updated title' }),
    NotFoundException,
  );
});

test('delete removes an owned entry', async () => {
  const deletedIds: string[] = [];
  const repository = {
    create: async () => createEntry(),
    findById: async () => createEntry({ id: 'entry-9', userId: 'user-1' }),
    findGeneralByUserId: async () => null,
    findMany: async () => [],
    countByUser: async () => 0,
    update: async () => createEntry(),
    delete: async (id: string) => {
      deletedIds.push(id);
    },
  };
  const service = new JournalEntriesService(repository);

  await service.delete('user-1', 'entry-9');

  assert.deepEqual(deletedIds, ['entry-9']);
});
