import { BulkApplyInput } from '@/modules/resume/application/bulk-apply.types';
import { AuthenticatedUser } from '@/modules/shared/application/authenticated-user';

export interface BulkApplyRequestDto {
  user: AuthenticatedUser;
  input: BulkApplyInput;
}

export interface BulkApplyResponseDto {
  batchId: string;
  exportId: string;
  recipientCount: number;
}
