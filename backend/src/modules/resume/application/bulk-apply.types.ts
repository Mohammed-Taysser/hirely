export interface BulkApplyRecipient {
  email: string;
  name?: string;
  company?: string;
  message?: string;
}

export interface BulkApplyInput {
  resumeId: string;
  recipients: BulkApplyRecipient[];
}
