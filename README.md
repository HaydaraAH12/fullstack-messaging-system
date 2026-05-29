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

Copy `.env` into each app (`mail-system-backend`, `mail-system-frontend`) as before.

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
