import { apiResponse, uuid } from '@/server/next/http';
import { publicServices } from '@/server/next/services';
import { workspaceKey } from '@/server/next/workspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return apiResponse(request, async () => {
    const { id } = await params;
    const { runs, workspace } = await publicServices();
    return runs.listForTest(
      await workspace.ownerId(workspaceKey(request)),
      uuid(id),
    );
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return apiResponse(request, async () => {
    const { id } = await params;
    const { runs, workspace } = await publicServices();
    return runs.start(await workspace.ownerId(workspaceKey(request)), uuid(id));
  }, 201);
}
