
# To‑Do List — Next.js 14 + Prisma + SQLite

A full‑stack to‑do app with filters, priorities, due dates, and optimistic UI.

## Quickstart
```bash
npm install
cp .env.example .env
npx prisma generate
npm run prisma:migrate
npm run dev
```

Open http://localhost:3000

## Deploy

This app is built for Next.js 14 App Router + Prisma. You can deploy with:

- Vercel (recommended) + Postgres (Neon/Render)
- Railway / Render (Node runtime)

### 1) Vercel + Postgres (production‑ready)
1. Create a Postgres DB (e.g., Neon), copy the connection string.
2. Set the env var in Vercel:
	- `DATABASE_URL=<your_postgres_connection_string>`
3. Push to GitHub and import the repo in Vercel.
	- Build Command: uses `npm run build` which runs `prisma db push && next build`
	- Install Command: `npm ci` (default)
	- Start Command (if needed for non-serverless): `npm run start`
4. First deploy will create tables automatically via `prisma db push`.

Note: If you stay on SQLite, Vercel’s serverless file system is ephemeral; your data won’t persist across deployments.

### 2) Railway (Node)
Use Nixpacks (default) or Docker. If you see "Error creating build plan with Railpack/Nixpacks", use Docker.

Nixpacks (default):
1. Push to GitHub and create a Railway service from the repo.
2. Add env var: `DATABASE_URL="<your_postgres_connection_string>"`.
3. Railway will use `railway.json`:
	- Build: `npm ci && npm run build`
	- Start: `npm run start:prod` (runs `prisma migrate deploy` before starting)
4. Data persists in Postgres.

Docker (fallback if Nixpacks/Railpack fails):
1. In Railway, choose "Deploy from Repo" → "Use Dockerfile".
2. Ensure env var `DATABASE_URL="<your_postgres_connection_string>"`.
3. The included Dockerfile runs migrations on start.

## Notes
- A `postinstall` script runs `prisma generate`, which helps most Node hosts.
- To get case‑insensitive search on SQLite, consider maintaining lowercase shadow columns or switch to Postgres.
