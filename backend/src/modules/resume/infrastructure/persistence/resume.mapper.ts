import { Prisma, Resume as PrismaResume } from '@generated-prisma';
import { ResumeData } from '@hirely/resume-core';

import { Resume } from '../../domain/resume.aggregate';
import { ResumeName } from '../../domain/value-objects/resume-name.vo';

export class ResumeMapper {
  public static toDomain(raw: PrismaResume): Resume {
    const resumeNameOrError = ResumeName.create(raw.name);

    const resumeOrError = Resume.create(
      {
        name: resumeNameOrError.getValue(),
        data: raw.data as ResumeData,
        isDefault: raw.isDefault,
        templateId: raw.templateId,
        templateVersion: raw.templateVersion,
        themeConfig: raw.themeConfig,
        userId: raw.userId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id
    );

    return resumeOrError.getValue();
  }

  public static toPersistence(resume: Resume): Prisma.ResumeUncheckedCreateInput {
    return {
      id: resume.id,
      name: resume.name.value,
      data: resume.data as Prisma.InputJsonValue,
      isDefault: resume.isDefault,
      templateId: resume.templateId,
      templateVersion: resume.templateVersion || null,
      themeConfig: resume.themeConfig as Prisma.InputJsonValue,
      userId: resume.userId,
      createdAt: resume.createdAt || new Date(),
      updatedAt: resume.updatedAt || new Date(),
    };
  }
}
