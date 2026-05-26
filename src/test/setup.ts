import { prisma } from '@/lib/prisma';
import { beforeAll, beforeEach, afterAll } from 'vitest';

async function clearDatabase() {
  const tablenames = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

  const tables = tablenames
    .map(({ tablename }) => `"${tablename}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

beforeAll(async () => {
  await clearDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
