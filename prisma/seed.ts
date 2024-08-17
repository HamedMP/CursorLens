import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  await prisma.aIConfiguration.create({
    data: {
      name: 'Default GPT-4o',
      model: 'gpt-4o',
      isDefault: true,
    },
  });
};

main();
