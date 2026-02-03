import prisma from '@/apps/prisma';
import {
  IPlanCommandRepository,
  PlanCommandDto,
} from '@/modules/plan/application/repositories/plan.command.repository.interface';
import { Prisma } from '@generated-prisma';

export class PrismaPlanCommandRepository implements IPlanCommandRepository {
  async create(data: Prisma.PlanCreateInput): Promise<PlanCommandDto> {
    return prisma.plan.create({ data, include: { limits: true } });
  }

  async update(id: string, data: Prisma.PlanUpdateInput): Promise<PlanCommandDto> {
    return prisma.plan.update({ where: { id }, data, include: { limits: true } });
  }

  async delete(id: string): Promise<PlanCommandDto> {
    return prisma.plan.delete({ where: { id }, include: { limits: true } });
  }
}
