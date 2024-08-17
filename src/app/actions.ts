"use server";

import prisma from "@/lib/prisma";
import { Log, AIConfiguration } from "@prisma/client";

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
    let query: any = {
      orderBy: {
        timestamp: "desc",
      },
    };

    if (provider !== "all") {
      query.where = {
        ...query.where,
        metadata: {
          path: ["provider"],
          equals: provider,
        },
      };
    }

    if (startDate) {
      query.where = {
        ...query.where,
        timestamp: {
          ...query.where?.timestamp,
          gte: new Date(startDate),
        },
      };
    }

    if (endDate) {
      query.where = {
        ...query.where,
        timestamp: {
          ...query.where?.timestamp,
          lte: new Date(endDate),
        },
      };
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

export async function getStats(timeFilter: string = "all"): Promise<{
  totalLogs: number;
  totalTokens: number;
  perModelStats: {
    [key: string]: {
      logs: number;
      tokens: number;
    };
  };
  tokenUsageOverTime: {
    date: string;
    tokens: number;
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
    };
  } = {};

  let totalTokens = 0;
  const tokenUsageOverTime: { date: string; tokens: number }[] = [];

  logs.forEach((log) => {
    const metadata = log.metadata as any;
    const model = metadata.model || "unknown";
    if (!perModelStats[model]) {
      perModelStats[model] = { logs: 0, tokens: 0 };
    }
    perModelStats[model].logs += 1;

    try {
      const responseObj = JSON.parse(log.response);
      const tokens = responseObj.usage?.totalTokens || 0;
      perModelStats[model].tokens += tokens;
      totalTokens += tokens;

      const date = log.timestamp.toISOString().split("T")[0];
      const existingEntry = tokenUsageOverTime.find(
        (entry) => entry.date === date,
      );
      if (existingEntry) {
        existingEntry.tokens += tokens;
      } else {
        tokenUsageOverTime.push({ date, tokens });
      }
    } catch (error) {
      console.error("Error parsing log response:", error);
    }
  });

  return {
    totalLogs: logs.length,
    totalTokens,
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

export async function getConfigurationCosts(): Promise<
  { provider: string; model: string; cost: number }[]
> {
  // This is a placeholder function. In a real-world scenario, you would
  // fetch this data from an API or database containing up-to-date pricing information.
  return [
    { provider: "openai", model: "gpt-3.5-turbo", cost: 0.002 },
    { provider: "openai", model: "gpt-4", cost: 0.03 },
    { provider: "anthropic", model: "claude-2", cost: 0.01 },
  ];
}
