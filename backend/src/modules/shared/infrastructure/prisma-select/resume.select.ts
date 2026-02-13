import { Prisma } from '@generated-prisma';

class ResumeSelect {
  public basic = {
    id: true,
    name: true,
  } satisfies Prisma.ResumeSelect;

  public full = {
    ...this.basic,
    userId: true,
    createdAt: true,
    updatedAt: true,
    data: true,
  } satisfies Prisma.ResumeSelect;
}

export default new ResumeSelect();
