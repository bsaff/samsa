import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { spawn } from "child_process";
import { unlinkSync } from "fs";

type ResponseData = {
  message: string;
  fileNames?: string[];
  report?: string;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const form = formidable({ multiples: true, keepExtensions: true });

  try {
    const [, files] = await form.parse(req);
    const paths = files.files?.map((f) => f.filepath) || [];

    console.log(paths);

    // Start book ingestion
    const p = spawn("scripts/python", ["scripts/ingest_books.py", ...paths]);

    let payload = "";
    p.stdout.on("data", (chunk) => {
      payload += chunk.toString();
    });

    p.stderr.on("data", (chunk) => {
      console.debug(chunk.toString());
    });

    await new Promise<void>((resolve, reject) => {
      p.on("close", (code) => {
        // Clean-up tmp files
        Promise.all(paths.map(unlinkSync)).then(() => {
          // Send response
          if (code !== 0) {
            return reject(new Error(`Python exited ${code}`));
          }
          res.status(200).json({ message: "Done", report: JSON.parse(payload) });
          resolve();
        });
      });
    });

    // const fileNames = files.files?.map(f => f.originalFilename || f.newFilename)
    // return res.status(200).json({ message: "Files uploaded successfully", fileNames });
  } catch (err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ message: "Failed to upload file." });
    }
  }
}
