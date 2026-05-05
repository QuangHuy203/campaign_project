import { db } from '../../db/knex';
import { findRecipientsByEmails, upsertRecipientsByEmail } from '../../repos/recipientRepo';

describe('recipientRepo', () => {
  test('upsertRecipientsByEmail inserts recipients', async () => {
    const rows = await upsertRecipientsByEmail(db, [
      { email: 'r1@example.com', name: 'R1' },
      { email: 'r2@example.com', name: 'R2' },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.email).sort()).toEqual(['r1@example.com', 'r2@example.com']);
  });

  test('upsertRecipientsByEmail updates name on conflict', async () => {
    await upsertRecipientsByEmail(db, [{ email: 'dup@example.com', name: 'Before' }]);
    const rows = await upsertRecipientsByEmail(db, [{ email: 'dup@example.com', name: 'After' }]);

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('After');
  });

  test('findRecipientsByEmails normalizes and deduplicates emails', async () => {
    await upsertRecipientsByEmail(db, [
      { email: 'a@example.com', name: 'A' },
      { email: 'b@example.com', name: 'B' },
    ]);

    const rows = await findRecipientsByEmails(db, [' A@example.com ', 'a@example.com', 'b@example.com']);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.email).sort()).toEqual(['a@example.com', 'b@example.com']);
  });

  test('findRecipientsByEmails returns empty array for empty input', async () => {
    const rows = await findRecipientsByEmails(db, []);
    expect(rows).toEqual([]);
  });
});
