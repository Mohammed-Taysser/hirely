import { BulkApplyInput } from '@/modules/apply/application/dto/bulk-apply.dto';
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
