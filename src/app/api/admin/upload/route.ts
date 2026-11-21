import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createPresignedUpload } from "@/lib/r2";

const uploadRequestSchema = z.object({
  category: z.enum(["image", "video", "model3d", "document"]),
  contentType: z.string().min(1),
  contentLength: z.number().int().positive(),
  extension: z.string().min(1).max(12),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await createPresignedUpload(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "UPLOAD_FAILED";
    if (
      message === "UNSUPPORTED_MIME_TYPE" ||
      message === "FILE_TOO_LARGE" ||
      message === "INVALID_EXTENSION"
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create presigned upload URL" }, { status: 500 });
  }
}
