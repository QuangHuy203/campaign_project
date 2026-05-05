/**
 * Performance seed data for local query/load testing.
 *
 * Tunable env vars:
 * - PERF_SEED_USERS (default: 200)
 * - PERF_SEED_RECIPIENTS (default: 1000)
 * - PERF_SEED_CAMPAIGNS (default: 1000)
 * - PERF_SEED_RECIPIENTS_PER_CAMPAIGN (default: 5)
 */

function readPositiveInt(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function chunk(array, size) {
  const chunks = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function seed(knex) {
  const USERS_COUNT = readPositiveInt('PERF_SEED_USERS', 200);
  const RECIPIENTS_COUNT = readPositiveInt('PERF_SEED_RECIPIENTS', 1000);
  const CAMPAIGNS_COUNT = readPositiveInt('PERF_SEED_CAMPAIGNS', 1000);
  const RECIPIENTS_PER_CAMPAIGN = readPositiveInt('PERF_SEED_RECIPIENTS_PER_CAMPAIGN', 5);

  // Keep deterministic and FK-safe order.
  await knex('campaign_recipients').del();
  await knex('campaigns').del();
  await knex('recipients').del();
  await knex('users').del();

  const fixedPasswordHash = '$2b$10$Q4kF9XJx75jvB2J9D7qD7un71S7fA6C4YH8sO7QH5k6U7P0jW3CZu';

  const users = Array.from({ length: USERS_COUNT }, (_, idx) => ({
    email: `perf_user_${idx + 1}@example.com`,
    name: `Perf User ${idx + 1}`,
    password_hash: fixedPasswordHash,
  }));
  for (const batch of chunk(users, 500)) {
    await knex('users').insert(batch);
  }

  const recipients = Array.from({ length: RECIPIENTS_COUNT }, (_, idx) => ({
    email: `perf_recipient_${idx + 1}@example.com`,
    name: `Perf Recipient ${idx + 1}`,
  }));
  for (const batch of chunk(recipients, 1000)) {
    await knex('recipients').insert(batch);
  }

  const userIds = (await knex('users').select('id').orderBy('id')).map((row) => Number(row.id));
  const recipientIds = (await knex('recipients').select('id').orderBy('id')).map((row) => Number(row.id));

  const statuses = ['draft', 'scheduled', 'sent'];
  const now = Date.now();
  const campaigns = Array.from({ length: CAMPAIGNS_COUNT }, (_, idx) => {
    const status = statuses[idx % statuses.length];
    const scheduledOffsetMs = (idx + 1) * 60_000;
    const scheduledAt =
      status === 'scheduled' ? new Date(now + scheduledOffsetMs) : null;
    return {
      name: `Perf Campaign ${idx + 1}`,
      subject: `Performance Subject ${idx + 1}`,
      body: `Generated body for performance campaign #${idx + 1}`,
      status,
      scheduled_at: scheduledAt,
      created_by: userIds[idx % userIds.length],
    };
  });
  for (const batch of chunk(campaigns, 500)) {
    await knex('campaigns').insert(batch);
  }

  const campaignRows = await knex('campaigns').select('id', 'status').orderBy('id');
  const campaignRecipients = [];

  for (let i = 0; i < campaignRows.length; i += 1) {
    const campaignId = Number(campaignRows[i].id);
    const status = campaignRows[i].status;
    for (let j = 0; j < RECIPIENTS_PER_CAMPAIGN; j += 1) {
      const recipientId = recipientIds[(i * RECIPIENTS_PER_CAMPAIGN + j) % recipientIds.length];
      const sentAt = status === 'sent' ? new Date(now - (j + 1) * 60_000) : null;
      campaignRecipients.push({
        campaign_id: campaignId,
        recipient_id: recipientId,
        status: status === 'sent' ? 'sent' : 'pending',
        sent_at: sentAt,
        opened_at: null,
      });
    }
  }

  for (const batch of chunk(campaignRecipients, 2000)) {
    await knex('campaign_recipients').insert(batch);
  }

  // eslint-disable-next-line no-console
  console.log(
    `[perf-seed] users=${USERS_COUNT}, recipients=${RECIPIENTS_COUNT}, campaigns=${CAMPAIGNS_COUNT}, campaign_recipients=${campaignRecipients.length}`,
  );
};
