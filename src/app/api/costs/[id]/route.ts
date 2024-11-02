import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const data = await request.json();
    const cost = await prisma.modelCost.update({
      where: { id: params.id },
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
      { error: "Failed to update cost entry" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.modelCost.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete cost entry" },
      { status: 500 },
    );
  }
}
