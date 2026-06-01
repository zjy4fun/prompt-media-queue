# Prompt Media Queue

A TypeScript monorepo MVP for prompt-driven cross-platform media aggregation and list playback.

The app accepts a natural-language prompt, searches multiple media platforms through connector adapters, normalizes the results into shared types, ranks them into one queue, and plays embeddable items with platform players.

## Stack

- `apps/web`: Next.js + React + TypeScript frontend
- `apps/api`: Fastify + TypeScript API
- `packages/shared`: shared schemas, types, and helpers
- Monorepo: pnpm workspaces

## Run Locally

```bash
pnpm install
pnpm dev
```

Open:

- Web: <http://localhost:3000>
- API health: <http://localhost:4000/health>

The MVP ships with deterministic sample connector results for YouTube and Bilibili so the product flow works without API keys. Real platform integrations can be added behind the connector interface in `apps/api/src/connectors`.

## Validation

Run the full strict check before committing:

```bash
pnpm validate
```

This runs ESLint with `--max-warnings=0`, TypeScript checks, and production builds.

## Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
PORT=4000
```

## Architecture

```text
apps/web
  React UI, prompt form, queue view, platform player switching

apps/api
  /aggregate endpoint, prompt expansion, platform connectors, ranking

packages/shared
  Unified media types reused by web and API
```

## Next Steps

- Add real YouTube Data API search and playlist expansion.
- Add Bilibili search integration through an approved API/provider.
- Persist sessions, queues, favorites, and feedback in Postgres.
- Add Redis cache for repeated prompt/query/platform lookups.
- Add BullMQ workers for slower multi-platform aggregation.
