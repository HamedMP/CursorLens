"use client";

import { useState, useEffect } from "react";
import LogsList from "./LogsList";
import LogDetails from "./[id]/page";
import { getLogs, getStats } from "../actions";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalLogs: number;
  totalTokens: number;
  perModelStats: {
    [key: string]: {
      logs: number;
      tokens: number;
    };
  };
}

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedLogs, fetchedStats] = await Promise.all([
          getLogs(),
          getStats(),
        ]);
        setLogs(fetchedLogs);
        setStats(fetchedStats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogSelect = (logId: string) => {
    setSelectedLogId(logId);
  };

  const LoadingSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-grow">
        <div className="flex w-1/3 flex-col border-r">
          <h2 className="sticky top-0 z-10 border-b p-4 text-xl font-bold">
            Logs List
          </h2>
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <p className="p-4">{error}</p>
            ) : logs.length > 0 ? (
              <LogsList
                logs={logs}
                onLogSelect={handleLogSelect}
                selectedLogId={selectedLogId}
              />
            ) : (
              <p className="p-4">No logs found.</p>
            )}
          </div>
        </div>
        <div className="flex w-2/3 flex-col">
          <h2 className="sticky top-0 z-10 border-b p-4 text-xl font-bold">
            Log Details
          </h2>
          <div className="relative flex-grow overflow-y-auto">
            <div className="absolute inset-0">
              {selectedLogId ? (
                <LogDetails logId={selectedLogId} />
              ) : (
                <p className="p-4">Select a log to view details.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
