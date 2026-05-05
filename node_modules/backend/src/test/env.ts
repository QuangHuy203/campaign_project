process.env.NODE_ENV = 'test';

// These are required by src/config/env.ts. Keep them minimal and non-secret here.
// In real runs, provide real values via environment or a local .env.
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_test_jwt_secret';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://postgres:123456@localhost:5432/email_campaign';
process.env.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgres://postgres:123456@localhost:5432/email_campaign_test';

