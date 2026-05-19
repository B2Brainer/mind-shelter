import test from 'node:test';
import assert from 'node:assert/strict';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from '../../domain/entities/user.entity';

const createUser = (overrides?: Partial<User>) =>
  new User(
    overrides?.id ?? 'user-1',
    overrides?.email ?? 'reader@example.com',
    overrides?.password ?? hashSync('mind1234', 10),
    overrides?.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
    overrides?.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
  );

test('register creates a new user and omits password from the response', async () => {
  const calls: Array<{ email: string; password: string }> = [];
  const repository = {
    findByEmail: async () => null,
    findById: async () => null,
    create: async (email: string, password: string) => {
      calls.push({ email, password });
      return createUser({ email, password });
    },
  };
  const jwtService = { signAsync: async () => 'token' };
  const service = new AuthService(repository, jwtService as never);

  const result = await service.register('new@example.com', 'mind1234');

  assert.equal(result.email, 'new@example.com');
  assert.ok(!('password' in result));
  assert.equal(calls.length, 1);
  assert.notEqual(calls[0]?.password, 'mind1234');
});

test('register rejects duplicate email addresses', async () => {
  const repository = {
    findByEmail: async () => createUser(),
    findById: async () => null,
    create: async () => createUser(),
  };
  const jwtService = { signAsync: async () => 'token' };
  const service = new AuthService(repository, jwtService as never);

  await assert.rejects(() => service.register('reader@example.com', 'mind1234'), ConflictException);
});

test('login returns an access token for valid credentials', async () => {
  const repository = {
    findByEmail: async () => createUser({ password: hashSync('mind1234', 10) }),
    findById: async () => null,
    create: async () => createUser(),
  };
  const jwtService = { signAsync: async () => 'signed-token' };
  const service = new AuthService(repository, jwtService as never);

  const result = await service.login('reader@example.com', 'mind1234');

  assert.equal(result.accessToken, 'signed-token');
  assert.equal(result.user.email, 'reader@example.com');
});

test('login rejects invalid passwords', async () => {
  const repository = {
    findByEmail: async () => createUser(),
    findById: async () => null,
    create: async () => createUser(),
  };
  const jwtService = { signAsync: async () => 'token' };
  const service = new AuthService(repository, jwtService as never);

  await assert.rejects(() => service.login('reader@example.com', 'wrong-pass'), UnauthorizedException);
});

test('getCurrentUser returns the sanitized current user', async () => {
  const repository = {
    findByEmail: async () => null,
    findById: async (id: string) => createUser({ id }),
    create: async () => createUser(),
  };
  const jwtService = { signAsync: async () => 'token' };
  const service = new AuthService(repository, jwtService as never);

  const result = await service.getCurrentUser('user-123');

  assert.equal(result.id, 'user-123');
  assert.equal(result.email, 'reader@example.com');
  assert.ok(!('password' in result));
});
