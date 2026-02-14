import { ResumeData } from '@hirely/resume-core';

import { ResumeName } from './value-objects/resume-name.vo';

import { AggregateRoot, Result } from '@/modules/shared/domain';

interface ResumeProps {
  name: ResumeName;
  data: ResumeData;
  isDefault?: boolean;
  templateId: string;
  templateVersion?: string | null;
  themeConfig?: unknown;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Resume extends AggregateRoot<ResumeProps> {
  get name(): ResumeName {
    return this.props.name;
  }
  get data(): ResumeData {
    return this.props.data;
  }
  get isDefault(): boolean {
    return this.props.isDefault ?? false;
  }
  get templateId(): string {
    return this.props.templateId;
  }
  get templateVersion(): string | null | undefined {
    return this.props.templateVersion;
  }
  get themeConfig(): unknown {
    return this.props.themeConfig;
  }
  get userId(): string {
    return this.props.userId;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  private constructor(props: ResumeProps, id?: string) {
    super(props, id);
  }

  public static create(props: ResumeProps, id?: string): Result<Resume> {
    const resume = new Resume(
      {
        ...props,
        isDefault: props.isDefault ?? false,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id
    );

    return Result.ok(resume);
  }

  public updateData(newData: ResumeData): void {
    this.props.data = newData;
    this.props.updatedAt = new Date();
  }

  public rename(newName: ResumeName): void {
    this.props.name = newName;
    this.props.updatedAt = new Date();
  }

  public changeTemplate(templateId: string, version?: string): void {
    this.props.templateId = templateId;
    this.props.templateVersion = version;
    this.props.updatedAt = new Date();
  }

  public updateTheme(config: unknown): void {
    this.props.themeConfig = config;
    this.props.updatedAt = new Date();
  }

  public setDefault(isDefault: boolean): void {
    this.props.isDefault = isDefault;
    this.props.updatedAt = new Date();
  }
}
