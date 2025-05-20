import type { NextRequest } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return new Response("Bad request", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let aborted = false;
      function send(event: string, data?: string) {
        if (!aborted) {
          let payload = `event: ${event}\n`;
          payload += `data: {"data": ${JSON.stringify(data)} }\n`;
          payload += `\n`;
          controller.enqueue(encoder.encode(payload));
        }
      }

      const dir = path.join("scripts/jobs", jobId);
      fs.promises
        .readdir(dir)
        .then((filenames) => {
          const paths = filenames.map((f) => path.join(dir, f));
          const p = spawn("scripts/python", ["scripts/ingest_books.py", ...paths]);

          req.signal.addEventListener("abort", () => {
            p.kill();
            controller.close();
            aborted = true;
          });

          p.stdout.on("data", (chunk) => {
            send("payload", chunk.toString().trim());
          });

          p.stderr.on("data", (chunk) => {
            const text = chunk.toString();
            if (text.toLowerCase().includes("error")) {
              send("fail");
              console.error(text);
            }
            if (text.toLowerCase().startsWith("info")) {
              send("info", text.replace("INFO:root:", ""));
              console.log(text);
            }
          });

          p.on("close", (code) => {
            if (code) {
              console.error(`Process exited with code ${code}`);
            }
            send("done");
            controller.close();
          });
        })
        .catch((err) => {
          console.error("Failed to read job directory:", err);
          send("fail");
          send("done");
          controller.close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
