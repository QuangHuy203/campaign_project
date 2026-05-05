import { db } from '../../db/knex';
import { findUserByEmail, insertUser } from '../../repos/userRepo';

describe('userRepo', () => {
  test('insertUser inserts and returns public fields', async () => {
    const user = await insertUser(db, {
      email: 'repo_user@example.com',
      name: 'Repo User',
      passwordHash: 'hash_123',
    });

    expect(Number(user.id)).toBeGreaterThan(0);
    expect(user.email).toBe('repo_user@example.com');
    expect(user.name).toBe('Repo User');
    expect(user.created_at).toBeTruthy();
  });

  test('findUserByEmail returns user row with password hash', async () => {
    await insertUser(db, {
      email: 'find_me@example.com',
      name: 'Find Me',
      passwordHash: 'hash_abc',
    });

    const found = await findUserByEmail(db, 'find_me@example.com');
    expect(found).not.toBeNull();
    expect(found?.email).toBe('find_me@example.com');
    expect(found?.password_hash).toBe('hash_abc');
  });

  test('findUserByEmail returns null when not found', async () => {
    const found = await findUserByEmail(db, 'missing@example.com');
    expect(found).toBeNull();
  });
});
