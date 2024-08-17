import { openai } from '@ai-sdk/openai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
// import { googleVertexAI } from '@ai-sdk/google-vertex-ai';
import { generateText, streamText } from 'ai';
import { insertLog, getDefaultConfiguration } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
// import { VertexAI } from '@google-cloud/vertexai';

// Add this function at the top of the file
function removeNullValues(obj: Record<string, any>) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: { openai: string[] } }
) {
  const endpoint = params.openai.join('/');
  if (endpoint !== 'chat/completions' && endpoint !== 'v1/chat/completions') {
    return NextResponse.json({ error: 'Not found', endpoint }, { status: 404 });
  }

  const body = await request.json();
  const { messages, model: cursorModel, stream = false, ...otherParams } = body;

  try {
    const defaultConfig = await getDefaultConfiguration();
    if (!defaultConfig) {
      throw new Error('No default configuration found');
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
      throw new Error('Provider is not defined in the default configuration');
    }

    let aiModel;
    switch (provider.toLowerCase()) {
      case 'openai':
        console.log('openai', model);
        aiModel = openai(model);
        break;
      case 'anthropic':
        console.log('anthropic', model);
        const anthropicClient = createAnthropic({
          apiKey: process.env.ANTHROPIC_API_KEY!,
        });
        aiModel = anthropicClient(model);
        break;
      case 'google-vertex':
        console.log('google-vertex', model);
        throw new Error('Google Vertex AI is not currently supported');
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    console.log('aiModel', aiModel);

    const logEntry = {
      method: 'POST',
      url: `/api/${endpoint}`,
      headers: JSON.stringify(Object.fromEntries(request.headers)),
      body: JSON.stringify(body),
      response: '',
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
      },
    };

    if (stream) {
      const result = await streamText({
        model: aiModel,
        messages,
        // temperature: temperature ?? undefined,
        // maxTokens: maxTokens ?? undefined,
        // topP: topP ?? undefined,
        // frequencyPenalty: frequencyPenalty ?? undefined,
        // presencePenalty: presencePenalty ?? undefined,
        // ...removeNullValues(otherParams),
        async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
          logEntry.response = JSON.stringify({
            text,
            toolCalls,
            toolResults,
            usage,
            finishReason,
          });
          await insertLog(logEntry);
        },
      });

      // Convert the result to a ReadableStream in OpenAI's format
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.textStream) {
            const data = JSON.stringify({
              id: 'chatcmpl-' + Math.random().toString(36).substr(2, 9),
              object: 'chat.completion.chunk',
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
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      // Return a streaming response
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      // For non-streaming requests, use the AI SDK
      const result = await generateText({
        model: aiModel,
        messages,
        // temperature: temperature ?? undefined,
        // maxTokens: maxTokens ?? undefined,
        // topP: topP ?? undefined,
        // frequencyPenalty: frequencyPenalty ?? undefined,
        // presencePenalty: presencePenalty ?? undefined,
        // ...removeNullValues(otherParams),
      });

      logEntry.response = JSON.stringify(result);
      await insertLog(logEntry);

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error in chat completion:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLogEntry = {
      method: 'POST',
      url: `/api/${endpoint}`,
      headers: JSON.stringify(Object.fromEntries(request.headers)),
      body: JSON.stringify(body),
      response: JSON.stringify({ error: errorMessage }),
      timestamp: new Date(),
      metadata: JSON.stringify({
        error: errorMessage,
        stack: (error as Error).stack,
      }),
    };
    await insertLog(errorLogEntry);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { openai: string[] } }
) {
  const endpoint = params.openai.join('/');

  // Existing 'models' endpoint
  if (endpoint === 'models') {
    const logEntry = {
      method: 'GET',
      url: '/api/v1/models',
      headers: JSON.stringify(Object.fromEntries(request.headers)),
      body: '',
      response: '',
      timestamp: new Date(),
    };

    try {
      const models = await openaiClient.models.list();
      logEntry.response = JSON.stringify(models);
      await insertLog(logEntry);
      return NextResponse.json(models);
    } catch (error) {
      console.error('Error fetching models:', error);
      logEntry.response = JSON.stringify({ error: String(error) });
      await insertLog(logEntry);
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
  }

  // New test routes
  else if (endpoint === 'test/openai') {
    return testOpenAI();
  } else if (endpoint === 'test/anthropic') {
    return testAnthropic();
  } else if (endpoint === 'test/vertex') {
    return testVertexAI();
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

async function testOpenAI() {
  try {
    const model = openai('gpt-3.5-turbo');
    const result = await generateText({
      model,
      messages: [{ role: 'user', content: 'Say "Hello from OpenAI!"' }],
    });
    return NextResponse.json({ provider: 'OpenAI', result });
  } catch (error) {
    console.error('Error testing OpenAI:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function testAnthropic() {
  try {
    const anthropicClient = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    const model = anthropicClient('claude-3-haiku-20240307');
    const result = await generateText({
      model,
      messages: [{ role: 'user', content: 'Say "Hello from Anthropic!"' }],
    });
    return NextResponse.json({ provider: 'Anthropic', result });
  } catch (error) {
    console.error('Error testing Anthropic:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function testVertexAI() {
  // try {
  //   // Note: This might need additional setup for Google Cloud credentials
  //   const model = googleVertexAI('chat-bison@001');
  //   const result = await generateText({
  //     model,
  //     messages: [
  //       { role: 'user', content: 'Say "Hello from Google Vertex AI!"' },
  //     ],
  //   });
  //   return NextResponse.json({ provider: 'Google Vertex AI', result });
  // } catch (error) {
  //   console.error('Error testing Google Vertex AI:', error);
  //   return NextResponse.json({ error: String(error) }, { status: 500 });
  // }
}
