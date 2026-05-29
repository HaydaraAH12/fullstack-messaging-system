# mail-system-frontend

Next.js (App Router) frontend for the fullstack mail system. NestJS backend: `http://localhost:8080`.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS 4**, **ESLint**
- **socket.io-client** — realtime on namespace `/mail` (JWT in `auth.token`)
- **@tanstack/react-query** — data fetching & cache
- **zustand** — auth state (JWT)
- **zod** + **react-hook-form** — forms (login / register / send)
- **lucide-react** — sidebar icons (inbox, send, trash)

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command       | Description          |
|---------------|----------------------|
| `pnpm dev`    | Start dev server     |
| `pnpm build`  | Production build     |
| `pnpm start`  | Start production     |
| `pnpm lint`   | Run ESLint           |

## Project structure

```
src/
├── app/
│   ├── (auth)/login, register
│   ├── (mail)/layout + inbox, sent, trash
│   └── layout.tsx, page.tsx
├── components/     providers, mail-sidebar
├── hooks/          useAuth
├── lib/            api, socket, constants, validations
├── stores/         auth-store (zustand)
└── types/          API types
```

## Backend

API and WebSocket will be wired to the Nest backend at `NEXT_PUBLIC_API_URL` in a later step.
