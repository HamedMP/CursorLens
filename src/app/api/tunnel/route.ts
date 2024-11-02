import { NextResponse } from "next/server";
import { startNgrokTunnel, getActiveTunnels } from "@/lib/ngrok";

export async function POST() {
  try {
    const url = await startNgrokTunnel();
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to start tunnel" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const tunnels = await getActiveTunnels();
    return NextResponse.json({ tunnels });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get tunnels" },
      { status: 500 },
    );
  }
}
