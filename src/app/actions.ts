"use server";

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
  perModelStats: {
    [key: string]: {
      logs: number;
      tokens: number;
      promptTokens: number;
      completionTokens: number;
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

  const perModelStats: {
    [key: string]: {
      logs: number;
      tokens: number;
      promptTokens: number;
      completionTokens: number;
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
    const metadata = log.metadata as Record<string, unknown>;
    const model = (metadata.model as string) || "unknown";
    if (!perModelStats[model]) {
      perModelStats[model] = {
        logs: 0,
        tokens: 0,
        promptTokens: 0,
        completionTokens: 0,
      };
    }
    perModelStats[model].logs += 1;

    try {
      const responseObj = JSON.parse(log.response);
      const tokens = responseObj.usage?.totalTokens || 0;
      const promptTokens = responseObj.usage?.promptTokens || 0;
      const completionTokens = responseObj.usage?.completionTokens || 0;
      perModelStats[model].tokens += tokens;
      perModelStats[model].promptTokens += promptTokens;
      perModelStats[model].completionTokens += completionTokens;
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
    } catch (error) {
      console.error("Error parsing log response:", error);
    }
  }

  return {
    totalLogs: logs.length,
    totalTokens,
    totalPromptTokens,
    totalCompletionTokens,
    perModelStats,
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

export async function createConfiguration(
  data: Partial<AIConfiguration>,
): Promise<AIConfiguration> {
  const newConfig = await prisma.aIConfiguration.create({
    data: {
      ...data,
      isDefault: false, // Ensure new configurations are not default by default
    } as AIConfiguration,
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

export async function deleteConfiguration(id: string): Promise<void> {
  await prisma.aIConfiguration.delete({
    where: { id },
  });
}

type ConfigurationCost = {
  provider: string;
  model: string;
  inputTokenCost: number;
  outputTokenCost: number;
};

export async function getConfigurationCosts(): Promise<ConfigurationCost[]> {
  // TODO: (Stephen) When the prices change we need to factor in the valid from until date ranges
  return [
    {
      provider: "openai",
      model: "gpt-4o",
      inputTokenCost: 0.000005,
      outputTokenCost: 0.000015,
    },
    {
      provider: "openai",
      model: "gpt-4o-2024-08-06",
      inputTokenCost: 0.0000025,
      outputTokenCost: 0.00001,
    },
    {
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokenCost: 0.00000015,
      outputTokenCost: 0.0000006,
    },
    {
      provider: "openai",
      model: "gpt-3.5-turbo-0125",
      inputTokenCost: 0.0000005,
      outputTokenCost: 0.0000015,
    },
    {
      provider: "openai",
      model: "chatgpt-4o-latest",
      inputTokenCost: 0.000005,
      outputTokenCost: 0.000015,
    },
    {
      provider: "openai",
      model: "gpt-4-turbo",
      inputTokenCost: 0.00001,
      outputTokenCost: 0.00003,
    },
    {
      provider: "openai",
      model: "gpt-4-turbo-2024-04-09",
      inputTokenCost: 0.00001,
      outputTokenCost: 0.00003,
    },
    {
      provider: "openai",
      model: "gpt-4",
      inputTokenCost: 0.00003,
      outputTokenCost: 0.00006,
    },
    {
      provider: "openai",
      model: "gpt-4-32k",
      inputTokenCost: 0.00006,
      outputTokenCost: 0.00012,
    },
    {
      provider: "openai",
      model: "gpt-4-0125-preview",
      inputTokenCost: 0.00001,
      outputTokenCost: 0.00003,
    },
    {
      provider: "openai",
      model: "gpt-4-1106-preview",
      inputTokenCost: 0.00001,
      outputTokenCost: 0.00003,
    },
    {
      provider: "openai",
      model: "gpt-4-vision-preview",
      inputTokenCost: 0.00001,
      outputTokenCost: 0.00003,
    },
    {
      provider: "openai",
      model: "gpt-3.5-turbo-instruct",
      inputTokenCost: 0.0000015,
      outputTokenCost: 0.000002,
    },
    {
      provider: "openai",
      model: "gpt-3.5-turbo-1106",
      inputTokenCost: 0.000001,
      outputTokenCost: 0.000002,
    },
    {
      provider: "openai",
      model: "gpt-3.5-turbo-0613",
      inputTokenCost: 0.0000015,
      outputTokenCost: 0.000002,
    },
    {
      provider: "openai",
      model: "gpt-3.5-turbo-16k-0613",
      inputTokenCost: 0.000003,
      outputTokenCost: 0.000004,
    },
    {
      provider: "openai",
      model: "gpt-3.5-turbo-0301",
      inputTokenCost: 0.0000015,
      outputTokenCost: 0.000002,
    },
    {
      provider: "openai",
      model: "davinci-002",
      inputTokenCost: 0.000002,
      outputTokenCost: 0.000002,
    },
    {
      provider: "openai",
      model: "babbage-002",
      inputTokenCost: 0.0000004,
      outputTokenCost: 0.0000004,
    },
    {
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      inputTokenCost: 0.000003,
      outputTokenCost: 0.000015,
    },
    {
      provider: "anthropic",
      model: "claude-3-opus",
      inputTokenCost: 0.000015,
      outputTokenCost: 0.000075,
    },
    {
      provider: "anthropic",
      model: "claude-3-haiku",
      inputTokenCost: 0.00000025,
      outputTokenCost: 0.00000125,
    },
    {
      provider: "anthropic",
      model: "claude-2-1",
      inputTokenCost: 0.000008,
      outputTokenCost: 0.000024,
    },
    {
      provider: "anthropic",
      model: "claude-2-0",
      inputTokenCost: 0.000008,
      outputTokenCost: 0.000024,
    },
    {
      provider: "anthropic",
      model: "claude-instant",
      inputTokenCost: 0.0000008,
      outputTokenCost: 0.0000024,
    },
  ];
}
