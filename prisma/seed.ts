import { PrismaClient } from "@prisma/client";
import { getModelConfigurations } from "../src/lib/model-config";

const prisma = new PrismaClient();

function convertToCostPerMillionTokens(cost: number): number {
  return cost * 1_000_000;
}

async function main() {
  const modelConfigurations = getModelConfigurations();

  for (const [provider, models] of Object.entries(modelConfigurations)) {
    for (const [model, config] of Object.entries(models)) {
      if (config && "inputTokenCost" in config && "outputTokenCost" in config) {
        await prisma.modelCost.upsert({
          where: {
            provider_model_validFrom: {
              provider,
              model,
              validFrom: new Date(),
            },
          },
          update: {
            inputTokenCost: convertToCostPerMillionTokens(
              config.inputTokenCost,
            ),
            outputTokenCost: convertToCostPerMillionTokens(
              config.outputTokenCost,
            ),
          },
          create: {
            provider,
            model,
            inputTokenCost: convertToCostPerMillionTokens(
              config.inputTokenCost,
            ),
            outputTokenCost: convertToCostPerMillionTokens(
              config.outputTokenCost,
            ),
            validFrom: new Date(),
          },
        });
      }
    }
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
