import { DataSource } from 'typeorm';
import { apiResponse } from '@/server/next/http';
import { getServerContext } from '@/server/next/context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return apiResponse(request, async () => {
    const context = await getServerContext();
    await context.get(DataSource).query('SELECT 1');
    return {
      status: 'ok',
      info: { database: { status: 'up' } },
      timestamp: new Date().toISOString(),
    };
  });
}
