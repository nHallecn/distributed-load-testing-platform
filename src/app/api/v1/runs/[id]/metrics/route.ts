import { apiResponse, uuid } from '@/server/next/http';
import { publicServices } from '@/server/next/services';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return apiResponse(request, async () => {
    const { id } = await params;
    const { runs, workspace } = await publicServices();
    return runs.getMetrics(await workspace.ownerId(), uuid(id));
  });
}
