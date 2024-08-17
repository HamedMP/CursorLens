import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    if (!prisma) {
      throw new Error('Prisma client is not initialized');
    }
    const configurations = await prisma.aIConfiguration.findMany();
    return NextResponse.json(configurations);
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, ...configData } = data;

    if (configData.isDefault) {
      // If the new configuration is set as default, unset the current default
      await prisma.aIConfiguration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedConfig = await prisma.aIConfiguration.upsert({
      where: { name },
      update: configData,
      create: { name, ...configData },
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
