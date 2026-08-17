import { prisma } from './src/lib/prisma';

async function main() {
  const res = await prisma.soalPretest.findFirst({
    include: { answerOptions: true }
  });
  console.log(JSON.stringify(res, null, 2));
}

main().finally(() => prisma.$disconnect());
