import request from 'supertest';
import { createApp } from '../app';

export const app = createApp();

export async function registerAndLogin() {
  const email = `user_${Date.now()}@example.com`;
  const password = 'password123';

  await request(app).post('/auth/register').send({ email, name: 'Test User', password }).expect(201);

  const loginRes = await request(app).post('/auth/login').send({ email, password }).expect(200);
  const token = loginRes.body?.data?.token as string | undefined;
  if (!token) throw new Error('Expected token in login response');
  return { token };
}

