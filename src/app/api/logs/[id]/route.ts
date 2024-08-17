// app/api/logs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const logId = params.id;

    if (!logId) {
      return NextResponse.json({ error: 'Invalid log ID' }, { status: 400 });
    }

    const log = await prisma.log.findUnique({
      where: { id: logId },
    });

    if (log) {
      return NextResponse.json(log);
    } else {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
