import knex, { Knex } from 'knex';
import { env } from '../config/env';

const connectionString =
  process.env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL ?? env.DATABASE_URL : env.DATABASE_URL;

export const db: Knex = knex({
  client: 'pg',
  connection: connectionString,
  pool: { min: 0, max: 10 },
  debug: true,
});

