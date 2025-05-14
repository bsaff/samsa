import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

type ResponseData = {
  jobId: string;
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

  const jobId = randomUUID();
  const uploadDir = path.join("scripts/jobs", jobId);

  try {
    fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
      multiples: true,
      keepExtensions: true,
      uploadDir,
      filename: (name, ext, part) => part.originalFilename || `${randomUUID()}${ext}`,
    });

    await form.parse(req);
    res.status(200).json({ jobId });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
}
