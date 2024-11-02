import { PrismaClient } from "@prisma/client";
import { getModelConfigurations } from "../src/lib/model-config";
import { getModelCost } from "../src/lib/cost-calculator";

const prisma = new PrismaClient();

function convertToCostPerMillionTokens(cost: number): number {
  return cost * 1_000_000;
}

async function seedModelCosts() {
  console.log("Starting to seed model costs...");
  const modelConfigurations = getModelConfigurations();

  for (const [provider, models] of Object.entries(modelConfigurations)) {
    for (const [model, config] of Object.entries(models)) {
      if (config && "inputTokenCost" in config && "outputTokenCost" in config) {
        try {
          // Find the most recent cost entry for this provider/model
          const existingCost = await prisma.modelCost.findFirst({
            where: {
              provider,
              model,
            },
            orderBy: {
              validFrom: "desc",
            },
          });

          const newInputCost = convertToCostPerMillionTokens(
            config.inputTokenCost,
          );
          const newOutputCost = convertToCostPerMillionTokens(
            config.outputTokenCost,
          );

          // Skip if costs haven't changed
          if (
            existingCost &&
            existingCost.inputTokenCost === newInputCost &&
            existingCost.outputTokenCost === newOutputCost
          ) {
            console.log(`ℹ️ Skipping ${provider}/${model}: Costs unchanged`);
            continue;
          }

          // Only create new entry if costs have changed
          await prisma.modelCost.create({
            data: {
              provider,
              model,
              inputTokenCost: newInputCost,
              outputTokenCost: newOutputCost,
              validFrom: new Date(),
            },
          });

          console.log(`✅ Seeded new costs for ${provider}/${model}`);
        } catch (error) {
          console.error(
            `❌ Error seeding costs for ${provider}/${model}:`,
            error,
          );
        }
      }
    }
  }
}

async function updateLogCosts() {
  console.log("Starting to update log costs...");
  const logs = await prisma.log.findMany();
  console.log(`Found ${logs.length} logs to update`);

  let successCount = 0;
  let errorCount = 0;

  for (const log of logs) {
    try {
      const metadata = log.metadata as any;
      const { provider, model } = metadata;

      if (!provider || !model) {
        console.warn(`⚠️ Skipping log ${log.id}: Missing provider or model`);
        continue;
      }

      const modelCost = await getModelCost(provider, model);
      if (!modelCost) {
        console.warn(
          `⚠️ Skipping log ${log.id}: No cost configuration found for ${provider}/${model}`,
        );
        continue;
      }

      let updatedMetadata = { ...metadata };
      let response =
        typeof log.response === "string"
          ? JSON.parse(log.response)
          : log.response;

      const usage = response?.usage || {};
      const inputTokens = usage.promptTokens || metadata.inputTokens || 0;
      const outputTokens = usage.completionTokens || metadata.outputTokens || 0;
      const totalTokens = usage.totalTokens || inputTokens + outputTokens;

      if (totalTokens === 0) {
        console.warn(`⚠️ Skipping log ${log.id}: No token usage found`);
        continue;
      }

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
        `✅ Updated log ${log.id}: ${inputTokens}/${outputTokens} tokens, cost: ${totalCost.toFixed(
          6,
        )}`,
      );
      successCount++;
    } catch (error) {
      console.error(`❌ Error updating log ${log.id}:`, error);
      errorCount++;
    }
  }

  console.log(
    `\nFinished updating logs:\n✅ ${successCount} successful\n❌ ${errorCount} failed`,
  );
}

async function cleanSensitiveDataFromLogs() {
  console.log("Starting to clean sensitive data from logs...");
  const logs = await prisma.log.findMany();
  console.log(`Found ${logs.length} logs to clean`);

  let successCount = 0;
  let errorCount = 0;

  for (const log of logs) {
    try {
      let headers =
        typeof log.headers === "string" ? JSON.parse(log.headers) : log.headers;

      // Skip if headers are already cleaned
      if (!headers || headers["authorization"] === "************************") {
        continue;
      }

      const sensitiveKeys = ["authorization", "api-key", "secret"];
      let needsUpdate = false;

      Object.keys(headers).forEach((key) => {
        if (
          sensitiveKeys.some((sensitiveKey) =>
            key.toLowerCase().includes(sensitiveKey),
          )
        ) {
          headers[key] = "************************";
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        await prisma.log.update({
          where: { id: log.id },
          data: { headers: JSON.stringify(headers) },
        });
        successCount++;
        console.log(`✅ Cleaned sensitive data from log ${log.id}`);
      }
    } catch (error) {
      console.error(`❌ Error cleaning log ${log.id}:`, error);
      errorCount++;
    }
  }

  console.log(
    `\nFinished cleaning logs:\n✅ ${successCount} updated\n❌ ${errorCount} failed`,
  );
}

async function main() {
  try {
    await seedModelCosts();
    await updateLogCosts();
    await cleanSensitiveDataFromLogs();
  } catch (e) {
    console.error("Fatal error:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
