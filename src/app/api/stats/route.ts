import { NextRequest, NextResponse } from "next/server";
import { getStats } from "@/app/actions";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const timeFilter = searchParams.get("timeFilter") || "all";

  try {
    const stats = await getStats(timeFilter);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error fetching stats" },
      { status: 500 },
    );
  }
}
