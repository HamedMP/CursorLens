// lib/db.ts
import prisma from './prisma';

export async function insertLog(logEntry: any) {
  return prisma.log.create({
    data: logEntry,
  });
}

export async function getLogs(filterHomepage: boolean) {
  return prisma.log.findMany({
    where: filterHomepage
      ? {
          NOT: {
            url: '/',
          },
        }
      : {},
    orderBy: {
      timestamp: 'desc',
    },
  });
}

export async function getDefaultConfiguration() {
  const config = await prisma.aIConfiguration.findFirst({
    where: { isDefault: true },
  });
  return config;
}
