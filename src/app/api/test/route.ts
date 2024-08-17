import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Test route working' }, { status: 200 });
}
