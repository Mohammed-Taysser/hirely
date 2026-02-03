import { z } from 'zod';

import { Result, ValueObject } from '@/modules/shared/domain';

type ResumeNameProps = {
  value: string;
};

export class ResumeName extends ValueObject<ResumeNameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: ResumeNameProps) {
    super(props);
  }

  public static create(name: string): Result<ResumeName> {
    const schema = z.string().trim().min(1).max(255);
    const result = schema.safeParse(name);

    if (!result.success) {
      return Result.fail('Resume name must be between 1 and 255 characters long');
    }

    return Result.ok(new ResumeName({ value: result.data }));
  }
}
