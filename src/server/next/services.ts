import 'server-only';
import { LoadTestsService } from '@/server/apps/api/src/load-tests/load-tests.service';
import { RunsService } from '@/server/apps/api/src/runs/runs.service';
import { TargetVerificationService } from '@/server/apps/api/src/targets/target-verification.service';
import { PublicWorkspaceService } from '@/server/apps/api/src/workspace/public-workspace.service';
import { getServerContext } from './context';

export async function publicServices() {
  const context = await getServerContext();
  return {
    loadTests: context.get(LoadTestsService),
    runs: context.get(RunsService),
    targets: context.get(TargetVerificationService),
    workspace: context.get(PublicWorkspaceService),
  };
}
