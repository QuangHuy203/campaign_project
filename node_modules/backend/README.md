## Email Campaign Backend (Express + Knex + Postgres)

### Requirements
- Node.js **18.20.4** (see `.nvmrc` and `package.json` `engines`)
- PostgreSQL

### Setup
1. Copy env file:

```bash
copy .env.example .env
```

2. Create databases in Postgres:
- `email_campaign`
- `email_campaign_test`

3. Run migrations:

```bash
npm run migrate
```

### Run

```bash
npm run dev
```

### Docker

Build and run API + Postgres (migrations run automatically on app start):

```bash
docker compose up --build
```

- API: `http://localhost:3000` (health: `GET /health`)
- Postgres: `localhost:5432` (user/password `postgres` / `postgres`, DBs `email_campaign` and `email_campaign_test`)

Override secrets in production (set `JWT_SECRET` and DB credentials via env or a compose override file; do not commit real secrets).

### Test

```bash
npm test
```

### API response contract
- Success: `{ "data": ... }`
- Error: `{ "error": { "code": "...", "message": "...", "details": ... } }`

