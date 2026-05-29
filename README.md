# Fullstack Messaging System

pnpm monorepo for the mail system backend (NestJS) and frontend (Next.js).

## Structure

```
fullstack-messaging-system/
├── packages/shared/       # @mail-system/shared types
├── mail-system-backend/   # NestJS + Prisma API
├── mail-system-frontend/  # Next.js app
├── package.json
└── pnpm-workspace.yaml
```

## Setup

```bash
pnpm install
```

Copy `.env` into each app (`mail-system-backend`, `mail-system-frontend`) as before.

## Scripts (from repo root)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run backend + frontend in parallel |
| `pnpm dev:backend` | API only (`nest start --watch`) |
| `pnpm dev:frontend` | Web app only (`next dev`) |
| `pnpm build` | Build all packages |
| `pnpm test` | Backend tests |

## Git

Single repository at this root. Previous per-app remotes:

- Backend: `https://github.com/HaydaraAH12/mail-system-backend.git`

Create a new GitHub repo for the monorepo when ready, then:

```bash
git remote add origin <your-monorepo-url>
git push -u origin main
```
