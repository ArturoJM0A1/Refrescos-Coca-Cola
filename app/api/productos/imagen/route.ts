import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set(["image/png"]);

function safeExt(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return ext === ".png" ? ".png" : ".png";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("imagen");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No se recibio ningun archivo." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Solo se permiten imagenes PNG." },
        { status: 400 }
      );
    }

    const maxSizeBytes = 4 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { ok: false, error: "La imagen supera el limite de 4 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = safeExt(file.name);
    const unique = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
    const destination = path.join(uploadsDir, unique);

    await fs.writeFile(destination, buffer);

    return NextResponse.json({ ok: true, imagen: `/uploads/${unique}` }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "No fue posible subir la imagen." },
      { status: 500 }
    );
  }
}
