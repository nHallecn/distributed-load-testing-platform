import { createServer } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.PORT ?? 4000);

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
  response.setHeader('cache-control', 'no-store');
  response.setHeader('content-type', 'application/json; charset=utf-8');

  if (url.pathname === '/health') {
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (url.pathname === '/slow') {
    const milliseconds = Math.min(5_000, Math.max(50, Number(url.searchParams.get('ms') ?? 650)));
    await delay(milliseconds);
    response.end(JSON.stringify({ route: 'slow', latencyMs: milliseconds }));
    return;
  }

  if (url.pathname === '/random-errors') {
    const failed = Math.random() < 0.2;
    response.statusCode = failed ? 503 : 200;
    response.end(JSON.stringify({ route: 'random-errors', ok: !failed }));
    return;
  }

  if (url.pathname === '/timeout') {
    await delay(15_000);
    response.end(JSON.stringify({ route: 'timeout' }));
    return;
  }

  if (url.pathname === '/fast') {
    response.end(JSON.stringify({ route: 'fast', ok: true, timestamp: new Date().toISOString() }));
    return;
  }

  response.statusCode = 404;
  response.end(
    JSON.stringify({
      error: 'Not found',
      available: ['/fast', '/slow?ms=650', '/random-errors', '/timeout', '/health'],
    }),
  );
});

server.listen(port, '0.0.0.0', () => {
  console.log(`LoadGrid demo target listening on ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
