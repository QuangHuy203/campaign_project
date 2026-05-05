"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const helpers_1 = require("./test/helpers");
describe('Campaign business rules', () => {
    test('create campaign rejects recipients not existing in system', async () => {
        const { token } = await (0, helpers_1.registerAndLogin)();
        const response = await (0, supertest_1.default)(helpers_1.app)
            .post('/campaigns')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'C1',
            subject: 'Hello',
            body: 'Body',
            recipients: [{ email: 'missing@example.com', name: 'Missing' }],
        })
            .expect(422);
        expect(response.body.error.message).toBe('Some recipients do not exist in the system');
        expect(response.body.error.details).toEqual({
            missing_recipients: ['missing@example.com'],
        });
    });
    test('schedule must be a future timestamp', async () => {
        const { token } = await (0, helpers_1.registerAndLogin)();
        await (0, helpers_1.ensureRecipientsExist)([{ email: 'a@example.com', name: 'A' }]);
        const createRes = await (0, supertest_1.default)(helpers_1.app)
            .post('/campaigns')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'C1',
            subject: 'Hello',
            body: 'Body',
            recipients: [{ email: 'a@example.com', name: 'A' }],
        })
            .expect(201);
        const campaignId = createRes.body.data.id;
        await (0, supertest_1.default)(helpers_1.app)
            .post(`/campaigns/${campaignId}/schedule`)
            .set('Authorization', `Bearer ${token}`)
            .send({ scheduled_at: new Date(Date.now() - 60000).toISOString() })
            .expect(422);
    });
    test('campaign can only be updated when status is draft', async () => {
        const { token } = await (0, helpers_1.registerAndLogin)();
        await (0, helpers_1.ensureRecipientsExist)([{ email: 'b@example.com', name: 'B' }]);
        const createRes = await (0, supertest_1.default)(helpers_1.app)
            .post('/campaigns')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'C1',
            subject: 'Hello',
            body: 'Body',
            recipients: [{ email: 'b@example.com', name: 'B' }],
        })
            .expect(201);
        const campaignId = createRes.body.data.id;
        await (0, supertest_1.default)(helpers_1.app)
            .post(`/campaigns/${campaignId}/schedule`)
            .set('Authorization', `Bearer ${token}`)
            .send({ scheduled_at: new Date(Date.now() + 60000).toISOString() })
            .expect(200);
        await (0, supertest_1.default)(helpers_1.app)
            .patch(`/campaigns/${campaignId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ subject: 'Updated' })
            .expect(409);
    });
    test('send is one-way and stats returns rates and counts', async () => {
        const { token } = await (0, helpers_1.registerAndLogin)();
        await (0, helpers_1.ensureRecipientsExist)([
            { email: 'c1@example.com', name: 'C1' },
            { email: 'c2@example.com', name: 'C2' },
        ]);
        const createRes = await (0, supertest_1.default)(helpers_1.app)
            .post('/campaigns')
            .set('Authorization', `Bearer ${token}`)
            .send({
            name: 'C1',
            subject: 'Hello',
            body: 'Body',
            recipients: [
                { email: 'c1@example.com', name: 'C1' },
                { email: 'c2@example.com', name: 'C2' },
            ],
        })
            .expect(201);
        const campaignId = createRes.body.data.id;
        await (0, supertest_1.default)(helpers_1.app)
            .post(`/campaigns/${campaignId}/send`)
            .set('Authorization', `Bearer ${token}`)
            .send()
            .expect(200);
        // Sending again should fail
        await (0, supertest_1.default)(helpers_1.app)
            .post(`/campaigns/${campaignId}/send`)
            .set('Authorization', `Bearer ${token}`)
            .send()
            .expect(409);
        const statsRes = await (0, supertest_1.default)(helpers_1.app)
            .get(`/campaigns/${campaignId}/stats`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(statsRes.body.data).toEqual({
            total: 2,
            sent: 2,
            failed: 0,
            opened: 0,
            open_rate: 0,
            send_rate: 1,
        });
    });
});
