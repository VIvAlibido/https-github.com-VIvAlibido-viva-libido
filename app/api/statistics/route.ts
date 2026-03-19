import { NextResponse } from "next/server";
import { getStatistics } from "@/lib/mux-config-store";

export async function GET() {
  return NextResponse.json(getStatistics());
}
