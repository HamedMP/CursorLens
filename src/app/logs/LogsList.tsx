"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Log {
  id: string;
  method: string;
  url: string;
  timestamp: string;
  metadata: {
    model: string;
    userMessage: string;
  };
  response: {
    totalTokens: number;
  };
}

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
  // Check if logs is an array and not empty
  if (!Array.isArray(logs) || logs.length === 0) {
    return <p>No logs available.</p>;
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => (
        <li
          key={log.id}
          className={`cursor-pointer rounded p-2 ${
            selectedLogId === log.id
              ? "border border-accent-foreground bg-accent"
              : "hover:bg-secondary"
          }`}
          onClick={() => onLogSelect(log.id)}
        >
          <div className="font-semibold text-foreground">
            {new Date(log.timestamp).toLocaleString()} - {log.method}
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {log.metadata.userMessage.slice(0, 50)}
            {log.metadata.userMessage.length > 50 ? "..." : ""}
          </div>
          <div className="text-xs text-muted-foreground">
            Model: {log.metadata.model} | Tokens:{" "}
            {log.response.totalTokens || "N/A"}
          </div>
        </li>
      ))}
    </ul>
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
        <Button onClick={() => router.refresh()}>Refresh</Button>
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
