import { z } from 'zod';

import { resumeContainer } from '@/apps/container';
import { AuthenticatedUser } from '@/modules/shared/application/authenticated-user';

const recipientSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).optional(),
});

const bulkApplySchema = z.object({
  resumeId: z.string().uuid(),
  recipients: z.array(recipientSchema).min(1),
});

const { bulkApplyUseCase } = resumeContainer;

export const bulkApplyCommand = async (user: AuthenticatedUser, payload: unknown) => {
  const input = bulkApplySchema.parse(payload);

  const result = await bulkApplyUseCase.execute({ user, input });
  if (result.isFailure) {
    throw result.error;
  }

  return result.getValue();
};
