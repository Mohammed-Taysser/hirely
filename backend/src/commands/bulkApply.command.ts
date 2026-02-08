import { applyContainer } from '@/apps/container';
import { bulkApplySchema } from '@/modules/apply/application/dto/bulk-apply.dto';
import { AuthenticatedUser } from '@/modules/shared/application/authenticated-user';

const { bulkApplyUseCase } = applyContainer;

export const bulkApplyCommand = async (user: AuthenticatedUser, payload: unknown) => {
  const input = bulkApplySchema.parse(payload);

  const result = await bulkApplyUseCase.execute({ user, input });
  if (result.isFailure) {
    throw result.error;
  }

  return result.getValue();
};
