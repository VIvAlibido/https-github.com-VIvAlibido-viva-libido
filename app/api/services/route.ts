import { NextResponse } from "next/server";
import { loadConfig, saveConfig } from "@/lib/mux-config-store";
import { Service } from "@/lib/types";

export async function GET() {
  const config = loadConfig();
  return NextResponse.json(config.services);
}

export async function POST(request: Request) {
  const service = (await request.json()) as Service;
  const config = loadConfig();

  if (config.services.find((s) => s.id === service.id)) {
    return NextResponse.json({ error: "Service ID already exists" }, { status: 409 });
  }

  config.services.push(service);
  saveConfig(config);
  return NextResponse.json(service, { status: 201 });
}

export async function PUT(request: Request) {
  const service = (await request.json()) as Service;
  const config = loadConfig();
  const idx = config.services.findIndex((s) => s.id === service.id);

  if (idx === -1) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  config.services[idx] = service;
  saveConfig(config);
  return NextResponse.json(service);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const config = loadConfig();
  config.services = config.services.filter((s) => s.id !== id);
  // Also remove associated components
  config.components = config.components.filter((c) => c.serviceId !== id);
  saveConfig(config);
  return NextResponse.json({ success: true });
}
