# Fullstack Messaging System

A modern full-stack messaging platform built with Next.js and NestJS in a pnpm monorepo. Features real-time communication, scalable backend APIs, authentication, modular architecture, and shared packages for types.

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

Copy env files into each app:

- `mail-system-backend/.env.example` → `mail-system-backend/.env`
- `mail-system-frontend/.env.example` → `mail-system-frontend/.env`

### Gmail SMTP (optional notification emails)

When a user sends a message in the app, the API can email recipients via Nodemailer. Set `SMTP_*` and `MAIL_FROM` in the backend `.env` (see `.env.example`). On startup you should see `SMTP connection verified` in the backend logs.

Use a [Google App Password](https://myaccount.google.com/apppasswords), not your normal Gmail password. Typical values:

| Variable | Value |
|----------|--------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | your Gmail address |
| `SMTP_PASS` | 16-char app password |
| `MAIL_FROM` | `"App Name" <your@gmail.com>` |

If SMTP vars are missing, in-app messaging still works; only external emails are skipped.

## Scripts (from repo root)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run backend + frontend in parallel |
| `pnpm dev:backend` | API only (`nest start --watch`) |
| `pnpm dev:frontend` | Web app only (`next dev`) |
| `pnpm build` | Build all packages |
| `pnpm test` | Backend tests |

## Remote

```bash
git remote add origin https://github.com/HaydaraAH12/fullstack-messaging-system.git
git push -u origin main
```
