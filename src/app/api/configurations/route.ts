import { NextRequest, NextResponse } from "next/server";
import {
  getConfigurations,
  createConfiguration,
  updateConfiguration,
  deleteConfiguration,
} from "@/app/actions";

export async function GET() {
  try {
    const configurations = await getConfigurations();
    return NextResponse.json(configurations);
  } catch (error) {
    console.error("Error fetching configurations:", error);
    return NextResponse.json(
      { error: "Error fetching configurations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const configData = await request.json();
    const newConfig = await createConfiguration(configData);
    return NextResponse.json(newConfig);
  } catch (error) {
    console.error("Error creating configuration:", error);
    return NextResponse.json(
      { error: "Error creating configuration" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    const updatedConfig = await updateConfiguration(id, data);
    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { error: "Error updating configuration" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Configuration ID is required" },
      { status: 400 },
    );
  }

  try {
    await deleteConfiguration(id);
    return NextResponse.json({ message: "Configuration deleted successfully" });
  } catch (error) {
    console.error("Error deleting configuration:", error);
    return NextResponse.json(
      { error: "Error deleting configuration" },
      { status: 500 },
    );
  }
}
