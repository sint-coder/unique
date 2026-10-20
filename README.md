# Unique Write

React/Vite frontend and Node.js API. The API runs on port `8000`; Vite proxies `/api` to it during development. The API reads `backend/.env` and optionally overlays local-only settings from the ignored `backend/.env.local` file.

## Run locally

1. Install Node.js 20 or newer and MySQL 8 / MariaDB 10.5 or newer.
2. Run `npm install`.
3. Copy `backend/.env.example` to `backend/.env` and set database credentials, `APP_KEY`, AI provider key and token prices, and any enabled Stripe, Google OAuth, and SMTP credentials. Keep this file private. Put machine-specific overrides in the ignored `backend/.env.local` file.
4. Create/select the target database in MySQL, then import `backend/schema.sql` into it (the schema does not choose a database name).
5. In one terminal, run `npm run api`; in another, run `npm run dev`.
6. Register an account, then grant admin access with `npm run admin:make -- email@example.com`.

Build the frontend with `npm run build`; preview it with `npm run preview`. In production, run the Node API behind a TLS reverse proxy and serve `dist/` from the same origin. Configure Stripe webhook delivery to `POST /api/billing/webhook`.

Run scheduled maintenance with `npm run cron:cleanup` hourly and `npm run cron:report` daily. The cleanup job expires sessions and removes rewrite text after seven days; it also returns word grants for stale requests.

## Configuration and data

`APP_URL` must match the browser origin for Origin checks. For Vite development, set it to `http://localhost:5173`; production must use HTTPS. Configure Google OAuth callback as `{APP_URL}/api/auth/google/callback`.

AI requests fail closed until the Gemini key and both per-million-token prices are configured. Update prices from the provider's current price sheet. Keys remain server-side. Existing MySQL data and schema are retained; Argon2id password hashes remain compatible with existing accounts.

The API includes password and Google authentication, email verification/reset, rewrite/history/report, word balance, attribution and analytics, Stripe checkout/webhooks/cancellation, account deletion, and the admin reporting and campaign CRUD endpoints. The database definition remains `backend/schema.sql`; apply `backend/migrations/001_humanize_metadata.sql` only to an existing database that predates that migration.
