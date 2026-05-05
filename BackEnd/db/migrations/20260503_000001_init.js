/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {

  // Create types
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
        CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sent');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_recipient_status') THEN
        CREATE TYPE campaign_recipient_status AS ENUM ('pending', 'sent', 'failed');
      END IF;
    END$$;
  `);

  await knex.schema.createTable('users', (t) => {
    t.bigIncrements('id').primary();
    t.text('email').notNullable().unique();
    t.text('name').notNullable();
    t.text('password_hash').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('campaigns', (t) => {
    t.bigIncrements('id').primary();
    t.text('name').notNullable();
    t.text('subject').notNullable();
    t.text('body').notNullable();
    t.specificType('status', 'campaign_status').notNullable().defaultTo('draft');
    t.timestamp('scheduled_at', { useTz: true }).nullable();
    t.bigInteger('created_by').notNullable().references('users.id').onDelete('RESTRICT');
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['created_by', 'created_at'], 'idx_campaigns_created_by_created_at');
    t.index(['created_by', 'status'], 'idx_campaigns_created_by_status');
  });

  await knex.schema.createTable('recipients', (t) => {
    t.bigIncrements('id').primary();
    t.text('email').notNullable().unique();
    t.text('name').notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('campaign_recipients', (t) => {
    t.bigInteger('campaign_id').notNullable().references('campaigns.id').onDelete('CASCADE');
    t.bigInteger('recipient_id').notNullable().references('recipients.id').onDelete('CASCADE');
    t.specificType('status', 'campaign_recipient_status').notNullable().defaultTo('pending');
    t.timestamp('sent_at', { useTz: true }).nullable();
    t.timestamp('opened_at', { useTz: true }).nullable();
    t.primary(['campaign_id', 'recipient_id']);
    t.index(['campaign_id', 'status'], 'idx_cr_campaign_id_status');
  });

  // Create indexes
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_campaigns_status_scheduled_at
      ON campaigns (status, scheduled_at)
      WHERE status = 'scheduled';

    CREATE INDEX IF NOT EXISTS idx_cr_campaign_id_opened
      ON campaign_recipients (campaign_id)
      WHERE opened_at IS NOT NULL;
  `);

  // Update trigger auto update timestamp for campaigns table
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;
    CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON campaigns;`);
  await knex.raw(`DROP FUNCTION IF EXISTS set_updated_at();`);

  await knex.schema.dropTableIfExists('campaign_recipients');
  await knex.schema.dropTableIfExists('recipients');
  await knex.schema.dropTableIfExists('campaigns');
  await knex.schema.dropTableIfExists('users');

  await knex.raw(`DROP TYPE IF EXISTS campaign_recipient_status;`);
  await knex.raw(`DROP TYPE IF EXISTS campaign_status;`);
};

