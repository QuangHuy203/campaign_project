import type { Knex } from 'knex';

export type UserRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
};

export async function insertUser(
  db: Knex,
  args: { email: string; name: string; passwordHash: string },
): Promise<Pick<UserRow, 'id' | 'email' | 'name' | 'created_at'>> {
  const rows = await db('users')
    .insert({
      email: args.email,
      name: args.name,
      password_hash: args.passwordHash,
    })
    .returning(['id', 'email', 'name', 'created_at']);

  return rows[0];
}

export async function findUserByEmail(db: Knex, email: string): Promise<UserRow | null> {
  const row = await db<UserRow>('users').where({ email }).first();
  return row ?? null;
}

