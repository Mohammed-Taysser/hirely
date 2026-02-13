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
    const value = name.trim();

    if (value.length < 1 || value.length > 255) {
      return Result.fail('Resume name must be between 1 and 255 characters long');
    }

    return Result.ok(new ResumeName({ value }));
  }
}
