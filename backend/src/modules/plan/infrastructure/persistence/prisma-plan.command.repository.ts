import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import { IPlanCommandRepository } from '@/modules/plan/application/repositories/plan.command.repository.interface';
import { PlanDto } from '@/modules/plan/application/repositories/plan.query.repository.interface';
import {
  CreatePlanRequestDto,
  UpdatePlanDataDto,
} from '@/modules/plan/application/dto/plan-command.dto';

export class PrismaPlanCommandRepository implements IPlanCommandRepository {
  async create(data: CreatePlanRequestDto): Promise<PlanDto> {
    const prismaData: Prisma.PlanCreateInput = {
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      limits: data.limits,
    };

    return prisma.plan.create({ data: prismaData, include: { limits: true } });
  }

  async update(id: string, data: UpdatePlanDataDto): Promise<PlanDto> {
    const prismaData: Prisma.PlanUpdateInput = {
      code: data.code,
      name: data.name,
      description: data.description === undefined ? undefined : data.description,
      limits: data.limits,
    };

    return prisma.plan.update({ where: { id }, data: prismaData, include: { limits: true } });
  }

  async delete(id: string): Promise<PlanDto> {
    return prisma.plan.delete({ where: { id }, include: { limits: true } });
  }
}
