import { NextResponse } from "next/server";
import { loadConfig, saveConfig } from "@/lib/mux-config-store";
import { MuxConfig } from "@/lib/types";

export async function GET() {
  const config = loadConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<MuxConfig>;
    const current = loadConfig();
    const updated = { ...current, ...body };
    saveConfig(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid configuration" }, { status: 400 });
  }
}
