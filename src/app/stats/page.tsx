"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getStats, getConfigurations, getConfigurationCosts } from "../actions";
import type { AIConfiguration } from "@prisma/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

interface Stats {
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
}

const chartConfig = {
  logs: {
    label: "Logs",
    color: "hsl(var(--chart-1))",
  },
  tokens: {
    label: "Total Tokens",
    color: "hsl(var(--chart-2))",
  },
  promptTokens: {
    label: "Input Tokens",
    color: "hsl(var(--chart-3))",
  },
  completionTokens: {
    label: "Output Tokens",
    color: "hsl(var(--chart-4))",
  },
  cost: {
    label: "Cost ($)",
    color: "hsl(var(--chart-5))",
  },
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [tokenUsageOverTime, setTokenUsageOverTime] = useState<
    { date: string; tokens: number }[]
  >([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "logs",
    "tokens",
    "cost",
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, configData, costsData] = await Promise.all([
          getStats(timeFilter),
          getConfigurations(),
          getConfigurationCosts(),
        ]);

        const perModelProviderStats: Stats["perModelProviderStats"] = {};
        for (const config of configData) {
          perModelProviderStats[`${config.provider}:${config.model}`] = {
            logs: 0,
            tokens: 0,
            promptTokens: 0,
            completionTokens: 0,
            cost: 0,
            provider: config.provider,
            model: config.model,
          };
        }

        for (const [key, modelStats] of Object.entries(
          statsData.perModelProviderStats,
        )) {
          const [provider, model] = key.split(":");
          const costData = costsData.find(
            (c) => c.provider === provider && c.model === model,
          );
          const inputTokenCost = costData?.inputTokenCost || 0;
          const outputTokenCost = costData?.outputTokenCost || 0;

          perModelProviderStats[key] = {
            ...modelStats,
            cost:
              modelStats.promptTokens * inputTokenCost +
              modelStats.completionTokens * outputTokenCost,
          };
        }

        setStats({
          totalLogs: statsData.totalLogs,
          totalTokens: statsData.totalTokens,
          totalPromptTokens: statsData.totalPromptTokens,
          totalCompletionTokens: statsData.totalCompletionTokens,
          perModelProviderStats,
          tokenUsageOverTime: statsData.tokenUsageOverTime,
        });
        setTokenUsageOverTime(statsData.tokenUsageOverTime);
        setConfigurations(configData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, [timeFilter]);

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric],
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="mb-8 h-12 w-64" />
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {["card1", "card2", "card3"].map((key) => (
            <Card key={key}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        {["card1", "card2", "card3"].map((key) => (
          <Card key={key} className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-red-300 bg-red-100">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const chartData = Object.entries(stats.perModelProviderStats).map(
    ([key, data]) => ({
      provider: data.provider,
      model: data.model,
      logs: data.logs,
      tokens: data.tokens,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      cost: data.cost,
    }),
  );

  const pieChartData = Object.entries(stats.perModelProviderStats).map(
    ([key, data]) => ({
      name: key,
      value: data.logs,
    }),
  );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Analytics Dashboard</h1>

      <div className="mb-8">
        <Select
          onValueChange={(value) => setTimeFilter(value)}
          defaultValue={timeFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.totalLogs.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.totalTokens.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              $
              {Object.values(stats.perModelProviderStats)
                .reduce((sum, data) => sum + data.cost, 0)
                .toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        {Object.entries(chartConfig).map(([key, config]) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox
              id={key}
              checked={selectedMetrics.includes(key)}
              onCheckedChange={() => handleMetricToggle(key)}
            />
            <label
              htmlFor={key}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {config.label}
            </label>
          </div>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Per Model and Provider Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="model"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="currentColor"
                />
                <YAxis yAxisId="left" stroke="currentColor" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="currentColor"
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-white p-2 shadow-md">
                          <p className="font-bold">{`${payload[0].payload.provider}: ${payload[0].payload.model}`}</p>
                          {payload.map((entry) => (
                            <p key={entry.name} style={{ color: entry.color }}>
                              {`${entry.name}: ${entry.value}`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                {selectedMetrics.includes("logs") && (
                  <Bar
                    yAxisId="left"
                    dataKey="logs"
                    fill="var(--color-logs)"
                    radius={4}
                  />
                )}
                {selectedMetrics.includes("tokens") && (
                  <Bar
                    yAxisId="left"
                    dataKey="tokens"
                    fill="var(--color-tokens)"
                    radius={4}
                  />
                )}
                {selectedMetrics.includes("promptTokens") && (
                  <Bar
                    yAxisId="left"
                    dataKey="promptTokens"
                    fill="var(--color-promptTokens)"
                    radius={4}
                  />
                )}
                {selectedMetrics.includes("completionTokens") && (
                  <Bar
                    yAxisId="left"
                    dataKey="completionTokens"
                    fill="var(--color-completionTokens)"
                    radius={4}
                  />
                )}
                {selectedMetrics.includes("cost") && (
                  <Bar
                    yAxisId="right"
                    dataKey="cost"
                    fill="var(--color-cost)"
                    radius={4}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Token Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tokenUsageOverTime} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--color-tokens)"
                  name="Total Tokens"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Model and Provider Usage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[pieChartData.indexOf(entry) % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
