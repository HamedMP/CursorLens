"use client";

import { getConfigurationCosts } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, DollarSign, Hash, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Log } from "../types/logs";

interface LogsListProps {
  logs: Log[];
  onLogSelect: (logId: string) => void;
  selectedLogId?: string;
}

const LogsListComponent: React.FC<LogsListProps> = ({
  logs,
  onLogSelect,
  selectedLogId,
}) => {
  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      anthropic: "bg-purple-100 text-purple-800 border-purple-300",
      anthropicCached: "bg-indigo-100 text-indigo-800 border-indigo-300",
      openai: "bg-green-100 text-green-800 border-green-300",
      cohere: "bg-blue-100 text-blue-800 border-blue-300",
      mistral: "bg-red-100 text-red-800 border-red-300",
      groq: "bg-yellow-100 text-yellow-800 border-yellow-300",
      ollama: "bg-orange-100 text-orange-800 border-orange-300",
      other: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[provider] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (!Array.isArray(logs) || logs.length === 0) {
    return <p>No logs available.</p>;
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const totalTokens = log.metadata.totalTokens || 0;
        const totalCost = log.metadata.totalCost || 0;
        const firstUserMessage =
          log.body.messages.find((m) => m.role === "user" && !("name" in m))
            ?.content || "No message available";
        const truncatedMessage =
          firstUserMessage.slice(0, 100) +
          (firstUserMessage.length > 100 ? "..." : "");
        const isSelected = selectedLogId === log.id;
        const providerColorClass = getProviderColor(log.metadata.provider);

        return (
          <Card
            key={log.id}
            className={`mx-1 overflow-hidden transition-all duration-200 ${
              isSelected
                ? `border-r-4 shadow-lg border-${providerColorClass}`
                : "hover:cursor-pointer hover:shadow-md"
            }`}
            onClick={() => onLogSelect(log.id)}
          >
            <CardHeader className={` ${providerColorClass}`}>
              <CardTitle className="line-clamp-2 text-base font-medium">
                {truncatedMessage}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={getProviderColor(log.metadata.provider)}
                  >
                    {log.metadata.provider}
                  </Badge>
                  <span className="text-sm font-medium">
                    {log.metadata.model}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex w-full items-center justify-between space-x-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <DollarSign className="mr-1 h-4 w-4" />
                    <span className="text-sm font-medium">
                      {totalCost.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Hash className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{totalTokens} tokens</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default function LogsList({
  logs,
  onLogSelect,
  selectedLogId,
}: LogsListProps) {
  const router = useRouter();

  return (
    <Card className="h-[calc(100vh-140px)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <LogsListComponent
            logs={logs}
            onLogSelect={onLogSelect}
            selectedLogId={selectedLogId}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
