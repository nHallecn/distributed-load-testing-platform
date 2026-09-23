import { CreateLoadTestDto } from '@/server/apps/api/src/load-tests/dto';
import { apiResponse, validatedBody } from '@/server/next/http';
import { publicServices } from '@/server/next/services';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return apiResponse(request, async () => {
    const { loadTests, workspace } = await publicServices();
    return loadTests.list(await workspace.ownerId());
  });
}

export async function POST(request: Request) {
  return apiResponse(request, async () => {
    const dto = await validatedBody(request, CreateLoadTestDto);
    const { loadTests, workspace } = await publicServices();
    return loadTests.create(await workspace.ownerId(), dto);
  }, 201);
}
