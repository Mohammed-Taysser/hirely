import { PrismaClient } from '@generated-prisma';
import { PrismaPg } from '@prisma/adapter-pg';

import CONFIG from './config';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: CONFIG.DATABASE_URL }),
});

export default prisma;
