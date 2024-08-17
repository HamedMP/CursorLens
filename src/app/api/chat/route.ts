import { openai } from '@ai-sdk/openai';
import { StreamingTextResponse, streamText } from 'ai';
import { insertLog } from '@/lib/db';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo-preview'),
    messages,
    async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
      // Save the chat history to the database
      await insertLog({
        method: 'POST',
        url: '/api/chat',
        headers: JSON.stringify(Object.fromEntries(req.headers)),
        body: JSON.stringify(messages),
        response: JSON.stringify({
          text,
          toolCalls,
          toolResults,
          usage,
          finishReason,
        }),
        timestamp: new Date(),
      });
    },
  });

  return result.toAIStreamResponse();
}

export async function GET(req: Request) {
  try {
    const models = await openai.models.list();

    // Log the models request
    await insertLog({
      method: 'GET',
      url: '/api/chat',
      headers: JSON.stringify(Object.fromEntries(req.headers)),
      body: '',
      response: JSON.stringify(models),
      timestamp: new Date(),
    });

    return new Response(JSON.stringify(models), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching models:', error);

    // Log the error
    await insertLog({
      method: 'GET',
      url: '/api/chat',
      headers: JSON.stringify(Object.fromEntries(req.headers)),
      body: '',
      response: JSON.stringify({ error: String(error) }),
      timestamp: new Date(),
    });

    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
