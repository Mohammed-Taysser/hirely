import { z } from 'zod';

import { Result, ValueObject } from '@/modules/shared/domain';

type UserNameProps = {
  value: string;
};

export class UserName extends ValueObject<UserNameProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserNameProps) {
    super(props);
  }

  public static create(name: string): Result<UserName> {
    const schema = z.string().trim().min(2).max(100);
    const result = schema.safeParse(name);

    if (!result.success) {
      return Result.fail('Name must be between 2 and 100 characters long');
    }

    return Result.ok(new UserName({ value: result.data }));
  }
}
