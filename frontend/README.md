# Frontend

React control-plane dashboard for the distributed load-testing platform.

## Capabilities

- Account registration, sign-in, session restoration, and protected routes
- DNS TXT and HTTPS-file target ownership challenges
- Load-test profile creation with validated JSON headers/body and safety limits
- Test profile listing and details
- Run dispatch and coordinated stop requests
- Live polling and aggregation of worker throughput, latency, users, errors, and status codes
- Final run summaries and responsive operator views

The UI does not contain sample test or metrics data. Dashboard states come from
the configured backend API.

## Configuration

```powershell
Copy-Item .env.example .env
```

Set `VITE_API_BASE_URL` to the backend's versioned API URL. For local
development it defaults to `http://localhost:5000/api/v1`.

## Development

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality gates

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

## Container

The API URL is compiled into the static application at build time:

```powershell
docker build --build-arg VITE_API_BASE_URL=https://api.example.com/api/v1 -t loadgrid-frontend .
```

The unprivileged Nginx image serves the application on port `8080` with SPA
routing, immutable asset caching, and baseline browser-security headers.
