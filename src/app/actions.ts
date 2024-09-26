"use server";

import { getModelConfigurations } from "@/lib/model-config";
import prisma from "@/lib/prisma";
import type { Log, AIConfiguration, Prisma } from "@prisma/client";

// Helper function to serialize dates
function serializeDates<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Add the metadata type definition
type LogMetadata = {
  topP: number;
  model: string;
  configId: string;
  provider: string;
  maxTokens: number;
  temperature: number;
  presencePenalty: number;
  frequencyPenalty: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
};

export async function getLogs({
  provider = "all",
  startDate = "",
  endDate = "",
}: { provider?: string; startDate?: string; endDate?: string } = {}) {
  try {
    const query: Prisma.LogFindManyArgs = {
      orderBy: {
        timestamp: "desc",
      },
    };

    const whereConditions: Prisma.LogWhereInput = {};

    if (provider !== "all") {
      whereConditions.metadata = {
        path: ["provider"],
        equals: provider,
      };
    }

    if (startDate || endDate) {
      whereConditions.timestamp = {};
      if (startDate) {
        whereConditions.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        whereConditions.timestamp.lte = new Date(endDate);
      }
    }

    // Only add the where clause if we have conditions
    if (Object.keys(whereConditions).length > 0) {
      query.where = whereConditions;
    }

    const logs = await prisma.log.findMany(query);

    // Cast the metadata to the correct type
    return logs.map((log) => ({
      ...log,
      metadata: log.metadata as LogMetadata,
    }));
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}

export async function getStats(timeFilter = "all"): Promise<{
  totalLogs: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  perModelProviderStats: {
    [key: string]: {
      logs: number;
      tokens: number;
      promptTokens: number;
      completionTokens: number;
      cost: number;
      provider: string;
      model: string;
    };
  };
  tokenUsageOverTime: {
    date: string;
    tokens: number;
    promptTokens: number;
    completionTokens: number;
  }[];
}> {
  let startDate = new Date(0); // Default to all time

  switch (timeFilter) {
    case "day":
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      break;
    case "week":
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  const logs = await prisma.log.findMany({
    where: {
      timestamp: {
        gte: startDate,
      },
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  const perModelProviderStats: {
    [key: string]: {
      logs: number;
      tokens: number;
      promptTokens: number;
      completionTokens: number;
      cost: number;
      provider: string;
      model: string;
    };
  } = {};

  let totalTokens = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  const tokenUsageOverTime: {
    date: string;
    tokens: number;
    promptTokens: number;
    completionTokens: number;
  }[] = [];

  for (const log of logs) {
    const metadata = log.metadata as LogMetadata;
    const model = metadata.model || "unknown";
    const provider = metadata.provider || "unknown";
    const key = `${provider}:${model}`;

    if (!perModelProviderStats[key]) {
      perModelProviderStats[key] = {
        logs: 0,
        tokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        cost: 0,
        provider,
        model,
      };
    }
    perModelProviderStats[key].logs += 1;

    const tokens = metadata.totalTokens || 0;
    const promptTokens = metadata.inputTokens || 0;
    const completionTokens = metadata.outputTokens || 0;
    const cost = metadata.totalCost || 0;

    perModelProviderStats[key].tokens += tokens;
    perModelProviderStats[key].promptTokens += promptTokens;
    perModelProviderStats[key].completionTokens += completionTokens;
    perModelProviderStats[key].cost += cost;

    totalTokens += tokens;
    totalPromptTokens += promptTokens;
    totalCompletionTokens += completionTokens;

    const date = log.timestamp.toISOString().split("T")[0];
    const existingEntry = tokenUsageOverTime.find(
      (entry) => entry.date === date,
    );
    if (existingEntry) {
      existingEntry.tokens += tokens;
      existingEntry.promptTokens += promptTokens;
      existingEntry.completionTokens += completionTokens;
    } else {
      tokenUsageOverTime.push({
        date,
        tokens,
        promptTokens,
        completionTokens,
      });
    }
  }

  return {
    totalLogs: logs.length,
    totalTokens,
    totalPromptTokens,
    totalCompletionTokens,
    perModelProviderStats,
    tokenUsageOverTime,
  };
}

export async function getConfigurations(): Promise<AIConfiguration[]> {
  const configs = await prisma.aIConfiguration.findMany();
  return serializeDates(configs);
}

export async function updateDefaultConfiguration(
  configId: string,
): Promise<void> {
  await prisma.aIConfiguration.updateMany({
    where: { isDefault: true },
    data: { isDefault: false },
  });
  await prisma.aIConfiguration.update({
    where: { id: configId },
    data: { isDefault: true },
  });
}

export async function createConfiguration(config: Partial<AIConfiguration>) {
  const {
    name,
    provider,
    model,
    temperature,
    maxTokens,
    topP,
    frequencyPenalty,
    presencePenalty,
    isDefault,
    apiKey,
  } = config;

  // TODO: Consider using Zod schemas for validation and potentially integrate
  // https://github.com/vantezzen/auto-form for form generation and validation

  // Guard clause to ensure required fields are present
  if (!name || !provider || !model) {
    throw new Error("Name, provider, and model are required fields");
  }

  const newConfig = await prisma.aIConfiguration.create({
    data: {
      name,
      provider,
      model,
      temperature: temperature,
      maxTokens: maxTokens,
      topP: topP,
      frequencyPenalty: frequencyPenalty,
      presencePenalty: presencePenalty,
      isDefault: isDefault,
      apiKey: apiKey,
    },
  });

  return serializeDates(newConfig);
}

export async function updateConfiguration(
  id: string,
  data: Partial<AIConfiguration>,
): Promise<AIConfiguration> {
  const updatedConfig = await prisma.aIConfiguration.update({
    where: { id },
    data,
  });
  return serializeDates(updatedConfig);
}

export async function deleteConfiguration(id: string) {
  try {
    const deletedConfig = await prisma.aIConfiguration.delete({
      where: { id },
    });
    return serializeDates(deletedConfig);
  } catch (error) {
    console.error("Error deleting configuration:", error);
    throw new Error("Failed to delete configuration");
  }
}

type ConfigurationCost = {
  provider: string;
  model: string;
  inputTokenCost: number;
  outputTokenCost: number;
};

export async function getConfigurationCosts(): Promise<ConfigurationCost[]> {
  const modelConfigurations = getModelConfigurations();
  return Object.entries(modelConfigurations).flatMap(([provider, models]) =>
    Object.entries(models)
      .filter(
        (entry): entry is [string, NonNullable<(typeof entry)[1]>] =>
          entry[1] !== null &&
          "inputTokenCost" in entry[1] &&
          "outputTokenCost" in entry[1],
      )
      .map(([model, config]) => ({
        provider,
        model,
        inputTokenCost: config.inputTokenCost,
        outputTokenCost: config.outputTokenCost,
      })),
  );
}

export { getModelConfigurations };

export async function setDefaultConfiguration(configId: string): Promise<void> {
  try {
    await prisma.aIConfiguration.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
    await prisma.aIConfiguration.update({
      where: { id: configId },
      data: { isDefault: true },
    });
  } catch (error) {
    console.error("Error setting default configuration:", error);
    throw error;
  }
}
