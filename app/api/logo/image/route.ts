import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const LOGO_DIR = path.join(process.cwd(), "data");
const LOGO_META = path.join(LOGO_DIR, "logo-meta.json");

export async function GET() {
  if (!fs.existsSync(LOGO_META)) {
    return new NextResponse(null, { status: 404 });
  }

  const meta = JSON.parse(fs.readFileSync(LOGO_META, "utf-8"));
  const filepath = path.join(LOGO_DIR, meta.filename);

  if (!fs.existsSync(filepath)) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = fs.readFileSync(filepath);
  const ext = meta.filename.split(".").pop() || "png";
  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
  };

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeTypes[ext] || "image/png",
      "Cache-Control": "no-cache",
    },
  });
}
