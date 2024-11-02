import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider");
  const model = searchParams.get("model");

  if (!provider || !model) {
    return NextResponse.json(
      { error: "Provider and model are required" },
      { status: 400 },
    );
  }

  try {
    const currentDate = new Date();
    const modelCost = await prisma.modelCost.findFirst({
      where: {
        provider,
        model,
        OR: [{ validFrom: null }, { validFrom: { lte: currentDate } }],
        OR: [{ validTo: null }, { validTo: { gte: currentDate } }],
      },
      orderBy: { validFrom: "desc" },
    });

    return NextResponse.json(modelCost);
  } catch (error) {
    console.error("Error fetching current cost:", error);
    return NextResponse.json(
      { error: "Error fetching cost data" },
      { status: 500 },
    );
  }
}
