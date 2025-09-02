// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

// We need Node.js runtime for fs access.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const jobId = randomUUID();
  const uploadDir = path.join(process.cwd(), "scripts", "jobs", jobId);

  try {
    await fsp.mkdir(uploadDir, { recursive: true });

    const form = await req.formData();

    const files = form.getAll("files");

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Save each file to disk
    const saves = files.map(async (p) => {
      const file = p as File;

      // Create output file name + path
      const original = file.name || "";
      const ext = path.extname(original);
      const safeBase = path.basename(original, ext) || randomUUID();
      const filename = `${safeBase}${ext || ""}`;
      const filepath = path.join(uploadDir, filename);

      // Stream the web ReadableStream to a Node.js write stream
      const webStream = file.stream() as WebReadableStream<Uint8Array>;
      const nodeStream: Readable = Readable.fromWeb(webStream);
      const writeStream = fs.createWriteStream(filepath);

      await pipeline(nodeStream, writeStream);
    });

    await Promise.all(saves);

    return NextResponse.json({ jobId }, { status: 200 });
  } catch (err) {
    console.error(err);
    return new NextResponse(null, { status: 500 });
  }
}
