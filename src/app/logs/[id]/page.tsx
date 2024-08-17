"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useSearchParams } from "next/navigation";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import * as themes from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Log {
  id: number;
  method: string;
  url: string;
  timestamp: string;
  headers: string;
  body: string;
  response: string | null;
}

interface LogDetailsProps {
  logId: string;
}

export default function LogDetails({ logId }: LogDetailsProps) {
  const [log, setLog] = useState<Log | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<SyntaxHighlighterProps["style"] | null>(
    null,
  );
  const searchParams = useSearchParams();

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

  const parseJSON = (str: string | null) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

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
    content: string | null;
    isExpandable?: boolean;
  }) => {
    const [isExpanded, setIsExpanded] = useState(!isExpandable);
    const parsedContent = parseJSON(content);
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
        {parsedContent && parsedContent.text && (
          <div className="mb-4">
            <h4 className="mb-2 text-lg font-semibold">AI Response</h4>
            {renderAIResponse(parsedContent)}
          </div>
        )}
        {parsedContent && parsedContent.messages && (
          <div className="mb-4">
            <h4 className="mb-2 text-lg font-semibold">
              Messages (Most recent on top)
            </h4>
            {renderMessages(parsedContent.messages)}
          </div>
        )}
        {(isExpanded || !isExpandable) && (
          <SyntaxHighlighter
            language="json"
            style={themes.tomorrow}
            customStyle={{
              margin: 0,
              padding: "1rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
            }}
          >
            {jsonString}
          </SyntaxHighlighter>
        )}
      </div>
    );
  };

  return (
    <Card className="overflow-auto">
      <CardHeader className="">
        <CardTitle>Request Details</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 text-lg font-bold">
          {log.method} {log.url}
        </h3>
        <p className="mb-4 text-sm text-gray-500">{log.timestamp}</p>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Response</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonHighlight content={log.response} isExpandable={true} />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Body</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonHighlight content={log.body} isExpandable={true} />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Headers</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonHighlight content={log.headers} />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
