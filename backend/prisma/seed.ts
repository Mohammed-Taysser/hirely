import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

import { PrismaClient } from './generated';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString:  process.env.DATABASE_URL }),
});

const seed = async () => {
  const plans = [
    {
      code: 'FREE',
      name: 'Free',
      description: 'Starter plan',
      limits: { maxResumes: 2, maxExports: 2, dailyUploadMb: 100 },
    },
    {
      code: 'PLUS',
      name: 'Plus',
      description: 'For active job seekers',
      limits: { maxResumes: 10, maxExports: 20, dailyUploadMb: 500 },
    },
    {
      code: 'PRO',
      name: 'Pro',
      description: 'Teams and power users',
      limits: { maxResumes: 50, maxExports: 200, dailyUploadMb: 1024 },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        description: plan.description,
        limits: {
          upsert: {
            create: plan.limits,
            update: plan.limits,
          },
        },
      },
      create: {
        code: plan.code,
        name: plan.name,
        description: plan.description,
        limits: { create: plan.limits },
      },
    });
  }

  const freePlan = await prisma.plan.findUnique({ where: { code: 'FREE' } });
  if (!freePlan) {
    throw new Error('FREE plan missing');
  }

  const demoEmail = 'demo@hirely.app';
  const existingUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!existingUser) {
    const hashed = await bcrypt.hash(process.env.SEED_USER_PASSWORD || '123456', 10);

    const user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: 'Demo User',
        password: hashed,
        planId: freePlan.id,
      },
    });

    await prisma.resume.create({
      data: {
        userId: user.id,
        name: 'Demo Resume',
        templateId: '1',
        data: {
          meta: { title: 'Backend Engineer', language: 'en' },
          sections: {
            summary: {
              type: 'summary',
              content: { text: 'Senior backend engineer with 6+ years experience.' },
            },
            experience: {
              type: 'experience',
              content: {
                company: 'Acme Inc',
                role: 'Backend Engineer',
                startDate: new Date('2021-01-01'),
                endDate: new Date('2024-01-01'),
              },
            },
          },
        },
      },
    });
  }
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
