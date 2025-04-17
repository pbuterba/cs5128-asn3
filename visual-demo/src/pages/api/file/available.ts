import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

async function gptCall(): Promise<string[]> {
  const mappingFileLocation = "./data/file-name-mappings.json";
  const assistants = JSON.parse(fs.readFileSync(mappingFileLocation, "utf-8"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return assistants.map((assistant: any) => assistant.fileName);
}

export default async function handler(
  req: NextApiRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  res: NextApiResponse<any>
) {
  return new Promise<void>((resolve) => {
    gptCall()
      .then((response) => {
        res.statusCode = 200;
        res.end(JSON.stringify(response));
        resolve();
      })
      .catch((error) => {
        console.log(error);
        res.json(error);
        res.status(405).end();
        resolve();
      });
  });
}
