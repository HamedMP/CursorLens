import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const costs = await prisma.modelCost.findMany({
      orderBy: [{ provider: "asc" }, { model: "asc" }, { validFrom: "desc" }],
    });
    return NextResponse.json(costs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch costs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const cost = await prisma.modelCost.create({
      data: {
        provider: data.provider,
        model: data.model,
        inputTokenCost: data.inputTokenCost,
        outputTokenCost: data.outputTokenCost,
        validFrom: new Date(data.validFrom),
        validTo: data.validTo ? new Date(data.validTo) : null,
      },
    });
    return NextResponse.json(cost);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create cost entry" },
      { status: 500 },
    );
  }
}
