import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { createCohere } from "@ai-sdk/cohere";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { ollama } from "ollama-ai-provider";

import { env } from "@/env";
import { calculateCost, getModelCost } from "@/lib/cost-calculator";
import { getDefaultConfiguration, insertLog } from "@/lib/db";
import { generateText, streamText } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openaiClient = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

async function getAIModelClient(provider: string, model: string) {
  switch (provider.toLowerCase()) {
    case "openai":
      return openai(model);
    case "anthropic": {
      const anthropicClient = createAnthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
      return anthropicClient(model);
    }
    case "anthropiccached": {
      const anthropicClient = createAnthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });
      return anthropicClient(model, { cacheControl: true });
    }
    case "cohere": {
      const cohereClient = createCohere({
        apiKey: env.COHERE_API_KEY,
      });
      return cohereClient(model);
    }
    case "mistral": {
      const mistralClient = createMistral({
        apiKey: env.MISTRAL_API_KEY,
      });
      return mistralClient(model);
    }
    case "groq": {
      const groqClient = createOpenAI({
        apiKey: env.GROQ_API_KEY,
      });
      return groqClient(model);
    }
    case "ollama":
      return ollama("llama3.1");
    case "google-vertex":
      throw new Error("Google Vertex AI is not currently supported");
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { openai: string[] } },
) {
  const endpoint = params.openai.join("/");
  if (endpoint !== "chat/completions" && endpoint !== "v1/chat/completions") {
    return NextResponse.json({ error: "Not found", endpoint }, { status: 404 });
  }

  const body = await request.json();
  const { messages, model: cursorModel, stream = false, ...otherParams } = body;

  try {
    const defaultConfig = await getDefaultConfiguration();
    if (!defaultConfig) {
      throw new Error("No default configuration found");
    }

    const {
      id: configId,
      provider,
      model,
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
    } = defaultConfig;

    if (!provider) {
      throw new Error("Provider is not defined in the default configuration");
    }

    const aiModel = await getAIModelClient(provider, model);

    let modifiedMessages = messages;

    if (provider.toLowerCase() === "anthropiccached") {
      const hasPotentialContext = messages.some(
        (message: any) => message.name === "potential_context",
      );

      modifiedMessages = messages.map((message: any) => {
        if (message.name === "potential_context") {
          return {
            ...message,
            experimental_providerMetadata: {
              anthropic: { cacheControl: { type: "ephemeral" } },
            },
          };
        }
        return message;
      });

      if (!hasPotentialContext && modifiedMessages.length >= 2) {
        modifiedMessages[1] = {
          ...modifiedMessages[1],
          experimental_providerMetadata: {
            anthropic: { cacheControl: { type: "ephemeral" } },
          },
        };
      }
    }

    const streamTextOptions = {
      model: aiModel,
      messages: modifiedMessages,
      maxTokens: ["anthropic", "anthropiccached"].includes(
        provider.toLowerCase(),
      )
        ? 8192
        : undefined,
      // Add other parameters from defaultConfig if needed
    };

    const logEntry = {
      method: "POST",
      url: `/api/${endpoint}`,
      headers: Object.fromEntries(request.headers),
      body: {
        ...body,
        ...streamTextOptions,
        model: model,
      },
      response: {},
      timestamp: new Date(),
      metadata: {
        configId,
        provider,
        model,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
      },
    };

    if (stream) {
      const result = await streamText({
        ...streamTextOptions,
        async onFinish({
          text,
          toolCalls,
          toolResults,
          usage,
          finishReason,
          ...otherProps
        }) {
          const inputTokens = usage?.promptTokens ?? 0;
          const outputTokens = usage?.completionTokens ?? 0;
          const totalTokens = usage?.totalTokens ?? 0;

          const modelCost = await getModelCost(provider, model);
          const inputCost = (inputTokens / 1000000) * modelCost.inputTokenCost;
          const outputCost =
            (outputTokens / 1000000) * modelCost.outputTokenCost;
          const totalCost = inputCost + outputCost;

          logEntry.response = {
            text,
            toolCalls,
            toolResults,
            usage,
            finishReason,
            ...otherProps,
          };
          logEntry.metadata = {
            ...logEntry.metadata,
            inputTokens,
            outputTokens,
            totalTokens,
            inputCost,
            outputCost,
            totalCost,
          };
          await insertLog(logEntry);
        },
      });

      // Convert the result to a ReadableStream in OpenAI's format
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.textStream) {
            const data = JSON.stringify({
              id: `chatcmpl-${Math.random().toString(36).substr(2, 9)}`,
              object: "chat.completion.chunk",
              created: Math.floor(Date.now() / 1000),
              model: model,
              choices: [
                {
                  delta: { content: chunk },
                  index: 0,
                  finish_reason: null,
                },
              ],
            });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      // Return a streaming response
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
    // For non-streaming requests, use the AI SDK
    const result = await generateText({
      model: aiModel,
      messages,
    });

    const inputTokens = result.usage?.promptTokens ?? 0;
    const outputTokens = result.usage?.completionTokens ?? 0;
    const totalTokens = result.usage?.totalTokens ?? 0;

    const modelCost = await getModelCost(provider, model);
    const inputCost = inputTokens * modelCost.inputTokenCost;
    const outputCost = outputTokens * modelCost.outputTokenCost;
    const totalCost = inputCost + outputCost;

    logEntry.response = result;
    logEntry.metadata = {
      ...logEntry.metadata,
      inputTokens,
      outputTokens,
      totalTokens,
      inputCost,
      outputCost,
      totalCost,
    };
    await insertLog(logEntry);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in chat completion:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLogEntry = {
      method: "POST",
      url: `/api/${endpoint}`,
      headers: Object.fromEntries(request.headers),
      body: body,
      response: { error: errorMessage },
      timestamp: new Date(),
      metadata: {
        error: errorMessage,
        stack: (error as Error).stack,
      },
    };
    await insertLog(errorLogEntry);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { openai: string[] } },
) {
  const endpoint = params.openai.join("/");

  // Existing 'models' endpoint
  if (endpoint === "models") {
    const logEntry = {
      method: "GET",
      url: "/api/v1/models",
      headers: Object.fromEntries(request.headers),
      body: {},
      response: {},
      timestamp: new Date(),
    };

    try {
      const models = await openaiClient.models.list();
      logEntry.response = models;
      await insertLog(logEntry);
      return NextResponse.json(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      logEntry.response = { error: String(error) };
      await insertLog(logEntry);
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  }

  // New test routes
  else if (endpoint === "test/openai") {
    return testOpenAI();
  } else if (endpoint === "test/anthropic") {
    return testAnthropic();
  } else if (endpoint === "test/anthropiccached") {
    return testAnthropicCached();
  } else if (endpoint === "test/cohere") {
    return testCohere();
  } else if (endpoint === "test/mistral") {
    return testMistral();
  } else if (endpoint === "test/groq") {
    return testGroq();
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function testOpenAI() {
  try {
    const model = openai("gpt-3.5-turbo");
    const result = await generateText({
      model,
      messages: [{ role: "user", content: 'Say "Hello from OpenAI!"' }],
    });
    return NextResponse.json({ provider: "OpenAI", result });
  } catch (error) {
    console.error("Error testing OpenAI:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function testAnthropicCached() {
  try {
    const model = anthropic("claude-3-5-sonnet-20240620", {
      cacheControl: true,
    });

    const result = await generateText({
      model,
      messages: [
        { role: "user", content: 'Say "Hello from Anthropic and Vercel"' },
      ],
    });
    return NextResponse.json({ provider: "Anthropic Cached", result });
  } catch (error) {
    console.error("Error testing Anthropic:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function testAnthropic() {
  try {
    const anthropicClient = createAnthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
    const model = anthropicClient("claude-3-haiku-20240307");
    const result = await generateText({
      model,
      messages: [{ role: "user", content: 'Say "Hello from Anthropic!"' }],
    });
    return NextResponse.json({ provider: "Anthropic", result });
  } catch (error) {
    console.error("Error testing Anthropic:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function testCohere() {
  try {
    const cohereClient = createCohere({
      apiKey: env.COHERE_API_KEY,
    });
    const model = cohereClient("command");
    const result = await generateText({
      model,
      messages: [{ role: "user", content: 'Say "Hello from Cohere!"' }],
    });
    return NextResponse.json({ provider: "Cohere", result });
  } catch (error) {
    console.error("Error testing Cohere:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function testMistral() {
  try {
    const mistralClient = createMistral({
      apiKey: env.MISTRAL_API_KEY,
    });
    const model = mistralClient("mistral-small-latest");
    const result = await generateText({
      model,
      messages: [{ role: "user", content: 'Say "Hello from Mistral!"' }],
    });
    return NextResponse.json({ provider: "Mistral", result });
  } catch (error) {
    console.error("Error testing Mistral:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function testGroq() {
  try {
    const groqClient = createOpenAI({
      apiKey: env.GROQ_API_KEY,
    });
    const model = groqClient("llama-3.1-70b-versatile");
    const result = await generateText({
      model,
      messages: [{ role: "user", content: 'Say "Hello from Groq!"' }],
    });
    return NextResponse.json({ provider: "Groq", result });
  } catch (error) {
    console.error("Error testing Groq:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
