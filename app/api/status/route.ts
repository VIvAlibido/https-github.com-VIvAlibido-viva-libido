import { NextResponse } from "next/server";
import { getMuxStatus, startMux, stopMux } from "@/lib/mux-config-store";

export async function GET() {
  return NextResponse.json(getMuxStatus());
}

export async function POST(request: Request) {
  const { action } = await request.json();
  if (action === "start") {
    return NextResponse.json(startMux());
  } else if (action === "stop") {
    return NextResponse.json(stopMux());
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
