# LoadGrid

LoadGrid is a free, no-signup distributed load-testing application. The dashboard, versioned API, database-backed control plane, and worker source now live in one Next.js repository.

Only test systems you own or have explicit permission to test. Target ownership verification, URL safety checks, run limits, audit logs, and API rate limiting remain enabled even though the product does not require user accounts.

## Architecture

```text
Browser
   |
   v
Next.js App Router (:3000)
   |-- dashboard pages
   |-- /api/v1 route handlers
   |-- application services
   |
   +--> PostgreSQL
   +--> Redis / BullMQ --> worker process --> verified target
```

Next owns both the UI and HTTP API. The long-running BullMQ consumer is a separate process started from the same package with `npm run worker`; it is not a second web application.

Public visitors use one internal shared workspace identity. There are no registration, login, session, or JWT endpoints. `/login` and `/register` redirect to `/app` for old bookmarks.

## Requirements

- Node.js 22 or newer
- PostgreSQL
- Redis

## Local development

```bash
npm install
cp .env.example .env
npm run migration:run
npm run dev
```

In a second terminal, start the queue consumer:

```bash
npm run worker:dev
```

Open `http://localhost:3000`. The browser calls the same origin under `/api/v1`, so no separate frontend API URL or CORS setup is needed.

## Docker Compose

The included Compose stack starts PostgreSQL, Redis, runs migrations once, then starts the Next app and worker:

```bash
docker compose up --build
```

The application is available at `http://localhost:3000`. PostgreSQL data is retained in the `postgres-data` volume.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next development server |
| `npm run build` | Create the production Next build |
| `npm start` | Run the production Next server |
| `npm run worker` | Run the BullMQ worker |
| `npm run worker:dev` | Run the worker in watch mode |
| `npm run migration:run` | Apply pending TypeORM migrations |
| `npm run typecheck` | Type-check the full application |
| `npm run lint` | Run ESLint |
| `npm test` | Run UI and server unit tests |
| `npm run test:e2e` | Exercise Next route handlers against real infrastructure |
| `npm run test:integration` | Run database/queue infrastructure tests |

## API

All application endpoints share the `/api/v1` prefix.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/tests` | List tests in the public workspace |
| `POST` | `/tests` | Create a test |
| `GET` | `/tests/:id` | Read a test |
| `POST` | `/tests/:testId/runs` | Start a distributed run |
| `GET` | `/runs/:id` | Read run state |
| `POST` | `/runs/:id/stop` | Request a stop |
| `GET` | `/runs/:id/metrics` | Read metric snapshots |
| `GET` | `/runs/:id/report` | Read the final report |
| `POST` | `/targets/verifications` | Begin target verification |
| `POST` | `/targets/verifications/:id/verify` | Check target ownership |
| `GET` | `/health/live` | Process liveness |
| `GET` | `/health/ready` | Database readiness |
| `GET` | `/metrics` | Prometheus metrics |

## Environment

Copy `.env.example` to `.env`. Important values are:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `WORKER_QUEUE_NAME`: BullMQ queue name
- `WORKER_CAPACITY`: virtual users assigned per worker
- `MAX_VIRTUAL_USERS_PER_RUN`: hard run-size limit
- `MAX_TEST_DURATION_SECONDS`: hard duration limit
- `TARGET_VERIFICATION_REQUIRED`: keep `true` outside controlled development
- `TARGET_REQUEST_TIMEOUT_MS`: outbound worker request timeout
- `DATABASE_SSL`: enables verified TLS for PostgreSQL

`NEXT_PUBLIC_API_BASE_URL` is optional. Leave it unset for the normal same-origin `/api/v1` API.

## Source layout

```text
src/app/                 Next pages and API route handlers
src/components/          shared UI
src/features/            dashboard screens
src/lib/                 browser API client and types
src/server/apps/api/     application services and dependency modules
src/server/apps/worker/  BullMQ worker entry point
src/server/libs/         database, domain, queue, config, and safety code
src/server/next/         Next-to-service integration
```

## Deployment notes

`Dockerfile` uses Next's standalone production output. `Dockerfile.worker` runs the worker and migration commands from the same package. Run at least one worker alongside the web process; adding more worker replicas increases queue consumption capacity.

Place the self-hosted Next server behind a reverse proxy that terminates TLS, normalizes forwarding headers, and applies infrastructure-level request limits. The application also enforces an in-process per-client limit of 120 API requests per minute.

