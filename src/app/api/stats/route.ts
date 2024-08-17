import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.log.findMany();
    const totalLogs = logs.length;
    const totalTokens = logs.reduce((sum, log) => {
      const response = JSON.parse(log.response);
      return sum + (response.usage?.total_tokens || 0);
    }, 0);

    return NextResponse.json({ totalLogs, totalTokens });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Error fetching stats' },
      { status: 500 }
    );
  }
}
