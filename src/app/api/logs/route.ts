// app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLogs } from '@/lib/db';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const filterHomepage = searchParams.get('filterHomepage') === 'true';
  const logs = await getLogs(filterHomepage);
  return NextResponse.json(logs);
}

interface LogData {
  method: string;
  url: string;
  headers: string;
  body: string;
  response: string;
  model: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { method, url, headers, body, response, model }: LogData =
      await request.json();
    const log = await prisma.log.create({
      data: {
        method,
        url,
        headers: JSON.stringify(headers),
        body,
        response,
        metadata: { model },
      },
    });
    return NextResponse.json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json({ error: 'Error creating log' }, { status: 500 });
  }
}
