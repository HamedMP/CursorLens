import { PrismaClient } from "@prisma/client";
import { getModelCost } from "../src/lib/cost-calculator";

const prisma = new PrismaClient();

async function updateLogCosts() {
  const logs = await prisma.log.findMany();

  console.log(`Found ${logs.length} logs to update`);

  for (const log of logs) {
    try {
      const metadata = log.metadata as any;
      const { provider, model } = metadata;

      if (!provider || !model) {
        console.warn(`Skipping log ${log.id}: Missing provider or model`);
        continue;
      }

      const modelCost = await getModelCost(provider, model);

      let updatedMetadata = { ...metadata };
      let response =
        typeof log.response === "string"
          ? JSON.parse(log.response)
          : log.response;

      // Extract token usage from response
      const usage = response?.usage || {};
      const inputTokens = usage.promptTokens || metadata.inputTokens || 0;
      const outputTokens = usage.completionTokens || metadata.outputTokens || 0;
      const totalTokens = usage.totalTokens || inputTokens + outputTokens;

      // Calculate costs
      const inputCost = (inputTokens / 1000000) * modelCost.inputTokenCost;
      const outputCost = (outputTokens / 1000000) * modelCost.outputTokenCost;
      const totalCost = inputCost + outputCost;

      updatedMetadata = {
        ...updatedMetadata,
        inputTokens,
        outputTokens,
        totalTokens,
        inputCost,
        outputCost,
        totalCost,
      };

      await prisma.log.update({
        where: { id: log.id },
        data: { metadata: updatedMetadata },
      });

      console.log(
        `Updated log ${log.id}: inputTokens=${inputTokens}, outputTokens=${outputTokens}, totalCost=${totalCost}`,
      );
    } catch (error) {
      console.error(`Error updating log ${log.id}:`, error);
    }
  }

  console.log("Finished updating logs");
}

updateLogCosts()
  .catch((error) => {
    console.error("Error in updateLogCosts:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
