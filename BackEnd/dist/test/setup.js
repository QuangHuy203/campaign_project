"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = require("../db/knex");
async function truncateAll() {
    // Order matters due to FKs
    await (0, knex_1.db)('campaign_recipients').del();
    await (0, knex_1.db)('recipients').del();
    await (0, knex_1.db)('campaigns').del();
    await (0, knex_1.db)('users').del();
}
beforeAll(async () => {
    await knex_1.db.migrate.latest({ directory: './db/migrations' });
});
beforeEach(async () => {
    await truncateAll();
});
afterAll(async () => {
    await truncateAll();
    await knex_1.db.destroy();
});
