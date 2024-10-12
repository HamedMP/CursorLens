"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import * as themes from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { Log } from "../types/logs";

interface LogDetailsProps {
  logId: string;
}

const formatMetadataValue = (
  value: number | undefined,
  isMonetary: boolean = false,
): string => {
  if (value === undefined || isNaN(value)) return "N/A";
  if (isMonetary) {
    return `$${value.toFixed(4)}`;
  }
  return value.toLocaleString();
};

export default function LogDetails({ logId }: LogDetailsProps) {
  const [log, setLog] = useState<Log | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<SyntaxHighlighterProps["style"] | null>(
    null,
  );
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState({
    response: true,
    body: true,
    headers: true,
  });

  useEffect(() => {
    const fetchLog = async () => {
      if (logId) {
        try {
          const response = await fetch(`/api/logs/${logId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch log");
          }
          const logData: Log = await response.json();
          setLog(logData);
        } catch (err) {
          setError("Error fetching log data");
          console.error(err);
        }
      }
    };

    fetchLog();

    const loadTheme = () => {
      const themeName = "vscDarkPlus";
      setTheme(
        themes[
          themeName as keyof typeof themes
        ] as SyntaxHighlighterProps["style"],
      );
    };
    loadTheme();
  }, [logId, searchParams]);

  const toggleSection = (section: "response" | "body" | "headers") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (error) {
    return (
      <Alert variant="destructive" className="w-2/3">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!log) {
    return (
      <Card className="">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-4 w-[250px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-4 h-4 w-[300px]" />
          <Skeleton className="mb-4 h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const maskSensitiveInfo = (obj: any) => {
    const sensitiveKeys = ["authorization", "api-key", "secret"];
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        if (
          sensitiveKeys.some((sensitiveKey) =>
            key.toLowerCase().includes(sensitiveKey),
          )
        ) {
          obj[key] = "************************";
        } else if (typeof obj[key] === "object") {
          obj[key] = maskSensitiveInfo(obj[key]);
        }
      });
    }
    return obj;
  };

  const JsonHighlight = ({
    content,
    isExpandable = false,
  }: {
    content: object | string | null;
    isExpandable?: boolean;
  }) => {
    const [isExpanded, setIsExpanded] = useState(!isExpandable);
    const parsedContent =
      typeof content === "string" ? JSON.parse(content) : content;
    const maskedContent = maskSensitiveInfo(parsedContent);
    const jsonString =
      JSON.stringify(maskedContent, null, 2) || "No data available";

    const handleCopy = () => {
      navigator.clipboard.writeText(jsonString);
      toast.success("Copied to clipboard");
    };

    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };

    const renderAIResponse = (response: any) => {
      return (
        <div className="mb-4 rounded-lg bg-blue-100 p-4">
          <p className="mb-2 font-bold">AI Response</p>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={themes.tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {response.text}
          </ReactMarkdown>
        </div>
      );
    };

    const renderMessages = (messages: any[]) => {
      return messages
        .slice()
        .reverse()
        .map((message, index) => (
          <div
            key={index}
            className={`mb-4 rounded-lg p-4 ${
              message.role === "user"
                ? "bg-gray-100"
                : message.role === "system"
                  ? "bg-yellow-100"
                  : "bg-blue-100"
            }`}
          >
            <p className="mb-2 font-bold">
              {message.role === "user"
                ? "You"
                : message.role === "system"
                  ? "System"
                  : "Assistant"}
            </p>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={themes.tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ));
    };

    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className="absolute right-2 top-2"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
        </Button>
        {isExpandable && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpand}
            className="mb-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" /> Hide JSON
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" /> Show JSON
              </>
            )}
          </Button>
        )}

        {(isExpanded || !isExpandable) && (
          <SyntaxHighlighter
            language="json"
            style={themes.tomorrow}
            customStyle={{
              margin: 0,
              marginBottom: "1rem",
              padding: "1rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
            }}
          >
            {jsonString}
          </SyntaxHighlighter>
        )}

        {parsedContent && "text" in parsedContent && (
          <div className="mb-4">
            <h4 className="mb-2 text-lg font-semibold">AI Response</h4>
            {renderAIResponse(parsedContent)}
          </div>
        )}

        {parsedContent && "messages" in parsedContent && (
          <div className="mb-4">
            <h4 className="mb-2 text-lg font-semibold">
              Messages (Most recent on top)
            </h4>
            {renderMessages(parsedContent.messages as object[])}
          </div>
        )}
      </div>
    );
  };

  const renderUsageTable = (log: Log) => {
    return (
      <Table className="mb-4">
        <TableHeader>
          <TableRow>
            <TableHead>Input Tokens</TableHead>
            <TableHead>Output Tokens</TableHead>
            <TableHead>Total Tokens</TableHead>
            <TableHead>Input Cost</TableHead>
            <TableHead>Output Cost</TableHead>
            <TableHead>Total Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              {formatMetadataValue(log.metadata?.inputTokens)}
            </TableCell>
            <TableCell>
              {formatMetadataValue(log.metadata?.outputTokens)}
            </TableCell>
            <TableCell>
              {formatMetadataValue(log.metadata?.totalTokens)}
            </TableCell>
            <TableCell>
              {formatMetadataValue(log.metadata?.inputCost, true)}
            </TableCell>
            <TableCell>
              {formatMetadataValue(log.metadata?.outputCost, true)}
            </TableCell>
            <TableCell>
              {formatMetadataValue(log.metadata?.totalCost, true)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="overflow-auto border-0 shadow-none">
      <CardHeader className="">
        <CardTitle>Request Details</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 text-lg font-bold">
          {log.method} {log.url}
        </h3>
        <p className="mb-4 text-sm text-gray-500">{log.timestamp}</p>

        {renderUsageTable(log)}

        <Card className="mt-4">
          <CardHeader
            className="flex cursor-pointer flex-row items-center justify-between"
            onClick={() => toggleSection("response")}
          >
            <CardTitle className="text-base">Response</CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.response ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          {expandedSections.response && (
            <CardContent>
              <JsonHighlight content={log.response} isExpandable={true} />
            </CardContent>
          )}
        </Card>

        <Card className="mt-4">
          <CardHeader
            className="flex cursor-pointer flex-row items-center justify-between"
            onClick={() => toggleSection("body")}
          >
            <CardTitle className="text-base">Body</CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.body ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          {expandedSections.body && (
            <CardContent>
              <JsonHighlight content={log.body} isExpandable={true} />
            </CardContent>
          )}
        </Card>

        <Card className="mt-4">
          <CardHeader
            className="flex cursor-pointer flex-row items-center justify-between"
            onClick={() => toggleSection("headers")}
          >
            <CardTitle className="text-base">Headers</CardTitle>
            <Button variant="ghost" size="sm">
              {expandedSections.headers ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          {expandedSections.headers && (
            <CardContent>
              <JsonHighlight content={log.headers} />
            </CardContent>
          )}
        </Card>
      </CardContent>
    </Card>
  );
}
