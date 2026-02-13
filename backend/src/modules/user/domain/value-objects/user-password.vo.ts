import { Result, ValueObject } from '@/modules/shared/domain';

type UserPasswordProps = {
  value: string;
  isHashed: boolean;
};

export class UserPassword extends ValueObject<UserPasswordProps> {
  get value(): string {
    return this.props.value;
  }

  get isHashed(): boolean {
    return this.props.isHashed;
  }

  private constructor(props: UserPasswordProps) {
    super(props);
  }

  public static create(password: string, isHashed: boolean = false): Result<UserPassword> {
    if (!isHashed) {
      if (password.length < 8) {
        return Result.fail('Password must be at least 8 characters long');
      }
    }

    return Result.ok(new UserPassword({ value: password, isHashed }));
  }
}
