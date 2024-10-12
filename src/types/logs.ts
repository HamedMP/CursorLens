interface LogMetadata {
  topP: number;
  model: string;
  configId: string;
  provider: string;
  maxTokens: number;
  temperature: number;
  presencePenalty: number;
  frequencyPenalty: number;
  totalTokens: number;
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
}

interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface Message {
  role: string;
  content: string;
  name?: string;
  experimental_providerMetadata?: {
    anthropic?: {
      cacheControl?: {
        type: string;
      };
    };
  };
}

interface RequestBody {
  messages: Message[];
  temperature: number;
  user: string;
  stream: boolean;
}

interface ResponseData {
  text: string;
  toolCalls: any[];
  toolResults: any[];
  usage: Usage;
  finishReason: string;
  rawResponse: {
    headers: Record<string, string>;
  };
  warnings: string[];
  experimental_providerMetadata?: {
    anthropic?: {
      cacheCreationInputTokens?: number;
      cacheReadInputTokens?: number;
    };
  };
}

export interface Log {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: RequestBody;
  response: ResponseData;
  timestamp: string;
  metadata: LogMetadata;
}
