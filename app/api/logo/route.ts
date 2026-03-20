import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const LOGO_DIR = path.join(process.cwd(), "data");
const LOGO_META = path.join(LOGO_DIR, "logo-meta.json");

function ensureDir() {
  if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });
}

export async function GET() {
  ensureDir();
  if (fs.existsSync(LOGO_META)) {
    const meta = JSON.parse(fs.readFileSync(LOGO_META, "utf-8"));
    return NextResponse.json(meta);
  }
  return NextResponse.json({ logoUrl: null });
}

export async function POST(request: Request) {
  ensureDir();
  const formData = await request.formData();
  const file = formData.get("logo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() || "png";
  const filename = `logo.${ext}`;
  const filepath = path.join(LOGO_DIR, filename);

  fs.writeFileSync(filepath, buffer);

  const meta = { logoUrl: `/api/logo/image?t=${Date.now()}`, filename };
  fs.writeFileSync(LOGO_META, JSON.stringify(meta));

  return NextResponse.json(meta);
}
