# Backend

Production-oriented NestJS control plane and distributed worker for the load-testing platform.

## Services

- `api`: authentication, target verification, test definitions, run lifecycle, reports, health checks, and Prometheus metrics.
- `worker`: consumes partitioned BullMQ jobs, generates HTTP traffic, records one-second metric snapshots, and finalizes run summaries.
- PostgreSQL: durable users, tests, runs, workers, metrics summaries, and audit events.
- Redis: BullMQ job transport and run-cancellation signals.

## Prerequisites

- Node.js 22 or newer
- PostgreSQL 15 or newer
- Redis 7 or newer

PostgreSQL and Redis are external dependencies. Do not commit their credentials.

## External service setup

1. Create one PostgreSQL database and a dedicated application user.
2. Grant that user ownership of the database (or permission to create tables, indexes, enum types, and the `pgcrypto` extension).
3. Copy the provider's connection URI into `DATABASE_URL`.
4. Set `DATABASE_SSL=true` for a hosted database that requires TLS.
5. Create one Redis database. It must support BullMQ commands; a normal Redis 7 instance is sufficient.
6. Copy its URI into `REDIS_URL`. Use a `rediss://` URI when the provider requires TLS.
7. Generate a random JWT secret with at least 32 characters. For example:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

No Prometheus or object-storage credentials are required for this first slice. Prometheus can scrape the API's `/api/v1/metrics` endpoint later.

## Local configuration

```powershell
Copy-Item .env.example .env
npm install
npm run migration:run
```

Replace every placeholder in `.env` before starting a service. `TARGET_VERIFICATION_REQUIRED` should remain `true` outside isolated automated tests.

## Run

In separate terminals:

```powershell
npm run start:api:dev
npm run start:worker:dev
```

The API defaults to `http://localhost:5000/api/v1`. OpenAPI documentation is available at `/api/v1/docs` in non-production environments.

## Lifecycle

1. Register or log in through `/auth`.
2. Create a DNS TXT or HTTPS-file challenge through `POST /targets/verifications`.
3. Publish the returned proof at the target domain and call `POST /targets/verifications/:id/verify`.
4. Create a test through `POST /tests`.
5. Start it through `POST /tests/:testId/runs`.
6. Read `/runs/:id/metrics` while it runs and `/runs/:id/report` when it ends.

The worker count is `ceil(virtualUsers / WORKER_CAPACITY)`. One independently retryable queue job is created per worker partition.

## Safety defaults

- Only HTTP and HTTPS targets are accepted.
- URL-embedded credentials, localhost, private networks, link-local addresses, metadata endpoints, and reserved IP ranges are rejected.
- Redirects are disabled in worker requests to prevent redirect-based SSRF.
- A verified target is required before a test can be created as runnable.
- Virtual-user and duration limits are enforced by configuration.
- Stop conditions and user-initiated cancellation propagate through Redis.
- Lifecycle actions are written to immutable audit rows.

Network egress policy must also be enforced at the Kubernetes or cloud-network layer before production deployment. Application checks are one layer, not a substitute for infrastructure controls.

## Quality gates

```powershell
npm run build
npm test
npm run lint
```

## Containers

```powershell
docker build -f Dockerfile.api -t distributed-load-testing-api .
docker build -f Dockerfile.worker -t distributed-load-testing-worker .
```
