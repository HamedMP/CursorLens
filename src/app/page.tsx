"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LogsList from "../components/LogsList";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { ArrowRight, Copy } from "lucide-react";
import { toast } from "sonner";

import {
  getLogs,
  getStats,
  getConfigurations,
  updateDefaultConfiguration,
  createConfiguration,
} from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Log {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
  response: string;
  timestamp: Date;
  metadata: any;
}

interface Stats {
  totalLogs: number;
  totalTokens: number;
}

interface AIConfiguration {
  id: string;
  name: string;
  provider: string;
  model: string;
  temperature: number | null;
  maxTokens: number | null;
  topP: number | null;
  frequencyPenalty: number | null;
  presencePenalty: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<Stats>({ totalLogs: 0, totalTokens: 0 });
  const [aiConfigurations, setAIConfigurations] = useState<AIConfiguration[]>(
    [],
  );
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [newConfigName, setNewConfigName] = useState("");
  const [newConfigModel, setNewConfigModel] = useState("");
  const [newConfigProvider, setNewConfigProvider] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ngrokUrl, setNgrokUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, statsData, configData] = await Promise.all([
          getLogs(),
          getStats(),
          getConfigurations(),
        ]);

        setLogs(logsData as Log[]); // Type assertion
        setStats(statsData);
        setAIConfigurations(configData as AIConfiguration[]); // Type assertion
        const defaultConfig = configData.find((config) => config.isDefault);
        setSelectedConfig(defaultConfig ? defaultConfig.name : "");

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchNgrokUrl = async () => {
      try {
        const response = await fetch("/api/ngrok-url");
        const data = await response.json();
        console.log(data);
        setNgrokUrl(data.ngrokUrl);
      } catch (error) {
        console.error("Error fetching ngrok URL:", error);
      }
    };
    fetchNgrokUrl();
  }, []);

  const handleConfigChange = async (configName: string) => {
    setSelectedConfig(configName);
    try {
      await updateDefaultConfiguration(configName);
      router.refresh();
    } catch (error) {
      console.error("Error updating configuration:", error);
      setError("Error updating configuration");
    }
  };

  const handleCreateConfig = async () => {
    if (!newConfigName || !newConfigModel || !newConfigProvider) {
      setError(
        "Please provide name, model, and provider for the new configuration",
      );
      return;
    }

    try {
      await createConfiguration({
        name: newConfigName,
        model: newConfigModel,
        provider: newConfigProvider,
        isDefault: false,
      });

      const configData = await getConfigurations();
      setAIConfigurations(configData as AIConfiguration[]); // Type assertion

      setNewConfigName("");
      setNewConfigModel("");
      setNewConfigProvider("");

      setError(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating configuration:", error);
      setError("Error creating configuration");
    }
  };

  const handleLogSelect = (logId: string) => {
    router.push(`/logs?selectedLogId=${logId}`);
  };

  if (loading)
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-start space-y-8 p-12">
        <Skeleton className="mb-8 h-12 w-64" />
        <div className="mb-8 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="mb-8 h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-12">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-mouse-pointer-2 mb-4"
        style={{
          transform: "scaleX(-1)",
          transition: "filter 0.1s ease-out",
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          e.currentTarget.style.filter = `drop-shadow(${x / 10}px ${
            y / 10
          }px 4px rgba(0, 0, 0, 0.5))`;
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter =
            "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.5))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "none";
        }}
      >
        <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
      </svg>

      <div className="mb-8 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalLogs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.totalTokens.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 w-full max-w-4xl">
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-4">
            <Label>Default model:</Label>
            <Select onValueChange={handleConfigChange} value={selectedConfig}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a configuration" />
              </SelectTrigger>
              <SelectContent>
                {aiConfigurations.map((config) => (
                  <SelectItem key={config.name} value={config.name}>
                    {config.name} ({config.model})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link
            href="/configurations"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Manage Configurations
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>

      {ngrokUrl ? (
        <Card className="mb-8 w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Ngrok Public URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <p className="mt-2">Add this as the base URL in Cursor:</p>
              <code className="rounded bg-muted p-2 font-mono text-sm">
                {`${ngrokUrl}/v1`}
              </code>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`${ngrokUrl}/v1`);
                  toast.success("Copied to clipboard");
                }}
                variant="ghost"
                className=""
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Ngrok Public URL</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Ngrok URL not available. Please run ngrok to generate a public
              URL.
            </p>
            <p className="mt-2">Run the following command in your terminal:</p>
            <code className="mt-1 block rounded bg-muted p-2 font-mono text-sm">
              ngrok http 3000
            </code>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <div className="mb-4 max-h-[300px] flex-grow overflow-y-auto">
            <LogsList
              logs={logs}
              onLogSelect={handleLogSelect}
              selectedLogId={undefined}
            />
          </div>
          <Link
            href="/logs"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            View all logs
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
