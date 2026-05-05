import request from 'supertest';
import { app, registerAndLogin } from './test/helpers';

describe('Campaign business rules', () => {
  test('schedule must be a future timestamp', async () => {
    const { token } = await registerAndLogin();

    const createRes = await request(app)
      .post('/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'C1',
        subject: 'Hello',
        body: 'Body',
        recipients: [{ email: 'a@example.com', name: 'A' }],
      })
      .expect(201);

    const campaignId = createRes.body.data.id as number;

    await request(app)
      .post(`/campaigns/${campaignId}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ scheduled_at: new Date(Date.now() - 60_000).toISOString() })
      .expect(422);
  });

  test('campaign can only be updated when status is draft', async () => {
    const { token } = await registerAndLogin();

    const createRes = await request(app)
      .post('/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'C1',
        subject: 'Hello',
        body: 'Body',
        recipients: [{ email: 'b@example.com', name: 'B' }],
      })
      .expect(201);

    const campaignId = createRes.body.data.id as number;

    await request(app)
      .post(`/campaigns/${campaignId}/schedule`)
      .set('Authorization', `Bearer ${token}`)
      .send({ scheduled_at: new Date(Date.now() + 60_000).toISOString() })
      .expect(200);

    await request(app)
      .patch(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'Updated' })
      .expect(409);
  });

  test('send is one-way and stats returns rates and counts', async () => {
    const { token } = await registerAndLogin();

    const createRes = await request(app)
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

    const campaignId = createRes.body.data.id as number;

    await request(app)
      .post(`/campaigns/${campaignId}/send`)
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200);

    // Sending again should fail
    await request(app)
      .post(`/campaigns/${campaignId}/send`)
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(409);

    const statsRes = await request(app)
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

