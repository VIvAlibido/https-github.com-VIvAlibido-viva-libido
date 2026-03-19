import { NextResponse } from "next/server";
import { loadConfig } from "@/lib/mux-config-store";
import { generateMuxFile } from "@/lib/mux-file-generator";

export async function GET() {
  const config = loadConfig();
  const content = generateMuxFile(config);
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
