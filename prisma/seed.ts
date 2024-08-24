import { PrismaClient } from "@prisma/client";
import { getModelConfigurations } from "../src/lib/model-config";

const prisma = new PrismaClient();

async function main() {
  const modelConfigurations = getModelConfigurations();

  await prisma.modelCost.deleteMany({});

  for (const [provider, models] of Object.entries(modelConfigurations)) {
    for (const [model, config] of Object.entries(models)) {
      if (config && "inputTokenCost" in config && "outputTokenCost" in config) {
        await prisma.modelCost.upsert({
          where: {
            provider_model_validFrom: {
              provider,
              model,
              validFrom: new Date("2024-08-01"),
            },
          },
          update: {
            inputTokenCost: config.inputTokenCost,
            outputTokenCost: config.outputTokenCost,
          },
          create: {
            provider,
            model,
            inputTokenCost: config.inputTokenCost,
            outputTokenCost: config.outputTokenCost,
            validFrom: new Date("2024-08-01"),
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
