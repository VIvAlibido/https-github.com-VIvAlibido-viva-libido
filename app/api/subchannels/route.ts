import { NextResponse } from "next/server";
import { loadConfig, saveConfig } from "@/lib/mux-config-store";
import { Subchannel, Component } from "@/lib/types";

export async function GET() {
  const config = loadConfig();
  return NextResponse.json(config.subchannels);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { subchannel: Subchannel; component?: Component };
  const config = loadConfig();

  if (config.subchannels.find((s) => s.id === body.subchannel.id)) {
    return NextResponse.json({ error: "Subchannel ID already exists" }, { status: 409 });
  }

  config.subchannels.push(body.subchannel);
  if (body.component) {
    config.components.push(body.component);
  }
  saveConfig(config);
  return NextResponse.json(body.subchannel, { status: 201 });
}

export async function PUT(request: Request) {
  const subchannel = (await request.json()) as Subchannel;
  const config = loadConfig();
  const idx = config.subchannels.findIndex((s) => s.id === subchannel.id);

  if (idx === -1) {
    return NextResponse.json({ error: "Subchannel not found" }, { status: 404 });
  }

  config.subchannels[idx] = subchannel;
  saveConfig(config);
  return NextResponse.json(subchannel);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const config = loadConfig();
  config.subchannels = config.subchannels.filter((s) => s.id !== id);
  config.components = config.components.filter((c) => c.subchannelId !== id);
  saveConfig(config);
  return NextResponse.json({ success: true });
}
