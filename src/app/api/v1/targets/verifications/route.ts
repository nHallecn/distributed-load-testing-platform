import { CreateTargetVerificationDto } from '@/server/apps/api/src/targets/dto';
import { apiResponse, validatedBody } from '@/server/next/http';
import { publicServices } from '@/server/next/services';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return apiResponse(request, async () => {
    const dto = await validatedBody(request, CreateTargetVerificationDto);
    const { targets, workspace } = await publicServices();
    return targets.create(await workspace.ownerId(), dto);
  }, 201);
}
