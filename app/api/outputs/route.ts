import { NextResponse } from "next/server";
import { loadConfig, saveConfig } from "@/lib/mux-config-store";
import { Output } from "@/lib/types";

export async function GET() {
  const config = loadConfig();
  return NextResponse.json(config.outputs);
}

export async function POST(request: Request) {
  const output = (await request.json()) as Output;
  const config = loadConfig();

  if (config.outputs.find((o) => o.id === output.id)) {
    return NextResponse.json({ error: "Output ID already exists" }, { status: 409 });
  }

  config.outputs.push(output);
  saveConfig(config);
  return NextResponse.json(output, { status: 201 });
}

export async function PUT(request: Request) {
  const output = (await request.json()) as Output;
  const config = loadConfig();
  const idx = config.outputs.findIndex((o) => o.id === output.id);

  if (idx === -1) {
    return NextResponse.json({ error: "Output not found" }, { status: 404 });
  }

  config.outputs[idx] = output;
  saveConfig(config);
  return NextResponse.json(output);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const config = loadConfig();
  config.outputs = config.outputs.filter((o) => o.id !== id);
  saveConfig(config);
  return NextResponse.json({ success: true });
}
