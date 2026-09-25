import { apiResponse } from '@/server/next/http';
import { publicServices } from '@/server/next/services';
import { workspaceKey } from '@/server/next/workspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return apiResponse(request, async () => {
    const { runs, workspace } = await publicServices();
    return runs.listRecent(await workspace.ownerId(workspaceKey(request)));
  });
}
