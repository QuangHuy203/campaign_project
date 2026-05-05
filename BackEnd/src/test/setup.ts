import { db } from '../db/knex';

async function truncateAll() {
  // Order matters due to FKs
  await db('campaign_recipients').del();
  await db('recipients').del();
  await db('campaigns').del();
  await db('users').del();
}

beforeAll(async () => {
  await db.migrate.latest({ directory: './db/migrations' });
});

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await truncateAll();
  await db.destroy();
});

