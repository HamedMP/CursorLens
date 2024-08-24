import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("http://localhost:4040/api/tunnels");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const ngrokUrl = data.tunnels[0]?.public_url;

    if (!ngrokUrl) {
      throw new Error("No active ngrok tunnel found");
    }

    return NextResponse.json({ ngrokUrl });
  } catch (error) {
    console.error("Failed to fetch ngrok URL:", error);
    return NextResponse.json(
      { error: "Failed to fetch ngrok URL" },
      { status: 500 },
    );
  }
}
