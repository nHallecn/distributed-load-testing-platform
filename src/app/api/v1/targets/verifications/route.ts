import { CreateTargetVerificationDto } from '@/server/apps/api/src/targets/dto';
import { apiResponse, validatedBody } from '@/server/next/http';
import { publicServices } from '@/server/next/services';
import { workspaceKey } from '@/server/next/workspace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return apiResponse(request, async () => {
    const { targets, workspace } = await publicServices();
    return targets.list(await workspace.ownerId(workspaceKey(request)));
  });
}

export async function POST(request: Request) {
  return apiResponse(request, async () => {
    const dto = await validatedBody(request, CreateTargetVerificationDto);
    const { targets, workspace } = await publicServices();
    return targets.create(await workspace.ownerId(workspaceKey(request)), dto);
  }, 201);
}
