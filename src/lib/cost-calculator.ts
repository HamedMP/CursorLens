import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getModelCost(provider: string, model: string) {
  const currentDate = new Date();
  const modelCost = await prisma.modelCost.findFirst({
    where: {
      provider,
      model,
      OR: [{ validFrom: null }, { validFrom: { lte: currentDate } }],
      OR: [{ validTo: null }, { validTo: { gte: currentDate } }],
    },
    orderBy: { validFrom: "desc" },
  });

  if (!modelCost) {
    throw new Error(`No cost data found for ${provider} ${model}`);
  }

  return modelCost;
}

export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  modelCost: { inputTokenCost: number; outputTokenCost: number },
) {
  return (
    (inputTokens / 1000000) * modelCost.inputTokenCost +
    (outputTokens / 1000000) * modelCost.outputTokenCost
  );
}
