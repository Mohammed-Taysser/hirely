import { z } from 'zod';

import { Result, ValueObject } from '@/modules/shared/domain';

type UserEmailProps = {
  value: string;
};

export class UserEmail extends ValueObject<UserEmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserEmailProps) {
    super(props);
  }

  public static create(email: string): Result<UserEmail> {
    const schema = z.email();
    const result = schema.safeParse(email);

    if (!result.success) {
      return Result.fail('Email address is invalid');
    }

    return Result.ok(new UserEmail({ value: result.data }));
  }
}
