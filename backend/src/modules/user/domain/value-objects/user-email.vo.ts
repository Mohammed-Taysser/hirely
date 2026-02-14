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

  private static isValidEmail(email: string): boolean {
    if (!email || email.includes(' ')) return false;

    const atIndex = email.indexOf('@');
    if (atIndex <= 0 || atIndex !== email.lastIndexOf('@')) return false;

    const local = email.slice(0, atIndex);
    const domain = email.slice(atIndex + 1);
    if (!local || !domain) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (!domain.includes('.') || domain.includes('..')) return false;

    const labels = domain.split('.');
    return labels.every((label) => label.length > 0);
  }

  public static create(email: string): Result<UserEmail> {
    const value = email.trim();

    if (!this.isValidEmail(value)) {
      return Result.fail('Email address is invalid');
    }

    return Result.ok(new UserEmail({ value }));
  }
}
